/**
 * Frontend Integration Examples for Crime Data API
 * PennApps Navigation Project
 * 
 * These examples show exactly how to integrate the crime data API
 * with your navigation frontend for maximum effectiveness.
 */

// ============================================================================
// 1. MAP VISUALIZATION - Load and display crime data on maps
// ============================================================================

class CrimeMapManager {
    constructor(apiBaseUrl = 'http://localhost:5001') {
        this.apiBase = apiBaseUrl;
        this.map = null; // Your map instance (Google Maps, Mapbox, etc.)
        this.crimeMarkers = [];
    }

    /**
     * Load recent crimes and display on map
     */
    async loadCrimesOnMap(daysBack = 7, limit = 2000) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - daysBack);
            
            const response = await fetch(
                `${this.apiBase}/api/crimes/all?limit=${limit}&start_date=${startDate.toISOString().split('T')[0]}`
            );
            
            const data = await response.json();
            
            // Clear existing markers
            this.clearCrimeMarkers();
            
            // Add crime markers to map
            data.crimes.forEach(crime => {
                const marker = this.createCrimeMarker(crime);
                this.crimeMarkers.push(marker);
            });
            
            console.log(`Loaded ${data.total_crimes} crimes on map`);
            return data.summary;
            
        } catch (error) {
            console.error('Error loading crimes on map:', error);
            return null;
        }
    }

    /**
     * Create a marker for a crime incident
     */
    createCrimeMarker(crime) {
        const colors = {
            'high': '#FF0000',    // Red
            'medium': '#FFA500',  // Orange  
            'low': '#FFFF00'      // Yellow
        };

        const icons = {
            'violent': '🔴',
            'property': '🟡',
            'drug': '🟣',
            'other': '⚪'
        };

        // Create marker (example for Google Maps)
        const marker = new google.maps.Marker({
            position: { lat: crime.latitude, lng: crime.longitude },
            map: this.map,
            title: `${crime.crime_type} - ${crime.address}`,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: colors[crime.severity],
                fillOpacity: 0.7,
                strokeWeight: 2,
                strokeColor: '#000000',
                scale: 8
            }
        });

        // Add info window
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="max-width: 200px;">
                    <h4>${icons[crime.crime_category]} ${crime.crime_type}</h4>
                    <p><strong>Address:</strong> ${crime.address}</p>
                    <p><strong>Time:</strong> ${new Date(crime.datetime).toLocaleString()}</p>
                    <p><strong>Severity:</strong> <span style="color: ${colors[crime.severity]}">${crime.severity.toUpperCase()}</span></p>
                    <p><strong>District:</strong> ${crime.district}</p>
                </div>
            `
        });

        marker.addListener('click', () => {
            infoWindow.open(this.map, marker);
        });

        return marker;
    }

    /**
     * Clear all crime markers from map
     */
    clearCrimeMarkers() {
        this.crimeMarkers.forEach(marker => marker.setMap(null));
        this.crimeMarkers = [];
    }

    /**
     * Filter crimes by severity
     */
    async filterCrimesBySeverity(severity) {
        const response = await fetch(`${this.apiBase}/api/crimes/recent?severity=${severity}&hours=168`);
        const data = await response.json();
        
        this.clearCrimeMarkers();
        
        data.crimes.forEach(crime => {
            const marker = this.createCrimeMarker(crime);
            this.crimeMarkers.push(marker);
        });
        
        return data.crimes.length;
    }
}

// ============================================================================
// 2. REAL-TIME NAVIGATION ALERTS - Integration with navigation system
// ============================================================================

class NavigationSafetyManager {
    constructor(apiBaseUrl = 'http://localhost:5001') {
        this.apiBase = apiBaseUrl;
        this.alertCallbacks = [];
        this.isMonitoring = false;
    }

    /**
     * Check route safety before navigation starts
     */
    async checkRouteSafety(waypoints, showAlternatives = true) {
        try {
            const response = await fetch(`${this.apiBase}/api/crime/route-safety`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    waypoints: waypoints,
                    buffer_meters: 500,
                    time_window_hours: 24
                })
            });

            const safetyData = await response.json();
            const riskScore = safetyData.route_analysis.overall_risk_score;

            // Generate user-friendly alert
            if (riskScore > 0.8) {
                return {
                    safe: false,
                    alert: {
                        type: 'danger',
                        title: 'High Crime Risk Detected',
                        message: `Route passes through high-crime areas (${Math.round(riskScore * 100)}% risk). Alternative route strongly recommended.`,
                        confidence: riskScore,
                        showAlternative: showAlternatives,
                        crimeCount: safetyData.route_analysis.total_incidents
                    }
                };
            } else if (riskScore > 0.6) {
                return {
                    safe: false,
                    alert: {
                        type: 'warning',
                        title: 'Moderate Crime Risk',
                        message: `Some criminal activity detected along route (${Math.round(riskScore * 100)}% risk). Consider alternative if available.`,
                        confidence: riskScore,
                        showAlternative: showAlternatives,
                        crimeCount: safetyData.route_analysis.total_incidents
                    }
                };
            } else {
                return {
                    safe: true,
                    alert: {
                        type: 'success',
                        title: 'Route Appears Safe',
                        message: `Low crime activity detected (${Math.round(riskScore * 100)}% risk). Safe to proceed.`,
                        confidence: 1 - riskScore
                    }
                };
            }

        } catch (error) {
            console.error('Error checking route safety:', error);
            return { safe: true, error: 'Unable to assess route safety' };
        }
    }

    /**
     * Start real-time monitoring during navigation
     */
    startRealTimeMonitoring(currentLocationCallback) {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        
        // Check for breaking news every 2 minutes
        this.monitoringInterval = setInterval(async () => {
            try {
                const response = await fetch(`${this.apiBase}/api/crimes/recent?live=true`);
                const data = await response.json();
                
                if (data.breaking_news_count > 0) {
                    this.triggerAlert({
                        type: 'breaking',
                        title: 'Breaking: Crime Alert',
                        message: `${data.breaking_news_count} crimes reported in your area in the last hour`,
                        severity: 'high',
                        crimes: data.crimes.filter(c => c.is_breaking)
                    });
                }
                
                // Check for high-severity crimes near current location
                if (currentLocationCallback) {
                    const currentPos = currentLocationCallback();
                    if (currentPos) {
                        await this.checkNearbyThreats(currentPos.lat, currentPos.lng);
                    }
                }
                
            } catch (error) {
                console.error('Real-time monitoring error:', error);
            }
        }, 120000); // 2 minutes
    }

    /**
     * Stop real-time monitoring
     */
    stopRealTimeMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.isMonitoring = false;
        }
    }

    /**
     * Check for nearby threats at current location
     */
    async checkNearbyThreats(lat, lng, radius = 500) {
        try {
            const response = await fetch(
                `${this.apiBase}/api/crime/nearby?lat=${lat}&lng=${lng}&radius=${radius}&hours=6&severity=high`
            );
            
            const data = await response.json();
            
            if (data.total_incidents > 0 && data.risk_score > 0.7) {
                this.triggerAlert({
                    type: 'proximity',
                    title: 'High-Risk Area Detected',
                    message: `${data.total_incidents} recent high-severity crimes within ${radius}m of your location`,
                    severity: 'high',
                    riskScore: data.risk_score,
                    crimes: data.incidents
                });
            }
            
        } catch (error) {
            console.error('Error checking nearby threats:', error);
        }
    }

    /**
     * Add alert callback
     */
    onAlert(callback) {
        this.alertCallbacks.push(callback);
    }

    /**
     * Trigger alert to all listeners
     */
    triggerAlert(alert) {
        this.alertCallbacks.forEach(callback => {
            try {
                callback(alert);
            } catch (error) {
                console.error('Alert callback error:', error);
            }
        });
    }
}

// ============================================================================
// 3. CRIME ANALYTICS DASHBOARD - Data visualization and insights
// ============================================================================

class CrimeAnalyticsDashboard {
    constructor(apiBaseUrl = 'http://localhost:5001') {
        this.apiBase = apiBaseUrl;
        this.charts = {};
    }

    /**
     * Initialize complete dashboard
     */
    async initializeDashboard(containerId) {
        const container = document.getElementById(containerId);
        
        // Create dashboard HTML structure
        container.innerHTML = `
            <div class="crime-dashboard">
                <div class="dashboard-header">
                    <h2>Philadelphia Crime Analytics</h2>
                    <div class="dashboard-controls">
                        <select id="time-range">
                            <option value="7">Last 7 days</option>
                            <option value="30">Last 30 days</option>
                            <option value="90">Last 90 days</option>
                        </select>
                        <button id="export-data">Export CSV</button>
                    </div>
                </div>
                
                <div class="dashboard-metrics">
                    <div class="metric-card">
                        <h3 id="total-crimes">-</h3>
                        <p>Total Crimes</p>
                    </div>
                    <div class="metric-card">
                        <h3 id="high-severity">-</h3>
                        <p>High Severity</p>
                    </div>
                    <div class="metric-card">
                        <h3 id="most-active-district">-</h3>
                        <p>Most Active District</p>
                    </div>
                    <div class="metric-card">
                        <h3 id="crime-rate-trend">-</h3>
                        <p>Daily Average</p>
                    </div>
                </div>
                
                <div class="dashboard-charts">
                    <div class="chart-container">
                        <canvas id="crime-types-chart"></canvas>
                    </div>
                    <div class="chart-container">
                        <canvas id="severity-chart"></canvas>
                    </div>
                    <div class="chart-container">
                        <canvas id="hourly-pattern-chart"></canvas>
                    </div>
                    <div class="chart-container">
                        <canvas id="district-chart"></canvas>
                    </div>
                </div>
                
                <div class="recent-alerts">
                    <h3>Recent High-Severity Incidents</h3>
                    <div id="recent-incidents-list"></div>
                </div>
            </div>
        `;

        // Load initial data
        await this.loadDashboardData(7);
        
        // Setup event listeners
        this.setupEventListeners();
    }

    /**
     * Load and display dashboard data
     */
    async loadDashboardData(days) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            
            // Get comprehensive crime data
            const response = await fetch(
                `${this.apiBase}/api/crimes/all?limit=10000&start_date=${startDate.toISOString().split('T')[0]}`
            );
            
            const data = await response.json();
            
            // Update metrics
            this.updateMetrics(data, days);
            
            // Update charts
            this.updateCharts(data);
            
            // Get recent high-severity incidents
            await this.loadRecentIncidents();
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    /**
     * Update dashboard metrics
     */
    updateMetrics(data, days) {
        const summary = data.summary;
        
        document.getElementById('total-crimes').textContent = data.total_crimes.toLocaleString();
        document.getElementById('high-severity').textContent = summary.severity_breakdown.high;
        
        // Most active district
        const districts = Object.entries(summary.districts);
        const mostActive = districts.length > 0 ? districts[0][0] : 'N/A';
        document.getElementById('most-active-district').textContent = mostActive;
        
        // Daily average
        const dailyAverage = Math.round(data.total_crimes / days);
        document.getElementById('crime-rate-trend').textContent = dailyAverage;
    }

    /**
     * Update all charts
     */
    updateCharts(data) {
        const summary = data.summary;
        
        // Crime types pie chart
        this.createPieChart('crime-types-chart', summary.crime_types, 'Crime Types');
        
        // Severity bar chart
        this.createBarChart('severity-chart', summary.severity_breakdown, 'Crime Severity');
        
        // District chart
        const topDistricts = Object.entries(summary.districts).slice(0, 10);
        this.createBarChart('district-chart', Object.fromEntries(topDistricts), 'Top Districts');
    }

    /**
     * Create pie chart
     */
    createPieChart(canvasId, data, title) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }
        
        this.charts[canvasId] = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(data).slice(0, 8), // Top 8
                datasets: [{
                    data: Object.values(data).slice(0, 8),
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                        '#9966FF', '#FF9F40', '#C9CBCF', '#4BC0C0'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: { display: true, text: title }
                }
            }
        });
    }

    /**
     * Create bar chart
     */
    createBarChart(canvasId, data, title) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }
        
        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(data),
                datasets: [{
                    label: 'Count',
                    data: Object.values(data),
                    backgroundColor: '#36A2EB'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: { display: true, text: title }
                }
            }
        });
    }

    /**
     * Load recent high-severity incidents
     */
    async loadRecentIncidents() {
        try {
            const response = await fetch(`${this.apiBase}/api/crimes/recent?severity=high&hours=48&limit=10`);
            const data = await response.json();
            
            const container = document.getElementById('recent-incidents-list');
            
            if (data.crimes.length === 0) {
                container.innerHTML = '<p>No recent high-severity incidents</p>';
                return;
            }
            
            container.innerHTML = data.crimes.map(crime => `
                <div class="incident-item">
                    <div class="incident-type">${crime.crime_type}</div>
                    <div class="incident-details">
                        <span class="incident-address">${crime.address}</span>
                        <span class="incident-time">${crime.minutes_ago} minutes ago</span>
                    </div>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('Error loading recent incidents:', error);
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Time range selector
        document.getElementById('time-range').addEventListener('change', (e) => {
            this.loadDashboardData(parseInt(e.target.value));
        });
        
        // Export button
        document.getElementById('export-data').addEventListener('click', () => {
            this.exportData();
        });
    }

    /**
     * Export data to CSV
     */
    async exportData() {
        const days = document.getElementById('time-range').value;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        const csvUrl = `${this.apiBase}/api/crimes/all?format=csv&start_date=${startDate.toISOString().split('T')[0]}`;
        
        const link = document.createElement('a');
        link.href = csvUrl;
        link.download = `philadelphia_crimes_${days}days.csv`;
        link.click();
    }
}

