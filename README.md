# Estato - Real Estate Investment Portfolio Dashboard

A comprehensive web application for predicting real estate prices and managing property investments with AI-powered insights.

## 🎯 Recent Improvements

### ✨ Enhanced Navigation
- **Hide-on-Scroll Navbar**: Navbar automatically disappears when scrolling down and reappears when scrolling up for better UX
- **Aligned Navigation**: All navigation items aligned to the right with smooth transitions
- **No Borders**: Clean, minimal design with removed border lines
- **Updated Links**: Added Profile link to navbar (Home, Compare, Heatmap, Trends, Insights, Profile)

### 🔐 Authentication System
- **OTP Verification via Email**: Secure authentication using One-Time Password
- **User Profile Icon**: After login, displays user initial in a profile avatar
- **Persistent Sessions**: User session maintained using localStorage
- **Quick Sign In/Out**: Simple authentication flow with logout functionality

### 📊 Portfolio Dashboard
A complete property investment management system with:

#### Property Management
- **Add Properties**: Add unlimited properties with detailed information
- **Edit Properties**: Update property details at any time
- **Delete Properties**: Remove properties from portfolio
- **Mark as Sold**: Track selling price and final profit

#### Property Inputs
- `property_name` (optional)
- `area_sqft` (required)
- `bedrooms`, `bathrooms`
- `property_type` (Apartment, Independent House, Villa, Plot)
- `location` (address/pincode)
- `state`, `city`
- `amenities` (comma-separated)
- `purchase_price` (in Lakhs)
- `purchase_date` (YYYY-MM-DD)

#### Property Display
- **Card View**: Beautiful property cards showing key metrics
- **Table View**: Tabular layout for efficient browsing
- **Price Comparison**: Purchase price vs current value side-by-side
- **Profit/Loss Indicator**: Color-coded (green for profit, red for loss)
- **Profit Percentage**: Calculate appreciation percentage

#### Portfolio Summary
- **Total Investment**: Sum of all purchase prices
- **Total Current Value**: ML-predicted current market value
- **Total Profit/Loss**: Overall portfolio performance
- **Best Performing Property**: Property with highest profit percentage

#### Filters & Search
- **Filter by Property Type**: View specific property types
- **Filter by Status**: Show active or sold properties
- **Dynamic Calculation**: All metrics update in real-time

### 📈 Analytics & Insights Dashboard
Interactive visualizations and analytics for portfolio analysis:

#### Charts Included
1. **Property Value Over Time (Line Chart)**
   - Track appreciation from purchase to current value
   - Compare purchase price vs predicted current value
   - Visual trend of investment growth

2. **Profit/Loss Comparison (Bar Chart)**
   - See profit/loss for each property
   - Color-coded: Green for profit, Red for loss
   - Hover tooltips with exact values

3. **Portfolio Distribution (Pie Chart)**
   - View investment spread by property type
   - See percentage share of each category
   - Understand diversification

4. **Price by Location (Bar Chart)**
   - Compare price per sq.ft across cities
   - Geographic market analysis
   - Location-based performance

#### Analytics Features
- **Smart Filtering**:
  - Filter by property type (Apartment, House, Villa, Plot)
  - Time range filtering (6 months, 1 year, all time)
  - Location filtering by city
  - Reset filters button

- **Key Insights Cards**:
  - Total properties count
  - Total investment amount
  - Current portfolio value
  - Total profit/loss with percentage
  - Best performing property
  - Most valuable location

- **Real-time Updates**: Charts update instantly when filters change
- **Responsive Design**: Works perfectly on all devices
- **Hover Tooltips**: Detailed information on hovering charts
- **Color Coding**: Green for positive metrics, red for negative

#### Navigation Update
- Added "Analytics" link to navbar
- Access analytics from any page
- One-click analysis of your portfolio

### 🤖 AI-Powered Valuation

#### ML Prediction Algorithm
The system uses an intelligent appreciation model that calculates current property value based on:

1. **Time-based Appreciation**: 8% annual appreciation rate
2. **City Multipliers**: Different cities have different appreciation rates
   - Mumbai: 1.15x
   - Bangalore: 1.12x
   - Delhi: 1.10x
   - Hyderabad: 1.08x
   - And more...

3. **Property Type Factors**: Different types appreciate differently
   - Apartment: 1.0x (base)
   - Independent House: 1.05x
   - Villa: 1.10x
   - Plot: 1.12x

#### Formula
```
Current Value = Purchase Price × (1.08 ^ Years Held) × City Multiplier × Property Type Multiplier
```

### 💰 Financial Calculations
Each property shows:
- **Purchase Price**: Original buying price
- **Current Value**: ML-predicted current market value
- **Profit/Loss**: Absolute profit or loss amount
- **Profit %**: Percentage gain/loss
- **Price Per Sq.Ft**: Current price per square foot

### 🎨 UI/UX Improvements
- **Clean Card-based Layout**: Property cards with gradient headers
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Color-coded Metrics**: Green for profit, red for loss, blue for neutral
- **Summary Dashboard**: Key metrics prominently displayed
- **Modal Forms**: Elegant add/edit property forms
- **Empty States**: User-friendly messages when no properties exist

## 📁 Project Structure

