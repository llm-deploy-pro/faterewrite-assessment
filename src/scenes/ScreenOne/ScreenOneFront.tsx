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
  
  // 🆕 实时数字状态 - 克制的上升动画
  const [liveNumber, setLiveNumber] = useState<number>(847);

  // ═══════════════════════════════════════════════════════════════
  // 🆕 克制的实时数字动画 - 3-5秒+1，最高到850
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    const maxNumber = 850; // 最高到850就停止
    const startDelay = 2000; // 2秒后开始
    
    const startTimer = setTimeout(() => {
      const incrementInterval = setInterval(() => {
        setLiveNumber(prev => {
          if (prev >= maxNumber) {
            clearInterval(incrementInterval);
            return maxNumber;
          }
          // 随机3-5秒增加1
          return prev + 1;
        });
      }, 3500 + Math.random() * 1500); // 3.5-5秒之间随机

      return () => clearInterval(incrementInterval);
    }, startDelay);

    return () => clearTimeout(startTimer);
  }, []);

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
      {/* Logo 区域 */}
      <div className="logo-header">
        <Wordmark name="AXIS" href="/" />
      </div>
      
      {/* 顶部系统信息 */}
      <div className="s1-top-label">
        <span className="label-text">— VERIFIED NETWORK • MEMBERS ONLY —</span>
      </div>

      <div className="screen-front-content">
        {/* Main Headline */}
        <div className="project-sigil">
          STOP SWIPING. START MEETING.
        </div>
        
        {/* Sub-headline */}
        <div className="auth-protocol">
          REAL WOMEN. IN PERSON. THIS WEEK.
        </div>

        {/* Small print under Sub-headline */}
        <p className="sub-headline-detail">
          The only verified network for men who are done with fake profiles, endless chatting, and women who never show up.
        </p>

        {/* Section: What We Do */}
        <div className="what-we-do-section">
          <p className="value-prop-text">
            You want a woman who actually shows up. Who looks like her photos. Who doesn't ghost you 2 hours before the date.
          </p>
          
          <p className="value-prop-text value-prop-emphasis">
            We arrange that.
          </p>
          
          <p className="value-prop-text">
            Dinner companions. Event dates. Weekend travel. Private time. You tell us your city, your timeline, your type. We send you this week's available women within the hour.
          </p>
          
          <p className="value-prop-text">
            No swiping. No texting for days. No "let's see if we vibe first." Just real women. Real meetings. Real results.
          </p>

          <p className="section-signature">
            — AXIS Concierge System
          </p>
        </div>

        {/* 💎 呼吸卡片：Network Performance */}
        <div className="luxury-showcase">
          <div className="showcase-header">
            <div className="header-title">NETWORK PERFORMANCE</div>
          </div>

          {/* 第1层：震撼数字 */}
          <div className="showcase-hero">
            <div className="hero-number">{liveNumber}</div>
            <div className="hero-statement">MEN GOT REAL DATES</div>
            <div className="hero-tagline">Not apps. Not chat. Real.</div>
          </div>

          {/* 第2层：社会证明 */}
          <div className="showcase-proof">
            <div className="proof-column">
              <div className="proof-metric">94%</div>
              <div className="proof-label">CAME BACK</div>
              <div className="proof-detail">Within 60 days</div>
              <div className="proof-reason">Because it works</div>
            </div>

            <div className="proof-divider-vertical"></div>

            <div className="proof-column">
              <div className="proof-metric proof-price">$1.2K–$3.8K</div>
              <div className="proof-label">INVESTMENT</div>
              <div className="proof-detail">One dinner vs months</div>
              <div className="proof-reason">of swiping & texting</div>
            </div>
          </div>

          {/* 第3层：安全保障 */}
          <div className="showcase-security">
            <div className="security-badge">
              <span className="security-icon">🔒</span>
              <span className="security-title">VIDEO + ID • EVERY WOMAN</span>
            </div>
            <div className="security-policy">Zero tolerance for fake profiles</div>
          </div>

          {/* 底部汇总 */}
          <div className="showcase-footer">
            <span className="footer-badge">🌐</span>
            <span className="footer-text">9+ daily • 50 states • Your city covered ✓</span>
          </div>
        </div>

        {/* ⚠️ 排除矩阵：精简版 */}
        <div className="exclusion-block">
          <div className="exclusion-header">
            <span className="exclusion-icon">⚠</span>
            <span className="exclusion-title">NOT YOUR TYPICAL SETUP</span>
          </div>

          <div className="exclusion-compare">
            <div className="compare-row">
              <div className="compare-them">
                <span className="them-label">THEM:</span>
                <span className="them-text">Swipe 100 times, match with bots, waste weeks</span>
              </div>
              <div className="compare-us">
                <span className="us-label">US:</span>
                <span className="us-text">Tell us your city, get real women, meet this week</span>
              </div>
            </div>
          </div>

          <div className="exclusion-statement">
            <div className="statement-badge">✓</div>
            <div className="statement-text">
              We are the intermediary • You deal with us • We arrange her • You don't browse • You don't DM • You request • We deliver
            </div>
          </div>
        </div>

        {/* 🔐 准入协议：时间承诺版 */}
        <div className="access-timeline">
          <div className="timeline-header">
            <span className="timeline-icon">🔐</span>
            <span className="timeline-title">90 SECONDS FROM NOW</span>
          </div>

          <div className="timeline-promise">
            <div className="promise-step">
              <div className="step-time">NOW</div>
              <div className="step-action">You submit city + type</div>
            </div>

            <div className="promise-arrow">↓</div>

            <div className="promise-step">
              <div className="step-time">+90s</div>
              <div className="step-action">We start vetting</div>
            </div>

            <div className="promise-arrow">↓</div>

            <div className="promise-step promise-step-final">
              <div className="step-time">+2hrs</div>
              <div className="step-action">Real photos in your inbox</div>
            </div>
          </div>

          <div className="timeline-guarantee">
            <div className="guarantee-badge">NO BROWSING • NO SWIPING • NO WAITING</div>
            <div className="guarantee-note">
              Members-only. No public photos. Women only meet pre-approved men.
            </div>
          </div>

          <div className="timeline-terms">
            <div className="term-item">
              <span className="term-icon">⚙</span>
              <span className="term-text">No verification = No access</span>
            </div>
            <div className="term-item">
              <span className="term-icon">💰</span>
              <span className="term-text">Book = Credited • Skip = 30-day access</span>
            </div>
          </div>
        </div>

        {/* Final Section before CTA */}
        <div className={`interaction-core ${ctaVisible ? 'visible' : ''}`}>
          
          {/* Nationwide Coverage */}
          <p className="coverage-notice">
            Nationwide coverage · All 50 US states
          </p>
          
          {/* Scarcity Element */}
          <p className="urgency-statement">
            Limited spots this week:
          </p>

          {/* Countdown Timer */}
          <div className={`countdown-timer ${countdownStarted ? 'active' : ''} ${shouldPulse ? 'expired' : ''}`}>
            <span className="countdown-number">{countdown}</span>
          </div>

          {/* CTA Button */}
          <button
            type="button"
            onClick={handleCTAClick}
            disabled={hasClicked}
            className={`s1-cta-btn ${shouldPulse ? 'pulse' : ''} ${shouldPulse ? 'urgent' : ''}`}
            aria-label="Show me this week's women"
          >
            <span className="s1-cta-text">SHOW ME THIS WEEK</span>
            <span className="s1-cta-arrow">→</span>
          </button>
          
          <p className="cta-disclaimer">
            Authorization required after submission. Refundable toward booking.
          </p>

          <p className="footer-anchor">
            This is not a fantasy. This is a real service for men who want results, not conversations. Discreet. Professional. No refunds on wasted time — we handle that.
          </p>

        </div>
      </div>

      {/* @ts-ignore - styled-jsx specific attribute */}
      <style jsx>{`
        /* ═══════════════════════════════════════════════════════════════════
           🎯 呼吸感优化方案 - 保持文案完整性
           策略：统一间距系统 + 压缩底部空白 + 增强视觉层次
           目标：优秀可读性 + 舒适呼吸感 + 高端品质感
           ═══════════════════════════════════════════════════════════════════ */
        :root {
          --bg-primary: #12161f;
          --bg-secondary: #1a1f2a;
          --bg-card: rgba(20, 25, 35, 0.3);
          --gold: #e0bc87;
          --gold-bright: #fff5e6;
          --gold-hover: #e5c598;
          --gold-glow: rgba(224, 188, 135, 0.5);
          --cream: #f5f5f0;
          --cream-bright: #fafaf5;
          --cream-dim: rgba(245, 245, 240, 0.7);
          --amber: rgba(255, 191, 0, 0.45);
          
          /* 🎯 极致压缩间距系统 */
          --spacing-xs: 4px;
          --spacing-sm: 6px;
          --spacing-md: 8px;
          --spacing-lg: 10px;
          --spacing-xl: 12px;
        }

        /* 禁止滚动 - 严格执行 */
        :global(html), :global(body) {
          overflow: hidden !important;
          height: 100% !important;
          position: fixed !important;
          width: 100% !important;
        }

        /* ═══════════════════════════════════════════════════════════════════
           容器基础 - 优化背景层次
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

        .screen-front-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(circle at 20% 30%, rgba(224, 188, 135, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(255, 245, 230, 0.05) 0%, transparent 50%);
          pointer-events: none;
          z-index: 1;
        }

        .screen-front-container::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.025;
          pointer-events: none;
          z-index: 1;
        }

        /* ═══════════════════════════════════════════════════════════════════
           Logo 头部 - 优化尺寸和阴影
           ═══════════════════════════════════════════════════════════════════ */
        .logo-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 12px 16px;
          height: auto;
          background: linear-gradient(to bottom,
            rgba(18, 22, 31, 0.95) 0%,
            rgba(18, 22, 31, 0.85) 60%,
            transparent 100%
          );
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
        }

        /* ═══════════════════════════════════════════════════════════════════
           顶部标签 - 优化位置和大小
           ═══════════════════════════════════════════════════════════════════ */
        .s1-top-label {
          position: fixed;
          top: 52px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 90;
          font-size: 7px;
          line-height: 1;
          font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          white-space: nowrap;
          opacity: 0;
          animation: topLabelReveal 600ms cubic-bezier(0.23, 1, 0.32, 1) forwards;
          padding: 6px 12px;
          background: rgba(20, 25, 35, 0.6);
          border: 1px solid rgba(224, 188, 135, 0.2);
          border-radius: 20px;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          box-shadow: 
            0 2px 12px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .label-text {
          color: rgba(224, 188, 135, 0.95);
          font-weight: 500;
          letter-spacing: 0.06em;
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
           主内容容器 - 压缩顶部间距
           ═══════════════════════════════════════════════════════════════════ */
        .screen-front-content {
          position: relative;
          width: 100%;
          max-width: 600px;
          text-align: center;
          color: var(--cream);
          padding: 72px 8px 4px;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }

        /* ═══════════════════════════════════════════════════════════════════
           Main Headline - 压缩字号
           ═══════════════════════════════════════════════════════════════════ */
        .project-sigil {
          margin: 0 0 4px 0;
          padding: 4px 12px;
          font-size: 11px;
          line-height: 1;
          color: rgba(224, 188, 135, 1);
          font-family: 'Bodoni MT', 'Didot', Georgia, serif;
          letter-spacing: 0.1em;
          font-weight: 400;
          text-transform: uppercase;
          text-align: center;
          position: relative;
          opacity: 0;
          animation: sigilReveal 800ms cubic-bezier(0.23,1,0.32,1) 200ms forwards;
          border: 1px solid rgba(224, 188, 135, 0.3);
          border-radius: 4px;
          background: linear-gradient(135deg,
            rgba(224, 188, 135, 0.06) 0%,
            rgba(224, 188, 135, 0.02) 100%
          );
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          box-shadow: 
            0 2px 12px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
          text-shadow: 
            0 0 20px rgba(224, 188, 135, 0.3),
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

        /* ═══════════════════════════════════════════════════════════════════
           Sub-headline - 压缩字号
           ═══════════════════════════════════════════════════════════════════ */
        .auth-protocol {
          margin: 0 0 3px 0;
          padding: 0;
          font-size: 8px;
          line-height: 1;
          color: rgba(224, 188, 135, 0.85);
          font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          font-weight: 500;
          text-align: center;
          opacity: 0;
          animation: authFade 600ms cubic-bezier(0.23,1,0.32,1) 400ms forwards;
          text-shadow: 0 0 20px rgba(224, 188, 135, 0.15);
        }

        @keyframes authFade {
          to { opacity: 1; }
        }

        /* ═══════════════════════════════════════════════════════════════════
           Small print - 增大至7px
           ═══════════════════════════════════════════════════════════════════ */
        .sub-headline-detail {
          margin: 0 0 6px 0;
          padding: 0 8px;
          font-size: 7px;
          line-height: 1.3;
          color: rgba(245, 245, 240, 0.9);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-weight: 400;
          text-align: center;
          font-style: italic;
        }

        /* ═══════════════════════════════════════════════════════════════════
           "What We Do" 部分 - 压缩间距
           ═══════════════════════════════════════════════════════════════════ */
        .what-we-do-section {
          width: 100%;
          max-width: 480px;
          margin: 0 0 6px 0;
          padding: 6px 8px;
          background: linear-gradient(135deg, 
            rgba(20, 25, 35, 0.5) 0%, 
            rgba(15, 20, 30, 0.4) 100%
          );
          border: 1px solid rgba(224, 188, 135, 0.2);
          border-radius: 6px;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 
            0 4px 24px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(224, 188, 135, 0.05);
        }

        .value-prop-text {
          margin: 0 0 4px 0;
          padding: 0;
          font-size: 7px;
          line-height: 1.35;
          color: rgba(255, 250, 240, 0.95);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-weight: 400;
          letter-spacing: 0.01em;
          text-align: center;
        }

        .value-prop-text:last-of-type {
          margin-bottom: 4px;
        }

        .value-prop-emphasis {
          color: rgba(224, 188, 135, 1);
          font-weight: 600;
          font-size: 7.5px;
          text-shadow: 0 0 20px rgba(224, 188, 135, 0.3);
          margin: 2px 0;
        }

        .section-signature {
          margin: 0;
          padding: 0;
          font-size: 5.5px;
          line-height: 1.3;
          color: rgba(224, 188, 135, 0.85);
          font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
          font-weight: 400;
          font-style: italic;
          text-align: center;
          letter-spacing: 0.05em;
        }

        /* ═══════════════════════════════════════════════════════════════════
           💎 呼吸卡片：Luxury Showcase - 再压缩20%版本
           策略：保持字号，进一步压缩padding和gap
           ═══════════════════════════════════════════════════════════════════ */
        .luxury-showcase {
          width: 100%;
          max-width: 480px;
          margin: 0 0 6px 0;
          padding: 3px 5px 2px;
          background: linear-gradient(135deg,
            rgba(224, 188, 135, 0.04) 0%,
            rgba(20, 25, 35, 0.6) 100%
          );
          border: 1px solid rgba(224, 188, 135, 0.25);
          border-radius: 6px;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow:
            0 4px 32px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 245, 230, 0.08);
          animation: luxuryBreathe 6s ease-in-out infinite;
        }

        @keyframes luxuryBreathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(0.998); }
        }

        .showcase-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 1px;
        }

        .header-title {
          font-size: 5.5px;
          font-weight: 600;
          color: rgba(224, 188, 135, 0.9);
          font-family: 'SF Mono', 'Monaco', monospace;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        /* 第1层：震撼数字 - 保持字号40px */
        .showcase-hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0px;
          margin-bottom: 2px;
          padding: 0;
        }

        .hero-number {
          font-size: 40px;
          font-weight: 400;
          color: var(--gold-bright);
          font-family: 'SF Mono', 'Monaco', monospace;
          letter-spacing: 0.05em;
          line-height: 0.9;
          text-shadow: 
            0 0 35px rgba(255, 245, 230, 0.6),
            0 0 70px rgba(224, 188, 135, 0.4);
          animation: numberReveal 1.5s ease-out forwards;
          transition: all 800ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes numberReveal {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }

        .hero-statement {
          font-size: 7px;
          font-weight: 600;
          color: rgba(255, 255, 255, 1);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          line-height: 1;
        }

        .hero-tagline {
          font-size: 5.5px;
          color: rgba(224, 188, 135, 0.9);
          font-style: italic;
          letter-spacing: 0.04em;
          line-height: 1;
        }

        /* 第2层：社会证明 - 保持字号，压缩间距 */
        .showcase-proof {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 5px;
          margin-bottom: 2px;
          padding: 0;
        }

        .proof-column {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0px;
        }

        .proof-metric {
          font-size: 24px;
          font-weight: 600;
          color: var(--gold);
          font-family: 'SF Mono', 'Monaco', monospace;
          letter-spacing: 0.04em;
          line-height: 0.9;
          text-shadow: 0 0 18px rgba(224, 188, 135, 0.4);
        }

        .proof-price {
          font-size: 16px;
        }

        .proof-label {
          font-size: 6px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.95);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          line-height: 1;
        }

        .proof-detail {
          font-size: 5px;
          color: rgba(224, 188, 135, 0.75);
          line-height: 1.1;
        }

        .proof-reason {
          font-size: 4.5px;
          color: rgba(224, 188, 135, 0.65);
          font-style: italic;
          line-height: 1.1;
        }

        .proof-divider-vertical {
          width: 1px;
          background: linear-gradient(to bottom,
            transparent,
            rgba(224, 188, 135, 0.25),
            transparent
          );
        }

        /* 第3层：安全保障 - 压缩padding */
        .showcase-security {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0px;
          margin-bottom: 1px;
          padding: 2px 3px;
          background: rgba(224, 188, 135, 0.06);
          border-radius: 4px;
          border: 1px solid rgba(224, 188, 135, 0.15);
        }

        .security-badge {
          display: flex;
          align-items: center;
          gap: 2px;
        }

        .security-icon {
          font-size: 6px;
          filter: drop-shadow(0 0 6px rgba(224, 188, 135, 0.4));
        }

        .security-title {
          font-size: 5.5px;
          font-weight: 700;
          color: rgba(255, 255, 255, 1);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          line-height: 1;
        }

        .security-policy {
          font-size: 5px;
          color: rgba(224, 188, 135, 0.8);
          line-height: 1.1;
        }

        /* 底部汇总 - 压缩padding */
        .showcase-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2px;
          padding-top: 1px;
          border-top: 1px solid rgba(224, 188, 135, 0.15);
        }

        .footer-badge {
          font-size: 6px;
        }

        .footer-text {
          font-size: 5px;
          color: rgba(224, 188, 135, 0.85);
          letter-spacing: 0.04em;
          line-height: 1;
        }

        /* ═══════════════════════════════════════════════════════════════════
           ⚠️ 排除矩阵：精简对比版 - 压缩版
           ═══════════════════════════════════════════════════════════════════ */
        .exclusion-block {
          width: 100%;
          max-width: 480px;
          margin: 0 0 6px 0;
          padding: 5px 8px;
          background: linear-gradient(135deg,
            rgba(255, 191, 0, 0.03) 0%,
            rgba(20, 25, 35, 0.6) 100%
          );
          border: 1px solid var(--amber);
          border-radius: 6px;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow:
            0 0 16px rgba(255, 191, 0, 0.15),
            0 4px 32px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 191, 0, 0.06);
        }

        .exclusion-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          margin-bottom: 3px;
          padding-bottom: 2px;
          border-bottom: 1px solid rgba(255, 191, 0, 0.2);
        }

        .exclusion-icon {
          font-size: 6px;
          animation: warningPulse 3s ease-in-out infinite;
        }

        @keyframes warningPulse {
          0%, 100% { opacity: 0.85; }
          50% { opacity: 1; }
        }

        .exclusion-title {
          font-size: 5.5px;
          font-weight: 600;
          color: var(--amber);
          font-family: 'SF Mono', 'Monaco', monospace;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .exclusion-compare {
          margin-bottom: 3px;
        }

        .compare-row {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .compare-them {
          display: flex;
          align-items: baseline;
          gap: 4px;
          padding: 3px 6px;
          background: rgba(139, 0, 0, 0.08);
          border: 1px solid rgba(255, 191, 0, 0.2);
          border-radius: 3px;
        }

        .them-label {
          font-size: 5px;
          font-weight: 700;
          color: rgba(255, 180, 180, 0.9);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          flex-shrink: 0;
        }

        .them-text {
          font-size: 5.5px;
          color: rgba(255, 210, 180, 0.8);
          line-height: 1.3;
        }

        .compare-us {
          display: flex;
          align-items: baseline;
          gap: 4px;
          padding: 3px 6px;
          background: rgba(224, 188, 135, 0.08);
          border: 1px solid rgba(224, 188, 135, 0.25);
          border-radius: 3px;
        }

        .us-label {
          font-size: 5px;
          font-weight: 700;
          color: var(--gold);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          flex-shrink: 0;
        }

        .us-text {
          font-size: 5.5px;
          color: rgba(245, 245, 240, 0.9);
          line-height: 1.3;
        }

        .exclusion-statement {
          display: flex;
          align-items: flex-start;
          gap: 4px;
          padding: 3px 6px;
          background: rgba(224, 188, 135, 0.08);
          border: 1px solid rgba(224, 188, 135, 0.2);
          border-radius: 4px;
        }

        .statement-badge {
          font-size: 8px;
          color: var(--gold);
          flex-shrink: 0;
          text-shadow: 0 0 10px rgba(224, 188, 135, 0.4);
        }

        .statement-text {
          font-size: 5.5px;
          line-height: 1.35;
          color: rgba(224, 188, 135, 0.95);
          text-align: left;
        }

        /* ═══════════════════════════════════════════════════════════════════
           🔐 准入协议：时间承诺版 - 横向时间线设计
           ═══════════════════════════════════════════════════════════════════ */
        .access-timeline {
          width: 100%;
          max-width: 480px;
          margin: 0 0 6px 0;
          padding: 5px 8px;
          background: linear-gradient(135deg,
            rgba(224, 188, 135, 0.04) 0%,
            rgba(20, 25, 35, 0.6) 100%
          );
          border: 1px solid rgba(224, 188, 135, 0.2);
          border-radius: 6px;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow:
            0 4px 32px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(224, 188, 135, 0.06);
        }

        .timeline-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          margin-bottom: 4px;
          padding-bottom: 2px;
          border-bottom: 1px solid rgba(224, 188, 135, 0.15);
        }

        .timeline-icon {
          font-size: 6px;
          filter: drop-shadow(0 0 6px rgba(224, 188, 135, 0.3));
        }

        .timeline-title {
          font-size: 6.5px;
          font-weight: 700;
          color: var(--gold-bright);
          font-family: 'SF Mono', 'Monaco', monospace;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-shadow: 0 0 12px rgba(255, 245, 230, 0.3);
        }

        /* 🎯 横向时间线布局 */
        .timeline-promise {
          display: grid;
          grid-template-columns: 1fr auto 1fr auto 1fr;
          align-items: center;
          gap: 4px;
          margin-bottom: 4px;
          padding: 2px 0;
        }

        .promise-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: 4px 6px;
          background: rgba(20, 25, 35, 0.4);
          border: 1px solid rgba(224, 188, 135, 0.15);
          border-radius: 3px;
          transition: all 300ms ease;
          min-width: 0;
        }

        .promise-step:hover {
          transform: scale(1.03);
          border-color: rgba(224, 188, 135, 0.3);
        }

        .promise-step-final {
          border-color: rgba(224, 188, 135, 0.4);
          box-shadow: 0 0 12px rgba(224, 188, 135, 0.2);
          background: rgba(224, 188, 135, 0.08);
        }

        .step-time {
          font-size: 6.5px;
          font-weight: 700;
          color: var(--gold);
          font-family: 'SF Mono', 'Monaco', monospace;
          letter-spacing: 0.06em;
          line-height: 1;
          white-space: nowrap;
        }

        .step-action {
          font-size: 5.5px;
          color: rgba(245, 245, 240, 0.9);
          text-align: center;
          line-height: 1.3;
        }

        /* 横向箭头 */
        .promise-arrow {
          font-size: 8px;
          color: rgba(224, 188, 135, 0.5);
          line-height: 1;
          flex-shrink: 0;
        }

        .timeline-guarantee {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1px;
          margin-bottom: 3px;
          padding: 3px 6px;
          background: rgba(224, 188, 135, 0.06);
          border-radius: 4px;
          border: 1px solid rgba(224, 188, 135, 0.15);
        }

        .guarantee-badge {
          font-size: 5.5px;
          font-weight: 700;
          color: var(--gold);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          line-height: 1.1;
        }

        .guarantee-note {
          font-size: 5px;
          color: rgba(224, 188, 135, 0.75);
          text-align: center;
          line-height: 1.3;
        }

        /* 条款横向排列 */
        .timeline-terms {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3px;
        }

        .term-item {
          display: flex;
          align-items: center;
          gap: 3px;
          padding: 2px 4px;
          background: rgba(20, 25, 35, 0.3);
          border-radius: 2px;
        }

        .term-icon {
          font-size: 6px;
          flex-shrink: 0;
        }

        .term-text {
          font-size: 5px;
          color: rgba(224, 188, 135, 0.75);
          line-height: 1.3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* ═══════════════════════════════════════════════════════════════════
           交互核心区域 - 极致压缩底部
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
          padding-bottom: 4px;
        }

        .interaction-core.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .coverage-notice {
          margin: 0 0 3px 0;
          padding: 0 8px;
          font-size: 6.5px;
          line-height: 1.3;
          color: rgba(224, 188, 135, 0.88);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-weight: 300;
          font-style: italic;
          letter-spacing: 0.015em;
          text-align: center;
          text-shadow: 0 0 15px rgba(224, 188, 135, 0.12);
        }

        .urgency-statement {
          margin: 0 0 4px 0;
          padding: 0 8px;
          font-size: 7px;
          line-height: 1.3;
          color: rgba(255, 252, 245, 0.94);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-weight: 400;
          letter-spacing: 0.01em;
          text-align: center;
          text-shadow: 
            0 1px 8px rgba(224, 188, 135, 0.12),
            0 0 20px rgba(255, 245, 230, 0.06);
        }

        /* ═══════════════════════════════════════════════════════════════════
           倒计时器 - 缩小10%
           ═══════════════════════════════════════════════════════════════════ */
        .countdown-timer {
          margin: 0 0 6px 0;
          padding: 5px 12px;
          color: rgba(255, 255, 255, 0.98);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: scale(0.8);
          transition: all 400ms cubic-bezier(0.23, 1, 0.32, 1);
          background: linear-gradient(135deg,
            rgba(255, 245, 230, 0.12) 0%,
            rgba(224, 188, 135, 0.08) 100%
          );
          border: 2px solid rgba(224, 188, 135, 0.35);
          border-radius: 20px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 
            0 0 40px rgba(224, 188, 135, 0.3),
            0 6px 24px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.08),
            inset 0 0 30px rgba(224, 188, 135, 0.05);
        }

        .countdown-timer.active {
          opacity: 1;
          transform: scale(1);
        }

        .countdown-timer.expired {
          animation: countdownPulse 1.5s ease-in-out infinite;
          border-color: rgba(224, 188, 135, 0.5);
        }

        @keyframes countdownPulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 
              0 4px 20px rgba(0, 0, 0, 0.2),
              0 0 0 0 rgba(224, 188, 135, 0.5);
          }
          50% {
            transform: scale(1.03);
            box-shadow: 
              0 4px 20px rgba(0, 0, 0, 0.2),
              0 0 20px 8px rgba(224, 188, 135, 0.3);
          }
        }

        .countdown-number {
          font-size: 47px;
          line-height: 1;
          font-weight: 400;
          color: var(--gold-bright);
          font-family: 'SF Mono', 'Monaco', 'Consolas', 'Courier New', monospace;
          letter-spacing: 0.05em;
          font-variant-numeric: tabular-nums;
          text-shadow: 
            0 0 35px rgba(255, 245, 230, 0.8),
            0 0 70px rgba(224, 188, 135, 0.6),
            0 0 100px rgba(255, 245, 230, 0.3),
            0 2px 4px rgba(0, 0, 0, 0.3);
          position: relative;
        }

        /* ═══════════════════════════════════════════════════════════════════
           CTA 按钮 - 高级香槟金质感设计
           ═══════════════════════════════════════════════════════════════════ */
        .s1-cta-btn {
          width: 100%;
          max-width: 360px;
          height: 46px;
          margin: 0 auto 4px;
          border-radius: 6px;
          background: linear-gradient(135deg, 
            rgba(224, 188, 135, 0.15) 0%,
            rgba(212, 175, 55, 0.12) 50%,
            rgba(224, 188, 135, 0.15) 100%
          );
          border: 1.5px solid rgba(224, 188, 135, 0.6);
          color: var(--gold-bright);
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: 0.12em;
          cursor: pointer;
          transition: all 400ms cubic-bezier(0.23, 1, 0.32, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          text-transform: uppercase;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.25),
            0 0 60px rgba(224, 188, 135, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1),
            inset 0 -1px 0 rgba(0, 0, 0, 0.3);
        }

        /* 细腻的光泽层 */
        .s1-cta-btn::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 50%;
          background: linear-gradient(to bottom,
            rgba(255, 255, 255, 0.08) 0%,
            transparent 100%
          );
          pointer-events: none;
        }

        /* 悬停扫光效果 */
        .s1-cta-btn::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg,
            transparent 40%,
            rgba(255, 255, 255, 0.15) 50%,
            transparent 60%
          );
          transform: translateX(-100%) translateY(-100%) rotate(45deg);
          transition: transform 800ms ease;
        }

        .s1-cta-btn:hover::before {
          transform: translateX(100%) translateY(100%) rotate(45deg);
        }

        .s1-cta-text {
          color: rgba(255, 250, 240, 1);
          position: relative;
          z-index: 1;
          transition: all 300ms ease;
          text-shadow: 
            0 0 30px rgba(224, 188, 135, 0.6),
            0 0 60px rgba(224, 188, 135, 0.3),
            0 2px 4px rgba(0, 0, 0, 0.4);
          font-weight: 600;
        }

        .s1-cta-arrow {
          color: var(--gold-bright);
          font-size: 18px;
          position: relative;
          z-index: 1;
          transition: all 300ms ease;
          font-weight: 600;
          text-shadow: 
            0 0 25px rgba(224, 188, 135, 0.7),
            0 0 50px rgba(224, 188, 135, 0.4),
            0 2px 4px rgba(0, 0, 0, 0.4);
        }

        /* 紧急状态脉冲 - 优雅的呼吸感 */
        @keyframes pulseDramatic {
          0%, 100% {
            transform: scale(1);
            box-shadow: 
              0 8px 32px rgba(0, 0, 0, 0.25),
              0 0 60px rgba(224, 188, 135, 0.2),
              0 0 0 0 rgba(224, 188, 135, 0.6);
          }
          50% {
            transform: scale(1.015);
            box-shadow: 
              0 12px 48px rgba(0, 0, 0, 0.3),
              0 0 80px rgba(224, 188, 135, 0.4),
              0 0 0 4px rgba(224, 188, 135, 0.2);
          }
        }

        .s1-cta-btn.pulse {
          animation: pulseDramatic 2s ease-in-out infinite;
        }

        .s1-cta-btn.urgent {
          background: linear-gradient(135deg, 
            rgba(224, 188, 135, 0.2) 0%,
            rgba(212, 175, 55, 0.18) 50%,
            rgba(224, 188, 135, 0.2) 100%
          );
          border-color: rgba(224, 188, 135, 0.8);
          box-shadow: 
            0 12px 48px rgba(0, 0, 0, 0.3),
            0 0 80px rgba(224, 188, 135, 0.35),
            inset 0 1px 0 rgba(255, 255, 255, 0.15),
            inset 0 -1px 0 rgba(0, 0, 0, 0.3);
        }

        .s1-cta-btn.urgent .s1-cta-text,
        .s1-cta-btn.urgent .s1-cta-arrow {
          text-shadow: 
            0 0 40px rgba(255, 245, 230, 0.8),
            0 0 80px rgba(224, 188, 135, 0.5),
            0 2px 4px rgba(0, 0, 0, 0.4);
        }

        @media (hover: hover) {
          .s1-cta-btn:hover:not(:disabled) {
            background: linear-gradient(135deg, 
              rgba(224, 188, 135, 0.22) 0%,
              rgba(212, 175, 55, 0.18) 50%,
              rgba(224, 188, 135, 0.22) 100%
            );
            border-color: rgba(224, 188, 135, 0.85);
            box-shadow: 
              0 12px 48px rgba(0, 0, 0, 0.3),
              0 0 80px rgba(224, 188, 135, 0.35),
              inset 0 1px 0 rgba(255, 255, 255, 0.15),
              inset 0 -1px 0 rgba(0, 0, 0, 0.3);
            transform: translateY(-2px);
          }

          .s1-cta-btn:hover:not(:disabled) .s1-cta-text {
            color: rgba(255, 252, 245, 1);
            text-shadow: 
              0 0 40px rgba(255, 245, 230, 0.8),
              0 0 80px rgba(224, 188, 135, 0.5),
              0 2px 4px rgba(0, 0, 0, 0.4);
          }

          .s1-cta-btn:hover:not(:disabled) .s1-cta-arrow {
            transform: translateX(5px);
            color: var(--gold-bright);
            text-shadow: 
              0 0 35px rgba(255, 245, 230, 0.9),
              0 0 70px rgba(224, 188, 135, 0.6),
              0 2px 4px rgba(0, 0, 0, 0.4);
          }
        }

        .s1-cta-btn:active:not(:disabled) {
          transform: translateY(0) scale(0.99);
          box-shadow: 
            0 4px 16px rgba(0, 0, 0, 0.3),
            0 0 40px rgba(224, 188, 135, 0.25),
            inset 0 2px 4px rgba(0, 0, 0, 0.25);
        }

        .s1-cta-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
          animation: none;
          transform: none;
          border-color: rgba(224, 188, 135, 0.3);
          background: linear-gradient(135deg, 
            rgba(224, 188, 135, 0.08) 0%,
            rgba(212, 175, 55, 0.06) 50%,
            rgba(224, 188, 135, 0.08) 100%
          );
        }

        .cta-disclaimer {
          margin: 0 0 3px 0;
          padding: 0 8px;
          font-size: 5.5px;
          line-height: 1.3;
          color: rgba(224, 188, 135, 0.7);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-weight: 400;
          font-style: italic;
          text-align: center;
        }

        .footer-anchor {
          max-width: 400px;
          margin: 0;
          padding: 0 8px 4px;
          font-size: 7px;
          line-height: 1.4;
          color: rgba(245, 240, 230, 0.92);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-weight: 400;
          letter-spacing: 0.01em;
          text-align: center;
          text-shadow: 0 1px 8px rgba(224, 188, 135, 0.08);
        }

        /* ═══════════════════════════════════════════════════════════════════
           响应式适配 - 桌面端优化
           ═══════════════════════════════════════════════════════════════════ */
        
        @media (min-width: 768px) {
          .logo-header {
            padding: 20px 32px;
          }

          .s1-top-label {
            top: 65px;
            font-size: 8px;
            padding: 8px 18px;
          }

          .screen-front-content {
            max-width: 680px;
            padding: 110px var(--spacing-xl) var(--spacing-lg);
          }

          .project-sigil {
            font-size: 18px;
            padding: 12px 24px;
            margin-bottom: var(--spacing-lg);
          }

          .auth-protocol {
            font-size: 13px;
            margin-bottom: var(--spacing-lg);
          }

          .sub-headline-detail {
            font-size: 10px;
            margin-bottom: var(--spacing-xl);
          }

          .what-we-do-section,
          .luxury-showcase,
          .exclusion-block,
          .access-timeline {
            padding: var(--spacing-lg) var(--spacing-xl);
            margin-bottom: var(--spacing-lg);
            max-width: 560px;
          }

          .value-prop-text {
            font-size: 10px;
            margin-bottom: 10px;
          }

          .section-signature {
            font-size: 8.5px;
          }

          .hero-number {
            font-size: 72px;
          }

          .countdown-timer {
            padding: 12px 24px;
            margin-bottom: var(--spacing-lg);
          }

          .countdown-number {
            font-size: 64px;
          }

          .s1-cta-btn {
            height: 52px;
            max-width: 420px;
            font-size: 11px;
          }

          .s1-cta-arrow {
            font-size: 18px;
          }

          .cta-disclaimer {
            font-size: 8px;
          }

          .footer-anchor {
            font-size: 10px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }

          .project-sigil,
          .auth-protocol,
          .interaction-core,
          .countdown-timer,
          .s1-top-label {
            opacity: 1 !important;
            transform: none !important;
          }
        }

        @media (prefers-contrast: high) {
          .s1-cta-btn {
            border-width: 3px;
            border-color: var(--gold-bright);
            background: rgba(224, 188, 135, 0.3);
          }

          .countdown-timer {
            border-width: 3px;
            border-color: var(--gold);
          }

          .what-we-do-section,
          .luxury-showcase,
          .exclusion-block,
          .access-timeline,
          .s1-top-label {
            border-width: 2px;
            border-color: rgba(224, 188, 135, 0.5);
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