// src/scenes/ScreenTwo/components/PriceAnchor.tsx

import React from 'react';

interface PriceAnchorProps {
  price: string;
  heading: string;
  items: Array<{
    main: string;
    sub: string;
  }>;
  delivery: string;
  ownership: string;
}

const PriceAnchor: React.FC<PriceAnchorProps> = ({
  price,
  heading,
  items,
  delivery,
  ownership
}) => {
  return (
    <div className="mb-6">
      <p className="text-[#D4AF37] text-2xl font-bold mb-4">
        {price}
      </p>

      <p className="text-white/90 text-base font-semibold mb-3">
        {heading}
      </p>

      <ul className="space-y-3 mb-4">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <span className="text-[#D4AF37] text-lg mt-0.5">•</span>
            <div className="flex-1">
              <p className="text-white/90 text-[15px] leading-[1.7]">
                {item.main}{' '}
                <span className="text-[#9CA3AF]/65 text-sm">
                  {item.sub}
                </span>
              </p>
            </div>
          </li>
        ))}
      </ul>

      <p className="text-white/85 text-[15px] mb-2">
        {delivery}
      </p>
      <p className="text-[#9CA3AF]/70 text-[15px]">
        {ownership}
      </p>
    </div>
  );
};

export default PriceAnchor;
