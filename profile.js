// Profile Dashboard JavaScript
// Main functionality is embedded in profile.html
// This file serves as a module for future enhancements

class PropertyManager {
    constructor(userId) {
        this.userId = userId;
        this.storageKey = `properties_${userId}`;
    }

    getProperties() {
        return JSON.parse(localStorage.getItem(this.storageKey)) || [];
    }

    saveProperties(properties) {
        localStorage.setItem(this.storageKey, JSON.stringify(properties));
    }

    addProperty(property) {
        const properties = this.getProperties();
        properties.push(property);
        this.saveProperties(properties);
        return property;
    }

    updateProperty(index, property) {
        const properties = this.getProperties();
        if (index >= 0 && index < properties.length) {
            properties[index] = { ...properties[index], ...property };
            this.saveProperties(properties);
            return properties[index];
        }
        return null;
    }

    deleteProperty(index) {
        const properties = this.getProperties();
        if (index >= 0 && index < properties.length) {
            properties.splice(index, 1);
            this.saveProperties(properties);
            return true;
        }
        return false;
    }

    markAsSold(index, sellingPrice, sellingDate) {
        return this.updateProperty(index, {
            sold: true,
            selling_price: sellingPrice,
            selling_date: sellingDate
        });
    }

    getPortfolioSummary() {
        const properties = this.getProperties();
        let totalInvestment = 0;
        let totalValue = 0;
        let soldCount = 0;
        let activeCount = 0;

        properties.forEach(prop => {
            totalInvestment += prop.purchase_price;
            totalValue += prop.current_value;
            if (prop.sold) {
                soldCount++;
            } else {
                activeCount++;
            }
        });

        const totalProfit = totalValue - totalInvestment;
        const profitPercentage = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0;

        return {
            totalInvestment,
            totalValue,
            totalProfit,
            profitPercentage,
            propertyCount: properties.length,
            soldCount,
            activeCount
        };
    }

    filterProperties(filters = {}) {
        let properties = this.getProperties();

        if (filters.type) {
            properties = properties.filter(p => p.type === filters.type);
        }
        if (filters.status === 'sold') {
            properties = properties.filter(p => p.sold);
        } else if (filters.status === 'active') {
            properties = properties.filter(p => !p.sold);
        }

        return properties;
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PropertyManager;
}