// ============================================================================
// 4. USAGE EXAMPLES - How to use these classes in your app
// ============================================================================

// Example: Initialize crime map
const crimeMap = new CrimeMapManager();
// crimeMap.loadCrimesOnMap(7, 1000); // Load last 7 days, max 1000 crimes

// Example: Setup navigation safety
const navSafety = new NavigationSafetyManager();
navSafety.onAlert((alert) => {
    // Show alert in your UI
    showNavigationAlert(alert);
});

// Check route before navigation
// const routeCheck = await navSafety.checkRouteSafety([
//     {lat: 39.9526, lng: -75.1652},
//     {lat: 39.9496, lng: -75.1503}
// ]);

// Example: Initialize analytics dashboard
const dashboard = new CrimeAnalyticsDashboard();
// dashboard.initializeDashboard('dashboard-container');

// ============================================================================
// 5. UTILITY FUNCTIONS
// ============================================================================

/**
 * Show navigation alert in UI
 */
function showNavigationAlert(alert) {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${alert.type}`;
    alertDiv.innerHTML = `
        <div class="alert-content">
            <h4>${alert.title}</h4>
            <p>${alert.message}</p>
            ${alert.confidence ? `<div class="confidence">Confidence: ${Math.round(alert.confidence * 100)}%</div>` : ''}
            ${alert.showAlternative ? '<button onclick="findAlternativeRoute()">Find Alternative Route</button>' : ''}
        </div>
        <button class="alert-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    // Add to page
    document.body.appendChild(alertDiv);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (alertDiv.parentElement) {
            alertDiv.remove();
        }
    }, 10000);
}

/**
 * Format crime data for display
 */
function formatCrimeForDisplay(crime) {
    const timeAgo = crime.minutes_ago 
        ? `${Math.round(crime.minutes_ago / 60)} hours ago`
        : new Date(crime.datetime).toLocaleDateString();
    
    return {
        title: crime.crime_type,
        subtitle: crime.address,
        time: timeAgo,
        severity: crime.severity,
        category: crime.crime_category,
        coordinates: crime.coordinates,
        isBreaking: crime.is_breaking || false
    };
}

// Export classes for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CrimeMapManager,
        NavigationSafetyManager,
        CrimeAnalyticsDashboard
    };
}
