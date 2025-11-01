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

const trinityComponents = [
  {
    id: "code-one",
    number: "I",
    name: "ACCESS ONE",
    subtitle: "They Contact You Within 2 Hours.",
    description: "See this week's available women in your city.\nReal photos. Real availability. Real responses.\nFirst-come basis. Standard priority queue.",
    content: "60 seconds after payment, your profile unlocks. The three members who flagged you ($12M / $28M / $50M+) receive notification: \"Mutual visibility confirmed.\"\n\nConcierge initiates introductions within 48-72 hours. Not a DM. A verified request asking when you're available. You review and reply: interested or pass. You don't chase. You respond.",
    primaryColor: "#8A9BA8",
    glowColor: "138, 155, 168",
    textAccent: "#9FB4C4",
  },
  {
    id: "code-two",
    number: "II",
    name: "ACCESS TWO",
    subtitle: "847 Arrangements Completed (90 Days). Priority Matching Every Week.",
    description: "Skip the line. Get matched within 1 hour.\nAccess to premium-tier women (college-educated, professionally established).\nSame-week bookings guaranteed in all major cities.\nConcierge handles logistics. You just show up.",
    content: "You're visible to 847 verified profiles ($5M-$50M+ documented). Every week, 12-18 new members join—all pre-screened. System auto-filters your preferences and pushes matches to your dashboard.\n\nYou see: asset verification, compatibility score, location. You decide: accept or pass. No swiping. No guessing. Curated options delivered weekly. One payment = permanent visibility.",
    primaryColor: "#9B8B9E",
    glowColor: "155, 139, 158",
    textAccent: "#B5A3B8",
  },
  {
    id: "code-three",
    number: "III",
    name: "ACCESS THREE",
    subtitle: "Fully Arranged Lifestyle Experiences Unlocked.",
    description: "The women everyone wants but can't access.\nMulti-day arrangements. Travel companions. Event partners.\nDiscreet. Exclusive. Pre-negotiated terms.\nYour preferences. Our network. Zero rejection.",
    content: "Beyond introductions, you access vetted lifestyle roles through our concierge network:\n\n- Brand events: $30K-$70K per evening (attend, engage, represent)\n- International travel: $100K-$200K for 10-14 days (accompany, enjoy)\n- Partnership structures: $50K-$120K monthly (mutually defined terms)\n\nAll pre-screened, coordinated through concierge. You receive alerts, choose accept or decline. No negotiation required.",
    primaryColor: "#B8956A",
    glowColor: "184, 149, 106",
    textAccent: "#CDA870",
  },
];

const scenarioCards = [
  {
    id: "evening",
    title: "☑️ EVENING COMPANION",
    subtitle: "The date that doesn't waste your time.",
    content: [
      "Dinner at that steakhouse you've been wanting to try.",
      "She arrives on time. Dressed perfectly. Knows how to hold a conversation.",
      "No awkward silences. No \"I have to leave early.\"",
      "Just 3-4 hours of feeling like you're with someone who actually wants to be there.",
      "No fake laugh. No checking the time. No \"I need to get up early.\""
    ],
    meta: {
      perfectFor: "First dates that don't waste your time · Business dinners where you need a plus-one",
      duration: "3-5 hours",
      investment: "$400-$1,200 depending on city"
    }
  },
  {
    id: "weekend",
    title: "☑️ WEEKEND ESCAPE",
    subtitle: "Come back Monday feeling like you actually lived.",
    content: [
      "Friday to Sunday. Different city. Someone who actually texts back.",
      "She meets you at the hotel. No drama. No \"I'm not feeling well.\"",
      "Beach in Miami. Pool parties in Vegas. Hiking in Sedona.",
      "You focus on enjoying yourself. She focuses on making sure you do."
    ],
    meta: {
      perfectFor: "Short trips where you don't want to go alone · Recharging without the usual dating games",
      duration: "2-3 days",
      investment: "$2,000-$5,000 all-inclusive"
    }
  },
  {
    id: "private",
    title: "☑️ PRIVATE TIME",
    subtitle: "No games. No performance. Just honest connection.",
    content: [
      "The arrangement everyone thinks about but nobody talks about.",
      "Your place or hers. No public performance required.",
      "She's there because she chose this. You're there because you're done pretending.",
      "Respectful. Discreet. Exactly what you both agreed to."
    ],
    meta: {
      perfectFor: "Men who are tired of \"maybe next time\" · Situations where honesty is better than games",
      duration: "2-4 hours",
      investment: "$600-$2,500 depending on tier"
    }
  },
  {
    id: "social",
    title: "☑️ SOCIAL PRESENCE",
    subtitle: "She makes you look like you've been winning.",
    content: [
      "Wedding. Work event. Reunion where you need someone impressive.",
      "She shows up looking like she belongs. Acts like she's been doing this for years.",
      "Your colleagues ask where you met. Your ex wonders who she is.",
      "You don't explain. You just enjoy the night."
    ],
    meta: {
      perfectFor: "Events where showing up alone feels like losing · Situations where perception matters",
      duration: "4-8 hours",
      investment: "$800-$2,000 depending on event type"
    }
  },
  {
    id: "extended",
    title: "☑️ EXTENDED ARRANGEMENT",
    subtitle: "Consistency without the 'where is this going?' talk.",
    content: [
      "Week-long. Month-long. However long you want consistency.",
      "Same woman. Regular schedule. No renegotiating every time.",
      "She becomes the person you actually look forward to seeing.",
      "Not a relationship. Not a transaction. Something in between that actually works."
    ],
    meta: {
      perfectFor: "Men who want reliability without commitment · Situations where variety isn't the goal",
      duration: "1 week to 3 months",
      investment: "$5,000-$20,000 depending on frequency and exclusivity"
    }
  }
];

