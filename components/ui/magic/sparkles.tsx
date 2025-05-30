'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const Sparkles = ({ children }: { children: React.ReactNode }) => {
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    const createSparkle = () => {
      const sparkle = {
        id: Math.random(),
        x: Math.random() * 100,
        y: Math.random() * 100,
      };
      setSparkles((prev) => [...prev, sparkle]);
      setTimeout(() => {
        setSparkles((prev) => prev.filter((s) => s.id !== sparkle.id));
      }, 1000);
    };

    const interval = setInterval(createSparkle, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute w-1 h-1 bg-blue-400 rounded-full pointer-events-none"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1,
            ease: 'easeInOut',
          }}
        />
      ))}
      {children}
    </div>
  );
};
