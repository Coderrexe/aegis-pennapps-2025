import './App.css'
import { useRef, useEffect, useState } from 'react'

function App() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoEnded, setVideoEnded] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      // Set playback rate to double speed
      video.playbackRate = 2.0
      
      // Handle video end event
      const handleVideoEnd = () => {
        // Keep the video on the last frame by pausing it
        video.pause()
        // Remove the loop attribute so it doesn't restart
        video.removeAttribute('loop')
        // Switch to p6.png background
        setVideoEnded(true)
      }
      
      video.addEventListener('ended', handleVideoEnd)
      
      return () => {
        video.removeEventListener('ended', handleVideoEnd)
      }
    }
  }, [])

  return (
    <div className="app">
      {/* Full-screen Background */}
      <div className="video-background">
        <video 
          ref={videoRef}
          className="background-video" 
          autoPlay 
          muted 
          playsInline
          poster="/favicon/favicon-512x512.png"
          style={{ display: videoEnded ? 'none' : 'block' }}
        >
          <source src="/favicon/animation.mov" type="video/quicktime" />
          <source src="/favicon/animation.mov" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div 
          className="background-image"
          style={{
            backgroundImage: 'url(/favicon/p6.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            width: '80%',
            height: '80%',
            position: 'absolute',
            top: '10%',
            left: '10%',
            display: videoEnded ? 'block' : 'none'
          }}
        />
        <div className="video-overlay-dark"></div>
      </div>

      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <h2>YourApp</h2>
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
              <button className="btn btn-primary">Get Started</button>
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
              <h3>YourApp</h3>
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
            <p>&copy; 2024 YourApp. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App;
