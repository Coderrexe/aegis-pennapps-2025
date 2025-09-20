import React from 'react';
import { Link } from 'react-router-dom';

const CallToAction: React.FC = () => {
  return (
    <section className="flex items-center justify-center px-6 md:px-10 pb-20">
      <div className="text-center">
        <h2 className="text-4xl md:text-6xl font-light leading-tight mb-8 md:mb-12">
          Ready to give Aegis a try?
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center">
          <Link 
            to="/navigate"
            className="px-8 md:px-12 py-3 md:py-4 border border-[var(--neutral)]/30 text-base md:text-lg font-light tracking-wider uppercase hover:bg-[var(--neutral)] hover:text-[var(--base)] transition-all duration-300 cursor-pointer inline-block text-center"
          >
            Get Started
          </Link>
          <Link 
            to="/about"
            className="px-8 md:px-12 py-3 md:py-4 border border-[var(--neutral)]/30 text-base md:text-lg font-light tracking-wider uppercase hover:border-[var(--neutral)] hover:underline transition-all duration-300 cursor-pointer inline-block text-center"
          >
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
