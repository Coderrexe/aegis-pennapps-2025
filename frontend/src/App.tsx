import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Benefits from './components/Benefits';
import CallToAction from './components/CallToAction';
import Footer from './components/Footer';

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

      <Hero showScrollHint={showScrollHint} scrollY={scrollY} />
      <Benefits cardOpacity={cardOpacity} cardTransform={cardTransform} />
      <CallToAction />
      <Footer />
    </div>
  );
};

export default App;