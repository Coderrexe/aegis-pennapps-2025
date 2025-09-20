<<<<<<< Updated upstream
import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Benefits from './components/Benefits';
import CallToAction from './components/CallToAction';
import Footer from './components/Footer';
=======
import './App.css'
import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
>>>>>>> Stashed changes

const App: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);
  const [showScrollHint, setShowScrollHint] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowScrollHint(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const cardOpacity = Math.max(0, Math.min(1, (scrollY - 400) / 200));
  const cardTransform = Math.max(0, Math.min(50, (600 - scrollY) / 10));

  return (
    <div className="bg-[var(--base)] text-[var(--neutral)] font-sans">
      <Header />

      <div className="fixed left-5 md:left-10 top-1/2 -translate-y-1/2 text-[10px] md:text-xs tracking-wider uppercase opacity-70 hidden md:block z-40" style={{ writingMode: 'vertical-lr', textOrientation: 'mixed' }}>
        [Built for PennApps 2025]
      </div>

<<<<<<< Updated upstream
      <Hero showScrollHint={showScrollHint} scrollY={scrollY} />
      <Benefits cardOpacity={cardOpacity} cardTransform={cardTransform} />
      <CallToAction />
      <Footer />
=======
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <h2>Aegis</h2>
          </div>
          <div className="nav-menu">
            <Link to="/navigate" className="nav-link">Navigate</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className={`hero-container ${videoEnded ? 'fade-in' : ''}`}>
          <div className="hero-content">
            <h1 className="hero-title">
              Aegis
            </h1>
            <p className="hero-description">
              An adaptive navigation driven by <br /> 
              real-time data optimized for your safety.
            </p>
            <div className="hero-buttons">
              <Link to="/navigate">
                <button className="btn btn-primary">Get Started</button>
              </Link>
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
>>>>>>> Stashed changes
    </div>
  );
};

export default App;