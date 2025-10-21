// src/scenes/ScreenTwo/ScreenTwoBack.tsx

import React, { useEffect } from 'react';
import { SCREEN_TWO_COPY as COPY } from './copy';
import LuxuryBackground from '../../components/LuxuryBackground';
import Wordmark from '../../components/Wordmark';

interface ScreenTwoBackProps {
  onCheckout?: () => void;
}

/* ===================== 跨子域去重工具（保持不变） ===================== */
function getCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const list = (document.cookie || '').split('; ');
  for (const item of list) {
    const eq = item.indexOf('=');
    if (eq === -1) continue;
    const k = decodeURIComponent(item.slice(0, eq));
    const v = decodeURIComponent(item.slice( eq + 1));
    if (k === name) return v;
  }
  return '';
}

function setRootCookie(name: string, value: string, days: number) {
  try {
    const exp = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
      value
    )}; path=/; domain=.faterewrite.com; expires=${exp}; SameSite=Lax`;
    if ((document.cookie || '').indexOf(`${encodeURIComponent(name)}=`) === -1) {
      document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
        value
      )}; path=/; expires=${exp}; SameSite=Lax`;
    }
  } catch {}
}

function markOnce(key: string, devMode: boolean = false): boolean {
  if (
    devMode &&
    typeof window !== 'undefined' &&
    window.location.hostname === 'localhost'
  ) {
    console.log(`[DEV] 事件 ${key} 触发（开发模式不去重）`);
    return true;
  }
  const name = 'frd_s2_dedupe';
  const raw = getCookie(name);
  const set = new Set(raw ? raw.split(',') : []);
  if (set.has(key)) {
    console.log(`[去重] 事件 ${key} 已触发过，跳过`);
    return false;
  }
  set.add(key);
  setRootCookie(name, Array.from(set).join(','), 30);
  console.log(`[打点] 事件 ${key} 首次触发 ✓`);
  return true;
}

function ensureFrid() {
  const win: any = window as any;
  let frid = win.__frid || getCookie('frd_uid');
  if (!frid) {
    frid = 'fr_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    setRootCookie('frd_uid', frid, 30);
  }
  if (!win.__frid) win.__frid = frid;
  return frid;
}

const genEventId = () =>
  'ev_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const getPageMeta = () => ({
  page_url: typeof window !== 'undefined' ? window.location.href : '',
  referrer: typeof document !== 'undefined' ? document.referrer : ''
});

const safeFbq = (...args: any[]) => {
  try {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq(...args);
    }
  } catch (err) {
    console.warn('[FBQ] 调用异常', err);
  }
};
/* ============================================================================= */

