import React, { useRef, useEffect } from 'react';
import type { Point, ProjectedPoint } from '../types';

const SphereAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const rotationRef = useRef<number>(0);

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
      const initialSpeed = 0.05;
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

  return (
    <div className="w-[300px] h-[300px] md:w-[500px] md:h-[500px] mb-8 md:mb-0 md:-ml-100 md:self-center">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        width="500"
        height="500"
      />
    </div>
  );
};

export default SphereAnimation;
