import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from xgboost import XGBRegressor

# Premium amenities that add more value
PREMIUM_AMENITIES = ['Pool', 'Gym', 'Clubhouse', 'Tennis', 'Security', 'Elevator', 'Parking']
# Standard amenities
STANDARD_AMENITIES = ['Garden', 'Playground', 'Park', 'Power Backup', 'Water Supply']

DATA_PATH = "../dataset/india_housing_prices.csv"
MODEL_DIR = "models"

if not os.path.exists(MODEL_DIR):
    os.makedirs(MODEL_DIR)

def load_and_preprocess_data(filepath, max_rows=50000):
    print("Loading data...")
    # Load a subset for faster training if data is huge, but let's try to load all if possible
    # We will load a sample to prevent memory issues during prototyping
    try:
        df = pd.read_csv(filepath)
    except FileNotFoundError:
        print(f"Dataset not found at {filepath}")
        return None
    
    if len(df) > max_rows:
        df = df.sample(n=max_rows, random_state=42)

    print(f"Data loaded: {df.shape}")

    # 1. Area per room (User's logic)
    df['area_per_room'] = df['Size_in_SqFt'] / (df['BHK'] + 1)
    
    # 2. Weighted Amenity Score - premium amenities add more value
    def calc_weighted_amenity_score(amenities):
        if pd.isna(amenities):
            return 0
        amenity_list = [a.strip() for a in str(amenities).split(',')]
        score = 0
        for amenity in amenity_list:
            if amenity in PREMIUM_AMENITIES:
                score += 2  # Premium amenities worth 2 points
            elif amenity in STANDARD_AMENITIES:
                score += 1  # Standard amenities worth 1 point
            else:
                score += 1  # Other amenities worth 1 point
        return score
    
    df['Amenity_Score'] = df['Amenities'].apply(calc_weighted_amenity_score)
    
    # 3. Property Age - computed from Year_Built
    df['Property_Age'] = 2026 - df['Year_Built']
    
    # 4. BHK * Size interaction (User's logic)
    df['bhk_area_interaction'] = df['BHK'] * df['Size_in_SqFt']
    
    # 5. Price per room baseline
    df['Rooms_Area_Ratio'] = df['BHK'] / df['Size_in_SqFt'].replace(0, 1) * 1000
    
    # 6. Bathrooms (assuming available in data, if not default to BHK-1)
    if 'Bathrooms' not in df.columns:
        df['Bathrooms'] = np.maximum(1, df['BHK'] - 1)
    
    # 7. Target variable
    y = df['Price_in_Lakhs']
    
    # Drop irrelevant or hard-to-process text columns for now
    # Also drop Age_of_Property to avoid redundancy with Property_Age
    cols_to_drop = ['ID', 'Amenities', 'Price_in_Lakhs', 'Price_per_SqFt', 'Age_of_Property']
    X = df.drop(columns=cols_to_drop)
    
    return X, y

def build_pipeline():
    # Define columns by data type
    categorical_cols = ['State', 'City', 'Locality', 'Property_Type', 'Furnished_Status', 
                        'Public_Transport_Accessibility', 'Parking_Space', 'Security', 
                        'Facing', 'Owner_Type', 'Availability_Status']
    
    numeric_cols = ['BHK', 'Size_in_SqFt', 'Bathrooms', 'Amenity_Score', 
                    'Year_Built', 'Floor_No', 'Total_Floors', 
                    'Nearby_Schools', 'Nearby_Hospitals', 
                    'area_per_room', 'Property_Age',
                    'bhk_area_interaction', 'Rooms_Area_Ratio']
    
    # Preprocessing for numerical data
    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])

    # Preprocessing for categorical data
    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
        # Using TargetEncoder for high cardinality like City and Locality, 
        # but for simplicity and robustness across scikit-learn versions, we use OneHotEncoder with handle_unknown='ignore'
        ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_cols),
            ('cat', categorical_transformer, categorical_cols)
        ])
        
    return preprocessor

def evaluate_model(name, model, X_test, y_test):
    predictions = model.predict(X_test)
    # Ensure predictions are non-negative (housing prices can't be negative)
    predictions = np.maximum(predictions, 0)
    rmse = np.sqrt(mean_squared_error(y_test, predictions))
    mae = mean_absolute_error(y_test, predictions)
    r2 = r2_score(y_test, predictions)
    print(f"--- {name} ---")
    print(f"RMSE: {rmse:.2f}")
    print(f"MAE:  {mae:.2f}")
    print(f"R2:   {r2:.2f}")
    return r2

def main():
    X, y = load_and_preprocess_data(DATA_PATH)
    if X is None:
        return
        
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    preprocessor = build_pipeline()
    
    models = {
        "Linear Regression": Pipeline(steps=[('preprocessor', preprocessor), ('regressor', LinearRegression())]),
        "Random Forest": Pipeline(steps=[('preprocessor', preprocessor), ('regressor', RandomForestRegressor(n_estimators=100, max_depth=15, random_state=42, n_jobs=-1))]),
        "XGBoost": Pipeline(steps=[
            ('preprocessor', preprocessor), 
            ('regressor', XGBRegressor(
                n_estimators=200, 
                learning_rate=0.1, 
                max_depth=6, 
                # Monotone constraints: 1 for BHK, 1 for Size_in_SqFt, 1 for Bathrooms, 1 for Amenity_Score
                # The indices depend on the numeric_cols order and categorical encoding.
                # In modern XGBoost, we can pass a dictionary if features are named, 
                # but with ColumnTransformer it becomes an array.
                # Assuming BHK is index 0, Size is 1, Bathrooms is 2, Amenity_Score is 3
                monotone_constraints=(1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0),
                random_state=42,
                objective='reg:squarederror'
            ))
        ])
    }
    
    best_model = None
    best_r2 = -float('inf')
    best_name = ""
    
    for name, pipeline in models.items():
        print(f"Training {name}...")
        pipeline.fit(X_train, y_train)
        r2 = evaluate_model(name, pipeline, X_test, y_test)
        
        if r2 > best_r2:
            best_r2 = r2
            best_model = pipeline
            best_name = name
            
    print(f"\nBest Model: {best_name} with R2 = {best_r2:.2f}")
    
    # Save the best model
    model_path = os.path.join(MODEL_DIR, "best_model.joblib")
    joblib.dump(best_model, model_path)
    print(f"Model saved to {model_path}")

if __name__ == "__main__":
    main()
