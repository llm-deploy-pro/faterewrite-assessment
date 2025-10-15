// src/scenes/ScreenTwo/ScreenTwoFront.tsx

import React, { useEffect, useRef } from 'react';
import COPY from './copy';
import LuxuryBackground from '../../components/LuxuryBackground';
import Wordmark from '../../components/Wordmark';

interface ScreenTwoFrontProps {
  onContinue: () => void;
}

const ScreenTwoFront: React.FC<ScreenTwoFrontProps> = ({ onContinue }) => {
  const containerRef = useRef<HTMLDivElement>(null);

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

  // 🔥 动态计算 scale（方案C核心逻辑）
  useEffect(() => {
    const adjustScale = () => {
      if (!containerRef.current) return;

      const viewportHeight = window.innerHeight;
      const headerHeight = 60; // Logo 区域高度
      const availableHeight = viewportHeight - headerHeight;

      // 内容自然高度（实测值，已包含压缩后的间距）
      const contentHeight = 1100; // 压缩排版后的高度

      // 计算目标 scale
      let targetScale = availableHeight / contentHeight;

      // 限制 scale 范围（确保可读性）
      targetScale = Math.min(0.95, Math.max(0.58, targetScale));

      // 应用 transform
      containerRef.current.style.transform = `scale(${targetScale})`;
      containerRef.current.style.width = `${100 / targetScale}%`;

      console.log('[S2A] 视口:', viewportHeight, '应用scale:', targetScale.toFixed(3));

      // 埋点记录 scale 值
      if (typeof window !== 'undefined' && (window as any).analytics) {
        (window as any).analytics.track('S2A_Scale_Applied', {
          viewportHeight,
          scale: targetScale.toFixed(3),
          device: viewportHeight < 700 ? 'small' : viewportHeight < 850 ? 'medium' : 'large'
        });
      }
    };

    // 首次计算
    const initialTimer = setTimeout(adjustScale, 100);

    // 监听窗口变化
    window.addEventListener('resize', adjustScale);

    return () => {
      clearTimeout(initialTimer);
      window.removeEventListener('resize', adjustScale);
    };
  }, []);

  return (
    <>
      <LuxuryBackground />

      <div className="s2-front-wrapper">
        {/* Logo 固定在顶部 */}
        <div className="s2-front-header">
          <Wordmark name="Kinship" href="/" />
        </div>

        {/* 缩放容器（方案C关键层级）*/}
        <div className="s2-front-scale-wrapper">
          <div ref={containerRef} className="s2-front-scale-container">
            <div className="s2-front-container">
              {/* 主标题 */}
              <h1 className="s2-front-title">
                {COPY.front.title.split('\n').map((line: string, i: number) => (
                  <span key={i} className="s2-title-chunk">
                    {line}
                  </span>
                ))}
              </h1>

              {/* 副标题 */}
              <div className="s2-front-subtitle">
                {COPY.front.subtitle.map((para: string, idx: number) => (
                  <p key={idx} className="s2-subtitle-line">
                    {para}
                  </p>
                ))}
              </div>

              {/* 三个价值线索卡 */}
              <div className="s2-cards-wrapper">
                {COPY.front.valueCards.map(
                  (
                    card: { id: string; title: string; body: string; footer: string },
                    idx: number
                  ) => (
                    <div
                      key={card.id}
                      className="s2-card"
                      style={{ animationDelay: `${100 + idx * 180}ms` }}
                    >
                      <h3 className="s2-card-title">{card.title}</h3>
                      <p className="s2-card-body">{card.body}</p>
                      <p className="s2-card-footer">{card.footer}</p>
                    </div>
                  )
                )}
              </div>

              {/* 社会证明 */}
              <div className="s2-social-proof">
                <p className="s2-social-text">
                  Over <span className="s2-highlight">30,000</span> women have completed their
                  assessment—including executives at <span className="s2-highlight">McKinsey</span>
                  , <span className="s2-highlight">Goldman Sachs</span>,{' '}
                  <span className="s2-highlight">Google</span>, and founders backed by top-tier
                  VCs.
                </p>
                <p className="s2-social-text">
                  <span className="s2-highlight">4,247</span> assessments completed this week
                  alone.
                </p>
              </div>

              {/* CTA按钮 */}
              <button onClick={onContinue} className="s2-cta-button" type="button">
                {COPY.front.cta.button}
              </button>
              <p className="s2-cta-hint">{COPY.front.cta.microcopy}</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* ═══════════════════════════════════════════════════════════════════
           【方案C】ScreenTwo Front - 混合缩放 + 压缩排版（移动端优先）
           ═══════════════════════════════════════════════════════════════════ */

        /* 外层包装器 */
        .s2-front-wrapper {
          position: fixed;
          inset: 0;
          z-index: 10;
          overflow: hidden; /* 🔥 关键：隐藏滚动条 */
          display: flex;
          flex-direction: column;
        }

        /* 顶部Logo区域 */
        .s2-front-header {
          position: relative;
          z-index: 50;
          background: rgba(10, 22, 40, 0.95);
          backdrop-filter: blur(8px);
          padding: 16px 20px;
          border-bottom: 1px solid rgba(212, 175, 55, 0.08);
          flex-shrink: 0;
        }

        /* 缩放容器的外层（居中对齐）*/
        .s2-front-scale-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 20px 0;
        }

        /* 缩放容器（应用 transform: scale）*/
        .s2-front-scale-container {
          transform-origin: top center;
          transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          width: 100%;
          padding: 0 20px;
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

        /* ═══════════════════════════════════════════════════════════════════
           压缩排版（减少 15-20% 的垂直间距）
           ═══════════════════════════════════════════════════════════════════ */

        /* 主标题 */
        .s2-front-title {
          margin: 0 0 24px 0; /* 从 32px 压缩到 24px */
          padding: 0;
          font-size: 32px; /* 从 34px 微降 */
          line-height: 1.22; /* 从 1.25 收紧 */
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
          margin: 0 0 32px 0; /* 从 40px 压缩到 32px */
          padding: 0;
        }

        .s2-subtitle-line {
          margin: 0 0 10px 0; /* 从 12px 压缩到 10px */
          font-size: 16px; /* 从 17px 微降 */
          line-height: 1.6; /* 从 1.72 收紧 */
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
          margin: 0 0 24px 0; /* 从 32px 压缩到 24px */
        }

        /* 单个卡片 */
        .s2-card {
          background: rgba(26, 31, 46, 0.6);
          border: 1px solid rgba(212, 175, 55, 0.15);
          border-radius: 10px;
          padding: 20px; /* 从 24px 压缩到 20px */
          margin-bottom: 12px; /* 从 16px 压缩到 12px */
          opacity: 0;
          transform: translateY(6px);
          animation: s2CardIn 360ms cubic-bezier(0.23, 1, 0.32, 1) forwards;
        }

        .s2-card:last-child { margin-bottom: 0; }

        @keyframes s2CardIn { to { opacity: 1; transform: translateY(0); } }

        .s2-card-title {
          margin: 0 0 10px 0; /* 从 12px 压缩到 10px */
          font-size: 17px; /* 从 18px 微降 */
          font-weight: 600;
          color: #D4AF37;
          font-family: Georgia, 'Times New Roman', serif;
        }

        .s2-card-body {
          margin: 0 0 12px 0; /* 从 16px 压缩到 12px */
          font-size: 14px; /* 从 15px 微降 */
          line-height: 1.5; /* 从 1.6 收紧 */
          color: #F5F5F0;
          font-family: Georgia, 'Times New Roman', serif;
          opacity: 0.90;
        }

        .s2-card-footer {
          margin: 0;
          font-size: 12px; /* 从 13px 微降 */
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
          padding: 20px; /* 从 24px 压缩到 20px */
          margin-bottom: 24px; /* 从 32px 压缩到 24px */
          opacity: 0;
          transform: translateY(6px);
          animation: s2CardIn 360ms cubic-bezier(0.23, 1, 0.32, 1) 640ms forwards;
        }

        .s2-social-text {
          margin: 0 0 10px 0; /* 从 12px 压缩到 10px */
          font-size: 14px; /* 从 15px 微降 */
          line-height: 1.5; /* 从 1.6 收紧 */
          color: #F5F5F0;
          font-family: Georgia, 'Times New Roman', serif;
          opacity: 0.85;
        }

        .s2-social-text:last-child { margin-bottom: 0; }

        .s2-highlight { color: #D4AF37; font-weight: 600; }

        /* CTA按钮 */
        .s2-cta-button {
          width: 100%;
          height: 48px; /* 从 52px 微降 */
          min-height: 44px; /* iOS 最小触达区 */
          background: #D4AF37;
          color: #0A1628;
          font-size: 16px; /* 从 17px 微降 */
          font-weight: 600;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 220ms cubic-bezier(0.23, 1, 0.32, 1);
          font-family: Georgia, 'Times New Roman', serif;
          opacity: 0;
          transform: translateY(6px);
          animation: s2CardIn 360ms cubic-bezier(0.23, 1, 0.32, 1) 820ms forwards;
          touch-action: manipulation;
          position: relative;
          z-index: 100;
        }

        .s2-cta-button:hover {
          background: #E5C047;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
        }

        .s2-cta-button:active { transform: translateY(0); }

        .s2-cta-hint {
          margin: 10px 0 0; /* 从 12px 压缩到 10px */
          text-align: center;
          font-size: 13px; /* 从 14px 微降 */
          color: #9CA3AF;
          font-style: italic;
          font-family: Georgia, 'Times New Roman', serif;
          opacity: 0;
          animation: s2CardIn 360ms cubic-bezier(0.23, 1, 0.32, 1) 1000ms forwards;
        }

        /* ═══════════════════════════════════════════════════════════════════
           移动端优化（<768px）
           ═══════════════════════════════════════════════════════════════════ */
        @media (max-width: 768px) {
          .s2-front-header { padding: 14px 18px; }
          .s2-front-scale-container { padding: 0 18px; }
          .s2-front-title { font-size: 30px; margin-bottom: 20px; }
          .s2-subtitle-line { font-size: 15px; }
          .s2-card { padding: 18px; }
          .s2-social-proof { padding: 18px; }
        }

        /* 极小屏幕（<360px）*/
        @media (max-width: 359px) {
          .s2-front-title { font-size: 28px; }
          .s2-subtitle-line { font-size: 14px; }
          .s2-card-body { font-size: 13px; }
        }

        /* ═══════════════════════════════════════════════════════════════════
           桌面端适配（≥769px）
           ═══════════════════════════════════════════════════════════════════ */
        @media (min-width: 769px) {
          .s2-front-header { padding: 20px 32px; }
          .s2-front-scale-wrapper { padding: 40px 0; }
          .s2-front-scale-container { padding: 0 32px; }
          .s2-front-title { font-size: 38px; margin-bottom: 28px; }
          .s2-subtitle-line { font-size: 17px; }
          .s2-front-container { max-width: 580px; }
          .s2-card-body { font-size: 15px; }
          .s2-cta-button { height: 52px; font-size: 17px; }
        }

        /* ═══════════════════════════════════════════════════════════════════
           极端小屏保护（<700px 高度）
           ═══════════════════════════════════════════════════════════════════ */
        @media (max-height: 700px) {
          .s2-front-scale-container {
            /* 强制最小 scale 0.58，确保可读性 */
            transform: scale(0.58) !important;
            width: 172% !important; /* 1 / 0.58 */
          }

          .s2-front-title { font-size: 28px; margin-bottom: 18px; }
          .s2-cards-wrapper { margin-bottom: 20px; }
          .s2-card { padding: 16px; margin-bottom: 10px; }
          .s2-social-proof { padding: 16px; margin-bottom: 20px; }
        }

        /* ═══════════════════════════════════════════════════════════════════
           无障碍降级
           ═══════════════════════════════════════════════════════════════════ */
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
          .s2-social-text { opacity: 0.90 !important; }

          .s2-card-footer { opacity: 0.50 !important; }

          .s2-front-scale-container { transition: none !important; }
        }

        /* 高对比度模式 */
        @media (prefers-contrast: more) {
          .s2-card,
          .s2-social-proof { border-color: rgba(212, 175, 55, 0.3); }
        }
      `}</style>
    </>
  );
};

export default ScreenTwoFront;
