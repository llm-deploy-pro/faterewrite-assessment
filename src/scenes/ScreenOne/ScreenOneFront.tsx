// src/scenes/ScreenOne/ScreenOneFront.tsx
import { useEffect, useRef, useState, useCallback } from "react";

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
  duration: number; // 停留时间（毫秒）
}

const HERO_PROFILES: HeroProfile[] = [
  {
    city: "Miami",
    age: 26,
    availability: "available tonight",
    img: "/assets/girls/2.png",
    duration: 5000  // 5秒
  },
  {
    city: "Los Angeles",
    age: 26,
    availability: "this weekend",
    img: "/assets/girls/3.png",
    duration: 3000  // 3秒
  },
  {
    city: "New York",
    age: 26,
    availability: "this week",
    img: "/assets/girls/1.png",
    duration: 3000  // 3秒
  }
];

/* ========================================================== */

export default function ScreenOneFront() {
  const startTimeRef = useRef<number>(0);
  
  const [ctaVisible, setCtaVisible] = useState(false);
  const [hasClicked, setHasClicked] = useState(false);

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

  // 🔧 修复后的图片预加载 - Safari兼容
  useEffect(() => {
    const nextIndex = (currentSlide + 1) % HERO_PROFILES.length;
    
    [currentSlide, nextIndex].forEach(index => {
      if (!loadedImages.has(index) && !failedImages.has(index)) {
        const img = new Image();
        
        // Safari兼容性：添加超时保护
        const loadTimeout = setTimeout(() => {
          console.warn(`[图片加载超时] ${HERO_PROFILES[index].img}`);
          setFailedImages(prev => new Set(prev).add(index));
        }, 8000);
        
        img.onload = () => {
          clearTimeout(loadTimeout);
          setLoadedImages(prev => new Set(prev).add(index));
          console.log(`[图片加载成功] ${HERO_PROFILES[index].img}`);
        };
        
        img.onerror = (error) => {
          clearTimeout(loadTimeout);
          console.error(`[图片加载失败] ${HERO_PROFILES[index].img}`, error);
          setFailedImages(prev => new Set(prev).add(index));
        };
        
        // Safari: 先设置crossOrigin再设置src
        img.crossOrigin = "anonymous";
        img.src = HERO_PROFILES[index].img;
        
        // Safari需要主动检查已完成的图片
        if (img.complete && img.naturalHeight !== 0) {
          clearTimeout(loadTimeout);
          setLoadedImages(prev => new Set(prev).add(index));
        }
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

    const currentDuration = HERO_PROFILES[currentSlide].duration;

    carouselTimerRef.current = setTimeout(() => {
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
    }, currentDuration);

    return () => {
      if (carouselTimerRef.current) {
        clearTimeout(carouselTimerRef.current);
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
      clearTimeout(carouselTimerRef.current);
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
      setCtaVisible(true);
    }, 1500);

    return () => {
      clearTimeout(startTimer);
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

  const navigateToNext = useCallback(() => {
    setHasClicked(true);
    
    if (carouselTimerRef.current) {
      clearTimeout(carouselTimerRef.current);
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
        time_on_page: timeOnPage,
        current_carousel_city: HERO_PROFILES[currentSlide].city,
      },
      isDev
    );

    navigateToNext();
  }, [hasClicked, currentSlide, navigateToNext]);

  return (
    <section className="screen-front-container">
      <div className="s1-top-label">
        <span className="label-verify-icon">✓</span>
        <span className="label-text">REAL PEOPLE • REAL TIME • GUARANTEED</span>
      </div>

      <div className="screen-front-content">
        <div 
          className="hero-carousel"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
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
                      <div className="loading-text">Loading...</div>
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
                        <span className="location-text">{profile.city}</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <img
                        src={profile.img}
                        alt={`${profile.city} companion`}
                        className="slide-image"
                        crossOrigin="anonymous"
                        loading="eager"
                        decoding="async"
                      />
                      <div className="slide-gradient-premium"></div>
                      
                      <div className="slide-info-floating">
                        <div className="info-location">📍 {profile.city}</div>
                        <div className="info-hook">Waiting for you {profile.availability}</div>
                        <div className="info-status">
                          <span className="pulse-dot"></span> Online now
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {HERO_PROFILES.length > 1 && false && (
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

        <h1 className="headline-primary">
          Stop wasting time on people who never show up.
        </h1>

        <h2 className="headline-secondary">
          This is a paid circle. That's exactly why it works. Everyone here is verified, serious, and actually shows up.
        </h2>

        <div className="four-cards-compact">
          <div className="service-card-mini service-card-fantasy">
            <div className="card-title-mini">Real Conversation</div>
            <div className="card-desc-mini">An actual person. An actual hour. No scripts.</div>
          </div>

          <div className="service-card-mini service-card-provider">
            <div className="card-title-mini">Consistent Connection</div>
            <div className="card-desc-mini">Set time. Real presence. Weekly rhythm.</div>
          </div>

          <div className="service-card-mini service-card-action">
            <div className="card-title-mini">Verified Meet-Up</div>
            <div className="card-desc-mini">Public venue. She shows up—guaranteed.</div>
          </div>

          <div className="service-card-mini service-card-custom">
            <div className="card-title-mini">Custom Arrangement</div>
            <div className="card-desc-mini">Discreet. Built for what you want.</div>
          </div>
        </div>

        <div className={`interaction-core ${ctaVisible ? 'visible' : ''}`}>

          <button
            type="button"
            onClick={handleCTAClick}
            disabled={hasClicked}
            className="s1-cta-btn"
            aria-label="Request your invitation"
          >
            <span className="s1-cta-text">REQUEST YOUR INVITATION</span>
            <span className="s1-cta-arrow">→</span>
          </button>
          
          <p className="cta-subtext-line1">
            Investment required. Worth every dollar.
          </p>

          <p className="cta-subtext-line2">
            ⏱ LIMITED AVAILABILITY THIS WEEK
          </p>

          <div className="social-proof-inline">
            "I wasted 6 months on apps. Here? She actually showed up. First time."
            <span className="proof-attr"><span className="proof-verify">✓</span> Real member</span>
          </div>

          <p className="footer-disclaimer">
            Public venues only • Verified identities • Mutual respect required
          </p>

        </div>
      </div>

      {/* @ts-ignore */}
      <style jsx>{`
        :root {
          --bg-primary: #0a0c12;
          --bg-secondary: #12151c;
          --gold: #b8965f;
          --gold-bright: #d4af37;
          --cream: #e8e8e0;
          --slate: #1e2330;
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
          background: radial-gradient(
            ellipse at 50% 30%,
            rgba(20, 15, 10, 0.6) 0%,
            rgba(10, 12, 18, 1) 50%,
            rgba(5, 6, 10, 1) 100%
          );
          overflow: hidden;
          padding: 0;
        }

        .screen-front-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(circle at 30% 20%, rgba(184, 150, 95, 0.03) 0%, transparent 30%),
            radial-gradient(circle at 70% 80%, rgba(212, 175, 55, 0.02) 0%, transparent 25%);
          pointer-events: none;
          z-index: 1;
          opacity: 0.8;
        }

        .screen-front-container::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.015;
          pointer-events: none;
          z-index: 1;
        }

        .s1-top-label {
          position: fixed;
          top: 16px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 90;
          font-size: 7.5px;
          line-height: 1;
          font-family: 'SF Mono', 'Monaco', monospace;
          font-weight: 500;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          opacity: 0;
          animation: topLabelReveal 600ms cubic-bezier(0.23, 1, 0.32, 1) forwards;
          padding: 7px 24px;
          background: rgba(0, 0, 0, 0.7);
          border: 1px solid rgba(184, 150, 95, 0.25);
          border-radius: 20px;
          backdrop-filter: blur(12px);
          width: fit-content;
          min-width: 280px;
          box-shadow: 
            0 2px 8px rgba(0, 0, 0, 0.4),
            0 0 20px rgba(184, 150, 95, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          white-space: nowrap;
        }

        .label-verify-icon {
          color: rgba(100, 180, 100, 0.9);
          font-size: 9px;
          filter: drop-shadow(0 0 4px rgba(100, 180, 100, 0.4));
        }

        .label-text {
          color: rgba(184, 150, 95, 0.9);
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
          padding: 36px 16px 16px;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .hero-carousel {
          width: 100%;
          max-width: 360px;
          height: 220px;
          position: relative;
          margin: 0 0 20px 0;
          border-radius: 16px;
          overflow: hidden;
          opacity: 0;
          animation: carouselRevealPremium 800ms cubic-bezier(0.23,1,0.32,1) 600ms forwards;
          box-shadow: 
            0 0 0 1px rgba(184, 150, 95, 0.15),
            0 4px 16px rgba(0, 0, 0, 0.4),
            0 8px 32px rgba(0, 0, 0, 0.3),
            0 0 40px rgba(184, 150, 95, 0.08);
          transition: all 600ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        .hero-carousel::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 17px;
          background: linear-gradient(
            135deg,
            rgba(184, 150, 95, 0) 0%,
            rgba(184, 150, 95, 0.15) 50%,
            rgba(184, 150, 95, 0) 100%
          );
          background-size: 200% 200%;
          animation: subtleBorderGlow 8s ease-in-out infinite;
          opacity: 0.5;
          pointer-events: none;
          z-index: 1;
        }

        @keyframes subtleBorderGlow {
          0%, 100% { 
            background-position: 0% 50%;
            opacity: 0.3;
          }
          50% { 
            background-position: 100% 50%;
            opacity: 0.6;
          }
        }

        @keyframes carouselRevealPremium {
          0% {
            opacity: 0;
            transform: scale(0.97) translateY(10px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @media (hover: hover) {
          .hero-carousel:hover {
            transform: scale(1.015);
            box-shadow: 
              0 0 0 1px rgba(184, 150, 95, 0.25),
              0 6px 20px rgba(0, 0, 0, 0.5),
              0 12px 40px rgba(0, 0, 0, 0.35),
              0 0 60px rgba(184, 150, 95, 0.12);
          }
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
          -webkit-user-select: none;
          user-select: none;
          -webkit-touch-callout: none;
        }

        .slide-gradient-premium {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 35%;
          background: linear-gradient(to bottom,
            transparent 0%,
            rgba(0, 0, 0, 0.15) 20%,
            rgba(0, 0, 0, 0.45) 70%,
            rgba(0, 0, 0, 0.65) 100%
          );
          pointer-events: none;
        }

        .slide-info-floating {
          position: absolute;
          bottom: 14px;
          left: 14px;
          right: auto;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 14px;
          background: rgba(8, 8, 12, 0.55);
          border-radius: 24px;
          backdrop-filter: blur(28px) saturate(180%);
          -webkit-backdrop-filter: blur(28px) saturate(180%);
          border: 0.5px solid rgba(255, 255, 255, 0.15);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.4),
            0 2px 8px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          z-index: 2;
          max-width: fit-content;
        }

        .info-location {
          font-size: 11px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.98);
          letter-spacing: 0.02em;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
          white-space: nowrap;
          line-height: 1;
        }

        .info-hook {
          display: none;
        }

        .info-status {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          font-weight: 600;
          color: rgba(130, 210, 130, 1);
          text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
          white-space: nowrap;
          line-height: 1;
        }

        .pulse-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: rgba(130, 210, 130, 1);
          display: inline-block;
          animation: gentlePulse 2s ease-in-out infinite;
          box-shadow: 
            0 0 0 2px rgba(130, 210, 130, 0.3),
            0 0 8px rgba(130, 210, 130, 0.7);
        }

        @keyframes gentlePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }

        .slide-placeholder {
          width: 100%;
          height: 100%;
          background: #0f1218;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .shimmer {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(184, 150, 95, 0.08) 50%,
            transparent 100%
          );
          animation: shimmer 2.5s infinite;
        }

        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        .loading-text {
          position: relative;
          z-index: 1;
          font-size: 12px;
          color: rgba(184, 150, 95, 0.6);
          font-weight: 500;
        }

        .slide-fallback {
          width: 100%;
          height: 100%;
          background: #0f1218;
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
          font-size: 28px;
          opacity: 0.5;
        }

        .fallback-text {
          font-size: 12px;
          color: rgba(232, 232, 224, 0.6);
        }

        .carousel-indicators-premium {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          gap: 5px;
          z-index: 10;
        }

        .indicator-premium {
          width: 22px;
          height: 3px;
          background: rgba(184, 150, 95, 0.25);
          border: none;
          border-radius: 3px;
          cursor: pointer;
          transition: all 400ms cubic-bezier(0.23, 1, 0.32, 1);
          padding: 0;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        }

        .indicator-premium.active {
          background: rgba(184, 150, 95, 0.9);
          box-shadow: 
            0 0 12px rgba(184, 150, 95, 0.4),
            0 2px 8px rgba(0, 0, 0, 0.4);
        }

        .indicator-premium:hover:not(.active) {
          background: rgba(184, 150, 95, 0.5);
        }

        .headline-primary {
          width: 100%;
          max-width: 540px;
          margin: 0 0 12px 0;
          font-size: 19px;
          line-height: 1.25;
          font-weight: 700;
          color: rgba(232, 232, 224, 1);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          letter-spacing: -0.01em;
          opacity: 0;
          animation: headlineReveal 800ms cubic-bezier(0.23,1,0.32,1) 1000ms forwards;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
        }

        @keyframes headlineReveal {
          0% {
            opacity: 0;
            transform: translateY(8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .headline-secondary {
          width: 100%;
          max-width: 540px;
          margin: 0 0 18px 0;
          font-size: 10px;
          line-height: 1.4;
          font-weight: 500;
          color: rgba(184, 150, 95, 0.85);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          letter-spacing: 0em;
          opacity: 0;
          animation: headlineReveal 800ms cubic-bezier(0.23,1,0.32,1) 1200ms forwards;
        }

        .four-cards-compact {
          width: 100%;
          max-width: 600px;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          grid-template-rows: repeat(2, 1fr);
          gap: 10px;
          margin: 0 0 20px 0;
          padding: 0;
          opacity: 0;
          animation: headlineReveal 800ms cubic-bezier(0.23,1,0.32,1) 1600ms forwards;
        }

        .service-card-mini {
          padding: 12px 14px;
          border-radius: 8px;
          backdrop-filter: blur(16px);
          box-shadow: 
            0 2px 8px rgba(0, 0, 0, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.02);
          transition: all 400ms cubic-bezier(0.23, 1, 0.32, 1);
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
        }

        .service-card-fantasy {
          background: linear-gradient(135deg,
            rgba(140, 100, 140, 0.06) 0%,
            rgba(80, 60, 100, 0.03) 100%
          );
          border: 1px solid rgba(140, 100, 140, 0.18);
        }

        .service-card-provider {
          background: linear-gradient(135deg,
            rgba(184, 150, 95, 0.06) 0%,
            rgba(140, 115, 75, 0.03) 100%
          );
          border: 1px solid rgba(184, 150, 95, 0.18);
        }

        .service-card-action {
          background: linear-gradient(135deg,
            rgba(180, 100, 80, 0.06) 0%,
            rgba(140, 70, 60, 0.03) 100%
          );
          border: 1px solid rgba(180, 100, 80, 0.18);
          animation: subtleGlow 3s ease-in-out infinite;
        }

        @keyframes subtleGlow {
          0%, 100% { 
            box-shadow: 0 0 8px rgba(180, 100, 80, 0.08);
          }
          50% { 
            box-shadow: 0 0 16px rgba(180, 100, 80, 0.15);
          }
        }

        .service-card-custom {
          background: linear-gradient(135deg,
            rgba(80, 80, 120, 0.06) 0%,
            rgba(60, 60, 90, 0.03) 100%
          );
          border: 1px solid rgba(100, 100, 140, 0.18);
        }

        @media (hover: hover) {
          .service-card-mini:hover {
            transform: translateY(-2px) scale(1.01);
            box-shadow: 
              0 4px 16px rgba(0, 0, 0, 0.3),
              0 0 20px rgba(184, 150, 95, 0.08);
          }

          .service-card-provider:hover {
            transform: translateY(-2px) scale(1.03);
          }
        }

        .card-title-mini {
          margin: 0 0 6px 0;
          font-size: 10.5px;
          font-weight: 700;
          color: rgba(184, 150, 95, 1);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          letter-spacing: 0.02em;
          line-height: 1.2;
        }

        .card-desc-mini {
          margin: 0;
          font-size: 9px;
          line-height: 1.45;
          color: rgba(232, 232, 224, 0.75);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-weight: 400;
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

        .s1-cta-btn {
          width: 100%;
          max-width: 400px;
          height: 48px;
          margin: 0 auto 8px;
          border-radius: 10px;
          background: linear-gradient(135deg, 
            rgba(184, 150, 95, 0.20) 0%,
            rgba(212, 175, 55, 0.16) 50%,
            rgba(184, 150, 95, 0.20) 100%
          );
          border: 2px solid rgba(212, 175, 55, 0.75);
          color: rgba(255, 255, 255, 1);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.15em;
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
          box-shadow: 
            0 0 40px rgba(212, 175, 55, 0.35),
            0 4px 20px rgba(0, 0, 0, 0.45),
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
        }

        .s1-cta-btn::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(90deg, 
            transparent 0%, 
            rgba(255, 255, 255, 0.15) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: ctaShimmer 3s infinite linear;
          opacity: 0;
          transition: opacity 400ms ease;
        }

        @keyframes ctaShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .s1-cta-text {
          color: rgba(255, 255, 255, 1);
          position: relative;
          z-index: 1;
          transition: all 300ms ease;
          text-shadow: 
            0 0 20px rgba(212, 175, 55, 0.6),
            0 2px 6px rgba(0, 0, 0, 0.7);
        }

        .s1-cta-arrow {
          color: rgba(255, 255, 255, 1);
          font-size: 19px;
          position: relative;
          z-index: 1;
          transition: all 300ms ease;
          text-shadow: 
            0 0 20px rgba(212, 175, 55, 0.6),
            0 2px 6px rgba(0, 0, 0, 0.7);
        }

        @media (hover: hover) {
          .s1-cta-btn:hover:not(:disabled) {
            transform: translateY(-3px) scale(1.01);
            background: linear-gradient(135deg, 
              rgba(212, 175, 55, 0.28) 0%,
              rgba(240, 200, 80, 0.22) 50%,
              rgba(212, 175, 55, 0.28) 100%
            );
            border-color: rgba(240, 200, 80, 0.9);
            box-shadow: 
              0 0 60px rgba(212, 175, 55, 0.55),
              0 6px 28px rgba(0, 0, 0, 0.5),
              inset 0 1px 0 rgba(255, 255, 255, 0.2);
          }

          .s1-cta-btn:hover:not(:disabled)::before {
            opacity: 1;
          }

          .s1-cta-btn:hover:not(:disabled) .s1-cta-arrow {
            transform: translateX(6px);
          }
        }

        .s1-cta-btn:active:not(:disabled) {
          transform: translateY(-1px) scale(0.99);
        }

        .s1-cta-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .cta-subtext-line1 {
          margin: 0 0 4px 0;
          padding: 0 10px;
          font-size: 9.5px;
          font-weight: 500;
          color: rgba(184, 150, 95, 0.8);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          text-align: center;
          line-height: 1.3;
        }

        .cta-subtext-line2 {
          margin: 0 0 12px 0;
          padding: 0 10px;
          font-size: 10px;
          font-weight: 600;
          color: rgba(200, 120, 120, 0.9);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          text-align: center;
          line-height: 1.3;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          animation: subtleBlink 3s ease-in-out infinite;
        }

        @keyframes subtleBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        .social-proof-inline {
          width: 100%;
          max-width: 480px;
          margin: 0 0 10px 0;
          padding: 12px 16px;
          background: linear-gradient(135deg,
            rgba(184, 150, 95, 0.06) 0%,
            rgba(0, 0, 0, 0.5) 100%
          );
          border: 1px solid rgba(184, 150, 95, 0.2);
          border-radius: 8px;
          backdrop-filter: blur(12px);
          box-shadow: 
            0 2px 12px rgba(0, 0, 0, 0.3),
            0 0 20px rgba(184, 150, 95, 0.08);
          font-size: 10px;
          line-height: 1.5;
          color: rgba(232, 232, 224, 0.9);
          font-family: Georgia, serif;
          font-style: italic;
          text-align: center;
          transition: all 400ms ease;
        }

        @media (hover: hover) {
          .social-proof-inline:hover {
            border-color: rgba(184, 150, 95, 0.35);
            box-shadow: 
              0 4px 16px rgba(0, 0, 0, 0.35),
              0 0 30px rgba(184, 150, 95, 0.12);
            transform: translateY(-1px);
          }
        }

        .proof-attr {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          margin-top: 5px;
          font-size: 9px;
          color: rgba(184, 150, 95, 0.8);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-style: normal;
          font-weight: 500;
        }

        .proof-verify {
          color: rgba(100, 180, 100, 0.9);
          font-size: 9px;
          filter: drop-shadow(0 0 4px rgba(100, 180, 100, 0.3));
        }

        .footer-disclaimer {
          margin: 0 0 12px 0;
          padding: 0 10px;
          font-size: 7px;
          line-height: 1.4;
          color: rgba(184, 150, 95, 0.5);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-weight: 400;
          text-align: center;
        }

        @media (min-width: 768px) {
          .hero-carousel {
            max-width: 480px;
            height: 280px;
          }

          .s1-top-label {
            font-size: 9px;
            padding: 8px 20px;
          }

          .slide-info-floating {
            bottom: 18px;
            left: 18px;
            right: auto;
            padding: 8px 16px;
          }

          .info-location {
            font-size: 12px;
          }

          .info-hook {
            display: none;
          }

          .info-status {
            font-size: 11px;
          }

          .carousel-indicators-premium {
            top: 14px;
            right: 14px;
            gap: 6px;
          }

          .indicator-premium {
            width: 28px;
            height: 3px;
          }

          .headline-primary {
            font-size: 22px;
          }

          .headline-secondary {
            font-size: 12px;
          }

          .card-title-mini {
            font-size: 11.5px;
          }

          .card-desc-mini {
            font-size: 9.5px;
          }

          .s1-cta-btn {
            height: 50px;
            font-size: 11px;
          }

          .cta-subtext-line1 {
            font-size: 10px;
          }

          .cta-subtext-line2 {
            font-size: 10.5px;
          }

          .social-proof-inline {
            font-size: 11px;
            padding: 14px 18px;
          }

          .proof-attr {
            font-size: 9.5px;
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