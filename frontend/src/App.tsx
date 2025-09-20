import React, { useEffect, useRef, useState } from 'react';

interface Point {
  x: number;
  y: number;
  z: number;
  originalX: number;
  originalY: number;
  originalZ: number;
  color: string;
}

interface ProjectedPoint {
  x: number;
  y: number;
  scale: number;
  color: string;
}

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const rotationRef = useRef<number>(0);
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 500;
    canvas.height = 500;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 200;

    const colors = ['#3b82f6', '#10b981', '#ef4444'];

    const createSpherePoints = (): Point[] => {
      const points: Point[] = [];
      const latLines = 12;
      const lonLines = 20;

      for (let lat = 0; lat <= latLines; lat++) {
        const theta = (lat * Math.PI) / latLines;
        for (let lon = 0; lon < lonLines; lon++) {
          const phi = (lon * 2 * Math.PI) / lonLines;

          const x = radius * Math.sin(theta) * Math.cos(phi);
          const y = radius * Math.cos(theta);
          const z = radius * Math.sin(theta) * Math.sin(phi);

          const color = colors[Math.floor(Math.random() * colors.length)];

          points.push({ x, y, z, originalX: x, originalY: y, originalZ: z, color });
        }
      }

      return points;
    };

    const points = createSpherePoints();

    const rotatePoint = (point: Point, rotationY: number, rotationX: number): Point => {
      const cosY = Math.cos(rotationY);
      const sinY = Math.sin(rotationY);
      const rotatedY_x = point.originalX * cosY - point.originalZ * sinY;
      const rotatedY_z = point.originalX * sinY + point.originalZ * cosY;

      const cosX = Math.cos(rotationX);
      const sinX = Math.sin(rotationX);
      const rotatedX_y = point.originalY * cosX - rotatedY_z * sinX;
      const rotatedX_z = point.originalY * sinX + rotatedY_z * cosX;

      return {
        ...point,
        x: rotatedY_x,
        y: rotatedX_y,
        z: rotatedX_z
      };
    };

    const projectPoint = (point: Point, perspective: number): ProjectedPoint => {
      const scale = perspective / (perspective + point.z);

      return {
        x: centerX + point.x * scale,
        y: centerY + point.y * scale,
        scale,
        color: point.color,
      };
    };

    const drawSphere = (perspective: number): void => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const rotatedPoints = points.map(point => rotatePoint(point, rotationRef.current, rotationRef.current / 2));
      const projectedPoints = rotatedPoints.map(point => projectPoint(point, perspective));

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;

      const latLines = 12;
      const lonLines = 20;

      for (let lat = 0; lat <= latLines; lat++) {
        ctx.beginPath();
        for (let lon = 0; lon < lonLines; lon++) {
          const index = lat * lonLines + lon;
          const point = projectedPoints[index];

          if (lon === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        }
        ctx.closePath();
        ctx.stroke();
      }

      for (let lon = 0; lon < lonLines; lon++) {
        ctx.beginPath();
        for (let lat = 0; lat <= latLines; lat++) {
          const index = lat * lonLines + lon;
          const point = projectedPoints[index];

          if (lat === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        }
        ctx.stroke();
      }

      projectedPoints.forEach(point => {
        if (point.scale > 0) {
          ctx.fillStyle = point.color;
          ctx.beginPath();
          ctx.arc(point.x, point.y, 2 * point.scale, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    };

    let animationProgress = 0;
    const animate = (): void => {
      const maxProgress = 180; // ~3 seconds at 60fps
      const finalSpeed = 0.005;
      const initialSpeed = 0.2;
      const finalPerspective = 400;
      const initialPerspective = 1000;

      if (animationProgress < maxProgress) {
        const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
        const easedProgress = easeOutCubic(animationProgress / maxProgress);

        const currentSpeed = initialSpeed + (finalSpeed - initialSpeed) * easedProgress;
        rotationRef.current += currentSpeed;

        const currentPerspective = initialPerspective + (finalPerspective - initialPerspective) * easedProgress;
        drawSphere(currentPerspective);

        animationProgress++;
      } else {
        rotationRef.current += finalSpeed;
        drawSphere(finalPerspective);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const cardOpacity = Math.max(0, Math.min(1, (scrollY - 400) / 200));
  const cardTransform = Math.max(0, Math.min(50, (600 - scrollY) / 10));

  return (
    <div className="bg-[var(--base)] text-[var(--neutral)] font-sans">
      <header className="fixed top-0 left-0 right-0 z-50 px-5 md:px-10 py-5 flex justify-between items-center backdrop-blur-sm">
        <div className="text-xl md:text-3xl font-light tracking-wider">Aegis</div>
        <nav>
          <ul className="flex gap-4 md:gap-10 list-none">
            <li className="text-xs md:text-sm font-normal tracking-wide uppercase cursor-pointer hover:underline">
              About
            </li>
            <li className="text-xs md:text-sm font-normal tracking-wide uppercase cursor-pointer hover:underline">
              Navigate
            </li>
          </ul>
        </nav>
      </header>

      <div className="fixed left-5 md:left-10 top-1/2 -translate-y-1/2 text-[10px] md:text-xs tracking-wider uppercase opacity-70 hidden md:block z-40" style={{ writingMode: 'vertical-lr', textOrientation: 'mixed' }}>
        [Built for PennApps 2025]
      </div>

      <section className="h-screen flex items-center justify-center relative px-6 md:px-0">
        <div className="relative w-full max-w-[600px] h-auto md:w-[600px] md:h-[600px] flex flex-col md:flex-row items-center justify-center">
          {/* Sphere Animation */}
          <div className="w-[300px] h-[300px] md:w-[500px] md:h-[500px] mb-8 md:mb-0 md:-ml-100 md:self-center">
            <canvas
              ref={canvasRef}
              className="w-full h-full"
              width="500"
              height="500"
            />
          </div>
          {/* Text content, positioned differently for mobile and PC */}
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

      <section className="px-6 md:px-10 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-light mb-4 sm:mb-0">Benefits of the program</h2>
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
                <h3 className="text-2xl font-light mb-6">Impact</h3>
                <p className="text-[var(--neutral)]/70 leading-relaxed">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. 
                </p>
              </div>
              <button className="text-sm tracking-wider uppercase text-[var(--neutral)]/60 hover:text-[var(--neutral)] hover:underline transition-colors cursor-pointer">
                EXPAND +
              </button>
            </div>

            <div className="border border-[var(--neutral)]/20 p-8 hover:border-[var(--neutral)]/40 transition-all duration-300">
              <div className="mb-6">
                <div className="w-8 h-8 border border-[var(--neutral)]/40 rounded-full flex items-center justify-center mb-4">
                  👁️
                </div>
                <h3 className="text-2xl font-light mb-6">Perspective</h3>
                <p className="text-[var(--neutral)]/70 leading-relaxed">
                  Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. 
                </p>
              </div>
              <button className="text-sm tracking-wider uppercase text-[var(--neutral)]/60 hover:text-[var(--neutral)] hover:underline transition-colors cursor-pointer">
                EXPAND +
              </button>
            </div>

            <div className="border border-[var(--neutral)]/20 p-8 hover:border-[var(--neutral)]/40 transition-all duration-300">
              <div className="mb-6">
                <div className="w-8 h-8 border border-[var(--neutral)]/40 rounded-full flex items-center justify-center mb-4">
                  ⬢
                </div>
                <h3 className="text-2xl font-light mb-6">Community</h3>
                <p className="text-[var(--neutral)]/70 leading-relaxed">
                  Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. 
                </p>
              </div>
              <button className="text-sm tracking-wider uppercase text-[var(--neutral)]/60 hover:text-[var(--neutral)] hover:underline transition-colors cursor-pointer">
                EXPAND +
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 md:px-10 py-20">
        <div className="text-center">
          <h2 className="text-4xl md:text-6xl font-light leading-tight mb-8 md:mb-12">
            Ready to give Aegis a try?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center">
            <button className="px-8 md:px-12 py-3 md:py-4 border border-[var(--neutral)]/30 text-base md:text-lg font-light tracking-wider uppercase hover:bg-[var(--neutral)] hover:text-[var(--base)] transition-all duration-300 cursor-pointer">
              Get Started
            </button>
            <button className="px-8 md:px-12 py-3 md:py-4 border border-[var(--neutral)]/30 text-base md:text-lg font-light tracking-wider uppercase hover:border-[var(--neutral)] hover:underline transition-all duration-300 cursor-pointer">
              Learn More
            </button>
          </div>
        </div>
      </section>

      <footer className="px-6 md:px-10 py-8 border-t border-[var(--neutral)]/10">
        <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
          <div className="text-xs opacity-50 mb-2 sm:mb-0">
            © https://aeg1s.vercel.app/
          </div>
          <a href="#" className="text-xs hover:underline cursor-pointer">
            Devpost
          </a>
        </div>
      </footer>
    </div>
  );
};

export default App;