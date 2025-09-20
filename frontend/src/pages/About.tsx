import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const parallaxOffset = scrollY * 0.5;

  return (
    <div className="bg-[var(--base)] text-[var(--neutral)] font-sans min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-5 md:px-10 py-5 flex justify-between items-center backdrop-blur-sm bg-[var(--base)]/80">
        <Link to="/" className="text-xl md:text-3xl font-light tracking-wider hover:opacity-80 transition-opacity">
          Aegis
        </Link>
        <nav>
          <ul className="flex gap-4 md:gap-10 list-none">
            <li>
              <Link 
                to="/" 
                className="text-xs md:text-sm font-normal tracking-wide uppercase cursor-pointer hover:underline transition-all"
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/navigate" 
                className="text-xs md:text-sm font-normal tracking-wide uppercase cursor-pointer hover:underline transition-all"
              >
                Navigate
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="h-screen flex items-center justify-center relative px-6 md:px-10 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            transform: `translateY(${parallaxOffset}px)`,
            backgroundImage: `radial-gradient(circle at 20% 80%, var(--primary) 0%, transparent 50%), 
                             radial-gradient(circle at 80% 20%, var(--secondary) 0%, transparent 50%),
                             radial-gradient(circle at 40% 40%, var(--accent) 0%, transparent 50%)`,
          }}
        />
        
        <div className="text-center max-w-4xl mx-auto relative z-10">
          <h1 className="text-5xl md:text-7xl font-light leading-tight mb-8">
            About <span className="italic text-[var(--accent)]">Aegis</span>
          </h1>
          <p className="text-xl md:text-2xl font-light opacity-80 leading-relaxed">
            Reimagining urban navigation through the lens of safety, 
            <br className="hidden md:block" />
            one intelligent route at a time.
          </p>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-50">
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5"/>
          </svg>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-light mb-8 leading-tight">
                Our Mission
              </h2>
              <p className="text-lg md:text-xl leading-relaxed opacity-90 mb-6">
                Every day, millions of people navigate urban environments with an underlying sense of uncertainty. 
                Which streets are safe after dark? Where should you avoid walking alone? Traditional navigation 
                apps optimize for speed and distance, but they ignore the most important factor: your safety.
              </p>
              <p className="text-lg md:text-xl leading-relaxed opacity-90">
                Aegis changes that. We believe that everyone deserves to move through cities with confidence, 
                armed with real-time intelligence about crime patterns, lighting conditions, and community safety data.
              </p>
            </div>
            <div className="relative">
              <div className="w-full h-80 bg-gradient-to-br from-[var(--primary)]/20 to-[var(--secondary)]/20 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 border-2 border-[var(--accent)] rounded-full flex items-center justify-center mb-4 mx-auto">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <p className="text-sm uppercase tracking-wider opacity-70">Safety-First Navigation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-6 md:px-10 bg-[var(--neutral)]/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light mb-8">The Problem We're Solving</h2>
            <p className="text-xl opacity-80 max-w-3xl mx-auto">
              Urban safety isn't just about avoiding crime—it's about understanding your environment completely.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 border border-[var(--neutral)]/20 rounded-lg hover:border-[var(--neutral)]/40 transition-all">
              <div className="w-16 h-16 bg-[var(--secondary)]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🚨</span>
              </div>
              <h3 className="text-xl font-light mb-4">Crime Blind Spots</h3>
              <p className="opacity-80 leading-relaxed">
                Traditional maps don't show recent crime incidents, leaving users vulnerable to dangerous areas.
              </p>
            </div>

            <div className="text-center p-8 border border-[var(--neutral)]/20 rounded-lg hover:border-[var(--neutral)]/40 transition-all">
              <div className="w-16 h-16 bg-[var(--primary)]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🌙</span>
              </div>
              <h3 className="text-xl font-light mb-4">Poor Lighting</h3>
              <p className="opacity-80 leading-relaxed">
                Dark streets and poorly lit areas create safety hazards that aren't considered in route planning.
              </p>
            </div>

            <div className="text-center p-8 border border-[var(--neutral)]/20 rounded-lg hover:border-[var(--neutral)]/40 transition-all">
              <div className="w-16 h-16 bg-[var(--accent)]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">⏰</span>
              </div>
              <h3 className="text-xl font-light mb-4">Time Insensitive</h3>
              <p className="opacity-80 leading-relaxed">
                Safety conditions change throughout the day, but current navigation doesn't adapt to these patterns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-[var(--primary)] rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-light mb-2">Real-Time Crime Data</h4>
                    <p className="opacity-80">Integration with police databases and 911 call systems for up-to-the-minute safety intelligence.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-[var(--secondary)] rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-light mb-2">Satellite Lighting Analysis</h4>
                    <p className="opacity-80">NASA VIIRS satellite data provides comprehensive street lighting coverage analysis.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-[var(--accent)] rounded-full flex items-center justify-center mt-1">
                    <span className="text-black text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-light mb-2">Adaptive Algorithms</h4>
                    <p className="opacity-80">Machine learning models that adapt routes based on time, weather, and historical safety patterns.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-4xl md:text-5xl font-light mb-8 leading-tight">
                How Aegis Works
              </h2>
              <p className="text-lg md:text-xl leading-relaxed opacity-90 mb-8">
                Our platform combines multiple data sources with advanced algorithms to provide 
                intelligent, safety-conscious navigation that adapts to real-world conditions.
              </p>
              <Link 
                to="/navigate"
                className="inline-block px-8 py-3 border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--base)] transition-all duration-300 uppercase tracking-wider font-light"
              >
                Try Aegis Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-6 md:px-10 bg-[var(--neutral)]/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-light mb-8">Built for PennApps 2025</h2>
          <p className="text-lg md:text-xl leading-relaxed opacity-90 mb-12">
            Aegis represents the intersection of urban planning, data science, and human-centered design. 
            Our team believes that technology should serve humanity's most fundamental need: safety.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="p-6 border border-[var(--neutral)]/20 rounded-lg">
              <h3 className="text-xl font-light mb-3">Innovation</h3>
              <p className="opacity-80">Pioneering the future of safety-conscious urban navigation through cutting-edge technology.</p>
            </div>
            <div className="p-6 border border-[var(--neutral)]/20 rounded-lg">
              <h3 className="text-xl font-light mb-3">Impact</h3>
              <p className="opacity-80">Empowering communities to move through cities with confidence and peace of mind.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 md:px-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-light leading-tight mb-8">
            Ready to navigate safely?
          </h2>
          <p className="text-xl opacity-80 mb-12 max-w-2xl mx-auto">
            Join the movement toward safer, smarter urban navigation. Experience the future of city travel with Aegis.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              to="/navigate"
              className="px-12 py-4 bg-[var(--accent)] text-[var(--base)] text-lg font-light tracking-wider uppercase hover:bg-[var(--accent)]/90 transition-all duration-300"
            >
              Start Navigating
            </Link>
            <Link 
              to="/"
              className="px-12 py-4 border border-[var(--neutral)]/30 text-lg font-light tracking-wider uppercase hover:border-[var(--neutral)] transition-all duration-300"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--neutral)]/20 py-12 px-6 md:px-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm opacity-70">© 2025 Aegis. Built for PennApps with ❤️</p>
          </div>
          <div className="flex space-x-8">
            <Link to="/" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Home</Link>
            <Link to="/about" className="text-sm opacity-70 hover:opacity-100 transition-opacity">About</Link>
            <Link to="/navigate" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Navigate</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;