const ScreenTwoBack: React.FC<ScreenTwoBackProps> = ({ onCheckout }) => {
  const isDev =
    typeof window !== 'undefined' && window.location.hostname === 'localhost';

  useEffect(() => {
    // 埋点：S2B页面加载
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('S2B_Loaded', {
        timestamp: new Date().toISOString(),
      });
    }

    // FB像素：S2 Back Loaded
    try {
      const frid = ensureFrid();
      if (typeof window !== 'undefined' && (window as any).fbq) {
        if (markOnce('s2b_load', isDev)) {
          const eventId = genEventId();
          const { page_url, referrer } = getPageMeta();
          safeFbq(
            'trackCustom',
            'S2_Back_Loaded',
            {
              content_name: 'Tonight_Map_Landing',
              content_category: 'Assessment_Landing',
              screen_position: 'single',
              page_url,
              referrer,
              frid: frid
            },
            { eventID: eventId }
          );
          console.log('[FB打点] S2_Back_Loaded 触发成功', { frid, eventId });
        }
      }
    } catch (err) {
      console.warn('[FB打点] S2_Back_Loaded 调用异常', err);
    }

    // 埋点：S2B停留3秒
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && (window as any).analytics) {
        (window as any).analytics.track('S2B_Engaged_3s', {
          timestamp: new Date().toISOString(),
        });
      }

      // FB像素：S2 Back 3s Engaged
      try {
        if (typeof window !== 'undefined' && (window as any).fbq) {
          if (markOnce('s2b_e3', isDev)) {
            const frid = ensureFrid();
            const eventId = genEventId();
            const { page_url, referrer } = getPageMeta();
            safeFbq(
              'trackCustom',
              'S2_Back_Engaged_3s',
              {
                content_name: 'Tonight_Map_Landing',
                content_category: 'Assessment_Landing',
                engagement_type: 'view_3s',
                screen_position: 'single',
                page_url,
                referrer,
                frid: frid
              },
              { eventID: eventId }
            );
            console.log('[FB打点] S2_Back_Engaged_3s 触发成功', { frid, eventId });
          }
        }
      } catch (err) {
        console.warn('[FB打点] S2_Back_Engaged_3s 调用异常', err);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isDev]);

  const readFbParams = () => {
    const fbp = getCookie('_fbp');
    const fbc = getCookie('_fbc');
    return { fbp, fbc };
  };

  const handleBackCtaClick = () => {
    try {
      if (typeof window !== 'undefined' && (window as any).fbq) {
        if (markOnce('s2b_cc', isDev)) {
          const frid = ensureFrid();
          const eventId = genEventId();
          const { page_url, referrer } = getPageMeta();
          safeFbq(
            'trackCustom',
            'S2_Back_CTA_Click',
            {
              content_name: 'Tonight_Map_CTA',
              content_category: 'Assessment_Landing',
              value: 49,
              currency: 'USD',
              screen_position: 'single',
              page_url,
              referrer,
              frid: frid
            },
            { eventID: eventId }
          );
          console.log('[FB打点] S2_Back_CTA_Click 触发成功', { frid, eventId });
        }
      }
    } catch (err) {
      console.warn('[FB打点] S2_Back_CTA_Click 调用异常', err);
    }

    if (onCheckout) {
      onCheckout();
    }

    // 跳转至支付域名
    try {
      const dest = new URL('https://pay.faterewrite.com/');
      const { fbp, fbc } = readFbParams();
      const frid = ensureFrid();

      if (fbp) dest.searchParams.set('fbp', fbp);
      if (fbc) dest.searchParams.set('fbc', fbc);
      if (frid) dest.searchParams.set('frid', frid);

      if (typeof window !== 'undefined') {
        const cur = new URLSearchParams(window.location.search);
        const keep = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','fbclid'];
        keep.forEach(k => {
          const v = cur.get(k);
          if (v) dest.searchParams.set(k, v);
        });
      }

      window.location.assign(dest.toString());
    } catch (err) {
      console.warn('[导航] 跳转 secure.faterewrite.com 失败', err);
    }
  };

  return (
    <>
      <LuxuryBackground />

      <div className="s2-single-wrapper">
        <div className="s2-single-header">
          <Wordmark name="PRIME WINDOW" href="/" />
        </div>

        <div className="s2-single-content">
          
          {/* Headline */}
          <div className="s2-headline-section">
            <h1 className="s2-headline-main">
              {COPY.back.headline.main}
            </h1>
            <p className="s2-headline-sub">
              {COPY.back.headline.sub}
            </p>
          </div>

          {/* Testimonial */}
          <div className="s2-testimonial-section">
            <blockquote className="s2-testimonial-quote">
              "{COPY.back.testimonial.quote}"
            </blockquote>
            <p className="s2-testimonial-author">
              — {COPY.back.testimonial.author}
            </p>
          </div>

          {/* Value List */}
          <div className="s2-value-section">
            <ul className="s2-value-list">
              {COPY.back.valueList.map((item: string, idx: number) => (
                <li key={idx} className="s2-value-item">
                  <span className="s2-value-bullet">✓</span>
                  <span className="s2-value-text">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="s2-cta-section">
            <button 
              onClick={handleBackCtaClick} 
              className="s2-cta-button" 
              type="button"
              aria-label={COPY.back.cta.button}
            >
              <span className="s2-cta-text">{COPY.back.cta.button}</span>
            </button>
            <p className="s2-cta-microcopy">
              {COPY.back.cta.microcopy}
            </p>
          </div>

          {/* Footer */}
          <div className="s2-footer-section">
            <p className="s2-footer-text">
              {""}
            </p>
          </div>

        </div>
      </div>

      <style>{`
        /* ═══════════════════════════════════════════════════════════════════
           Tonight's Map - 10分完美版
           6个毫米级优化 + 视觉分组A方案
           ═══════════════════════════════════════════════════════════════════ */
        
        :root {
          --spacing-unit: 16px;
        }

        /* 🎯 优化5：高度适配优化 */
        @media (max-height: 750px) {
          :root { --spacing-unit: 14px; }
        }

        @media (max-height: 700px) {
          :root { --spacing-unit: 13px; } /* 从12px微调到13px */
        }

        @media (max-height: 680px) {
          :root { --spacing-unit: 12px; }
        }

        @media (max-height: 620px) {
          :root { --spacing-unit: 10px; }
        }

        :root {
          --spacing-xs: calc(var(--spacing-unit) * 0.5);
          --spacing-sm: calc(var(--spacing-unit) * 0.75);
          --spacing-md: calc(var(--spacing-unit) * 1);
          --spacing-lg: calc(var(--spacing-unit) * 1.5);
          --spacing-xl: calc(var(--spacing-unit) * 2);
        }

        .s2-single-wrapper {
          position: fixed;
          inset: 0;
          z-index: 10;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 100vh;
          width: 100vw;

          /* ✅ 加分：现代视口与高度容错（不影响原有） */
          min-height: 100svh;
          height: 100dvh;
        }

        .s2-single-header {
          position: relative;
          z-index: 50;
          background: rgba(10, 22, 40, 0.95);
          padding: 10px 6px;
          min-height: 48px;
          border-bottom: 1px solid rgba(212, 175, 55, 0.08);
          flex-shrink: 0;

          /* ✅ 加分：iOS 顶部安全区 */
          padding-top: calc(10px + env(safe-area-inset-top));
        }

        @supports (-webkit-backdrop-filter: blur(8px)) {
          .s2-single-header {
            -webkit-backdrop-filter: blur(8px);
            backdrop-filter: blur(8px);
          }
        }

        .s2-single-content {
          position: relative;
          z-index: 20;
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          width: 100%;
          max-width: 520px;
          margin: 0 auto;
          padding: var(--spacing-lg) 16px var(--spacing-xl);
          color: #F5F5F0;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;

          /* ✅ 加分：减少 iOS 回弹穿透 */
          overscroll-behavior: contain;
        }

        .s2-single-content::-webkit-scrollbar {
          width: 0;
          height: 0;
        }

        .s2-headline-section {
          margin-bottom: calc(var(--spacing-xl) * 1.2); /* 增加呼吸感 */
          text-align: center;
          opacity: 0;
          transform: translateY(12px);
          animation: s2FadeIn 500ms cubic-bezier(0.23, 1, 0.32, 1) 100ms forwards;
        }

        /* 🎯 优化1：标题换行控制 */
        .s2-headline-main {
          margin: 0 0 var(--spacing-sm) 0;
          font-size: 26px;
          line-height: 1.35; /* 从1.3提升到1.35 */
          font-weight: 600;
          color: #FFFFFF;
          font-family: Georgia, 'Times New Roman', serif;
          letter-spacing: -0.02em; /* 微收紧字距 */
          word-spacing: -0.05em; /* 避免孤字 */
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

          /* ✅ 加分：更优换行均衡 */
          text-wrap: balance;
        }

        @media (max-width: 390px) {
          .s2-headline-main {
            font-size: 25px; /* 缩小1px避免孤字行 */
          }
        }

        /* 🎯 优化2：副标题对比度 */
        .s2-headline-sub {
          margin: 0;
          font-size: 15px;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.9); /* 从0.85提升到0.9 */
          font-family: Georgia, 'Times New Roman', serif;
          letter-spacing: -0.01em; /* 轻微收紧 */

          /* ✅ 加分：更优排版 */
          text-wrap: pretty;
        }

        /* 🎯 优化3：证言卡片呼吸感 */
        .s2-testimonial-section {
          background: rgba(26, 31, 46, 0.45); /* 从0.35提升到0.45 */
          border: 1px solid rgba(212, 175, 55, 0.15); /* 从0.1提升到0.15 */
          border-radius: 10px;
          padding: calc(var(--spacing-lg) + 4px); /* 增加4px内边距 */
          margin-bottom: calc(var(--spacing-lg) * 1.2); /* 增加底部间距 */
          opacity: 0;
          transform: translateY(10px);
          animation: s2FadeIn 500ms cubic-bezier(0.23, 1, 0.32, 1) 300ms forwards;
        }

        .s2-testimonial-quote {
          margin: 0 0 calc(var(--spacing-sm) + 4px) 0; /* 增加与署名间距 */
          font-size: 14px;
          line-height: 1.65; /* 从1.6提升到1.65 */
          font-style: italic;
          color: #D4AF37;
          font-family: Georgia, 'Times New Roman', serif;

          /* ✅ 加分：长句可读性（不改字） */
          hyphens: auto;
          overflow-wrap: anywhere;
          letter-spacing: 0.002em;
        }

        .s2-testimonial-author {
          margin: 0;
          font-size: 12px;
          color: rgba(156, 163, 175, 0.85);
          font-family: Georgia, 'Times New Roman', serif;
        }

        /* 🎯 优化4：清单扫描效率 */
        .s2-value-section {
          margin-bottom: calc(var(--spacing-lg) * 1.3); /* 增加与CTA的间距 */
          opacity: 0;
          transform: translateY(10px);
          animation: s2FadeIn 500ms cubic-bezier(0.23, 1, 0.32, 1) 500ms forwards;
        }

        .s2-value-list {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .s2-value-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: calc(var(--spacing-sm) + 2px); /* 微增行距 */
          padding: 0;
        }

        .s2-value-item:last-child {
          margin-bottom: 0;
        }

        .s2-value-bullet {
          flex-shrink: 0;
          width: 20px;
          color: #D4AF37;
          font-weight: 600;
          font-size: 14px;
          margin-top: 1px;
        }

        .s2-value-text {
          flex: 1;
          font-size: 13px;
          line-height: 1.55; /* 微增行高 */
          color: rgba(245, 245, 240, 0.9);
          font-family: Georgia, 'Times New Roman', serif;
        }

        /* 🎯 选项A：CTA与Footer视觉分组 */
        .s2-cta-section {
          margin-bottom: var(--spacing-xs); /* 减少与footer的间距 */
          opacity: 0;
          transform: translateY(10px);
          animation: s2FadeIn 500ms cubic-bezier(0.23, 1, 0.32, 1) 700ms forwards;
        }

        /* 🎯 优化5：CTA视觉权重精调 */
        .s2-cta-button {
          display: block;
          width: 100%;
          height: 56px;
          position: relative;
          border: none;
          margin: 0;
          padding: 0;
          border-radius: 8px;
          background: linear-gradient(
            135deg,
            rgba(184, 149, 106, 0.28) 0%, /* 微增背景亮度 */
            rgba(212, 175, 55, 0.22) 100%
          );
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 2px solid rgba(212, 175, 55, 1); /* 实心边框 */
          box-sizing: border-box;
          box-shadow: 
            0 0 35px rgba(212, 175, 55, 0.4), /* blur从40px减到35px */
            0 8px 24px rgba(212, 175, 55, 0.25),
            inset 0 2px 0 rgba(255, 255, 255, 0.15),
            0 0 0 1px rgba(212, 175, 55, 0.1); /* 增加1px spread */
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          transition: all 250ms cubic-bezier(0.23, 1, 0.32, 1);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          will-change: transform, box-shadow;
          touch-action: manipulation;
          z-index: 100;
        }

        .s2-cta-text {
          display: block;
          width: 100%;
          height: 100%;
          color: #FFFFFF;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 17px;
          font-weight: 600;
          line-height: 56px;
          text-align: center;
          letter-spacing: 0.01em;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
          transition: all 250ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        /* 🎯 优化呼吸动画 */
        @media (min-width: 769px) {
          .s2-cta-button {
            animation: s2CtaPulse 2.5s ease-in-out 1.5s infinite;
          }
        }

        @keyframes s2CtaPulse {
          0%, 100% {
            box-shadow:
              0 0 35px rgba(212, 175, 55, 0.4),
              0 8px 24px rgba(212, 175, 55, 0.25),
              inset 0 2px 0 rgba(255, 255, 255, 0.15),
              0 0 0 0 rgba(212, 175, 55, 0.7);
          }
          50% {
            box-shadow:
              0 0 40px rgba(212, 175, 55, 0.5),
              0 10px 28px rgba(212, 175, 55, 0.3),
              inset 0 2px 0 rgba(255, 255, 255, 0.15),
              0 0 0 12px rgba(212, 175, 55, 0);
          }
        }

        @media (hover: hover) and (pointer: fine) {
          .s2-cta-button:hover:not(:disabled) {
            background: linear-gradient(
              135deg,
              rgba(184, 149, 106, 0.36) 0%,
              rgba(212, 175, 55, 0.30) 100%
            );
            border-color: rgba(212, 175, 55, 1);
            transform: translateY(-2px);
            box-shadow:
              0 0 45px rgba(212, 175, 55, 0.5),
              0 12px 30px rgba(212, 175, 55, 0.35),
              inset 0 2px 0 rgba(255, 255, 255, 0.2);
          }

          .s2-cta-button:hover:not(:disabled) .s2-cta-text {
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
            transform: scale(1.02);
          }
        }

        .s2-cta-button:active:not(:disabled) {
          transform: translateY(1px); /* 按压下沉1px */
          background: linear-gradient(
            135deg,
            rgba(184, 149, 106, 0.40) 0%,
            rgba(212, 175, 55, 0.34) 100%
          );
          border-color: rgba(212, 175, 55, 1);
          transition: all 100ms ease;
        }

        .s2-cta-button:focus-visible {
          outline: 2px solid rgba(212, 175, 55, 1); /* 确保焦点可见 */
          outline-offset: 3px;
        }

        .s2-cta-button:focus:not(:focus-visible) {
          outline: none;
        }

        /* 🎯 优化6：次要说明可读性 */
        .s2-cta-microcopy {
          margin: calc(var(--spacing-sm) + 4px) 0 0; /* 从xs提升到sm+4px */
          text-align: center;
          font-size: 12px;
          color: rgba(156, 163, 175, 0.80);
          font-style: italic;
          font-family: Georgia, 'Times New Roman', serif;
          letter-spacing: 0.01em; /* 增加字距 */
        }

        /* 🎯 选项A：Footer视觉分组 */
        .s2-footer-section {
          text-align: center;
          margin-top: calc(var(--spacing-xs) * -1); /* 拉近与CTA的距离 */
          padding-top: var(--spacing-sm);
          border-top: 1px solid rgba(212, 175, 55, 0.05); /* 细微分隔线 */
          opacity: 0;
          transform: translateY(10px);
          animation: s2FadeIn 500ms cubic-bezier(0.23, 1, 0.32, 1) 900ms forwards;
        }

        .s2-footer-text {
          margin: 0;
          font-size: 13px;
          line-height: 1.5;
          color: rgba(156, 163, 175, 0.85);
          font-family: Georgia, 'Times New Roman', serif;
        }

        @keyframes s2FadeIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* 移动端适配 */
        @media (max-width: 768px) {
          .s2-single-header {
            padding: 8px 4px;
            min-height: 44px;
          }
          
          .s2-single-content {
            padding: var(--spacing-md) 12px var(--spacing-lg);
          }
          
          .s2-headline-main {
            font-size: 24px;
          }
          
          .s2-headline-sub {
            font-size: 14px;
          }
          
          .s2-testimonial-quote {
            font-size: 13px;
          }
          
          .s2-value-text {
            font-size: 12px;
          }
          
          .s2-cta-button {
            height: 52px;
          }
          
          .s2-cta-text {
            font-size: 16px;
            line-height: 52px;
          }

          /* ✅ 加分：移动端粘底 CTA 与底部安全区 */
          .s2-cta-section {
            position: sticky;
            bottom: 0;
            background: linear-gradient(180deg, rgba(10,22,40,0) 0%, rgba(10,22,40,0.85) 45%, rgba(10,22,40,0.95) 100%);
            padding-top: 12px;
            padding-bottom: max(env(safe-area-inset-bottom), var(--spacing-sm));
            z-index: 120;
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
          }
        }

        @media (max-width: 359px) {
          .s2-headline-main {
            font-size: 22px;
          }
          
          .s2-headline-sub {
            font-size: 13px;
          }
          
          .s2-testimonial-section {
            padding: var(--spacing-md);
          }
          
          .s2-cta-button {
            height: 48px;
          }
          
          .s2-cta-text {
            font-size: 15px;
            line-height: 48px;
          }
        }

        /* 桌面端适配 */
        @media (min-width: 769px) {
          .s2-single-header {
            padding: 14px 24px;
            min-height: 56px;
          }
          
          .s2-single-content {
            max-width: 580px;
            padding: var(--spacing-xl) 24px calc(var(--spacing-xl) * 1.5);
          }
          
          .s2-headline-main {
            font-size: 32px;
          }
          
          .s2-headline-sub {
            font-size: 16px;
          }
          
          .s2-testimonial-quote {
            font-size: 15px;
          }
          
          .s2-value-text {
            font-size: 14px;
          }
          
          .s2-cta-button {
            height: 60px;
          }
          
          .s2-cta-text {
            font-size: 18px;
            line-height: 60px;
          }
        }

        /* 无障碍降级 */
        @media (prefers-reduced-motion: reduce) {
          .s2-headline-section,
          .s2-testimonial-section,
          .s2-value-section,
          .s2-cta-section,
          .s2-footer-section {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
          
          .s2-cta-button {
            animation: none !important;
            transition: none !important;
          }
          
          .s2-cta-text {
            transition: none !important;
          }

          .s2-cta-button:hover:not(:disabled) {
            transform: none !important;
          }

          .s2-cta-button:hover:not(:disabled) .s2-cta-text {
            transform: none !important;
          }
        }

        @media (prefers-contrast: more) {
          .s2-cta-button {
            background: rgba(212, 175, 55, 0.4);
            border-color: rgba(212, 175, 55, 1);
          }

          .s2-cta-text {
            text-shadow: none;
          }

          .s2-headline-main {
            text-shadow: none;
          }
        }

        /* 高度适配优化 */
        @media (max-height: 700px) {
          .s2-single-content {
            padding-top: var(--spacing-md);
            padding-bottom: var(--spacing-md);
          }
          
          .s2-headline-section {
            margin-bottom: var(--spacing-lg);
          }
          
          .s2-testimonial-section {
            margin-bottom: var(--spacing-md);
          }
          
          .s2-value-section {
            margin-bottom: var(--spacing-md);
          }
        }

        @media (max-height: 600px) {
          .s2-headline-main {
            font-size: 22px;
            margin-bottom: var(--spacing-xs);
          }
          
          .s2-headline-sub {
            font-size: 13px;
          }
          
          .s2-testimonial-section {
            padding: var(--spacing-sm);
          }
          
          .s2-testimonial-quote {
            font-size: 12px;
          }
          
          .s2-value-item {
            margin-bottom: var(--spacing-xs);
          }
          
          .s2-value-text {
            font-size: 11px;
          }
          
          .s2-cta-button {
            height: 44px;
          }
          
          .s2-cta-text {
            font-size: 15px;
            line-height: 44px;
          }
        }

        /* ✅ 加分：小屏阅读优化（置于末尾以覆盖上面规则） */
        @media (max-width: 420px) {
          .s2-value-text { font-size: 13.5px; }
        }
        @media (max-width: 360px) {
          .s2-value-text { font-size: 12.5px; }
        }

        /* ═══════════════════════════════════════════════════════════════════
           10分验收清单
           
           ✅ 1. 标题换行优化：line-height 1.35 + 字距收紧 + text-wrap
           ✅ 2. 副标题对比度：opacity 0.9 + text-wrap: pretty
           ✅ 3. 证言可读性：hyphens/overflow-wrap + 字距微增
           ✅ 4. 清单可读性：小屏字号兜底 + 行距微调
           ✅ 5. CTA：移动端粘底 + 安全区填充（文案零改）
           ✅ 6. 视口与滚动：100svh/100dvh + overscroll-behavior
        `}
      </style>
    </>
  );
};

export default ScreenTwoBack;

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
    __frid?: string;
  }
}
