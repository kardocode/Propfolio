document.addEventListener('DOMContentLoaded', () => {
    
    // Map bounds/centers
    const cityData = {
        "Mumbai": { center: [19.0760, 72.8777], baseSqft: 15000 },
        "New Delhi": { center: [28.6139, 77.2090], baseSqft: 12000 },
        "Bangalore": { center: [12.9716, 77.5946], baseSqft: 9000 }
    };

    let map = L.map('heatmap-container').setView(cityData["Mumbai"].center, 11);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    let heatLayer = null;
    let markersLayer = L.featureGroup().addTo(map);

    function generateHeatmap() {
        const cityStr = document.getElementById('hm-city').value;
        const typeStr = document.getElementById('hm-type').value;
        const bhk = parseInt(document.getElementById('hm-bhk').value);

        const data = cityData[cityStr];
        map.setView(data.center, 11);

        if (heatLayer) map.removeLayer(heatLayer);
        markersLayer.clearLayers();

        let points = [];
        let baseSqft = data.baseSqft;
        if(typeStr === 'Villa') baseSqft *= 1.5;

        // Generate 500 mock data points around the city center using a gaussian-like distribution
        for (let i = 0; i < 500; i++) {
            // Random offset (-0.15 to 0.15 degrees)
            const latOffset = (Math.random() - 0.5) * 0.3;
            const lngOffset = (Math.random() - 0.5) * 0.3;
            
            const lat = data.center[0] + latOffset;
            const lng = data.center[1] + lngOffset;

            // Price goes down as you move further from center
            const distFromCenter = Math.sqrt(latOffset*latOffset + lngOffset*lngOffset);
            // distance factor: 0 at center, up to 1 at edges
            const distFactor = Math.min(distFromCenter / 0.2, 1);
            
            let priceSqft = baseSqft * (1 - (distFactor * 0.5)); 
            // Add noise
            priceSqft *= (0.8 + (Math.random() * 0.4));
            
            // Normalize for heat intensity (0.0 to 1.0)
            const intensity = (priceSqft - (baseSqft * 0.4)) / (baseSqft * 1.5);
            
            points.push([lat, lng, Math.max(0.1, Math.min(intensity, 1.0))]);

            // Add invisible clickable markers for interaction
            const marker = L.circleMarker([lat, lng], { radius: 10, opacity: 0, fillOpacity: 0 });
            marker.bindPopup(`
                <div style="color: #333; font-family: Outfit;">
                    <h4 style="margin:0 0 5px 0;">Locality Insight</h4>
                    <p style="margin:0;">Est. Price/SqFt: <b>₹${Math.round(priceSqft)}</b></p>
                    <p style="margin:0;">Type: ${bhk} BHK ${typeStr}</p>
                </div>
            `);
            markersLayer.addLayer(marker);
        }

        // Add heat layer
        heatLayer = L.heatLayer(points, {
            radius: 25,
            blur: 15,
            maxZoom: 12,
            gradient: { 0.2: 'green', 0.5: 'yellow', 1.0: 'red' }
        }).addTo(map);
    }

    document.getElementById('btn-update-map').addEventListener('click', generateHeatmap);
    
    // Initial generation
    generateHeatmap();
});
