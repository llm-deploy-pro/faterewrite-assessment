// src/scenes/ScreenOne/ScreenOneBack.tsx
import { useEffect, useRef, useState } from "react";
import IntakeForm from "../../components/IntakeForm";

/* =====================================================================
   跨子域去重工具
   ===================================================================== */
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
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/; domain=.faterewrite.com; expires=${exp}; SameSite=Lax${secureFlag}`;
    if (document.cookie.indexOf(name + "=") === -1) {
      document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/; expires=${exp}; SameSite=Lax${secureFlag}`;
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
    frid = "fr_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    setRootCookie("frd_uid", frid, 30);
  }
  if (!win.__frid) win.__frid = frid;
  return frid;
}

export default function ScreenOneBack() {
  const hasTrackedRef = useRef(false);
  const hasClickedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm] = useState(false);

  useEffect(() => {
    if (hasTrackedRef.current) return;
    hasTrackedRef.current = true;
    const frid = ensureFrid();
    const isDev = window.location.hostname === "localhost";
    
    const loadTimer = setTimeout(() => {
      if (typeof (window as any).fbq !== "undefined" && markOnce("s1bl", isDev)) {
        const eventId = "ev_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        (window as any).fbq("track", "ViewContent", {
          content_name: "Screen1-Back-Loaded",
          content_category: "frequency-map-reveal",
          currency: "USD",
          value: 47.0,
          user_id: frid,
        }, { eventID: eventId });
      }
    }, 600);

    const dwell3sTimer = setTimeout(() => {
      if (typeof (window as any).fbq !== "undefined" && markOnce("s1bd3s", isDev)) {
        const eventId = "ev_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        (window as any).fbq("trackCustom", "S1_Back_Dwell_3s", {
          content_name: "ScreenOne_Back_Dwell", dwell_time_seconds: 3,
          screen_position: "back", screen_number: 1,
          page_url: window.location.href, user_id: frid,
        }, { eventID: eventId });
      }
    }, 3000);

    const dwell10sTimer = setTimeout(() => {
      if (typeof (window as any).fbq !== "undefined" && markOnce("s1bd10s", isDev)) {
        const eventId = "ev_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        (window as any).fbq("trackCustom", "S1_Back_Dwell_10s", {
          content_name: "ScreenOne_Back_Dwell", dwell_time_seconds: 10,
          screen_position: "back", screen_number: 1,
          page_url: window.location.href, user_id: frid,
        }, { eventID: eventId });
      }
    }, 10000);

    const dwell20sTimer = setTimeout(() => {
      if (typeof (window as any).fbq !== "undefined" && markOnce("s1bd20s", isDev)) {
        const eventId = "ev_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        (window as any).fbq("trackCustom", "S1_Back_Dwell_20s", {
          content_name: "ScreenOne_Back_Dwell", dwell_time_seconds: 20,
          screen_position: "back", screen_number: 1,
          page_url: window.location.href, user_id: frid,
        }, { eventID: eventId });
      }
    }, 20000);
    
    return () => {
      clearTimeout(loadTimer);
      clearTimeout(dwell3sTimer);
      clearTimeout(dwell10sTimer);
      clearTimeout(dwell20sTimer);
    };
  }, []);

  const handleClickCTA = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (hasClickedRef.current || isLoading) return;
    hasClickedRef.current = true;
    setIsLoading(true);

    const frid = ensureFrid();
    const isDev = window.location.hostname === "localhost";

    if (typeof (window as any).fbq !== "undefined" && markOnce("s1b_cta", isDev)) {
      const eventId = "ev_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      (window as any).fbq("trackCustom", "S1_Back_CTA_Click", {
        content_name: "ScreenOne_Back_CTA", click_location: "main_cta_button",
        screen_position: "back", screen_number: 1,
        page_url: window.location.href, user_id: frid,
      }, { eventID: eventId });
    }

    // 跳转到支付页
    setTimeout(() => {
      window.location.href = "https://pay.faterewrite.com/";
    }, 300);
  };

  // 如果显示表单，直接返回表单组件
  if (showForm) {
    return <IntakeForm />;
  }

  return (
    <section className="s1-container">
      <div className={`s1-inner`}>
        {/* ============= 1. 标题区 ============= */}
        <header className={`s1-header`}>
          <h1 className="s1-title">Next: verify to see your city's roster</h1>
          <p className="s1-bridge">These are the women you just saw above — verifying shows you the full list.</p>
          <p className="s1-subtitle">We run in all 50 states. To see this week's real options for your city, complete the $47 verification (100% credited).</p>
        </header>

        <div className={`s1-divider`}></div>

        {/* ============= 2. 全国覆盖城市列表 ============= */}
        <section className="s1-live-roster">
          <p className="live-roster-text">
            <span className="roster-label"><strong>Live roster in:</strong></span>
            <span className="city-item" style={{"--index": 0} as React.CSSProperties}>Miami</span>
            <span className="city-separator">•</span>
            <span className="city-item" style={{"--index": 1} as React.CSSProperties}>NYC</span>
            <span className="city-separator">•</span>
            <span className="city-item" style={{"--index": 2} as React.CSSProperties}>LA</span>
            <span className="city-separator">•</span>
            <span className="city-item" style={{"--index": 3} as React.CSSProperties}>Vegas</span>
            <span className="city-separator">•</span>
            <span className="city-item" style={{"--index": 4} as React.CSSProperties}>Dallas</span>
            <span className="city-separator">•</span>
            <span className="city-item" style={{"--index": 5} as React.CSSProperties}>Chicago</span>
            <span className="city-separator">•</span>
            <span className="city-item" style={{"--index": 6} as React.CSSProperties}>Atlanta</span>
            <span className="city-separator">•</span>
            <span className="city-item" style={{"--index": 7} as React.CSSProperties}>Houston</span>
            <span className="city-separator">•</span>
            <span className="city-more">+40 more</span>
          </p>
        </section>

        <div className={`s1-divider`}></div>

        {/* ============= 3. 3步流程 ============= */}
        <section className="s1-flow-steps">
          <div className="flow-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <p className="step-title">Pay $47 — holds your spot nationwide, proves you're real</p>
            </div>
          </div>
          <div className="flow-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <p className="step-title">Within 2 hours — we send 2–3 verified women in your city</p>
            </div>
          </div>
          <div className="flow-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <p className="step-title">You choose → we arrange → she shows up</p>
            </div>
          </div>
        </section>

        <div className={`s1-divider`}></div>

        {/* ============= 4. What Happens When She Shows Up 场景卡片 ============= */}
        <section className="s1-scenario-card">
          <h3 className="scenario-card-title">What happens when she shows up:</h3>
          <ul className="scenario-list">
            <li className="scenario-item">
              <span className="scenario-check">✓</span>
              <div className="scenario-content">
                <p className="scenario-main">Dinner at that steakhouse you've been wanting to try</p>
                <p className="scenario-sub">She arrives on time. Dressed right. Knows how to hold a conversation.</p>
              </div>
            </li>
            <li className="scenario-item">
              <span className="scenario-check">✓</span>
              <div className="scenario-content">
                <p className="scenario-main">That wedding or business event you didn't want to show up to alone</p>
                <p className="scenario-sub">Your ex sees you. Your colleagues ask who she is. You don't explain.</p>
              </div>
            </li>
            <li className="scenario-item">
              <span className="scenario-check">✓</span>
              <div className="scenario-content">
                <p className="scenario-main">Weekend trip when you're tired of going solo</p>
                <p className="scenario-sub">Miami. Vegas. Wherever. Pool, dinner, no "I have to leave early."</p>
              </div>
            </li>
          </ul>
        </section>

        <div className={`s1-divider`}></div>

        {/* ============= 5. Why Men Use This Instead 对比条 ============= */}
        <section className="s1-comparison">
          <h3 className="comparison-title">Why men use this instead:</h3>
          <div className="comparison-list">
            <p className="comparison-line">
              <strong>Dating apps:</strong> You match. You text. She stops replying. Repeat.
            </p>
            <p className="comparison-line">
              <strong>Escort sites:</strong> Fake photos. Shows up looking different. Feels transactional.
            </p>
            <p className="comparison-line">
              <strong>This:</strong> She shows up looking like her photos. Acts like she wants to be there.
            </p>
          </div>
        </section>

        <div className={`s1-divider`}></div>

        {/* ============= 6. 退款保障 ============= */}
        <section className="s1-refund-guarantee">
          <p className="refund-text">Can't arrange in 7 days? <strong>Full refund.</strong></p>
        </section>

        <div className={`s1-divider`}></div>

        {/* ============= 7. CTA按钮 ============= */}
        <section className="s1-cta">
          <button className="cta-btn" onClick={handleClickCTA} disabled={isLoading}>
            <span className="cta-text">
              {isLoading ? "PROCESSING..." : "CONTINUE TO SECURE CHECKOUT"}
            </span>
          </button>
          <p className="cta-meta">
            <span className="cta-footer">One-time access. No monthly billing. No club fees.</span>
            <span className="cta-footer-em">This week's arrangements start Friday.</span>
          </p>
        </section>
      </div>

      <style>{`
        /* ===============================================================
           极致压缩版 - 删减后的核心框架
           已删除：ACCESS卡片 / 场景卡片 / Why We Need Info
           =============================================================== */
        
        :root {
          /* 背景系统 */
          --bg-primary: #0D1B2A;
          --bg-card-dark: rgba(20, 35, 50, 0.85);
          --bg-card-light: rgba(20, 35, 50, 0.4);
          
          /* 高端文字颜色系统 */
          --text-hero: #FFFFFF;
          --text-primary: #E8EDF2;
          --text-secondary: #B8C5D6;
          --text-tertiary: #8995A8;
          --text-muted: #5D6B7E;
          
          /* 升级后的奢华金色系统 */
          --gold-primary: #D4AF37;      /* 主金色（真金色） */
          --gold-bright: #F4D03F;       /* 高亮金（闪光峰值） */
          --gold-dark: #B8860B;         /* 暗金（阴影） */
          --gold-platinum: #FFF5DC;     /* 白金光（顶部高光） */
          
          /* 边框系统 */
          --border-subtle: rgba(255, 255, 255, 0.12);
          --border-medium: rgba(255, 255, 255, 0.18);
          --border-strong: rgba(255, 255, 255, 0.25);
        }

        .s1-container {
          height: 100vh;
          max-height: 100vh;
          background: linear-gradient(180deg, #0D1B2A 0%, #142332 50%, #0D1B2A 100%);
          color: var(--text-primary);
          overflow: hidden;
          position: relative;
        }

        .s1-inner {
          width: 100%;
          height: 100%;
          max-width: 378px;
          margin: 0 auto;
          padding: 4px 10px 6px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          box-sizing: border-box;
          overflow: hidden;
        }

        /* 分隔线 */
        .s1-divider {
          height: 1px;
          background: linear-gradient(
            90deg, 
            transparent 0%, 
            var(--border-medium) 50%,
            transparent 100%
          );
          margin: 0;
          flex-shrink: 0;
          opacity: 0.8;
        }

        /* ============= 标题区 ============= */
        .s1-header {
          text-align: center;
          flex-shrink: 0;
          padding: 8px 0 6px;
          opacity: 0;
          animation: fadeIn 0.8s ease-out 0.2s forwards;
          max-height: 200px;
          overflow: hidden;
        }

        .s1-title {
          font-family: 'SF Mono', 'Roboto Mono', 'Courier New', monospace;
          font-size: 13px;
          font-weight: 700;
          line-height: 1.25;
          color: var(--text-hero);
          margin: 0 0 4px 0;
          letter-spacing: 0.02em;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
        }

        .s1-bridge {
          font-family: 'SF Mono', 'Roboto Mono', 'Courier New', monospace;
          font-size: 8.5px;
          font-weight: 600;
          line-height: 1.4;
          color: var(--gold-primary);
          margin: 0 0 6px 0;
          letter-spacing: 0.01em;
          padding: 0 8px;
          text-shadow: 0 0 10px rgba(212, 175, 55, 0.6);
          position: relative;
          overflow: hidden;
        }

        /* 金色扫光效果 - 使用新金色 */
        .s1-bridge::after {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(244, 208, 63, 0.5) 50%,
            transparent 100%
          );
          animation: bridgeShine 3s ease-in-out 0.5s infinite;
        }

        @keyframes bridgeShine {
          0% { left: -100%; }
          100% { left: 200%; }
        }

        .s1-subtitle {
          font-family: 'SF Mono', 'Roboto Mono', 'Courier New', monospace;
          font-size: 8px;
          font-weight: 400;
          line-height: 1.45;
          color: var(--text-secondary);
          margin: 0;
          letter-spacing: 0.01em;
          padding: 0 8px;
        }

        /* ============= 全国覆盖城市列表 ============= */
        .s1-live-roster {
          flex-shrink: 0;
          padding: 10px 14px;
          background: linear-gradient(
            135deg,
            rgba(20, 35, 50, 0.85) 0%,
            rgba(13, 27, 42, 0.9) 100%
          );
          border: 1px solid rgba(212, 175, 55, 0.4);
          border-radius: 4px;
          backdrop-filter: blur(12px);
          box-shadow: 
            0 0 0 1px rgba(212, 175, 55, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.08),
            inset 0 -1px 8px rgba(0, 0, 0, 0.25),
            0 2px 12px rgba(212, 175, 55, 0.15),
            0 4px 20px rgba(0, 0, 0, 0.3);
          opacity: 0;
          animation: fadeIn 0.8s ease-out 0.3s forwards;
          position: relative;
          overflow: hidden;
        }

        /* 顶部扫光装饰 - subtle版本 */
        .s1-live-roster::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 200%;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(212, 175, 55, 0.3) 50%,
            transparent 100%
          );
          animation: topScan 4s ease-in-out 0.8s infinite;
        }

        @keyframes topScan {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        .live-roster-text {
          font-size: 7.5px;
          line-height: 1.6;
          color: var(--text-secondary);
          margin: 0;
          letter-spacing: 0.02em;
          text-align: center;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }

        /* 标签固定显示 */
        .roster-label {
          color: var(--text-primary);
          margin-right: 2px;
        }

        .roster-label strong {
          color: var(--gold-primary);
          font-weight: 700;
          text-shadow: 0 0 10px rgba(212, 175, 55, 0.6);
        }

        .roster-label strong {
          color: #B8A160;
          font-weight: 700;
          text-shadow: 0 0 8px rgba(184, 161, 96, 0.4);
        }

        /* 城市名 - 初始状态 */
        .city-item {
          color: #5D6B7E;
          font-weight: 500;
          opacity: 0.5;
          transition: all 0.6s ease;
          animation: cityFadeIn 0.8s ease-out forwards;
          animation-delay: calc(0.5s + var(--index) * 0.12s);
        }

        /* 城市淡入动画 - 克制版 */
        @keyframes cityFadeIn {
          0% {
            opacity: 0.5;
            transform: translateY(3px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
            color: var(--gold-primary);
          }
        }

        /* 点亮后subtle呼吸 */
        .city-item {
          animation: 
            cityFadeIn 0.8s ease-out forwards,
            subtleBreath 4s ease-in-out infinite;
          animation-delay: 
            calc(0.5s + var(--index) * 0.12s),
            calc(1.3s + var(--index) * 0.12s);
        }

        @keyframes subtleBreath {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        /* 城市分隔符 */
        .city-separator {
          color: rgba(212, 175, 55, 0.4);
          font-size: 6px;
          opacity: 0;
          animation: separatorFade 0.4s ease-out forwards;
          animation-delay: calc(0.7s + var(--index) * 0.18s);
        }

        @keyframes separatorFade {
          to { opacity: 1; }
        }

        /* +40 more */
        .city-more {
          color: var(--gold-primary);
          font-weight: 600;
          opacity: 0;
          animation: moreFade 0.8s ease-out forwards;
          animation-delay: 2.1s;
          text-shadow: 0 0 10px rgba(212, 175, 55, 0.7);
        }

        @keyframes moreFade {
          0% {
            opacity: 0;
            transform: translateX(-10px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* ============= 3步流程 ============= */
        .s1-flow-steps {
          flex-shrink: 0;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          opacity: 0;
          animation: fadeIn 0.8s ease-out 0.4s forwards;
        }

        .flow-step {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 10px 12px;
          background: var(--bg-card-dark);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 4px;
          backdrop-filter: blur(10px);
          box-shadow: 
            0 0 0 1px rgba(184, 161, 96, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.05),
            inset 0 -1px 6px rgba(0, 0, 0, 0.2),
            0 1px 6px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
        }

        .flow-step:hover {
          border-color: rgba(255, 255, 255, 0.22);
          transform: translateX(2px);
          box-shadow: 
            0 0 0 1px rgba(184, 161, 96, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.08),
            inset 0 -1px 6px rgba(0, 0, 0, 0.2),
            0 2px 10px rgba(0, 0, 0, 0.25);
        }

        .step-number {
          flex-shrink: 0;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: linear-gradient(135deg, #B8A160 0%, #8D7849 100%);
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 800;
          color: #0D1B2A;
          box-shadow: 
            0 0 12px rgba(184, 161, 96, 0.35),
            0 2px 6px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
          text-shadow: 
            0 1px 0 rgba(255, 255, 255, 0.3),
            0 -1px 0 rgba(0, 0, 0, 0.2);
          position: relative;
          animation: numberPop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
          transform: scale(0);
        }

        /* 每个数字延迟不同 */
        .flow-step:nth-child(1) .step-number { animation-delay: 0.5s; }
        .flow-step:nth-child(2) .step-number { animation-delay: 0.7s; }
        .flow-step:nth-child(3) .step-number { animation-delay: 0.9s; }

        @keyframes numberPop {
          0% {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
          }
          60% {
            transform: scale(1.2) rotate(10deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        /* 旋转光环 */
        .step-number::before {
          content: "";
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          background: conic-gradient(
            from 0deg,
            transparent 0deg,
            rgba(184, 161, 96, 0.6) 90deg,
            transparent 180deg,
            transparent 180deg,
            rgba(184, 161, 96, 0.6) 270deg,
            transparent 360deg
          );
          animation: rotateRing 3s linear infinite;
          opacity: 0;
        }

        .flow-step:nth-child(1) .step-number::before { animation-delay: 0.5s; opacity: 1; }
        .flow-step:nth-child(2) .step-number::before { animation-delay: 0.7s; opacity: 1; }
        .flow-step:nth-child(3) .step-number::before { animation-delay: 0.9s; opacity: 1; }

        @keyframes rotateRing {
          to { transform: rotate(360deg); }
        }

        .step-content {
          flex: 1;
          min-width: 0;
        }

        .step-title {
          font-size: 9px;
          font-weight: 500;
          line-height: 1.5;
          color: var(--text-primary);
          margin: 0;
          letter-spacing: 0.01em;
        }

        /* ============= What Happens When She Shows Up 场景卡片 ============= */
        .s1-scenario-card {
          flex-shrink: 0;
          padding: 14px 14px;
          background: linear-gradient(
            135deg,
            rgba(20, 35, 50, 0.9) 0%,
            rgba(13, 27, 42, 0.95) 100%
          );
          border: 1px solid rgba(184, 161, 96, 0.22);
          border-radius: 5px;
          backdrop-filter: blur(10px);
          box-shadow: 
            0 0 0 1px rgba(184, 161, 96, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.05),
            inset 0 -1px 6px rgba(0, 0, 0, 0.25),
            0 2px 10px rgba(0, 0, 0, 0.25);
          opacity: 0;
          animation: fadeIn 0.8s ease-out 0.5s forwards;
          position: relative;
          overflow: hidden;
        }

        /* 顶部金色装饰线 */
        .s1-scenario-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(184, 161, 96, 0.5) 50%,
            transparent 100%
          );
          box-shadow: 0 0 6px rgba(184, 161, 96, 0.35);
        }

        .scenario-card-title {
          font-size: 9px;
          font-weight: 700;
          color: #B8A160;
          margin: 0 0 10px 0;
          letter-spacing: 0.02em;
          line-height: 1.3;
          text-shadow: 0 0 8px rgba(184, 161, 96, 0.4);
        }

        .scenario-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .scenario-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          animation: itemFloat 4s ease-in-out infinite;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }

        /* 每个场景卡片延迟不同 */
        .scenario-item:nth-child(1) { animation-delay: 0s; }
        .scenario-item:nth-child(2) { animation-delay: 1.3s; }
        .scenario-item:nth-child(3) { animation-delay: 2.6s; }

        @keyframes itemFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        /* Hover 3D效果 */
        .scenario-item:hover {
          transform: 
            perspective(1000px)
            rotateX(1deg)
            rotateY(-1deg)
            translateY(-2px);
        }

        .scenario-check {
          flex-shrink: 0;
          font-size: 11px;
          font-weight: 800;
          color: #B8A160;
          line-height: 1.2;
          text-shadow: 0 0 6px rgba(184, 161, 96, 0.5);
          margin-top: 1px;
          animation: checkPop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
          transform: scale(0);
        }

        /* 每个✓延迟不同 */
        .scenario-item:nth-child(1) .scenario-check { animation-delay: 0.6s; }
        .scenario-item:nth-child(2) .scenario-check { animation-delay: 0.8s; }
        .scenario-item:nth-child(3) .scenario-check { animation-delay: 1.0s; }

        @keyframes checkPop {
          0% {
            transform: scale(0) rotate(-90deg);
            opacity: 0;
          }
          60% {
            transform: scale(1.3) rotate(10deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        .scenario-content {
          flex: 1;
          min-width: 0;
        }

        .scenario-main {
          font-size: 8.5px;
          font-weight: 600;
          line-height: 1.4;
          color: var(--text-primary);
          margin: 0 0 3px 0;
          letter-spacing: 0;
        }

        .scenario-sub {
          font-size: 7.5px;
          font-weight: 400;
          line-height: 1.5;
          color: var(--text-secondary);
          margin: 0;
          letter-spacing: 0;
          font-style: italic;
        }

        /* ============= Why Men Use This Instead 对比条 ============= */
        .s1-comparison {
          flex-shrink: 0;
          padding: 12px 14px;
          background: linear-gradient(
            135deg,
            rgba(20, 35, 50, 0.65) 0%,
            rgba(13, 27, 42, 0.75) 100%
          );
          border: 1px solid rgba(184, 161, 96, 0.15);
          border-radius: 4px;
          backdrop-filter: blur(8px);
          box-shadow: 
            0 0 0 1px rgba(184, 161, 96, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.04),
            inset 0 -1px 6px rgba(0, 0, 0, 0.2),
            0 1px 6px rgba(0, 0, 0, 0.2);
          opacity: 0;
          animation: fadeIn 0.8s ease-out 0.6s forwards;
        }

        .comparison-title {
          font-size: 8.5px;
          font-weight: 700;
          color: #B8A160;
          margin: 0 0 8px 0;
          letter-spacing: 0.02em;
          line-height: 1.2;
          text-shadow: 0 0 6px rgba(184, 161, 96, 0.3);
        }

        .comparison-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .comparison-line {
          font-size: 7.5px;
          line-height: 1.5;
          color: var(--text-secondary);
          margin: 0;
          letter-spacing: 0;
        }

        .comparison-line strong {
          color: var(--text-primary);
          font-weight: 600;
        }

        /* ============= 退款保障 ============= */
        .s1-refund-guarantee {
          flex-shrink: 0;
          padding: 8px 14px;
          background: linear-gradient(
            135deg,
            rgba(20, 35, 50, 0.6) 0%,
            rgba(13, 27, 42, 0.7) 100%
          );
          border: 1px solid rgba(184, 161, 96, 0.18);
          border-radius: 4px;
          backdrop-filter: blur(8px);
          box-shadow: 
            0 0 0 1px rgba(184, 161, 96, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.04),
            inset 0 -1px 6px rgba(0, 0, 0, 0.2),
            0 1px 6px rgba(0, 0, 0, 0.2);
          opacity: 0;
          animation: fadeIn 0.8s ease-out 0.7s forwards;
        }

        .refund-text {
          font-size: 8px;
          line-height: 1.4;
          color: var(--text-secondary);
          margin: 0;
          text-align: center;
        }

        .refund-text strong {
          color: #B8A160;
          font-weight: 700;
          text-shadow: 0 0 8px rgba(184, 161, 96, 0.4);
        }

        .refund-text strong {
          color: #B8A160;
          font-weight: 700;
          text-shadow: 0 0 8px rgba(184, 161, 96, 0.4);
        }

        /* ============= CTA区 ============= */
        .s1-cta {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          opacity: 0;
          animation: fadeIn 0.8s ease-out 0.8s forwards;
          padding-top: 2px;
          padding-bottom: 2px;
        }

        .cta-btn {
          width: 100%;
          max-width: 358px;
          height: 44px;
          position: relative;
          font-family: inherit;
          
          background: linear-gradient(
            160deg, 
            #1A1814 0%,
            #28231A 8%,
            #352C22 15%,
            #534838 25%,
            #70603C 35%,
            #8D7849 42%,
            #B8A160 50%,
            #8D7849 58%,
            #70603C 65%,
            #534838 75%,
            #352C22 85%,
            #28231A 92%,
            #1A1814 100%
          );
          
          border: 1px solid rgba(184, 161, 96, 0.5);
          border-radius: 4px;
          cursor: pointer;
          outline: none;
          overflow: hidden;
          
          box-shadow: 
            inset 0 1px 0 rgba(255, 255, 255, 0.18),
            inset 0 -1px 0 rgba(0, 0, 0, 0.35),
            0 0 20px rgba(184, 161, 96, 0.3),
            0 4px 14px rgba(0, 0, 0, 0.45),
            0 8px 24px rgba(0, 0, 0, 0.4);
          
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }

        /* 边缘能量流动 - subtle版本 */
        .cta-btn::before {
          content: "";
          position: absolute;
          inset: -2px;
          border-radius: 5px;
          background: conic-gradient(
            from 0deg at 50% 50%,
            transparent 0deg,
            rgba(212, 175, 55, 0.4) 60deg,
            transparent 120deg,
            transparent 240deg,
            rgba(212, 175, 55, 0.4) 300deg,
            transparent 360deg
          );
          animation: energyRotate 6s linear infinite;
          z-index: -1;
          filter: blur(4px);
          opacity: 0.6;
        }

        @keyframes energyRotate {
          to { transform: rotate(360deg); }
        }

        .cta-btn:hover::before {
          animation-duration: 3s;
          opacity: 0.9;
        }

        /* 内部光泽层 */
        .cta-btn::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.15) 0%,
            rgba(255, 255, 255, 0.05) 30%,
            transparent 50%,
            rgba(0, 0, 0, 0.15) 80%,
            rgba(0, 0, 0, 0.3) 100%
          );
          pointer-events: none;
          z-index: 1;
        }

        /* Hover状态 */
        .cta-btn:hover {
          transform: perspective(1000px) translateY(-2px) scale(1.01);
          border-color: rgba(212, 175, 55, 0.7);
          box-shadow: 
            inset 0 1px 0 rgba(255, 255, 255, 0.22),
            inset 0 -1px 0 rgba(0, 0, 0, 0.35),
            0 0 28px rgba(212, 175, 55, 0.4),
            0 6px 20px rgba(0, 0, 0, 0.5),
            0 12px 32px rgba(0, 0, 0, 0.45);
        }

        .cta-btn:hover::before {
          animation-duration: 3s;
          opacity: 0.9;
        }

        .cta-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          animation: none;
        }

        .cta-btn:disabled::before {
          animation: none;
        }

        .cta-text {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #DCC896;
          line-height: 1;
          position: relative;
          z-index: 2;
          text-shadow: 
            0 0 12px rgba(220, 200, 150, 0.7),
            0 0 6px rgba(255, 255, 255, 0.5),
            0 2px 8px rgba(0, 0, 0, 0.9),
            0 1px 0 rgba(255, 255, 255, 0.3),
            0 -1px 0 rgba(0, 0, 0, 0.5);
        }

        .cta-meta {
          text-align: center;
          margin: 0;
          line-height: 1.35;
          padding: 0;
          min-height: 20px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .cta-footer {
          font-size: 7px;
          font-weight: 500;
          letter-spacing: 0.02em;
          display: block;
          line-height: 1.3;
          color: var(--text-tertiary);
        }

        .cta-footer-em {
          font-size: 7.5px;
          font-weight: 600;
          letter-spacing: 0.01em;
          display: block;
          line-height: 1.3;
          color: #B8A160;
          text-shadow: 0 0 6px rgba(184, 161, 96, 0.3);
          animation: textGlow 3s ease-in-out infinite;
        }

        @keyframes textGlow {
          0%, 100% {
            text-shadow: 0 0 6px rgba(184, 161, 96, 0.3);
            color: #B8A160;
          }
          50% {
            text-shadow: 0 0 14px rgba(184, 161, 96, 0.7);
            color: #D4B977;
          }
        }

        /* 动画 */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* 桌面端 */
        @media (min-width: 768px) {
          .s1-inner {
            max-width: 680px;
            padding: 24px;
            gap: 16px;
          }

          .s1-divider {
            margin: 8px 0;
          }

          .s1-header {
            padding: 16px 0;
          }

          .s1-title {
            font-size: 24px;
            margin-bottom: 8px;
          }

          .s1-bridge {
            font-size: 14px;
            margin-bottom: 12px;
          }

          .s1-subtitle {
            font-size: 13px;
            padding: 0 20px;
          }

          .s1-live-roster {
            padding: 14px 20px;
          }

          .live-roster-text {
            font-size: 12px;
            gap: 6px;
          }

          .city-item {
            font-size: 12px;
          }

          .city-more {
            font-size: 12px;
          }

          .s1-flow-steps {
            padding: 20px;
            gap: 16px;
          }

          .flow-step {
            padding: 16px 18px;
            gap: 16px;
          }

          .step-number {
            width: 38px;
            height: 38px;
            font-size: 16px;
          }

          .step-title {
            font-size: 13px;
          }

          .s1-scenario-card {
            padding: 24px 24px;
          }

          .scenario-card-title {
            font-size: 14px;
            margin-bottom: 16px;
          }

          .scenario-list {
            gap: 16px;
          }

          .scenario-check {
            font-size: 15px;
          }

          .scenario-main {
            font-size: 13px;
            margin-bottom: 6px;
          }

          .scenario-sub {
            font-size: 11.5px;
          }

          .s1-comparison {
            padding: 18px 20px;
          }

          .comparison-title {
            font-size: 13px;
            margin-bottom: 12px;
          }

          .comparison-list {
            gap: 10px;
          }

          .comparison-line {
            font-size: 11.5px;
          }

          .s1-refund-guarantee {
            padding: 12px 20px;
          }

          .refund-text {
            font-size: 12px;
          }

          .s1-cta {
            gap: 10px;
            padding-top: 8px;
          }

          .cta-btn {
            height: 66px;
            max-width: 440px;
          }

          .cta-text {
            font-size: 15px;
          }

          .cta-meta {
            min-height: 28px;
            gap: 4px;
          }

          .cta-footer {
            font-size: 10px;
          }

          .cta-footer-em {
            font-size: 11px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
}