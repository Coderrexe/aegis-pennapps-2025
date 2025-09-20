import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate as Redirect } from 'react-router-dom'

function Home() {
  return (
    <div className="app">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <h2>Aegis</h2>
          </div>
          <div className="nav-menu">
            <a href="#home" className="nav-link">Home</a>
            <a href="#features" className="nav-link">Features</a>
            <a href="#about" className="nav-link">About</a>
            <a href="#contact" className="nav-link">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Welcome to the Future of
              <span className="gradient-text"> Innovation</span>
            </h1>
            <p className="hero-description">
              Experience cutting-edge technology that transforms the way you work, 
              create, and connect. Built with modern tools and designed for tomorrow.
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary">Get Started</button>
              <button className="btn btn-secondary">Learn More</button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-card card-1">
              <div className="card-icon">⚡</div>
              <h3>Fast</h3>
            </div>
            <div className="floating-card card-2">
              <div className="card-icon">🔒</div>
              <h3>Secure</h3>
            </div>
            <div className="floating-card card-3">
              <div className="card-icon">🚀</div>
              <h3>Scalable</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose Us?</h2>
            <p className="section-description">
              Discover the features that make us stand out from the competition
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Precision</h3>
              <p>Every detail crafted with precision to deliver exceptional results that exceed expectations.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Performance</h3>
              <p>Lightning-fast performance optimized for speed and efficiency in every interaction.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔧</div>
              <h3>Customizable</h3>
              <p>Fully customizable solutions tailored to meet your unique business requirements.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Responsive</h3>
              <p>Seamless experience across all devices with our responsive design approach.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Secure</h3>
              <p>Enterprise-grade security measures to protect your data and ensure privacy.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌐</div>
              <h3>Global</h3>
              <p>Worldwide accessibility with support for multiple languages and regions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Get Started?</h2>
            <p>Join thousands of satisfied users who have transformed their workflow with our platform.</p>
            <button className="btn btn-primary btn-large">Start Your Journey</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Aegis</h3>
              <p>Building the future, one innovation at a time.</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Connect</h4>
              <ul>
                <li><a href="#">Twitter</a></li>
                <li><a href="#">LinkedIn</a></li>
                <li><a href="#">GitHub</a></li>
                <li><a href="#">Discord</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Aegis. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Navigate() {
  return (
    <div className="map-container">
      <div className="loading-container">
        <h2>Navigation Coming Soon...</h2>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/navigate" element={<Navigate />} />
        <Route path="*" element={<Redirect to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
