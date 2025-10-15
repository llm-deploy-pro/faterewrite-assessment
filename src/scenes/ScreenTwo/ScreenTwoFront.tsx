// src/scenes/ScreenTwo/ScreenTwoBack.tsx

import React, { useEffect } from 'react';
import COPY from './copy';
import SocialProof from './components/SocialProof';
import PriceAnchor from './components/PriceAnchor';
import FAQ from './components/FAQ';
import LuxuryBackground from '../../components/LuxuryBackground';
import Wordmark from '../../components/Wordmark';

interface ScreenTwoBackProps {
  onCheckout: () => void;
}

const ScreenTwoBack: React.FC<ScreenTwoBackProps> = ({ onCheckout }) => {
  useEffect(() => {
    // 埋点：S2B页面加载
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('S2B_Loaded', {
        timestamp: new Date().toISOString()
      });
    }

    // 埋点：S2B停留3秒
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && (window as any).analytics) {
        (window as any).analytics.track('S2B_Engaged_3s', {
          timestamp: new Date().toISOString()
        });
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* 背景层 */}
      <LuxuryBackground />
      
      {/* 内容层 */}
      <div className="relative z-10 w-full max-w-[375px] mx-auto px-6 pb-10">
        {/* 顶部定位条 */}
        <header className="sticky top-0 z-50 bg-[#0A1628]/95 backdrop-blur-sm py-4 mb-8 -mx-6 px-6">
          <Wordmark />
        </header>

        {/* 承诺标题 */}
        <h2 className="text-white text-[32px] font-semibold leading-[1.25] mb-7">
          {COPY.back.title.split('\n').map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < COPY.back.title.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
        </h2>

        {/* 社会证明主力区块 */}
        <SocialProof
          heading={COPY.back.socialProof.heading}
          companies={COPY.back.socialProof.companies}
          stats={COPY.back.socialProof.stats}
          variant="back"
        />

        {/* 价格锚点 */}
        <PriceAnchor {...COPY.back.priceAnchor} />

        {/* 安全感确认条 */}
        <div className="bg-[#1E2432] rounded-lg px-5 py-4 mb-7">
          <p className="text-[#9CA3AF] text-sm leading-[1.6] mb-2">
            {COPY.back.assurance.line1}
          </p>
          <p className="text-[#9CA3AF] text-sm font-medium">
            {COPY.back.assurance.line2}
          </p>
        </div>

        {/* 主CTA */}
        <div className="mb-8">
          <button
            onClick={onCheckout}
            className="w-full h-14 bg-[#D4AF37] text-[#0A1628] text-[17px] font-semibold rounded-[10px] hover:bg-[#E5C047] transition-all hover:shadow-lg"
          >
            {COPY.back.cta.button}
          </button>
          <p className="text-[#9CA3AF] text-[13px] text-center mt-2.5">
            {COPY.back.cta.microcopy}
          </p>
        </div>

        {/* 用户评价区块 */}
        <div className="bg-[#1A1F2E] border border-[#D4AF37]/10 rounded-lg p-6 mb-7">
          {COPY.back.testimonials.map((item, idx) => (
            <div key={idx} className={idx > 0 ? 'mt-5 pt-5 border-t border-white/5' : ''}>
              <p className="text-white/90 text-[15px] leading-[1.6] italic mb-2">
                "{item.quote}"
              </p>
              <p className="text-[#9CA3AF]/60 text-[13px]">
                — {item.author}
              </p>
            </div>
          ))}
        </div>

        {/* 数据强化行 */}
        <div className="text-center mb-6">
          <p className="text-[#9CA3AF]/75 text-sm leading-[1.5]">
            <span className="text-[#D4AF37]">30,000+</span> women who've invested in their positioning clarity
          </p>
          <p className="text-[#9CA3AF]/75 text-sm mt-1">
            Average satisfaction: <span className="text-[#D4AF37]">4.8/5</span> ⭐ · <span className="text-[#D4AF37]">89%</span> report clearer direction within first read
          </p>
        </div>

        {/* FAQ */}
        <FAQ items={COPY.back.faq.items} trigger={COPY.back.faq.trigger} />
      </div>
    </div>
  );
};

export default ScreenTwoBack;