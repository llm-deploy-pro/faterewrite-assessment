// src/scenes/ScreenTwo/components/FAQ.tsx

import React, { useState } from 'react';

interface FAQItem {
  q: string;
  a: string[];
}

interface FAQProps {
  trigger: string;
  items: FAQItem[];
}

const FAQ: React.FC<FAQProps> = ({ trigger, items }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    
    if (!isOpen && typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('S2B_FAQ_Expand', {
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <div className="border-t border-white/5 pt-6">
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between py-3 text-[#9CA3AF]/80 text-[15px] font-medium hover:text-white/90 transition-colors"
      >
        <span>{trigger}</span>
        <span className="transform transition-transform" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ↓
        </span>
      </button>

      {isOpen && (
        <div className="space-y-5 mt-4">
          {items.map((item, idx) => (
            <div key={idx}>
              <p className="text-white text-[15px] font-semibold mb-3">
                {item.q}
              </p>
              <div className="text-white/80 text-sm leading-[1.6] space-y-2">
                {item.a.map((para, pIdx) => (
                  <p key={pIdx} className={para === '' ? 'h-2' : ''}>
                    {para.includes('4.8/5') ? (
                      <>
                        {para.split('4.8/5')[0]}
                        <span className="text-[#D4AF37]">4.8/5</span>
                        {para.split('4.8/5')[1]}
                      </>
                    ) : (
                      para
                    )}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FAQ;
