// src/scenes/ScreenTwo/ScreenTwoFront.tsx

import React, { useEffect } from 'react';
import COPY from './copy';
import LuxuryBackground from '../../components/LuxuryBackground';
import Wordmark from '../../components/Wordmark';

interface ScreenTwoFrontProps {
  onContinue: () => void;
}

const ScreenTwoFront: React.FC<ScreenTwoFrontProps> = ({ onContinue }) => {
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('S2A_Loaded', {
        timestamp: new Date().toISOString()
      });
    }

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
      
      <div className="s2-front-wrapper">
        {/* Logo 固定在顶部 */}
        <div className="s2-front-header">
          <Wordmark name="Kinship" href="/" />
        </div>
        
        {/* 可滚动内容区域 */}
        <div className="s2-front-scroll">
          <div className="s2-front-container">
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
        </div>
      </div>

      <style>{`
        /* ═══════════════════════════════════════════════════════════════════
           【修复版】ScreenTwo Front - 完全重构的布局系统
           ═══════════════════════════════════════════════════════════════════ */

        /* 外层包装器（全屏，允许滚动）*/
        .s2-front-wrapper {
          position: fixed;
          inset: 0;
          z-index: 10;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
        }

        /* 顶部Logo区域（固定在顶部）*/
        .s2-front-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(10, 22, 40, 0.95);
          backdrop-filter: blur(8px);
          padding: 20px 24px;
          border-bottom: 1px solid rgba(212, 175, 55, 0.08);
        }

        /* 可滚动内容区域 */
        .s2-front-scroll {
          min-height: calc(100vh - 80px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
        }

        /* 内容容器 */
        .s2-front-container {
          width: 100%;
          max-width: 520px;
          margin: 0 auto;
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
          animation: s2ChunkIn 420ms cubic-bezier(0.23, 1, 0.32, 1) forwards;
        }

        .s2-title-chunk:nth-child(1) { animation-delay: 60ms; }
        .s2-title-chunk:nth-child(2) { animation-delay: 240ms; }

        @keyframes s2ChunkIn {
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
          font-family: Georgia, 'Times New Roman', serif;
          opacity: 0;
          transform: translateY(6px);
          animation: s2SubIn 360ms cubic-bezier(0.23,1,0.32,1) forwards;
        }

        .s2-subtitle-line:nth-child(1) { animation-delay: 560ms; }
        .s2-subtitle-line:nth-child(2) { animation-delay: 700ms; }
        .s2-subtitle-line:nth-child(3) { animation-delay: 840ms; }
        .s2-subtitle-line:last-child { margin-bottom: 0; }

        @keyframes s2SubIn { to { opacity: 0.92; transform: translateY(0); } }

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
          animation: s2CardIn 360ms cubic-bezier(0.23, 1, 0.32, 1) forwards;
        }

        .s2-card:last-child {
          margin-bottom: 0;
        }

        @keyframes s2CardIn { to { opacity: 1; transform: translateY(0); } }

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
          font-family: Georgia, 'Times New Roman', serif;
          opacity: 0.90;
        }

        .s2-card-footer {
          margin: 0;
          font-size: 13px;
          font-style: italic;
          color: #9CA3AF;
          opacity: 0.50;
          font-family: Georgia, 'Times New Roman', serif;
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
          animation: s2CardIn 360ms cubic-bezier(0.23, 1, 0.32, 1) 640ms forwards;
        }

        .s2-social-text {
          margin: 0 0 12px 0;
          font-size: 15px;
          line-height: 1.6;
          color: #F5F5F0;
          font-family: Georgia, 'Times New Roman', serif;
          opacity: 0.85;
        }

        .s2-social-text:last-child {
          margin-bottom: 0;
        }

        .s2-highlight {
          color: #D4AF37;
          font-weight: 600;
        }

        /* CTA按钮 */
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
          animation: s2CardIn 360ms cubic-bezier(0.23, 1, 0.32, 1) 820ms forwards;
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
          font-family: Georgia, 'Times New Roman', serif;
          opacity: 0;
          animation: s2CardIn 360ms cubic-bezier(0.23, 1, 0.32, 1) 1000ms forwards;
        }

        /* 桌面端适配 */
        @media (min-width: 769px) {
          .s2-front-header {
            padding: 24px 32px;
          }

          .s2-front-scroll {
            padding: 60px 32px;
          }

          .s2-front-title { 
            font-size: 42px; 
            line-height: 1.22;
          }

          .s2-subtitle-line { 
            font-size: 18px; 
          }

          .s2-front-container { 
            max-width: 580px; 
          }

          .s2-card-body { 
            font-size: 17px; 
          }
        }

        /* 移动端优化 */
        @media (max-width: 768px) {
          .s2-front-header {
            padding: 16px 20px;
          }

          .s2-front-scroll {
            padding: 32px 20px;
          }

          .s2-front-title {
            font-size: 30px;
          }

          .s2-subtitle-line {
            font-size: 16px;
          }

          .s2-card {
            padding: 20px;
          }

          .s2-social-proof {
            padding: 20px;
          }
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

          .s2-card-body,
          .s2-social-text {
            opacity: 0.90 !important;
          }

          .s2-card-footer {
            opacity: 0.50 !important;
          }
        }
      `}</style>
    </>
  );
};

export default ScreenTwoFront;