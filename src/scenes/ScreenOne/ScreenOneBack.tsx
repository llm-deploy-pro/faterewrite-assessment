// src/scenes/ScreenOne/ScreenOneBack.tsx
import { useEffect, useRef, useState } from "react";

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
    name: "CODE ONE",
    subtitle: "Smartest. Least. That's the Glitch.",
    content: "Your Wealth Frequency wasn't broken—just tuned to a channel no one taught you to access. Their playbook said \"prove and push.\" Your code is \"command and receive.\" Dry-land drowning ends here. Switch to your native channel.",
    primaryColor: "#8A9BA8",
    glowColor: "138, 155, 168",
    textAccent: "#9FB4C4",
  },
  {
    id: "code-two",
    number: "II",
    name: "CODE TWO",
    subtitle: "Why The Ones You Wanted Didn't Stay.",
    content: "This is your Magnetic Signature. It decides who orbits and who ejects. \"Perfect on paper\" felt empty; \"impossible\" felt inevitable—now you see why. No fixing. Just frequency match.",
    primaryColor: "#9B8B9E",
    glowColor: "155, 139, 158",
    textAccent: "#B5A3B8",
  },
  {
    id: "code-three",
    number: "III",
    name: "CODE THREE",
    subtitle: "The Moment You Started Living Someone Else's Life.",
    content: "Locate the original distortion: a parent's fear, a teacher's limit, a lover's betrayal. Name the foreign signal. Cut its power. Return the channel to you.",
    primaryColor: "#B8956A",
    glowColor: "184, 149, 106",
    textAccent: "#CDA870",
  },
];

const testimonials = [
  {
    id: "oracle",
    archetype: "ORACLE",
    quote: "I spent 10 years translating my brilliance to keep rooms comfy. My map said: stop translating.",
    author: "L., 33",
    result: "One family office on retainer at 3×. Monaco ⇄ Aspen.",
    shift: "Explaining ➝ Being Sought",
    color: "#9FB4C4",
  },
  {
    id: "siren",
    archetype: "SIREN",
    quote: "They called me 'intimidating.' The frequency showed I was finally visible.",
    author: "V., 28",
    result: "Ended \"secure.\" Now curated and supported. Venice / Côte d'Azur / Madrid.",
    shift: "Apologizing ➝ Being Paid",
    color: "#B5A3B8",
  },
  {
    id: "empress",
    archetype: "EMPRESS",
    quote: "I thought I needed permission. The Empress code: I am the permission.",
    author: "D., 39",
    result: "She approves exhibitions; he funded her foundation; private collection placement.",
    shift: "Asking ➝ Granting",
    color: "#CDA870",
  },
];

