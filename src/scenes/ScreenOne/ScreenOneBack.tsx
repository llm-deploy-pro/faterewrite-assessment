// src/scenes/ScreenOne/ScreenOneBack.tsx
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
void withParams;
/* ========================================================== */

// 利益点卡片数据
const trinityComponents = [
  {
    name: "Component I: The Akashic Signal Map (Diagnostic)",
    promise: "Stop wasting your life force on energetic decoys. This map reveals the 3 primary timeline distortions that have been secretly sabotaging your manifestations and keeping you in a loop of near-success.",
    deliverable: "You will receive a one-page, encrypted PDF that visually maps these 3 decoys, identifying their unique vibrational signature so you can recognize and neutralize them on sight.",
  },
  {
    name: "Component II: The Personal Resonance Key (Corrective)",
    promise: "This is your unique frequency—the one the universe is waiting to hear. Activating this key aligns your energetic signature with your pre-encoded 'Vibrational Contract,' making you magnetic to the opportunities, people, and realities that belong to you.",
    deliverable: "You will receive a 7-day, step-by-step activation sequence. Each day provides a single, 5-minute micro-action designed to calibrate your frequency and lock in your new vibrational state.",
  },
  {
    name: "Component III: The Timeline Override Script (Executive)",
    promise: "Collapse your timeline. This script is the first command you will execute on your new path, designed to trigger an immediate cascade of synchronicity and tangible results within the first 48 hours. This is where the shift becomes real.",
    deliverable: "You will receive a precise, 3-step action script to be executed post-compilation. It includes two conversation openers and one value-bridge statement, engineered to bypass resistance and initiate your new trajectory.",
  },
];

// 🔥 六色分级日志系统
type LogType = 'INFO' | 'SYSTEM' | 'SUCCESS' | 'NETWORK' | 'WARN' | 'CRITICAL';

interface LogEvent {
  id: number;
  type: LogType;
  text: string;
  timestamp: string;
}

// 日志内容库 - 40+条变体
const logLibrary = {
  INFO: [
    'Allocating memory buffer... 2048KB',
    'Synchronizing with time server...',
    'Loading resonance matrix cache...',
    'Processing activation queue...',
    'Updating frequency database...',
    'Initializing quantum entanglement protocols...',
  ],
  SYSTEM: [
    'CALIBRATING RESONANCE FIELD... OK',
    'CONNECTION TO AKASHIC NODE STABLE',
    'FIELD STABLE. AWAITING ACTIVATION DATA...',
    'CHRONOSIGNATURE VERIFIED',
    'DIMENSIONAL ANCHOR LOCKED',
    'TIMELINE COHERENCE: 98.7%',
    'REALITY MATRIX SYNCHRONIZED',
  ],
  SUCCESS: [
    'SIGNATURE 7G4-B AUTHENTICATED... [NEW YORK, US]',
    'SIGNATURE 9K1-F VALIDATED... [LONDON, UK]',
    'SIGNATURE A3X-R SECURED... [TOKYO, JP]',
    'SIGNATURE C8V-M AUTHENTICATED... [SYDNEY, AU]',
    'SIGNATURE Z5P-L VALIDATED... [PARIS, FR]',
    'SIGNATURE 4RT-N SECURED... [BERLIN, DE]',
    'SIGNATURE 8HX-K AUTHENTICATED... [SINGAPORE, SG]',
    'SIGNATURE 2PM-W VALIDATED... [SEOUL, KR]',
  ],
  NETWORK: [
    'QUANTUM LINK ESTABLISHED',
    'UPLINKING TO STARLIGHT MATRIX...',
    'DECRYPTION LAYER ACTIVE',
    'AKASHIC BRIDGE CONNECTED',
    'NEURAL RELAY SYNCHRONIZED',
    'COSMIC BANDWIDTH: OPTIMAL',
  ],
  WARN: [
    'MINOR TEMPORAL FLUX DETECTED... AUTO-CORRECTING',
    'ENERGY DECOY SIGNATURE DETECTED... NEUTRALIZING',
    'Latency spike +23ms... compensating...',
    'Timeline variance detected... stabilizing...',
    'Frequency interference... filtering...',
  ],
  CRITICAL: [
    '⚠ NEXT AKASHIC WINDOW CLOSES IN: 09H 47M 12S',
    '⚠ ONLY 3 ACTIVATION SLOTS REMAINING',
    '⚠ HIGH DEMAND: 247 USERS IN QUEUE',
    '⚠ TIMELINE CONVERGENCE IN: 08H 32M 55S',
  ],
};

