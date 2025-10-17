import React, { useEffect, useRef, useState } from 'react';
import COPY from './copy';
import LuxuryBackground from '../../components/LuxuryBackground';
import Wordmark from '../../components/Wordmark';

interface ScreenTwoFrontProps {
  onContinue: () => void;
}

/* ===================== 跨子域去重工具（仅用于第二屏前屏打点） ===================== */
function getCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const list = (document.cookie || '').split('; ');
  for (const item of list) {
    const eq = item.indexOf('=');
    if (eq === -1) continue;
    const k = decodeURIComponent(item.slice(0, eq));
    const v = decodeURIComponent(item.slice(eq + 1));
    if (k === name) return v;
  }
  return '';
}

function setRootCookie(name: string, value: string, days: number) {
  try {
    const exp = new Date(Date.now() + days * 864e5).toUTCString();
    // 优先写顶级域（生产环境）
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
      value
    )}; path=/; domain=.faterewrite.com; expires=${exp}; SameSite=Lax`;
    // 若失败（本地开发），退回当前域
    if ((document.cookie || '').indexOf(`${encodeURIComponent(name)}=`) === -1) {
      document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
        value
      )}; path=/; expires=${exp}; SameSite=Lax`;
    }
  } catch {}
}

/**
 * 记录一次性事件到 Cookie（本文件使用 frd_s2_dedupe，防止与第一屏冲突）
 * @param key - 事件唯一标识（如 s2f_load / s2e3 / s2f_cc）
 * @param devMode - 开发模式下不去重（默认 false）
 * @returns true=首次触发，false=已触发过
 */