export default function ScreenOneBack() {
  const hasTrackedRef = useRef(false);
  const hasClickedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

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

    setTimeout(() => {
      setShowForm(true);
      setIsLoading(false);
    }, 600);
  };

  const toggleScenario = (scenarioId: string) => {
    setActiveScenario((prev) => {
      const next = prev === scenarioId ? null : scenarioId;
      
      if (next && typeof (window as any).fbq !== "undefined") {
        const frid = ensureFrid();
        const isDev = window.location.hostname === "localhost";
        const dedupeKey = `s1b_sc_${next}`;
        
        if (markOnce(dedupeKey, isDev)) {
          const scenario = scenarioCards.find((s) => s.id === next);
          if (scenario) {
            const eventId = "ev_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
            (window as any).fbq("trackCustom", "S1_Back_Scenario_Expand", {
              scenario_id: next, scenario_title: scenario.title,
              screen_position: "back", screen_number: 1,
              page_url: window.location.href, user_id: frid,
            }, { eventID: eventId });
            console.log(`[打点] 场景卡片展开: ${scenario.title} (${next})`);
          }
        }
      }
      
      return next;
    });
  };

  // 如果显示表单，直接返回表单组件
  if (showForm) {
    return <IntakeForm />;
  }

  return (
    <section className="s1-container">
      <div className={`s1-inner`}>
        <header className={`s1-header ${activeScenario ? 'hidden' : ''}`}>
          <h1 className="s1-title">What Authorization Actually Unlocks</h1>
          <p className="s1-subtitle">Three tiers. Different access. Choose your level.</p>
        </header>

        <div className={`s1-divider ${activeScenario ? 'hidden' : ''}`}></div>

        <div className="s1-codes">
          {trinityComponents.map((pillar, idx) => {
            const isAccessOne = pillar.id === "code-one";
            const shouldHide = isAccessOne && activeScenario;
            
            return (
              <article 
                key={pillar.id} 
                className={`code-card code-card-static ${shouldHide ? 'hidden' : ''}`}
                style={{ animationDelay: `${idx * 0.15}s` }}
              >
                <div className="code-header-static">
                  <div className="code-badge-wrap">
                    <div className="code-badge" style={{
                      backgroundColor: pillar.primaryColor,
                      boxShadow: `0 0 18px rgba(${pillar.glowColor}, 0.5), 0 3px 12px rgba(0, 0, 0, 0.35)`
                    }}>
                      <span className="code-roman">{pillar.number}</span>
                    </div>
                  </div>
                  <div className="code-titles">
                    <h3 className="code-name" style={{ color: pillar.textAccent }}>{pillar.name}</h3>
                    <p className="code-sub">{pillar.subtitle}</p>
                    {pillar.description && (
                      <div className="code-description-enhanced">
                        {pillar.description.split('\n').map((line, i) => (
                          <p key={i} className="code-desc-line">{line}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="s1-divider"></div>

        <section className="s1-scenarios">
          <h2 className="scenarios-title" data-text="WHAT YOU'RE ACTUALLY CHOOSING">WHAT YOU'RE ACTUALLY CHOOSING</h2>
          <div className="scenarios-grid">
            {scenarioCards.map((scenario, idx) => {
              const isActive = activeScenario === scenario.id;
              return (
                <article 
                  key={scenario.id} 
                  className="scenario-card" 
                  style={{ animationDelay: `${1.2 + idx * 0.1}s` }}
                  onClick={() => toggleScenario(scenario.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleScenario(scenario.id);
                    }
                  }}
                  aria-expanded={isActive}
                >
                  <div className="scenario-header">
                    <div className="scenario-title-wrapper">
                      <h4 className="scenario-title">{scenario.title}</h4>
                      {scenario.subtitle && (
                        <p className="scenario-subtitle">{scenario.subtitle}</p>
                      )}
                    </div>
                    <div className={`scenario-icon ${isActive ? "active" : ""}`}>
                      <svg width="9" height="9" viewBox="0 0 9 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.5 1.5L7.5 7.5L1.5 13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  <div className={`scenario-content ${isActive ? "visible" : ""}`}>
                    <div className="scenario-description">
                      {scenario.content.map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                    <div className="scenario-meta">
                      <p><strong>Perfect for:</strong> {scenario.meta.perfectFor}</p>
                      <p><strong>Typical duration:</strong> {scenario.meta.duration}</p>
                      <p><strong>Average investment:</strong> {scenario.meta.investment}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <div className="s1-divider"></div>

        <section className="s1-info-block">
          <h3 className="info-title">WHY WE NEED YOUR INFO FIRST</h3>
          
          <div className="info-timeline">
            <div className="info-section" data-icon="location">
              <p className="info-subtitle">Different cities = different availability</p>
              <p className="info-text">NYC and LA have 10+ options weekly. Smaller cities have 2-3.</p>
            </div>
            
            <div className="info-section" data-icon="budget">
              <p className="info-subtitle">Different budgets = different tiers</p>
              <p className="info-text">$500 gets you dinner. $2,000 gets you the weekend. $10,000 gets you exclusivity.</p>
            </div>
            
            <div className="info-section" data-icon="preferences">
              <p className="info-subtitle">Different types = different women</p>
              <p className="info-text">"Looks-focused" vs "Conversation-focused" vs "Can attend business events" — we match accordingly.</p>
            </div>
            
            <div className="info-section" data-icon="privacy">
              <p className="info-subtitle">We don't publish faces publicly.</p>
              <p className="info-text">Women in this network don't want their photos on a browsable catalog.</p>
              <p className="info-text">They only meet pre-approved men.</p>
              <p className="info-text">That's why we ask first, then show second.</p>
            </div>
          </div>
        </section>

        <div className="s1-divider"></div>

        <section className="s1-cta">
          <button className="cta-btn" onClick={handleClickCTA} disabled={isLoading}>
            <span className="cta-text">
              {isLoading ? "INITIATING..." : "SUBMIT REQUEST — SEE THIS WEEK'S ROSTER"}
            </span>
          </button>
          <p className="cta-meta">
            <span className="cta-price">SUBMIT NOW — ROSTER UPDATES MONDAY 9 AM EST</span><br />
            <span className="cta-urgency">This week's availability is first-come, first-served.</span>
          </p>
        </section>
      </div>

      <style>{`
        /* ===============================================================
           极致压缩版 - 一屏展示所有内容 (738px)
           保留所有文本和板块，仅优化空间
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
          
          /* 神秘金色系统 */
          --gold-primary: #B89D5F;
          --gold-bright: #D4B977;
          --gold-dark: #8B7548;
          
          /* 边框系统 */
          --border-subtle: rgba(255, 255, 255, 0.12);
          --border-medium: rgba(255, 255, 255, 0.18);
          --border-strong: rgba(255, 255, 255, 0.25);
          
          /* 品牌专属色 */
          --accent-oracle: #9FB4C4;
          --accent-siren: #B5A3B8;
          --accent-empress: #CDA870;
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

        /* 分隔线 - 压缩高度 */
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
          transition: all 0.3s ease;
        }

        .s1-divider.hidden {
          height: 0;
          opacity: 0;
          margin: 0;
        }

        /* ============= 标题区 - 可隐藏 ============= */
        .s1-header {
          text-align: center;
          flex-shrink: 0;
          padding: 3px 0 2px;
          opacity: 0;
          animation: fadeIn 0.8s ease-out 0.2s forwards;
          transition: all 0.3s ease;
          max-height: 100px;
          overflow: hidden;
        }

        .s1-header.hidden {
          max-height: 0;
          padding: 0;
          opacity: 0;
          margin: 0;
        }

        .s1-title {
          font-family: 'SF Mono', 'Roboto Mono', 'Courier New', monospace;
          font-size: 11px;
          font-weight: 600;
          line-height: 1.1;
          color: var(--text-hero);
          margin: 0 0 2px 0;
          letter-spacing: 0.01em;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
        }

        .s1-subtitle {
          font-family: 'SF Mono', 'Roboto Mono', 'Courier New', monospace;
          font-size: 7.5px;
          font-weight: 400;
          line-height: 1.2;
          color: var(--text-secondary);
          margin: 0;
          letter-spacing: 0.02em;
        }

        /* ============= CODE卡片区 ============= */
        .s1-codes {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex-shrink: 0;
          padding-top: 4px;
        }

        .code-card-static {
          background: var(--bg-card-dark);
          border: 1px solid rgba(255, 255, 255, 0.22);
          border-radius: 4px;
          overflow: visible;
          opacity: 0;
          animation: fadeIn 0.6s ease-out forwards;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          position: relative;
          box-shadow: 
            0 0 0 1px rgba(138, 155, 168, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.06),
            inset 0 -1px 8px rgba(0, 0, 0, 0.3),
            0 1px 8px rgba(0, 0, 0, 0.3);
          max-height: 200px;
        }

        /* 单个卡片隐藏样式 */
        .code-card-static.hidden {
          max-height: 0;
          opacity: 0;
          margin: 0;
          padding: 0;
          border: none;
          overflow: hidden;
        }

        .code-card-static:nth-child(1) {
          border-color: rgba(159, 180, 196, 0.3);
          box-shadow: 
            0 0 0 1px rgba(138, 155, 168, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.06),
            inset 0 -1px 8px rgba(0, 0, 0, 0.3),
            inset 0 0 12px rgba(138, 155, 168, 0.04),
            0 1px 8px rgba(0, 0, 0, 0.3);
        }

        /* Recommended 徽章 - 缩小 */
        .code-card-static:nth-child(1)::after {
          content: "Recommended";
          position: absolute;
          top: -7px;
          right: 12px;
          background: linear-gradient(90deg, #9FB4C4 0%, #8A9BA8 100%);
          color: #0D1B2A;
          font-size: 6px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 2px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          box-shadow: 
            0 1px 4px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
          z-index: 10;
          transition: opacity 0.3s ease;
        }

        .code-card-static:nth-child(1).hidden::after {
          opacity: 0;
        }

        .code-card-static:nth-child(2) {
          box-shadow: 
            0 0 0 1px rgba(155, 139, 158, 0.18),
            inset 0 1px 0 rgba(255, 255, 255, 0.06),
            inset 0 -1px 8px rgba(0, 0, 0, 0.3),
            inset 0 0 12px rgba(155, 139, 158, 0.04),
            0 1px 8px rgba(0, 0, 0, 0.3);
        }

        .code-card-static:nth-child(3) {
          box-shadow: 
            0 0 0 1px rgba(184, 149, 106, 0.18),
            inset 0 1px 0 rgba(255, 255, 255, 0.06),
            inset 0 -1px 8px rgba(0, 0, 0, 0.3),
            inset 0 0 12px rgba(184, 149, 106, 0.04),
            0 1px 8px rgba(0, 0, 0, 0.3);
        }

        .code-header-static {
          width: 100%;
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 6px 10px 7px 10px;
        }

        .code-badge-wrap {
          flex-shrink: 0;
        }

        .code-badge {
          width: 28px;
          height: 28px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.12);
        }

        .code-roman {
          font-size: 13px;
          font-weight: 800;
          color: #0D1B2A;
          letter-spacing: 0.01em;
          text-shadow: 
            0 1px 0 rgba(255, 255, 255, 0.25),
            0 -1px 0 rgba(0, 0, 0, 0.2);
        }

        .code-titles {
          flex: 1;
          min-width: 0;
        }

        .code-name {
          font-size: 9px;
          font-weight: 700;
          margin: 0 0 2px 0;
          letter-spacing: 0.04em;
          line-height: 1.15;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
        }

        .code-sub {
          font-size: 7px;
          font-weight: 500;
          color: var(--text-secondary);
          margin: 0 0 4px 0;
          line-height: 1.2;
          padding-bottom: 4px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        /* 为 ACCESS TWO (code-two) 的副标题中的数字 847 添加轻微闪烁效果 */
        .code-card-static:nth-child(2) .code-sub {
          animation: subtleGlow 3s ease-in-out infinite;
        }

        @keyframes subtleGlow {
          0%, 100% {
            text-shadow: 0 0 2px rgba(181, 163, 184, 0.3);
          }
          50% {
            text-shadow: 0 0 6px rgba(181, 163, 184, 0.6), 0 0 12px rgba(181, 163, 184, 0.3);
          }
        }

        /* 优化后的说明文字排版 - 极致压缩 */
        .code-description-enhanced {
          margin-top: 4px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .code-desc-line {
          font-size: 6.8px;
          font-weight: 400;
          color: #c8d5e6;
          line-height: 1.35;
          margin: 0;
          padding-left: 6px;
          position: relative;
          letter-spacing: 0;
        }

        /* 添加左侧装饰线 - 缩小版 */
        .code-desc-line::before {
          content: "";
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 2px;
          height: 9px;
          background: linear-gradient(180deg, 
            rgba(159, 180, 196, 0.8) 0%,
            rgba(159, 180, 196, 0.35) 100%
          );
          border-radius: 1px;
          filter: drop-shadow(0 0 1px rgba(159, 180, 196, 0.5));
        }

        /* 第二个卡片的装饰线颜色 */
        .code-card-static:nth-child(2) .code-desc-line::before {
          background: linear-gradient(180deg, 
            rgba(181, 163, 184, 0.8) 0%,
            rgba(181, 163, 184, 0.35) 100%
          );
          filter: drop-shadow(0 0 1px rgba(181, 163, 184, 0.5));
        }

        /* 第三个卡片的装饰线颜色 */
        .code-card-static:nth-child(3) .code-desc-line::before {
          background: linear-gradient(180deg, 
            rgba(205, 168, 112, 0.8) 0%,
            rgba(205, 168, 112, 0.35) 100%
          );
          filter: drop-shadow(0 0 1px rgba(205, 168, 112, 0.5));
        }

        /* 第一行稍微突出 */
        .code-desc-line:first-child {
          font-weight: 500;
          color: #d0dde8;
        }

        /* ============= 场景卡片区 - 优化展开状态 ============= */
        .s1-scenarios {
          flex-shrink: 0;
          opacity: 0;
          animation: fadeIn 0.8s ease-out 1s forwards;
        }

        .scenarios-title {
          font-size: 8px;
          font-weight: 700;
          text-align: center;
          margin: 4px 0 3px 0;
          letter-spacing: 0.1em;
          line-height: 1.1;
          position: relative;
          
          background: linear-gradient(
            180deg,
            #E8D4A0 0%,
            #D4B977 25%,
            #C4A968 50%,
            #B89D5F 75%,
            #9A8350 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          
          filter: 
            drop-shadow(0 0 10px rgba(212, 185, 119, 0.4))
            drop-shadow(0 0 4px rgba(232, 212, 160, 0.6))
            drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
        }

        .scenarios-title::before {
          content: attr(data-text);
          position: absolute;
          left: 0;
          right: 0;
          top: -1px;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.5) 0%,
            transparent 50%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          z-index: 1;
        }

        .scenarios-grid {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .scenario-card {
          background: var(--bg-card-dark);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          overflow: hidden;
          opacity: 0;
          animation: fadeIn 0.6s ease-out forwards;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          position: relative;
          cursor: pointer;
          box-shadow: 
            0 0 0 1px rgba(212, 175, 55, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.06),
            inset 0 -1px 6px rgba(0, 0, 0, 0.25),
            0 1px 6px rgba(0, 0, 0, 0.25);
        }

        .scenario-card:hover {
          border-color: rgba(255, 255, 255, 0.28);
          transform: translateY(-0.5px);
          box-shadow: 
            0 0 0 1px rgba(212, 175, 55, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.08),
            inset 0 -1px 6px rgba(0, 0, 0, 0.25),
            0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .scenario-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 5px 8px;
        }

        .scenario-title-wrapper {
          flex: 1;
          min-width: 0;
        }

        .scenario-title {
          font-size: 8px;
          font-weight: 700;
          color: #d4af37;
          margin: 0 0 2px 0;
          letter-spacing: 0.03em;
          line-height: 1.15;
          text-shadow: 0 0 4px rgba(212, 175, 55, 0.35);
        }

        .scenario-subtitle {
          font-size: 6.5px;
          font-style: italic;
          color: #8995a8;
          margin: 0;
          line-height: 1.25;
          letter-spacing: 0;
          padding-right: 6px;
        }

        .scenario-icon {
          flex-shrink: 0;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          color: rgba(212, 175, 55, 0.6);
        }

        .scenario-card:hover .scenario-icon {
          color: rgba(212, 175, 55, 0.9);
        }

        .scenario-icon svg {
          width: 8px;
          height: 8px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          filter: drop-shadow(0 0 4px rgba(212, 175, 55, 0.4));
        }

        .scenario-icon.active {
          color: rgba(255, 255, 255, 0.75);
        }

        .scenario-icon.active svg {
          transform: rotate(90deg);
          filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.35));
        }

        .scenario-card:hover .scenario-icon svg {
          transform: scale(1.1);
        }

        .scenario-card:hover .scenario-icon.active svg {
          transform: rotate(90deg) scale(1.1);
        }

        .scenario-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                      padding 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .scenario-content.visible {
          max-height: 180px;
          padding: 0 8px 4px;
          transition: max-height 0.45s cubic-bezier(0.16, 1, 0.3, 1),
                      padding 0.35s cubic-bezier(0.16, 1, 0.3, 1) 0.05s;
        }

        .scenario-description p {
          font-size: 6.8px;
          line-height: 1.4;
          color: var(--text-primary);
          margin: 0 0 1.5px 0;
        }

        .scenario-meta {
          margin-top: 3px;
          padding-top: 3px;
          border-top: 1px solid var(--border-subtle);
        }

        .scenario-meta p {
          font-size: 6.2px;
          line-height: 1.35;
          color: #888888;
          margin: 0 0 1px 0;
        }

        .scenario-meta strong {
          color: #a0a0a0;
          font-weight: 600;
        }

        /* ============= Why We Need Info 区块 - 优化间距 ============= */
        .s1-info-block {
          flex-shrink: 0;
          padding: 5px 10px 4px;
          margin-top: 1px;
          position: relative;
          overflow: hidden;
          
          /* 渐变背景 */
          background: linear-gradient(
            135deg,
            rgba(20, 35, 50, 0.9) 0%,
            rgba(13, 27, 42, 0.95) 100%
          );
          
          /* 边框 */
          border: 1px solid rgba(212, 175, 55, 0.15);
          border-radius: 5px;
          
          /* 阴影系统 */
          box-shadow: 
            0 0 0 1px rgba(212, 175, 55, 0.06),
            inset 0 1px 0 rgba(255, 255, 255, 0.03),
            inset 0 -1px 6px rgba(0, 0, 0, 0.25),
            0 2px 10px rgba(0, 0, 0, 0.25);
          
          opacity: 0;
          animation: fadeIn 0.8s ease-out 1.4s forwards;
          backdrop-filter: blur(10px);
        }

        /* 顶部装饰线 */
        .s1-info-block::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(212, 175, 55, 0.25) 20%,
            rgba(212, 175, 55, 0.6) 50%,
            rgba(212, 175, 55, 0.25) 80%,
            transparent 100%
          );
          box-shadow: 0 0 6px rgba(212, 175, 55, 0.3);
        }

        .info-title {
          font-size: 8px;
          font-weight: 700;
          text-align: center;
          margin: 0 0 4px 0;
          line-height: 1.1;
          letter-spacing: 0.08em;
          position: relative;
          
          /* 金属渐变文字 */
          background: linear-gradient(
            180deg,
            #E8D4A0 0%,
            #D4B977 30%,
            #B89D5F 70%,
            #9A8350 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          
          filter: 
            drop-shadow(0 0 8px rgba(212, 185, 119, 0.35))
            drop-shadow(0 0 3px rgba(232, 212, 160, 0.45))
            drop-shadow(0 1px 3px rgba(0, 0, 0, 0.4));
        }

        /* 时间轴容器 */
        .info-timeline {
          position: relative;
          padding-left: 26px;
        }

        /* 左侧垂直连接线 */
        .info-timeline::before {
          content: "";
          position: absolute;
          left: 13px;
          top: 5px;
          bottom: 5px;
          width: 1px;
          background: linear-gradient(
            180deg,
            transparent 0%,
            rgba(212, 175, 55, 0.18) 5%,
            rgba(212, 175, 55, 0.5) 50%,
            rgba(212, 175, 55, 0.18) 95%,
            transparent 100%
          );
          box-shadow: 0 0 3px rgba(212, 175, 55, 0.25);
        }

        /* 信息卡片 */
        .info-section {
          position: relative;
          padding: 3px 6px 3px 8px;
          margin-bottom: 3px;
          background: rgba(20, 35, 50, 0.3);
          border-left: 1.5px solid rgba(212, 175, 55, 0.45);
          border-radius: 3px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .info-section:last-child {
          margin-bottom: 0;
        }

        /* 卡片hover效果 */
        .info-section:hover {
          background: rgba(20, 35, 50, 0.5);
          border-left-color: rgba(212, 175, 55, 0.7);
          transform: translateX(1px);
          box-shadow: 
            -1px 0 6px rgba(212, 175, 55, 0.12),
            inset 0 0 8px rgba(212, 175, 55, 0.04);
        }

        /* 左侧连接圆点 */
        .info-section::before {
          content: "";
          position: absolute;
          left: -17px;
          top: 6px;
          width: 5px;
          height: 5px;
          background: #d4af37;
          border-radius: 50%;
          border: 1px solid rgba(13, 27, 42, 0.7);
          box-shadow: 
            0 0 6px rgba(212, 175, 55, 0.6),
            0 0 12px rgba(212, 175, 55, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.25);
          z-index: 1;
        }

        /* 图标系统 */
        .info-section::after {
          content: "";
          position: absolute;
          left: -30px;
          top: 4px;
          width: 13px;
          height: 13px;
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          opacity: 0.7;
          filter: drop-shadow(0 0 2px rgba(212, 175, 55, 0.35));
        }

        /* 城市图标 */
        .info-section[data-icon="location"]::after {
          background-image: url('data:image/svg+xml;utf8,<svg width="13" height="13" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="7" width="3" height="7" stroke="%23d4af37" stroke-width="1"/><rect x="6.5" y="4" width="3" height="10" stroke="%23d4af37" stroke-width="1"/><rect x="11" y="8" width="3" height="6" stroke="%23d4af37" stroke-width="1"/></svg>');
        }

        /* 钻石图标 */
        .info-section[data-icon="budget"]::after {
          background-image: url('data:image/svg+xml;utf8,<svg width="13" height="13" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2L12 6L8 14L4 6L8 2Z" stroke="%23d4af37" stroke-width="1" fill="none"/><line x1="4" y1="6" x2="12" y2="6" stroke="%23d4af37" stroke-width="1"/></svg>');
        }

        /* 人群图标 */
        .info-section[data-icon="preferences"]::after {
          background-image: url('data:image/svg+xml;utf8,<svg width="13" height="13" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="5" cy="5" r="2" stroke="%23d4af37" stroke-width="1"/><circle cx="11" cy="5" r="2" stroke="%23d4af37" stroke-width="1"/><circle cx="8" cy="11" r="2" stroke="%23d4af37" stroke-width="1"/></svg>');
        }

        /* 盾牌图标 */
        .info-section[data-icon="privacy"]::after {
          background-image: url('data:image/svg+xml;utf8,<svg width="13" height="13" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2L3 4V8C3 11 8 14 8 14C8 14 13 11 13 8V4L8 2Z" stroke="%23d4af37" stroke-width="1" fill="none"/></svg>');
        }

        .info-subtitle {
          font-size: 7px;
          font-weight: 600;
          color: #e8edf2;
          margin: 0 0 2px 0;
          line-height: 1.2;
          letter-spacing: 0.01em;
          position: relative;
          padding-bottom: 2px;
        }

        /* 副标题下方渐变分隔线 */
        .info-subtitle::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          width: 30px;
          height: 1px;
          background: linear-gradient(
            90deg,
            rgba(212, 175, 55, 0.5) 0%,
            rgba(212, 175, 55, 0.25) 70%,
            transparent 100%
          );
        }

        .info-text {
          font-size: 6.5px;
          font-weight: 400;
          color: #b8c5d6;
          line-height: 1.4;
          margin: 0 0 1.5px 0;
          letter-spacing: 0;
        }

        .info-text:last-child {
          margin-bottom: 0;
        }

        /* ============= CTA区 - 优化间距 ============= */
        .s1-cta {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          opacity: 0;
          animation: fadeIn 0.8s ease-out 1.6s forwards;
          padding-top: 1px;
          padding-bottom: 2px;
        }

        .cta-btn {
          width: 100%;
          max-width: 358px;
          height: 42px;
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
          
          border: 1px solid rgba(184, 161, 96, 0.4);
          border-radius: 4px;
          cursor: pointer;
          outline: none;
          overflow: hidden;
          
          box-shadow: 
            inset 0 1px 0 rgba(255, 255, 255, 0.18),
            inset 0 -1px 0 rgba(0, 0, 0, 0.35),
            0 0 18px rgba(184, 161, 96, 0.25),
            0 3px 12px rgba(0, 0, 0, 0.4),
            0 6px 20px rgba(0, 0, 0, 0.35);
          
          transition: all 0.3s ease;
        }

        .cta-btn:hover {
          transform: translateY(-0.5px);
          border-color: rgba(200, 177, 111, 0.55);
          box-shadow: 
            inset 0 1px 0 rgba(255, 255, 255, 0.22),
            inset 0 -1px 0 rgba(0, 0, 0, 0.35),
            0 0 22px rgba(184, 161, 96, 0.35),
            0 4px 14px rgba(0, 0, 0, 0.45),
            0 8px 24px rgba(0, 0, 0, 0.4);
        }

        .cta-btn::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.18) 0%,
            rgba(255, 255, 255, 0.07) 30%,
            transparent 50%,
            rgba(0, 0, 0, 0.12) 80%,
            rgba(0, 0, 0, 0.25) 100%
          );
          opacity: 1;
          pointer-events: none;
          z-index: 1;
        }

        .cta-btn::after {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse 60% 80% at 50% 45%,
            rgba(220, 204, 150, 0.2) 0%,
            rgba(184, 161, 96, 0.08) 40%,
            transparent 70%
          );
          opacity: 1;
          transition: opacity 0.3s ease;
          pointer-events: none;
          z-index: 0;
        }

        .cta-btn:hover::after {
          opacity: 1.25;
        }

        .cta-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .cta-text {
          font-size: 9.5px;
          font-weight: 800;
          letter-spacing: 0.07em;
          color: #DCC896;
          line-height: 1;
          position: relative;
          z-index: 2;
          text-shadow: 
            0 0 10px rgba(220, 200, 150, 0.6),
            0 0 4px rgba(255, 255, 255, 0.4),
            0 2px 6px rgba(0, 0, 0, 0.85),
            0 1px 0 rgba(255, 255, 255, 0.25),
            0 -1px 0 rgba(0, 0, 0, 0.45);
        }

        .cta-meta {
          text-align: center;
          margin: 0;
          line-height: 1.35;
          padding: 0 3px 0;
          min-height: 18px;
        }

        .cta-price {
          font-size: 6.5px;
          font-weight: 700;
          letter-spacing: 0.05em;
          display: block;
          margin-bottom: 1px;
          line-height: 1.2;
          
          background: linear-gradient(
            180deg,
            #E8D4A0 0%,
            #D4B977 50%,
            #B89D5F 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          
          filter: 
            drop-shadow(0 0 6px rgba(212, 185, 119, 0.35))
            drop-shadow(0 0 2px rgba(232, 212, 160, 0.5))
            drop-shadow(0 1px 1.5px rgba(0, 0, 0, 0.45));
        }

        .cta-urgency {
          font-size: 6px;
          color: var(--text-tertiary);
          font-weight: 500;
          letter-spacing: 0;
          display: block;
          line-height: 1.4;
          padding-top: 0;
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
            padding: 8px 0;
          }

          .s1-title {
            font-size: 19px;
          }

          .s1-subtitle {
            font-size: 12px;
          }

          .s1-codes {
            gap: 16px;
            padding-top: 16px;
          }

          .code-header-static {
            padding: 16px 20px 18px 20px;
          }

          .code-badge {
            width: 52px;
            height: 52px;
          }

          .code-roman {
            font-size: 17px;
          }

          .code-name {
            font-size: 14px;
            margin-bottom: 4px;
          }

          .code-sub {
            font-size: 10px;
            margin-bottom: 12px;
            padding-bottom: 12px;
          }

          .code-description-enhanced {
            margin-top: 12px;
            gap: 7px;
          }

          .code-desc-line {
            font-size: 10.5px;
            padding-left: 12px;
          }

          .code-desc-line::before {
            width: 3px;
            height: 14px;
          }

          /* 桌面端Recommended徽章 */
          .code-card-static:nth-child(1)::after {
            top: -12px;
            right: 20px;
            font-size: 9px;
            padding: 4px 12px;
          }

          .scenarios-title {
            font-size: 14px;
          }

          .scenarios-grid {
            gap: 12px;
          }

          .scenario-card {
            padding: 0;
          }

          .scenario-header {
            padding: 12px 16px;
          }

          .scenario-title {
            font-size: 12px;
            margin-bottom: 4px;
          }

          .scenario-subtitle {
            font-size: 9.5px;
            padding-right: 12px;
          }

          .scenario-content.visible {
            max-height: 300px;
            padding: 0 16px 12px;
          }

          .scenario-description p {
            font-size: 10.5px;
            margin-bottom: 3px;
          }

          .scenario-meta {
            margin-top: 8px;
            padding-top: 8px;
          }

          .scenario-meta p {
            font-size: 9.5px;
            margin-bottom: 3px;
          }

          .s1-info-block {
            padding: 28px 24px 24px;
          }

          .info-title {
            font-size: 14px;
            margin-bottom: 24px;
          }

          .info-timeline {
            padding-left: 52px;
          }

          .info-timeline::before {
            left: 24px;
            top: 12px;
            bottom: 12px;
          }

          .info-section {
            padding: 14px 14px 14px 16px;
            margin-bottom: 14px;
          }

          .info-section::before {
            left: -31px;
            top: 18px;
            width: 8px;
            height: 8px;
          }

          .info-section::after {
            left: -56px;
            top: 16px;
            width: 20px;
            height: 20px;
          }

          .info-subtitle {
            font-size: 11px;
            margin-bottom: 8px;
            padding-bottom: 6px;
          }

          .info-subtitle::after {
            width: 60px;
          }

          .info-text {
            font-size: 10px;
            margin-bottom: 4px;
          }

          .s1-cta {
            gap: 12px;
            padding-top: 8px;
          }

          .cta-btn {
            height: 64px;
            max-width: 440px;
          }

          .cta-text {
            font-size: 14px;
          }

          .cta-meta {
            min-height: 32px;
          }

          .cta-price {
            font-size: 10px;
          }

          .cta-urgency {
            font-size: 9px;
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