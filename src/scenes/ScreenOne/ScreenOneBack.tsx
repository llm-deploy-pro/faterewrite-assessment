// 文件路径: src/scenes/ScreenOne/ScreenOneBack.tsx
import { useEffect, useRef, useState } from "react";
import Wordmark from "@/components/Wordmark";
import { COPY } from "./copy";

/* ===================== 跨子域去重工具 ===================== */
function getCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const list = (document.cookie || "").split("; ");
  for (const item of list) {
    const eq = item.indexOf("=");
    if (eq === -1) continue;
    const k = decodeURIComponent(item.slice(0, eq));
    const v = decodeURIComponent(item.slice(eq + 1));
    if (k === name) return v;
  }
  return "";
}

function setRootCookie(name: string, value: string, days: number) {
  try {
    const exp = new Date(Date.now() + days * 864e5).toUTCString();
    const isHttps = window.location.protocol === 'https:';
    const secureFlag = isHttps ? '; Secure' : '';
    
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
      value
    )}; path=/; domain=.faterewrite.com; expires=${exp}; SameSite=Lax${secureFlag}`;
    
    if (document.cookie.indexOf(name + "=") === -1) {
      document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
        value
      )}; path=/; expires=${exp}; SameSite=Lax${secureFlag}`;
    }
  } catch {}
}

function markOnce(key: string, devMode: boolean = false): boolean {
  if (devMode && window.location.hostname === 'localhost') {
    console.log(`[DEV] 事件 ${key} 触发（开发模式不去重）`);
    return true;
  }

  const name = "frd_s1_dedupe";
  const raw = getCookie(name);
  const set = new Set(raw ? raw.split(",") : []);
  
  if (set.has(key)) {
    console.log(`[去重] 事件 ${key} 已触发过，跳过`);
    return false;
  }
  
  set.add(key);
  setRootCookie(name, Array.from(set).join(","), 30);
  console.log(`[打点] 事件 ${key} 首次触发 ✓`);
  return true;
}

function ensureFrid() {
  const win: any = window as any;
  let frid = win.__frid || getCookie("frd_uid");
  if (!frid) {
    frid = "fr_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    setRootCookie("frd_uid", frid, 30);
  }
  if (!win.__frid) win.__frid = frid;
  return frid;
}

function withParams(
  url: string,
  params: Record<string, string | number | undefined | null>
) {
  const u = new URL(url, window.location.origin);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") u.searchParams.set(k, String(v));
  });
  return u.pathname + (u.search || "");
}
/* ========================================================== */

