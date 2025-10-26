// src/scenes/ScreenOne/ScreenOneFront.tsx
import { useEffect, useRef, useState, useCallback } from "react";
import Wordmark from "@/components/Wordmark";

/* ===================== 优化的跨子域去重工具 ===================== */

/**
 * 增强的ID生成 - 更高的唯一性保证
 */
function generateSecureId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).slice(2, 11);
  const extraEntropy = Math.random().toString(36).slice(2, 11);
  return `${prefix}_${timestamp}_${randomPart}${extraEntropy}`;
}

/**
 * Cookie读取 - 增强错误处理
 */
function getCookie(name: string): string {
  if (typeof document === "undefined") return "";
  try {
    const list = (document.cookie || "").split("; ");
    for (const item of list) {
      const eq = item.indexOf("=");
      if (eq === -1) continue;
      const k = decodeURIComponent(item.slice(0, eq));
      const v = decodeURIComponent(item.slice(eq + 1));
      if (k === name) return v;
    }
  } catch (error) {
    console.error(`[Cookie读取错误] ${name}:`, error);
  }
  return "";
}

/**
 * Cookie设置 - 增强可靠性和错误检测
 */
function setRootCookie(name: string, value: string, days: number): boolean {
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
    
    const success = document.cookie.indexOf(name + "=") !== -1;
    if (!success) {
      console.error(`[Cookie设置失败] ${name}`);
    }
    return success;
  } catch (error) {
    console.error(`[Cookie设置异常] ${name}:`, error);
    return false;
  }
}

/**
 * LocalStorage去重记录
 */
interface DedupeRecord {
  key: string;
  timestamp: number;
  eventId: string;
}

function getLocalDedupeRecords(): DedupeRecord[] {
  try {
    const raw = localStorage.getItem("frd_s1_dedupe_v2");
    if (!raw) return [];
    const records: DedupeRecord[] = JSON.parse(raw);
    const cutoff = Date.now() - 30 * 864e5;
    const cleaned = records.filter(r => r.timestamp > cutoff);
    if (cleaned.length !== records.length) {
      localStorage.setItem("frd_s1_dedupe_v2", JSON.stringify(cleaned));
    }
    return cleaned;
  } catch (error) {
    console.error("[LocalStorage读取错误]:", error);
    return [];
  }
}

function addLocalDedupeRecord(key: string, eventId: string): boolean {
  try {
    const records = getLocalDedupeRecords();
    records.push({ key, timestamp: Date.now(), eventId });
    localStorage.setItem("frd_s1_dedupe_v2", JSON.stringify(records));
    return true;
  } catch (error) {
    console.error("[LocalStorage写入错误]:", error);
    return false;
  }
}

function hasLocalDedupeRecord(key: string): boolean {
  const records = getLocalDedupeRecords();
  return records.some(r => r.key === key);
}

/**
 * 增强的去重检查 - Cookie + LocalStorage双重保障
 */
function markOnce(key: string, devMode: boolean = false): { canTrack: boolean; eventId: string } {
  const eventId = generateSecureId("ev");
  
  if (devMode && window.location.hostname === 'localhost') {
    console.log(`[DEV] 事件 ${key} 触发（开发模式不去重）`, { eventId });
    return { canTrack: true, eventId };
  }
  
  const hasLocalRecord = hasLocalDedupeRecord(key);
  const cookieName = "frd_s1_dedupe";
  const raw = getCookie(cookieName);
  const cookieSet = new Set(raw ? raw.split(",") : []);
  const hasCookieRecord = cookieSet.has(key);
  
  if (hasLocalRecord || hasCookieRecord) {
    console.log(`[去重] 事件 ${key} 已触发过，跳过`, { 
      localStorage: hasLocalRecord, 
      cookie: hasCookieRecord,
      eventId 
    });
    return { canTrack: false, eventId };
  }
  
  let successCount = 0;
  if (addLocalDedupeRecord(key, eventId)) successCount++;
  
  cookieSet.add(key);
  const cookieArray = Array.from(cookieSet);
  if (cookieArray.length > 20) cookieArray.shift();
  if (setRootCookie(cookieName, cookieArray.join(","), 30)) successCount++;
  
  if (successCount > 0) {
    console.log(`[打点] 事件 ${key} 首次触发 ✓`, { 
      eventId,
      storedIn: successCount === 2 ? 'Cookie+LocalStorage' : '部分存储'
    });
    return { canTrack: true, eventId };
  } else {
    console.error(`[存储失败] 事件 ${key}，仍允许追踪`, { eventId });
    return { canTrack: true, eventId };
  }
}

/**
 * 增强的用户ID管理 - 多层存储
 */
