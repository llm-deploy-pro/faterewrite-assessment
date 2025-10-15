// src/scenes/ScreenTwo/ScreenTwoFront.tsx

import React, { useEffect } from 'react';
import COPY from './copy';
import ValueClueCard from './components/ValueClueCard';
import SocialProof from './components/SocialProof';
import LuxuryBackground from '../../components/LuxuryBackground';
import Wordmark from '../../components/Wordmark';

interface ScreenTwoFrontProps {
  onContinue: () => void;
}

const ScreenTwoFront: React.FC<ScreenTwoFrontProps> = ({ onContinue }) => {
  useEffect(() => {
    // 埋点：S2A页面加载
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('S2A_Loaded', {
        timestamp: new Date().toISOString()
      });
    }

    // 埋点：S2A停留3秒
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && (window as any).analytics) {
        (window as any).analytics.track('S2A_Engaged_3s', {
          timestamp: new Date().toISOString()
        });
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <LuxuryBackground />
      
      <section className="s2-front-container">
        <Wordmark name="Kinship" href="/" />
        
        <div className="s2-front-content">
          {/* 主标题 */}
          <h1 className="s2-front-title">
            {COPY.front.title.split('\n').map((line, i) => (
              <span key={i} className="s2-title-chunk">
                {line}
              </span>
            ))}
          </h1>

          {/* 副标题 */}
          <div className="s2-front-subtitle">
            {COPY.front.subtitle.map((para, idx) => (
              <p key={idx} className="s2-subtitle-line">
                {para}
              </p>
            ))}
          </div>

          {/* 三个价值线索卡 */}
          <div className="s2-cards-wrapper">
            {COPY.front.valueCards.map((card, idx) => (
              <div key={card.id} className="s2-card" style={{ animationDelay: `${100 + idx * 180}ms` }}>
                <h3 className="s2-card-title">{card.title}</h3>
                <p className="s2-card-body">{card.body}</p>
                <p className="s2-card-footer">{card.footer}</p>
              </div>
            ))}
          </div>

          {/* 社会证明 */}
          <div className="s2-social-proof">
            <p className="s2-social-text">
              Over <span className="s2-highlight">30,000</span> women have completed their assessment—including executives at{' '}
              <span className="s2-highlight">McKinsey</span>,{' '}
              <span className="s2-highlight">Goldman Sachs</span>,{' '}
              <span className="s2-highlight">Google</span>, and founders backed by top-tier VCs.
            </p>
            <p className="s2-social-text">
              <span className="s2-highlight">4,247</span> assessments completed this week alone.
            </p>
          </div>

          {/* CTA按钮 */}
          <button onClick={onContinue} className="s2-cta-button">
            {COPY.front.cta.button}
          </button>
          <p className="s2-cta-hint">{COPY.front.cta.microcopy}</p>
        </div>
      </section>

      <style>{`
        /* ═══════════════════════════════════════════════════════════════════
           S2 Front - 沿用 ScreenOne 的样式系统
           ═══════════════════════════════════════════════════════════════════ */

        .s2-front-container {
          position: fixed;
          inset: 0;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          box-sizing: border-box;
        }

        .s2-front-content {
          position: relative;
          width: 100%;
          max-width: 520px;
          color: #F5F5F0;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }

        /* 主标题 */
        .s2-front-title {
          margin: 0 0 32px 0;
          padding: 0;
          font-size: 34px;
          line-height: 1.25;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: #F5F5F0;
          font-family: Georgia, 'Times New Roman', serif;
        }

        .s2-title-chunk {
          display: block;
          opacity: 0;
          transform: translateY(8px);
          animation: chunkIn 420ms cubic-bezier(0.23, 1, 0.32, 1) forwards;
        }

        .s2-title-chunk:nth-child(1) { animation-delay: 60ms; }
        .s2-title-chunk:nth-child(2) { animation-delay: 240ms; }

        @keyframes chunkIn {
          to { opacity: 1; transform: translateY(0); }
        }

        /* 副标题 */
        .s2-front-subtitle {
          margin: 0 0 40px 0;
          padding: 0;
        }

        .s2-subtitle-line {
          margin: 0 0 12px 0;
          font-size: 17px;
          line-height: 1.72;
          color: #F5F5F0;
          font-weight: 400;
          opacity: 0;
          transform: translateY(6px);
          animation: subIn 360ms cubic-bezier(0.23,1,0.32,1) forwards;
        }

        .s2-subtitle-line:nth-child(1) { animation-delay: 560ms; }
        .s2-subtitle-line:nth-child(2) { animation-delay: 700ms; }
        .s2-subtitle-line:nth-child(3) { animation-delay: 840ms; }

        @keyframes subIn { to { opacity: 0.92; transform: translateY(0); } }

        /* 价值卡片容器 */
        .s2-cards-wrapper {
          margin: 0 0 32px 0;
        }

        /* 单个卡片 */
        .s2-card {
          background: rgba(26, 31, 46, 0.6);
          border: 1px solid rgba(212, 175, 55, 0.15);
          border-radius: 10px;
          padding: 24px;
          margin-bottom: 16px;
          opacity: 0;
          transform: translateY(6px);
          animation: cardIn 360ms cubic-bezier(0.23, 1, 0.32, 1) forwards;
        }

        @keyframes cardIn { to { opacity: 1; transform: translateY(0); } }

        .s2-card-title {
          margin: 0 0 12px 0;
          font-size: 18px;
          font-weight: 600;
          color: #D4AF37;
          font-family: Georgia, 'Times New Roman', serif;
        }

        .s2-card-body {
          margin: 0 0 16px 0;
          font-size: 15px;
          line-height: 1.6;
          color: #F5F5F0;
          opacity: 0.90;
        }

        .s2-card-footer {
          margin: 0;
          font-size: 13px;
          font-style: italic;
          color: #9CA3AF;
          opacity: 0.50;
        }

        /* 社会证明 */
        .s2-social-proof {
          background: rgba(26, 31, 46, 0.6);
          border: 1px solid rgba(212, 175, 55, 0.15);
          border-radius: 10px;
          padding: 24px;
          margin-bottom: 32px;
          opacity: 0;
          transform: translateY(6px);
          animation: cardIn 360ms cubic-bezier(0.23, 1, 0.32, 1) 640ms forwards;
        }

        .s2-social-text {
          margin: 0 0 12px 0;
          font-size: 15px;
          line-height: 1.6;
          color: #F5F5F0;
          opacity: 0.85;
        }

        .s2-social-text:last-child {
          margin-bottom: 0;
        }

        .s2-highlight {
          color: #D4AF37;
          font-weight: 600;
        }

        /* CTA按钮（沿用ScreenOne的样式）*/
        .s2-cta-button {
          width: 100%;
          height: 52px;
          background: #D4AF37;
          color: #0A1628;
          font-size: 17px;
          font-weight: 600;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 220ms cubic-bezier(0.23, 1, 0.32, 1);
          font-family: Georgia, 'Times New Roman', serif;
          opacity: 0;
          transform: translateY(6px);
          animation: cardIn 360ms cubic-bezier(0.23, 1, 0.32, 1) 820ms forwards;
        }

        .s2-cta-button:hover {
          background: #E5C047;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
        }

        .s2-cta-button:active {
          transform: translateY(0);
        }

        .s2-cta-hint {
          margin: 12px 0 0;
          text-align: center;
          font-size: 14px;
          color: #9CA3AF;
          font-style: italic;
          opacity: 0;
          animation: cardIn 360ms cubic-bezier(0.23, 1, 0.32, 1) 1000ms forwards;
        }

        /* 桌面端适配 */
        @media (min-width: 769px) {
          .s2-front-title { font-size: 42px; }
          .s2-front-subtitle { font-size: 18px; }
          .s2-front-content { max-width: 580px; }
          .s2-card-body { font-size: 17px; }
        }

        /* 无障碍降级 */
        @media (prefers-reduced-motion: reduce) {
          .s2-title-chunk,
          .s2-subtitle-line,
          .s2-card,
          .s2-social-proof,
          .s2-cta-button,
          .s2-cta-hint {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default ScreenTwoFront;