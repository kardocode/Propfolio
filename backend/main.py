from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import joblib
import pandas as pd
import os
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import List, Optional, Dict

app = FastAPI(title="Real Estate Price Prediction API")

# Allow CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = "models/best_model.joblib"
model = None

@app.on_event("startup")
def load_model():
    global model
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
        print("Model loaded successfully.")
    else:
        print("Warning: Model file not found. Please train the model first.")

# ==================== Prediction Models ====================
class PropertyDetails(BaseModel):
    State: str = "Maharashtra"
    City: str = "Mumbai"
    Locality: str = "Locality_1"
    Property_Type: str = "Apartment"
    BHK: int = Field(gt=0)
    Size_in_SqFt: float = Field(gt=0)
    Year_Built: int = 2015
    Furnished_Status: str = "Semi-furnished"
    Floor_No: int = 1
    Total_Floors: int = 10
    Age_of_Property: int = 10
    Nearby_Schools: int = 2
    Nearby_Hospitals: int = 1
    Public_Transport_Accessibility: str = "High"
    Parking_Space: str = "Yes"
    Security: str = "Yes"
    Amenities: str = "Gym, Pool, Clubhouse"
    Facing: str = "East"
    Owner_Type: str = "Builder"
    Availability_Status: str = "Ready_to_Move"

class PropertyPredictionRequest(BaseModel):
    """Simplified property prediction for portfolio dashboard"""
    area_sqft: float = Field(gt=0)
    bedrooms: int = 2
    bathrooms: int = 1
    property_type: str = "Apartment"
    location: str = "Mumbai"
    state: str = "Maharashtra"
    city: str = "Mumbai"
    amenities: str = "Gym, Pool"
    purchase_price: float = Field(gt=0)  # in lakhs
    purchase_date: str  # YYYY-MM-DD

class PortfolioSummary(BaseModel):
    """Portfolio summary response"""
    total_investment: float
    total_current_value: float
    total_profit_loss: float
    profit_percentage: float
    property_count: int
    best_performing: Optional[Dict]

# ==================== Root Endpoint ====================
@app.get("/")
def read_root():
    return {
        "message": "Welcome to Estato Real Estate ML System API",
        "version": "2.0",
        "endpoints": {
            "prediction": "/predict",
            "portfolio_prediction": "/predict-portfolio-value",
            "health": "/health"
        }
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "model_loaded": model is not None
    }

