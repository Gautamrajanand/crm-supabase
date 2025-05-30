'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

export const Marquee = ({
  children,
  direction = 'left',
  pauseOnHover = true,
  reverse = false,
  fade = true,
  className,
}: {
  children: React.ReactNode;
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
  reverse?: boolean;
  fade?: boolean;
  className?: string;
}) => {
  const [start, setStart] = useState(false);

  useEffect(() => {
    setStart(true);
  }, []);

  return (
    <div
      className={cn(
        'group relative overflow-hidden',
        fade && 'mask-fade',
        className
      )}
    >
      <motion.div
        initial={{ x: direction === 'left' ? (reverse ? '-100%' : '0%') : reverse ? '100%' : '0%' }}
        animate={
          start
            ? {
                x: direction === 'left'
                  ? reverse
                    ? '0%'
                    : '-100%'
                  : reverse
                  ? '0%'
                  : '100%',
              }
            : {}
        }
        transition={{
          ease: 'linear',
          duration: 20,
          repeat: Infinity,
        }}
        className={cn(
          'flex shrink-0 gap-4 py-4',
          pauseOnHover && 'group-hover:[animation-play-state:paused]'
        )}
      >
        {children}
      </motion.div>
      <motion.div
        initial={{ x: direction === 'left' ? '0%' : '-100%' }}
        animate={
          start
            ? {
                x: direction === 'left' ? '-100%' : '0%',
              }
            : {}
        }
        transition={{
          ease: 'linear',
          duration: 20,
          repeat: Infinity,
        }}
        className={cn(
          'flex absolute top-0 shrink-0 gap-4 py-4',
          pauseOnHover && 'group-hover:[animation-play-state:paused]'
        )}
      >
        {children}
      </motion.div>
    </div>
  );
};