export default function ScreenOneBack() {
  const hasTrackedRef = useRef(false);
  const hasClickedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activePillar, setActivePillar] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    if (typeof (window as any).fbq !== "undefined" && markOnce("s1bc", isDev)) {
      const eventId = "ev_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      (window as any).fbq("trackCustom", "S1_Back_CTA_Click", {
        content_name: "ScreenOne_Back_CTA", click_location: "main_cta_button",
        screen_position: "back", screen_number: 1,
        page_url: window.location.href, user_id: frid,
      }, { eventID: eventId });
    }

    setTimeout(() => {
      window.location.href = "https://pay.faterewrite.com/";
    }, 600);
  };

  const togglePillar = (pillarId: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setActivePillar((prev) => {
      const next = prev === pillarId ? null : pillarId;
      if (next && typeof (window as any).fbq !== "undefined") {
        const frid = ensureFrid();
        const isDev = window.location.hostname === "localhost";
        const pillar = trinityComponents.find((p) => p.id === next);
        if (pillar && markOnce(`s1b_pillar_${next}`, isDev)) {
          const eventId = "ev_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
          (window as any).fbq("trackCustom", "S1_Back_Pillar_Expand", {
            pillar_id: next, pillar_name: pillar.name, pillar_number: pillar.number,
            screen_position: "back", screen_number: 1,
            page_url: window.location.href, user_id: frid,
          }, { eventID: eventId });
        }
      }
      return next;
    });
  };

  return (
    <section className="s1-container">
      <div className="s1-inner">
        <header className={`s1-header ${activePillar ? 'hidden' : ''}`}>
          <h1 className="s1-title">What You're About To See Has Been Waiting For You Since Birth.</h1>
          <p className="s1-subtitle">Three codes. Three reasons you've been a stranger in your own timeline.</p>
        </header>

        <div className={`s1-divider ${activePillar ? 'hidden' : ''}`}></div>

        <div className="s1-codes">
          {trinityComponents.map((pillar, idx) => {
            const isActive = activePillar === pillar.id;
            return (
              <article 
                key={pillar.id} 
                className="code-card" 
                style={{ animationDelay: `${idx * 0.15}s` }}
                onClick={() => togglePillar(pillar.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    togglePillar(pillar.id);
                  }
                }}
                aria-expanded={isActive}
              >
                <div className="code-header">
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
                  </div>
                  <div className={`code-icon ${isActive ? "active" : ""}`}>
                    <svg width="9" height="9" viewBox="0 0 9 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1.5 1.5L7.5 7.5L1.5 13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <div className={`code-content ${isActive ? "visible" : ""}`}>
                  <p className="code-desc">{pillar.content}</p>
                </div>
              </article>
            );
          })}
        </div>

        <div className="s1-divider"></div>

        <section className="s1-testimonials">
          <h2 className="testimonials-title" data-text="POWER REDISTRIBUTION, NOT RÉSUMÉS">POWER REDISTRIBUTION, NOT RÉSUMÉS</h2>
          <div className="testimonials-grid">
            {testimonials.map((t, idx) => (
              <article key={t.id} className="testimonial-card" style={{ animationDelay: `${1.2 + idx * 0.2}s` }}>
                <div className="t-header">
                  <span className="t-archetype" style={{ color: t.color }}>{t.archetype}</span>
                </div>
                <blockquote className="t-quote">"{t.quote}"</blockquote>
                <p className="t-author">— {t.author}</p>
                <div className="t-meta">
                  <div className="t-item">
                    <span className="t-label">AFTER:</span> <span className="t-value">{t.result}</span>
                  </div>
                  <div className="t-item">
                    <span className="t-label">SHIFT:</span> <span className="t-shift-val">{t.shift}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="s1-divider"></div>

        <section className="s1-guarantee">
          <h2 className="guarantee-title">Soul-Recognition Pact</h2>
          <p className="guarantee-text">
            If your Map doesn't make you whisper, <em>"So that's what that was..."</em> — 
            if it doesn't name a truth you've carried in silence — we failed. Not you. 
            <span className="guarantee-terms">Email within 7 days. $47 returns instantly.</span>
          </p>
        </section>

        <div className="s1-cta">
          <button className="cta-btn" onClick={handleClickCTA} disabled={isLoading}>
            <span className="cta-text">
              {isLoading ? "INITIATING..." : "YES — SHOW ME WHAT I'VE BEEN MISSING"}
            </span>
          </button>
          <p className="cta-meta">
            <span className="cta-price">$47 | INSTANT ACCESS | YOUR SLOT IS LIVE</span><br />
            <span className="cta-urgency">Your calibration window: open. Session #{Math.floor(Math.random() * 9000) + 1000}. Closes when you leave.</span>
          </p>
        </div>
      </div>

      <style>{`
        /* ===============================================================
           神秘权威版 - 五分神秘 + 五分权威
           色彩平衡：冷峻专业 + 暗黑奢华
           =============================================================== */
        
        :root {
          /* 背景系统 */
          --bg-primary: #0D1B2A;
          --bg-card-dark: rgba(20, 35, 50, 0.85);      /* 更深沉 */
          --bg-card-light: rgba(20, 35, 50, 0.4);
          
          /* 高端文字颜色系统 */
          --text-hero: #FFFFFF;
          --text-primary: #E8EDF2;                     /* 冷白 */
          --text-secondary: #B8C5D6;                   /* 冷银灰 */
          --text-tertiary: #8995A8;                    /* 冷蓝灰 */
          --text-muted: #5D6B7E;                       /* 深雾蓝 */
          
          /* 神秘金色系统 - 压低饱和度 */
          --gold-primary: #B89D5F;                     /* 暗金 */
          --gold-bright: #D4B977;                      /* 柔金 */
          --gold-dark: #8B7548;                        /* 深铜金 */
          
          /* 边框系统 - 增强可见度 */
          --border-subtle: rgba(255, 255, 255, 0.12);  /* ↑ 从0.08 */
          --border-medium: rgba(255, 255, 255, 0.18);  /* ↑ 从0.12 */
          --border-strong: rgba(255, 255, 255, 0.25);  /* 新增：强边框 */
          
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
          max-width: 375px;
          margin: 0 auto;
          padding: 7px 12px 11px;
          display: flex;
          flex-direction: column;
          gap: 3px;
          box-sizing: border-box;
          overflow: hidden;
        }

        /* 分隔线 - 硬朗锐利 */
        .s1-divider {
          height: 1px;
          background: linear-gradient(
            90deg, 
            transparent 0%, 
            var(--border-medium) 50%,
            transparent 100%
          );
          margin: 1px 0;
          flex-shrink: 0;
          opacity: 1;
          box-shadow: 0 0 4px rgba(255, 255, 255, 0.1);
          transition: 
            opacity 0.2s cubic-bezier(0.4, 0, 1, 1) 0.05s,
            height 0.25s cubic-bezier(0.4, 0, 1, 1) 0.1s,
            margin 0.25s cubic-bezier(0.4, 0, 1, 1) 0.1s;
        }

        .s1-divider.hidden {
          height: 0;
          margin: 0;
          opacity: 0;
          transition: 
            height 0.25s cubic-bezier(0.4, 0, 0.6, 1),
            margin 0.25s cubic-bezier(0.4, 0, 0.6, 1),
            opacity 0.2s cubic-bezier(0.4, 0, 0.6, 1) 0.05s;
        }

        /* ============= 标题区 ============= */
        .s1-header {
          text-align: center;
          flex-shrink: 0;
          padding: 2px 0;
          opacity: 0;
          animation: fadeIn 0.8s ease-out 0.2s forwards;
          max-height: 60px;
          overflow: hidden;
          transition: 
            opacity 0.2s cubic-bezier(0.4, 0, 1, 1),
            max-height 0.3s cubic-bezier(0.4, 0, 1, 1) 0.05s,
            padding 0.3s cubic-bezier(0.4, 0, 1, 1) 0.05s;
        }

        .s1-header.hidden {
          max-height: 0;
          padding: 0;
          opacity: 0;
          margin: 0;
          transition: 
            max-height 0.3s cubic-bezier(0.4, 0, 0.6, 1),
            padding 0.3s cubic-bezier(0.4, 0, 0.6, 1),
            opacity 0.2s cubic-bezier(0.4, 0, 0.6, 1) 0.1s;
        }

        .s1-title {
          font-family: 'SF Mono', 'Roboto Mono', 'Courier New', monospace;
          font-size: 12.5px;
          font-weight: 600;
          line-height: 1.4;
          color: var(--text-hero);
          margin: 0 0 3px 0;
          letter-spacing: 0.02em;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }

        .s1-subtitle {
          font-family: 'SF Mono', 'Roboto Mono', 'Courier New', monospace;
          font-size: 8.2px;
          font-weight: 400;
          line-height: 1.45;
          color: var(--text-secondary);
          margin: 0;
          letter-spacing: 0.03em;
        }

        /* ============= CODE卡片 - 专业边框 ============= */
        .s1-codes {
          display: flex;
          flex-direction: column;
          gap: 3px;
          flex-shrink: 0;
        }

        .code-card {
          background: var(--bg-card-dark);
          border: 1px solid rgba(255, 255, 255, 0.22);
          border-radius: 6px;
          overflow: hidden;
          opacity: 0;
          animation: fadeIn 0.6s ease-out forwards;
          backdrop-filter: blur(12px);
          transition: all 0.3s ease;
          position: relative;
          cursor: pointer;
          box-shadow: 
            0 0 0 1px rgba(138, 155, 168, 0.15),      /* 品牌色外边框（蓝） */
            inset 0 1px 0 rgba(255, 255, 255, 0.08),  /* 顶部内高光 */
            inset 0 -1px 12px rgba(0, 0, 0, 0.4),     /* 底部内阴影 */
            0 2px 12px rgba(0, 0, 0, 0.35),           /* 外阴影 */
            0 4px 24px rgba(0, 0, 0, 0.2);            /* 深层阴影 */
        }

        .code-card:nth-child(1) {
          box-shadow: 
            0 0 0 1px rgba(138, 155, 168, 0.2),       /* ORACLE蓝 */
            inset 0 1px 0 rgba(255, 255, 255, 0.08),
            inset 0 -1px 12px rgba(0, 0, 0, 0.4),
            inset 0 0 20px rgba(138, 155, 168, 0.05), /* 品牌色内发光 */
            0 2px 12px rgba(0, 0, 0, 0.35),
            0 4px 24px rgba(0, 0, 0, 0.2);
        }

        .code-card:nth-child(2) {
          box-shadow: 
            0 0 0 1px rgba(155, 139, 158, 0.2),       /* SIREN紫 */
            inset 0 1px 0 rgba(255, 255, 255, 0.08),
            inset 0 -1px 12px rgba(0, 0, 0, 0.4),
            inset 0 0 20px rgba(155, 139, 158, 0.05),
            0 2px 12px rgba(0, 0, 0, 0.35),
            0 4px 24px rgba(0, 0, 0, 0.2);
        }

        .code-card:nth-child(3) {
          box-shadow: 
            0 0 0 1px rgba(184, 149, 106, 0.2),       /* EMPRESS金 */
            inset 0 1px 0 rgba(255, 255, 255, 0.08),
            inset 0 -1px 12px rgba(0, 0, 0, 0.4),
            inset 0 0 20px rgba(184, 149, 106, 0.05),
            0 2px 12px rgba(0, 0, 0, 0.35),
            0 4px 24px rgba(0, 0, 0, 0.2);
        }

        .code-card:hover {
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }

        .code-card:active {
          transform: translateY(0);
        }

        .code-card:nth-child(1):hover {
          box-shadow: 
            0 0 0 1px rgba(138, 155, 168, 0.35),
            inset 0 1px 0 rgba(255, 255, 255, 0.12),
            inset 0 -1px 12px rgba(0, 0, 0, 0.4),
            inset 0 0 24px rgba(138, 155, 168, 0.08),
            0 4px 16px rgba(0, 0, 0, 0.4),
            0 8px 32px rgba(0, 0, 0, 0.25);
        }

        .code-card:nth-child(2):hover {
          box-shadow: 
            0 0 0 1px rgba(155, 139, 158, 0.35),
            inset 0 1px 0 rgba(255, 255, 255, 0.12),
            inset 0 -1px 12px rgba(0, 0, 0, 0.4),
            inset 0 0 24px rgba(155, 139, 158, 0.08),
            0 4px 16px rgba(0, 0, 0, 0.4),
            0 8px 32px rgba(0, 0, 0, 0.25);
        }

        .code-card:nth-child(3):hover {
          box-shadow: 
            0 0 0 1px rgba(184, 149, 106, 0.35),
            inset 0 1px 0 rgba(255, 255, 255, 0.12),
            inset 0 -1px 12px rgba(0, 0, 0, 0.4),
            inset 0 0 24px rgba(184, 149, 106, 0.08),
            0 4px 16px rgba(0, 0, 0, 0.4),
            0 8px 32px rgba(0, 0, 0, 0.25);
        }

        .code-header {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 8px 11px;
        }

        .code-badge-wrap {
          flex-shrink: 0;
        }

        .code-badge {
          width: 32px;
          height: 32px;
          border-radius: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .code-card:hover .code-badge {
          transform: scale(1.05);
        }

        .code-roman {
          font-size: 14px;
          font-weight: 800;
          color: #0D1B2A;
          letter-spacing: 0.02em;
          text-shadow: 
            0 1px 0 rgba(255, 255, 255, 0.3),
            0 -1px 0 rgba(0, 0, 0, 0.2);
        }

        .code-titles {
          flex: 1;
          min-width: 0;
        }

        .code-name {
          font-size: 10.5px;
          font-weight: 700;
          margin: 0 0 1.5px 0;
          letter-spacing: 0.06em;
          line-height: 1.2;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
        }

        .code-sub {
          font-size: 7.8px;
          font-weight: 400;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.3;
        }

        .code-icon {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .code-icon svg {
          width: 9px;
          height: 9px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* CODE ONE - 蓝色 */
        .code-card:nth-child(1) .code-icon {
          color: rgba(159, 180, 196, 0.65);
        }

        .code-card:nth-child(1):hover .code-icon {
          color: rgba(159, 180, 196, 0.95);
        }

        .code-card:nth-child(1) .code-icon svg {
          filter: drop-shadow(0 0 6px rgba(159, 180, 196, 0.5));
        }

        .code-card:nth-child(1):hover .code-icon svg {
          filter: drop-shadow(0 0 10px rgba(159, 180, 196, 0.7));
        }

        /* CODE TWO - 紫色 */
        .code-card:nth-child(2) .code-icon {
          color: rgba(181, 163, 184, 0.65);
        }

        .code-card:nth-child(2):hover .code-icon {
          color: rgba(181, 163, 184, 0.95);
        }

        .code-card:nth-child(2) .code-icon svg {
          filter: drop-shadow(0 0 6px rgba(181, 163, 184, 0.5));
        }

        .code-card:nth-child(2):hover .code-icon svg {
          filter: drop-shadow(0 0 10px rgba(181, 163, 184, 0.7));
        }

        /* CODE THREE - 金色 */
        .code-card:nth-child(3) .code-icon {
          color: rgba(205, 168, 112, 0.65);
        }

        .code-card:nth-child(3):hover .code-icon {
          color: rgba(205, 168, 112, 0.95);
        }

        .code-card:nth-child(3) .code-icon svg {
          filter: drop-shadow(0 0 6px rgba(205, 168, 112, 0.5));
        }

        .code-card:nth-child(3):hover .code-icon svg {
          filter: drop-shadow(0 0 10px rgba(205, 168, 112, 0.7));
        }

        /* 展开状态 */
        .code-icon.active {
          color: rgba(255, 255, 255, 0.8);
        }

        .code-icon.active svg {
          transform: rotate(90deg);
          filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.4));
        }

        /* hover时微妙缩放 */
        .code-card:hover .code-icon svg {
          transform: scale(1.15);
        }

        .code-card:hover .code-icon.active svg {
          transform: rotate(90deg) scale(1.15);
        }

        .code-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                      padding 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .code-content.visible {
          max-height: 200px;
          padding: 0 11px 9px;
          transition: max-height 0.5s cubic-bezier(0.16, 1, 0.3, 1),
                      padding 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.05s;
        }

        .code-desc {
          font-size: 8.2px;
          line-height: 1.5;
          color: var(--text-secondary);
          margin: 0;
        }

        /* ============= 案例区 - 专业边框 ============= */
        .s1-testimonials {
          flex-shrink: 0;
          opacity: 0;
          animation: fadeIn 0.8s ease-out 1s forwards;
        }

        .testimonials-title {
          font-size: 10px;
          font-weight: 700;
          text-align: center;
          margin: 0 0 5px 0;
          letter-spacing: 0.12em;
          line-height: 1.3;
          position: relative;
          
          /* 金属渐变文字 */
          background: linear-gradient(
            180deg,
            #E8D4A0 0%,      /* 高光金 */
            #D4B977 25%,     /* 亮金 */
            #C4A968 50%,     /* 中金 */
            #B89D5F 75%,     /* 暗金 */
            #9A8350 100%     /* 深铜 */
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          
          /* 多层发光系统 */
          filter: 
            drop-shadow(0 0 16px rgba(212, 185, 119, 0.5))      /* 外发光层1 */
            drop-shadow(0 0 6px rgba(232, 212, 160, 0.7))       /* 外发光层2 */
            drop-shadow(0 3px 6px rgba(0, 0, 0, 0.6))           /* 底部阴影 */
            drop-shadow(0 1px 0 rgba(255, 255, 255, 0.3));      /* 顶部高光线 */
        }

        .testimonials-title::before {
          content: attr(data-text);
          position: absolute;
          left: 0;
          right: 0;
          top: -1px;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.6) 0%,
            transparent 50%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          z-index: 1;
        }

        .testimonials-grid {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .testimonial-card {
          background: var(--bg-card-dark);
          border: 1px solid rgba(255, 255, 255, 0.22);
          border-radius: 6px;
          padding: 8px 10px;
          opacity: 0;
          animation: fadeIn 0.6s ease-out forwards;
          backdrop-filter: blur(12px);
          transition: all 0.3s ease;
          position: relative;
          box-shadow: 
            0 0 0 1px rgba(159, 180, 196, 0.18),       /* 默认品牌色外框 */
            inset 0 1px 0 rgba(255, 255, 255, 0.08),   /* 顶部内高光 */
            inset 0 -1px 10px rgba(0, 0, 0, 0.35),     /* 底部内阴影 */
            0 2px 10px rgba(0, 0, 0, 0.3),             /* 外阴影 */
            0 4px 20px rgba(0, 0, 0, 0.18);            /* 深层阴影 */
        }

        /* ORACLE - 蓝色系 */
        .testimonials-grid article:nth-child(1) {
          border-color: rgba(159, 180, 196, 0.25);
          box-shadow: 
            0 0 0 1px rgba(159, 180, 196, 0.22),
            inset 0 1px 0 rgba(255, 255, 255, 0.08),
            inset 0 -1px 10px rgba(0, 0, 0, 0.35),
            inset 0 0 16px rgba(159, 180, 196, 0.06),  /* 品牌色内发光 */
            0 2px 10px rgba(0, 0, 0, 0.3),
            0 4px 20px rgba(0, 0, 0, 0.18);
        }

        .testimonials-grid article:nth-child(1):hover {
          border-color: rgba(159, 180, 196, 0.35);
          box-shadow: 
            0 0 0 1px rgba(159, 180, 196, 0.32),
            inset 0 1px 0 rgba(255, 255, 255, 0.12),
            inset 0 -1px 10px rgba(0, 0, 0, 0.35),
            inset 0 0 20px rgba(159, 180, 196, 0.1),
            0 4px 14px rgba(0, 0, 0, 0.35),
            0 8px 28px rgba(0, 0, 0, 0.22);
        }

        /* SIREN - 紫色系 */
        .testimonials-grid article:nth-child(2) {
          border-color: rgba(181, 163, 184, 0.25);
          box-shadow: 
            0 0 0 1px rgba(181, 163, 184, 0.22),
            inset 0 1px 0 rgba(255, 255, 255, 0.08),
            inset 0 -1px 10px rgba(0, 0, 0, 0.35),
            inset 0 0 16px rgba(181, 163, 184, 0.06),
            0 2px 10px rgba(0, 0, 0, 0.3),
            0 4px 20px rgba(0, 0, 0, 0.18);
        }

        .testimonials-grid article:nth-child(2):hover {
          border-color: rgba(181, 163, 184, 0.35);
          box-shadow: 
            0 0 0 1px rgba(181, 163, 184, 0.32),
            inset 0 1px 0 rgba(255, 255, 255, 0.12),
            inset 0 -1px 10px rgba(0, 0, 0, 0.35),
            inset 0 0 20px rgba(181, 163, 184, 0.1),
            0 4px 14px rgba(0, 0, 0, 0.35),
            0 8px 28px rgba(0, 0, 0, 0.22);
        }

        /* EMPRESS - 金色系 */
        .testimonials-grid article:nth-child(3) {
          border-color: rgba(205, 168, 112, 0.25);
          box-shadow: 
            0 0 0 1px rgba(205, 168, 112, 0.22),
            inset 0 1px 0 rgba(255, 255, 255, 0.08),
            inset 0 -1px 10px rgba(0, 0, 0, 0.35),
            inset 0 0 16px rgba(205, 168, 112, 0.06),
            0 2px 10px rgba(0, 0, 0, 0.3),
            0 4px 20px rgba(0, 0, 0, 0.18);
        }

        .testimonials-grid article:nth-child(3):hover {
          border-color: rgba(205, 168, 112, 0.35);
          box-shadow: 
            0 0 0 1px rgba(205, 168, 112, 0.32),
            inset 0 1px 0 rgba(255, 255, 255, 0.12),
            inset 0 -1px 10px rgba(0, 0, 0, 0.35),
            inset 0 0 20px rgba(205, 168, 112, 0.1),
            0 4px 14px rgba(0, 0, 0, 0.35),
            0 8px 28px rgba(0, 0, 0, 0.22);
        }

        .t-header {
          margin-bottom: 4px;
        }

        .t-archetype {
          font-size: 7.8px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-shadow: 0 0 6px currentColor;
        }

        .t-quote {
          font-size: 8.3px;
          line-height: 1.45;
          color: var(--text-primary);
          margin: 0 0 3px 0;
          font-style: italic;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .t-author {
          font-size: 6.8px;
          color: var(--text-muted);
          margin: 0 0 5px 0;
          font-weight: 500;
        }

        .t-meta {
          display: flex;
          flex-direction: column;
          gap: 3px;
          padding-top: 4px;
          border-top: 1px solid var(--border-subtle);
        }

        .t-item {
          font-size: 7.3px;
          line-height: 1.4;
        }

        .t-label {
          font-weight: 700;
          color: var(--text-tertiary);
          letter-spacing: 0.05em;
        }

        .t-value {
          color: var(--text-secondary);
        }

        .t-shift-val {
          color: var(--gold-bright);
          font-weight: 700;
          letter-spacing: 0.02em;
          text-shadow: 0 0 6px rgba(212, 185, 119, 0.25);
        }

        /* ============= 保证区 - 轻边框 ============= */
        .s1-guarantee {
          flex-shrink: 0;
          padding: 7px 11px;
          background: var(--bg-card-light);
          border: 1px solid var(--border-subtle);
          border-radius: 6px;
          opacity: 0;
          animation: fadeIn 0.8s ease-out 1.4s forwards;
          backdrop-filter: blur(10px);
        }

        .guarantee-title {
          font-size: 9.5px;
          font-weight: 700;
          text-align: center;
          margin: 0 0 3px 0;
          line-height: 1.2;
          letter-spacing: 0.05em;
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
            drop-shadow(0 0 10px rgba(212, 185, 119, 0.35))
            drop-shadow(0 0 4px rgba(232, 212, 160, 0.5))
            drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))
            drop-shadow(0 1px 0 rgba(255, 255, 255, 0.2));
        }

        .guarantee-text {
          font-size: 7.3px;
          line-height: 1.45;
          color: var(--text-secondary);
          margin: 0;
          text-align: center;
        }

        .guarantee-text em {
          color: var(--text-primary);
          font-style: italic;
          font-weight: 500;
        }

        .guarantee-terms {
          display: block;
          margin-top: 3px;
          color: var(--text-tertiary);
          font-weight: 600;
        }

        /* ============= CTA区 - 暗黑奢华 ============= */
        .s1-cta {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          opacity: 0;
          animation: fadeIn 0.8s ease-out 1.6s forwards;
          padding-top: 2px;
          padding-bottom: 2px;
        }

        .cta-btn {
          width: 100%;
          max-width: 355px;
          height: 45px;
          position: relative;
          font-family: inherit;
          
          /* 暗黑奢华金色渐变 - 增强中心高光 */
          background: linear-gradient(
            160deg, 
            #1A1814 0%,      /* 深黑棕 → 更黑 */
            #28231A 8%,      /* 暗棕 → 去黄 */
            #352C22 15%,     /* 中暗棕 → 去黄 */
            #534838 25%,     /* 中棕 → 降温 */
            #70603C 35%,     /* 深铜 → 降温 */
            #8D7849 42%,     /* 铜金过渡 → 降温 */
            #B8A160 50%,     /* ✨ 明金 → 降温（中心高光）*/
            #8D7849 58%,     /* 铜金过渡 → 降温 */
            #70603C 65%,     /* 深铜 → 降温 */
            #534838 75%,     /* 中棕 → 降温 */
            #352C22 85%,     /* 中暗棕 → 去黄 */
            #28231A 92%,     /* 暗棕 → 去黄 */
            #1A1814 100%     /* 深黑棕 → 更黑 */
          );
          
          border: 1px solid rgba(184, 161, 96, 0.45);
          border-radius: 5px;
          cursor: pointer;
          outline: none;
          overflow: hidden;
          
          box-shadow: 
            inset 0 1px 0 rgba(255, 255, 255, 0.2),     /* 顶部高光 */
            inset 0 -1px 0 rgba(0, 0, 0, 0.4),          /* 底部阴影 */
            0 0 24px rgba(184, 161, 96, 0.3),           /* 柔和外发光 - 降温 */
            0 4px 16px rgba(0, 0, 0, 0.5),              /* 主阴影 */
            0 8px 28px rgba(0, 0, 0, 0.4);              /* 深阴影 */
          
          transition: all 0.35s ease;
        }

        .cta-btn:hover {
          transform: translateY(-1px);
          border-color: rgba(200, 177, 111, 0.6);
          box-shadow: 
            inset 0 1px 0 rgba(255, 255, 255, 0.25),
            inset 0 -1px 0 rgba(0, 0, 0, 0.4),
            0 0 30px rgba(184, 161, 96, 0.4),
            0 6px 20px rgba(0, 0, 0, 0.5),
            0 10px 32px rgba(0, 0, 0, 0.45);
        }

        /* 内部光泽层 - 增强立体感 */
        .cta-btn::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.2) 0%,
            rgba(255, 255, 255, 0.08) 30%,
            transparent 50%,
            rgba(0, 0, 0, 0.15) 80%,
            rgba(0, 0, 0, 0.3) 100%
          );
          opacity: 1;
          pointer-events: none;
          z-index: 1;
        }

        /* 中心光斑 - 视觉焦点 */
        .cta-btn::after {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse 60% 80% at 50% 45%,
            rgba(220, 204, 150, 0.22) 0%,
            rgba(184, 161, 96, 0.1) 40%,
            transparent 70%
          );
          opacity: 1;
          transition: opacity 0.3s ease;
          pointer-events: none;
          z-index: 0;
        }

        .cta-btn:hover::after {
          opacity: 1.3;
        }

        .cta-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .cta-text {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #DCC896;
          line-height: 1;
          position: relative;
          z-index: 2;
          text-shadow: 
            0 0 14px rgba(220, 200, 150, 0.65),         /* 强外发光 - 降温 */
            0 0 6px rgba(255, 255, 255, 0.45),          /* 白色近光 - 降温 */
            0 3px 8px rgba(0, 0, 0, 0.9),               /* 深阴影 */
            0 1px 0 rgba(255, 255, 255, 0.28),          /* 顶部高光线 - 降温 */
            0 -1px 0 rgba(0, 0, 0, 0.5);                /* 底部暗线 */
        }

        .cta-meta {
          text-align: center;
          margin: 0;
          line-height: 1.55;
          padding: 0 4px 1px;
          min-height: 26px;
        }

        .cta-price {
          font-size: 7.2px;
          font-weight: 700;
          letter-spacing: 0.08em;
          display: block;
          margin-bottom: 2px;
          line-height: 1.3;
          
          /* 金属渐变文字 */
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
            drop-shadow(0 0 8px rgba(212, 185, 119, 0.4))
            drop-shadow(0 0 3px rgba(232, 212, 160, 0.6))
            drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
        }

        .cta-urgency {
          font-size: 6.3px;
          color: var(--text-tertiary);
          font-weight: 500;
          letter-spacing: 0.005em;
          display: block;
          line-height: 1.6;
          padding-top: 1px;
        }

        /* 动画 */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
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
            gap: 12px;
          }

          .code-header {
            padding: 14px 18px;
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
          }

          .code-sub {
            font-size: 9.5px;
          }

          .code-desc {
            font-size: 11.5px;
          }

          .testimonials-title {
            font-size: 14px;
          }

          .testimonials-grid {
            gap: 16px;
          }

          .testimonial-card {
            padding: 18px 20px;
          }

          .t-quote {
            font-size: 11.5px;
            -webkit-line-clamp: unset;
          }

          .t-item {
            font-size: 10.5px;
          }

          .s1-guarantee {
            padding: 24px 20px;
          }

          .guarantee-title {
            font-size: 14px;
          }

          .guarantee-text {
            font-size: 11px;
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
            font-size: 15px;
          }

          .cta-meta {
            font-size: 10.5px;
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