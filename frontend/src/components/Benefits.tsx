import React from 'react';

interface BenefitsProps {
  cardOpacity: number;
  cardTransform: number;
}

const Benefits: React.FC<BenefitsProps> = ({ cardOpacity, cardTransform }) => {
  return (
    <section className="px-6 md:px-10 py-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-light mb-4 sm:mb-0">Never be afraid in cities again</h2>
          <div className="w-full sm:w-32 h-px bg-[var(--neutral)]"></div>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          style={{
            opacity: cardOpacity,
            transform: `translateY(${cardTransform}px)`
          }}
        >
          <div className="border border-[var(--neutral)]/20 p-8 hover:border-[var(--neutral)]/40 transition-all duration-300">
            <div className="mb-6">
              <div className="w-8 h-8 border border-[var(--neutral)]/40 rounded-full flex items-center justify-center mb-4">
                🌐
              </div>
              <h3 className="text-2xl font-light mb-3">Sourcing</h3>
              <p className="text-[var(--neutral)]/70 leading-relaxed">
              Aegis sources hundreds of thousands of multimodal data points from NASA infrared satellites and real-time 911 APIs to run novel danger-calculating algorithms. 
              </p>
            </div>
          </div>

          <div className="border border-[var(--neutral)]/20 p-8 hover:border-[var(--neutral)]/40 transition-all duration-300">
            <div className="mb-6">
              <div className="w-8 h-8 border border-[var(--neutral)]/40 rounded-full flex items-center justify-center mb-4">
                👁️
              </div>
              <h3 className="text-2xl font-light mb-3">Diligence</h3>
              <p className="text-[var(--neutral)]/70 leading-relaxed">
              Aegis applies multi-objective heuristics to adaptively assess risk levels for different routes through spectral radiance, optimized A* variants, and time-decay scoring.
              </p>
            </div>
          </div>

          <div className="border border-[var(--neutral)]/20 p-8 hover:border-[var(--neutral)]/40 transition-all duration-300">
            <div className="mb-6">
              <div className="w-8 h-8 border border-[var(--neutral)]/40 rounded-full flex items-center justify-center mb-4">
              🔩
              </div>
              <h3 className="text-2xl font-light mb-3">Execution</h3>
              <p className="text-[var(--neutral)]/70 leading-relaxed">
              Aegis optimizes its novel algorithms to run in milliseconds with minimal latency between user navigation and real-world danger updates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