```
frontend/
├── index.html           # Home page with hero section
├── profile.html         # Portfolio dashboard
├── compare.html         # Property comparison
├── heatmap.html         # Price heatmap visualization
├── trends.html          # Market trends analysis
├── insights.html        # Property insights
├── style.css            # Global styles
├── app.js               # Home page scripts
├── profile.js           # Profile dashboard module
├── compare.js           # Comparison scripts
├── heatmap.js           # Heatmap visualization
├── trends.js            # Trends analysis
└── insights.js          # Insights scripts

backend/
├── main.py              # FastAPI application
├── train.py             # ML model training
├── requirements.txt     # Python dependencies
└── cities.json          # City data

dataset/
└── *.csv                # Training data files
```

## 🚀 Features Overview

### For Price Prediction
1. **Interactive Map**: Pin locations on Leaflet map
2. **Property Details Form**: Comprehensive property information
3. **Real-time Calculation**: Instant price predictions
4. **Confidence Intervals**: Prediction bounds for accuracy

### For Portfolio Management
1. **Dashboard**: Real-time portfolio summary
2. **Property Management**: Full CRUD operations
3. **Valuation Tracking**: Monitor property appreciation
4. **Selling History**: Track sold properties and final profits
5. **Performance Analysis**: Identify best-performing investments

## 🔌 API Endpoints

### Prediction Endpoints

#### 1. Original Prediction (Full Details)
```
POST /predict
Request:
{
    "State": "Maharashtra",
    "City": "Mumbai",
    "Property_Type": "Apartment",
    "BHK": 2,
    "Size_in_SqFt": 1200,
    ...
}
Response:
{
    "predicted_price_lakhs": 50.5,
    "price_per_sqft_lakhs": 0.0421,
    "confidence_interval": {...}
}
```

#### 2. Portfolio Property Valuation
```
POST /predict-portfolio-value
Request:
{
    "area_sqft": 1200,
    "bedrooms": 2,
    "property_type": "Apartment",
    "location": "Mumbai",
    "purchase_price": 50,
    "purchase_date": "2020-01-15"
}
Response:
{
    "purchase_price_lakhs": 50,
    "current_value_lakhs": 62.5,
    "profit_loss_lakhs": 12.5,
    "profit_percentage": 25.0,
    "price_per_sqft_lakhs": 0.052
}
```

#### 3. Portfolio Analysis
```
POST /portfolio-analysis
Request: [array of properties]
Response:
{
    "total_investment": 200,
    "total_current_value": 275,
    "total_profit_loss": 75,
    "profit_percentage": 37.5,
    "best_performing": {...}
}
```

## 🛠 Installation & Setup

### Frontend
No build process needed - all static files:
1. Open `frontend/index.html` in a browser
2. Or serve with: `python -m http.server 3000`

### Backend
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Train the model (if not already trained)
python train.py

# Run the API server
python main.py
```

The API will be available at: `http://localhost:8000`

## 📊 Data Storage

### Frontend (Client-side)
- **User Sessions**: Stored in `localStorage` as `currentUser`
- **User Properties**: Stored in `localStorage` as `properties_[userId]`
- **Format**: JSON serialization

### Backend (Server-side)
- **ML Model**: Trained model stored in `models/best_model.joblib`
- **Training Data**: CSV files in `dataset/` directory

## 🎓 How Property Valuation Works

1. **User adds property** with purchase date and price
2. **System calculates** how many years the property has been held
3. **AI model applies** appreciation factors based on:
   - Time held (8% annual)
   - City location (multiplier)
   - Property type (multiplier)
4. **Current value** is calculated and displayed
5. **Profit/Loss** is automatically computed
6. **Portfolio metrics** update in real-time

## 🔒 Authentication

The system uses a simple but secure OTP-based authentication:
1. User enters email
2. System displays OTP input form (currently simulated)
3. After verification, user profile icon appears
4. Session persists until logout

For production, integrate with an email service (SendGrid, AWS SES, etc.)

## 📱 Responsive Design

All pages are fully responsive:
- **Desktop**: Full-featured layout with all panels visible
- **Tablet**: Optimized 2-column layouts
- **Mobile**: Single-column stacked layouts

## 🎨 Design System

### Colors
- **Primary**: #3b82f6 (Blue)
- **Success**: #10b981 (Green) - for positive metrics
- **Danger**: #ef4444 (Red) - for negative metrics
- **Background**: #050505 (Near Black)
- **Cards**: #111111 (Dark Gray)

### Typography
- **Font**: 'Outfit' (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700, 800

## 🚀 Future Enhancements

1. **Email Integration**: Real OTP sending via email
2. **Backend Storage**: Switch from localStorage to database
3. **Advanced ML**: Train custom model with more data
4. **Historical Tracking**: Store price history and trends
5. **Export Reports**: Generate PDF portfolio reports
6. **Notifications**: Alert users about market opportunities
7. **Social Features**: Share investment tips with community
8. **Mobile App**: Native iOS/Android apps
9. **Advanced Analytics**: Detailed profit/loss analysis
10. **Integration**: Link with real banking APIs

## 📝 License

MIT License - Feel free to use and modify

## 👨‍💼 Support

For issues or questions, please open an issue on GitHub or contact support@estato.ai

---

**Estato** - Making real estate investment decisions smarter with AI 🏠💡
#   P r o p f o l i o  
 #   P r o p f o l i o  
 #   P r o p f o l i o  
 #   P r o p f o l i o  
 #   P r o p f o l i o  
 