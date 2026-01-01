
import React from 'react';
import { Ink } from '../types';

interface InkBottleProps {
  ink: Ink;
  onClick: (ink: Ink) => void;
  size?: 'sm' | 'lg';
}

const InkBottle: React.FC<InkBottleProps> = ({ ink, onClick, size = 'sm' }) => {
  const fillPercent = Math.max(0, Math.min(100, (ink.remaining / ink.capacity) * 100));
  const isLow = fillPercent < 15;

  const bodyClasses = size === 'sm' 
    ? "w-10 h-14 md:w-12 md:h-16" 
    : "w-24 h-32 md:w-32 md:h-44";
  
  const capClasses = size === 'sm'
    ? "w-6 h-3"
    : "w-14 h-8";

  return (
    <div 
      className="group flex flex-col items-center cursor-pointer transition-transform hover:-translate-y-2"
      onClick={() => onClick(ink)}
    >
      {/* Cap */}
      <div className={`${capClasses} bg-gradient-to-b from-[#444] to-[#222] rounded-t-sm shadow-md mb-1`} />
      
      {/* Bottle Body */}
      <div className={`${bodyClasses} relative border border-white/30 rounded-md overflow-hidden bg-white/10 shadow-lg backdrop-blur-[1px]`}>
        {/* Liquid */}
        <div 
          className="absolute bottom-0 left-0 right-0 transition-all duration-700 ease-out flex items-center justify-center"
          style={{ 
            height: `${fillPercent}%`, 
            backgroundColor: ink.color,
            opacity: 0.85
          }}
        >
          {isLow && fillPercent > 0 && (
            <span className="text-white text-[10px] animate-pulse">!</span>
          )}
        </div>
        
        {/* Label */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 px-1 py-0.5 rounded text-[8px] text-gray-800 font-bold max-w-[80%] truncate shadow-sm">
          {ink.brand}
        </div>
      </div>
      
      {/* Text Info */}
      <div className={`mt-2 text-center max-w-full overflow-hidden ${size === 'sm' ? 'text-[10px]' : 'text-sm font-semibold'}`}>
        <p className="truncate text-[#5a4030] group-hover:text-[#c9a66b] font-medium transition-colors">
          {ink.name}
        </p>
      </div>
    </div>
  );
};

export default InkBottle;
