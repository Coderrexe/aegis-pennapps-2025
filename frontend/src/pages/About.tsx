import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const About: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const heroOpacity = Math.max(0.3, 1 - scrollY / 800);
  const contentTransform = Math.max(0, Math.min(100, scrollY / 10));

  return (
    <div className="bg-[var(--base)] text-[var(--neutral)] font-sans min-h-screen">
      <Header />

      {/* Side Label */}
      <div className="fixed left-5 md:left-10 top-1/2 -translate-y-1/2 text-[10px] md:text-xs tracking-wider uppercase opacity-70 hidden md:block z-40" style={{ writingMode: 'vertical-lr', textOrientation: 'mixed' }}>
        [About Aegis]
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Grid */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(var(--neutral) 1px, transparent 1px),
              linear-gradient(90deg, var(--neutral) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            transform: `translate(${scrollY * 0.1}px, ${scrollY * 0.05}px)`
          }}
        />

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute top-20 left-10 w-2 h-2 bg-[var(--accent)] rounded-full opacity-60"
            style={{ transform: `translateY(${scrollY * 0.3}px)` }}
          />
          <div 
            className="absolute top-40 right-20 w-1 h-1 bg-[var(--primary)] rounded-full opacity-80"
            style={{ transform: `translateY(${scrollY * -0.2}px)` }}
          />
          <div 
            className="absolute bottom-40 left-1/4 w-1.5 h-1.5 bg-[var(--secondary)] rounded-full opacity-50"
            style={{ transform: `translateY(${scrollY * 0.4}px)` }}
          />
        </div>

        <div className="relative z-10 text-center px-6 md:px-10 max-w-6xl mx-auto">
          <div 
            className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            style={{ opacity: heroOpacity }}
          >
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-light leading-tight mb-8 md:mb-12">
              About
              <span className="block text-[var(--accent)] font-normal">Aegis</span>
            </h1>
            <p className="text-lg md:text-xl font-light leading-relaxed max-w-3xl mx-auto opacity-80">
              Revolutionizing urban navigation through intelligent safety analysis and 
              multi-objective pathfinding algorithms.
            </p>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-2 opacity-60">
          <span className="text-xs tracking-wider uppercase">Scroll to explore</span>
          <div className="w-px h-8 bg-[var(--neutral)] animate-pulse" />
        </div>
      </section>

      {/* Mission Section */}
      <section className="relative py-20 md:py-32 px-6 md:px-10">
        <div 
          className="max-w-6xl mx-auto"
          style={{ transform: `translateY(${contentTransform * 0.5}px)` }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl font-light leading-tight mb-8">
                Our Mission
              </h2>
              <div className="space-y-6 text-base md:text-lg font-light leading-relaxed opacity-90">
                <p>
                  In an era where personal safety in urban environments is paramount, 
                  Aegis emerges as the definitive solution for intelligent navigation.
                </p>
                <p>
                  We believe that everyone deserves to feel secure while moving through 
                  their city, whether it's a late-night walk home or exploring unfamiliar 
                  neighborhoods.
                </p>
                <p>
                  Our mission is to democratize safety through cutting-edge technology, 
                  making advanced pathfinding algorithms accessible to everyone.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)] rounded-2xl opacity-20" />
              <div className="absolute inset-4 bg-[var(--base)] rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl md:text-6xl font-light text-[var(--accent)] mb-4">24/7</div>
                  <div className="text-sm md:text-base uppercase tracking-wider opacity-80">
                    Real-time Safety
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="relative py-20 md:py-32 px-6 md:px-10 bg-[var(--neutral)]/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-4xl md:text-6xl font-light leading-tight mb-8">
              Advanced Technology
            </h2>
            <p className="text-lg md:text-xl font-light opacity-80 max-w-3xl mx-auto">
              Powered by state-of-the-art algorithms and real-time data integration
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {/* NAMOA* Algorithm */}
            <div className="group">
              <div className="bg-[var(--base)] border border-[var(--neutral)]/20 rounded-2xl p-8 h-full transition-all duration-500 hover:border-[var(--primary)]/50 hover:shadow-2xl">
                <div className="w-12 h-12 bg-[var(--primary)]/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[var(--primary)]/30 transition-colors">
                  <svg className="w-6 h-6 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl md:text-2xl font-light mb-4">NAMOA* Pathfinding</h3>
                <p className="text-sm md:text-base font-light opacity-80 leading-relaxed">
                  Multi-objective A* algorithm that simultaneously optimizes for safety, 
                  efficiency, and user preferences in real-time.
                </p>
              </div>
            </div>

            {/* Real-time Data */}
            <div className="group">
              <div className="bg-[var(--base)] border border-[var(--neutral)]/20 rounded-2xl p-8 h-full transition-all duration-500 hover:border-[var(--secondary)]/50 hover:shadow-2xl">
                <div className="w-12 h-12 bg-[var(--secondary)]/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[var(--secondary)]/30 transition-colors">
                  <svg className="w-6 h-6 text-[var(--secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl md:text-2xl font-light mb-4">Live Data Integration</h3>
                <p className="text-sm md:text-base font-light opacity-80 leading-relaxed">
                  Continuous integration of crime statistics, lighting conditions, 
                  and crowd density for dynamic route optimization.
                </p>
              </div>
            </div>

            {/* Machine Learning */}
            <div className="group">
              <div className="bg-[var(--base)] border border-[var(--neutral)]/20 rounded-2xl p-8 h-full transition-all duration-500 hover:border-[var(--accent)]/50 hover:shadow-2xl">
                <div className="w-12 h-12 bg-[var(--accent)]/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[var(--accent)]/30 transition-colors">
                  <svg className="w-6 h-6 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl md:text-2xl font-light mb-4">Predictive Analytics</h3>
                <p className="text-sm md:text-base font-light opacity-80 leading-relaxed">
                  Machine learning models that predict safety patterns and 
                  adapt routing strategies based on historical data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="relative py-20 md:py-32 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-4xl md:text-6xl font-light leading-tight mb-8">
              Built for PennApps
            </h2>
            <p className="text-lg md:text-xl font-light opacity-80 max-w-3xl mx-auto">
              Developed by passionate students who believe technology can make cities safer for everyone
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="space-y-8">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-[var(--accent)] rounded-full" />
                  <span className="text-sm md:text-base font-light opacity-80">React + TypeScript Frontend</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-[var(--primary)] rounded-full" />
                  <span className="text-sm md:text-base font-light opacity-80">C++ NAMOA* Algorithm Engine</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-[var(--secondary)] rounded-full" />
                  <span className="text-sm md:text-base font-light opacity-80">Real-time Crime Data APIs</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-[var(--accent)] rounded-full" />
                  <span className="text-sm md:text-base font-light opacity-80">Google Maps Integration</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-[var(--primary)]/20 to-[var(--secondary)]/20 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl md:text-4xl font-light text-[var(--accent)] mb-4">PennApps 2025</div>
                  <div className="text-sm md:text-base uppercase tracking-wider opacity-80">
                    Innovation in Safety
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative py-20 md:py-32 px-6 md:px-10 bg-[var(--neutral)]/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-light leading-tight mb-8 md:mb-12">
            Experience Aegis Today
          </h2>
          <p className="text-lg md:text-xl font-light opacity-80 mb-12 md:mb-16 max-w-2xl mx-auto">
            Join the future of safe urban navigation. Every journey matters, every route is optimized for your safety.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/navigate"
              className="px-12 py-4 bg-[var(--primary)] text-[var(--neutral)] text-lg font-light tracking-wider uppercase hover:bg-opacity-80 transition-all duration-300 cursor-pointer"
            >
              Try Navigation
            </Link>
            <Link
              to="/"
              className="px-12 py-4 border border-[var(--neutral)]/30 text-lg font-light tracking-wider uppercase hover:bg-[var(--neutral)] hover:text-[var(--base)] transition-all duration-300 cursor-pointer"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