function ensureFrid(): string {
  const win: any = window as any;
  
  if (win.__frid) return win.__frid;
  
  let frid = getCookie("frd_uid");
  
  if (!frid) {
    try {
      frid = localStorage.getItem("frd_uid") || "";
    } catch (error) {
      console.warn("[LocalStorage读取frid失败]:", error);
    }
  }
  
  if (!frid) {
    frid = generateSecureId("fr");
    setRootCookie("frd_uid", frid, 365);
    try {
      localStorage.setItem("frd_uid", frid);
    } catch (error) {
      console.warn("[LocalStorage保存frid失败]:", error);
    }
    console.log("[用户ID] 新用户首次访问", { frid });
  }
  
  win.__frid = frid;
  return frid;
}

/**
 * 离线队列支持
 */
interface TrackingEvent {
  eventName: string;
  eventData: any;
  eventId: string;
  timestamp: number;
  retryCount: number;
}

const pendingEvents: TrackingEvent[] = [];
let isProcessingQueue = false;

function sendToFacebook(eventName: string, eventData: any, eventId: string): boolean {
  if (typeof window.fbq === "undefined") {
    console.warn(`[FB Pixel] fbq未定义，事件 ${eventName} 无法发送`);
    return false;
  }
  
  try {
    window.fbq("trackCustom", eventName, eventData, { eventID: eventId });
    console.log(`[FB打点] ${eventName} 发送成功`, { eventId, eventData });
    return true;
  } catch (error) {
    console.error(`[FB打点错误] ${eventName}:`, error);
    return false;
  }
}

function processEventQueue() {
  if (isProcessingQueue || pendingEvents.length === 0) return;
  
  isProcessingQueue = true;
  const event = pendingEvents[0];
  const success = sendToFacebook(event.eventName, event.eventData, event.eventId);
  
  if (success) {
    pendingEvents.shift();
    console.log(`[队列处理] 事件已发送，剩余 ${pendingEvents.length} 个`);
  } else {
    event.retryCount++;
    if (event.retryCount >= 3) {
      console.error(`[队列处理] 事件 ${event.eventName} 重试3次失败，放弃`);
      pendingEvents.shift();
    } else {
      console.warn(`[队列处理] 事件 ${event.eventName} 将重试 (${event.retryCount}/3)`);
    }
  }
  
  isProcessingQueue = false;
  if (pendingEvents.length > 0) {
    setTimeout(processEventQueue, 2000);
  }
}

