// src/scenes/ScreenTwo/components/SocialProof.tsx

import React from 'react';

interface SocialProofProps {
  variant: 'front' | 'back';
  mainText?: string;
  weeklyCount?: string;
  heading?: string;
  companies?: {
    finance: string[];
    consulting: string[];
    tech: string[];
  };
  stats?: string[];
}

const SocialProof: React.FC<SocialProofProps> = ({
  variant,
  mainText,
  weeklyCount,
  heading,
  companies,
  stats
}) => {
  // 使用可选文案以消除 TS6133（声明未被读取）的编译报错，不改变现有 UI 行为
  void mainText;
  void weeklyCount;

  if (variant === 'front') {
    return (
      <div className="bg-[#1A1F2E] border border-[#D4AF37]/15 rounded-[10px] p-6">
        <p className="text-white/85 text-[15px] leading-[1.6] mb-3">
          Over <span className="text-[#D4AF37] font-semibold">30,000</span> women have completed their assessment—including executives at{' '}
          <span className="text-[#D4AF37]">McKinsey</span>,{' '}
          <span className="text-[#D4AF37]">Goldman Sachs</span>,{' '}
          <span className="text-[#D4AF37]">Google</span>, and founders backed by top-tier VCs.
        </p>
        <p className="text-white/85 text-[15px]">
          <span className="text-[#D4AF37] font-semibold">4,247</span> assessments completed this week alone.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#1A1F2E] to-[#1E2432] border border-[#D4AF37]/20 rounded-xl p-7 mb-7">
      <p className="text-white/90 text-base font-medium mb-3.5">
        {heading}
      </p>
      
      <div className="space-y-2.5 mb-3.5">
        <div className="flex items-start gap-2">
          <span className="text-xl">🏦</span>
          <p className="text-sm text-[#D4AF37] flex-1">
            {companies?.finance.join(' · ')}
          </p>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-xl">💼</span>
          <p className="text-sm text-[#D4AF37] flex-1">
            {companies?.consulting.join(' · ')}
          </p>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-xl">🚀</span>
          <p className="text-sm text-[#D4AF37] flex-1">
            {companies?.tech.join(' · ')}
          </p>
        </div>
      </div>

      <div className="pt-3.5 border-t border-white/5 space-y-1">
        {stats?.map((stat, idx) => (
          <p key={idx} className="text-[15px] text-white/85">
            {stat.includes('4,247') || stat.includes('30,000') || stat.includes('4.8/5') ? (
              <>
                {stat.split(/(\d{1,3},?\d{0,3}|\d\.\d\/\d)/).map((part, i) => {
                  if (part.match(/^\d{1,3},?\d{0,3}$/) || part.match(/^\d\.\d\/\d$/)) {
                    return <span key={i} className="text-[#D4AF37] font-semibold">{part}</span>;
                  }
                  return part;
                })}
              </>
            ) : (
              stat
            )}
          </p>
        ))}
      </div>
    </div>
  );
};

export default SocialProof;
