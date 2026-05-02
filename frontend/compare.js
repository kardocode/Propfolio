document.addEventListener('DOMContentLoaded', () => {
    
    let properties = [];
    const MAX_PROPS = 3;

    const btnAdd = document.getElementById('btn-add-prop');
    const propCountSpan = document.getElementById('prop-count');
    const resultsSection = document.getElementById('compare-results');
    const compareGrid = document.getElementById('compare-grid');

    const propertyImages = [
        "property_main.png",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1600607687931-cebf004f5605?auto=format&fit=crop&w=800&q=80"
    ];

    btnAdd.addEventListener('click', () => {
        if (properties.length >= MAX_PROPS) {
            alert("You can only compare up to 3 properties at a time.");
            return;
        }

        const city = document.getElementById('comp-city').value;
        const pincode = document.getElementById('comp-pincode').value || "N/A";
        const type = document.getElementById('comp-type').value;
        const bhk = parseInt(document.getElementById('comp-bhk').value);
        const bath = parseInt(document.getElementById('comp-bath').value);
        const size = parseFloat(document.getElementById('comp-size').value);
        
        const amenityCbs = document.querySelectorAll('.comp-amenity:checked');
        const amenitiesScore = amenityCbs.length;

        // Generate mock metrics for comparison based on the city/type
        let basePriceSqft = 5000;
        const tier1 = ["Mumbai", "New Delhi", "Bangalore", "Chennai", "Hyderabad", "Pune"];
        if(tier1.includes(city)) {
            basePriceSqft = city === "Mumbai" ? 15000 : 9000;
        }

        if(type === "Villa") basePriceSqft *= 1.5;
        basePriceSqft += (amenitiesScore * 200);

        // Add some random variation to make comparisons interesting
        const variation = 1 + ((Math.random() - 0.5) * 0.2); 
        basePriceSqft *= variation;

        const priceLakhs = ((size * basePriceSqft) / 100000).toFixed(2);
        const locationScore = (tier1.includes(city) ? 9.2 : 7.5) * variation;

        const propImage = propertyImages[properties.length % propertyImages.length];

        const propertyId = Date.now();

        const propData = {
            id: propertyId,
            city: city + (pincode !== "N/A" ? ` (${pincode})` : ""),
            type: type,
            bhkBath: `${bhk} Bed / ${bath} Bath`,
            size: size,
            amenitiesScore: `${amenitiesScore}/5`,
            priceLakhs: parseFloat(priceLakhs),
            priceSqft: Math.round(basePriceSqft),
            locScore: locationScore.toFixed(1),
            image: propImage
        };

        properties.push(propData);
        updateUI();
    });

    // Global function so onclick handlers in HTML strings can reach it
    window.removeProperty = function(id) {
        properties = properties.filter(p => p.id !== id);
        updateUI();
    };

    function updateUI() {
        propCountSpan.textContent = properties.length;
        
        if (properties.length === 0) {
            resultsSection.classList.add('hidden');
            return;
        }
        
        resultsSection.classList.remove('hidden');
        renderCards();
    }

    function renderCards() {
        // Clear existing
        compareGrid.innerHTML = '';

        // Find Best Value (Lowest Price per Sqft)
        let bestValueId = null;
        if (properties.length > 1) {
            let lowestSqft = Infinity;
            properties.forEach(p => {
                if (p.priceSqft < lowestSqft) {
                    lowestSqft = p.priceSqft;
                    bestValueId = p.id;
                }
            });
        }

        // Build Cards
        properties.forEach((p) => {
            const isBestValue = p.id === bestValueId;
            const card = document.createElement('div');
            card.className = 'property-card';
            
            card.innerHTML = `
                <div class="property-card-img-container">
                    <img src="${p.image}" alt="${p.type} in ${p.city}" class="property-card-img" onerror="this.src='property_main.png'">
                    ${isBestValue ? '<div class="best-value-badge">★ Best Value</div>' : ''}
                    <button class="remove-prop-btn-card" onclick="removeProperty(${p.id})" title="Remove Property">×</button>
                </div>
                <div class="property-card-content">
                    <h3 class="property-card-title">${p.type}</h3>
                    <p class="property-card-location">${p.city}</p>
                    <div class="property-price">₹ ${p.priceLakhs} <span>Lakhs</span></div>
                    
                    <div class="property-features-list">
                        <div class="feature-row">
                            <span class="feature-name">Bed/Bath</span>
                            <span class="feature-val">${p.bhkBath}</span>
                        </div>
                        <div class="feature-row">
                            <span class="feature-name">Area</span>
                            <span class="feature-val">${p.size} sq.ft</span>
                        </div>
                        <div class="feature-row">
                            <span class="feature-name">Amenities</span>
                            <span class="feature-val">${p.amenitiesScore}</span>
                        </div>
                        <div class="feature-row">
                            <span class="feature-name">Location Score</span>
                            <span class="feature-val">${p.locScore}/10</span>
                        </div>
                        <div class="feature-row ${isBestValue ? 'best-value-highlight' : ''}">
                            <span class="feature-name">Price per Sq.Ft</span>
                            <span class="feature-val">₹ ${p.priceSqft}</span>
                        </div>
                    </div>
                </div>
            `;
            compareGrid.appendChild(card);
        });
    }

});
