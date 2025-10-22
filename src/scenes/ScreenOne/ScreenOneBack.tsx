// src/scenes/ScreenOne/ScreenOneBack.tsx
import { useEffect, useRef, useState } from "react";
import Wordmark from "@/components/Wordmark";

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
    hasClickedRef.current = true;

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

    try {
      localStorage.setItem("cta_clicked_assessment_49", "true");
    } catch (error) {
      console.warn("localStorage not available:", error);
    }

    // 离场动画
    document.documentElement.classList.add("page-leave");
    
    // ✅ 修改部分：在延迟后直接跳转到支付链接，并附带追踪参数
    setTimeout(() => {
      const checkoutUrl = new URL('https://pay.faterewrite.com/');
      checkoutUrl.searchParams.set('frid', frid);
      checkoutUrl.searchParams.set('fb_eid', fbEventId);
      window.location.href = checkoutUrl.toString();
    }, 250);
  };

  return (
    <section className="s1-back">
      {/* 品牌 Logo */}
      {/* @ts-expect-error 允许向 Wordmark 透传 className 以便定位（组件类型未显式声明该属性） */}
      <Wordmark className="wordmark" name="PRIME WINDOW" href="/" />

      {/* 顶部小字标签（Phase B 更新） */}
      <p className="s1-back-top-label">READOUT: SIGNATURE 7B-DELTA. TRAJECTORY ANALYSIS COMPLETE.</p>

      <div className="s1-back-inner">
        {/* Phase B 主标题更新 */}
        <div className="s1-identity-group">
          <p className="s1-identity-line">Analysis confirms timeline drift.</p>
          <p className="s1-identity-line accent">A terminal Failure Barrier is projected</p>
          <p className="s1-identity-line urgent">at the 85–88% completion threshold.</p>
        </div>

        {/* Phase B 价值点列表更新 */}
        <ul className="s1-list">
          <li className="s1-list-item">
            <span className="s1-list-dot pulse" />
            <div className="s1-list-content">
              <p className="s1-list-title">Dominant Cluster</p>
              <p className="s1-list-text">Late-threshold hijack; outcome collapses pre-landing.</p>
            </div>
          </li>
          <li className="s1-list-item">
            <span className="s1-list-dot pulse" />
            <div className="s1-list-content">
              <p className="s1-list-title">Primary Locus</p>
              <p className="s1-list-text">Trajectory based on your previous input.</p>
            </div>
          </li>
          <li className="s1-list-item">
            <span className="s1-list-dot pulse" />
            <div className="s1-list-content">
              <p className="s1-list-title">Prime Window</p>
              <p className="s1-list-text">48-hour execution envelope post-compilation.</p>
            </div>
          </li>
        </ul>

        {/* PROTOCOL COMPONENTS 标题 */}
        <div className="s1-protocol-header">
          <p className="s1-protocol-title">PROTOCOL COMPONENTS:</p>
        </div>

        {/* Phase B 协议组件列表 */}
        <ul className="s1-protocol-list">
          <li className="s1-protocol-item">
            <span className="s1-protocol-label">The Signal Map (Diagnostic):</span>
            <span className="s1-protocol-text">Deconstructs the 3 core misroute subroutines & maps your current vector.</span>
          </li>
          <li className="s1-protocol-item">
            <span className="s1-protocol-label">The Constraint Keys (Corrective):</span>
            <span className="s1-protocol-text">A 7-day protocol to nullify active decoy loops.</span>
          </li>
          <li className="s1-protocol-item">
            <span className="s1-protocol-label">The Override Script (Executive):</span>
            <span className="s1-protocol-text">A 48-hour micro-action sequence to force timeline correction.</span>
          </li>
        </ul>

        {/* CTA区域 - Phase B 更新 */}
        <div className="s1-cta">
          {/* 倒计时（保留原有的动态逻辑） */}
          <div className="s1-cta-countdown">
            <span className="s1-cta-countdown-icon" />
            <span>PROTOCOL COMPILED. AWAITING EXECUTION.</span>
          </div>

          {/* CTA按钮 - 更新文案为 EXECUTE PROTOCOL */}
          <button
            className={`s1-cta-btn-ultimate ${isLoading ? "loading" : ""}`}
            onClick={handleCTAClick}
            disabled={isLoading}
            aria-label="Execute Protocol - Start Assessment"
          >
            <span className="s1-cta-text">
              {isLoading ? "LOADING..." : "EXECUTE PROTOCOL"}
            </span>
          </button>

          {/* 辅助文案 - Phase B 更新 */}
          <p className="s1-assist">
            Execution is instant. Access via secure link & encrypted PDF.
          </p>
        </div>

        {/* 合规说明 - Phase B 更新 */}
        <p className="s1-compliance">
          One-time fee: $49. No recurring subscription. Transaction receipt logged.{" "}
          <a href="/terms" className="s1-compliance-link">Terms of Service</a> · 
          <a href="/privacy" className="s1-compliance-link">Privacy Mandate</a> · 
          <a href="/refund" className="s1-compliance-link">Refund Protocol</a>
        </p>
      </div>

      {/* 样式（保持原有的所有样式不变，只添加新的Protocol组件样式） */}
      {/* @ts-expect-error TypeScript doesn't know about the jsx prop from styled-jsx */}
      <style jsx>{`
        /* ═══════════════════════════════════════════════════════════════════
           全局重置和CSS变量
           ═══════════════════════════════════════════════════════════════════ */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        :root {
          /* 品牌色彩系统 */
          --c-bg: #0A1128;
          --c-gold: #D4B896;
          --c-gold-bright: #F2D7B3;
          --c-gold-muted: #B8956A;
          --c-cream: #F5F5F0;
          --c-cream-soft: rgba(245,245,240,0.92);
          --c-dark-blue: #080E1F;
          
          /* 字体定义 */
          --ff-display: 'Playfair Display', Georgia, serif;
          --ff-mono: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
          --ff-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          
          /* Wordmark相关 */
          --wm-h: 30px;
          --wm-top: 18px;
          --wm-color: #D4B896;
          
          /* 间距系统 */
          --gap-xs: 8px;
          --gap-sm: 14px;
          --gap-md: 20px;
          --gap-lg: 28px;
          
          /* 布局偏移 */
          --s1-offset: 80px;
          
          /* 安全区 */
          --safe-top: env(safe-area-inset-top, 0);
          --safe-bottom: env(safe-area-inset-bottom, 0);
        }

        /* ═══════════════════════════════════════════════════════════════════
           容器与布局 - 🔧 禁止滚动，固定视口
           ═══════════════════════════════════════════════════════════════════ */
        .s1-back {
          position: relative;
          width: 100%;
          min-height: 100vh;
          min-height: 100dvh;
          height: 100vh; /* 🔧 固定高度 */
          height: 100dvh; /* 🔧 固定高度 */
          background: var(--c-bg);
          display: flex;
          flex-direction: column;
          overflow: hidden; /* 🔧 严格禁止滚动 */
        }

        /* 高级背景纹理 */
        .s1-back::after {
          content: '';
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(
              circle at 50% 30%,
              rgba(212,184,150,0.03) 0%,
              transparent 70%
            );
          pointer-events: none;
          mix-blend-mode: screen;
          will-change: opacity;
          opacity: 0.8;
        }

        /* Wordmark样式 */
        .s1-back > .wordmark {
          position: fixed;
          top: calc(var(--wm-top) + var(--safe-top));
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          height: var(--wm-h);
          color: var(--wm-color);
          opacity: 0;
          animation: glow-in 1.2s cubic-bezier(0.16, 0, 0.3, 1) 0.2s both;
        }

        /* 顶部标签 - Phase B 样式更新 */
        .s1-back-top-label {
          position: fixed;
          top: calc(var(--wm-top) + var(--wm-h) + 8px + var(--safe-top));
          left: 50%;
          transform: translateX(-50%);
          font-family: var(--ff-mono);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.12em;
          color: rgba(212,184,150,0.65);
          text-transform: uppercase;
          text-align: center;
          line-height: 1;
          z-index: 999;
          opacity: 0;
          animation: fade-in 0.8s ease-out 0.5s both;
          white-space: nowrap;
        }

        /* 内容容器 - 🔧 禁止滚动，使用固定高度和间距优化 */
        .s1-back-inner {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 640px;
          margin: 0 auto;
          padding: 0 20px calc(20px + var(--safe-bottom)); /* 🔧 简化padding */
          height: calc(100% - (var(--s1-offset) + var(--safe-top))); /* 🔧 固定高度 */
          margin-top: calc(var(--s1-offset) + var(--safe-top));
          
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          gap: 0;
          
          overflow-y: hidden; /* 🔧 严格禁止滚动 */
          overflow-x: hidden;
        }

        /* ═══════════════════════════════════════════════════════════════════
           身份验证组（主标题区）
           ═══════════════════════════════════════════════════════════════════ */
        .s1-identity-group {
          padding-bottom: var(--gap-md);
          opacity: 0;
          animation: slide-up 0.9s cubic-bezier(0.16, 0, 0.3, 1) 0.7s both;
        }

        .s1-identity-line {
          font-family: var(--ff-sans);
          font-size: 16px;
          font-weight: 400;
          line-height: 1.5;
          color: var(--c-cream-soft);
          margin-bottom: 6px;
          letter-spacing: 0.01em;
        }

        .s1-identity-line.accent {
          font-size: 17px;
          font-weight: 500;
          color: var(--c-gold-bright);
        }

        .s1-identity-line.urgent {
          font-size: 14.5px;
          font-weight: 600;
          color: var(--c-gold);
          margin-top: 4px;
          position: relative;
          display: inline-block;
        }

        .s1-identity-line.urgent::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            var(--c-gold) 20%,
            var(--c-gold) 80%,
            transparent 100%
          );
          opacity: 0.4;
          animation: pulse-line 3s ease-in-out infinite;
        }

        @keyframes pulse-line {
          0%, 100% { opacity: 0.3; transform: scaleX(0.95); }
          50% { opacity: 0.6; transform: scaleX(1); }
        }

        /* ═══════════════════════════════════════════════════════════════════
           价值点列表（极致版）
           ═══════════════════════════════════════════════════════════════════ */
        .s1-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin: var(--gap-md) 0;
          padding: 0;
        }

        .s1-list-item {
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px;
          background: rgba(212,184,150,0.04);
          border: 1px solid rgba(184, 149, 106, 0.12);
          border-radius: 12px;
          transition: all 0.4s cubic-bezier(0.16, 0, 0.3, 1);
          opacity: 0;
          animation: slide-up 0.8s cubic-bezier(0.16, 0, 0.3, 1) both;
          animation-delay: calc(0.9s + var(--item-index, 0) * 0.12s);
        }

        .s1-list-item:nth-child(1) { --item-index: 0; }
        .s1-list-item:nth-child(2) { --item-index: 1; }
        .s1-list-item:nth-child(3) { --item-index: 2; }

        /* 装饰光晕 */
        .s1-list-item::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 12px;
          background: linear-gradient(
            135deg,
            rgba(212,184,150,0.1) 0%,
            transparent 50%
          );
          opacity: 0;
          transition: opacity 0.6s ease;
          pointer-events: none;
        }

        .s1-list-item:hover::before {
          opacity: 1;
        }

        /* 金色指示点 */
        .s1-list-dot {
          flex-shrink: 0;
          width: 7px;
          height: 7px;
          margin-top: 6px;
          border-radius: 50%;
          background: var(--c-gold);
          box-shadow: 0 0 12px rgba(212,184,150,0.4);
        }

        .s1-list-dot.pulse {
          animation: dot-pulse 3s ease-in-out infinite;
        }

        @keyframes dot-pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 12px rgba(212,184,150,0.4);
          }
          50% {
            transform: scale(1.3);
            box-shadow: 0 0 20px rgba(212,184,150,0.6);
          }
        }

        /* 列表内容 */
        .s1-list-content {
          flex: 1;
          min-width: 0;
        }

        .s1-list-title {
          font-family: var(--ff-sans);
          font-size: 13.5px;
          font-weight: 600;
          color: var(--c-gold);
          margin-bottom: 4px;
          letter-spacing: 0.02em;
          text-transform: uppercase;
        }

        .s1-list-text {
          font-family: var(--ff-sans);
          font-size: 13px;
          font-weight: 400;
          line-height: 1.55;
          color: rgba(245,245,240,0.85);
          letter-spacing: 0.01em;
        }

        /* ═══════════════════════════════════════════════════════════════════
           Protocol Components 样式
           ═══════════════════════════════════════════════════════════════════ */
        .s1-protocol-header {
          margin-top: var(--gap-md);
          margin-bottom: var(--gap-sm);
          opacity: 0;
          animation: slide-up 0.8s cubic-bezier(0.16, 0, 0.3, 1) 1.3s both;
        }

        .s1-protocol-title {
          font-family: var(--ff-mono);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.15em;
          color: var(--c-gold-muted);
          text-transform: uppercase;
        }

        .s1-protocol-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: var(--gap-md);
          padding: 0;
        }

        .s1-protocol-item {
          font-family: var(--ff-sans);
          font-size: 12.5px;
          line-height: 1.5;
          color: var(--c-cream-soft);
          opacity: 0;
          animation: slide-up 0.8s cubic-bezier(0.16, 0, 0.3, 1) both;
          animation-delay: calc(1.4s + var(--protocol-index, 0) * 0.1s);
        }

        .s1-protocol-item:nth-child(1) { --protocol-index: 0; }
        .s1-protocol-item:nth-child(2) { --protocol-index: 1; }
        .s1-protocol-item:nth-child(3) { --protocol-index: 2; }

        .s1-protocol-label {
          font-weight: 600;
          color: var(--c-gold-bright);
        }

        .s1-protocol-text {
          font-weight: 400;
          color: rgba(245,245,240,0.8);
        }

        /* ═══════════════════════════════════════════════════════════════════
           CTA区域（极致优化版）
           ═══════════════════════════════════════════════════════════════════ */
        .s1-cta {
          margin-top: auto;
          padding-top: var(--gap-sm);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          opacity: 0;
          animation: slide-up 0.9s cubic-bezier(0.16, 0, 0.3, 1) 1.6s both;
        }

        /* 倒计时 - Phase B 样式调整 */
        .s1-cta-countdown {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          background: rgba(212,184,150,0.08);
          border: 1px solid rgba(212,184,150,0.2);
          border-radius: 20px;
          font-family: var(--ff-mono);
          font-size: 12px;
          font-weight: 500;
          color: var(--c-gold-bright);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .s1-cta-countdown-icon {
          width: 5px;
          height: 5px;
          background: var(--c-gold);
          border-radius: 50%;
          animation: blink 1.5s ease-in-out infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }

        /* 终极CTA按钮 */
        .s1-cta-btn-ultimate {
          position: relative;
          width: 100%;
          max-width: 320px;
          height: 54px;
          padding: 0 24px;
          
          display: flex;
          align-items: center;
          justify-content: center;
          
          background: linear-gradient(
            135deg,
            rgba(212,184,150,0.15) 0%,
            rgba(212,184,150,0.08) 100%
          );
          border: 1.5px solid var(--c-gold-muted);
          border-radius: 12px;
          
          font-family: var(--ff-sans);
          font-size: 16px;
          font-weight: 700;
          color: var(--c-gold-bright);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          
          cursor: pointer;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.16, 0, 0.3, 1);
          
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          transform: translateZ(0);
        }

        /* 悬浮光波 */
        .s1-cta-btn-ultimate::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 12px;
          background: linear-gradient(
            135deg,
            var(--c-gold),
            var(--c-gold-bright),
            var(--c-gold)
          );
          background-size: 200% 200%;
          opacity: 0;
          transition: opacity 0.6s ease;
          animation: shimmer 3s linear infinite;
          pointer-events: none;
          z-index: -1;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0%; }
          100% { background-position: -200% 0%; }
        }

        .s1-cta-btn-ultimate:hover::before {
          opacity: 0.15;
        }

        .s1-cta-btn-ultimate:hover {
          transform: translateY(-1px);
          box-shadow: 
            0 8px 24px rgba(212,184,150,0.25),
            inset 0 1px 0 rgba(242,215,179,0.2);
          border-color: var(--c-gold);
          background: linear-gradient(
            135deg,
            rgba(212,184,150,0.2) 0%,
            rgba(212,184,150,0.12) 100%
          );
        }

        .s1-cta-btn-ultimate:active {
          transform: translateY(0);
          transition-duration: 0.1s;
        }

        .s1-cta-btn-ultimate.loading {
          pointer-events: none;
          opacity: 0.8;
        }

        .s1-cta-btn-ultimate.loading .s1-cta-text {
          animation: pulse-text 1.2s ease-in-out infinite;
        }

        @keyframes pulse-text {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        .s1-cta-text {
          position: relative;
          z-index: 1;
        }

        /* 辅助文案 */
        .s1-assist {
          font-family: var(--ff-sans);
          font-size: 12.5px;
          font-weight: 400;
          color: rgba(245,245,240,0.7);
          text-align: center;
          line-height: 1.4;
          letter-spacing: 0.01em;
          margin-top: 8px;
          opacity: 0;
          animation: fade-in 0.8s ease 1.8s both;
        }

        /* 合规说明 */
        .s1-compliance {
          font-family: var(--ff-sans);
          font-size: 10.5px;
          font-weight: 400;
          color: rgba(184, 149, 106, 0.6);
          text-align: center;
          line-height: 1.5;
          letter-spacing: 0.02em;
          margin-top: 10px;
          opacity: 0;
          animation: fade-in 0.8s ease 1.9s both;
        }

        .s1-compliance-link {
          color: rgba(184, 149, 106, 0.7);
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .s1-compliance-link:hover {
          color: var(--c-gold-muted);
        }

        /* ═══════════════════════════════════════════════════════════════════
           核心动画定义
           ═══════════════════════════════════════════════════════════════════ */
        @keyframes glow-in {
          0% {
            opacity: 0;
            filter: blur(8px);
            transform: translateX(-50%) scale(0.9);
          }
          100% {
            opacity: 1;
            filter: blur(0);
            transform: translateX(-50%) scale(1);
          }
        }

        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }

        @keyframes slide-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* ═══════════════════════════════════════════════════════════════════
           离场动画（全局）
           ═══════════════════════════════════════════════════════════════════ */
        :global(.page-leave) .s1-back > .wordmark {
          animation: leave-up 0.4s cubic-bezier(0.4, 0, 1, 1) both;
        }

        :global(.page-leave) .s1-back-top-label {
          animation: leave-fade 0.3s ease both;
        }

        :global(.page-leave) .s1-identity-group,
        :global(.page-leave) .s1-list-item,
        :global(.page-leave) .s1-protocol-header,
        :global(.page-leave) .s1-protocol-item,
        :global(.page-leave) .s1-cta,
        :global(.page-leave) .s1-assist,
        :global(.page-leave) .s1-compliance {
          animation: leave-down 0.4s cubic-bezier(0.4, 0, 1, 1) both;
        }

        @keyframes leave-up {
          to {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
        }

        @keyframes leave-fade {
          to { opacity: 0; }
        }

        @keyframes leave-down {
          to {
            opacity: 0;
            transform: translateY(15px);
          }
        }

        /* ═══════════════════════════════════════════════════════════════════
           响应式设计（移动端优先）- 🔧 移动端绝对优先，严格禁止滚动
           ═══════════════════════════════════════════════════════════════════ */
        @media (max-width: 768px) {
          :root {
            --wm-h: 26px; /* 🔧 减小Logo高度 */
            --s1-offset: 68px; /* 🔧 减小顶部偏移 */
            --gap-sm: 10px; /* 🔧 压缩间距 */
            --gap-md: 14px; /* 🔧 压缩间距 */
          }

          .s1-back > .wordmark {
            transform: translateX(-50%) scale(0.9); /* 🔧 缩小Logo */
          }

          .s1-back-inner {
            max-width: 100%;
            height: calc(100dvh - var(--s1-offset) - var(--safe-top));
            margin-top: calc(var(--s1-offset) + var(--safe-top));
            padding: 0 16px calc(16px + var(--safe-bottom)); /* 🔧 压缩左右和底部padding */
            overflow-y: hidden; /* 🔧 严格禁止滚动 */
          }

          .s1-back-top-label {
            font-size: 9.5px; /* 🔧 缩小字体 */
            letter-spacing: 0.09em;
          }

          /* 移动端完美间距 */
          .s1-identity-group {
            padding-bottom: 10px; /* 🔧 压缩底部间距 */
          }

          .s1-identity-line {
            font-size: 14px; /* 🔧 缩小字体 */
            line-height: 1.4;
            margin-bottom: 4px; /* 🔧 压缩间距 */
          }

          .s1-identity-line.accent { font-size: 15px; } /* 🔧 缩小字体 */
          .s1-identity-line.urgent {
            font-size: 12.5px; /* 🔧 缩小字体 */
            margin-top: 2px;
          }

          .s1-identity-line.urgent::after { display: none; }

          .s1-list {
            margin: 12px 0; /* 🔧 压缩上下边距 */
            gap: 10px; /* 🔧 压缩列表项间距 */
          }

          .s1-list-item {
            padding: 11px; /* 🔧 压缩内边距 */
            gap: 10px;
            border-radius: 10px;
          }

          .s1-list-item::before { display: none; }

          .s1-list-dot {
            width: 6px;
            height: 6px;
            margin-top: 4px;
          }

          .s1-list-title {
            font-size: 12px; /* 🔧 缩小字体 */
            margin-bottom: 3px;
            letter-spacing: 0.015em;
          }

          .s1-list-text {
            font-size: 11.5px; /* 🔧 缩小字体 */
            line-height: 1.5;
          }

          /* Protocol Components 移动端调整 */
          .s1-protocol-header {
            margin-top: 12px; /* 🔧 压缩间距 */
            margin-bottom: 8px; /* 🔧 压缩间距 */
          }

          .s1-protocol-title {
            font-size: 10.5px; /* 🔧 缩小字体 */
          }

          .s1-protocol-list {
            gap: 7px; /* 🔧 压缩间距 */
            margin-bottom: 12px; /* 🔧 压缩间距 */
          }

          .s1-protocol-item {
            font-size: 11px; /* 🔧 缩小字体 */
            line-height: 1.45;
          }

          .s1-cta {
            margin-top: auto;
            padding-top: 10px; /* 🔧 压缩间距 */
          }

          .s1-cta-btn-ultimate {
            height: 48px; /* 🔧 减小按钮高度 */
            padding: 0 20px;
            border-radius: 11px;
          }

          .s1-cta-text { font-size: 14px; } /* 🔧 缩小字体 */
          .s1-cta-countdown {
            font-size: 11px; /* 🔧 缩小字体 */
            padding: 4px 10px;
          }

          .s1-assist {
            font-size: 11px; /* 🔧 缩小字体 */
            margin-top: 8px;
          }

          .s1-compliance {
            font-size: 9px; /* 🔧 缩小字体 */
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
            --wm-h: 24px; /* 🔧 进一步减小 */
            --s1-offset: 64px; /* 🔧 进一步减小 */
            --gap-sm: 8px; /* 🔧 进一步压缩 */
            --gap-md: 12px; /* 🔧 进一步压缩 */
          }

          .s1-back > .wordmark {
            transform: scale(0.85); /* 🔧 进一步缩小 */
          }

          .s1-back-inner {
            padding: 0 14px 14px; /* 🔧 进一步压缩 */
          }

          .s1-back-top-label {
            font-size: 8.5px; /* 🔧 进一步缩小 */
          }

          .s1-identity-line {
            font-size: 13px; /* 🔧 进一步缩小 */
            line-height: 1.35;
            margin-bottom: 3px;
          }

          .s1-identity-line.accent { font-size: 14px; }
          .s1-identity-line.urgent { font-size: 12px; }

          .s1-list {
            gap: 9px; /* 🔧 进一步压缩 */
            margin: 10px 0;
          }

          .s1-list-item {
            padding: 9px; /* 🔧 进一步压缩 */
            gap: 9px;
          }

          .s1-list-title { font-size: 11.5px; }
          .s1-list-text {
            font-size: 11px;
            line-height: 1.45;
          }

          .s1-protocol-title { font-size: 10px; }
          .s1-protocol-item { font-size: 10.5px; }

          .s1-cta-btn-ultimate {
            height: 46px; /* 🔧 进一步减小 */
            padding: 0 17px;
          }

          .s1-cta-text { font-size: 13.5px; }
          .s1-cta-countdown {
            font-size: 10.5px;
            padding: 3px 9px;
          }

          .s1-assist {
            font-size: 10.5px;
            margin-top: 7px;
          }

          .s1-compliance {
            font-size: 8.5px;
            margin-top: 7px;
          }
        }

        /* 横屏特殊处理 - 🔧 横屏模式进一步压缩 */
        @media (max-height: 500px) and (orientation: landscape) {
          :root {
            --s1-offset: 48px; /* 🔧 大幅压缩 */
            --gap-sm: 6px;
            --gap-md: 8px;
          }

          .s1-back-inner {
            padding: 0 18px 12px; /* 🔧 压缩padding */
            overflow-y: auto; /* 🔧 在极端横屏下允许滚动作为后备方案 */
          }

          .s1-back > .wordmark {
            transform: scale(0.75); /* 🔧 大幅缩小 */
          }

          .s1-back-top-label {
            font-size: 8px;
            top: calc(var(--wm-top) + var(--wm-h) + 4px + var(--safe-top));
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
            padding: 6px 8px; /* 🔧 压缩padding */
          }

          .s1-protocol-header {
            margin-top: 6px;
            margin-bottom: 5px;
          }

          .s1-protocol-list {
            gap: 4px;
            margin-bottom: 6px;
          }

          .s1-protocol-item {
            font-size: 10px; /* 🔧 缩小字体 */
            line-height: 1.4;
          }

          .s1-cta {
            padding-top: 6px;
          }

          .s1-cta-btn-ultimate {
            height: 38px; /* 🔧 大幅减小 */
          }

          .s1-cta-text {
            font-size: 13px; /* 🔧 缩小字体 */
          }

          .s1-assist {
            margin-top: 5px;
            font-size: 10px;
          }
          
          .s1-compliance {
            margin-top: 4px;
            font-size: 8px;
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
          .s1-protocol-header,
          .s1-protocol-item,
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
        .s1-protocol-header,
        .s1-protocol-item,
        .s1-cta,
        .s1-assist,
        .s1-compliance {
          animation-fill-mode: both;
        }
      `}</style>
    </section>
  );
}