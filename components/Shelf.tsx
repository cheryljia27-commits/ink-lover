
import React from 'react';
import { Ink } from '../types';
import InkBottle from './InkBottle';

interface ShelfProps {
  inks: Ink[];
  onBottleClick: (ink: Ink) => void;
  searchTerm: string;
  brandFilter: string;
}

const Shelf: React.FC<ShelfProps> = ({ inks, onBottleClick, searchTerm, brandFilter }) => {
  const filteredInks = inks.filter(ink => {
    const matchSearch = ink.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       ink.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchBrand = !brandFilter || ink.brand === brandFilter;
    return matchSearch && matchBrand;
  });

  const bottlesPerRow = 8;
  const rows = [];
  for (let i = 0; i < filteredInks.length; i += bottlesPerRow) {
    rows.push(filteredInks.slice(i, i + bottlesPerRow));
  }

  if (filteredInks.length === 0) {
    return (
      <div className="py-20 text-center text-[#8b6b55]">
        <div className="text-5xl mb-4 opacity-30">🫙</div>
        <p>书架上空空如也，去添加你的第一瓶墨水吧</p>
      </div>
    );
  }

  return (
    <div className="space-y-16 py-8">
      {rows.map((row, idx) => (
        <div key={idx} className="relative">
          <div className="flex flex-wrap items-end gap-6 md:gap-10 px-4 pb-4">
            {row.map(ink => (
              <InkBottle key={ink.id} ink={ink} onClick={onBottleClick} />
            ))}
          </div>
          {/* Wooden Shelf Board */}
          <div className="h-4 w-full bg-gradient-to-b from-[#8b5a2b] to-[#5a3a1d] rounded-sm shadow-xl relative overflow-hidden">
             <div className="absolute inset-0 bg-white/5 opacity-20 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(0,0,0,0.1) 40px, rgba(0,0,0,0.1) 41px)' }}></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Shelf;
