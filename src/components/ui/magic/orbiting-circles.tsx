'use client';

import { cn } from '@/lib/utils';
import React from 'react';

export const OrbitingCircles = ({
  className,
  size = 800,
  dotSize = 4,
  dotCount = 32,
  rotationDuration = 30,
}: {
  className?: string;
  size?: number;
  dotSize?: number;
  dotCount?: number;
  rotationDuration?: number;
}) => {
  const dots = new Array(dotCount).fill(0);
  const radius = size / 3;

  return (
    <div
      className={cn('relative pointer-events-none', className)}
      style={{
        width: size,
        height: size,
      }}
    >
      {dots.map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-gradient-to-r from-blue-400 to-blue-600 blur-[0.5px]"
          style={{
            width: dotSize,
            height: dotSize,
            left: '50%',
            top: '50%',
            transform: `rotate(${(i * 360) / dots.length}deg) translateY(${radius}px)`,
            animation: `orbit${i} ${rotationDuration + (i % 5) * 0.5}s linear infinite`,
            opacity: 0.15 + (i / dots.length) * 0.35,
          }}
        />
      ))}
      <style jsx>{`
        ${dots.map((_, i) => `
          @keyframes orbit${i} {
            from {
              transform: rotate(${(i * 360) / dots.length}deg) translateY(${radius}px) rotate(0deg);
            }
            to {
              transform: rotate(${(i * 360) / dots.length}deg) translateY(${radius}px) rotate(-360deg);
            }
          }
        `).join('')}
      `}</style>
    </div>
  );
};
