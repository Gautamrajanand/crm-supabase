'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export const SmoothCursor = () => {
  const [isClient, setIsClient] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const springConfig = { damping: 25, stiffness: 250 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    setIsClient(true);
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
    };

    window.addEventListener('mousemove', moveCursor);
    return () => {
      window.removeEventListener('mousemove', moveCursor);
    };
  }, [cursorX, cursorY]);

  if (!isClient) return null;

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-50"
      style={{
        width: 32,
        height: 32,
        x: cursorXSpring,
        y: cursorYSpring,
      }}
    >
      <div className="relative w-full h-full">
        <div className="absolute inset-0 rounded-full border-2 border-blue-500/50 animate-ping" />
        <div className="absolute inset-0 rounded-full bg-blue-500/20 backdrop-blur-sm" />
      </div>
    </motion.div>
  );
};
