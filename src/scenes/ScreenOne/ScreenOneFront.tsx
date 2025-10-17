// 文件路径: src/scenes/ScreenOne/ScreenOneFront.tsx
import { useEffect, useRef } from "react";
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
    // 优先写顶级域（生产环境）
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
      value
    )}; path=/; domain=.faterewrite.com; expires=${exp}; SameSite=Lax`;
    // 若失败（本地开发），退回当前域
    if (document.cookie.indexOf(name + "=") === -1) {
      document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
        value
      )}; path=/; expires=${exp}; SameSite=Lax`;
    }
  } catch {}
}

/** 
 * 记录一次性事件到 Cookie
 * @param key - 事件唯一标识（如 s1e3）
 * @param devMode - 开发模式下不去重（默认 false）
 * @returns true=首次触发，false=已触发过
 */
function markOnce(key: string, devMode: boolean = false): boolean {
  // 开发模式：允许重复触发（方便测试）
  if (devMode && window.location.hostname === 'localhost') {
    console.log(`[DEV] 事件 ${key} 触发（开发模式不去重）`);
    return true;
  }

  // ❗致命问题修复：为第一屏使用独立去重 Cookie，避免与其他页面冲突
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
/* ========================================================== */

export default function ScreenOneFront() {
  const startTimeRef = useRef<number>(0);

  // ═══════════════════════════════════════════════════════════════
  // 进度条动画逻辑（保持不变）
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    const TOTAL = 3000;
    const DELAY = 480;
    const startAt = DELAY;
    const at80 = DELAY + Math.round(TOTAL * 0.8);
    const at100 = DELAY + TOTAL;

    const emit = (name: string, detail?: any) =>
      window.dispatchEvent(new CustomEvent(`s1:${name}`, { detail }));

    const t0 = window.setTimeout(() => emit("progress:start"), startAt);
    const t1 = window.setTimeout(() => emit("progress:80"), at80);
    const t2 = window.setTimeout(() => emit("progress:done"), at100);

    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // 🎯 新增：前屏 加载成功（去重）
  // 要求：两个屏的前/后屏“加载成功人数（去重）”
  // 事件名：S1_Front_Loaded
  // 去重 key：s1f_load
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    const frid = ensureFrid();
    if (typeof window.fbq !== "undefined") {
      const isDev = window.location.hostname === 'localhost';
      if (markOnce("s1f_load", isDev)) {
        const eventId = "ev_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        window.fbq(
          "trackCustom",
          "S1_Front_Loaded",
          {
            content_name: "ScreenOne_Front",
            content_category: "Assessment_Landing",
            frid: frid,
          },
          { eventID: eventId }
        );
        console.log(`[FB打点] S1_Front_Loaded 触发成功`, { frid, eventId });
      }
    }
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // 🎯 核心打点：前屏 3秒停留（保留）
  // 事件名：S1_Front_Engaged_3s
  // 去重 key：s1e3
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    // 确保 FRID 存在
    const frid = ensureFrid();
    
    // 记录开始时间（用于日志）
    startTimeRef.current = Date.now();

    // 🎯 事件：前屏3秒停留（User级去重：key = s1e3）
    const engageTimer = setTimeout(() => {
      if (typeof window.fbq !== "undefined") {
        const isDev = window.location.hostname === 'localhost';
        
        if (markOnce("s1e3", isDev)) {
          const eventId = "ev_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
          
          window.fbq("trackCustom", "S1_Front_Engaged_3s", {
            content_name: "ScreenOne_Front",
            content_category: "Assessment_Landing",
            engagement_type: "view_3s",
            frid: frid,
          }, { 
            eventID: eventId 
          });
          
          console.log(`[FB打点] S1_Front_Engaged_3s 触发成功`, { frid, eventId });
        }
      }
    }, 3000);

    return () => {
      clearTimeout(engageTimer);
      
      // 日志：记录前屏停留时长
      if (startTimeRef.current > 0) {
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
        console.log(`[前屏] 停留时长: ${duration}秒`);
      }
    };
  }, []);

  // —— 文案分片（保留两段结构；切分点为 “recognized / at a glance.”）——
  const titleChunks = (() => {
    const t = COPY.title; // "Where you're recognized at a glance."
    const semantic = "recognized ";
    const i = t.indexOf(semantic);
    if (i > -1) {
      return [t.slice(0, i + "recognized".length), t.slice(i + semantic.length)];
    }
    const idx = t.lastIndexOf(" ");
    if (idx > 0) return [t.slice(0, idx), t.slice(idx + 1)];
    return [t, ""];
  })();

  const sub1Parts = (() => {
    const s = COPY.sub1;
    const marker = ", and ";
    const i = s.indexOf(marker);
    if (i > -1) {
      return [s.slice(0, i + 1), "and " + s.slice(i + marker.length)];
    }
    return [s, ""];
  })();

  return (
    <section className="screen-front-container">
      
      {/* ═══════════════════════════════════════════════════════
          品牌 Logo（复用 Wordmark 组件）
          ═══════════════════════════════════════════════════════ */}
      <Wordmark name="Kinship" href="/" />

      <div className="screen-front-content">
        
        {/* 主标题（从 COPY 读取） */}
        <h1 className="screen-front-title" aria-label={COPY.title}>
          <span className="h1-chunk">{titleChunks[0]}</span>
          <span className="h1-chunk">{titleChunks[1]}</span>
        </h1>

        {/* 副标题（从 COPY.sub1 智能切分为两行） */}
        <p className="screen-front-subtitle">
          <span className="subline">
            {sub1Parts[0]}
          </span>
          <span className="subline">
            {sub1Parts[1]}
          </span>
        </p>

        {/* 核心理念（从 COPY.sub2 读取） */}
        <p className="screen-front-tagline">{COPY.sub2}</p>

        {/* Assessment ready 标签（进度条上方）*/} 
        <p className="s1-status-label">Assessment ready</p>

        {/* 进度条（完全不动）*/}
        <div className="s1-progress" aria-hidden="true">
          <span className="s1-progress-dot left" />
          <span className="s1-progress-dot right" />
        </div>

      </div>

      <style>{`
        /* ═══════════════════════════════════════════════════════════════════
           【10.0/10 满分版】句首大写 + 优化字距
           ═══════════════════════════════════════════════════════════════════ */

        :root{
          --s1-total: 3000ms;
          --s1-delay: 480ms;
          --s1-shine-intensity: 0.35;
          --s1-outro-start: 2760ms;
          --s1-outro-dur: 220ms;
        }

        .screen-front-container {
          position: fixed;
          inset: 0;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          box-sizing: border-box;
        }

        .screen-front-content {
          position: relative;
          width: 100%;
          max-width: 520px;
          text-align: left;
          color: #F5F5F0;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }

        /* ═══════════════════════════════════════════════════════════════════
           A. 主标题（移动端字号 26px）
           ═══════════════════════════════════════════════════════════════════ */
        .screen-front-title {
          margin: 0 0 32px 0;
          padding: 0;
          font-size: 26px;
          line-height: 1.25;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: #F5F5F0;
          font-family: Georgia, 'Times New Roman', serif;
          text-wrap: balance;
          font-kerning: normal;
          font-feature-settings: "liga" 1, "kern" 1, "pnum" 1;
        }

        .h1-chunk {
          display: block;
          opacity: 0;
          transform: translateY(8px);
          will-change: transform, opacity;
          animation:
            chunkIn 420ms cubic-bezier(0.23, 1, 0.32, 1) forwards,
            microOutro var(--s1-outro-dur) ease-out var(--s1-outro-start) forwards;
        }
        .h1-chunk:nth-child(1) {
          animation-name: chunkIn, chunkPulse, microOutro;
          animation-duration: 420ms, 180ms, var(--s1-outro-dur);
          animation-timing-function: cubic-bezier(0.23,1,0.32,1), ease-out, ease-out;
          animation-delay: 60ms, 400ms, var(--s1-outro-start);
          animation-fill-mode: forwards, none, forwards;
        }
        .h1-chunk:nth-child(2) { animation-delay: 240ms, var(--s1-outro-start); }

        @keyframes chunkIn {
          0%   { opacity: 0; transform: translateY(8px); }
          80%  { opacity: 1; transform: translateY(-0.5px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes chunkPulse {
          0%   { opacity: 1; }
          50%  { opacity: 0.94; }
          100% { opacity: 1; }
        }
        @keyframes microOutro {
          to { opacity: 0.96; transform: translateY(-2px); }
        }

        /* ═══════════════════════════════════════════════════════════════════
           B. 副标题（保持不变）
           ═══════════════════════════════════════════════════════════════════ */
        .screen-front-subtitle {
          margin: 0 0 40px 0;
          padding: 0;
          font-size: 17px;
          line-height: 1.72;
          color: #F5F5F0;
          font-weight: 400;
        }
        .subline {
          display: block;
          opacity: 0;
          transform: translateY(6px);
          animation:
            subIn 360ms cubic-bezier(0.23,1,0.32,1) forwards,
            microOutro var(--s1-outro-dur) ease-out var(--s1-outro-start) forwards;
        }
        .subline:nth-child(1) { animation-delay: 560ms, var(--s1-outro-start); }
        .subline:nth-child(2) { animation-delay: 760ms, var(--s1-outro-start); }

        @keyframes subIn { to { opacity: 1; transform: translateY(0); } }

        .key-phrase {
          font-style: normal;
          position: relative;
          white-space: nowrap;
        }
        .key-phrase::after {
          content: "";
          position: absolute;
          left: 0; bottom: -2px;
          height: 1px;
          width: 0%;
          background: rgba(184, 149, 106, 0.22);
          transform-origin: left center;
          animation: underlineOnce 160ms ease-out forwards;
        }
        .subline:nth-child(1) .key-phrase::after { animation-delay: 1200ms; }
        .subline:nth-child(2) .key-phrase::after { animation-delay: 1300ms; }

        @keyframes underlineOnce {
          0%   { width: 0%; opacity: 0; }
          60%  { width: 100%; opacity: 1; }
          100% { width: 100%; opacity: 0.6; }
        }

        /* ═══════════════════════════════════════════════════════════════════
           C. 标语（保持不变）
           ═══════════════════════════════════════════════════════════════════ */
        .screen-front-tagline {
          margin: 0 0 56px 0;
          padding: 0;
          font-size: 13px;
          line-height: 1.5;
          color: #F5F5F0;
          opacity: 0.68;
          font-style: italic;
          font-weight: 400;
          transform: translateY(6px);
          animation:
            taglineIn 320ms cubic-bezier(0.23,1,0.32,1) 1700ms forwards,
            microOutro var(--s1-outro-dur) ease-out var(--s1-outro-start) forwards;
        }
        @keyframes taglineIn { to { opacity: 0.68; transform: translateY(0); } }

        .screen-front-tagline::after {
          content: "";
          display: block;
          width: 34px; height: 1px;
          margin-top: 18px;
          background: #B8956A;
          opacity: 0.12;
          animation: taglineShine 185ms ease-out 1860ms both;
        }
        @keyframes taglineShine {
          0%   { opacity: 0; }
          60%  { opacity: 0.25; }
          100% { opacity: 0.12; }
        }

        /* ═══════════════════════════════════════════════════════════════════
           Assessment ready 状态标签（优化版）
           ═══════════════════════════════════════════════════════════════════ */
        .s1-status-label {
          margin: 0 0 12px 0;
          padding: 0;
          font-size: 11px;
          line-height: 1.5;
          text-align: center;
          color: #B8956A;
          opacity: 0;
          font-family: Georgia, 'Times New Roman', serif;
          font-style: italic;
          font-weight: 400;
          letter-spacing: 0.02em;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          animation: statusLabelFadeIn 500ms ease calc(var(--s1-delay) + 100ms) forwards;
        }

        @keyframes statusLabelFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 0.85; transform: translateY(0); }
        }

        /* ═══════════════════════════════════════════════════════════════════
           D. 进度条（完全不动，0修改）
           ═══════════════════════════════════════════════════════════════════ */
        .s1-progress{
          position: relative;
          width: 120px;
          height: 6px;
          margin-top: 28px;
          opacity: 0;
          left: 0;
          animation: s1ProgFade 400ms ease var(--s1-delay) forwards;
          contain: layout style paint;
          pointer-events: none;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
          overflow: visible;
        }
        @keyframes s1ProgFade { to { opacity: 1; } }

        .s1-progress::before{
          content:"";
          position:absolute; inset:0;
          border-radius:999px;
          background: rgba(200,200,192,0.12);
          border: 1px solid rgba(200,200,192,0.08);
          z-index:1;
          box-sizing: border-box;
        }

        .s1-progress::after{
          content:"";
          position:absolute; 
          top: 1px; left: 1px; right: 1px; bottom: 1px;
          border-radius:999px;
          background:#B8956A;
          transform-origin: left center;
          transform: scaleX(0);
          will-change: transform, box-shadow;
          z-index:2;
          animation:
            s1Fill var(--s1-total) linear var(--s1-delay) forwards,
            s1Shine var(--s1-total) linear var(--s1-delay) forwards;
        }

        .s1-progress-dot{
          position:absolute; top:50%; width:7px; height:7px;
          border-radius:50%; transform: translateY(-50%);
          z-index:3; background: #B8956A; opacity: 0.85;
        }
        .s1-progress-dot.left  { left: -16px; }
        .s1-progress-dot.right { right:-16px; }

        @keyframes s1Fill{
          0%   { transform: scaleX(0.000); }
          70%  { transform: scaleX(0.700); }
          80%  { transform: scaleX(0.810); }
          90%  { transform: scaleX(0.930); }
          95%  { transform: scaleX(0.975); }
          100% { transform: scaleX(1.000); }
        }

        @keyframes s1Shine{
          0%,79%  { box-shadow: none; }
          80%     { 
            box-shadow: 
              0 0 14px rgba(184, 149, 106, calc(var(--s1-shine-intensity) * 0.6)),
              0 0 28px rgba(184, 149, 106, calc(var(--s1-shine-intensity) * 0.3));
          }
          82%     { 
            box阴影: 
              0 0 18px rgba(184, 149, 106, calc(var(--s1-shine-intensity) * 1.1)),
              0 0 36px rgba(184, 149, 106, calc(var(--s1-shine-intensity) * 0.5)),
              inset 0 0 10px rgba(255, 255, 255, 0.2);
          }
          84%     { 
            box-shadow: 
              0 0 14px rgba(184, 149, 106, calc(var(--s1-shine-intensity) * 0.7)),
              0 0 28px rgba(184, 149, 106, calc(var(--s1-shine-intensity) * 0.35));
          }
          86%,100%{ box-shadow: none; }
        }

        /* ═══════════════════════════════════════════════════════════════════
           桌面端适配
           ═══════════════════════════════════════════════════════════════════ */
        @media (min-width: 769px) {
          .screen-front-title { font-size: 42px; line-height: 1.22; }
          .screen-front-subtitle { font-size: 18px; }
          .screen-front-content { max-width: 580px; }
          .s1-status-label { font-size: 12px; }
          .s1-progress { width: 140px; }
        }

        /* ═══════════════════════════════════════════════════════════════════
           无障碍降级
           ═══════════════════════════════════════════════════════════════════ */
        @media (prefers-reduced-motion: reduce) {
          .h1-chunk, .subline, .screen-front-tagline, .s1-status-label {
            opacity: 1 !important;
            transform: none !important;
            animation: none !important;
          }
          .key-phrase::after, .screen-front-tagline::after {
            animation: none !important;
            opacity: 0.12 !important;
          }
          .s1-progress{ opacity:1 !重要; animation:none !重要; }
          .s1-progress::after{ animation:none !重要; transform: scaleX(1) !重要; }
          .s1-status-label { opacity: 0.85 !重要; }
        }

        @media (prefers-contrast: more) {
          .s1-progress::before {
            background: rgba(200,200,192,0.18);
            border-color: rgba(200,200,192,0.12);
          }
        }
        @media (forced-colors: active) {
          .s1-progress,
          .s1-progress::before,
          .s1-progress::after,
          .s1-progress-dot {
            forced-color-adjust: none;
          }
          .s1-progress::before {
            background: CanvasText;
            opacity: .12;
            border: 1px solid CanvasText;
          }
          .s1-progress::after,
          .s1-progress-dot {
            background: CanvasText;
          }
        }

        /* ═══════════════════════════════════════════════════════════════════
           【前屏打点】验收清单
           
           🎯 事件（均为“跨子域去重”）：
           ✅ S1_Front_Loaded（加载成功，User级去重：key=s1f_load）
           ✅ S1_Front_Engaged_3s（3秒停留，User级去重：key=s1e3）
           
           去重逻辑：
           - 生产环境：Cookie跨子域去重（30天有效期）
           - 开发环境：localhost 不去重（方便测试）
           - 控制台日志：清晰标注触发/去重状态
           
           FRID 机制：
           ✅ 页面加载即生成/复用
           ✅ 跨子域共享（.faterewrite.com）
           ✅ 30天有效期
        ═══════════════════════════════════════════════════════════════════ */
      `}</style>
    </section>
  );
}

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
    __frid?: string;
  }
}
