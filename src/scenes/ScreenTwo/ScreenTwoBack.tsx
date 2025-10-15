// src/scenes/ScreenTwo/ScreenTwoBack.tsx

import React, { useEffect } from 'react';
import COPY from './copy';
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
    <>
      <LuxuryBackground />
      
      <section className="s2-back-container">
        <Wordmark name="Kinship" href="/" />
        
        <div className="s2-back-content">
          {/* 承诺标题 */}
          <h2 className="s2-back-title">
            {COPY.back.title.split('\n').map((line, i) => (
              <span key={i} className="s2-title-chunk">
                {line}
              </span>
            ))}
          </h2>

          {/* 社会证明主力区块 */}
          <div className="s2-social-main">
            <p className="s2-social-heading">{COPY.back.socialProof.heading}</p>
            
            <div className="s2-company-list">
              <div className="s2-company-row">
                <span className="s2-icon">🏦</span>
                <p className="s2-company-names">{COPY.back.socialProof.companies.finance.join(' · ')}</p>
              </div>
              <div className="s2-company-row">
                <span className="s2-icon">💼</span>
                <p className="s2-company-names">{COPY.back.socialProof.companies.consulting.join(' · ')}</p>
              </div>
              <div className="s2-company-row">
                <span className="s2-icon">🚀</span>
                <p className="s2-company-names">{COPY.back.socialProof.companies.tech.join(' · ')}</p>
              </div>
            </div>

            <div className="s2-social-stats">
              {COPY.back.socialProof.stats.map((stat, idx) => (
                <p key={idx} className="s2-stat-line">
                  {stat.split(/(\d{1,3},?\d{0,3}|\d\.\d\/\d)/).map((part, i) => {
                    if (part.match(/^\d{1,3},?\d{0,3}$/) || part.match(/^\d\.\d\/\d$/)) {
                      return <span key={i} className="s2-highlight">{part}</span>;
                    }
                    return <span key={i}>{part}</span>;
                  })}
                </p>
              ))}
            </div>
          </div>

          {/* 价格锚点 */}
          <div className="s2-price-section">
            <p className="s2-price">{COPY.back.priceAnchor.price}</p>
            <p className="s2-price-heading">{COPY.back.priceAnchor.heading}</p>
            
            <ul className="s2-price-list">
              {COPY.back.priceAnchor.items.map((item, idx) => (
                <li key={idx} className="s2-price-item">
                  <span className="s2-bullet">•</span>
                  <div>
                    <span className="s2-item-main">{item.main} </span>
                    <span className="s2-item-sub">{item.sub}</span>
                  </div>
                </li>
              ))}
            </ul>

            <p className="s2-delivery">{COPY.back.priceAnchor.delivery}</p>
            <p className="s2-ownership">{COPY.back.priceAnchor.ownership}</p>
          </div>

          {/* 安全感确认条 */}
          <div className="s2-assurance">
            <p className="s2-assurance-line">{COPY.back.assurance.line1}</p>
            <p className="s2-assurance-line">{COPY.back.assurance.line2}</p>
          </div>

          {/* 主CTA */}
          <button onClick={onCheckout} className="s2-cta-button">
            {COPY.back.cta.button}
          </button>
          <p className="s2-cta-hint">{COPY.back.cta.microcopy}</p>

          {/* 用户评价 */}
          <div className="s2-testimonials">
            {COPY.back.testimonials.map((item, idx) => (
              <div key={idx} className={`s2-testimonial ${idx > 0 ? 's2-testimonial-divider' : ''}`}>
                <p className="s2-quote">"{item.quote}"</p>
                <p className="s2-author">— {item.author}</p>
              </div>
            ))}
          </div>

          {/* 数据强化行 */}
          <div className="s2-stats-bar">
            <p className="s2-stats-text">
              <span className="s2-highlight">30,000+</span> women who've invested in their positioning clarity
            </p>
            <p className="s2-stats-text">
              Average satisfaction: <span className="s2-highlight">4.8/5</span> ⭐ · <span className="s2-highlight">89%</span> report clearer direction within first read
            </p>
          </div>

          {/* FAQ */}
          <div className="s2-faq">
            <details className="s2-faq-item">
              <summary className="s2-faq-trigger">{COPY.back.faq.trigger}</summary>
              <div className="s2-faq-content">
                {COPY.back.faq.items.map((item, idx) => (
                  <div key={idx} className="s2-faq-qa">
                    <p className="s2-faq-q">{item.q}</p>
                    <div className="s2-faq-a">
                      {item.a.map((para, pIdx) => (
                        para === '' ? <div key={pIdx} className="s2-faq-spacer" /> : <p key={pIdx}>{para}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </details>
          </div>
        </div>
      </section>

      <style>{`
        /* ═══════════════════════════════════════════════════════════════════
           S2 Back - 沿用 ScreenOne 的样式系统
           ═══════════════════════════════════════════════════════════════════ */

        .s2-back-container {
          position: fixed;
          inset: 0;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          box-sizing: border-box;
          overflow-y: auto;
        }

        .s2-back-container::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: rgba(0, 0, 0, 0.12);
          backdrop-filter: blur(1px);
        }

        .s2-back-content {
          position: relative;
          width: 100%;
          max-width: 520px;
          color: #F5F5F0;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          padding: 60px 0 40px;
        }

        /* 标题 */
        .s2-back-title {
          margin: 0 0 32px 0;
          font-size: 32px;
          line-height: 1.25;
          font-weight: 600;
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

        /* 社会证明主力区块 */
        .s2-social-main {
          background: linear-gradient(135deg, rgba(26, 31, 46, 0.7), rgba(30, 36, 50, 0.7));
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 12px;
          padding: 28px 24px;
          margin-bottom: 28px;
          opacity: 0;
          animation: cardIn 360ms cubic-bezier(0.23, 1, 0.32, 1) 460ms forwards;
        }

        .s2-social-heading {
          margin: 0 0 14px 0;
          font-size: 16px;
          font-weight: 500;
          color: #F5F5F0;
          opacity: 0.90;
        }

        .s2-company-list {
          margin-bottom: 14px;
        }

        .s2-company-row {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin-bottom: 10px;
        }

        .s2-icon {
          font-size: 20px;
          flex-shrink: 0;
        }

        .s2-company-names {
          margin: 0;
          font-size: 14px;
          color: #D4AF37;
          line-height: 1.5;
        }

        .s2-social-stats {
          padding-top: 14px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .s2-stat-line {
          margin: 0 0 4px 0;
          font-size: 15px;
          color: #F5F5F0;
          opacity: 0.85;
        }

        .s2-stat-line:last-child {
          margin-bottom: 0;
        }

        /* 价格区块 */
        .s2-price-section {
          margin-bottom: 24px;
          opacity: 0;
          animation: cardIn 360ms cubic-bezier(0.23, 1, 0.32, 1) 640ms forwards;
        }

        .s2-price {
          margin: 0 0 16px 0;
          font-size: 24px;
          font-weight: 700;
          color: #D4AF37;
        }

        .s2-price-heading {
          margin: 0 0 12px 0;
          font-size: 16px;
          font-weight: 600;
          color: #F5F5F0;
          opacity: 0.90;
        }

        .s2-price-list {
          list-style: none;
          margin: 0 0 16px 0;
          padding: 0;
        }

        .s2-price-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
        }

        .s2-bullet {
          color: #D4AF37;
          font-size: 18px;
          flex-shrink: 0;
        }

        .s2-item-main {
          font-size: 15px;
          color: #F5F5F0;
          opacity: 0.90;
          line-height: 1.7;
        }

        .s2-item-sub {
          font-size: 14px;
          color: #9CA3AF;
          opacity: 0.65;
        }

        .s2-delivery,
        .s2-ownership {
          margin: 8px 0 0;
          font-size: 15px;
          color: #F5F5F0;
          opacity: 0.85;
        }

        .s2-ownership {
          color: #9CA3AF;
          opacity: 0.70;
        }

        /* 安全感确认条 */
        .s2-assurance {
          background: rgba(30, 36, 50, 0.6);
          border-radius: 8px;
          padding: 16px 20px;
          margin-bottom: 28px;
          opacity: 0;
          animation: cardIn 360ms cubic-bezier(0.23, 1, 0.32, 1) 820ms forwards;
        }

        .s2-assurance-line {
          margin: 0 0 8px 0;
          font-size: 14px;
          line-height: 1.6;
          color: #9CA3AF;
        }

        .s2-assurance-line:last-child {
          margin-bottom: 0;
          font-weight: 500;
        }

        /* CTA按钮 */
        .s2-cta-button {
          width: 100%;
          height: 56px;
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
          animation: cardIn 360ms cubic-bezier(0.23, 1, 0.32, 1) 1000ms forwards;
        }

        .s2-cta-button:hover {
          background: #E5C047;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(212, 175, 55, 0.4);
        }

        .s2-cta-hint {
          margin: 10px 0 0;
          text-align: center;
          font-size: 13px;
          color: #9CA3AF;
          font-style: italic;
          opacity: 0;
          animation: cardIn 360ms cubic-bezier(0.23, 1, 0.32, 1) 1180ms forwards;
        }

        /* 用户评价 */
        .s2-testimonials {
          background: rgba(26, 31, 46, 0.6);
          border: 1px solid rgba(212, 175, 55, 0.1);
          border-radius: 10px;
          padding: 24px;
          margin: 32px 0 28px;
          opacity: 0;
          animation: cardIn 360ms cubic-bezier(0.23, 1, 0.32, 1) 1360ms forwards;
        }

        .s2-testimonial {
          margin-bottom: 20px;
        }

        .s2-testimonial:last-child {
          margin-bottom: 0;
        }

        .s2-testimonial-divider {
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .s2-quote {
          margin: 0 0 8px 0;
          font-size: 15px;
          line-height: 1.6;
          font-style: italic;
          color: #F5F5F0;
          opacity: 0.90;
        }

        .s2-author {
          margin: 0;
          font-size: 13px;
          color: #9CA3AF;
          opacity: 0.60;
        }

        /* 数据强化行 */
        .s2-stats-bar {
          text-align: center;
          margin-bottom: 24px;
          opacity: 0;
          animation: cardIn 360ms cubic-bezier(0.23, 1, 0.32, 1) 1540ms forwards;
        }

        .s2-stats-text {
          margin: 0 0 4px 0;
          font-size: 14px;
          color: #9CA3AF;
          opacity: 0.75;
        }

        /* FAQ */
        .s2-faq {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 24px;
          opacity: 0;
          animation: cardIn 360ms cubic-bezier(0.23, 1, 0.32, 1) 1720ms forwards;
        }

        .s2-faq-trigger {
          font-size: 15px;
          font-weight: 500;
          color: #9CA3AF;
          opacity: 0.80;
          cursor: pointer;
          list-style: none;
          padding: 12px 0;
        }

        .s2-faq-trigger::-webkit-details-marker {
          display: none;
        }

        .s2-faq-content {
          padding-top: 16px;
        }

        .s2-faq-qa {
          margin-bottom: 20px;
        }

        .s2-faq-q {
          margin: 0 0 12px 0;
          font-size: 15px;
          font-weight: 600;
          color: #F5F5F0;
        }

        .s2-faq-a {
          font-size: 14px;
          line-height: 1.6;
          color: #F5F5F0;
          opacity: 0.80;
        }

        .s2-faq-a p {
          margin: 0 0 8px 0;
        }

        .s2-faq-spacer {
          height: 8px;
        }

        .s2-highlight {
          color: #D4AF37;
          font-weight: 600;
        }

        /* 桌面端 */
        @media (min-width: 769px) {
          .s2-back-title { font-size: 42px; }
          .s2-back-content { max-width: 580px; }
        }

        /* 无障碍 */
        @media (prefers-reduced-motion: reduce) {
          .s2-title-chunk,
          .s2-social-main,
          .s2-price-section,
          .s2-assurance,
          .s2-cta-button,
          .s2-cta-hint,
          .s2-testimonials,
          .s2-stats-bar,
          .s2-faq {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default ScreenTwoBack;