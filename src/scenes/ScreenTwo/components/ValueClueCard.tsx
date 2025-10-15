// src/scenes/ScreenTwo/components/ValueClueCard.tsx

import React from 'react';

interface ValueClueCardProps {
  id: string;
  title: string;
  body: string;
  footer: string;
}

const ValueClueCard: React.FC<ValueClueCardProps> = ({ title, body, footer }) => {
  return (
    <div className="bg-[#1A1F2E] border border-[#D4AF37]/15 rounded-[10px] p-6">
      <h3 className="text-[#D4AF37] text-lg font-semibold mb-3">
        {title}
      </h3>
      <p className="text-white/90 text-[15px] leading-[1.6] mb-4">
        {body}
      </p>
      <p className="text-[#9CA3AF]/50 text-[13px] italic">
        {footer}
      </p>
    </div>
  );
};

export default ValueClueCard;
