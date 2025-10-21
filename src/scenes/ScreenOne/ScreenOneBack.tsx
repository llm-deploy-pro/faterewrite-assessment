// src/scenes/ScreenOne/ScreenOneBack.tsx
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
    const isHttps = window.location.protocol === "https:";
    const secureFlag = isHttps ? "; Secure" : "";

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
  if (devMode && window.location.hostname === "localhost") {
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
    frid =
      "fr_" +
      Date.now().toString(36) +
      Math.random().toString(36).slice(2, 8);
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
    if (v !== undefined && v !== null && v !== "")
      u.searchParams.set(k, String(v));
  });
  return u.pathname + (u.search || "");
}

/* ✅ 消除 TS6133：引用 withParams 而不改变任何行为 */
void withParams;

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
    const isDev = window.location.hostname === "localhost";

    const timer = setTimeout(() => {
      if (typeof (window as any).fbq !== "undefined") {
        if (markOnce("s1bl", isDev)) {
          const eventId =
            "ev_" +
            Date.now().toString(36) +
            Math.random().toString(36).slice(2, 8);

          (window as any).fbq(
            "trackCustom",
            "S1_Back_Loaded",
            {
              content_name: "ScreenOne_Back",
              content_category: "Assessment_Offer",
              screen_position: "back",
              screen_number: 1,
              page_url: window.location.href,
              referrer: document.referrer,
              frid: frid,
            },
            {
              eventID: eventId,
            }
          );

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
    const isDev = window.location.hostname === "localhost";

    const dwellTimer = setTimeout(() => {
      if (typeof (window as any).fbq !== "undefined") {
        if (markOnce("s1be3", isDev)) {
          const eventId =
            "ev_" +
            Date.now().toString(36) +
            Math.random().toString(36).slice(2, 8);

          (window as any).fbq(
            "trackCustom",
            "S1_Back_Engaged_3s",
            {
              content_name: "ScreenOne_Back",
              content_category: "Assessment_Offer",
              engagement_type: "view_3s",
              screen_position: "back",
              screen_number: 1,
              page_url: window.location.href,
              referrer: document.referrer,
              frid: frid,
            },
            { eventID: eventId }
          );

          console.log(`[FB打点] S1_Back_Engaged_3s 触发成功`, {
            frid,
            eventId,
          });
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
    const fbEventId =
      "ev_" +
      Date.now().toString(36) +
      Math.random().toString(36).slice(2, 8);
    const isDev = window.location.hostname === "localhost";

    if (typeof (window as any).fbq !== "undefined") {
      if (markOnce("s1bcc", isDev)) {
        (window as any).fbq(
          "trackCustom",
          "S1_CTA_Click",
          {
            content_name: "Assessment_CTA",
            content_category: "Matching_Assessment",
            value: 49,
            currency: "USD",
            screen_position: "back",
            screen_number: 1,
            page_url: window.location.href,
            referrer: document.referrer,
            frid: frid,
          },
          { eventID: fbEventId }
        );

        console.log(`[FB打点] S1_CTA_Click (Back) 触发成功`, {
          frid,
          fbEventId,
        });
      }
    }

    hasClickedRef.current = true;
    try {
      localStorage.setItem("cta_clicked_assessment_49", "true");
    } catch (error) {
      console.warn("localStorage not available:", error);
    }

    // 离场动画
    document.documentElement.classList.add("page-leave");
    // 改为通过事件交由 ScreenOne 处理进入第二屏（不在此处跳转）
    // const url = withParams("/checkout", {
    //   frid,
    //   src: "s1_back",
    //   price: 49,
    //   fb_eid: fbEventId,
    // });
    setTimeout(() => {
      // 先派发内部事件，再由 ScreenOne 统一路由至第二屏
      window.dispatchEvent(new CustomEvent("s1:cta:continue"));
      // 保留降级的视觉清理
      requestAnimationFrame(() => {
        document.documentElement.classList.remove("page-leave");
        window.scrollTo(0, 0);
      });
    }, 220);
  };

  return (
    <section className="s1-back">
      {/* 品牌 Logo */}
      {/* @ts-expect-error 允许向 Wordmark 透传 className 以便定位（组件类型未显式声明该属性） */}
      <Wordmark className="wordmark" name="PRIME WINDOW" href="/" />

      {/* 顶部小字标签（动态避让 Wordmark） */}
      <p className="s1-back-top-label">System Alert — Pattern 7B Analysis</p>

      <div className="s1-back-inner">
        {/* 三行主标题 */}
        <div className="s1-identity-group">
          <p className="s1-identity-line">{COPY.lead[0]}</p>
          <p className="s1-identity-line accent">{COPY.lead[1]}</p>
          <p className="s1-identity-line urgent">{COPY.lead[2]}</p>
        </div>

        {/* 极致版价值点列表（严格不滚动） */}
        <ul className="s1-list">
          <li className="s1-list-item">
            <span className="s1-list-dot pulse" />
            <div className="s1-list-content">
              <p className="s1-list-title">{COPY.bullets[0].title}</p>
              <p className="s1-list-text">{COPY.bullets[0].text}</p>
            </div>
          </li>
          <li className="s1-list-item">
            <span className="s1-list-dot pulse" />
            <div className="s1-list-content">
              <p className="s1-list-title">{COPY.bullets[1].title}</p>
              <p className="s1-list-text">{COPY.bullets[1].text}</p>
            </div>
          </li>
          <li className="s1-list-item">
            <span className="s1-list-dot pulse" />
            <div className="s1-list-content">
              <p className="s1-list-title">{COPY.bullets[2].title}</p>
              <p className="s1-list-text">{COPY.bullets[2].text}</p>
            </div>
          </li>
        </ul>

        {/* CTA 按钮 - 极致版 */}
        <div className="s1-cta">
          <button
            type="button"
            onClick={handleCTAClick}
            className={`s1-cta-btn-ultimate ${isLoading ? "loading" : ""}`}
            aria-label={COPY.cta}
            disabled={isLoading}
          >
            <span className="s1-cta-text">
              {isLoading ? "Processing..." : COPY.cta}
            </span>
            <span className="s1-cta-countdown">117 left</span>
          </button>
        </div>

        {/* 辅助说明文字 - 极致版 */}
        <p className="s1-assist">{COPY.support}</p>

        {/* 合规文案 */}
        <p className="s1-compliance">{COPY.trust}</p>
      </div>

      <style>{`
        /* ═══════════════════════════════════════════════════════════════════
           【10/10 完美单屏方案】Destiny Debug Report
           ═══════════════════════════════════════════════════════════════════ */

        /* 页面离场动画 - GPU加速优化 */
        .page-leave .s1-back {
          opacity: 0;
          transform: translateY(-8px) scale(0.98) translateZ(0);
          filter: blur(4px);
          transition: all 220ms cubic-bezier(0.23, 1, 0.32, 1);
          will-change: opacity, transform, filter;
        }

        /* ── 全局变量：10分优化版 ── */
        :root {
          /* 完美平衡的顶部偏移 */
          --s1-offset: 75px;
          --s1-offset-md: 85px;
          
          /* 安全区 */
          --safe-top: env(safe-area-inset-top, 0px);
          --safe-right: env(safe-area-inset-right, 0px);
          --safe-bottom: env(safe-area-inset-bottom, 0px);
          --safe-left: env(safe-area-inset-left, 0px);
          
          /* Wordmark 定位 */
          --wm-top: calc(14px + var(--safe-top));
          --wm-left: calc(18px + var(--safe-left));
          --wm-h: 30px;
          
          /* 优化间距系统 - 移动端更舒适 */
          --gap-sm: 12px;
          --gap-md: 20px;
          --gap-lg: 28px;
        }

        /* ═══════════════════════════════════════════════════════════════════
           A. 容器布局 - 均匀分布优化
           ═══════════════════════════════════════════════════════════════════ */
        .s1-back {
          position: fixed;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 0 var(--safe-right) 0 var(--safe-left);
          z-index: 10;
          box-sizing: border-box;
          background: #0A1628;
          transform: translateZ(0);
          height: 100vh;
          height: 100svh;
          height: 100dvh;
          overflow: hidden;
          overscroll-behavior: none;
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

        /* Logo固定位置 - 微调优化 */
        .s1-back > .wordmark {
          position: absolute;
          top: var(--wm-top);
          left: var(--wm-left);
          z-index: 2;
          transform-origin: left center;
          height: var(--wm-h);
        }

        /* ═══════════════════════════════════════════════════════════════════
           顶部小字标签 - 优化位置和样式
           ═══════════════════════════════════════════════════════════════════ */
        .s1-back-top-label {
          position: absolute;
          top: calc(var(--wm-top) + var(--wm-h) + 10px);
          left: 50%;
          transform: translateX(-50%);
          margin: 0;
          padding: 0;
          font-size: 10.5px;
          line-height: 1;
          color: rgba(212, 184, 150, 0.7);
          font-family: 'Courier New', monospace;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          opacity: 0;
          animation: topLabelFadeIn 600ms ease 100ms forwards;
          text-shadow: 0 0 8px rgba(212, 184, 150, 0.18);
          z-index: 2;
        }

        @keyframes topLabelFadeIn {
          to { opacity: 1; }
        }

        /* 主内容区 - 优化分布 */
        .s1-back-inner {
          position: relative;
          width: 100%;
          max-width: 520px;
          height: calc(100dvh - var(--s1-offset) - var(--safe-bottom));
          margin-top: calc(var(--s1-offset) + var(--safe-top));
          padding: 0 20px calc(20px + var(--safe-bottom));
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          color: #F5F5F0;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
          overflow: hidden;
          box-sizing: border-box;
        }

        /* ═══════════════════════════════════════════════════════════════════
           B. 三行主标题组 - 10分可读性
           ═══════════════════════════════════════════════════════════════════ */
        .s1-identity-group {
          margin: 0;
          padding: 0 0 calc(var(--gap-sm) + 6px) 0;
          border-bottom: 1px solid rgba(212, 184, 150, 0.12);
          flex-shrink: 0;
        }

        .s1-identity-line {
          font-size: 15px;
          line-height: 1.45;
          color: rgba(245, 245, 240, 0.92);
          font-family: Georgia, 'Times New Roman', serif;
          font-weight: 500;
          text-align: center;
          margin: 0 0 6px 0;
          padding: 0;
          letter-spacing: -0.002em;
          opacity: 0;
          transform: translateY(4px) translateZ(0);
          animation: lineSlideIn 450ms cubic-bezier(0.23, 1, 0.32, 1) forwards;
          will-change: opacity, transform;
          text-wrap: balance;
        }

        .s1-identity-line:nth-child(1) { animation-delay: 150ms; }
        .s1-identity-line:nth-child(2) { animation-delay: 250ms; }
        .s1-identity-line:nth-child(3) { animation-delay: 350ms; }

        .s1-identity-line.accent {
          color: #D4B896;
          font-weight: 600;
          font-size: 16px;
        }

        .s1-identity-line.urgent {
          color: rgba(212, 184, 150, 0.88);
          font-style: italic;
          font-size: 14px;
          margin-bottom: 0;
          position: relative;
        }

        .s1-identity-line.urgent::after {
          content: '⏱';
          position: absolute;
          right: -20px;
          top: 50%;
          transform: translateY(-50%) translateZ(0);
          font-size: 13px;
          opacity: 0.5;
          animation: timePulse 3s ease-in-out infinite;
        }

        @keyframes lineSlideIn {
          to {
            opacity: 1;
            transform: translateY(0) translateZ(0);
            will-change: auto;
          }
        }

        @keyframes timePulse {
          0%, 100% {
            opacity: 0.35;
            transform: translateY(-50%) translateZ(0) scale(1);
          }
          50% {
            opacity: 0.7;
            transform: translateY(-50%) translateZ(0) scale(1.12);
          }
        }

        /* ═══════════════════════════════════════════════════════════════════
           C. 列表样式 - 10分空间利用
           ═══════════════════════════════════════════════════════════════════ */
        .s1-list {
          list-style: none;
          margin: var(--gap-sm) 0;
          padding: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 14px;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
        }

        /* 隐藏滚动条 */
        .s1-list::-webkit-scrollbar {
          display: none;
        }

        .s1-list {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .s1-list-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin: 0;
          padding: 14px;
          background:
            linear-gradient(135deg,
              rgba(184, 149, 106, 0.05) 0%,
              rgba(184, 149, 106, 0.018) 100%
            ),
            linear-gradient(90deg,
              rgba(255, 255, 255, 0.012) 0%,
              transparent 100%
            );
          border: 1px solid rgba(184, 149, 106, 0.14);
          border-radius: 11px;
          opacity: 0;
          transform: translateY(6px) translateZ(0);
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
                rgba(184, 149, 106, 0.07) 0%,
                rgba(184, 149, 106, 0.028) 100%
              ),
              linear-gradient(90deg,
                rgba(255, 255, 255, 0.02) 0%,
                transparent 100%
              );
            border-color: rgba(184, 149, 106, 0.22);
            transform: translateX(3px) translateZ(0);
            box-shadow:
              0 5px 16px rgba(212, 184, 150, 0.1),
              inset 0 1px 0 rgba(212, 184, 150, 0.05);
          }

          .s1-list-item:hover .s1-list-title {
            color: #E5D4B1;
          }
        }

        .s1-list-item:nth-child(1) { animation-delay: 480ms; }
        .s1-list-item:nth-child(2) { animation-delay: 620ms; }
        .s1-list-item:nth-child(3) { animation-delay: 760ms; }

        .s1-list-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 2px;
          background: linear-gradient(180deg,
            rgba(212, 184, 150, 0.35) 0%,
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
          width: 7px;
          height: 7px;
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

        .s1-list-dot.pulse {
          animation: dotPulse 3s ease-in-out infinite;
        }

        @keyframes dotPulse {
          0%, 100% {
            box-shadow:
              0 0 10px rgba(212, 184, 150, 0.35),
              inset 0 -1px 2px rgba(0, 0, 0, 0.1);
            transform: scale(1) translateZ(0);
          }
          50% {
            box-shadow:
              0 0 16px rgba(212, 184, 0, 0.5),
              inset 0 -1px 2px rgba(0, 0, 0, 0.1);
            transform: scale(1.18) translateZ(0);
          }
        }

        .s1-list-content {
          flex: 1;
          min-width: 0;
        }

        .s1-list-title {
          margin: 0 0 4px 0;
          font-size: 13px;
          font-weight: 600;
          color: #D4B896;
          font-family: Georgia, 'Times New Roman', serif;
          letter-spacing: 0.018em;
          transition: color 250ms ease;
        }

        .s1-list-text {
          margin: 0;
          font-size: 13px;
          line-height: 1.55;
          font-weight: 400;
          font-family: Georgia, 'Times New Roman', serif;
          color: rgba(245, 245, 240, 0.88);
          letter-spacing: 0.005em;
          word-break: break-word;
          overflow-wrap: anywhere;
          hyphens: auto;
        }

        /* ═══════════════════════════════════════════════════════════════════
           D. CTA按钮 - 10分视觉重量
           ═══════════════════════════════════════════════════════════════════ */
        .s1-cta {
          margin: var(--gap-sm) 0 0 0;
          opacity: 0;
          transform: translateY(4px) translateZ(0);
          animation: itemFadeIn 360ms cubic-bezier(0.23, 1, 0.32, 1) 950ms forwards;
          will-change: opacity, transform;
          flex-shrink: 0;
        }

        .s1-cta-btn-ultimate {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          height: 52px;
          padding: 0 22px;
          border-radius: 12px;
          background:
            linear-gradient(135deg,
              rgba(212, 184, 150, 0.22) 0%,
              rgba(184, 149, 106, 0.15) 100%
            ),
            linear-gradient(180deg,
              rgba(255, 255, 255, 0.045) 0%,
              transparent 100%
            );
          border: 1.5px solid rgba(212, 184, 150, 0.6);
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          transition: all 280ms cubic-bezier(0.23, 1, 0.32, 1);
          position: relative;
          overflow: hidden;
          transform: translateZ(0);
          backface-visibility: hidden;
          box-shadow:
            0 4px 10px rgba(0, 0, 0, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.04);
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

        .s1-cta-btn-ultimate:hover::before {
          transform: translateX(200%) translateZ(0);
        }

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

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .s1-cta-text {
          color: #FFFFFF;
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.012em;
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        .s1-cta-countdown {
          color: #D4B896;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 11px;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(212, 184, 150, 0.18);
          border-radius: 12px;
          position: relative;
          z-index: 1;
          animation: countdownPulse 2.5s ease-in-out infinite;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        @keyframes countdownPulse {
          0%, 100% { opacity: 0.88; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.04); }
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
            transform: translateY(-1px) translateZ(0);
            box-shadow:
              0 12px 28px rgba(212, 184, 150, 0.16),
              0 5px 12px rgba(0, 0, 0, 0.12),
              inset 0 1px 0 rgba(255, 255, 255, 0.05);
          }

          .s1-cta-btn-ultimate:hover .s1-cta-countdown {
            background: rgba(0, 0, 0, 0.5);
            border-color: rgba(212, 184, 150, 0.25);
          }
        }

        .s1-cta-btn-ultimate:active:not(:disabled):not(.loading) {
          transform: scale(0.98) translateZ(0);
          transition: transform 100ms ease;
          box-shadow:
            0 2px 4px rgba(0, 0, 0, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.03);
        }

        .s1-cta-btn-ultimate:focus-visible {
          outline: 2px solid rgba(212, 184, 150, 0.5);
          outline-offset: 3px;
        }

        /* ═══════════════════════════════════════════════════════════════════
           E. 辅助与合规 - 10分布局
           ═══════════════════════════════════════════════════════════════════ */
        .s1-assist {
          margin: var(--gap-sm) 0 0;
          padding: 0;
          font-size: 12px;
          line-height: 1.5;
          text-align: center;
          color: rgba(212, 184, 150, 0.92);
          opacity: 0;
          font-family: Georgia, 'Times New Roman', serif;
          font-style: italic;
          font-weight: 500;
          letter-spacing: 0.012em;
          animation: itemFadeIn 360ms cubic-bezier(0.23, 1, 0.32, 1) 1050ms forwards;
          will-change: opacity, transform;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
          flex-shrink: 0;
        }

        .s1-compliance {
          margin: 8px 0 0;
          padding: 0;
          font-size: 10px;
          line-height: 1.6;
          text-align: center;
          color: rgba(184, 149, 106, 0.65);
          opacity: 0;
          font-family: Georgia, 'Times New Roman', serif;
          font-style: italic;
          letter-spacing: 0.022em;
          animation: itemFadeIn 360ms cubic-bezier(0.23, 1, 0.32, 1) 1150ms forwards;
          will-change: opacity, transform;
          flex-shrink: 0;
        }

        /* ═══════════════════════════════════════════════════════════════════
           桌面端适配
           ═══════════════════════════════════════════════════════════════════ */
        @media (min-width: 769px) {
          :root {
            --wm-h: 34px;
            --gap-sm: 14px;
            --gap-md: 24px;
            --gap-lg: 32px;
          }

          .s1-back {
            padding: 0 calc(32px + var(--safe-right)) 0 calc(32px + var(--safe-left));
          }

          .s1-back-inner {
            max-width: 600px;
            height: calc(100dvh - var(--s1-offset-md) - var(--safe-bottom));
            margin-top: calc(var(--s1-offset-md) + var(--safe-top));
            padding: 0 24px calc(24px + var(--safe-bottom));
          }

          .s1-back-top-label {
            font-size: 12px;
            top: calc(var(--wm-top) + var(--wm-h) + 12px);
          }

          .s1-identity-group {
            padding-bottom: calc(var(--gap-sm) + 8px);
            border-bottom: 1px solid rgba(212, 184, 150, 0.14);
          }

          .s1-identity-line {
            font-size: 18px;
            line-height: 1.5;
            margin-bottom: 8px;
          }

          .s1-identity-line.accent { font-size: 19px; }
          .s1-identity-line.urgent { font-size: 16px; }

          .s1-list {
            margin: var(--gap-md) 0;
            gap: 16px;
          }

          .s1-list-item {
            padding: 16px;
            gap: 14px;
            border-radius: 12px;
          }

          .s1-list-title {
            font-size: 14px;
            margin-bottom: 5px;
          }

          .s1-list-text {
            font-size: 15px;
            line-height: 1.65;
          }

          .s1-list-dot {
            width: 8px;
            height: 8px;
            margin-top: 7px;
          }

          .s1-cta {
            margin-top: var(--gap-md);
          }

          .s1-cta-btn-ultimate {
            height: 58px;
            padding: 0 28px;
            border-radius: 14px;
          }

          .s1-cta-text { font-size: 17px; }

          .s1-cta-countdown {
            font-size: 13px;
            padding: 5px 12px;
          }

          .s1-assist {
            font-size: 14px;
            margin-top: var(--gap-sm);
          }

          .s1-compliance {
            font-size: 11px;
            margin-top: var(--gap-sm);
          }
        }

        /* ═══════════════════════════════════════════════════════════════════
           移动端优化 - 10分完美体验
           ═══════════════════════════════════════════════════════════════════ */
        @media (max-width: 768px) {
          .s1-back {
            padding: 0 var(--safe-right) 0 var(--safe-left);
          }

          .s1-back > .wordmark {
            transform: scale(0.92);
            transform-origin: left center;
          }

          .s1-back-inner {
            max-width: 100%;
            height: calc(100dvh - var(--s1-offset) - var(--safe-bottom));
            margin-top: calc(var(--s1-offset) + var(--safe-top));
            padding: 0 18px calc(18px + var(--safe-bottom));
          }

          .s1-back-top-label {
            font-size: 10px;
            letter-spacing: 0.09em;
          }

          /* 移动端完美间距 */
          .s1-identity-group {
            padding-bottom: var(--gap-sm);
          }

          .s1-identity-line {
            font-size: 14.5px;
            line-height: 1.4;
            margin-bottom: 5px;
          }

          .s1-identity-line.accent { font-size: 15.5px; }
          .s1-identity-line.urgent {
            font-size: 13px;
            margin-top: 2px;
          }

          .s1-identity-line.urgent::after { display: none; }

          .s1-list {
            margin: var(--gap-sm) 0;
            gap: 12px;
          }

          .s1-list-item {
            padding: 12px;
            gap: 11px;
            border-radius: 10px;
          }

          .s1-list-item::before { display: none; }

          .s1-list-dot {
            width: 6px;
            height: 6px;
            margin-top: 5px;
          }

          .s1-list-title {
            font-size: 12.5px;
            margin-bottom: 3px;
            letter-spacing: 0.015em;
          }

          .s1-list-text {
            font-size: 12px;
            line-height: 1.5;
          }

          .s1-cta {
            margin-top: var(--gap-sm);
          }

          .s1-cta-btn-ultimate {
            height: 50px;
            padding: 0 20px;
            border-radius: 11px;
          }

          .s1-cta-text { font-size: 14.5px; }
          .s1-cta-countdown {
            font-size: 11.5px;
            padding: 4px 10px;
          }

          .s1-assist {
            font-size: 11.5px;
            margin-top: 10px;
          }

          .s1-compliance {
            font-size: 9.5px;
            margin-top: 8px;
          }

          /* 动画优化 */
          .s1-list-dot.pulse {
            animation-duration: 3.6s;
          }

          /* 移除桌面端hover效果 */
          .s1-cta-btn-ultimate::before { display: none; }
        }

        /* 极小屏（≤359px）进一步压缩 */
        @media (max-width: 359px) {
          :root {
            --wm-h: 26px;
            --s1-offset: 70px;
            --gap-sm: 10px;
            --gap-md: 16px;
          }

          .s1-back > .wordmark {
            transform: scale(0.88);
          }

          .s1-back-inner {
            padding: 0 14px calc(14px + var(--safe-bottom));
          }

          .s1-back-top-label {
            font-size: 9px;
          }

          .s1-identity-line {
            font-size: 13px;
            line-height: 1.35;
            margin-bottom: 4px;
          }

          .s1-identity-line.accent { font-size: 14px; }
          .s1-identity-line.urgent { font-size: 12px; }

          .s1-list {
            gap: 10px;
          }

          .s1-list-item {
            padding: 10px;
            gap: 9px;
          }

          .s1-list-title { font-size: 11.5px; }
          .s1-list-text {
            font-size: 11px;
            line-height: 1.45;
          }

          .s1-cta-btn-ultimate {
            height: 46px;
            padding: 0 17px;
          }

          .s1-cta-text { font-size: 13.5px; }
          .s1-cta-countdown {
            font-size: 11px;
            padding: 3px 9px;
          }

          .s1-assist {
            font-size: 10.5px;
            margin-top: 9px;
          }

          .s1-compliance {
            font-size: 9px;
            margin-top: 7px;
          }
        }

        /* 横屏特殊处理 */
        @media (max-height: 500px) and (orientation: landscape) {
          :root {
            --s1-offset: 50px;
            --gap-sm: 6px;
            --gap-md: 10px;
          }

          .s1-back-inner {
            padding: 0 20px calc(12px + var(--safe-bottom));
          }

          .s1-back > .wordmark {
            transform: scale(0.8);
          }

          .s1-back-top-label {
            font-size: 8px;
            top: calc(var(--wm-top) + var(--wm-h) + 4px);
          }

          .s1-identity-group {
            padding-bottom: 6px;
          }

          .s1-identity-line {
            font-size: 11px;
            margin-bottom: 2px;
            line-height: 1.25;
          }

          .s1-list {
            gap: 6px;
            margin: 6px 0;
          }

          .s1-list-item {
            padding: 6px;
          }

          .s1-cta-btn-ultimate {
            height: 40px;
          }

          .s1-assist {
            margin-top: 6px;
            font-size: 10px;
          }
          
          .s1-compliance {
            margin-top: 4px;
            font-size: 8.5px;
          }
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

          .s1-back-top-label,
          .s1-identity-line,
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
          .s1-list-item {
            border-width: 1.5px;
            border-color: rgba(184, 149, 106, 0.3);
          }
        }

        @media (prefers-color-scheme: dark) {
          .s1-back { background: #0A1628; }
          .s1-list-text { color: rgba(245, 245, 240, 0.9); }
        }

        @media (prefers-reduced-data: reduce) {
          .s1-back::after { display: none; }
          .s1-list-dot.pulse {
            animation: none;
            box-shadow: 0 0 8px rgba(212,184,150,0.35);
          }
          .s1-cta-btn-ultimate::before { display: none; }
        }

        /* 标记 */
        .s1-back-top-label,
        .s1-identity-line,
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
