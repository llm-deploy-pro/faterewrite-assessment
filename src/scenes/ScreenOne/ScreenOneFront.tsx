// src/scenes/ScreenOne/ScreenOneFront.tsx
import { useEffect, useRef, useState, useCallback } from "react";
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
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // 倒计时状态
  const [countdown, setCountdown] = useState<number>(12);
  const [countdownStarted, setCountdownStarted] = useState(false);
  
  // CTA 状态管理
  const [ctaVisible, setCtaVisible] = useState(false);
  const [hasClicked, setHasClicked] = useState(false);
  const [shouldPulse, setShouldPulse] = useState(false);

  // ═══════════════════════════════════════════════════════════════
  // 倒计时逻辑 - MVP核心交互
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    // 1.5秒后启动倒计时
    const startTimer = setTimeout(() => {
      setCountdownStarted(true);
      setCtaVisible(true);
      
      // 开始倒计时
      countdownIntervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            // 倒计时结束
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
              countdownIntervalRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 1500);

    return () => {
      clearTimeout(startTimer);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

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
  // 修改：脉冲动画提前触发逻辑
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    // 当倒计时小于或等于4秒时，开始脉冲动画
    if (countdown <= 4) {
      setShouldPulse(true);
    }
  }, [countdown]);

  // ═══════════════════════════════════════════════════════════════
  // CTA 点击处理（唯一的导航入口）
  // ═══════════════════════════════════════════════════════════════
  const handleCTAClick = useCallback(() => {
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
          countdown_value: countdown,
          frid: frid,
        }, { eventID: fbEventId });
        console.log(`[FB打点] S1_Front_CTA_Click 触发成功`, { frid, fbEventId, countdown });
      }
    }

    // 标记已点击
    setHasClicked(true);
    setShouldPulse(false);
    
    // 停止倒计时
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    
    try {
      localStorage.setItem('cta_clicked_assessment_49', 'true');
    } catch (error) {
      console.warn('localStorage not available:', error);
    }

    // 优雅离场动画
    document.documentElement.classList.add('page-leave');
    
    setTimeout(() => {
      // 发出事件，由 ScreenOne.tsx 监听后切换到后屏
      window.dispatchEvent(new CustomEvent('s1:cta:continue'));
      requestAnimationFrame(() => {
        document.documentElement.classList.remove('page-leave');
        window.scrollTo(0, 0);
      });
    }, 220);
  }, [hasClicked, countdown]);

  // ═══════════════════════════════════════════════════════════════
  // 倒计时结束后自动跳转
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    // 当倒计时归零且用户尚未点击时，自动触发与点击按钮相同的行为
    if (countdown === 0 && !hasClicked) {
      handleCTAClick();
    }
  }, [countdown, hasClicked, handleCTAClick]);

  return (
    <section className="screen-front-container">
      {/* Logo 区域 - 独立固定头部 */}
      <div className="logo-header">
        <Wordmark name="Resonance" href="/" />
      </div>
      
      {/* 顶部系统信息 */}
      <div className="s1-top-label">
        <span className="label-prefix">SOURCE-LEVEL DATA</span>
        <span className="label-divider">//</span>
        <span className="label-suffix">AKASHIC DIRECTIVE</span>
      </div>

      <div className="screen-front-content">
        {/* 核心图腾 (文字替代) */}
        <div className="project-sigil">
          [ PROJECT STARLIGHT SIGIL ]
        </div>
        
        {/* 权威认证文本 */}
        <div className="auth-protocol">
          Access Protocol Authenticated: Project Starlight
        </div>

        {/* 解码日志摘录 - 优化移动端尺寸 */}
        <div className="decoded-log-entry">
          <p className="log-text">
            "Log Entry 777. For the first time, we have successfully isolated and decoded a readable fragment of a core soul signature from the Akashic Field. The data confirms our primary hypothesis: individual timelines are not random walks, but are governed by a pre-encoded 'Vibrational Contract.'"
          </p>
          <p className="log-text log-continuation">
            "Distortions ('glitches') are not failures, but deviations from this contract, often amplified by low-resonance environmental matrices. The only path to realignment is a direct activation of the contract's core resonant frequencies. We now possess the key."
          </p>
          <p className="log-signature">
            — From the Declassified Logs of Project Starlight
          </p>
        </div>

        {/* 交互核心：倒计时与行动号召 */}
        <div className={`interaction-core ${ctaVisible ? 'visible' : ''}`}>
          {/* 紧迫感声明 */}
          <p className="urgency-statement">
            A unique activation window has opened. The portal to your decoded analysis is closing.
          </p>

          {/* 倒计时器 */}
          <div className={`countdown-timer ${countdownStarted ? 'active' : ''} ${shouldPulse ? 'expired' : ''}`}>
            <span className="countdown-number">{countdown}</span>
          </div>

          {/* CTA 按钮 */}
          <button
            type="button"
            onClick={handleCTAClick}
            disabled={hasClicked}
            className={`s1-cta-btn ${shouldPulse ? 'pulse' : ''} ${shouldPulse ? 'urgent' : ''}`}
            aria-label="Access your decoded analysis"
          >
            <span className="s1-cta-text">ACCESS YOUR DECODED ANALYSIS</span>
            <span className="s1-cta-arrow">→</span>
          </button>
        </div>
      </div>

      {/* @ts-ignore - styled-jsx specific attribute */}
      <style jsx>{`
        /* ═══════════════════════════════════════════════════════════════════
           设计系统 - 奢华品牌配色
           ═══════════════════════════════════════════════════════════════════ */
        :root {
          --bg-primary: #0a0f1b;
          --bg-secondary: #141922;
          --gold: #b8956a;
          --gold-bright: #d4b896;
          --gold-hover: #c4a57c;
          --gold-border: rgba(184, 149, 106, 0.3);
          --cream: #f5f5f0;
          --cream-bright: #fafaf5;
          --cream-dim: rgba(245, 245, 240, 0.7);
          --cream-muted: rgba(245, 245, 240, 0.5);
        }

        /* 禁止滚动 - 严格执行 */
        :global(html), :global(body) {
          overflow: hidden !important;
          height: 100% !important;
          position: fixed !important;
          width: 100% !important;
        }

        /* ═══════════════════════════════════════════════════════════════════
           容器基础 - 奢华背景强化
           ═══════════════════════════════════════════════════════════════════ */
        .screen-front-container {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          height: 100dvh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          background: linear-gradient(135deg, 
            var(--bg-primary) 0%, 
            var(--bg-secondary) 100%
          );
          overflow: hidden;
          padding: 0;
        }

        /* 高级星尘背景效果 - 增强 */
        .screen-front-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(circle at 20% 30%, rgba(184, 149, 106, 0.06) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(212, 184, 150, 0.04) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(184, 149, 106, 0.02) 0%, transparent 70%);
          pointer-events: none;
          z-index: 1;
        }

        /* 微妙噪点纹理 */
        .screen-front-container::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.03;
          pointer-events: none;
          z-index: 1;
        }

        /* ═══════════════════════════════════════════════════════════════════
           Logo 头部 - 独立区域避免重叠
           ═══════════════════════════════════════════════════════════════════ */
        .logo-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 20px;
          background: linear-gradient(to bottom,
            rgba(10, 15, 27, 0.95) 0%,
            rgba(10, 15, 27, 0.85) 60%,
            transparent 100%
          );
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
        }

        /* ═══════════════════════════════════════════════════════════════════
           顶部标签 - 调整位置避免与Logo重叠
           ═══════════════════════════════════════════════════════════════════ */
        .s1-top-label {
          position: fixed;
          top: 75px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 90;
          font-size: 9px;
          line-height: 1.4;
          font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          white-space: nowrap;
          opacity: 0;
          animation: topLabelReveal 600ms cubic-bezier(0.23, 1, 0.32, 1) forwards;
          /* 增强视觉效果 */
          padding: 8px 16px;
          background: rgba(20, 25, 35, 0.6);
          border: 1px solid rgba(184, 149, 106, 0.2);
          border-radius: 20px;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          box-shadow: 
            0 2px 12px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .label-prefix {
          color: rgba(184, 149, 106, 0.6);
        }

        .label-divider {
          color: rgba(184, 149, 106, 0.3);
          margin: 0 6px;
        }

        .label-suffix {
          color: rgba(212, 184, 150, 0.9);
          font-weight: 600;
          text-shadow: 0 0 12px rgba(212, 184, 150, 0.3);
        }

        @keyframes topLabelReveal {
          0% { 
            opacity: 0;
            transform: translateX(-50%) translateY(-8px);
          }
          100% { 
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        /* ═══════════════════════════════════════════════════════════════════
           主内容容器 - 调整顶部间距
           ═══════════════════════════════════════════════════════════════════ */
        .screen-front-content {
          position: relative;
          width: 100%;
          max-width: 600px;
          text-align: center;
          color: var(--cream);
          padding: 125px 16px 20px;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
        }

        /* 隐藏滚动条 */
        .screen-front-content::-webkit-scrollbar {
          width: 0;
          display: none;
        }

        .screen-front-content {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        /* ═══════════════════════════════════════════════════════════════════
           核心图腾 (文字版) - 视觉强化
           ═══════════════════════════════════════════════════════════════════ */
        .project-sigil {
          margin: 0 0 12px 0;
          padding: 10px 18px;
          font-size: 13px;
          line-height: 1;
          color: var(--gold-bright);
          font-family: 'Bodoni MT', 'Didot', Georgia, serif;
          letter-spacing: 0.12em;
          font-weight: 400;
          text-align: center;
          position: relative;
          opacity: 0;
          animation: sigilReveal 800ms cubic-bezier(0.23, 1, 0.32, 1) 200ms forwards;
          display: inline-block;
          /* 增强背景 */
          background: linear-gradient(135deg,
            rgba(184, 149, 106, 0.05) 0%,
            rgba(184, 149, 106, 0.02) 100%
          );
          border-radius: 4px;
          box-shadow: 
            0 2px 12px rgba(184, 149, 106, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        /* 装饰性边框 - 增强 */
        .project-sigil::before,
        .project-sigil::after {
          content: '';
          position: absolute;
          width: 26px;
          height: 26px;
          border: 1.5px solid rgba(184, 149, 106, 0.4);
          transition: all 300ms ease;
        }

        .project-sigil::before {
          top: -2px;
          left: -2px;
          border-right: none;
          border-bottom: none;
        }

        .project-sigil::after {
          bottom: -2px;
          right: -2px;
          border-left: none;
          border-top: none;
        }

        @keyframes sigilReveal {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* ═══════════════════════════════════════════════════════════════════
           权威认证文本 - 视觉增强
           ═══════════════════════════════════════════════════════════════════ */
        .auth-protocol {
          margin: 0 0 16px 0;
          padding: 0;
          font-size: 10px;
          line-height: 1.4;
          color: var(--cream-muted);
          font-family: 'SF Mono', monospace;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          font-weight: 500;
          text-align: center;
          opacity: 0;
          animation: authFade 600ms cubic-bezier(0.23,1,0.32,1) 400ms forwards;
          /* 添加微妙光晕 */
          text-shadow: 0 0 20px rgba(184, 149, 106, 0.15);
        }

        @keyframes authFade {
          to { opacity: 1; }
        }

        /* ═══════════════════════════════════════════════════════════════════
           解码日志摘录 - 奢华卡片强化
           ═══════════════════════════════════════════════════════════════════ */
        .decoded-log-entry {
          margin: 0 0 18px 0;
          padding: 16px 18px;
          background: linear-gradient(135deg, 
            rgba(20, 25, 35, 0.6) 0%, 
            rgba(15, 20, 30, 0.5) 100%
          );
          border: 1px solid rgba(184, 149, 106, 0.25);
          border-radius: 8px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          opacity: 0;
          animation: logEntryFade 700ms cubic-bezier(0.23,1,0.32,1) 600ms forwards;
          width: 100%;
          max-width: 480px;
          /* 奢华阴影 */
          box-shadow: 
            0 4px 20px rgba(0, 0, 0, 0.3),
            0 1px 4px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.03);
        }

        @keyframes logEntryFade {
          0% {
            opacity: 0;
            transform: translateY(12px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .log-text {
          margin: 0 0 10px 0;
          padding: 0;
          font-size: 12px;
          line-height: 1.6;
          color: rgba(245, 245, 240, 0.9);
          font-family: Georgia, 'Times New Roman', serif;
          font-style: italic;
          letter-spacing: 0.01em;
          text-align: left;
        }

        .log-text.log-continuation {
          margin-bottom: 14px;
        }

        .log-signature {
          margin: 0;
          padding: 0;
          font-size: 11px;
          line-height: 1.4;
          color: var(--gold-bright);
          font-family: Georgia, 'Times New Roman', serif;
          font-style: italic;
          text-align: right;
          letter-spacing: 0.02em;
          opacity: 0.85;
          text-shadow: 0 0 15px rgba(184, 149, 106, 0.2);
        }

        /* ═══════════════════════════════════════════════════════════════════
           交互核心区域
           ═══════════════════════════════════════════════════════════════════ */
        .interaction-core {
          opacity: 0;
          transform: translateY(8px);
          transition: all 600ms cubic-bezier(0.23, 1, 0.32, 1);
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 10px;
        }

        .interaction-core.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* 紧迫感声明 - 视觉强化 */
        .urgency-statement {
          margin: 0 0 14px 0;
          padding: 0 10px;
          font-size: 13px;
          line-height: 1.5;
          color: var(--cream);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-weight: 400;
          letter-spacing: 0.01em;
          text-align: center;
          /* 添加微妙光晕 */
          text-shadow: 0 1px 8px rgba(184, 149, 106, 0.1);
        }

        /* ═══════════════════════════════════════════════════════════════════
           倒计时器 - 奢华强化
           ═══════════════════════════════════════════════════════════════════ */
        .countdown-timer {
          margin: 0 0 16px 0;
          padding: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: scale(0.8);
          transition: all 400ms cubic-bezier(0.23, 1, 0.32, 1);
          /* 奢华背景 */
          background: linear-gradient(135deg,
            rgba(184, 149, 106, 0.08) 0%,
            rgba(184, 149, 106, 0.03) 100%
          );
          border: 2px solid rgba(184, 149, 106, 0.25);
          border-radius: 16px;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          box-shadow: 
            0 4px 20px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .countdown-timer.active {
          opacity: 1;
          transform: scale(1);
        }

        .countdown-timer.expired {
          animation: countdownPulse 1.5s ease-in-out infinite;
          border-color: rgba(184, 149, 106, 0.4);
        }

        @keyframes countdownPulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 
              0 4px 20px rgba(0, 0, 0, 0.2),
              0 0 0 0 rgba(184, 149, 106, 0.4);
          }
          50% {
            transform: scale(1.03);
            box-shadow: 
              0 4px 20px rgba(0, 0, 0, 0.2),
              0 0 20px 8px rgba(184, 149, 106, 0.2);
          }
        }

        .countdown-number {
          font-size: 56px;
          line-height: 1;
          font-weight: 300;
          color: var(--gold-bright);
          font-family: -apple-system, BlinkMacSystemFont, Georgia, serif;
          letter-spacing: -0.02em;
          text-shadow: 
            0 0 30px rgba(184, 149, 106, 0.6),
            0 0 60px rgba(184, 149, 106, 0.4),
            0 2px 4px rgba(0, 0, 0, 0.3);
          position: relative;
        }

        /* ═══════════════════════════════════════════════════════════════════
           CTA 按钮 - 奢华品牌强化
           ═══════════════════════════════════════════════════════════════════ */
        .s1-cta-btn {
          width: 100%;
          max-width: 360px;
          height: 52px;
          margin: 0 auto;
          border-radius: 26px;
          background: linear-gradient(135deg, 
            rgba(184, 149, 106, 0.15) 0%, 
            rgba(184, 149, 106, 0.08) 100%
          );
          border: 2px solid var(--gold-border);
          color: var(--cream-bright);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: all 300ms cubic-bezier(0.23, 1, 0.32, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          text-transform: uppercase;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          /* 奢华阴影 */
          box-shadow: 
            0 4px 20px rgba(0, 0, 0, 0.25),
            0 2px 8px rgba(0, 0, 0, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        /* 按钮光晕边框 - 增强 */
        .s1-cta-btn::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 26px;
          padding: 2px;
          background: linear-gradient(90deg, 
            transparent,
            var(--gold-bright),
            transparent
          );
          -webkit-mask: 
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          mask: 
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 300ms ease;
          animation: shimmer 3s linear infinite;
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .s1-cta-btn.urgent::before {
          opacity: 0.7;
        }

        .s1-cta-text {
          color: var(--cream-bright);
          transition: color 200ms ease;
          position: relative;
          z-index: 1;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .s1-cta-arrow {
          color: var(--gold-bright);
          font-size: 18px;
          transition: transform 200ms ease;
          position: relative;
          z-index: 1;
        }

        /* 强脉动动画 - 增强 */
        @keyframes urgentPulse {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 
              0 4px 20px rgba(0, 0, 0, 0.25),
              0 0 0 0 rgba(184, 149, 106, 0.6);
          }
          50% { 
            transform: scale(1.02);
            box-shadow: 
              0 6px 28px rgba(184, 149, 106, 0.35),
              0 0 25px 12px rgba(184, 149, 106, 0.25);
          }
        }

        .s1-cta-btn.pulse {
          animation: urgentPulse 1.5s ease-in-out infinite;
          border-color: var(--gold-bright);
        }

        /* 悬停效果 - 增强 */
        @media (hover: hover) {
          .s1-cta-btn:hover:not(:disabled) {
            border-color: var(--gold-bright);
            background: linear-gradient(135deg, 
              rgba(212, 184, 150, 0.25) 0%, 
              rgba(184, 149, 106, 0.15) 100%
            );
            transform: translateY(-2px);
            box-shadow: 
              0 8px 32px rgba(184, 149, 106, 0.35),
              0 4px 12px rgba(0, 0, 0, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.15);
          }

          .s1-cta-btn:hover:not(:disabled)::before {
            opacity: 0.5;
          }

          .s1-cta-btn:hover:not(:disabled) .s1-cta-arrow {
            transform: translateX(4px);
          }

          .project-sigil:hover::before,
          .project-sigil:hover::after {
            border-color: rgba(184, 149, 106, 0.6);
          }
        }

        /* 点击状态 */
        .s1-cta-btn:active:not(:disabled) {
          transform: scale(0.98);
        }

        /* 禁用状态 */
        .s1-cta-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
          animation: none;
        }

        /* ═══════════════════════════════════════════════════════════════════
           响应式适配 - 桌面端增强
           ═══════════════════════════════════════════════════════════════════ */
        @media (min-width: 769px) {
          .logo-header {
            padding: 28px 40px;
          }

          .s1-top-label {
            top: 95px;
            font-size: 10px;
            padding: 10px 20px;
          }
          
          .screen-front-content {
            padding: 145px 40px 30px;
            max-width: 680px;
          }
          
          .project-sigil {
            font-size: 16px;
            padding: 14px 24px;
            margin-bottom: 16px;
          }
          
          .project-sigil::before,
          .project-sigil::after {
            width: 32px;
            height: 32px;
          }
          
          .auth-protocol {
            font-size: 11px;
            margin-bottom: 24px;
          }
          
          .decoded-log-entry {
            padding: 24px 30px;
            margin-bottom: 28px;
            max-width: 560px;
          }
          
          .log-text {
            font-size: 14px;
            line-height: 1.7;
            margin-bottom: 12px;
          }
          
          .log-signature {
            font-size: 12px;
          }
          
          .urgency-statement {
            font-size: 15px;
            margin-bottom: 20px;
          }
          
          .countdown-timer {
            margin-bottom: 24px;
            padding: 16px;
          }
          
          .countdown-number {
            font-size: 76px;
          }
          
          .s1-cta-btn { 
            height: 56px;
            font-size: 14px;
            max-width: 420px;
          }
          
          .s1-cta-arrow { 
            font-size: 20px;
          }
        }

        /* 超小屏适配 */
        @media (max-width: 359px) {
          .logo-header {
            padding: 16px;
          }

          .s1-top-label {
            font-size: 8px;
            top: 65px;
            padding: 6px 12px;
          }
          
          .screen-front-content {
            padding: 110px 12px 15px;
          }
          
          .project-sigil {
            font-size: 11px;
            padding: 8px 12px;
          }
          
          .decoded-log-entry {
            padding: 12px 14px;
          }
          
          .log-text {
            font-size: 11px;
          }
          
          .urgency-statement {
            font-size: 12px;
          }
          
          .countdown-number {
            font-size: 48px;
          }
          
          .s1-cta-btn { 
            height: 48px;
            font-size: 12px;
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
          
          .project-sigil, .auth-protocol, .decoded-log-entry,
          .interaction-core, .countdown-timer, .s1-top-label {
            opacity: 1 !important;
            transform: none !important;
          }
        }

        /* 高对比度模式 */
        @media (prefers-contrast: high) {
          .s1-cta-btn {
            border-width: 3px;
            border-color: var(--gold-bright);
            background: rgba(184, 149, 106, 0.25);
          }
          
          .countdown-number {
            color: var(--gold-bright);
          }
          
          .decoded-log-entry,
          .s1-top-label {
            border-width: 2px;
            border-color: rgba(184, 149, 106, 0.4);
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