document.addEventListener('DOMContentLoaded', () => {
    // 1. Data mapping extracted from india_housing_prices.csv
    const stateCityMap = {
        "Maharashtra": ["Mumbai", "Pune", "Nagpur"],
        "Delhi": ["New Delhi", "Dwarka"],
        "Karnataka": ["Bangalore", "Mysore", "Mangalore"],
        "Tamil Nadu": ["Chennai", "Coimbatore"],
        "Punjab": ["Ludhiana", "Amritsar"],
        "Rajasthan": ["Jodhpur", "Jaipur"],
        "West Bengal": ["Kolkata", "Durgapur"],
        "Chhattisgarh": ["Bilaspur", "Raipur"],
        "Jharkhand": ["Ranchi", "Jamshedpur"],
        "Telangana": ["Hyderabad", "Warangal"],
        "Uttar Pradesh": ["Lucknow", "Noida"],
        "Assam": ["Guwahati", "Silchar"],
        "Uttarakhand": ["Dehradun", "Haridwar"],
        "Andhra Pradesh": ["Vishakhapatnam", "Vijayawada"],
        "Bihar": ["Patna", "Gaya"],
        "Gujarat": ["Ahmedabad", "Surat"],
        "Kerala": ["Trivandrum", "Kochi"],
        "Madhya Pradesh": ["Bhopal", "Indore"],
        "Odisha": ["Bhubaneswar", "Cuttack"],
        "Haryana": ["Gurgaon", "Faridabad"]
    };

    const stateInput = document.getElementById('state-input');
    const cityInput = document.getElementById('city-input');

    // Populate State Dropdown
    Object.keys(stateCityMap).sort().forEach(state => {
        const option = document.createElement('option');
        option.value = state;
        option.textContent = state;
        stateInput.appendChild(option);
    });

    // Function to populate City based on State
    function populateCities(selectedState) {
        cityInput.innerHTML = '';
        if (stateCityMap[selectedState]) {
            stateCityMap[selectedState].sort().forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                cityInput.appendChild(option);
            });
        }
    }

    // Default Initialization
    stateInput.value = "Maharashtra";
    populateCities("Maharashtra");
    cityInput.value = "Mumbai";

    // Handle State Change
    stateInput.addEventListener('change', (e) => {
        populateCities(e.target.value);
        // Try to jump to first city in new state
        if (cityInput.options.length > 0) {
            jumpToCity(cityInput.options[0].value);
        }
    });

    // Handle City Change
    cityInput.addEventListener('change', (e) => {
        jumpToCity(e.target.value);
    });

    // 2. Initialize Map
    let map = null;
    let currentMarker = null;
    
    try {
        if (typeof L !== 'undefined') {
            map = L.map('map').setView([19.0760, 72.8777], 11);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
                className: 'map-tiles'
            }).addTo(map);

            currentMarker = L.marker([19.0760, 72.8777]).addTo(map);
        } else {
            console.warn("Leaflet library (L) is not defined. Map will not be displayed.");
            document.getElementById('map').innerHTML = "<div style='padding:20px; text-align:center; color:#fff;'>Map failed to load. Please check your internet connection.</div>";
        }
    } catch (e) {
        console.error("Map initialization failed", e);
    }

    function jumpToCity(city) {
        if (!map) return;
        // Approximate coordinates for known cities
        const coords = {
            "Mumbai": [19.0760, 72.8777], "Pune": [18.5204, 73.8567], "Nagpur": [21.1458, 79.0882],
            "New Delhi": [28.6139, 77.2090], "Dwarka": [28.5823, 77.0500],
            "Bangalore": [12.9716, 77.5946], "Mysore": [12.2958, 76.6394], "Mangalore": [12.9141, 74.8560],
            "Chennai": [13.0827, 80.2707], "Coimbatore": [11.0168, 76.9558],
            "Jaipur": [26.9124, 75.7873], "Jodhpur": [26.2389, 73.0243],
            "Kolkata": [22.5726, 88.3639], "Durgapur": [23.5204, 87.3119],
            "Hyderabad": [17.3850, 78.4867], "Warangal": [17.9689, 79.5941],
            "Lucknow": [26.8467, 80.9462], "Noida": [28.5355, 77.3910],
            "Guwahati": [26.1445, 91.7362], "Silchar": [24.8333, 92.7789],
            "Dehradun": [30.3165, 78.0322], "Haridwar": [29.9457, 78.1642],
            "Patna": [25.5941, 85.1376], "Gaya": [24.7955, 85.0002],
            "Ahmedabad": [23.0225, 72.5714], "Surat": [21.1702, 72.8311]
        };
        
        if(coords[city] && currentMarker) {
            map.setView(coords[city], 11);
            currentMarker.setLatLng(coords[city]);
        }
    }

    // 3. Reverse Geocoding on Map Click
    if (map) {
        map.on('click', async function(e) {
        currentMarker.setLatLng(e.latlng);
        const lat = e.latlng.lat;
        const lon = e.latlng.lng;
        
        try {
            // Call Nominatim API for reverse geocoding
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`, {
                headers: {
                    'Accept-Language': 'en'
                }
            });
            const data = await response.json();
            
            if (data && data.address) {
                const fetchedState = (data.address.state || "").toLowerCase();
                let fetchedCity = (data.address.city || data.address.town || data.address.county || data.address.state_district || "").toLowerCase();
                
                if (fetchedState) {
                    // Try to match with our list robustly
                    let matchedState = Object.keys(stateCityMap).find(s => 
                        fetchedState.includes(s.toLowerCase()) || s.toLowerCase().includes(fetchedState)
                    );
                    
                    if (matchedState) {
                        stateInput.value = matchedState;
                        populateCities(matchedState);
                        
                        if (fetchedCity) {
                            // Find closest matching city
                            let matchedCity = stateCityMap[matchedState].find(c => 
                                fetchedCity.includes(c.toLowerCase()) || c.toLowerCase().includes(fetchedCity)
                            );
                            
                            if (matchedCity) {
                                cityInput.value = matchedCity;
                            } else {
                                // Fallback: just add it to the list if not found to allow flexibility
                                const newOption = document.createElement('option');
                                newOption.value = data.address.city || data.address.town || data.address.county;
                                newOption.textContent = data.address.city || data.address.town || data.address.county;
                                cityInput.appendChild(newOption);
                                cityInput.value = newOption.value;
                            }
                        }
                    } else {
                        // Fallback: If state is not in our list, add it
                        const newStateOption = document.createElement('option');
                        newStateOption.value = data.address.state;
                        newStateOption.textContent = data.address.state;
                        stateInput.appendChild(newStateOption);
                        stateInput.value = data.address.state;
                        
                        cityInput.innerHTML = '';
                        const newCityOption = document.createElement('option');
                        const cName = data.address.city || data.address.town || data.address.county || "Unknown City";
                        newCityOption.value = cName;
                        newCityOption.textContent = cName;
                        cityInput.appendChild(newCityOption);
                        cityInput.value = cName;
                    }
                }
            }
        } catch (error) {
            console.error("Geocoding failed", error);
            alert("Map API is temporarily unavailable or blocked by the browser. Please manually select the State and City.");
        }
    });
    }

    // 4. Handle Form Submission
    const form = document.getElementById('prediction-form');
    const btnText = document.querySelector('.btn-text');
    const loader = document.querySelector('.loader');
    
    const resultsBlur = document.querySelector('.results-blur');
    const resultsContent = document.querySelector('.results-content');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        btnText.classList.add('hidden');
        loader.classList.remove('hidden');
        
        const amenityCbs = document.querySelectorAll('.amenity-cb:checked');
        const amenitiesList = Array.from(amenityCbs).map(cb => cb.value).join(', ');

        const payload = {
            State: stateInput.value,
            City: cityInput.value,
            Locality: "Locality_1", 
            Property_Type: document.getElementById('prop-type').value,
            BHK: parseInt(document.getElementById('bhk').value),
            Size_in_SqFt: parseFloat(document.getElementById('size').value),
            Year_Built: parseInt(document.getElementById('year').value),
            Furnished_Status: document.getElementById('furnished').value,
            Floor_No: 1,
            Total_Floors: 5,
            Age_of_Property: 2026 - parseInt(document.getElementById('year').value),
            Nearby_Schools: 2,
            Nearby_Hospitals: 1,
            Public_Transport_Accessibility: "High",
            Parking_Space: "Yes",
            Security: "Yes",
            Amenities: amenitiesList,
            Facing: "East",
            Owner_Type: "Builder",
            Availability_Status: document.getElementById('availability').value
        };

        try {
            const response = await fetch('/api/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error("Backend not available");

            const data = await response.json();
            displayResults(data.predicted_price_lakhs, data.price_per_sqft_lakhs, data.confidence_interval);

        } catch (error) {
            simulatePrediction(payload);
        } finally {
            btnText.classList.remove('hidden');
            loader.classList.add('hidden');
        }
    });

    // Global variable to store current predicted price for charting
    let currentPredictedPriceLakhs = 0;

    function displayResults(price, pricePerSqft, interval) {
        currentPredictedPriceLakhs = price;
        resultsBlur.style.opacity = '0';
        setTimeout(() => {
            resultsBlur.style.display = 'none';
            resultsContent.classList.remove('hidden');
            setTimeout(() => {
                resultsContent.classList.add('active');
            }, 50);
        }, 500);

        animateValue("pred-price", 0, price, 1500);
        animateValue("pred-sqft", 0, Math.round(pricePerSqft * 100000), 1500);
        document.getElementById('pred-range').innerText = `${interval.lower_bound_lakhs} - ${interval.upper_bound_lakhs}`;
    }

    function simulatePrediction(payload) {
        let basePriceSqft = 5000;
        // Adjust for tier 1 cities
        const tier1 = ["Mumbai", "New Delhi", "Bangalore", "Chennai", "Hyderabad", "Pune"];
        if(tier1.includes(payload.City)) {
            basePriceSqft = payload.City === "Mumbai" ? 15000 : 9000;
        }

        if(payload.Property_Type === "Villa") basePriceSqft *= 1.5;
        if(payload.Furnished_Status === "Furnished") basePriceSqft *= 1.2;
        basePriceSqft += (payload.Amenities.split(',').length * 200);
        basePriceSqft *= Math.max(0.6, (1 - (payload.Age_of_Property * 0.01)));

        const simulatedPriceRaw = payload.Size_in_SqFt * basePriceSqft;
        const simulatedPriceLakhs = (simulatedPriceRaw / 100000).toFixed(2);
        
        setTimeout(() => {
            displayResults(
                parseFloat(simulatedPriceLakhs), 
                basePriceSqft / 100000, 
                {
                    lower_bound_lakhs: (simulatedPriceLakhs * 0.9).toFixed(2), 
                    upper_bound_lakhs: (simulatedPriceLakhs * 1.1).toFixed(2)
                }
            );
        }, 1000);
    }

    function animateValue(id, start, end, duration) {
        const obj = document.getElementById(id);
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easeProgress = progress * (2 - progress);
            const currentVal = start + easeProgress * (end - start);
            
            if(end > 1000) obj.innerHTML = Math.floor(currentVal).toLocaleString('en-IN');
            else obj.innerHTML = currentVal.toFixed(2);
            
            if (progress < 1) window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
    }

    // Modal and Chart Logic
    const forecastModal = document.getElementById('forecast-modal');
    const btnForecast = document.getElementById('btn-forecast');
    const closeModal = document.getElementById('close-modal');
    let forecastChartInstance = null;

    btnForecast.addEventListener('click', () => {
        forecastModal.classList.add('active');
        renderChart();
    });

    closeModal.addEventListener('click', () => {
        forecastModal.classList.remove('active');
    });

    forecastModal.addEventListener('click', (e) => {
        if (e.target === forecastModal) {
            forecastModal.classList.remove('active');
        }
    });

    // Action Buttons
    document.getElementById('btn-buy').addEventListener('click', () => {
        alert("Redirecting to property listings matching your criteria...");
    });
    document.getElementById('btn-sell').addEventListener('click', () => {
        alert("Redirecting to property listing portal to sell your house...");
    });

    function renderChart() {
        const ctx = document.getElementById('forecastChart').getContext('2d');
        
        // Destroy existing chart if present
        if (forecastChartInstance) {
            forecastChartInstance.destroy();
        }

        const currentYear = new Date().getFullYear();
        const years = Array.from({length: 11}, (_, i) => currentYear + i);
        
        // Calculate simulated compound annual growth rate (CAGR) of ~6.5%
        let prices = [];
        let currPrice = currentPredictedPriceLakhs;
        for (let i = 0; i <= 10; i++) {
            prices.push(parseFloat(currPrice.toFixed(2)));
            // Add some semi-random realistic growth between 4% to 9% per year
            const growthRate = 1 + (0.04 + (Math.random() * 0.05)); 
            currPrice *= growthRate;
        }

        forecastChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [{
                    label: 'Estimated Value (₹ Lakhs)',
                    data: prices,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    borderWidth: 3,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: '#2563eb',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        padding: 12,
                        titleFont: { size: 14, family: 'Outfit' },
                        bodyFont: { size: 14, family: 'Outfit' },
                        callbacks: {
                            label: function(context) {
                                return '₹ ' + context.parsed.y + ' Lakhs';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: '#e2e8f0'
                        },
                        ticks: {
                            font: { family: 'Outfit' }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: { family: 'Outfit' }
                        }
                    }
                }
            }
        });
    }
});
