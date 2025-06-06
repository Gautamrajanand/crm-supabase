'use client';

import { cn } from '@/lib/utils';
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from './sparkles';

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        'grid md:auto-rows-[12rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto',
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
  delay,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  delay?: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: delay || 0,
        ease: 'easeOut',
      }}
      viewport={{ once: true }}
      className={cn(
        'row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-300 p-4 bg-gradient-to-br from-gray-900/80 to-gray-800/50 backdrop-blur-sm border border-gray-800 hover:border-blue-500/50 justify-between flex flex-col space-y-2 hover:scale-[1.02] hover:-translate-y-1',
        className
      )}
    >
      {header}
      <Sparkles>
        <div className="relative z-10">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/10 w-fit group-hover/bento:from-blue-500/30 group-hover/bento:to-blue-600/20 transition-colors duration-300">
            {icon}
          </div>
          <h3 className="mt-3 font-semibold text-lg text-white/90 group-hover/bento:text-white transition-colors duration-300">
            {title}
          </h3>
          <p className="mt-1.5 text-sm text-gray-400 group-hover/bento:text-gray-300 transition-colors duration-300 line-clamp-2">
            {description}
          </p>
        </div>
      </Sparkles>
    </motion.div>
  );
};
