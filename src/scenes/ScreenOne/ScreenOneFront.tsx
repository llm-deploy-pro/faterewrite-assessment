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
  const [countdown, setCountdown] = useState<number>(18);
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
  // 3秒 & 10秒停留事件 - 参与深度追踪
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    startTimeRef.current = Date.now();

    // 3秒停留 - 轻度参与
    const engage3sTimer = setTimeout(() => {
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

    // 10秒停留 - 深度参与 🆕
    const engage10sTimer = setTimeout(() => {
      const isDev = window.location.hostname === 'localhost';
      const actualDuration = Math.round((Date.now() - startTimeRef.current) / 1000);
      
      trackEvent(
        "s1e10",
        "S1_Front_Engaged_10s",
        {
          content_name: "ScreenOne_Front",
          content_category: "Assessment_Landing",
          engagement_type: "view_10s",
          actual_duration: actualDuration,
        },
        isDev
      );
    }, 10000);

    return () => {
      clearTimeout(engage3sTimer);
      clearTimeout(engage10sTimer);
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
  // 共用的导航函数 - 统一处理跳转逻辑
  // ═══════════════════════════════════════════════════════════════
  const navigateToNext = useCallback(() => {
    // 标记已点击/已跳转
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
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // CTA 点击处理 - 真实用户点击
  // ═══════════════════════════════════════════════════════════════
  const handleCTAClick = useCallback(() => {
    if (hasClicked) return;
    
    const isDev = window.location.hostname === 'localhost';
    const clickTimestamp = Date.now();
    const timeOnPage = startTimeRef.current > 0 
      ? Math.round((clickTimestamp - startTimeRef.current) / 1000) 
      : 0;

    // 真实用户点击事件
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
        trigger_type: 'user_click',
        countdown_value: countdown,
        time_on_page: timeOnPage,
      },
      isDev
    );

    // 执行导航
    navigateToNext();
  }, [hasClicked, countdown, navigateToNext]);

  // ═══════════════════════════════════════════════════════════════
  // 倒计时结束后自动跳转 - 独立事件追踪
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    // 当倒计时归零且用户尚未点击时，触发自动跳转
    if (countdown === 0 && !hasClicked) {
      const isDev = window.location.hostname === 'localhost';
      const timeOnPage = startTimeRef.current > 0 
        ? Math.round((Date.now() - startTimeRef.current) / 1000) 
        : 0;

      // 自动跳转事件 - 与用户点击区分
      trackEvent(
        "s1at",
        "S1_Front_Auto_Transition",
        {
          content_name: 'Assessment_Countdown_Complete',
          content_category: 'Matching_Assessment',
          trigger_type: 'auto_timeout',
          reason: 'countdown_zero',
          time_on_page: timeOnPage,
          screen_number: 1,
        },
        isDev
      );

      // 执行导航
      navigateToNext();
    }
  }, [countdown, hasClicked, navigateToNext]);

  return (
    <section className="screen-front-container">
      {/* Logo 区域 - 独立固定头部 */}
      <div className="logo-header">
        <Wordmark name="Resonance" href="/" />
      </div>
      
      {/* 顶部系统信息 */}
      <div className="s1-top-label">
        <span className="label-text">● LIVE • AKASHIC PROTOCOL</span>
      </div>

      <div className="screen-front-content">
        {/* 核心图腾 (文字替代) */}
        <div className="project-sigil">
          [ ACTIVE SESSION: FREQUENCY RECALIBRATION ]
        </div>
        
        {/* 权威认证文本 */}
        <div className="auth-protocol">
          CALIBRATING YOUR SIGNATURE...
        </div>


        {/* 解码日志摘录 - 优化移动端尺寸 */}
        <div className="decoded-log-entry">
          <p className="log-text">
            "Log Entry 777. Recalibration Protocol is now active. Subject's original Vibrational Contract has been located in the Akashic Field and is being routed through harmonic correction matrices.
Preliminary scan indicates significant frequency drift from birth signature—deviation patterns consistent with environmental suppression and misalignment conditioning over 8-15 year exposure cycle. Pattern classification matches previously documented cases of accelerated timeline collapse in subjects who remained unaware of frequency theft.
Root cause identified: Subject has been operating on inherited frequency bands designed for someone else's timeline. The misalignment isn't personal failure; it's systematic frequency theft by low-resonance environmental structures. Left uncorrected, this drift compounds exponentially—each year of misalignment making realignment more difficult and timeline recovery less complete.
Correction sequence is LIVE. Distortions are being isolated. The contract's original resonant frequencies are being restored to baseline. All 'glitches'—failed manifestations, inverted wins, blocked pathways—have been traced to this single source: you were tuned to the wrong station.
The realigned Frequency Map is being compiled now. Access window: 12 hours before calibration data resets and this signature returns to dormant state. Previous subjects who claimed their maps during active calibration windows reported early convergence signals within 48-72 hours (profile-dependent)."
          </p>
          <p className="log-signature">
            — From the Active Logs of Project Starlight, Recalibration Division
          </p>
        </div>

        {/* 交互核心：倒计时与行动号召 */}
        <div className={`interaction-core ${ctaVisible ? 'visible' : ''}`}>
          {/* 紧迫感声明 */}
          <p className="urgency-statement">
            This is not a reading. This is a live intervention.
          </p>
          
          <p className="urgency-statement">
            Your unique soul signature has been isolated from the Akashic Field. Right now, in real-time, your original Vibrational Contract—the one you were born with before conditioning distorted it—is being reconstructed.
          </p>
          
          <p className="urgency-statement" style={{ 
            marginTop: '12px', 
            fontSize: '11.5px', 
            fontStyle: 'italic', 
            opacity: 0.88,
            color: 'rgba(212, 184, 150, 0.88)',
            fontWeight: 300,
            letterSpacing: '0.015em',
            textShadow: '0 0 15px rgba(184, 149, 106, 0.12)'
          }}>
            — confidential, one-time evaluation; qualification applies; no subscription.
          </p>
          
          <p className="urgency-statement">
            The portal to your Recalibrated Frequency Map is open. This window closes in:
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
            aria-label="Claim your Recalibrated Frequency Map"
          >
            <span className="s1-cta-text">CLAIM YOUR RECALIBRATED FREQUENCY MAP</span>
            <span className="s1-cta-arrow">→</span>
          </button>
          
          <p className="urgency-statement" style={{ 
            marginTop: '12px', 
            fontSize: '13px',
            color: 'rgba(245, 240, 230, 0.78)',
            fontWeight: 300,
            letterSpacing: '0.02em',
            textShadow: '0 1px 8px rgba(184, 149, 106, 0.08)'
          }}>
            Your corrected signature. Your original timeline. Your true path.
          </p>

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
          padding: 16px;
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
          top: 53px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 90;
          font-size: 9px;
          line-height: 1.3;
          font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          white-space: nowrap;
          opacity: 0;
          animation: topLabelReveal 600ms cubic-bezier(0.23, 1, 0.32, 1) forwards;
          /* 增强视觉效果 */
          padding: 6px 12px;
          background: rgba(20, 25, 35, 0.6);
          border: 1px solid rgba(184, 149, 106, 0.2);
          border-radius: 20px;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          box-shadow: 
            0 2px 12px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .label-text {
          color: rgba(212, 184, 150, 0.95);  /* 金色，清晰可见 */
          font-weight: 500;
          letter-spacing: 0.08em;
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
          padding: 82px 14px 16px;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }


        /* ═══════════════════════════════════════════════════════════════════
           核心图腾 (文字版) - 视觉强化
           ═══════════════════════════════════════════════════════════════════ */
        .project-sigil {
          margin: 0 0 2px 0;
          padding: 6px 12px;
          font-size: 10.5px;
          line-height: 1;
          color: rgba(212, 184, 150, 1);
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
          margin: 0 0 1px 0;
          padding: 0;
          font-size: 8.5px;
          line-height: 1.3;
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
          margin: 0 0 3px 0;
          padding: 8px 11px;
          background: linear-gradient(135deg, 
            rgba(20, 25, 35, 0.7) 0%, 
            rgba(15, 20, 30, 0.6) 100%
          );
          border: 1px solid rgba(184, 149, 106, 0.3);
          border-radius: 8px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          opacity: 0;
          animation: logEntryFade 700ms cubic-bezier(0.23,1,0.32,1) 600ms forwards;
          width: 100%;
          max-width: 480px;
          /* 增强阴影和内发光 */
          box-shadow: 
            0 4px 24px rgba(0, 0, 0, 0.35),
            0 2px 8px rgba(0, 0, 0, 0.25),
            inset 0 1px 0 rgba(212, 184, 150, 0.05),
            inset 0 0 30px rgba(184, 149, 106, 0.02);
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
          margin: 0 0 4px 0;
          padding: 0;
          font-size: 9px;
          line-height: 1.35;
          color: rgba(255, 250, 240, 0.96);  /* 淡金白 - 神谕色彩 - 保留 */
          font-family: Georgia, 'Times New Roman', serif;  /* 恢复 Georgia */
          font-style: italic;  /* 恢复斜体 */
          letter-spacing: 0.01em;  /* 恢复原始字间距 */
          text-align: left;
          white-space: pre-wrap;
          /* 神谕发光效果 - 保留 */
          text-shadow: 
            0 0 20px rgba(212, 184, 150, 0.15),
            0 0 40px rgba(212, 184, 150, 0.08),
            0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .log-text.log-continuation {
          margin-bottom: 14px;
        }

        .log-signature {
          margin: 0;
          padding: 0;
          font-size: 8.5px;
          line-height: 1.3;
          color: rgba(212, 184, 150, 0.95);  /* 金色签名 - 微调透明度 */
          font-family: Georgia, 'Times New Roman', serif;
          font-style: italic;
          text-align: right;
          letter-spacing: 0.02em;
          opacity: 1;
          /* 增强发光效果 */
          text-shadow: 
            0 0 20px rgba(184, 149, 106, 0.3),
            0 0 40px rgba(184, 149, 106, 0.15);
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
          margin-bottom: 0;
        }

        .interaction-core.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* 紧迫感声明 - 视觉强化 */
        .urgency-statement {
          margin: 0 0 5px 0;
          padding: 0 10px;
          font-size: 10.5px;
          line-height: 1.3;
          color: rgba(255, 252, 245, 0.94);  /* 微调为淡奶油白 */
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-weight: 400;
          letter-spacing: 0.01em;
          text-align: center;
          /* 优化光晕效果 */
          text-shadow: 
            0 1px 8px rgba(184, 149, 106, 0.12),
            0 0 20px rgba(212, 184, 150, 0.06);
        }

        /* ═══════════════════════════════════════════════════════════════════
           倒计时器 - 奢华强化
           ═══════════════════════════════════════════════════════════════════ */
        .countdown-timer {
          margin: 0 0 10px 0;
          padding: 10px 20px;
          color: rgba(255, 255, 255, 0.98);  /* 纯白高对比 */
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: scale(0.8);
          transition: all 400ms cubic-bezier(0.23, 1, 0.32, 1);
          /* 优雅背景 - 微妙渐变 */
          background: linear-gradient(135deg,
            rgba(212, 184, 150, 0.12) 0%,
            rgba(184, 149, 106, 0.08) 100%
          );
          /* 细边框 - 优雅不抢眼 */
          border: 1.5px solid rgba(212, 184, 150, 0.35);
          /* 更圆润的圆角 */
          border-radius: 20px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          /* 优雅阴影 - 发光+深度 */
          box-shadow: 
            0 0 40px rgba(212, 184, 150, 0.25),
            0 6px 24px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.08),
            inset 0 0 30px rgba(212, 184, 150, 0.05);
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
          font-size: 52px;
          line-height: 1;
          font-weight: 400;
          color: rgba(212, 184, 150, 1);
          /* 强制等宽字体 - 100%保证数字等宽 */
          font-family: 'SF Mono', 'Monaco', 'Consolas', 'Courier New', monospace;
          letter-spacing: 0.05em;
          /* 移除无效的属性 */
          font-variant-numeric: tabular-nums;
          text-shadow: 
            0 0 35px rgba(212, 184, 150, 0.7),
            0 0 60px rgba(184, 149, 106, 0.5),
            0 2px 4px rgba(0, 0, 0, 0.3);
          position: relative;
        }

        /* ═══════════════════════════════════════════════════════════════════
           CTA 按钮 - 奢华品牌强化
           ═══════════════════════════════════════════════════════════════════ */
        .s1-cta-btn {
          width: 100%;
          max-width: 360px;
          height: 50px;
          margin: 0 auto;
          border-radius: 26px;
          /* 奢华背景 - 更实,更金 */
          background: linear-gradient(135deg, 
            rgba(212, 184, 150, 0.22) 0%, 
            rgba(184, 149, 106, 0.18) 100%
          );
          /* 奢华边框 - 更粗,更金 */
          border: 3px solid rgba(212, 184, 150, 0.75);
          color: var(--cream-bright);
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: all 350ms cubic-bezier(0.23, 1, 0.32, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          text-transform: uppercase;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          /* 奢华阴影 - 强烈金色发光 + 深阴影 */
          box-shadow: 
            0 0 35px rgba(212, 184, 150, 0.4),
            0 8px 32px rgba(0, 0, 0, 0.45),
            inset 0 2px 0 rgba(255, 255, 255, 0.15),
            inset 0 -2px 0 rgba(0, 0, 0, 0.25);
        }

        /* 奢华hover效果 - Dramatic变化 */
        .s1-cta-btn:hover {
          /* Dramatic背景变化 */
          background: linear-gradient(135deg, 
            rgba(212, 184, 150, 0.32) 0%, 
            rgba(184, 149, 106, 0.28) 100%
          );
          /* 纯金边框 */
          border-color: rgba(212, 184, 150, 0.95);
          /* 强烈发光 + 上浮 */
          box-shadow: 
            0 0 55px rgba(212, 184, 150, 0.65),
            0 12px 40px rgba(0, 0, 0, 0.5),
            inset 0 2px 0 rgba(255, 255, 255, 0.25),
            inset 0 -2px 0 rgba(0, 0, 0, 0.35);
          transform: translateY(-3px) scale(1.02);
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
          color: rgba(255, 252, 240, 1);  /* 微调为更温暖的奶油色 */
          position: relative;
          z-index: 1;
          transition: color 200ms ease;
          text-shadow: 
            0 1px 3px rgba(0, 0, 0, 0.35),
            0 0 12px rgba(212, 184, 150, 0.15);
        }

        .s1-cta-arrow {
          color: rgba(212, 184, 150, 1);
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
          border-color: rgba(212, 184, 150, 1);
        }

        /* 悬停效果 - 增强 */
        @media (hover: hover) {
          .s1-cta-btn:hover:not(:disabled) {
            background: linear-gradient(135deg, 
              rgba(184, 149, 106, 0.25) 0%, 
              rgba(184, 149, 106, 0.15) 100%
            );
            border-color: rgba(212, 184, 150, 1);
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
            top: 71px;
            font-size: 8.5px;
            padding: 10px 20px;
          }

          .screen-front-content {
            max-width: 680px;
            padding: 120px 32px 24px;
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
            font-size: 8.5px;
            margin-bottom: 20px;
          }

          .decoded-log-entry {
            padding: 20px 24px;
            margin-bottom: 22px;
            max-width: 560px;
          }

          .log-text {
            font-size: 10.5px;
            line-height: 1.7;
            margin-bottom: 12px;
          }

          .log-signature {
            font-size: 9px;
          }

          .urgency-statement {
            font-size: 14px;
            margin-bottom: 16px;
          }

          .countdown-timer {
            padding: 14px 24px;
            margin-bottom: 20px;
          }

          .countdown-number {
            font-size: 68px;
          }

          .s1-cta-btn {
            height: 56px;
            max-width: 400px;
            font-size: 10.5px;
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
            top: 57px;
            padding: 6px 12px;
          }

          .screen-front-content {
            padding: 82px 12px 14px;
          }

          .project-sigil {
            font-size: 8.5px;
            padding: 8px 14px;
          }

          .decoded-log-entry {
            padding: 10px 12px;
          }

          .log-text {
            font-size: 8.5px;
          }

          .urgency-statement {
            font-size: 9px;
          }

          .countdown-number {
            font-size: 48px;
          }

          .s1-cta-btn {
            height: 48px;
            font-size: 8.5px;
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
            border-color: rgba(212, 184, 150, 1);
            background: rgba(184, 149, 106, 0.3);
          }

          .countdown-timer {
            border-width: 3px;
            border-color: rgba(212, 184, 150, 1);
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