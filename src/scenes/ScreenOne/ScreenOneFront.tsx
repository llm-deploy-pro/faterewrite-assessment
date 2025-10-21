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
/* ========================================================== */

export default function ScreenOneFront() {
  const startTimeRef = useRef<number>(0);
  
  // CTA 状态管理
  const [ctaVisible, setCtaVisible] = useState(false);
  const [hasClicked, setHasClicked] = useState(false);
  const [shouldPulse, setShouldPulse] = useState(false);

  // ═══════════════════════════════════════════════════════════════
  // 进度条动画逻辑（仅视觉效果）
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    const TOTAL = 3500; // 3.5秒到达等待状态
    const DELAY = 500;
    const startAt = DELAY;
    const at85 = DELAY + Math.round(TOTAL * 0.85);
    const atDone = DELAY + TOTAL;

    const emit = (name: string, detail?: any) =>
      window.dispatchEvent(new CustomEvent(`s1:${name}`, { detail }));

    const t0 = window.setTimeout(() => emit("progress:start"), startAt);
    const t1 = window.setTimeout(() => emit("progress:85"), at85);
    const t2 = window.setTimeout(() => emit("progress:waiting"), atDone);

    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // CTA 延迟出现逻辑（1.2秒后淡入，更快响应）
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    const showTimer = setTimeout(() => {
      setCtaVisible(true);
      
      // CTA 出现印象事件
      const sessionKey = 's1_cta_shown';
      const alreadyShown = sessionStorage.getItem(sessionKey) === 'true';
      
      if (!alreadyShown && typeof window.fbq !== "undefined") {
        const frid = ensureFrid();
        const isDev = window.location.hostname === 'localhost';
        if (markOnce("s1ci", isDev)) {
          const eventId = "ev_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
          window.fbq("trackCustom", "S1_CTA_Impression", {
            content_name: "Assessment_CTA",
            content_category: "Matching_Assessment",
            frid: frid,
          }, { eventID: eventId });
          console.log(`[FB打点] S1_CTA_Impression 触发成功`, { frid, eventId });
          sessionStorage.setItem(sessionKey, 'true');
        }
      }
      
      // 2秒后触发轻微脉动提示（仅一次）
      setTimeout(() => {
        if (!hasClicked) {
          setShouldPulse(true);
          // 动画结束后自动清除
          setTimeout(() => setShouldPulse(false), 800);
        }
      }, 2000);
    }, 1200); // 缩短至1.2秒

    return () => clearTimeout(showTimer);
  }, [hasClicked]);

  // ⚠️ 无自动跳转 - 必须点击CTA才能继续

  // ═══════════════════════════════════════════════════════════════
  // 前屏加载成功事件
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    const frid = ensureFrid();
    if (typeof window.fbq !== "undefined") {
      const isDev = window.location.hostname === 'localhost';
      if (markOnce("s1f_load", isDev)) {
        const eventId = "ev_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        window.fbq("trackCustom", "S1_Front_Loaded", {
          content_name: "ScreenOne_Front",
          content_category: "Assessment_Landing",
          frid: frid,
        }, { eventID: eventId });
        console.log(`[FB打点] S1_Front_Loaded 触发成功`, { frid, eventId });
      }
    }
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // 3秒停留事件
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    const frid = ensureFrid();
    startTimeRef.current = Date.now();

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
          }, { eventID: eventId });
          console.log(`[FB打点] S1_Front_Engaged_3s 触发成功`, { frid, eventId });
        }
      }
    }, 3000);

    return () => {
      clearTimeout(engageTimer);
      if (startTimeRef.current > 0) {
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
        console.log(`[前屏] 停留时长: ${duration}秒`);
      }
    };
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // CTA 点击处理（唯一的导航入口）
  // ═══════════════════════════════════════════════════════════════
  const handleCTAClick = () => {
    if (hasClicked) return;
    
    const frid = ensureFrid();
    const fbEventId = "ev_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const isDev = window.location.hostname === 'localhost';

    // CTA点击事件
    if (typeof window.fbq !== 'undefined') {
      if (markOnce("s1cc", isDev)) {
        window.fbq('trackCustom', 'S1_Front_CTA_Click', {
          content_name: 'Assessment_CTA',
          content_category: 'Matching_Assessment',
          value: 49,
          currency: 'USD',
          screen_position: 'center',
          screen_number: 1,
          page_url: window.location.href,
          referrer: document.referrer,
          frid: frid,
        }, { eventID: fbEventId });
        console.log(`[FB打点] S1_Front_CTA_Click 触发成功`, { frid, fbEventId });
      }
    }

    // 标记已点击
    setHasClicked(true);
    setShouldPulse(false);
    
    try {
      localStorage.setItem('cta_clicked_assessment_49', 'true');
    } catch (error) {
      console.warn('localStorage not available:', error);
    }

    // 优雅离场动画
    document.documentElement.classList.add('page-leave');
    
    setTimeout(() => {
      // ✅ 改为发出事件，由 ScreenOne.tsx 监听后切换到后屏
      window.dispatchEvent(new CustomEvent('s1:cta:continue'));
      requestAnimationFrame(() => {
        document.documentElement.classList.remove('page-leave');
        window.scrollTo(0, 0);
      });
    }, 220);
  };

  // 文案分片 - 适配新的标题
  const titleChunks = (() => {
    const t = COPY.title;
    // 在破折号处分割，保持视觉平衡
    const dashIndex = t.indexOf(" — ");
    if (dashIndex > -1) {
      return [t.slice(0, dashIndex), t.slice(dashIndex)];
    }
    // 备用：在最后一个空格处分割
    const idx = t.lastIndexOf(" ");
    if (idx > 0) return [t.slice(0, idx), t.slice(idx + 1)];
    return [t, ""];
  })();

  // 完整显示副标题
  const sub1FirstSentence = COPY.sub1;

  return (
    <section className="screen-front-container">
      <Wordmark name="PRIME WINDOW" href="/" />
      
      {/* 新增：顶部小字标签 - 增强版 */}
      <p className="s1-top-label">
        <span className="label-prefix">SYSTEM LOG</span>
        <span className="label-divider">—</span>
        <span className="label-suffix">7B SELF-CHECK</span>
      </p>

      <div className="screen-front-content">
        {/* 主标题 */}
        <h1 className="screen-front-title" aria-label={COPY.title}>
          <span className="h1-chunk">{titleChunks[0]}</span>
          <span className="h1-chunk">{titleChunks[1]}</span>
        </h1>

        {/* 副标题（完整版）*/}
        <p className="screen-front-subtitle">
          <span className="subline">{sub1FirstSentence}</span>
        </p>

        {/* 核心价值点（最终策略版本 - 来自 COPY.keyPoints）*/}
        <div className="screen-front-keypoints">
          {COPY.keyPoints.flatMap((text, i) => ([
            <span className="keypoint" key={`kp-${i}`}>{text}</span>,
            i < COPY.keyPoints.length - 1 ? <span className="keypoint-dot" key={`dot-${i}`}>•</span> : null
          ]))}
        </div>

        {/* 状态标签 - 替换文案 */}
        <p className="s1-status-label">
          <span className="status-dot"></span>
          Self-check engine ready
        </p>

        {/* 社会认证元素 - 增强版 */}
        <p className="s1-members-count">
          <span className="count-number">487</span>
          <span className="count-text">7B signatures logged this cycle</span>
        </p>

        {/* CTA 按钮区域 */}
        <div className={`cta-container ${ctaVisible ? 'visible' : ''}`}>
          <button
            type="button"
            onClick={handleCTAClick}
            disabled={hasClicked}
            className={`s1-cta-btn ${shouldPulse ? 'pulse' : ''}`}
            aria-label="Continue to assessment"
            aria-describedby="privacy-note"
          >
            <span className="s1-cta-text">Generate My Debug Report</span>
            <span className="s1-cta-arrow">→</span>
          </button>
          
          {/* 隐私提示 - 替换文案 */}
          <p id="privacy-note" className="s1-privacy-note">
            Encrypted. One-time generation. Not therapy.
          </p>
        </div>

        {/* 进度条（优化为等待状态）*/}
        <div className="s1-progress" aria-hidden="true">
          <div className="s1-progress-track"></div>
          <div className="s1-progress-fill"></div>
        </div>
      </div>

      <style>{`
        /* ═══════════════════════════════════════════════════════════════════
           10/10 完美优化版 - 视觉与交互体验拉满
           ═══════════════════════════════════════════════════════════════════ */

        :root {
          --s1-total: 3500ms;
          --s1-delay: 500ms;
          --gold: #B8956A;
          --gold-bright: #D4B896;
          --gold-border: rgba(184, 149, 106, 0.75);
          --gold-hover: rgba(212, 184, 150, 0.85);
          --cream: #F5F5F0;
          --cream-bright: rgba(245, 245, 240, 0.95);
          --dark-blue: #0A1628;
        }

        /* 页面离场动画 */
        .page-leave .screen-front-container {
          opacity: 0;
          transform: translateY(-8px) scale(0.98);
          filter: blur(4px);
          transition: all 220ms cubic-bezier(0.23, 1, 0.32, 1);
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
          background: var(--dark-blue);
        }

        /* ═══════════════════════════════════════════════════════════════════
           新增：顶部小字标签样式 - 增强版
           ═══════════════════════════════════════════════════════════════════ */
        .s1-top-label {
          position: absolute;
          top: 60px;
          left: 50%;
          transform: translateX(-50%);
          margin: 0;
          padding: 0;
          font-size: 10px;
          line-height: 1.5;
          font-family: 'Courier New', monospace;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 8px;
          opacity: 0;
          animation: topLabelReveal 800ms ease 200ms forwards;
        }

        .label-prefix {
          color: rgba(184, 149, 106, 0.5);
          position: relative;
          animation: glitchText 8s infinite;
        }

        .label-divider {
          color: rgba(184, 149, 106, 0.3);
          font-weight: 100;
        }

        .label-suffix {
          color: rgba(212, 184, 150, 0.7);
          position: relative;
          font-weight: 600;
          text-shadow: 0 0 10px rgba(212, 184, 150, 0.2);
        }

        /* 故障文字效果 */
        @keyframes glitchText {
          0%, 100% { 
            text-shadow: none;
            opacity: 1;
          }
          92% {
            text-shadow: 
              -1px 0 rgba(255, 0, 0, 0.3),
              1px 0 rgba(0, 255, 255, 0.3);
            opacity: 0.9;
          }
          93% {
            text-shadow: none;
            opacity: 1;
          }
        }

        @keyframes topLabelReveal {
          0% { 
            opacity: 0;
            transform: translateX(-50%) translateY(-5px);
            filter: blur(4px);
          }
          100% { 
            opacity: 1;
            transform: translateX(-50%) translateY(0);
            filter: blur(0);
          }
        }

        .screen-front-content {
          position: relative;
          width: 100%;
          max-width: 520px;
          text-align: left;
          color: var(--cream);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* ═══════════════════════════════════════════════════════════════════
           文字部分
           ═══════════════════════════════════════════════════════════════════ */
        
        .screen-front-title {
          margin: 0 0 24px 0;
          padding: 0;
          font-size: 26px;
          line-height: 1.25;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: var(--cream);
          font-family: Georgia, 'Times New Roman', serif;
        }

        .h1-chunk {
          display: block;
          opacity: 0;
          transform: translateY(12px);
          animation: chunkIn 450ms cubic-bezier(0.23, 1, 0.32, 1) forwards;
        }
        .h1-chunk:nth-child(1) { animation-delay: 60ms; }
        .h1-chunk:nth-child(2) { animation-delay: 240ms; }

        @keyframes chunkIn {
          to { 
            opacity: 1; 
            transform: translateY(0);
          }
        }

        .screen-front-subtitle {
          margin: 0 0 20px 0;
          padding: 0;
          font-size: 17px;
          line-height: 1.55;
          color: var(--cream-bright);
          font-weight: 400;
          font-family: Georgia, 'Times New Roman', serif;
        }

        .subline {
          display: block;
          opacity: 0;
          transform: translateY(8px);
          animation: subIn 400ms cubic-bezier(0.23,1,0.32,1) 480ms forwards;
        }

        @keyframes subIn {
          to { 
            opacity: 1; 
            transform: translateY(0);
          }
        }

        /* ═══════════════════════════════════════════════════════════════════
           核心价值点（新增的Key Points）- 优雅的响应式布局 + 10分优化
           ═══════════════════════════════════════════════════════════════════ */
        .screen-front-keypoints {
          margin: 0 0 28px 0;
          padding: 0;
          font-size: 13px;
          line-height: 1.6;
          color: var(--cream);
          opacity: 0;
          font-family: Georgia, 'Times New Roman', serif;
          font-style: italic;
          font-weight: 400;
          animation: keypointsIn 350ms cubic-bezier(0.23,1,0.32,1) 900ms forwards;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 8px 10px;
          position: relative;
        }

        /* 新增：价值点容器的微妙背光效果 */
        .screen-front-keypoints::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 120%;
          height: 200%;
          background: radial-gradient(ellipse at center,
            rgba(184, 149, 106, 0.02) 0%,
            transparent 70%
          );
          transform: translate(-50%, -50%);
          pointer-events: none;
          animation: subtleGlow 4s ease-in-out infinite alternate;
        }

        @keyframes subtleGlow {
          0% { opacity: 0.3; }
          100% { opacity: 0.7; }
        }

        .keypoint {
          opacity: 0.72;
          white-space: nowrap;
          position: relative;
          transition: all 280ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        /* 新增：悬停时的优雅高亮 */
        .keypoint:hover {
          opacity: 0.95;
          color: var(--gold-bright);
          cursor: default;
        }

        .keypoint-dot {
          color: var(--gold);
          opacity: 0.4;
          font-size: 10px;
          transition: all 280ms ease;
        }

        /* 移动端优化：垂直排列 + 加分优化 */
        @media (max-width: 480px) {
          .screen-front-keypoints {
            flex-direction: column;
            gap: 8px;
            align-items: flex-start;
            padding: 12px 16px;
            background: linear-gradient(to right,
              rgba(184, 149, 106, 0.03) 0%,
              transparent 100%
            );
            border-left: 1px solid rgba(184, 149, 106, 0.15);
            border-radius: 0 4px 4px 0;
            margin-left: -16px;
            margin-right: -16px;
            padding-left: 32px;
          }
          
          .keypoint-dot {
            display: none;
          }
          
          .keypoint {
            position: relative;
            padding-left: 14px;
            font-size: 12.5px;
            line-height: 1.8;
          }
          
          .keypoint::before {
            content: '•';
            position: absolute;
            left: 0;
            color: var(--gold);
            opacity: 0.6;
            font-size: 12px;
          }
        }

        @keyframes keypointsIn {
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* ═══════════════════════════════════════════════════════════════════
           状态标签（增强版 + 认证徽章）
           ═══════════════════════════════════════════════════════════════════ */
        .s1-status-label {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin: 0 0 16px 0;
          padding: 0;
          font-size: 12px;
          line-height: 1.5;
          text-align: center;
          color: var(--gold-bright);
          opacity: 0;
          font-family: Georgia, 'Times New Roman', serif;
          font-style: italic;
          font-weight: 400;
          letter-spacing: 0.02em;
          animation: statusFade 450ms ease 1100ms forwards;
          position: relative;
        }

        /* 新增：状态标签的高级感背景 */
        .s1-status-label::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 140px;
          height: 28px;
          background: radial-gradient(ellipse at center,
            rgba(184, 149, 106, 0.06) 0%,
            transparent 100%
          );
          border-radius: 14px;
          pointer-events: none;
        }

        .status-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--gold);
          animation: statusPulse 2s ease-in-out infinite;
          position: relative;
          z-index: 1;
        }

        /* ═══════════════════════════════════════════════════════════════════
           社会认证元素 - 增强版
           ═══════════════════════════════════════════════════════════════════ */
        .s1-members-count {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 6px;
          margin: -8px 0 20px 0;
          font-size: 11px;
          text-align: center;
          font-family: 'Courier New', monospace;
          letter-spacing: 0.05em;
          opacity: 0;
          animation: membersReveal 600ms ease 1400ms forwards;
          position: relative;
        }

        .count-number {
          font-size: 14px;
          font-weight: 700;
          color: rgba(212, 184, 150, 0.8);
          text-shadow: 
            0 0 20px rgba(212, 184, 150, 0.4),
            0 0 40px rgba(184, 149, 106, 0.2);
          animation: numberPulse 3s ease-in-out infinite;
        }

        .count-text {
          color: rgba(245, 245, 240, 0.35);
          text-transform: uppercase;
          font-size: 10px;
          font-weight: 400;
        }

        @keyframes membersReveal {
          0% { 
            opacity: 0;
            transform: scale(0.95) translateY(5px);
          }
          100% { 
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes numberPulse {
          0%, 100% { 
            opacity: 0.8;
            text-shadow: 
              0 0 20px rgba(212, 184, 150, 0.4),
              0 0 40px rgba(184, 149, 106, 0.2);
          }
          50% { 
            opacity: 1;
            text-shadow: 
              0 0 25px rgba(212, 184, 150, 0.6),
              0 0 50px rgba(184, 149, 106, 0.3);
          }
        }

        @keyframes statusFade {
          to { opacity: 0.85; }
        }

        @keyframes statusPulse {
          0%, 100% { 
            opacity: 0.5;
            transform: scale(1);
          }
          50% { 
            opacity: 1;
            transform: scale(1.2);
          }
        }

        /* ═══════════════════════════════════════════════════════════════════
           CTA 容器与按钮（完美版）
           ═══════════════════════════════════════════════════════════════════ */
        .cta-container {
          margin: 0 0 20px 0;
          opacity: 0;
          transform: translateY(6px);
          transition: all 250ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        .cta-container.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .s1-cta-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          height: 50px;
          padding: 0 28px;
          border-radius: 12px;
          background: linear-gradient(135deg, 
            rgba(184, 149, 106, 0.08) 0%, 
            rgba(184, 149, 106, 0.03) 100%
          );
          border: 1.5px solid var(--gold-border);
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          transition: all 280ms cubic-bezier(0.23, 1, 0.32, 1);
          position: relative;
          overflow: hidden;
        }

        /* 按钮光晕效果 - 增强版 */
        .s1-cta-btn::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, 
            rgba(212, 184, 150, 0.15) 0%, 
            transparent 70%
          );
          transform: translate(-50%, -50%) scale(0);
          transition: transform 450ms cubic-bezier(0.23, 1, 0.32, 1);
          pointer-events: none;
        }

        /* 新增：按钮微光动画 */
        .s1-cta-btn::after {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, 
            transparent 30%,
            rgba(212, 184, 150, 0.1) 50%,
            transparent 70%
          );
          border-radius: 14px;
          opacity: 0;
          transform: translateX(-100%);
          transition: all 600ms cubic-bezier(0.23, 1, 0.32, 1);
          pointer-events: none;
        }

        .s1-cta-btn:hover::before {
          transform: translate(-50%, -50%) scale(1.5);
        }

        .s1-cta-btn:hover::after {
          opacity: 1;
          transform: translateX(100%);
          transition-delay: 100ms;
        }

        /* CTA 文字 */
        .s1-cta-text {
          color: var(--cream-bright);
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 15px;
          font-weight: 500;
          letter-spacing: 0.01em;
          position: relative;
          z-index: 1;
        }

        /* CTA 箭头 */
        .s1-cta-arrow {
          color: var(--gold-bright);
          font-size: 18px;
          opacity: 0.9;
          transition: all 280ms cubic-bezier(0.23, 1, 0.32, 1);
          position: relative;
          z-index: 1;
        }

        /* 脉动动画（更优雅）*/
        @keyframes gentlePulse {
          0%, 100% { 
            transform: scale(1);
            border-color: var(--gold-border);
          }
          50% { 
            transform: scale(1.02);
            border-color: var(--gold-hover);
          }
        }

        .s1-cta-btn.pulse {
          animation: gentlePulse 800ms ease-in-out 1;
        }

        /* 悬停效果（增强版）*/
        @media (hover: hover) and (pointer: fine) {
          .s1-cta-btn:hover:not(:disabled) {
            border-color: var(--gold-hover);
            background: linear-gradient(135deg, 
              rgba(212, 184, 150, 0.12) 0%, 
              rgba(184, 149, 106, 0.06) 100%
            );
            transform: translateY(-1px);
            box-shadow: 
              0 4px 20px rgba(184, 149, 106, 0.12),
              0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .s1-cta-btn:hover:not(:disabled) .s1-cta-arrow {
            transform: translateX(3px);
            opacity: 1;
          }

          .s1-cta-btn:hover:not(:disabled) .s1-cta-text {
            color: #FFFFFF;
          }
        }

        /* 点击状态 */
        .s1-cta-btn:active:not(:disabled) {
          transform: scale(0.98);
          transition: all 100ms ease;
        }

        /* 聚焦状态 */
        .s1-cta-btn:focus-visible {
          outline: 2px solid var(--gold);
          outline-offset: 3px;
        }

        /* 禁用状态 */
        .s1-cta-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        /* 隐私提示 */
        .s1-privacy-note {
          margin: 12px 0 0 0;
          padding: 0;
          font-size: 12px;
          line-height: 1.5;
          text-align: center;
          color: rgba(245, 245, 240, 0.55);
          font-family: system-ui, -apple-system, sans-serif;
          letter-spacing: 0.02em;
        }

        /* ═══════════════════════════════════════════════════════════════════
           进度条（优雅等待状态 + 品质提升）
           ═══════════════════════════════════════════════════════════════════ */
        .s1-progress {
          position: relative;
          width: 64px;
          height: 3px;
          margin: 0 auto;
          opacity: 0;
          animation: s1ProgFade 400ms ease var(--s1-delay) forwards;
        }

        @keyframes s1ProgFade {
          to { opacity: 1; }
        }

        .s1-progress-track {
          position: absolute;
          inset: 0;
          border-radius: 999px;
          background: rgba(200, 200, 192, 0.08);
          overflow: hidden;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .s1-progress-fill {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, 
            transparent 0%, 
            var(--gold) 50%, 
            transparent 100%
          );
          transform: scaleX(0);
          transform-origin: left center;
          animation: 
            s1Fill var(--s1-total) cubic-bezier(0.4, 0, 0.2, 1) var(--s1-delay) forwards,
            s1Waiting 2s ease-in-out calc(var(--s1-delay) + var(--s1-total)) infinite;
          box-shadow: 0 0 8px rgba(184, 149, 106, 0.3);
        }

        @keyframes s1Fill {
          0%   { transform: scaleX(0); }
          85%  { transform: scaleX(0.85); }
          100% { transform: scaleX(0.85); }
        }

        @keyframes s1Waiting {
          0%, 100% { 
            opacity: 0.4;
            transform: scaleX(0.75);
          }
          50% { 
            opacity: 0.8;
            transform: scaleX(0.9);
          }
        }

        /* ═══════════════════════════════════════════════════════════════════
           响应式适配
           ═══════════════════════════════════════════════════════════════════ */
        @media (min-width: 769px) {
          .s1-top-label {
            top: 80px;
            font-size: 11px;
          }
          .label-suffix {
            font-size: 12px;
          }
          .screen-front-title { 
            font-size: 42px; 
            line-height: 1.22;
          }
          .screen-front-subtitle { 
            font-size: 18px;
          }
          .screen-front-keypoints {
            font-size: 14px;
            gap: 8px 14px;
          }
          .screen-front-content { 
            max-width: 580px;
          }
          .s1-status-label { 
            font-size: 13px;
          }
          .s1-members-count {
            font-size: 12px;
          }
          .count-number {
            font-size: 16px;
          }
          .count-text {
            font-size: 11px;
          }
          .s1-cta-btn { 
            height: 54px;
            border-radius: 14px;
          }
          .s1-cta-text { 
            font-size: 16px;
          }
          .s1-cta-arrow { 
            font-size: 20px;
          }
          .s1-progress { 
            width: 72px;
          }
        }

        /* 极小屏适配 */
        @media (max-width: 359px) {
          .s1-top-label {
            font-size: 9px;
          }
          .s1-cta-btn { 
            height: 46px; 
            padding: 0 22px;
          }
          .s1-cta-text { 
            font-size: 14px;
          }
          .screen-front-keypoints {
            font-size: 12px;
          }
          .count-number {
            font-size: 13px;
          }
          .count-text {
            font-size: 9px;
          }
        }

        /* ═══════════════════════════════════════════════════════════════════
           无障碍支持
           ═══════════════════════════════════════════════════════════════════ */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
          
          .h1-chunk, .subline, .screen-front-keypoints, 
          .s1-status-label, .cta-container, .s1-top-label, .s1-members-count {
            opacity: 1 !important;
            transform: none !important;
          }
          
          .s1-progress-fill {
            transform: scaleX(0.85) !important;
          }
        }

        /* 高对比度模式 */
        @media (prefers-contrast: high) {
          .s1-cta-btn {
            border-width: 2px;
            border-color: var(--gold-bright);
            background: rgba(184, 149, 106, 0.15);
          }
          
          .s1-cta-text {
            color: #FFFFFF;
            font-weight: 600;
          }
        }

        /* 打印隐藏 */
        @media print {
          .s1-cta-btn, .s1-progress {
            display: none;
          }
        }
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
