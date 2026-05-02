document.addEventListener('DOMContentLoaded', () => {

    const citySelect = document.getElementById('trend-city');
    const typeSelect = document.getElementById('trend-type');
    const timeSelect = document.getElementById('trend-time');
    const growthBadge = document.getElementById('growth-badge');

    let lineChart = null;
    let barChart = null;

    Chart.defaults.color = '#a1a1aa';
    Chart.defaults.font.family = 'Outfit';

    function updateCharts() {
        const city = citySelect.value;
        const type = typeSelect.value;
        const years = parseInt(timeSelect.value);

        // Simulated Data logic
        let baseSqft = city === "Mumbai" ? 15000 : (city === "New Delhi" ? 12000 : 9000);
        if (type === "Villa") baseSqft *= 1.5;

        // Line Chart Data
        const currentYear = new Date().getFullYear();
        const labels = Array.from({length: years + 1}, (_, i) => currentYear - years + i);
        
        let priceData = [];
        let currPrice = baseSqft * Math.pow(0.92, years); // Start in past
        
        for (let i = 0; i <= years; i++) {
            priceData.push(Math.round(currPrice));
            const growth = 1 + (0.05 + (Math.random() * 0.05));
            currPrice *= growth;
        }

        // Calculate growth %
        const startPrice = priceData[0];
        const endPrice = priceData[priceData.length - 1];
        const pctGrowth = (((endPrice - startPrice) / startPrice) * 100).toFixed(1);
        
        if (pctGrowth >= 0) {
            growthBadge.textContent = `+${pctGrowth}%`;
            growthBadge.style.background = 'rgba(16, 185, 129, 0.1)';
            growthBadge.style.color = '#10b981';
        } else {
            growthBadge.textContent = `${pctGrowth}%`;
            growthBadge.style.background = 'rgba(239, 68, 68, 0.1)';
            growthBadge.style.color = '#ef4444';
        }

        if (lineChart) lineChart.destroy();
        const ctxLine = document.getElementById('lineChart').getContext('2d');
        lineChart = new Chart(ctxLine, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Avg Price/SqFt (₹)',
                    data: priceData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { grid: { color: '#222222' } },
                    x: { grid: { display: false } }
                }
            }
        });

        // Bar Chart Data (Areas within City)
        const areaLabels = city === "Mumbai" ? ["Andheri", "Bandra", "Borivali", "Juhu"] : 
                           (city === "New Delhi" ? ["Dwarka", "Rohini", "Vasant Kunj", "Saket"] : 
                           ["Whitefield", "Indiranagar", "Koramangala", "HSR Layout"]);
        
        const barData = areaLabels.map((_, i) => baseSqft * (0.8 + (Math.random() * 0.6)));

        if (barChart) barChart.destroy();
        const ctxBar = document.getElementById('barChart').getContext('2d');
        barChart = new Chart(ctxBar, {
            type: 'bar',
            data: {
                labels: areaLabels,
                datasets: [{
                    label: 'Avg Price/SqFt (₹)',
                    data: barData,
                    backgroundColor: '#3b82f6',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { grid: { color: '#222222' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    [citySelect, typeSelect, timeSelect].forEach(el => {
        el.addEventListener('change', updateCharts);
    });

    updateCharts();
});