# ==================== Original Prediction Endpoint ====================
@app.post("/predict")
def predict_price(details: PropertyDetails):
    """Original prediction endpoint for full property details"""
    if model is None:
        raise HTTPException(status_code=503, detail="Model is not available. Please train it first.")
        
    data_dict = details.dict()
    
    # Feature Engineering mirroring train.py
    data_dict['Area_per_Room'] = data_dict['Size_in_SqFt'] / max(1, data_dict['BHK'])
    
    amenities = data_dict.pop('Amenities', '')
    # Weighted amenity score - premium amenities worth more
    premium_amenities = ['Pool', 'Gym', 'Clubhouse', 'Tennis', 'Security', 'Elevator', 'Parking']
    standard_amenities = ['Garden', 'Playground', 'Park', 'Power Backup', 'Water Supply']
    if amenities:
        amenity_list = [a.strip() for a in amenities.split(',')]
        amenity_score = 0
        for amenity in amenity_list:
            if amenity in premium_amenities:
                amenity_score += 2
            elif amenity in standard_amenities:
                amenity_score += 1
            else:
                amenity_score += 1
        data_dict['Amenity_Score'] = amenity_score
    else:
        data_dict['Amenity_Score'] = 0
    
    data_dict['Property_Age'] = max(0, 2026 - data_dict['Year_Built'])
    
    # New interaction features
    data_dict['BHK_Size_Interaction'] = data_dict['BHK'] * data_dict['Size_in_SqFt']
    data_dict['Rooms_Area_Ratio'] = data_dict['BHK'] / data_dict['Size_in_SqFt'] * 1000
    
    # Convert to DataFrame
    df = pd.DataFrame([data_dict])
    
    try:
        prediction = model.predict(df)[0]
        # Ensure non-negative prediction
        prediction = max(prediction, 0)
        # Return price and calculated price per sqft
        price_per_sqft = prediction / details.Size_in_SqFt
        return {
            "predicted_price_lakhs": round(float(prediction), 2),
            "price_per_sqft_lakhs": round(float(price_per_sqft), 5),
            "confidence_interval": {
                "lower_bound_lakhs": round(float(prediction) * 0.9, 2),
                "upper_bound_lakhs": round(float(prediction) * 1.1, 2)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error during prediction: {str(e)}")

# ==================== Portfolio Prediction Endpoint ====================
@app.post("/predict-portfolio-value")
def predict_portfolio_value(request: PropertyPredictionRequest):
    """
    Predict current property value for portfolio management.
    Uses simplified model with property appreciation calculation.
    """
    try:
        # 1. Prepare data for the ML model
        # We need to map PropertyPredictionRequest to the format the ML model expects
        
        # Calculate amenity score consistently
        premium_amenities = ['Pool', 'Gym', 'Clubhouse', 'Tennis', 'Security', 'Elevator', 'Parking']
        standard_amenities = ['Garden', 'Playground', 'Park', 'Power Backup', 'Water Supply']
        amenity_list = [a.strip() for a in request.amenities.split(',')]
        amenity_score = 0
        for amenity in amenity_list:
            if amenity in premium_amenities: amenity_score += 2
            elif amenity in standard_amenities: amenity_score += 1
            else: amenity_score += 1

        purchase_date = datetime.strptime(request.purchase_date, "%Y-%m-%d")
        current_date = datetime.now()
        property_age = max(0, (current_date - purchase_date).days / 365.25)
        
        # If model is loaded, use it for current market value
        if model is not None:
            # Prepare feature dict matching train.py
            data_dict = {
                'State': request.state,
                'City': request.city,
                'Locality': request.location,
                'Property_Type': request.property_type,
                'BHK': request.bedrooms,
                'Size_in_SqFt': request.area_sqft,
                'Bathrooms': request.bathrooms,
                'Amenity_Score': amenity_score,
                'Year_Built': purchase_date.year,
                'Floor_No': 2, # Default
                'Total_Floors': 5, # Default
                'Nearby_Schools': 2,
                'Nearby_Hospitals': 1,
                'Furnished_Status': 'Semi-furnished',
                'Public_Transport_Accessibility': 'Medium',
                'Parking_Space': 'Yes',
                'Security': 'Yes',
                'Facing': 'East',
                'Owner_Type': 'Owner',
                'Availability_Status': 'Ready_to_Move',
                'area_per_room': request.area_sqft / (request.bedrooms + 1),
                'Property_Age': property_age,
                'bhk_area_interaction': request.bedrooms * request.area_sqft,
                'Rooms_Area_Ratio': request.bedrooms / request.area_sqft * 1000 if request.area_sqft > 0 else 0
            }
            
            df = pd.DataFrame([data_dict])
            current_value = model.predict(df)[0]
        else:
            # Fallback to appreciation-based logic if model not found
            appreciation_rate = 0.08
            city_mult = {"Mumbai": 1.15, "Bangalore": 1.12, "Delhi": 1.10}.get(request.city, 1.0)
            type_mult = {"Apartment": 1.0, "Villa": 1.10, "Plot": 1.12}.get(request.property_type, 1.0)
            base_multiplier = (1 + appreciation_rate) ** property_age
            current_value = request.purchase_price * base_multiplier * city_mult * type_mult
        
        # Calculate metrics
        profit_loss = current_value - request.purchase_price
        profit_percentage = (profit_loss / request.purchase_price * 100) if request.purchase_price > 0 else 0
        price_per_sqft = current_value / request.area_sqft if request.area_sqft > 0 else 0
        
        return {
            "purchase_price_lakhs": request.purchase_price,
            "current_value_lakhs": round(float(current_value), 2),
            "profit_loss_lakhs": round(float(profit_loss), 2),
            "profit_percentage": round(float(profit_percentage), 2),
            "price_per_sqft_lakhs": round(float(price_per_sqft), 4),
            "property_age_years": round(float(property_age), 2)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error predicting property value: {str(e)}")

# ==================== Portfolio Analysis Endpoint ====================
@app.post("/portfolio-analysis")
def analyze_portfolio(properties: List[PropertyPredictionRequest]):
    """Analyze a list of properties for portfolio summary"""
    if not properties:
        return {
            "total_investment": 0,
            "total_current_value": 0,
            "total_profit_loss": 0,
            "profit_percentage": 0,
            "property_count": 0,
            "properties": []
        }
    
    try:
        analyzed_properties = []
        total_investment = 0
        total_current_value = 0
        best_performing = None
        best_profit_percentage = -float('inf')
        
        for prop in properties:
            # Get prediction for each property
            prediction = predict_portfolio_value(prop)
            
            total_investment += prop.purchase_price
            total_current_value += prediction["current_value_lakhs"]
            profit_pct = prediction["profit_percentage"]
            
            if profit_pct > best_profit_percentage:
                best_profit_percentage = profit_pct
                best_performing = {
                    "property_type": prop.property_type,
                    "location": prop.location,
                    "profit_percentage": profit_pct
                }
            
            analyzed_properties.append(prediction)
        
        total_profit_loss = total_current_value - total_investment
        overall_profit_pct = (total_profit_loss / total_investment * 100) if total_investment > 0 else 0
        
        return {
            "total_investment": round(total_investment, 2),
            "total_current_value": round(total_current_value, 2),
            "total_profit_loss": round(total_profit_loss, 2),
            "profit_percentage": round(overall_profit_pct, 2),
            "property_count": len(properties),
            "best_performing": best_performing,
            "properties": analyzed_properties
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error analyzing portfolio: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
