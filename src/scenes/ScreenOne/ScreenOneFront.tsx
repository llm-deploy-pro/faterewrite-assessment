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

/* ===================== 轮播数据结构 ===================== */

interface HeroProfile {
  city: string;
  age: number;
  availability: string;
  img: string;
}

const HERO_PROFILES: HeroProfile[] = [
  {
    city: "Miami",
    age: 26,
    availability: "Available tonight",
    img: "/assets/girls/girl-miami.png"
  },
  {
    city: "Los Angeles",
    age: 26,
    availability: "This weekend",
    img: "/assets/girls/girl-la.png"
  },
  {
    city: "New York",
    age: 26,
    availability: "This week",
    img: "/assets/girls/girl-nyc.png"
  }
];

/* ========================================================== */

export default function ScreenOneFront() {
  const startTimeRef = useRef<number>(0);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const [countdown, setCountdown] = useState<number>(15);
  const [countdownStarted, setCountdownStarted] = useState(false);
  
  const [ctaVisible, setCtaVisible] = useState(false);
  const [hasClicked, setHasClicked] = useState(false);
  const [shouldPulse, setShouldPulse] = useState(false);

  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const carouselTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartRef = useRef<number>(0);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      prefersReducedMotion.current = mediaQuery.matches;
    }
  }, []);

  useEffect(() => {
    const nextIndex = (currentSlide + 1) % HERO_PROFILES.length;
    
    [currentSlide, nextIndex].forEach(index => {
      if (!loadedImages.has(index) && !failedImages.has(index)) {
        const img = new Image();
        img.src = HERO_PROFILES[index].img;
        img.onload = () => {
          setLoadedImages(prev => new Set(prev).add(index));
        };
        img.onerror = () => {
          setFailedImages(prev => new Set(prev).add(index));
        };
      }
    });
  }, [currentSlide, loadedImages, failedImages]);

  useEffect(() => {
    if (HERO_PROFILES.length <= 1 || prefersReducedMotion.current) {
      return;
    }

    if (isPaused || isTransitioning) {
      return;
    }

    carouselTimerRef.current = setInterval(() => {
      setIsTransitioning(true);
      const nextIndex = (currentSlide + 1) % HERO_PROFILES.length;
      
      const isDev = window.location.hostname === 'localhost';
      trackEvent(
        `s1car_auto_${nextIndex}`,
        "S1_Carousel_AutoNext",
        {
          index: nextIndex,
          city: HERO_PROFILES[nextIndex].city,
          from_index: currentSlide,
        },
        isDev
      );

      setCurrentSlide(nextIndex);
      
      setTimeout(() => {
        setIsTransitioning(false);
      }, 500);
    }, 3000);

    return () => {
      if (carouselTimerRef.current) {
        clearInterval(carouselTimerRef.current);
      }
    };
  }, [currentSlide, isPaused, isTransitioning]);

  useEffect(() => {
    const isDev = window.location.hostname === 'localhost';
    trackEvent(
      "s1car_imp",
      "S1_Carousel_Impression",
      {
        index: 0,
        city: HERO_PROFILES[0].city,
      },
      isDev
    );
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPaused(document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleManualSlide = useCallback((targetIndex: number) => {
    if (isTransitioning || targetIndex === currentSlide) return;

    setIsTransitioning(true);
    
    const isDev = window.location.hostname === 'localhost';
    trackEvent(
      `s1car_manual_${targetIndex}`,
      "S1_Carousel_Manual",
      {
        from: currentSlide,
        to: targetIndex,
        city: HERO_PROFILES[targetIndex].city,
      },
      isDev
    );

    setCurrentSlide(targetIndex);
    
    if (carouselTimerRef.current) {
      clearInterval(carouselTimerRef.current);
    }

    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  }, [currentSlide, isTransitioning]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStartRef.current - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        const nextIndex = (currentSlide + 1) % HERO_PROFILES.length;
        handleManualSlide(nextIndex);
      } else {
        const prevIndex = (currentSlide - 1 + HERO_PROFILES.length) % HERO_PROFILES.length;
        handleManualSlide(prevIndex);
      }
    }
  }, [currentSlide, handleManualSlide]);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setCountdownStarted(true);
      setCtaVisible(true);
      
      countdownIntervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
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

  useEffect(() => {
    startTimeRef.current = Date.now();

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

  useEffect(() => {
    if (countdown <= 4) {
      setShouldPulse(true);
    }
  }, [countdown]);

  const navigateToNext = useCallback(() => {
    setHasClicked(true);
    setShouldPulse(false);
    
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    
    if (carouselTimerRef.current) {
      clearInterval(carouselTimerRef.current);
      carouselTimerRef.current = null;
    }
    
    try {
      localStorage.setItem('cta_clicked_assessment_49', 'true');
    } catch (error) {
      console.warn('localStorage not available:', error);
    }

    document.documentElement.classList.add('page-leave');
    
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('s1:cta:continue'));
      requestAnimationFrame(() => {
        document.documentElement.classList.remove('page-leave');
        window.scrollTo(0, 0);
      });
    }, 220);
  }, []);

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
        trigger_type: 'user_click',
        countdown_value: countdown,
        time_on_page: timeOnPage,
        current_carousel_city: HERO_PROFILES[currentSlide].city,
      },
      isDev
    );

    navigateToNext();
  }, [hasClicked, countdown, currentSlide, navigateToNext]);

  useEffect(() => {
    if (countdown === 0 && !hasClicked) {
      const isDev = window.location.hostname === 'localhost';
      const timeOnPage = startTimeRef.current > 0 
        ? Math.round((Date.now() - startTimeRef.current) / 1000) 
        : 0;

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

      navigateToNext();
    }
  }, [countdown, hasClicked, navigateToNext]);

  return (
    <section className="screen-front-container">
      <div className="logo-header">
        <Wordmark name="AXIS" href="/" />
      </div>
      
      <div className="s1-top-label">
        <span className="label-text">— VERIFIED NETWORK • MEMBERS ONLY —</span>
      </div>

      <div className="screen-front-content">
        <div 
          className="hero-carousel"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="carousel-top-badge">
            <span className="badge-icon">✓</span>
            <span className="badge-text">VERIFIED ELITE • AVAILABLE NATIONWIDE</span>
          </div>

          <div className="carousel-slides">
            {HERO_PROFILES.map((profile, index) => {
              const isActive = index === currentSlide;
              const isLoaded = loadedImages.has(index);
              const hasFailed = failedImages.has(index);

              return (
                <div
                  key={index}
                  className={`carousel-slide ${isActive ? 'active' : ''} ${isLoaded ? 'loaded' : ''}`}
                >
                  {!isLoaded && !hasFailed && (
                    <div className="slide-placeholder">
                      <div className="shimmer"></div>
                    </div>
                  )}
                  
                  {hasFailed ? (
                    <div className="slide-fallback">
                      <div className="fallback-content">
                        <div className="fallback-icon">🔒</div>
                        <div className="fallback-text">Private profile • Photo hidden</div>
                      </div>
                      <div className="slide-info-floating">
                        <span className="location-pin">📍</span>
                        <span className="location-text">{profile.city}, {profile.age} · {profile.availability}</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <img
                        src={profile.img}
                        alt={`${profile.city} companion`}
                        className="slide-image"
                      />
                      <div className="slide-gradient-premium"></div>
                      
                      <div className="slide-info-floating">
                        <span className="location-pin">📍</span>
                        <span className="location-text">{profile.city}, {profile.age} · {profile.availability}</span>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {HERO_PROFILES.length > 1 && (
            <div className="carousel-indicators-premium">
              {HERO_PROFILES.map((_, index) => (
                <button
                  key={index}
                  className={`indicator-premium ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => handleManualSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="more-available">
          + 21 more verified companions available nationwide this week
        </div>

        <div className="project-sigil">
          STOP CHASING. START CHOOSING.
        </div>
        
        <div className="auth-protocol">
          Pre-screened · Nationwide · This week
        </div>

        <div className="exclusion-block">
          <div className="exclusion-header">
            <span className="exclusion-icon">⚠</span>
            <span className="exclusion-title">Why apps waste your time</span>
          </div>

          <div className="exclusion-compare">
            <div className="compare-row">
              <div className="compare-them">
                <span className="them-label">Apps:</span>
                <span className="them-text">swipe → bots → flakes → ghosted</span>
              </div>
              <div className="compare-us">
                <span className="us-label">Us:</span>
                <span className="us-text">city → verified → book → she shows</span>
              </div>
            </div>
          </div>

          <div className="network-status-bar">
            <span className="status-indicator"></span>
            <span className="status-text">Live: Miami · NYC · LA · Vegas · Dallas · Chicago · ATL · Houston</span>
          </div>
        </div>

        <div className={`interaction-core ${ctaVisible ? 'visible' : ''}`}>
          
          <p className="scarcity-notice">
            <span className="scarcity-number">21 spots left</span> this week · <span className="scarcity-warning">Last week sold out</span>
          </p>

          <div className={`countdown-timer ${countdownStarted ? 'active' : ''} ${shouldPulse ? 'expired' : ''}`}>
            <span className="countdown-label">Auto-continue in</span>
            <span className="countdown-number">{countdown}</span>
            <span className="countdown-unit">sec</span>
          </div>

          <button
            type="button"
            onClick={handleCTAClick}
            disabled={hasClicked}
            className={`s1-cta-btn ${shouldPulse ? 'pulse' : ''} ${shouldPulse ? 'urgent' : ''}`}
            aria-label="See this week's women"
          >
            <span className="s1-cta-text">SEE THIS WEEK'S WOMEN</span>
            <span className="s1-cta-arrow">→</span>
          </button>
          
          <p className="cta-subtext">
            Showing {HERO_PROFILES[currentSlide].city} availability
          </p>

          <p className="social-proof-mini">
            <span className="proof-icon">👥</span>
            2,400+ verified arrangements completed
          </p>

          <p className="cta-disclaimer">
            $49 verification • fully credited toward arrangement • full photos after approval
          </p>

          <p className="security-notice-enhanced">
            <span className="security-icon">🔒</span>
            <span className="security-text">Bank-grade encryption · Zero data retention</span>
          </p>

          <div className="trust-footer">
            <span className="trust-item">🛡️ ID verified</span>
            <span className="trust-divider">·</span>
            <span className="trust-item">💳 Secure payment</span>
            <span className="trust-divider">·</span>
            <span className="trust-item">⚡ Instant access</span>
          </div>

        </div>
      </div>

      {/* @ts-ignore */}
      <style jsx>{`
        :root {
          --bg-primary: #12161f;
          --bg-secondary: #1a1f2a;
          --gold: #e0bc87;
          --gold-bright: #fff5e6;
          --cream: #f5f5f0;
          --amber: rgba(255, 191, 0, 0.45);
          --gold-indicator: #F4D58A;
        }

        :global(html), :global(body) {
          overflow: hidden !important;
          height: 100% !important;
          position: fixed !important;
          width: 100% !important;
        }

        .screen-front-container {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          height: 100dvh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
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

        .logo-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 10px 16px;
          background: linear-gradient(to bottom,
            rgba(18, 22, 31, 0.95) 0%,
            rgba(18, 22, 31, 0.85) 60%,
            transparent 100%
          );
          backdrop-filter: blur(12px);
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
        }

        .s1-top-label {
          position: fixed;
          top: 48px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 90;
          font-size: 7px;
          line-height: 1;
          font-family: 'SF Mono', 'Monaco', monospace;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          opacity: 0;
          animation: topLabelReveal 600ms cubic-bezier(0.23, 1, 0.32, 1) forwards;
          padding: 5px 12px;
          background: rgba(20, 25, 35, 0.6);
          border: 1px solid rgba(224, 188, 135, 0.2);
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }

        .label-text {
          color: rgba(224, 188, 135, 0.95);
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

        .screen-front-content {
          position: relative;
          width: 100%;
          max-width: 600px;
          text-align: center;
          color: var(--cream);
          padding: 20px 10px 0;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .hero-carousel {
          width: 100%;
          max-width: 360px;
          height: 200px;
          position: relative;
          margin: 0 0 5px 0;
          border-radius: 18px;
          overflow: hidden;
          opacity: 0;
          animation: carouselRevealPremium 800ms cubic-bezier(0.23,1,0.32,1) 600ms forwards;
          box-shadow: 
            0 0 0 1px rgba(224, 188, 135, 0.15),
            0 4px 12px rgba(0, 0, 0, 0.25),
            0 8px 24px rgba(0, 0, 0, 0.2),
            0 16px 48px rgba(0, 0, 0, 0.15),
            0 0 60px rgba(224, 188, 135, 0.12),
            inset 0 0 30px rgba(224, 188, 135, 0.03);
          transition: all 600ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        .hero-carousel::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 20px;
          background: linear-gradient(
            135deg,
            rgba(224, 188, 135, 0) 0%,
            rgba(224, 188, 135, 0.4) 25%,
            rgba(255, 245, 230, 0.6) 50%,
            rgba(224, 188, 135, 0.4) 75%,
            rgba(224, 188, 135, 0) 100%
          );
          background-size: 200% 200%;
          animation: borderGlow 4s ease-in-out infinite;
          opacity: 0.8;
          pointer-events: none;
          z-index: 1;
          filter: blur(1px);
        }

        @keyframes borderGlow {
          0%, 100% { 
            background-position: 0% 50%;
            opacity: 0.6;
          }
          50% { 
            background-position: 100% 50%;
            opacity: 1;
          }
        }

        .hero-carousel::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 18px;
          background: 
            radial-gradient(circle at 0% 0%, rgba(255, 245, 230, 0.25) 0%, transparent 15%),
            radial-gradient(circle at 100% 0%, rgba(255, 245, 230, 0.15) 0%, transparent 15%),
            radial-gradient(circle at 0% 100%, rgba(255, 245, 230, 0.15) 0%, transparent 15%),
            radial-gradient(circle at 100% 100%, rgba(255, 245, 230, 0.25) 0%, transparent 15%);
          pointer-events: none;
          z-index: 3;
          opacity: 0.7;
        }

        @keyframes carouselRevealPremium {
          0% {
            opacity: 0;
            transform: scale(0.96) translateY(12px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @media (hover: hover) {
          .hero-carousel:hover {
            transform: scale(1.02);
            box-shadow: 
              0 0 0 2px rgba(224, 188, 135, 0.25),
              0 6px 16px rgba(0, 0, 0, 0.3),
              0 12px 32px rgba(0, 0, 0, 0.25),
              0 24px 64px rgba(0, 0, 0, 0.2),
              0 0 80px rgba(224, 188, 135, 0.2),
              inset 0 0 40px rgba(224, 188, 135, 0.05);
          }

          .hero-carousel:hover::before {
            opacity: 1;
            animation-duration: 3s;
          }
        }

        .carousel-top-badge {
          position: absolute;
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 12px;
          background: linear-gradient(135deg,
            rgba(224, 188, 135, 0.95) 0%,
            rgba(212, 175, 55, 0.9) 100%
          );
          border-radius: 9999px;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 
            0 4px 16px rgba(0, 0, 0, 0.4),
            0 0 30px rgba(224, 188, 135, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.3),
            inset 0 -1px 0 rgba(0, 0, 0, 0.2);
          animation: badgeFloat 3s ease-in-out infinite;
        }

        @keyframes badgeFloat {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-2px); }
        }

        .badge-icon {
          font-size: 9px;
          font-weight: 700;
          color: #1a1f2a;
          text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
        }

        .badge-text {
          font-size: 6.5px;
          font-weight: 700;
          color: #1a1f2a;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-family: 'SF Mono', 'Monaco', monospace;
          text-shadow: 0 1px 2px rgba(255, 255, 255, 0.3);
        }

        .carousel-slides {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .carousel-slide {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 500ms cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: none;
        }

        .carousel-slide.active {
          opacity: 1;
          pointer-events: auto;
        }

        .slide-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .slide-gradient-premium {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 70%;
          background: linear-gradient(to bottom,
            transparent 0%,
            rgba(0, 0, 0, 0.3) 40%,
            rgba(0, 0, 0, 0.75) 100%
          );
          pointer-events: none;
        }

        .slide-info-floating {
          position: absolute;
          bottom: 10px;
          left: 10px;
          right: 10px;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          background: rgba(15, 21, 31, 0.6);
          border-radius: 6px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 0.5px solid rgba(224, 188, 135, 0.15);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          z-index: 2;
        }

        .location-pin {
          font-size: 10px;
          line-height: 1;
          filter: drop-shadow(0 0 8px rgba(224, 188, 135, 0.6));
        }

        .location-text {
          font-size: 11px;
          font-weight: 600;
          color: #ffffff;
          letter-spacing: 0.02em;
          line-height: 1;
          text-shadow: 
            0 0 20px rgba(255, 255, 255, 0.4),
            0 2px 4px rgba(0, 0, 0, 0.6);
        }

        .slide-placeholder {
          width: 100%;
          height: 100%;
          background: #121826;
          position: relative;
          overflow: hidden;
        }

        .shimmer {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(224, 188, 135, 0.1) 50%,
            transparent 100%
          );
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        .slide-fallback {
          width: 100%;
          height: 100%;
          background: #121826;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .fallback-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .fallback-icon {
          font-size: 32px;
          opacity: 0.6;
        }

        .fallback-text {
          font-size: 13px;
          color: rgba(245, 245, 240, 0.7);
        }

        .carousel-indicators-premium {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          gap: 6px;
          z-index: 10;
        }

        .indicator-premium {
          width: 24px;
          height: 3px;
          background: rgba(224, 188, 135, 0.2);
          border: none;
          border-radius: 3px;
          cursor: pointer;
          transition: all 400ms cubic-bezier(0.23, 1, 0.32, 1);
          padding: 0;
          box-shadow: 
            0 2px 8px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .indicator-premium.active {
          background: linear-gradient(135deg,
            #F4D58A 0%,
            #e0bc87 100%
          );
          box-shadow: 
            0 0 16px rgba(244, 213, 138, 0.6),
            0 2px 12px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }

        .indicator-premium:hover:not(.active) {
          background: rgba(244, 213, 138, 0.5);
          box-shadow: 
            0 0 12px rgba(244, 213, 138, 0.4),
            0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .more-available {
          margin: 0 0 5px 0;
          font-size: 10px;
          font-weight: 500;
          color: #F4D58A;
          letter-spacing: 0.02em;
          line-height: 1;
          opacity: 0;
          animation: moreAvailableReveal 600ms cubic-bezier(0.23,1,0.32,1) 1000ms forwards;
        }

        @keyframes moreAvailableReveal {
          0% {
            opacity: 0;
            transform: translateY(5px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .project-sigil {
          margin: 0 0 8px 0;
          padding: 8px 12px;
          font-size: 11px;
          line-height: 1;
          color: rgba(224, 188, 135, 1);
          font-family: 'Bodoni MT', 'Didot', Georgia, serif;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          opacity: 0;
          animation: sigilReveal 800ms cubic-bezier(0.23,1,0.32,1) 1200ms forwards;
          border: 1px solid rgba(224, 188, 135, 0.3);
          border-radius: 4px;
          background: linear-gradient(135deg,
            rgba(224, 188, 135, 0.06) 0%,
            rgba(224, 188, 135, 0.02) 100%
          );
          backdrop-filter: blur(8px);
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

        .auth-protocol {
          margin: 0 0 8px 0;
          font-size: 8px;
          color: rgba(224, 188, 135, 0.85);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          letter-spacing: 0.02em;
          font-weight: 400;
          opacity: 0;
          animation: authFade 600ms cubic-bezier(0.23,1,0.32,1) 1400ms forwards;
          text-shadow: 0 0 20px rgba(224, 188, 135, 0.15);
        }

        @keyframes authFade {
          to { opacity: 1; }
        }

        .exclusion-block {
          width: 100%;
          max-width: 480px;
          margin: 0 0 8px 0;
          padding: 5px 10px;
          background: linear-gradient(135deg,
            rgba(255, 191, 0, 0.03) 0%,
            rgba(20, 25, 35, 0.6) 100%
          );
          border: 1px solid var(--amber);
          border-radius: 6px;
          backdrop-filter: blur(24px);
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
          margin-bottom: 4px;
          padding-bottom: 3px;
          border-bottom: 1px solid rgba(255, 191, 0, 0.2);
        }

        .exclusion-icon {
          font-size: 7px;
          animation: warningPulse 3s ease-in-out infinite;
        }

        @keyframes warningPulse {
          0%, 100% { opacity: 0.85; }
          50% { opacity: 1; }
        }

        .exclusion-title {
          font-size: 7.5px;
          font-weight: 600;
          color: var(--amber);
          font-family: 'SF Mono', 'Monaco', monospace;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .exclusion-compare {
          margin-bottom: 5px;
        }

        .compare-row {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .compare-them {
          display: flex;
          align-items: baseline;
          gap: 5px;
          padding: 3px 8px;
          background: rgba(139, 0, 0, 0.08);
          border: 1px solid rgba(255, 191, 0, 0.2);
          border-radius: 4px;
        }

        .them-label {
          font-size: 7px;
          font-weight: 700;
          color: rgba(255, 180, 180, 0.9);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          flex-shrink: 0;
        }

        .them-text {
          font-size: 8px;
          font-weight: 500;
          color: rgba(255, 210, 180, 0.9);
          line-height: 1.2;
        }

        .compare-us {
          display: flex;
          align-items: baseline;
          gap: 5px;
          padding: 3px 8px;
          background: rgba(224, 188, 135, 0.08);
          border: 1px solid rgba(224, 188, 135, 0.25);
          border-radius: 4px;
        }

        .us-label {
          font-size: 7px;
          font-weight: 700;
          color: var(--gold);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          flex-shrink: 0;
        }

        .us-text {
          font-size: 8px;
          font-weight: 500;
          color: rgba(245, 245, 240, 0.95);
          line-height: 1.2;
        }

        .network-status-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 5px 10px;
          height: 28px;
          background: rgba(15, 21, 31, 0.7);
          border: 0.5px solid rgba(180, 255, 180, 0.2);
          border-radius: 6px;
          backdrop-filter: blur(16px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .status-indicator {
          width: 6px;
          height: 6px;
          background: #4ade80;
          border-radius: 50%;
          animation: statusPulse 2s ease-in-out infinite;
          box-shadow: 0 0 8px rgba(74, 222, 128, 0.6);
          flex-shrink: 0;
        }

        @keyframes statusPulse {
          0%, 100% { 
            opacity: 1; 
            transform: scale(1);
          }
          50% { 
            opacity: 0.6; 
            transform: scale(0.9);
          }
        }

        .status-text {
          font-size: 8px;
          font-weight: 500;
          color: rgba(180, 255, 180, 0.9);
          font-family: 'SF Mono', 'Monaco', monospace;
          letter-spacing: 0.02em;
          line-height: 1;
        }

        .interaction-core {
          opacity: 0;
          transform: translateY(8px);
          transition: all 600ms cubic-bezier(0.23, 1, 0.32, 1);
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .interaction-core.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .scarcity-notice {
          margin: 0 0 5px 0;
          padding: 0 10px;
          font-size: 9px;
          line-height: 1.3;
          color: rgba(224, 188, 135, 0.88);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-weight: 400;
          text-align: center;
        }

        .scarcity-number {
          font-weight: 700;
          font-size: 10px;
          color: #F4D58A;
        }

        .scarcity-warning {
          font-weight: 600;
          color: rgba(255, 180, 180, 0.9);
        }

        .countdown-timer {
          margin: 0 0 5px 0;
          padding: 4px 12px;
          color: rgba(255, 255, 255, 0.98);
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 6px;
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
          box-shadow: 
            0 0 40px rgba(224, 188, 135, 0.3),
            0 6px 24px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
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

        .countdown-label {
          font-size: 8px;
          color: rgba(224, 188, 135, 0.7);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-family: 'SF Mono', 'Monaco', monospace;
        }

        .countdown-number {
          font-size: 28px;
          line-height: 1;
          color: var(--gold-bright);
          font-family: 'SF Mono', 'Monaco', monospace;
          letter-spacing: 0.05em;
          font-variant-numeric: tabular-nums;
          text-shadow: 
            0 0 35px rgba(255, 245, 230, 0.8),
            0 0 70px rgba(224, 188, 135, 0.6),
            0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .countdown-unit {
          font-size: 10px;
          color: rgba(224, 188, 135, 0.8);
          font-family: 'SF Mono', 'Monaco', monospace;
        }

        .s1-cta-btn {
          width: 100%;
          max-width: 360px;
          height: 44px;
          margin: 0 auto 2px;
          border-radius: 6px;
          background: linear-gradient(135deg, 
            rgba(224, 188, 135, 0.15) 0%,
            rgba(212, 175, 55, 0.12) 50%,
            rgba(224, 188, 135, 0.15) 100%
          );
          border: 1.5px solid rgba(224, 188, 135, 0.6);
          color: var(--gold-bright);
          font-size: 10px;
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
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.25),
            0 0 60px rgba(224, 188, 135, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

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
            0 2px 4px rgba(0, 0, 0, 0.4);
        }

        .s1-cta-arrow {
          color: var(--gold-bright);
          font-size: 18px;
          position: relative;
          z-index: 1;
          transition: all 300ms ease;
          text-shadow: 
            0 0 25px rgba(224, 188, 135, 0.7),
            0 2px 4px rgba(0, 0, 0, 0.4);
        }

        @keyframes pulseDramatic {
          0%, 100% {
            transform: scale(1);
            box-shadow: 
              0 8px 32px rgba(0, 0, 0, 0.25),
              0 0 60px rgba(224, 188, 135, 0.2);
          }
          50% {
            transform: scale(1.015);
            box-shadow: 
              0 12px 48px rgba(0, 0, 0, 0.3),
              0 0 80px rgba(224, 188, 135, 0.4);
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
        }

        @media (hover: hover) {
          .s1-cta-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 
              0 12px 48px rgba(0, 0, 0, 0.3),
              0 0 80px rgba(224, 188, 135, 0.35);
          }

          .s1-cta-btn:hover:not(:disabled) .s1-cta-arrow {
            transform: translateX(5px);
          }
        }

        .s1-cta-btn:active:not(:disabled) {
          transform: translateY(0) scale(0.99);
        }

        .s1-cta-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
          animation: none;
        }

        .cta-subtext {
          margin: 0 0 2px 0;
          padding: 0 10px;
          font-size: 9px;
          color: rgba(244, 213, 138, 0.85);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-style: italic;
          text-align: center;
        }

        .social-proof-mini {
          margin: 0 0 2px 0;
          padding: 0 10px;
          font-size: 8px;
          color: rgba(180, 255, 180, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          text-align: center;
        }

        .proof-icon {
          font-size: 9px;
        }

        .cta-disclaimer {
          margin: 0 0 2px 0;
          padding: 0 10px;
          font-size: 7px;
          color: rgba(224, 188, 135, 0.7);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-style: italic;
          text-align: center;
          line-height: 1.4;
        }

        .security-notice-enhanced {
          margin: 0 0 3px 0;
          padding: 0 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          font-size: 8px;
          text-align: center;
        }

        .security-icon {
          font-size: 9px;
          filter: drop-shadow(0 0 8px rgba(180, 255, 180, 0.4));
        }

        .security-text {
          color: rgba(180, 255, 180, 0.85);
          font-family: 'SF Mono', 'Monaco', monospace;
          font-weight: 600;
          letter-spacing: 0.02em;
        }

        .trust-footer {
          margin: 0;
          padding: 0 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 7px;
          color: rgba(224, 188, 135, 0.7);
          text-align: center;
        }

        .trust-item {
          white-space: nowrap;
        }

        .trust-divider {
          opacity: 0.4;
        }

        @media (min-width: 768px) {
          .hero-carousel {
            max-width: 480px;
            height: 280px;
          }

          .carousel-top-badge {
            top: 12px;
            padding: 6px 18px;
          }

          .badge-text {
            font-size: 8px;
          }

          .slide-info-floating {
            bottom: 16px;
            left: 16px;
            right: 16px;
            padding: 8px 14px;
          }

          .location-text {
            font-size: 13px;
          }

          .carousel-indicators-premium {
            top: 16px;
            right: 16px;
            gap: 8px;
          }

          .indicator-premium {
            width: 32px;
            height: 4px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }

          .hero-carousel {
            opacity: 1 !important;
            transform: none !important;
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