// 🔥 智能日志生成器
const generateNewLog = (forceCritical: boolean = false): LogEvent => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const now = new Date();
  const timestamp = `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`;
  
  let type: LogType;
  let message: string;
  
  if (forceCritical) {
    type = 'CRITICAL';
    message = logLibrary.CRITICAL[Math.floor(Math.random() * logLibrary.CRITICAL.length)];
  } else {
    // 权重分布：INFO 30%, SYSTEM 25%, SUCCESS 20%, NETWORK 15%, WARN 8%, CRITICAL 2%
    const rand = Math.random() * 100;
    if (rand < 30) {
      type = 'INFO';
      message = logLibrary.INFO[Math.floor(Math.random() * logLibrary.INFO.length)];
    } else if (rand < 55) {
      type = 'SYSTEM';
      message = logLibrary.SYSTEM[Math.floor(Math.random() * logLibrary.SYSTEM.length)];
    } else if (rand < 75) {
      type = 'SUCCESS';
      message = logLibrary.SUCCESS[Math.floor(Math.random() * logLibrary.SUCCESS.length)];
    } else if (rand < 90) {
      type = 'NETWORK';
      message = logLibrary.NETWORK[Math.floor(Math.random() * logLibrary.NETWORK.length)];
    } else if (rand < 98) {
      type = 'WARN';
      message = logLibrary.WARN[Math.floor(Math.random() * logLibrary.WARN.length)];
    } else {
      type = 'CRITICAL';
      message = logLibrary.CRITICAL[Math.floor(Math.random() * logLibrary.CRITICAL.length)];
    }
  }
  
  const text = `[${timestamp} UTC] [${type}] > ${message}`;
  
  return {
    id: Date.now() + Math.random(),
    type,
    text,
    timestamp,
  };
};