function markOnce(key: string, devMode: boolean = false): boolean {
  if (devMode && window.location.hostname === 'localhost') {
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
/* ============================================================================= */

const ScreenTwoFront: React.FC<ScreenTwoFrontProps> = ({ onContinue }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  /* ──────────────────────────── 🎯【S2 前屏：加载成功】 ──────────────────────────── */
  useEffect(() => {
    const frid = ensureFrid();
    if (typeof window !== 'undefined' && (window as any).fbq) {
      const isDev = window.location.hostname === 'localhost';
      if (markOnce('s2f_load', isDev)) {
        const eventId =
          'ev_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        (window as any).fbq(
          'trackCustom',
          'S2_Front_Loaded',
          {
            content_name: 'ScreenTwo_Front',
            content_category: 'Assessment_Landing',
            frid: frid
          },
          { eventID: eventId }
        );
        console.log('[FB打点] S2_Front_Loaded 触发成功', { frid, eventId });
      }
    }
  }, []);

  /* ──────────────────────────── 🎯【S2 前屏：停留≥3秒】 ──────────────────────────── */
  const s2StartRef = useRef<number>(0);
  useEffect(() => {
    s2StartRef.current = Date.now();
    const timer = window.setTimeout(() => {
      if (typeof window !== 'undefined' && (window as any).fbq) {
        const isDev = window.location.hostname === 'localhost';
        if (markOnce('s2e3', isDev)) {
          const frid = ensureFrid();
          const eventId =
            'ev_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
          (window as any).fbq(
            'trackCustom',
            'S2_Front_Engaged_3s',
            {
              content_name: 'ScreenTwo_Front',
              content_category: 'Assessment_Landing',
              engagement_type: 'view_3s',
              frid: frid
            },
            { eventID: eventId }
          );
          console.log('[FB打点] S2_Front_Engaged_3s 触发成功', { frid, eventId });
        }
      }
    }, 3000);

    return () => {
      clearTimeout(timer);
      if (s2StartRef.current > 0) {
        const duration = Math.round((Date.now() - s2StartRef.current) / 1000);
        console.log(`[S2 前屏] 停留时长: ${duration}秒`);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('S2A_Loaded', {
        timestamp: new Date().toISOString(),
        copyVersion: 'ultimate-v9.3-final'
      });
    }

    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && (window as any).analytics) {
        (window as any).analytics.track('S2A_Engaged_3s', {
          timestamp: new Date().toISOString()
        });
      }
    }, 3000);

    const loadTimer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => {
      clearTimeout(timer);
      clearTimeout(loadTimer);
    };
  }, []);

  useEffect(() => {
    const adjustScale = () => {
      if (!containerRef.current) return;

      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const headerHeight = 52;
      const availableHeight = viewportHeight - headerHeight - 40;

      const contentHeight = 880;

      let targetScale = availableHeight / contentHeight;
      targetScale = Math.min(0.92, Math.max(0.75, targetScale));

      containerRef.current.style.transform = `scale3d(${targetScale}, ${targetScale}, 1)`;
      containerRef.current.style.width = `${100 / targetScale}%`;

      console.log('[S2A-Final] 视口:', viewportHeight, 'x', viewportWidth, 'scale:', targetScale.toFixed(3));

      if (typeof window !== 'undefined' && (window as any).analytics) {
        (window as any).analytics.track('S2A_Scale_Applied', {
          viewportHeight,
          viewportWidth,
          scale: targetScale.toFixed(3),
          optimization: 'Final-v9.3'
        });
      }
    };

    const initialTimer = setTimeout(adjustScale, 100);
    window.addEventListener('resize', adjustScale);

    return () => {
      clearTimeout(initialTimer);
      window.removeEventListener('resize', adjustScale);
    };
  }, []);

  /* ──────────────────────────── 🎯【S2 前屏：CTA 点击（去重）】 ──────────────────────────── */
  const handleFrontCtaClick = () => {
    const isDev = window.location.hostname === 'localhost';
    if (typeof window !== 'undefined' && (window as any).fbq) {
      if (markOnce('s2f_cc', isDev)) {
        const frid = ensureFrid();
        const eventId =
          'ev_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        (window as any).fbq(
          'trackCustom',
          'S2_Front_CTA_Click',
          {
            content_name: 'ScreenTwo_Front_CTA',
            content_category: 'Assessment_Landing',
            frid: frid
          },
          { eventID: eventId }
        );
        console.log('[FB打点] S2_Front_CTA_Click 触发成功', { frid, eventId });
      }
    }
    // 原有逻辑：进入后续流程
    onContinue();
  };

  return (
    <>
      <LuxuryBackground />

      <div className={`s2-front-wrapper ${isLoaded ? 'loaded' : 'loading'}`}>
        <div className="s2-front-header">
          <Wordmark name="Kinship" href="/" />
        </div>

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
                  {COPY.front.socialProof.mainText}
                </p>
                <p className="s2-social-text">
                  <span className="s2-highlight">
                    {COPY.front.socialProof.weeklyCount.split(' ')[0]}
                  </span>{' '}
                  {COPY.front.socialProof.weeklyCount.split(' ').slice(1).join(' ')}
                </p>
              </div>

              {/* 🔥 CTA按钮（方案B：渐变毛玻璃优化）*/}
              <button onClick={handleFrontCtaClick} className="s2-cta-button" type="button">
                <span className="s2-cta-text">{COPY.front.cta.button}</span>
              </button>
              <p className="s2-cta-hint">{COPY.front.cta.microcopy}</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* ═══════════════════════════════════════════════════════════════════
           【方案B v10.0】CTA 渐变毛玻璃优化 - 平衡高级感和可识别性
           
           🎯 优化区域：仅 CTA 按钮样式（.s2-cta-button + .s2-cta-text）
           ✅ 保持不变：所有其他样式（标题/卡片/社会证明/加载动画等）
           🔥 核心优化：渐变背景 + 实心金色边框 + 增强呼吸动画
           ═══════════════════════════════════════════════════════════════════ */

        /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
           以下为【保持不变】的原有样式
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

        .s2-front-wrapper {
          position: fixed;
          inset: 0;
          z-index: 10;
          overflow-y: auto;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
        }

        .s2-front-wrapper::-webkit-scrollbar {
          width: 0;
          height: 0;
        }

        .s2-front-wrapper.loading .s2-front-header {
          opacity: 0;
          transform: translateY(-20px);
        }

        .s2-front-wrapper.loading .s2-front-scale-container {
          opacity: 0;
          transform: translateY(30px) scale3d(0.98, 0.98, 1);
        }

        .s2-front-wrapper.loaded .s2-front-header {
          animation: s2HeaderIn 500ms cubic-bezier(0.23, 1, 0.32, 1) 200ms forwards;
        }

        .s2-front-wrapper.loaded .s2-front-scale-container {
          animation: s2ContainerIn 600ms cubic-bezier(0.23, 1, 0.32, 1) 400ms forwards;
        }

        @keyframes s2HeaderIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes s2ContainerIn {
          from {
            opacity: 0;
            transform: translateY(30px) scale3d(0.98, 0.98, 1);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale3d(1, 1, 1);
          }
        }

        .s2-front-header {
          position: relative;
          z-index: 50;
          background: rgba(10, 22, 40, 0.95);
          padding: 12px 6px;
          min-height: 52px;
          border-bottom: 1px solid rgba(212, 175, 55, 0.08);
          flex-shrink: 0;
        }

        @supports (-webkit-backdrop-filter: blur(8px)) {
          .s2-front-header {
            -webkit-backdrop-filter: blur(8px);
            backdrop-filter: blur(8px);
          }
        }

        .s2-front-scale-wrapper {
          flex: 1;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          overflow: hidden;
          padding: 20px 0 0;
        }

        .s2-front-scale-container {
          transform-origin: top center;
          transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          width: 100%;
          padding: 0 6px;
          -webkit-font-smoothing: subpixel-antialiased;
          -webkit-transform: scale3d(1, 1, 1);
          transform: scale3d(1, 1, 1);
        }

        .s2-front-container {
          width: 100%;
          max-width: 100%;
          margin: 0 auto;
          color: #F5F5F0;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }

        .s2-front-title {
          margin: 0 0 18px 0;
          padding: 0;
          font-size: 30px;
          line-height: 1.18;
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

        .s2-title-chunk:nth-child(1) { animation-delay: 660ms; }
        .s2-title-chunk:nth-child(2) { animation-delay: 840ms; }

        @keyframes s2ChunkIn {
          to { opacity: 1; transform: translateY(0); }
        }

        .s2-front-subtitle {
          margin: 0 0 22px 0;
          padding: 0;
        }

        .s2-subtitle-line {
          margin: 0 0 8px 0;
          font-size: 15px;
          line-height: 1.55;
          color: #F5F5F0;
          font-weight: 400;
          font-family: Georgia, 'Times New Roman', serif;
          opacity: 0.90;
          transform: translateY(6px);
          animation: s2SubIn 360ms cubic-bezier(0.23,1,0.32,1) forwards;
        }

        .s2-subtitle-line:nth-child(1) { animation-delay: 1160ms; }
        .s2-subtitle-line:nth-child(2) { animation-delay: 1300ms; }
        .s2-subtitle-line:last-child { margin-bottom: 0; }

        @keyframes s2SubIn { to { opacity: 0.92; transform: translateY(0); } }

        .s2-cards-wrapper {
          margin: 0 0 18px 0;
        }

        .s2-card {
          background: rgba(26, 31, 46, 0.6);
          border: 1px solid rgba(212, 175, 55, 0.15);
          border-radius: 10px;
          padding: 18px;
          margin-bottom: 10px;
          opacity: 0;
          transform: translateY(6px);
          animation: s2CardIn 360ms cubic-bezier(0.23, 1, 0.32, 1) forwards;
        }

        .s2-card:last-child { margin-bottom: 0; }

        @keyframes s2CardIn { to { opacity: 1; transform: translateY(0); } }

        .s2-card-title {
          margin: 0 0 10px 0;
          font-size: 16px;
          font-weight: 600;
          color: #D4AF37;
          font-family: Georgia, 'Times New Roman', serif;
        }

        .s2-card-body {
          margin: 0 0 10px 0;
          font-size: 13px;
          line-height: 1.5;
          color: #F5F5F0;
          font-family: Georgia, 'Times New Roman', serif;
          opacity: 0.90;
        }

        .s2-card-footer {
          margin: 0;
          font-size: 11px;
          font-style: italic;
          color: #9CA3AF;
          opacity: 0.50;
          font-family: Georgia, 'Times New Roman', serif;
        }

        .s2-social-proof {
          background: rgba(26, 31, 46, 0.6);
          border: 1px solid rgba(212, 175, 55, 0.15);
          border-radius: 10px;
          padding: 18px;
          margin-bottom: 16px;
          opacity: 0;
          transform: translateY(6px);
          animation: s2CardIn 360ms cubic-bezier(0.23, 1, 0.32, 1) 1240ms forwards;
        }

        .s2-social-text {
          margin: 0 0 10px 0;
          font-size: 13px;
          line-height: 1.5;
          color: #F5F5F0;
          font-family: Georgia, 'Times New Roman', serif;
          opacity: 0.85;
        }

        .s2-social-text:last-child { margin-bottom: 0; }

        .s2-highlight { color: #D4AF37; font-weight: 600; }

        /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
           🔥 方案B：CTA 渐变毛玻璃优化（核心修改区域）
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

        /* A. 基础样式（移动端优先）*/
        .s2-cta-button {
          /* 布局 */
          display: block;
          width: 100%;
          height: 52px;
          position: relative;
          
          /* 移除默认样式 */
          border: none;
          margin: 0;
          padding: 0;
          
          /* 圆角：8px（克制）*/
          border-radius: 8px;
          
          /* 🔥 方案B优化1：渐变毛玻璃背景 */
          background: linear-gradient(
            135deg,
            rgba(184, 149, 106, 0.24) 0%,
            rgba(212, 175, 55, 0.18) 100%
          );
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          
          /* 🔥 方案B优化2：实心金色边框（更明显）*/
          border: 1.5px solid rgba(212, 175, 55, 0.6);
          box-sizing: border-box;
          
          /* 光标 */
          cursor: pointer;
          
          /* 移除移动端 tap 高亮 */
          -webkit-tap-highlight-color: transparent;
          
          /* 过渡效果 */
          transition: all 250ms cubic-bezier(0.23, 1, 0.32, 1);
          
          /* 字体渲染优化 */
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          
          /* 入场动画（初始状态）*/
          opacity: 0;
          transform: translateY(6px);
          
          /* 性能提示 */
          will-change: transform, box-shadow;
          touch-action: manipulation;
          z-index: 100;
        }

        /* 🔥 按钮文字 */
        .s2-cta-text {
          display: block;
          width: 100%;
          height: 100%;
          
          /* 纯白文字（对比度 15:1）*/
          color: #FFFFFF;
          
          /* 字体样式 */
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 17px;
          font-weight: 600;
          line-height: 52px;
          text-align: center;
          letter-spacing: 0.01em;
          
          /* 文字阴影 */
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
          
          /* 过渡效果 */
          transition: all 250ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        /* B. 入场动画（移动端 + 桌面端）*/
        @media (max-width: 768px) {
          .s2-cta-button {
            animation: s2CtaIn 500ms cubic-bezier(0.23, 1, 0.32, 1) 1420ms forwards;
          }
        }

        @media (min-width: 769px) {
          .s2-cta-button {
            animation: 
              s2CtaIn 500ms cubic-bezier(0.23, 1, 0.32, 1) 1420ms forwards,
              s2CtaPulse 2s ease-in-out 2.4s infinite;
          }
        }

        /* 入场动画：从下方淡入 + 微量放大 */
        @keyframes s2CtaIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* 🔥 方案B优化3：呼吸动画使用实心金色（更明显）*/
        @keyframes s2CtaPulse {
          0%, 100% { 
            box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.5); 
          }
          50% { 
            box-shadow: 0 0 0 10px rgba(212, 175, 55, 0); 
          }
        }

        /* C. 悬停状态（桌面端）*/
        @media (hover: hover) and (pointer: fine) {
          .s2-cta-button:hover:not(:disabled) {
            /* 🔥 悬停背景：渐变增强 */
            background: linear-gradient(
              135deg,
              rgba(184, 149, 106, 0.32) 0%,
              rgba(212, 175, 55, 0.26) 100%
            );
            
            /* 🔥 悬停边框：实心金色更强 */
            border-color: rgba(212, 175, 55, 0.8);
            
            /* 微妙上浮：1px */
            transform: translateY(-1px);
            
            /* 🔥 金色光晕（实心金色）*/
            box-shadow: 
              0 4px 16px rgba(212, 175, 55, 0.2),
              0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .s2-cta-button:hover:not(:disabled) .s2-cta-text {
            /* 文字更清晰 */
            text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
          }
        }

        /* D. 点击状态（移动端 + 桌面端）*/
        .s2-cta-button:active:not(:disabled) {
          /* 轻微下沉 */
          transform: translateY(0);
          
          /* 🔥 背景瞬间增强（渐变）*/
          background: linear-gradient(
            135deg,
            rgba(184, 149, 106, 0.38) 0%,
            rgba(212, 175, 55, 0.32) 100%
          );
          
          /* 🔥 边框更强（实心金色）*/
          border-color: rgba(212, 175, 55, 0.9);
          
          /* 过渡加速 */
          transition: all 100ms ease;
        }

        /* E. 聚焦状态（键盘导航无障碍）*/
        .s2-cta-button:focus-visible {
          /* 🔥 聚焦环（实心金色）*/
          outline: 2px solid rgba(212, 175, 55, 0.8);
          outline-offset: 4px;
        }

        .s2-cta-button:focus:not(:focus-visible) {
          outline: none;
        }

        /* F. 禁用状态 */
        .s2-cta-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none;
        }

        .s2-cta-button:disabled .s2-cta-text {
          text-shadow: none;
        }

        /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
           🔥 CTA Microcopy（保持原样，不修改）
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

        .s2-cta-hint {
          margin: 10px 0 0;
          text-align: center;
          font-size: 12px;
          color: #9CA3AF;
          font-style: italic;
          font-family: Georgia, 'Times New Roman', serif;
          opacity: 0;
          animation: s2CardIn 360ms cubic-bezier(0.23, 1, 0.32, 1) 1600ms forwards;
        }

        /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
           以下为【保持不变】的响应式适配
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

        @media (max-height: 750px) {
          .s2-card-body {
            font-size: 14px;
          }
          
          .s2-social-text {
            font-size: 14px;
          }
        }

        @media (max-height: 500px) and (orientation: landscape) {
          .s2-front-scale-wrapper {
            align-items: flex-start;
            padding: 10px 0 0;
          }
          
          .s2-front-scale-container {
            -webkit-transform: scale3d(0.65, 0.65, 1) !important;
            transform: scale3d(0.65, 0.65, 1) !important;
            width: 153.8% !important;
          }
        }

        @media (max-width: 768px) {
          .s2-front-header { 
            padding: 10px 4px;
            min-height: 48px;
          }
          
          .s2-front-scale-wrapper {
            padding: 16px 0 0;
          }
          
          .s2-front-scale-container { 
            padding: 0 4px;
          }
          
          .s2-front-title { 
            font-size: 28px; 
            margin-bottom: 16px; 
          }
          
          .s2-subtitle-line { 
            font-size: 14px; 
          }
          
          .s2-card { 
            padding: 16px; 
          }
          
          .s2-social-proof { 
            padding: 16px; 
          }
        }

        @media (max-width: 359px) {
          .s2-front-title { 
            font-size: 26px; 
          }
          
          .s2-subtitle-line { 
            font-size: 13px; 
          }
          
          .s2-card-body { 
            font-size: 12px; 
          }
          
          .s2-card { 
            padding: 14px; 
          }
          
          .s2-social-proof { 
            padding: 14px; 
          }
          
          /* 极小屏 CTA 适配 */
          .s2-cta-button {
            height: 48px;
          }
          
          .s2-cta-text {
            font-size: 15px;
            line-height: 48px;
          }
        }

        @media (max-width: 340px) {
          .s2-front-title { 
            font-size: 24px;
            line-height: 1.15;
          }
          
          .s2-card { 
            padding: 12px;
          }
          
          /* 极端窄屏 CTA 适配 */
          .s2-cta-text {
            font-size: 14px;
          }
        }

        @media (min-width: 769px) {
          .s2-front-header { 
            padding: 14px 24px;
            min-height: 56px;
          }
          
          .s2-front-scale-wrapper { 
            padding: 25px 0 0; 
          }
          
          .s2-front-scale-container { 
            padding: 0 24px; 
          }
          
          .s2-front-container { 
            max-width: 580px; 
          }
          
          .s2-front-title { 
            font-size: 36px; 
            margin-bottom: 26px; 
          }
          
          .s2-subtitle-line { 
            font-size: 16px; 
          }
          
          .s2-card-body { 
            font-size: 14px; 
          }
          
          /* 桌面端 CTA 适配 */
          .s2-cta-button { 
            height: 56px;
          }
          
          .s2-cta-text {
            font-size: 18px;
            line-height: 56px;
          }
        }

        @media (max-height: 850px) {
          .s2-front-scale-container {
            -webkit-transform: scale3d(0.75, 0.75, 1) !important;
            transform: scale3d(0.75, 0.75, 1) !important;
            width: 133.33% !important;
          }
        }

        @media (max-height: 700px) {
          .s2-front-scale-container {
            -webkit-transform: scale3d(0.75, 0.75, 1) !important;
            transform: scale3d(0.75, 0.75, 1) !important;
            width: 133.33% !important;
          }

          .s2-front-title { font-size: 26px; margin-bottom: 14px; }
          .s2-cards-wrapper { margin-bottom: 16px; }
          .s2-card { padding: 14px; margin-bottom: 8px; }
          .s2-social-proof { padding: 14px; margin-bottom: 14px; }
        }

        /* 无障碍降级 */
        @media (prefers-reduced-motion: reduce) {
          .s2-front-wrapper.loading .s2-front-header,
          .s2-front-wrapper.loading .s2-front-scale-container,
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
          
          /* CTA 动画降级 */
          .s2-cta-button,
          .s2-cta-text {
            transition: none !important;
          }

          .s2-cta-button:hover:not(:disabled) {
            transform: none !important;
          }
        }

        /* 高对比度模式 */
        @media (prefers-contrast: more) {
          .s2-card,
          .s2-social-proof { 
            border-color: rgba(212, 175, 55, 0.3); 
          }
          
          /* 🔥 CTA 高对比度优化（渐变简化）*/
          .s2-cta-button {
            background: rgba(212, 175, 55, 0.32);
            border-color: rgba(212, 175, 55, 0.9);
          }

          .s2-cta-text {
            text-shadow: none;
          }
        }

        /* ═══════════════════════════════════════════════════════════════════
           【S2 前屏打点】验收清单
           
           🎯 事件（均为“跨子域去重”）：
           ✅ S2_Front_Loaded（加载成功，User级去重：key=s2f_load；Cookie=frd_s2_dedupe）
           ✅ S2_Front_Engaged_3s（3秒停留，User级去重：key=s2e3；Cookie=frd_s2_dedupe）
           ✅ S2_Front_CTA_Click（前屏CTA点击，User级去重：key=s2f_cc；Cookie=frd_s2_dedupe）
           
           去重逻辑：
           - 生产环境：Cookie跨子域去重（.faterewrite.com，30天有效期）
           - 开发环境：localhost 不去重（方便测试）
           - 控制台日志：清晰标注触发/去重状态
           
           FRID 机制：
           ✅ 页面加载即生成/复用（frd_uid）
           ✅ 跨子域共享（.faterewrite.com）
           ✅ 30天有效期
        ═══════════════════════════════════════════════════════════════════ */
      `}</style>
    </>
  );
};

export default ScreenTwoFront;

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
    __frid?: string;
  }
}