export default function ScreenOneBack() {
  const hasTrackedRef = useRef(false);
  const hasClickedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);

  // ═══════════════════════════════════════════════════════════════
  // 🎯 核心打点：后屏成功加载
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (hasTrackedRef.current) return;
    hasTrackedRef.current = true;

    const frid = ensureFrid();
    const isDev = window.location.hostname === 'localhost';

    const timer = setTimeout(() => {
      if (typeof (window as any).fbq !== "undefined") {
        if (markOnce("s1bl", isDev)) {
          const eventId = "ev_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
          
          (window as any).fbq("trackCustom", "S1_Back_Loaded", {
            content_name: "ScreenOne_Back",
            content_category: "Assessment_Offer",
            screen_position: "back",
            screen_number: 1,
            page_url: window.location.href,
            referrer: document.referrer,
            frid: frid,
          }, { 
            eventID: eventId 
          });
          
          console.log(`[FB打点] S1_Back_Loaded 触发成功`, { frid, eventId });
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // 🎯 后屏停留 ≥3s 打点
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    const frid = ensureFrid();
    const isDev = window.location.hostname === 'localhost';

    const dwellTimer = setTimeout(() => {
      if (typeof (window as any).fbq !== "undefined") {
        if (markOnce("s1be3", isDev)) {
          const eventId = "ev_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

          (window as any).fbq("trackCustom", "S1_Back_Engaged_3s", {
            content_name: "ScreenOne_Back",
            content_category: "Assessment_Offer",
            engagement_type: "view_3s",
            screen_position: "back",
            screen_number: 1,
            page_url: window.location.href,
            referrer: document.referrer,
            frid: frid,
          }, { eventID: eventId });

          console.log(`[FB打点] S1_Back_Engaged_3s 触发成功`, { frid, eventId });
        }
      }
    }, 3000);

    return () => clearTimeout(dwellTimer);
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // 🎯 CTA点击处理（内置打点，统一事件名）+ Loading状态
  // ═══════════════════════════════════════════════════════════════
  const handleCTAClick = () => {
    if (hasClickedRef.current || isLoading) return;
    setIsLoading(true);
    
    const frid = ensureFrid();
    const fbEventId = "ev_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const isDev = window.location.hostname === 'localhost';

    if (typeof (window as any).fbq !== 'undefined') {
      if (markOnce("s1bcc", isDev)) {
        (window as any).fbq('trackCustom', 'S1_CTA_Click', {
          content_name: 'Assessment_CTA',
          content_category: 'Matching_Assessment',
          value: 49,
          currency: 'USD',
          screen_position: 'back',
          screen_number: 1,
          page_url: window.location.href,
          referrer: document.referrer,
          frid: frid,
        }, { eventID: fbEventId });

        console.log(`[FB打点] S1_CTA_Click (Back) 触发成功`, { frid, fbEventId });
      }
    }

    hasClickedRef.current = true;
    try {
      localStorage.setItem('cta_clicked_assessment_49', 'true');
    } catch (error) {
      console.warn('localStorage not available:', error);
    }

    document.documentElement.classList.add('page-leave');
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('s1:cta:continue'));
      requestAnimationFrame(() => {
        document.documentElement.classList.remove('page-leave');
        window.scrollTo(0, 0);
      });
    }, 220);

    void withParams('/checkout', { frid, src: 's1_back', price: 49, fb_eid: fbEventId });
  };

  return (
    <section className="s1-back">
      
      {/* 品牌 Logo */}
      <Wordmark name="Kinship" href="/" />
      
      <div className="s1-back-inner">
        
        {/* 极致版身份确认语句 */}
        <p className="s1-identity-ultimate">
          {COPY.lead[0]}
        </p>

        {/* 紧迫感副标题 */}
        <p className="s1-urgency">
          {COPY.lead[1]}
        </p>
        
        {/* 极致版价值点列表 */}
        <ul className="s1-list">
          <li className="s1-list-item">
            <span className="s1-list-dot pulse" />
            <div className="s1-list-content">
              <p className="s1-list-title">The Kill Zones:</p>
              <p className="s1-list-text">
                7 addresses worth $500M/night. Penthouse 67 — Where divorces create millionaires (Tuesdays only, 10:47pm entry).
              </p>
            </div>
          </li>
          <li className="s1-list-item">
            <span className="s1-list-dot pulse" />
            <div className="s1-list-content">
              <p className="s1-list-title">The Formula:</p>
              <p className="s1-list-text">
                Say these 9 words. Watch him invest. Ignore everyone. Corner table. Whisper: 'My fund closes Thursday.' Then silence.
              </p>
            </div>
          </li>
          <li className="s1-list-item">
            <span className="s1-list-dot pulse" />
            <div className="s1-list-content">
              <p className="s1-list-title">The Exit:</p>
              <p className="s1-list-text">
                Make him chase by walking away first. 'I don't date. I evaluate. Your portfolio has 10 seconds.'
              </p>
            </div>
          </li>
        </ul>
        
        {/* CTA 按钮 - 极致版 */}
        <div className="s1-cta">
          <button
            type="button"
            onClick={handleCTAClick}
            className={`s1-cta-btn-ultimate ${isLoading ? 'loading' : ''}`}
            aria-label={COPY.cta}
            disabled={isLoading}
          >
            <span className="s1-cta-text">
              {isLoading ? 'Processing...' : COPY.cta}
            </span>
            <span className="s1-cta-countdown">117 left</span>
          </button>
        </div>
        
        {/* 辅助说明文字 - 极致版 */}
        <p className="s1-assist">{COPY.support}</p>
        
        {/* 合规文案 */}
        <p className="s1-compliance">
          {COPY.trust}
        </p>
        
      </div>

      <style>{`
        /* ═══════════════════════════════════════════════════════════════════
           【10/10 极致UI/UX优化版】The Ultimate Black Book
           ═══════════════════════════════════════════════════════════════════ */

        /* 页面离场动画 - GPU加速优化 */
        .page-leave .s1-back {
          opacity: 0;
          transform: translateY(-8px) scale(0.98) translateZ(0);
          filter: blur(4px);
          transition: all 220ms cubic-bezier(0.23, 1, 0.32, 1);
          will-change: opacity, transform, filter;
        }

        /* ═══════════════════════════════════════════════════════════════════
           A. 容器布局 - 极致视觉层次
           ═══════════════════════════════════════════════════════════════════ */
        .s1-back {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          z-index: 10;
          box-sizing: border-box;
          background: #0A1628;
          transform: translateZ(0);
          contain: layout style;
        }

        /* 多层视觉深度 - 优化版 */
        .s1-back::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: 
            radial-gradient(ellipse at 50% 0%, rgba(212, 184, 150, 0.03) 0%, transparent 50%),
            radial-gradient(ellipse at top, transparent 0%, rgba(0, 0, 0, 0.4) 100%),
            linear-gradient(180deg, rgba(184, 149, 106, 0.02) 0%, transparent 50%);
          will-change: auto;
        }

        /* 高级噪点纹理 - 增强质感 */
        .s1-back::after {
          content: "";
          position: absolute;
          inset: 0;
          opacity: 0.025;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
          mix-blend-mode: overlay;
        }

        .s1-back-inner {
          position: relative;
          width: 100%;
          max-width: 520px;
          color: #F5F5F0;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
          contain: layout style;
        }

        /* ═══════════════════════════════════════════════════════════════════
           B. 极致版身份确认（震撼开场）- 视觉优化
           ═══════════════════════════════════════════════════════════════════ */
        .s1-identity-ultimate {
          font-size: 16px;
          line-height: 1.45;
          color: #FFFFFF;
          font-family: Georgia, 'Times New Roman', serif;
          font-weight: 600;
          text-align: center;
          margin: 0 0 14px;
          padding: 0;
          letter-spacing: -0.005em;
          opacity: 0;
          transform: translateY(8px) translateZ(0);
          animation: shockIn 450ms cubic-bezier(0.23, 1, 0.32, 1) 30ms forwards;
          will-change: opacity, transform;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          text-wrap: balance;
        }

        /* 紧迫感副标题 - 增强层次 */
        .s1-urgency {
          font-size: 13px;
          line-height: 1.5;
          color: #D4B896;
          font-family: Georgia, 'Times New Roman', serif;
          font-style: italic;
          text-align: center;
          margin: 0 0 34px;
          padding: 0 0 20px;
          opacity: 0;
          transform: translateY(6px) translateZ(0);
          animation: itemFadeIn 360ms cubic-bezier(0.23, 1, 0.32, 1) 200ms forwards;
          position: relative;
          will-change: opacity, transform;
          border-bottom: 1px solid rgba(212, 184, 150, 0.1);
          text-wrap: balance;
        }

        .s1-urgency::after {
          content: '⏱';
          position: absolute;
          right: -20px;
          top: 50%;
          transform: translateY(-50%) translateZ(0);
          font-size: 14px;
          opacity: 0.5;
          animation: timePulse 3s ease-in-out infinite;
        }

        @keyframes shockIn {
          0% {
            opacity: 0;
            transform: translateY(12px) scale(0.95) translateZ(0);
          }
          50% {
            transform: translateY(-2px) scale(1.02) translateZ(0);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1) translateZ(0);
            will-change: auto;
          }
        }

        @keyframes timePulse {
          0%, 100% { 
            opacity: 0.3;
            transform: translateY(-50%) translateZ(0) scale(1);
          }
          50% { 
            opacity: 0.7;
            transform: translateY(-50%) translateZ(0) scale(1.1);
          }
        }

        /* ═══════════════════════════════════════════════════════════════════
           C. 列表样式
           ═══════════════════════════════════════════════════════════════════ */
        .s1-list {
          list-style: none;
          margin: 0 0 38px 0;
          padding: 0;
        }

        .s1-list-item {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          margin-bottom: 20px;
          padding: 16px;
          background: 
            linear-gradient(135deg, 
              rgba(184, 149, 106, 0.05) 0%, 
              rgba(184, 149, 106, 0.01) 100%
            ),
            linear-gradient(90deg,
              rgba(255, 255, 255, 0.01) 0%,
              transparent 100%
            );
          border: 1px solid rgba(184, 149, 106, 0.12);
          border-radius: 10px;
          opacity: 0;
          transform: translateY(8px) translateZ(0);
          animation: itemSlideIn 400ms cubic-bezier(0.23, 1, 0.32, 1) forwards;
          transition: all 250ms cubic-bezier(0.23, 1, 0.32, 1);
          will-change: opacity, transform;
          backface-visibility: hidden;
          position: relative;
          overflow: hidden;
        }

        @media (hover: hover) and (pointer: fine) {
          .s1-list-item {
            transition: transform 250ms cubic-bezier(0.23, 1, 0.32, 1),
                        background 350ms ease,
                        border-color 350ms ease,
                        box-shadow 350ms ease;
          }
          
          .s1-list-item:hover {
            background: 
              linear-gradient(135deg, 
                rgba(184, 149, 106, 0.08) 0%, 
                rgba(184, 149, 106, 0.02) 100%
              ),
              linear-gradient(90deg,
                rgba(255, 255, 255, 0.02) 0%,
                transparent 100%
              );
            border-color: rgba(184, 149, 106, 0.22);
            transform: translateX(4px) translateZ(0);
            box-shadow: 
              0 4px 16px rgba(212, 184, 150, 0.08),
              inset 0 1px 0 rgba(212, 184, 150, 0.05);
          }

          .s1-list-item:hover .s1-list-title {
            color: #E5D4B1;
          }
        }

        .s1-list-item:nth-child(1) { animation-delay: 280ms; }
        .s1-list-item:nth-child(2) { animation-delay: 420ms; }
        .s1-list-item:nth-child(3) { animation-delay: 560ms; }

        .s1-list-item:last-child { margin-bottom: 0; }

        .s1-list-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 2px;
          background: linear-gradient(180deg, 
            rgba(212, 184, 150, 0.3) 0%, 
            transparent 100%
          );
          opacity: 0;
          transition: opacity 300ms ease;
        }

        .s1-list-item:hover::before { opacity: 1; }

        @keyframes itemSlideIn {
          to {
            opacity: 1;
            transform: translateY(0) translateZ(0);
            will-change: auto;
          }
        }

        @keyframes itemFadeIn {
          to {
            opacity: 1;
            transform: translateY(0) translateZ(0);
            will-change: auto;
          }
        }

        .s1-list-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: linear-gradient(135deg, #E5D4B1 0%, #D4B896 100%);
          flex-shrink: 0;
          margin-top: 6px;
          position: relative;
          box-shadow: 
            0 0 12px rgba(212, 184, 150, 0.4),
            inset 0 -1px 2px rgba(0, 0, 0, 0.1);
          transform: translateZ(0);
        }

        .s1-list-dot.pulse { animation: dotPulse 3s ease-in-out infinite; }

        @keyframes dotPulse {
          0%, 100% { 
            box-shadow: 
              0 0 8px rgba(212, 184, 150, 0.3),
              inset 0 -1px 2px rgba(0, 0, 0, 0.1);
            transform: scale(1) translateZ(0);
          }
          50% { 
            box-shadow: 
              0 0 20px rgba(212, 184, 150, 0.5),
              inset 0 -1px 2px rgba(0, 0, 0, 0.1);
            transform: scale(1.15) translateZ(0);
          }
        }

        .s1-list-content { flex: 1; }

        .s1-list-title {
          margin: 0 0 5px 0;
          font-size: 14px;
          font-weight: 600;
          color: #D4B896;
          font-family: Georgia, 'Times New Roman', serif;
          letter-spacing: 0.02em;
          transition: color 250ms ease;
        }

        .s1-list-text {
          margin: 0;
          font-size: 15px;
          line-height: 1.65;
          font-weight: 400;
          font-family: Georgia, 'Times New Roman', serif;
          color: rgba(245, 245, 240, 0.85);
          letter-spacing: 0.01em;
          word-break: break-word;
          overflow-wrap: anywhere;
          hyphens: auto;
        }

        /* ═══════════════════════════════════════════════════════════════════
           D. CTA按钮
           ═══════════════════════════════════════════════════════════════════ */
        .s1-cta {
          margin: 46px 0 0 0;
          opacity: 0;
          transform: translateY(6px) translateZ(0);
          animation: itemFadeIn 360ms cubic-bezier(0.23, 1, 0.32, 1) 750ms forwards;
          will-change: opacity, transform;
        }

        .s1-cta-btn-ultimate {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          height: 56px;
          padding: 0 26px;
          border-radius: 12px;
          background: 
            linear-gradient(135deg, 
              rgba(212, 184, 150, 0.20) 0%, 
              rgba(184, 149, 106, 0.14) 100%
            ),
            linear-gradient(180deg,
              rgba(255, 255, 255, 0.04) 0%,
              transparent 100%
            );
          border: 1.5px solid rgba(212, 184, 150, 0.55);
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          transition: all 280ms cubic-bezier(0.23, 1, 0.32, 1);
          position: relative;
          overflow: hidden;
          transform: translateZ(0);
          backface-visibility: hidden;
          box-shadow: 
            0 2px 8px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.03);
          touch-action: manipulation;
          user-select: none;
        }

        .s1-cta-btn-ultimate::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, 
            transparent 0%,
            rgba(255, 255, 255, 0.12) 50%,
            transparent 100%
          );
          transition: transform 600ms cubic-bezier(0.23, 1, 0.32, 1);
          transform: translateX(0) translateZ(0);
        }

        .s1-cta-btn-ultimate:hover::before { transform: translateX(200%) translateZ(0); }

        .s1-cta-btn-ultimate.loading {
          pointer-events: none;
          opacity: 0.75;
          animation: loadingPulse 1.5s ease-in-out infinite;
        }

        @keyframes loadingPulse {
          0%, 100% { opacity: 0.75; }
          50% { opacity: 0.85; }
        }

        .s1-cta-btn-ultimate.loading .s1-cta-text::after {
          content: '';
          display: inline-block;
          width: 14px;
          height: 14px;
          margin-left: 10px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-top-color: #FFFFFF;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          vertical-align: middle;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .s1-cta-text {
          color: #FFFFFF;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 16px;
          font-weight: 600;
          letter-spacing: 0.01em;
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .s1-cta-countdown {
          color: #D4B896;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 13px;
          font-weight: 600;
          padding: 5px 11px;
          background: rgba(0, 0, 0, 0.35);
          border: 1px solid rgba(212, 184, 150, 0.15);
          border-radius: 14px;
          position: relative;
          z-index: 1;
          animation: countdownPulse 2.5s ease-in-out infinite;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        @keyframes countdownPulse {
          0%, 100% { opacity: 0.85; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.02); }
        }

        @media (hover: hover) and (pointer: fine) {
          .s1-cta-btn-ultimate:hover:not(:disabled):not(.loading) {
            border-color: rgba(212, 184, 150, 0.75);
            background: 
              linear-gradient(135deg, 
                rgba(212, 184, 150, 0.26) 0%, 
                rgba(184, 149, 106, 0.18) 100%
              ),
              linear-gradient(180deg,
                rgba(255, 255, 255, 0.06) 0%,
                transparent 100%
              );
            transform: translateY(-2px) translateZ(0);
            box-shadow: 
              0 10px 28px rgba(212, 184, 150, 0.18),
              0 4px 12px rgba(0, 0, 0, 0.12),
              inset 0 1px 0 rgba(255, 255, 255, 0.05);
          }

          .s1-cta-btn-ultimate:hover .s1-cta-countdown {
            background: rgba(0, 0, 0, 0.45);
            border-color: rgba(212, 184, 150, 0.25);
          }
        }

        .s1-cta-btn-ultimate:active:not(:disabled):not(.loading) {
          transform: scale(0.98) translateZ(0);
          transition: transform 100ms ease;
          box-shadow: 
            0 1px 4px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.03);
        }

        .s1-cta-btn-ultimate:focus-visible {
          outline: 2px solid rgba(212, 184, 150, 0.5);
          outline-offset: 3px;
        }

        /* ═══════════════════════════════════════════════════════════════════
           E. 辅助与合规
           ═══════════════════════════════════════════════════════════════════ */
        .s1-assist {
          margin: 16px 0 0;
          padding: 0;
          font-size: 13px;
          line-height: 1.5;
          text-align: center;
          color: #D4B896;
          opacity: 0;
          font-family: Georgia, 'Times New Roman', serif;
          font-style: italic;
          font-weight: 500;
          letter-spacing: 0.01em;
          animation: itemFadeIn 360ms cubic-bezier(0.23, 1, 0.32, 1) 950ms forwards;
          will-change: opacity, transform;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        .s1-compliance {
          margin: 30px 0 0;
          padding: 0;
          font-size: 10px;
          line-height: 1.6;
          text-align: center;
          color: rgba(184, 149, 106, 0.75);
          opacity: 0;
          font-family: Georgia, 'Times New Roman', serif;
          font-style: italic;
          letter-spacing: 0.02em;
          animation: itemFadeIn 360ms cubic-bezier(0.23, 1, 0.32, 1) 1150ms forwards;
          will-change: opacity, transform;
        }

        /* ═══════════════════════════════════════════════════════════════════
           桌面端适配
           ═══════════════════════════════════════════════════════════════════ */
        @media (min-width: 769px) {
          .s1-back-inner { max-width: 600px; }

          .s1-identity-ultimate { font-size: 18px; margin-bottom: 16px; line-height: 1.5; }

          .s1-urgency { font-size: 14px; padding-bottom: 24px; margin-bottom: 38px; }

          .s1-list-item { padding: 18px 20px; gap: 16px; margin-bottom: 24px; border-radius: 12px; }

          .s1-list-title { font-size: 15px; margin-bottom: 6px; }

          .s1-list-text { font-size: 16px; line-height: 1.7; }

          .s1-cta { margin-top: 50px; }

          .s1-cta-btn-ultimate { height: 60px; padding: 0 30px; border-radius: 14px; }

          .s1-cta-text { font-size: 17px; }

          .s1-cta-countdown { font-size: 14px; padding: 6px 13px; }

          .s1-assist { font-size: 14px; margin-top: 18px; }

          .s1-compliance { font-size: 11px; margin-top: 34px; }
        }

        /* ═══════════════════════════════════════════════════════════════════
           移动端优化 - 极致体验（核心增强）
           ═══════════════════════════════════════════════════════════════════ */
        @media (max-width: 768px) {
          /* 1) 视口与安全区：不截断、可滚动、流畅 */
          .s1-back {
            padding: max(18px, env(safe-area-inset-top)) 16px max(18px, calc(env(safe-area-inset-bottom) + 10px));
            height: 100dvh;                  /* 解决 iOS/Safari 100vh 跳动 */
            overflow-y: auto;                /* 内部滚动不截断 */
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: contain;    /* 防止橡皮筋传递 */
            contain: paint style;            /* 允许 sticky 正常工作，保留性能优化 */
            scroll-padding-bottom: 96px;     /* 确保底部内容不被按钮遮挡 */

            /* ✅ 修复 Logo 与标题重叠（唯一功能性改动-移动端） */
            padding-top: calc(max(18px, env(safe-area-inset-top)) + 56px);
          }

          .s1-back-inner {
            max-width: 540px;
            margin: 0 auto;
            display: block;
          }

          /* 2) 文案可读性：更紧凑但不失“Quiet Luxury” */
          .s1-identity-ultimate {
            font-size: 15px;
            line-height: 1.45;
            margin-bottom: 12px;
          }

          .s1-urgency {
            font-size: 12.5px;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }

          /* 3) 列表密度：卡片更薄、间距更短，避免一屏放不下 */
          .s1-list { margin-bottom: 16px; }
          .s1-list-item {
            padding: 14px;
            margin-bottom: 16px;
            border-radius: 10px;
            gap: 12px;
            background:
              linear-gradient(135deg, rgba(184,149,106,0.045) 0%, rgba(184,149,106,0.015) 100%),
              linear-gradient(90deg, rgba(255,255,255,0.008) 0%, transparent 100%);
          }
          .s1-list-item::before { display: none; }

          .s1-list-title { font-size: 13.5px; margin-bottom: 4px; letter-spacing: 0.015em; }
          .s1-list-text  { font-size: 14px; line-height: 1.6; }

          .s1-urgency::after { display: none; }  /* 移动端去装饰，减少拥挤 */

          /* 4) CTA 可见性：粘在底部，保持可达性（不改 DOM） */
          .s1-cta {
            position: sticky;
            bottom: calc(env(safe-area-inset-bottom) + 6px);
            margin-top: 18px;
            padding-top: 8px;
            background: linear-gradient(180deg, rgba(10,22,40,0) 0%, rgba(10,22,40,0.75) 40%, rgba(10,22,40,0.9) 100%);
            backdrop-filter: blur(2px);
            -webkit-backdrop-filter: blur(2px);
          }

          .s1-cta-btn-ultimate {
            height: 52px;
            padding: 0 18px;
            border-radius: 12px;
          }
          .s1-cta-text { font-size: 15px; }
          .s1-cta-countdown { font-size: 12px; padding: 4px 10px; }

          /* 5) 辅助与合规：更紧凑，避免换行溢出 */
          .s1-assist { font-size: 12.5px; margin-top: 14px; }
          .s1-compliance {
            font-size: 9.5px;
            margin-top: 20px;
            opacity: 0.9;
          }

          /* 6) 动画频率小幅放缓，省电但不删动画 */
          .s1-list-dot.pulse { animation-duration: 3.6s; }

          /* 7) 触控友好：避免误触高亮 */
          .s1-cta-btn-ultimate::before { display: none; } /* 移除扫光，减少移动端分散 */
        }

        /* 极小屏（≤359px）进一步压缩密度 */
        @media (max-width: 359px) {
          .s1-back { 
            padding: max(14px, env(safe-area-inset-top)) 12px max(14px, calc(env(safe-area-inset-bottom) + 8px)); 
            /* ✅ 同步修复：极小屏也为 Logo 预留空间 */
            padding-top: calc(max(14px, env(safe-area-inset-top)) + 56px);
          }
          .s1-identity-ultimate { font-size: 14px; line-height: 1.4; }
          .s1-urgency { font-size: 12px; margin-bottom: 22px; }
          .s1-list-item { padding: 12px; gap: 10px; }
          .s1-list-title { font-size: 13px; }
          .s1-list-text { font-size: 13px; line-height: 1.55; }
          .s1-cta { margin-top: 14px; }
          .s1-cta-btn-ultimate { height: 50px; padding: 0 16px; }
          .s1-cta-text { font-size: 14px; }
          .s1-cta-countdown { font-size: 12px; padding: 4px 9px; }
          .s1-assist { font-size: 11px; margin-top: 12px; }
          .s1-compliance { font-size: 9px; margin-top: 18px; }
        }

        /* ═══════════════════════════════════════════════════════════════════
           无障碍降级 & 性能优化
           ═══════════════════════════════════════════════════════════════════ */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            will-change: auto !important;
          }
          
          .s1-identity-ultimate,
          .s1-urgency,
          .s1-list-item,
          .s1-cta,
          .s1-assist,
          .s1-compliance {
            opacity: 1 !important;
            transform: none !important;
          }

          .s1-cta-btn-ultimate::before { display: none; }
        }

        @media (prefers-contrast: high) {
          .s1-cta-btn-ultimate {
            border-width: 2px;
            border-color: #D4B896;
            background: rgba(212, 184, 150, 0.3);
          }
          .s1-cta-text { font-weight: 700; }
          .s1-compliance { color: rgba(184, 149, 106, 0.9); }
          .s1-list-item { border-width: 2px; border-color: rgba(184, 149, 106, 0.3); }
        }

        @media (prefers-color-scheme: dark) {
          .s1-back { background: #0A1628; }
          .s1-list-text { color: rgba(245, 245, 240, 0.9); }
        }

        @media (prefers-reduced-data: reduce) {
          .s1-back::after { display: none; }
          .s1-list-dot.pulse { animation: none; box-shadow: 0 0 8px rgba(212, 184, 150, 0.4); }
          .s1-cta-btn-ultimate::before { display: none; }
        }

        /* 标记 */
        .s1-identity-ultimate,
        .s1-urgency,
        .s1-list-item,
        .s1-cta,
        .s1-assist,
        .s1-compliance {
          animation-fill-mode: both;
        }
      `}</style>
    </section>
  );
}