export default function ScreenOneBack() {
  const hasTrackedRef = useRef(false);
  const hasClickedRef = useRef(false);
  const cardClickedRef = useRef<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  // 🔥 动态数据流状态
  const [feedLines, setFeedLines] = useState<LogEvent[]>([
    { id: 1, type: 'SYSTEM', text: '[SYSTEM] > INITIALIZING STARLIGHT MATRIX FEED...', timestamp: '' }
  ]);
  const [matrixPulse, setMatrixPulse] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const criticalShownRef = useRef(false);
  const nextCriticalTimeRef = useRef(Date.now() + 60000); // 首次60秒后


  // ═══════════════════════════════════════════════════════════════
  // 🎯 核心打点与页面逻辑
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (hasTrackedRef.current) return;
    hasTrackedRef.current = true;
    const frid = ensureFrid();
    const isDev = window.location.hostname === "localhost";
    const timer = setTimeout(() => {
      if (typeof (window as any).fbq !== "undefined") {
        if (markOnce("s1bl", isDev)) {
          const eventId = "ev_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
          (window as any).fbq("trackCustom", "S1_Back_Loaded", { content_name: "ScreenOne_Back", content_category: "Assessment_Offer", screen_position: "back", screen_number: 1, page_url: window.location.href, referrer: document.referrer, frid: frid, }, { eventID: eventId });
          console.log(`[FB打点] S1_Back_Loaded 触发成功`, { frid, eventId });
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // 🔥 数据流自动更新逻辑 - 随机频率 + 首次必出CRITICAL
  const addNewFeedLine = useCallback(() => {
    setFeedLines((prev) => {
      let newLog: LogEvent;
      
      // 首次必出CRITICAL
      if (!criticalShownRef.current) {
        criticalShownRef.current = true;
        newLog = generateNewLog(true);
      } 
      // 周期性CRITICAL（每60秒）
      else if (Date.now() >= nextCriticalTimeRef.current) {
        nextCriticalTimeRef.current = Date.now() + 60000;
        newLog = generateNewLog(true);
      }
      // 普通日志
      else {
        newLog = generateNewLog(false);
      }
      
      const updated = [newLog, ...prev].slice(0, 8);
      return updated;
    });
    setMatrixPulse(true);
    setTimeout(() => setMatrixPulse(false), 400);
  }, []);

  useEffect(() => {
    // 🔥 首次3秒后生成CRITICAL
    const firstTimer = setTimeout(() => {
      addNewFeedLine();
    }, 3000);
    
    // 🔥 随机间隔生成日志（1.2-2秒）
    const scheduleNext = () => {
      const randomDelay = 1200 + Math.random() * 800; // 1.2s - 2s
      const timer = setTimeout(() => {
        addNewFeedLine();
        scheduleNext();
      }, randomDelay);
      return timer;
    };
    
    const intervalTimer = scheduleNext();
    
    return () => {
      clearTimeout(firstTimer);
      clearTimeout(intervalTimer);
    };
  }, [addNewFeedLine]);

  // 卡片展开逻辑 - 不滚动，只切换状态 + 打点
  const handleToggleCard = useCallback((idx: number) => {
    // 卡片展开/收起逻辑
    setExpandedCard((prev) => prev === idx ? null : idx);
    
    // 卡片点击打点（仅首次点击）
    if (!cardClickedRef.current.has(idx)) {
      cardClickedRef.current.add(idx);
      const frid = ensureFrid();
      const isDev = window.location.hostname === "localhost";
      const componentNames = ["Component_I", "Component_II", "Component_III"];
      const eventKey = `s1bc${idx + 1}`;
      
      if (typeof (window as any).fbq !== "undefined") {
        if (markOnce(eventKey, isDev)) {
          const eventId = "ev_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
          (window as any).fbq("trackCustom", "S1_Back_Card_Click", {
            content_name: `ScreenOne_Back_${componentNames[idx]}`,
            content_category: "Assessment_Component",
            component_index: idx + 1,
            component_name: componentNames[idx],
            screen_position: "back",
            screen_number: 1,
            page_url: window.location.href,
            referrer: document.referrer,
            frid: frid,
          }, { eventID: eventId });
          console.log(`[FB打点] S1_Back_Card_Click 触发成功`, { component: componentNames[idx], frid, eventId });
        }
      }
    }
  }, []);

  // 🔥 CTA按钮点击逻辑 - 跳转支付页面
  const handleClickCTA = useCallback(() => {
    if (hasClickedRef.current || isLoading) return;
    hasClickedRef.current = true;
    setIsLoading(true);

    const frid = ensureFrid();
    const isDev = window.location.hostname === "localhost";

    // FB打点
    if (typeof (window as any).fbq !== "undefined") {
      if (markOnce("s1bc", isDev)) {
        const eventId = "ev_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        (window as any).fbq("trackCustom", "S1_Back_CTA_Click", { content_name: "ScreenOne_Back_CTA", content_category: "Assessment_Offer_CTA", cta_text: "Execute Your Destiny", screen_position: "back", screen_number: 1, page_url: window.location.href, referrer: document.referrer, frid: frid, }, { eventID: eventId });
        console.log(`[FB打点] S1_Back_CTA_Click 触发成功`, { frid, eventId });
      }
    }

    const root = document.querySelector(".s1-back");
    if (root) root.classList.add("is-executing");

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      // 🔥 跳转到支付页面
      const paymentUrl = "https://pay.faterewrite.com/";
      const fullUrl = new URL(paymentUrl);
      fullUrl.searchParams.set("frid", frid);
      
      document.body.classList.add("page-leave");
      setTimeout(() => {
        window.location.href = fullUrl.toString();
      }, 300);
    }, 1200);
  }, [isLoading]);

  return (
    <section className="s1-back">
      {/* Wordmark - 左上角 */}
      <div className="wordmark">
        <Wordmark />
      </div>

      {/* 主容器 */}
      <div className="s1-back-inner">
        {/* 顶部标签 */}
        <div className="s1-back-top-label">DECODING COMPLETE.</div>

        {/* 标题组 */}
        <div className="s1-header-group">
          <h1 className="s1-main-title">YOUR ACTIVATION KIT IS NOW COMPILED.</h1>
          <p className="s1-value-declaration">
            This is not a course. This is not therapy. This is the source code of your highest timeline, decoded and delivered.
          </p>
        </div>

        {/* Trinity 卡片组 */}
        <div className="trinity-container">
          {trinityComponents.map((component, idx) => (
            <div
              key={idx}
              className={`trinity-card ${expandedCard === idx ? "expanded" : ""}`}
              onClick={() => handleToggleCard(idx)}
            >
              <div className="card-header">
                <div className="card-title">{component.name}</div>
                <div className="card-toggle">{expandedCard === idx ? "−" : "+"}</div>
              </div>
              <div className="card-content">
                <p className="fantasy-promise">{component.promise}</p>
                <p className="concrete-deliverable">{component.deliverable}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 🔥 Starlight Matrix 数据流 - 终极版 */}
        <div className={`starlight-matrix ${matrixPulse ? "pulse" : ""}`}>
          <div className="matrix-title">STARLIGHT MATRIX: LIVE ACTIVATION FEED</div>
          <div className="matrix-feed" role="log" aria-live="polite" aria-atomic="false">
            {feedLines.map((log) => (
              <div 
                key={log.id} 
                className={`feed-line feed-line-${log.type.toLowerCase()}`}
                data-log-type={log.type}
              >
                {log.text}
              </div>
            ))}
          </div>
        </div>

        {/* CTA 区域 - 带呼吸效果 */}
        <div className="s1-cta">
          <button
            type="button"
            className={`s1-cta-btn-ultimate ${isLoading ? "loading" : ""}`}
            onClick={handleClickCTA}
            disabled={isLoading}
            aria-label="Execute your destiny and download your activation kit"
          >
            <span className="s1-cta-text">
              {isLoading ? "EXECUTING..." : "EXECUTE YOUR DESTINY"}
            </span>
          </button>
          <div className="s1-price-tag">($49 — One-Time Activation Fee)</div>
        </div>
      </div>

      {/* 样式 */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* ═══════════════════════════════════════════════════════════════════
           CSS 变量 & 全局重置
           ═══════════════════════════════════════════════════════════════════ */
        :root {
          --wm-h: 32px;
          --s1-offset: 70px;
          --gap-xs: 8px;
          --gap-sm: 12px;
          --gap-md: 22px;
          --safe-top: env(safe-area-inset-top, 0px);
          --safe-bottom: env(safe-area-inset-bottom, 0px);
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        /* ═══════════════════════════════════════════════════════════════════
           主容器布局 - 禁止滚动，一页完整展示
           ═══════════════════════════════════════════════════════════════════ */
        .s1-back {
          position: relative;
          height: 100dvh;
          width: 100%;
          color: #F5F5F0;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          overflow: hidden;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Wordmark - 左上角固定 */
        .wordmark {
          position: fixed;
          top: calc(var(--safe-top) + 18px);
          left: 20px;
          z-index: 100;
          pointer-events: none;
          animation: fade-in-left 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
        }

        /* 内容容器 - 完美适配一屏，垂直居中 */
        .s1-back-inner {
          position: relative;
          width: 100%;
          max-width: 640px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          flex-direction: column;
          gap: var(--gap-md);
          z-index: 1;
        }

        /* ═══════════════════════════════════════════════════════════════════
           顶部标签
           ═══════════════════════════════════════════════════════════════════ */
        .s1-back-top-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: rgba(212, 184, 150, 0.85);
          text-transform: uppercase;
          text-align: center;
          padding: 6px 0 4px;
          animation: fade-in 0.6s ease-out 0.2s both;
        }

        /* ═══════════════════════════════════════════════════════════════════
           标题组
           ═══════════════════════════════════════════════════════════════════ */
        .s1-header-group {
          text-align: center;
          animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
        }

        .s1-main-title {
          font-size: 14.5px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #F5F5F0;
          text-transform: uppercase;
          margin-bottom: 14px;
          line-height: 1.35;
          text-shadow: 0 2px 12px rgba(212, 184, 150, 0.2);
        }

        .s1-value-declaration {
          font-size: 13.5px;
          font-weight: 400;
          line-height: 1.6;
          color: rgba(245, 245, 240, 0.88);
          max-width: 520px;
          margin: 0 auto;
          letter-spacing: 0.01em;
        }

        /* ═══════════════════════════════════════════════════════════════════
           Trinity 卡片组 - 核心价值展示
           ═══════════════════════════════════════════════════════════════════ */
        .trinity-container {
          display: flex;
          flex-direction: column;
          gap: 14px;
          animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both;
        }

        .trinity-card {
          background: linear-gradient(135deg, 
            rgba(26, 40, 66, 0.75) 0%, 
            rgba(15, 26, 46, 0.85) 100%
          );
          border: 1px solid rgba(212, 184, 150, 0.18);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        /* 卡片光晕效果 */
        .trinity-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, 
            transparent 0%, 
            rgba(212, 184, 150, 0.4) 50%, 
            transparent 100%
          );
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .trinity-card:hover::before {
          opacity: 1;
        }

        .trinity-card:hover {
          border-color: rgba(212, 184, 150, 0.35);
          background: linear-gradient(135deg, 
            rgba(26, 40, 66, 0.85) 0%, 
            rgba(15, 26, 46, 0.95) 100%
          );
          transform: translateY(-2px);
          box-shadow: 
            0 12px 32px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(212, 184, 150, 0.15),
            inset 0 1px 0 rgba(212, 184, 150, 0.1);
        }

        .trinity-card.expanded {
          border-color: rgba(212, 184, 150, 0.4);
          background: linear-gradient(135deg, 
            rgba(26, 40, 66, 0.9) 0%, 
            rgba(15, 26, 46, 1) 100%
          );
          box-shadow: 
            0 16px 48px rgba(0, 0, 0, 0.5),
            0 0 0 1px rgba(212, 184, 150, 0.25),
            inset 0 1px 0 rgba(212, 184, 150, 0.15);
        }

        /* 卡片头部 */
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 13px 16px;
          gap: 12px;
        }

        .card-title {
          font-size: 12.5px;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: rgba(212, 184, 150, 0.95);
          line-height: 1.4;
          flex: 1;
        }

        .card-toggle {
          font-size: 20px;
          font-weight: 300;
          color: rgba(212, 184, 150, 0.7);
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(212, 184, 150, 0.25);
          border-radius: 6px;
          transition: all 0.3s ease;
          flex-shrink: 0;
          background: rgba(15, 26, 46, 0.3);
        }

        .trinity-card:hover .card-toggle {
          border-color: rgba(212, 184, 150, 0.4);
          background: rgba(15, 26, 46, 0.5);
          color: rgba(212, 184, 150, 0.9);
        }

        /* 卡片内容 */
        .card-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1), 
                      padding 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                      opacity 0.3s ease;
          opacity: 0;
          padding: 0 16px;
        }

        .trinity-card.expanded .card-content {
          max-height: 500px;
          padding: 0 16px 14px;
          opacity: 1;
        }

        .fantasy-promise {
          font-size: 12px;
          font-weight: 400;
          line-height: 1.6;
          color: rgba(245, 245, 240, 0.85);
          margin-bottom: 12px;
          letter-spacing: 0.01em;
        }

        .concrete-deliverable {
          font-size: 11.5px;
          font-weight: 400;
          line-height: 1.55;
          color: rgba(184, 149, 106, 0.9);
          padding-left: 16px;
          position: relative;
          letter-spacing: 0.005em;
        }

        .concrete-deliverable::before {
          content: "→";
          position: absolute;
          left: 0;
          color: rgba(212, 184, 150, 0.6);
          font-size: 10px;
        }

        /* ═══════════════════════════════════════════════════════════════════
           🔥🔥🔥 Starlight Matrix 数据流 - 终极10分版本
           ═══════════════════════════════════════════════════════════════════ */
        .starlight-matrix {
          background: linear-gradient(135deg, 
            rgba(10, 18, 32, 0.85) 0%, 
            rgba(15, 26, 46, 0.75) 100%
          );
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 10px;
          padding: 10px 14px;
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both;
          position: relative;
          overflow: hidden;
          box-shadow: 
            0 4px 16px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(59, 130, 246, 0.1);
        }

        /* 🔥 背景呼吸脉动 - 服务器心跳 */
        .starlight-matrix::after {
          content: "";
          position: absolute;
          inset: -50%;
          background: radial-gradient(circle at center, 
            rgba(59, 130, 246, 0.15) 0%, 
            transparent 70%
          );
          opacity: 0.5;
          animation: matrix-breathe 4s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes matrix-breathe {
          0%, 100% { 
            opacity: 0.3; 
            transform: scale(1); 
          }
          50% { 
            opacity: 0.6; 
            transform: scale(1.1); 
          }
        }

        /* 🔥 脉冲效果 - 新数据到来 */
        .starlight-matrix.pulse {
          border-color: rgba(59, 130, 246, 0.5);
          box-shadow: 
            0 0 32px rgba(59, 130, 246, 0.2),
            0 4px 16px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(59, 130, 246, 0.2);
        }

        .starlight-matrix::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, 
            transparent 0%, 
            rgba(59, 130, 246, 0.15) 50%, 
            transparent 100%
          );
          transition: left 0.6s ease;
        }

        .starlight-matrix.pulse::before {
          left: 100%;
        }

        /* 🔥 系统字体 - 等宽字体表示"系统之声" */
        .matrix-title {
          font-family: "SF Mono", "Menlo", "Monaco", "Consolas", "Courier New", monospace;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: rgba(139, 92, 246, 0.9);
          text-transform: uppercase;
          margin-bottom: 8px;
          text-shadow: 
            0 0 12px rgba(139, 92, 246, 0.4),
            0 0 6px rgba(139, 92, 246, 0.2);
          position: relative;
          z-index: 1;
        }

        /* 🔥 数据流容器 - 中速滚动 */
        .matrix-feed {
          font-family: "SF Mono", "Menlo", "Monaco", "Consolas", "Courier New", monospace;
          font-size: 9px;
          line-height: 1.6;
          letter-spacing: 0.02em;
          height: 110px;
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
          z-index: 1;
        }

        /* 🔥 每行日志的打字机效果 */
        .feed-line {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          padding: 1.5px 0;
          animation: feed-line-in 0.5s ease-out both;
          flex-shrink: 0;
        }

        /* 🔥🔥🔥 六色分级系统 */
        .feed-line-info {
          color: rgba(180, 190, 200, 0.85);
          text-shadow: 0 0 6px rgba(180, 190, 200, 0.2);
        }

        .feed-line-system {
          color: rgba(100, 200, 255, 0.9);
          text-shadow: 0 0 8px rgba(100, 200, 255, 0.3);
        }

        .feed-line-success {
          color: rgba(100, 255, 150, 0.9);
          text-shadow: 0 0 8px rgba(100, 255, 150, 0.3);
        }

        .feed-line-network {
          color: rgba(100, 220, 255, 0.9);
          text-shadow: 0 0 8px rgba(100, 220, 255, 0.3);
        }

        .feed-line-warn {
          color: rgba(255, 200, 100, 0.9);
          text-shadow: 0 0 8px rgba(255, 200, 100, 0.3);
        }

        /* 🔥🔥🔥 CRITICAL - 红色闪烁 */
        .feed-line-critical {
          color: rgba(255, 100, 120, 1);
          font-weight: 600;
          text-shadow: 
            0 0 12px rgba(255, 100, 120, 0.6),
            0 0 6px rgba(255, 100, 120, 0.4);
          animation: feed-line-in 0.5s ease-out both, critical-blink 0.8s ease-in-out infinite;
        }

        @keyframes critical-blink {
          0%, 100% { 
            opacity: 1; 
            text-shadow: 
              0 0 12px rgba(255, 100, 120, 0.6),
              0 0 6px rgba(255, 100, 120, 0.4);
          }
          50% { 
            opacity: 0.7;
            text-shadow: 
              0 0 20px rgba(255, 100, 120, 0.8),
              0 0 10px rgba(255, 100, 120, 0.6);
          }
        }

        @keyframes feed-line-in {
          from {
            opacity: 0;
            transform: translateX(-15px);
            filter: blur(2px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
            filter: blur(0);
          }
        }

        /* ═══════════════════════════════════════════════════════════════════
           🔥 CTA 区域 - 终极神圣按钮
           ═══════════════════════════════════════════════════════════════════ */
        .s1-cta {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding-top: 0;
          animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s both;
        }

        .s1-cta-btn-ultimate {
          width: 100%;
          max-width: 480px;
          height: 58px;
          background: linear-gradient(135deg, 
            #B8956A 0%, 
            #D4B896 25%,
            #FFD700 50%,
            #D4B896 75%,
            #B8956A 100%
          );
          background-size: 300% 100%;
          background-position: 0% 50%;
          border: 2px solid rgba(255, 215, 0, 0.3);
          border-radius: 14px;
          color: #0A1128;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
          box-shadow: 
            0 10px 30px rgba(184, 149, 106, 0.4),
            0 4px 12px rgba(0, 0, 0, 0.3),
            inset 0 2px 0 rgba(255, 255, 255, 0.4),
            inset 0 -2px 0 rgba(0, 0, 0, 0.15);
        }

        /* 🔥 呼吸式光晕 - 神圣能量积蓄 */
        .s1-cta-btn-ultimate::after {
          content: "";
          position: absolute;
          inset: -3px;
          border-radius: 14px;
          padding: 3px;
          background: linear-gradient(135deg, 
            rgba(255, 215, 0, 0.8) 0%, 
            rgba(255, 223, 0, 0.6) 25%,
            rgba(255, 215, 0, 0.4) 50%,
            rgba(255, 223, 0, 0.6) 75%,
            rgba(255, 215, 0, 0.8) 100%
          );
          background-size: 300% 100%;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0.6;
          animation: button-breathe 3s ease-in-out infinite, button-glow-rotate 8s linear infinite;
          pointer-events: none;
        }

        @keyframes button-breathe {
          0%, 100% { 
            opacity: 0.5; 
            transform: scale(1); 
          }
          50% { 
            opacity: 0.9; 
            transform: scale(1.03); 
          }
        }

        @keyframes button-glow-rotate {
          0% { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }

        /* 🔥 能量粒子流动效果 */
        .s1-cta-btn-ultimate::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, 
            transparent 0%, 
            rgba(255, 255, 255, 0.4) 50%, 
            transparent 100%
          );
          transition: left 0.8s ease;
        }

        /* 🔥 悬浮状态 - 能量爆发 */
        .s1-cta-btn-ultimate:hover {
          background-position: 100% 50%;
          transform: translateY(-3px) scale(1.02);
          box-shadow: 
            0 16px 48px rgba(184, 149, 106, 0.6),
            0 8px 24px rgba(255, 215, 0, 0.4),
            0 4px 16px rgba(0, 0, 0, 0.3),
            inset 0 2px 0 rgba(255, 255, 255, 0.5),
            inset 0 -2px 0 rgba(0, 0, 0, 0.2);
          border-color: rgba(255, 215, 0, 0.6);
        }

        .s1-cta-btn-ultimate:hover::after {
          opacity: 1;
          animation: button-breathe 2s ease-in-out infinite, button-glow-rotate 6s linear infinite;
        }

        .s1-cta-btn-ultimate:hover::before {
          left: 100%;
        }

        .s1-cta-btn-ultimate:hover .s1-cta-text {
          text-shadow: 
            0 0 12px rgba(255, 215, 0, 0.6),
            0 2px 4px rgba(0, 0, 0, 0.3),
            0 0 20px rgba(255, 215, 0, 0.4);
          letter-spacing: 0.1em;
        }

        /* 🔥 点击状态 - 能量释放 */
        .s1-cta-btn-ultimate:active {
          transform: translateY(-1px) scale(0.99);
          box-shadow: 
            0 8px 24px rgba(184, 149, 106, 0.5),
            0 4px 12px rgba(255, 215, 0, 0.3),
            0 2px 8px rgba(0, 0, 0, 0.3),
            inset 0 3px 6px rgba(0, 0, 0, 0.2);
        }

        .s1-cta-btn-ultimate:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .s1-cta-text {
          position: relative;
          z-index: 1;
          text-shadow: 
            0 2px 4px rgba(0, 0, 0, 0.2),
            0 1px 2px rgba(0, 0, 0, 0.1);
          transition: all 0.4s ease;
        }

        .s1-price-tag {
          font-size: 11.5px;
          font-weight: 500;
          color: rgba(184, 149, 106, 0.8);
          letter-spacing: 0.03em;
        }

        /* ═══════════════════════════════════════════════════════════════════
           进场动画
           ═══════════════════════════════════════════════════════════════════ */
        @keyframes fade-in-left {
          0% { opacity: 0; transform: translateX(-15px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes slide-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        /* ═══════════════════════════════════════════════════════════════════
           离场动画
           ═══════════════════════════════════════════════════════════════════ */
        
        /* 执行动画 */
        .s1-back.is-executing .wordmark { 
          animation: execute-left 1.2s cubic-bezier(0.6, 0, 0, 1) both; 
        }
        .s1-back.is-executing .s1-back-inner > * { 
          animation: execute-down 1.2s cubic-bezier(0.6, 0, 0, 1) both; 
        }
        .s1-back.is-executing .starlight-matrix .matrix-feed { 
          animation: fast-scroll 1s linear forwards; 
        }
        
        @keyframes execute-left { 
          to { 
            opacity: 0; 
            transform: translateX(-50px); 
            filter: blur(5px); 
          } 
        }
        @keyframes execute-down { 
          to { 
            opacity: 0; 
            transform: translateY(50px) scale(0.9); 
            filter: blur(5px); 
          } 
        }
        @keyframes fast-scroll { 
          0% { filter: none; } 
          50% { filter: blur(2px); transform: translateY(-30px); opacity: 0.5; } 
          100% { filter: blur(4px); transform: translateY(-60px); opacity: 0; } 
        }

        /* 页面跳转离场动画 */
        .page-leave .s1-back > .wordmark {
          animation: leave-left 0.4s cubic-bezier(0.4, 0, 1, 1) both;
        }

        .page-leave .s1-header-group,
        .page-leave .trinity-card,
        .page-leave .starlight-matrix,
        .page-leave .s1-cta {
          animation: leave-down 0.4s cubic-bezier(0.4, 0, 1, 1) both;
        }

        @keyframes leave-left {
          to { opacity: 0; transform: translateX(-20px); }
        }
        @keyframes leave-down {
          to { opacity: 0; transform: translateY(15px); }
        }

        /* ═══════════════════════════════════════════════════════════════════
           响应式设计 - 移动端绝对优先
           ═══════════════════════════════════════════════════════════════════ */
        @media (max-width: 768px) {
          :root {
            --wm-h: 26px; 
            --s1-offset: 56px; 
            --gap-xs: 6px;
            --gap-sm: 9px; 
            --gap-md: 14px; 
          }

          .wordmark {
            top: calc(var(--safe-top) + 14px);
            left: 16px;
            transform: scale(0.9);
          }
          
          .s1-back-inner {
            padding: 0 16px;
            gap: var(--gap-md);
          }
          
          .s1-back-top-label { 
            font-size: 9px; 
            letter-spacing: 0.09em;
            padding: 5px 0 3px;
          }
          
          .s1-main-title { 
            font-size: 12.5px; 
            margin-bottom: 11px;
            line-height: 1.3;
          }
          .s1-value-declaration { 
            font-size: 12px; 
            line-height: 1.5; 
          }
          
          .trinity-container { 
            gap: 10px;
          }
          .trinity-card { 
            border-radius: 10px; 
          }
          .card-header { 
            padding: 11px 14px; 
          }
          .card-title { 
            font-size: 11.5px; 
          }
          .card-content { 
            padding: 0 14px; 
          }
          .trinity-card.expanded .card-content {
            padding: 0 14px 12px;
            max-height: 400px;
          }
          .fantasy-promise { 
            font-size: 11px; 
            margin-bottom: 10px; 
          }
          .concrete-deliverable { 
            font-size: 10.5px; 
          }
          .concrete-deliverable::before { 
            font-size: 9px; 
          }
          
          .starlight-matrix { 
            padding: 9px 12px; 
            border-radius: 9px;
          }
          .matrix-title { 
            font-size: 8.5px; 
          }
          .matrix-feed { 
            font-size: 8px; 
            line-height: 1.55; 
            height: 95px;
          }
          
          .s1-cta { 
            padding-top: 0;
            gap: 7px;
          }
          .s1-cta-btn-ultimate { 
            height: 52px;
            max-width: 100%;
            padding: 0 18px; 
            border-radius: 12px; 
            font-size: 13.5px; 
          }
          .s1-price-tag { 
            font-size: 10.5px; 
          }
        }

        @media (max-width: 359px) {
          :root {
            --wm-h: 24px; 
            --s1-offset: 52px;
            --gap-xs: 5px;
            --gap-sm: 8px; 
            --gap-md: 11px;
          }
          
          .wordmark {
            top: calc(var(--safe-top) + 12px);
            left: 14px;
            transform: scale(0.85);
          }
          
          .s1-back-inner { 
            padding: 0 14px;
            gap: var(--gap-md);
          }
          
          .s1-back-top-label {
            font-size: 8.5px;
            padding: 4px 0 2px;
          }
          
          .s1-main-title { 
            font-size: 11.5px;
            margin-bottom: 9px;
          }
          .s1-value-declaration { 
            font-size: 11.5px; 
          }
          
          .card-header {
            padding: 10px 12px;
          }
          .card-title { 
            font-size: 11px; 
          }
          .trinity-card.expanded .card-content {
            max-height: 350px;
          }
          .fantasy-promise { 
            font-size: 10.5px; 
          }
          .concrete-deliverable { 
            font-size: 10px; 
          }
          
          .matrix-feed { 
            font-size: 7.5px;
            height: 85px;
          }
          
          .s1-cta-btn-ultimate { 
            height: 50px; 
            font-size: 13px; 
            letter-spacing: 0.06em;
            padding: 0 16px;
          }
          .s1-price-tag { 
            font-size: 10px; 
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
          }
          .s1-back-top-label, .s1-header-group,
          .trinity-card, .starlight-matrix, .s1-cta {
            opacity: 1 !important;
            transform: none !important;
          }
          .s1-cta-btn-ultimate::before,
          .s1-cta-btn-ultimate::after,
          .starlight-matrix::after { 
            display: none; 
          }
          .feed-line { 
            animation: none; 
          }
          .feed-line-critical {
            animation: none;
          }
          .s1-back.is-executing * { 
            animation: none !important; 
          }
        }

        @media (prefers-contrast: high) { 
          .s1-cta-btn-ultimate { 
            border-width: 2px; 
            border-color: #D4B896; 
            background: rgba(212, 184, 150, 0.3); 
          } 
          .s1-cta-text { 
            font-weight: 700; 
          } 
          .s1-price-tag { 
            color: rgba(184, 149, 106, 0.9); 
          } 
          .trinity-card { 
            border-width: 1.5px; 
            border-color: rgba(184, 149, 106, 0.3); 
          } 
        }
      `}}/>
    </section>
  );
}