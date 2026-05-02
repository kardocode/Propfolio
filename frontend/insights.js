document.addEventListener('DOMContentLoaded', () => {
    const btnAnalyze = document.getElementById('btn-analyze');
    const dashboard = document.getElementById('insights-dashboard');

    btnAnalyze.addEventListener('click', () => {
        const city = document.getElementById('ins-city').value;
        const type = document.getElementById('ins-type').value;
        const bhk = parseInt(document.getElementById('ins-bhk').value);
        const size = parseFloat(document.getElementById('ins-size').value);

        // Simulation Data
        let baseSqft = city === "Mumbai" ? 15000 : (city === "New Delhi" ? 12000 : 9000);
        if (type === "Villa") baseSqft *= 1.5;

        const price = (baseSqft * size) / 100000; // in Lakhs
        const roi = (5 + (Math.random() * 7)).toFixed(1); // 5% to 12%
        const demandLevel = roi > 9 ? "High" : (roi > 6 ? "Moderate" : "Low");

        // Distances
        const distHosp = (0.5 + Math.random() * 3).toFixed(1);
        const distSchool = (0.3 + Math.random() * 2).toFixed(1);
        const distMetro = (0.5 + Math.random() * 5).toFixed(1);
        const distHighway = (1.0 + Math.random() * 8).toFixed(1);

        // Update DOM
        document.getElementById('ins-price').textContent = `₹${price.toFixed(1)} L`;
        document.getElementById('ins-roi').textContent = `${roi}%`;
        document.getElementById('ins-roi').style.color = roi > 8 ? 'var(--success)' : (roi > 6 ? 'yellow' : 'var(--danger)');
        document.getElementById('ins-demand').textContent = demandLevel;

        document.getElementById('dist-hosp').textContent = `${distHosp} km`;
        document.getElementById('dist-school').textContent = `${distSchool} km`;
        document.getElementById('dist-metro').textContent = `${distMetro} km`;
        document.getElementById('dist-highway').textContent = `${distHighway} km`;

        // Generate AI Summary
        const summary = `At ₹${price.toFixed(1)} Lakhs, this ${bhk}-BHK ${type} in ${city} offers a <b>${demandLevel.toLowerCase()}</b> investment profile with an estimated annual ROI of ${roi}%. 
        Its proximity to essential infrastructure, including a school just ${distSchool}km away and a hospital at ${distHosp}km, strengthens its livability score. 
        Given current ${city} market trends, this property represents a ${roi > 7 ? 'strong' : 'moderate'} opportunity for ${roi > 9 ? 'short-term flipping' : 'long-term holding'}.`;
        
        document.getElementById('ai-summary').innerHTML = summary;

        // Show dashboard with animation
        dashboard.style.display = 'block';
        dashboard.style.opacity = '0';
        setTimeout(() => {
            dashboard.style.transition = 'opacity 0.5s ease';
            dashboard.style.opacity = '1';
        }, 50);
    });
});
