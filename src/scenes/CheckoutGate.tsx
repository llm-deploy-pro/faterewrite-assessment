// src/scenes/CheckoutGate.tsx
// 🚀 快速修复版本 - 移除 VacheronBackground 依赖

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ═══════════════════════════════════════════════════════
// 💰 Configuration
// ═══════════════════════════════════════════════════════
const DEPOSIT_AMOUNT = '$47';
const AUTO_REDIRECT_SECONDS = 4;
const PAYMENT_ROUTE = '/screen-2'; // 🎯 改成你真正的支付页面路由

const CheckoutGate: React.FC = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(AUTO_REDIRECT_SECONDS);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // 页面加载时的日志
  useEffect(() => {
    console.log('✅ CheckoutGate 已加载');
  }, []);

  // Auto-redirect countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleRedirect();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleRedirect = () => {
    console.log('🚀 准备跳转到:', PAYMENT_ROUTE);
    setIsRedirecting(true);
    setTimeout(() => {
      navigate(PAYMENT_ROUTE);
    }, 300);
  };

  return (
    <>
      <style>{`
        :root {
          --color-titanium: #FFFFFF;
          --color-platinum: #F8FAFC;
          --color-pearl: #E2E8F0;
          --color-mist: #CBD5E1;
          --color-slate: #64748B;
          
          --gold-dark: #D4AF37;
          --gold-medium: #F4D03F;
          --gold-bright: #FFE55C;
          --gold-glow: rgba(244, 208, 63, 0.4);
          
          --success: #10B981;
          --success-glow: rgba(16, 185, 129, 0.3);
          --success-dark: #059669;
          
          --font-display: "Neue Montreal", "Inter", -apple-system, sans-serif;
          --font-body: "Inter", -apple-system, sans-serif;
          --font-mono: "JetBrains Mono", "SF Mono", monospace;
        }

        /* 🎨 简单的背景 - 不依赖外部组件 */
        .checkout-gate-wrapper {
          min-height: 100vh;
          background: linear-gradient(180deg, #0F172A 0%, #1E293B 50%, #0F172A 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          position: relative;
        }

        /* 添加一些微妙的渐变效果 */
        .checkout-gate-wrapper::before {
          content: '';
          position: fixed;
          inset: 0;
          background: 
            radial-gradient(circle at 35% 25%, rgba(16,185,129,0.08) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(244,208,63,0.06) 0%, transparent 50%);
          pointer-events: none;
        }

        .transition-container {
          width: 100%;
          max-width: 640px;
          background: linear-gradient(135deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.98) 100%);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 36px 24px 32px;
          box-shadow: 
            0 20px 60px rgba(0,0,0,0.6),
            0 0 0 1px rgba(255,255,255,0.02),
            inset 0 1px 0 rgba(255,255,255,0.03);
          position: relative;
          z-index: 1;
          animation: container-fade-in 0.6s ease-out;
        }

        @keyframes container-fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .success-icon-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 24px;
          animation: icon-fade 0.5s ease-out 0.2s both;
        }

        @keyframes icon-fade {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .success-icon {
          width: 68px;
          height: 68px;
          background: linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0.08) 100%);
          border: 2px solid rgba(16,185,129,0.35);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 38px;
          animation: success-pop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.3s both;
          box-shadow: 
            0 0 40px var(--success-glow),
            0 8px 32px rgba(0,0,0,0.4);
        }

        @keyframes success-pop {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          60% {
            transform: scale(1.15);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .main-heading {
          font-family: var(--font-display);
          font-size: 22px;
          font-weight: 700;
          color: var(--color-titanium);
          text-align: center;
          line-height: 1.2;
          margin-bottom: 16px;
          letter-spacing: -0.015em;
          animation: content-fade-up 0.5s ease-out 0.4s both;
        }

        @keyframes content-fade-up {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .checkmark-emoji {
          color: var(--success);
          filter: drop-shadow(0 0 8px var(--success-glow));
        }

        .subtitle {
          font-size: 15px;
          font-weight: 500;
          color: var(--color-pearl);
          text-align: center;
          line-height: 1.55;
          margin-bottom: 28px;
          padding: 0 8px;
          animation: content-fade-up 0.5s ease-out 0.5s both;
        }

        .deposit-highlight {
          color: var(--gold-bright);
          font-weight: 600;
          white-space: nowrap;
        }

        .credit-emphasis {
          background: linear-gradient(135deg, var(--gold-medium) 0%, var(--gold-bright) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
        }

        .explanation-sections {
          margin-bottom: 28px;
        }

        .explanation-section {
          margin-bottom: 20px;
          animation: content-fade-up 0.5s ease-out both;
        }

        .explanation-section:nth-child(1) { animation-delay: 0.6s; }
        .explanation-section:nth-child(2) { animation-delay: 0.66s; }
        .explanation-section:nth-child(3) { animation-delay: 0.72s; }

        .section-label {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-mist);
          margin-bottom: 6px;
          opacity: 0.8;
        }

        .section-content {
          font-size: 14px;
          line-height: 1.65;
          color: var(--color-pearl);
        }

        .section-content strong {
          color: var(--color-titanium);
          font-weight: 600;
        }

        .guarantee-section .section-label {
          color: var(--success);
        }

        .key-points {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 28px;
          animation: content-fade-up 0.5s ease-out 0.78s both;
        }

        .point-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: all 0.3s ease;
        }

        .point-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .point-item:hover {
          transform: translateX(2px);
        }

        .point-icon {
          font-size: 18px;
          flex-shrink: 0;
          margin-top: 2px;
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
        }

        .point-text {
          font-size: 14px;
          font-weight: 500;
          color: var(--color-pearl);
          line-height: 1.5;
        }

        .point-text strong {
          color: var(--color-titanium);
          font-weight: 600;
        }

        .cta-button {
          width: 100%;
          padding: 16px 28px;
          background: linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(20,30,48,1) 50%, rgba(15,23,42,0.98) 100%);
          border: 2px solid rgba(244,208,63,0.5);
          border-radius: 14px;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.02em;
          color: var(--color-titanium);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: all 0.4s ease;
          box-shadow: 
            0 0 30px rgba(244,208,63,0.25),
            0 8px 24px rgba(0,0,0,0.7);
          margin-bottom: 20px;
          animation: content-fade-up 0.5s ease-out 0.84s both;
        }

        .cta-button:hover:not(:disabled) {
          transform: translateY(-2px);
          border-color: rgba(244,208,63,0.7);
          box-shadow: 
            0 0 40px rgba(244,208,63,0.35),
            0 12px 40px rgba(0,0,0,0.8);
        }

        .cta-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .cta-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .button-arrow {
          color: var(--gold-bright);
          font-size: 20px;
          transition: transform 0.3s ease;
        }

        .cta-button:hover:not(:disabled) .button-arrow {
          transform: translateX(4px);
        }

        .redirect-notice {
          text-align: center;
          font-size: 12px;
          color: var(--color-slate);
          line-height: 1.6;
          animation: content-fade-up 0.5s ease-out 0.9s both;
        }

        .redirect-main {
          margin-bottom: 4px;
        }

        .redirect-fallback {
          font-size: 11px;
          opacity: 0.7;
        }

        .countdown-number {
          font-family: var(--font-mono);
          font-weight: 700;
          color: var(--gold-bright);
          font-size: 14px;
          display: inline-block;
          animation: countdown-pulse 1s ease-in-out infinite;
        }

        @keyframes countdown-pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }

        .loading-dots::after {
          content: '.';
          animation: loading-dots-anim 1.5s steps(4, end) infinite;
        }

        @keyframes loading-dots-anim {
          0%, 25% { content: '.'; }
          50% { content: '..'; }
          75%, 100% { content: '...'; }
        }

        /* 响应式 */
        @media (min-width: 640px) {
          .checkout-gate-wrapper {
            padding: 36px 24px;
          }
          .transition-container {
            padding: 48px 36px 44px;
            border-radius: 20px;
          }
          .success-icon {
            width: 76px;
            height: 76px;
            font-size: 42px;
          }
          .main-heading {
            font-size: 26px;
          }
          .subtitle {
            font-size: 17px;
          }
        }

        @media (min-width: 768px) {
          .transition-container {
            padding: 56px 40px 48px;
          }
          .success-icon {
            width: 80px;
            height: 80px;
            font-size: 44px;
          }
          .main-heading {
            font-size: 30px;
          }
          .subtitle {
            font-size: 18px;
          }
        }
      `}</style>

      <div className="checkout-gate-wrapper">
        <div className="transition-container">
          
          {/* Success Icon */}
          <div className="success-icon-wrapper">
            <div className="success-icon">✓</div>
          </div>

          {/* Main Heading */}
          <h1 className="main-heading">
            <span className="checkmark-emoji">✅</span> Application Confirmed—Your City Has Availability
          </h1>

          {/* Subtitle */}
          <p className="subtitle">
            Next step: Secure your spot with a{' '}
            <span className="deposit-highlight">{DEPOSIT_AMOUNT} deposit</span>—<span className="credit-emphasis">100% credited</span> when you meet. Not extra money, just holding your booking.
          </p>

          {/* Explanation Sections */}
          <div className="explanation-sections">
            
            <div className="explanation-section">
              <div className="section-label">Why the deposit?</div>
              <div className="section-content">
                We coordinate real meetups, not browsing sessions. The {DEPOSIT_AMOUNT} confirms you're actually showing up—it keeps this week's availability reserved for you.
              </div>
            </div>

            <div className="explanation-section">
              <div className="section-label">What happens next:</div>
              <div className="section-content">
                Within 2 hours, our concierge contacts you with 2–3 real profiles available in your city this week—using the preferences you just submitted.
              </div>
            </div>

            <div className="explanation-section guarantee-section">
              <div className="section-label">The guarantee:</div>
              <div className="section-content">
                Can't arrange someone within 7 days? Not satisfied with the service? <strong>{DEPOSIT_AMOUNT} refunded</strong>—no forms, no questions, no penalty.
              </div>
            </div>

          </div>

          {/* Key Points */}
          <div className="key-points">
            <div className="point-item">
              <span className="point-icon">⏰</span>
              <span className="point-text">
                <strong>This week's slots are limited</strong>—first paid, first booked
              </span>
            </div>
            <div className="point-item">
              <span className="point-icon">🚫</span>
              <span className="point-text">
                <strong>NOT a subscription</strong>—one payment, no recurring charges
              </span>
            </div>
            <div className="point-item">
              <span className="point-icon">💳</span>
              <span className="point-text">
                Your {DEPOSIT_AMOUNT} <strong>becomes credit</strong> toward your final arrangement
              </span>
            </div>
          </div>

          {/* CTA Button */}
          <button 
            className="cta-button"
            onClick={handleRedirect}
            disabled={isRedirecting}
          >
            <span>Secure My Spot</span>
            <span className="button-arrow">→</span>
          </button>

          {/* Redirect Notice */}
          <div className="redirect-notice">
            {countdown > 0 ? (
              <>
                <div className="redirect-main">
                  Redirecting to secure payment in{' '}
                  <span className="countdown-number">{countdown}</span>{' '}
                  seconds<span className="loading-dots"></span>
                </div>
                <div className="redirect-fallback">
                  Page not loading? Click the button above.
                </div>
              </>
            ) : (
              <div className="redirect-main">
                Redirecting now<span className="loading-dots"></span>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default CheckoutGate;