function trackEvent(eventKey: string, eventName: string, eventData: any, isDev: boolean = false): void {
  const { canTrack, eventId } = markOnce(eventKey, isDev);
  if (!canTrack) return;
  
  const enrichedData = {
    ...eventData,
    frid: ensureFrid(),
    timestamp: Date.now(),
    page_url: window.location.href,
    referrer: document.referrer,
  };
  
  const success = sendToFacebook(eventName, enrichedData, eventId);
  if (!success) {
    pendingEvents.push({
      eventName,
      eventData: enrichedData,
      eventId,
      timestamp: Date.now(),
      retryCount: 0
    });
    console.log(`[队列] 事件 ${eventName} 已加入待发送队列`);
    setTimeout(processEventQueue, 2000);
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    console.log("[网络] 网络已恢复，处理待发送队列");
    processEventQueue();
  });
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
  // 前屏加载成功事件 - 优化版
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    const isDev = window.location.hostname === 'localhost';
    trackEvent(
      "s1f_load",
      "S1_Front_Loaded",
      {
        content_name: "ScreenOne_Front",
        content_category: "Assessment_Landing",
      },
      isDev
    );
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // 3秒停留事件 - 优化版
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    startTimeRef.current = Date.now();

    const engageTimer = setTimeout(() => {
      const isDev = window.location.hostname === 'localhost';
      const actualDuration = Math.round((Date.now() - startTimeRef.current) / 1000);
      
      trackEvent(
        "s1e3",
        "S1_Front_Engaged_3s",
        {
          content_name: "ScreenOne_Front",
          content_category: "Assessment_Landing",
          engagement_type: "view_3s",
          actual_duration: actualDuration,
        },
        isDev
      );
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
  // CTA 点击处理（唯一的导航入口）- 优化版
  // ═══════════════════════════════════════════════════════════════
  const handleCTAClick = useCallback(() => {
    if (hasClicked) return;
    
    const isDev = window.location.hostname === 'localhost';
    const clickTimestamp = Date.now();
    const timeOnPage = startTimeRef.current > 0 
      ? Math.round((clickTimestamp - startTimeRef.current) / 1000) 
      : 0;

    trackEvent(
      "s1cc",
      "S1_Front_CTA_Click",
      {
        content_name: 'Assessment_CTA',
        content_category: 'Matching_Assessment',
        value: 49,
        currency: 'USD',
        screen_position: 'center',
        screen_number: 1,
        countdown_value: countdown,
        time_on_page: timeOnPage,
      },
      isDev
    );

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
        <span className="label-prefix">CANONICAL DATA</span>
        <span className="label-divider">//</span>
        <span className="label-suffix">THE STARLIGHT DIRECTIVE</span>
      </div>

      <div className="screen-front-content">
        {/* 核心图腾 (文字替代) */}
        <div className="project-sigil">
          [ THE ARCHETYPE RESONANCE ALGORITHM™ ]
        </div>
        
        {/* 权威认证文本 */}
        <div className="auth-protocol">
          ACCESS GRANTED: INTERFACING WITH THE ALGORITHM…
        </div>

        {/* 解码日志摘录 - 优化移动端尺寸 */}
        <div className="decoded-log-entry">
          <p className="log-text">
            “Canon I, Verse VII.
The Algorithm does not guess; it illuminates the Primal Archetype of Influence encoded within a soul’s signature at inception. It confirms the first truth: destinies are not random walks but expressions of a pre-ordained Resonance Contract™.
Distortions (‘glitches’) are not failures. They are the dissonance that occurs when your Archetype is starved of its native power source. Reclamation is not achieved through effort, but through precise re-activation of the Contract’s core resonant frequencies. The key is not to be earned; it is to be remembered. And now, you have the map.”
          </p>
          <p className="log-signature">
            — From the Founding Canons of the Starlight Council
          </p>
        </div>

        {/* 交互核心：倒计时与行动号召 */}
        <div className={`interaction-core ${ctaVisible ? 'visible' : ''}`}>
          {/* 紧迫感声明 */}
          <p className="urgency-statement">
            Your unique resonance signature has been detected. The portal to your Archetypal Code is now open. This alignment is temporary.
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
            <span className="s1-cta-text">CLAIM YOUR ARCHETYPAL CODE</span>
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
          text-transform: uppercase;
          text-align: center;
          position: relative;
          opacity: 0;
          animation: sigilReveal 800ms cubic-bezier(0.23,1,0.32,1) 200ms forwards;
          /* 奢华边框 */
          border: 1px solid rgba(184, 149, 106, 0.3);
          border-radius: 4px;
          background: linear-gradient(135deg,
            rgba(184, 149, 106, 0.06) 0%,
            rgba(184, 149, 106, 0.02) 100%
          );
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          box-shadow: 
            0 2px 12px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          /* 文字光晕 */
          text-shadow: 
            0 0 20px rgba(184, 149, 106, 0.3),
            0 1px 2px rgba(0, 0, 0, 0.5);
        }

        @keyframes sigilReveal {
          0% {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        /* 装饰角标 - 增强 */
        .project-sigil::before,
        .project-sigil::after {
          content: '';
          position: absolute;
          width: 24px;
          height: 24px;
          border: 1px solid rgba(184, 149, 106, 0.25);
          transition: border-color 300ms ease;
        }

        .project-sigil::before {
          top: -6px;
          left: -6px;
          border-right: none;
          border-bottom: none;
          border-top-left-radius: 2px;
        }

        .project-sigil::after {
          bottom: -6px;
          right: -6px;
          border-left: none;
          border-top: none;
          border-bottom-right-radius: 2px;
        }

        .project-sigil:hover::before,
        .project-sigil:hover::after {
          border-color: rgba(184, 149, 106, 0.5);
        }

        /* ═══════════════════════════════════════════════════════════════════
           权威认证文本
           ═══════════════════════════════════════════════════════════════════ */
        .auth-protocol {
          margin: 0 0 18px 0;
          padding: 0;
          font-size: 10px;
          line-height: 1.4;
          color: rgba(184, 149, 106, 0.6);
          font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
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
          white-space: pre-wrap; /* Preserve line breaks from the template literal */
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
          padding: 4px 12px;
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
          animation: shimmer 3s linear infinite;
          transition: opacity 300ms ease;
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%) rotate(0deg);
          }
          100% {
            transform: translateX(100%) rotate(0deg);
          }
        }

        .s1-cta-btn.urgent::before {
          opacity: 0.5;
        }

        .s1-cta-text {
          color: var(--cream-bright);
          position: relative;
          z-index: 1;
          transition: color 200ms ease;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }

        .s1-cta-arrow {
          color: var(--gold-bright);
          font-size: 18px;
          position: relative;
          z-index: 1;
          transition: transform 200ms ease;
          text-shadow: 0 0 10px rgba(184, 149, 106, 0.6);
        }

        /* 按钮强脉动 - 增强 */
        @keyframes pulseDramatic {
          0%, 100% {
            transform: scale(1);
            box-shadow: 
              0 4px 20px rgba(0, 0, 0, 0.25),
              0 0 0 0 rgba(184, 149, 106, 0.5);
          }
          50% {
            transform: scale(1.025);
            box-shadow: 
              0 6px 28px rgba(184, 149, 106, 0.35),
              0 0 30px 12px rgba(184, 149, 106, 0.25);
          }
        }

        .s1-cta-btn.pulse {
          animation: pulseDramatic 1.5s ease-in-out infinite;
          border-color: var(--gold-bright);
        }

        /* 悬停效果 - 增强 */
        @media (hover: hover) {
          .s1-cta-btn:hover:not(:disabled) {
            background: linear-gradient(135deg, 
              rgba(184, 149, 106, 0.25) 0%, 
              rgba(184, 149, 106, 0.15) 100%
            );
            border-color: var(--gold-bright);
            transform: translateY(-2px) scale(1.01);
            box-shadow: 
              0 8px 32px rgba(184, 149, 106, 0.4),
              0 4px 12px rgba(0, 0, 0, 0.25),
              inset 0 1px 0 rgba(255, 255, 255, 0.15);
          }

          .s1-cta-btn:hover:not(:disabled)::before {
            opacity: 0.7;
          }

          .s1-cta-btn:hover:not(:disabled) .s1-cta-arrow {
            transform: translateX(4px);
          }
        }

        /* 点击状态 */
        .s1-cta-btn:active:not(:disabled) {
          transform: scale(0.98);
          box-shadow: 
            0 2px 12px rgba(0, 0, 0, 0.2),
            inset 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        /* 禁用状态 */
        .s1-cta-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          animation: none;
          transform: none;
        }

        /* ═══════════════════════════════════════════════════════════════════
           响应式适配 - 桌面端增强
           ═══════════════════════════════════════════════════════════════════ */
        @media (min-width: 768px) {
          .logo-header {
            padding: 24px 32px;
          }

          .s1-top-label {
            top: 82px;
            font-size: 10px;
            padding: 10px 20px;
          }

          .screen-front-content {
            max-width: 680px;
            padding: 140px 32px 32px;
          }

          .project-sigil {
            font-size: 15px;
            padding: 12px 24px;
            margin-bottom: 14px;
          }

          .project-sigil::before,
          .project-sigil::after {
            width: 28px;
            height: 28px;
            top: -7px;
            left: -7px;
          }

          .project-sigil::after {
            bottom: -7px;
            right: -7px;
          }

          .auth-protocol {
            font-size: 11px;
            margin-bottom: 20px;
          }

          .decoded-log-entry {
            padding: 20px 24px;
            margin-bottom: 22px;
            max-width: 560px;
          }

          .log-text {
            font-size: 13px;
            line-height: 1.7;
            margin-bottom: 12px;
          }

          .log-signature {
            font-size: 12px;
          }

          .urgency-statement {
            font-size: 14px;
            margin-bottom: 16px;
          }

          .countdown-timer {
            padding: 8px 16px;
            margin-bottom: 20px;
          }

          .countdown-number {
            font-size: 68px;
          }

          .s1-cta-btn {
            height: 56px;
            max-width: 400px;
            font-size: 13px;
          }

          .s1-cta-arrow {
            font-size: 20px;
          }
        }

        /* 超小屏优化 */
        @media (max-width: 359px) {
          .logo-header {
            padding: 16px;
          }

          .s1-top-label {
            font-size: 8px;
            top: 68px;
            padding: 6px 12px;
          }

          .screen-front-content {
            padding: 110px 12px 16px;
          }

          .project-sigil {
            font-size: 11px;
            padding: 8px 14px;
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
            font-size: 11px;
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

          .project-sigil,
          .auth-protocol,
          .decoded-log-entry,
          .interaction-core,
          .countdown-timer,
          .s1-top-label {
            opacity: 1 !important;
            transform: none !important;
          }
        }

        /* 高对比度模式支持 */
        @media (prefers-contrast: high) {
          .s1-cta-btn {
            border-width: 3px;
            border-color: var(--gold-bright);
            background: rgba(184, 149, 106, 0.3);
          }

          .countdown-timer {
            border-width: 3px;
            border-color: var(--gold-bright);
          }

          .decoded-log-entry,
          .s1-top-label {
            border-width: 2px;
            border-color: rgba(184, 149, 106, 0.5);
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