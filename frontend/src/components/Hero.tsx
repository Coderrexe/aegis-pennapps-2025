import React from 'react';
import SphereAnimation from './SphereAnimation';

interface HeroProps {
  showScrollHint: boolean;
  scrollY: number;
}

const Hero: React.FC<HeroProps> = ({ showScrollHint, scrollY }) => {
  return (
    <section className="h-screen flex items-center justify-center relative px-6 md:px-0">
      <div className="relative w-full max-w-[600px] h-auto md:w-[600px] md:h-[600px] flex flex-col md:flex-row items-center justify-center">
        <SphereAnimation />
        <div className="text-center md:absolute md:-right-52 md:top-1/2 md:-translate-y-1/2 md:text-left md:w-auto">
          <h1 className="text-4xl md:text-5xl font-light leading-tight mb-2">
            Navigating cities is dangerous.
          </h1>
          <h2 className="text-4xl md:text-5xl font-light italic opacity-80 leading-tight">
            We fix that.
          </h2>
        </div>
      </div>

      <button
        className={`fixed bottom-8 right-8 w-12 h-12 border border-[var(--neutral)]/30 rounded-full flex items-center justify-center hover:border-[var(--neutral)]/50 transition-all duration-500 cursor-pointer ${
          showScrollHint && scrollY < 100 ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M7 13l5 5 5-5M7 6l5 5 5-5"/>
        </svg>
      </button>
    </section>
  );
};

export default Hero;
