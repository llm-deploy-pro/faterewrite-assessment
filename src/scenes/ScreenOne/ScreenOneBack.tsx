// src/scenes/ScreenOne/ScreenOneBack.tsx
import { useEffect, useRef, useState } from "react";

/* =====================================================================
   跨子域去重工具 - 确保事件在所有子域中只触发一次
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

    // 尝试设置根域cookie
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
      value
    )}; path=/; domain=.faterewrite.com; expires=${exp}; SameSite=Lax${secureFlag}`;

    // 如果根域cookie设置失败，设置当前域cookie作为备选
    if (document.cookie.indexOf(name + "=") === -1) {
      document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
        value
      )}; path=/; expires=${exp}; SameSite=Lax${secureFlag}`;
    }
  } catch {}
}

function markOnce(key: string, devMode: boolean = false): boolean {
  // 开发模式下允许重复触发以便测试
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

/* =====================================================================
   三大支柱数据配置 - 能量重构版本
   每个支柱都有强烈的品牌色彩，创造视觉识别度和能量感
   ===================================================================== */
const trinityComponents = [
  {
    id: "clarity",
    number: "I",
    name: "CLARITY",
    subtitle: "See The Matrix",
    content:
      "Your blueprint recalibrates perception. Ladders fade; the chessboard appears. You begin to notice the unwritten codes that govern rooms and decision-makers— the subtle frequencies that tilt outcomes, revealing the path of least resistance that was invisible yesterday.",
    // 冷灰蓝铂金色 - 低饱和度，昂贵质感
    primaryColor: "#8A9BA8",
    secondaryColor: "#A4B3BE",
    glowColor: "138, 155, 168",
  },
  {
    id: "magnetism",
    number: "II",
    name: "MAGNETISM",
    subtitle: "Become The Gravity Well",
    content:
      "This isn't charm. It's core-Archetype activation—presence converting into social capital. Invitations, allies, and strategic partners tend to gravitate toward you; not because of what you do, but because of who you become.",
    // 暖灰紫丝绸色 - 低饱和度，优雅质感
    primaryColor: "#9B8B9E",
    secondaryColor: "#B5A5B8",
    glowColor: "155, 139, 158",
  },
  {
    id: "control",
    number: "III",
    name: "CONTROL",
    subtitle: "Move Without Noise",
    content:
      "Receive precise directives to create outsized shifts with minimal motion. Leverage former \"glitches\" as unique assets; make decisions that ripple in your favor. This is the end of striving—and the beginning of agency.",
    // 古铜金属色 - 低饱和度，沉稳昂贵质感
    primaryColor: "#B8956A",
    secondaryColor: "#CFAD85",
    glowColor: "184, 149, 106",
  },
];

export default function ScreenOneBack() {
  // 追踪refs确保事件只触发一次
  const hasTrackedRef = useRef(false);
  const hasClickedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activePillar, setActivePillar] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ===================================================================
     页面加载追踪 - 在用户看到页面600ms后触发Facebook Pixel事件
     同时设置停留时长打点（3秒、10秒、20秒）
     =================================================================== */
  useEffect(() => {
    if (hasTrackedRef.current) return;
    hasTrackedRef.current = true;
    const frid = ensureFrid();
    const isDev = window.location.hostname === "localhost";
    
    // 页面加载事件（600ms后）
    const loadTimer = setTimeout(() => {
      if (typeof (window as any).fbq !== "undefined") {
        if (markOnce("s1bl", isDev)) {
          const eventId =
            "ev_" +
            Date.now().toString(36) +
            Math.random().toString(36).slice(2, 8);
          (window as any).fbq(
            "track",
            "ViewContent",
            {
              content_name: "Screen1-Loaded",
              content_category: "activation-page",
              currency: "USD",
              value: 47.0, // 修正为正确的价格
              user_id: frid,
            },
            { eventID: eventId }
          );
        }
      }
    }, 600);

    // 页面停留3秒打点
    const dwell3sTimer = setTimeout(() => {
      if (typeof (window as any).fbq !== "undefined") {
        if (markOnce("s1bd3s", isDev)) {
          const eventId =
            "ev_" +
            Date.now().toString(36) +
            Math.random().toString(36).slice(2, 8);
          (window as any).fbq(
            "trackCustom",
            "S1_Back_Dwell_3s",
            {
              content_name: "ScreenOne_Back_Dwell",
              dwell_time_seconds: 3,
              screen_position: "back",
              screen_number: 1,
              page_url: window.location.href,
              user_id: frid,
            },
            { eventID: eventId }
          );
        }
      }
    }, 3000);

    // 页面停留10秒打点
    const dwell10sTimer = setTimeout(() => {
      if (typeof (window as any).fbq !== "undefined") {
        if (markOnce("s1bd10s", isDev)) {
          const eventId =
            "ev_" +
            Date.now().toString(36) +
            Math.random().toString(36).slice(2, 8);
          (window as any).fbq(
            "trackCustom",
            "S1_Back_Dwell_10s",
            {
              content_name: "ScreenOne_Back_Dwell",
              dwell_time_seconds: 10,
              screen_position: "back",
              screen_number: 1,
              page_url: window.location.href,
              user_id: frid,
            },
            { eventID: eventId }
          );
        }
      }
    }, 10000);

    // 页面停留20秒打点
    const dwell20sTimer = setTimeout(() => {
      if (typeof (window as any).fbq !== "undefined") {
        if (markOnce("s1bd20s", isDev)) {
          const eventId =
            "ev_" +
            Date.now().toString(36) +
            Math.random().toString(36).slice(2, 8);
          (window as any).fbq(
            "trackCustom",
            "S1_Back_Dwell_20s",
            {
              content_name: "ScreenOne_Back_Dwell",
              dwell_time_seconds: 20,
              screen_position: "back",
              screen_number: 1,
              page_url: window.location.href,
              user_id: frid,
            },
            { eventID: eventId }
          );
        }
      }
    }, 20000);
    
    // 清理所有定时器
    return () => {
      clearTimeout(loadTimer);
      clearTimeout(dwell3sTimer);
      clearTimeout(dwell10sTimer);
      clearTimeout(dwell20sTimer);
    };
  }, []);

  /* ===================================================================
     CTA点击处理 - 防重复点击，追踪事件，执行转场动画后跳转
     =================================================================== */
  const handleClickCTA = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (hasClickedRef.current || isLoading) return;
    hasClickedRef.current = true;
    setIsLoading(true);

    const frid = ensureFrid();
    const isDev = window.location.hostname === "localhost";

    // 追踪CTA点击事件
    if (typeof (window as any).fbq !== "undefined") {
      if (markOnce("s1bc", isDev)) {
        const eventId =
          "ev_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        (window as any).fbq(
          "trackCustom",
          "S1_Back_CTA_Click",
          {
            content_name: "ScreenOne_Back_CTA",
            content_category: "Assessment_Offer_CTA",
            cta_text: "Initiate My Calibration",
            screen_position: "back",
            screen_number: 1,
            page_url: window.location.href,
            referrer: document.referrer,
            frid: frid,
          },
          { eventID: eventId }
        );
      }
    }

    // 添加执行动画类
    const root = document.querySelector(".s1-back-energy");
    if (root) root.classList.add("is-executing");

    // 清理可能存在的旧定时器
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    // 1.2秒后执行页面转场和跳转
    timeoutRef.current = setTimeout(() => {
      const paymentUrl = "https://pay.faterewrite.com/";
      const fullUrl = new URL(paymentUrl);
      fullUrl.searchParams.set("frid", frid);

      document.body.classList.add("page-leave");
      setTimeout(() => {
        window.location.href = fullUrl.toString();
      }, 300);
    }, 1200);
  };

  /* ===================================================================
     支柱展开/折叠处理
     同时追踪每个支柱的首次点击事件（使用去重逻辑）
     =================================================================== */
  const handlePillarClick = (pillarId: string) => {
    // 追踪支柱点击事件（仅首次点击时追踪）
    const frid = ensureFrid();
    const isDev = window.location.hostname === "localhost";
    
    if (typeof (window as any).fbq !== "undefined") {
      // 为每个支柱使用唯一的去重key
      const dedupeKey = `s1bp_${pillarId}`;
      
      if (markOnce(dedupeKey, isDev)) {
        const eventId =
          "ev_" +
          Date.now().toString(36) +
          Math.random().toString(36).slice(2, 8);
        
        // 获取支柱的友好名称
        const pillarNames: Record<string, string> = {
          clarity: "Clarity",
          magnetism: "Magnetism",
          control: "Control",
        };
        
        (window as any).fbq(
          "trackCustom",
          "S1_Back_Pillar_Click",
          {
            content_name: "ScreenOne_Back_Pillar",
            pillar_id: pillarId,
            pillar_name: pillarNames[pillarId] || pillarId,
            screen_position: "back",
            screen_number: 1,
            page_url: window.location.href,
            user_id: frid,
          },
          { eventID: eventId }
        );
      }
    }
    
    // 切换展开/折叠状态
    setActivePillar(activePillar === pillarId ? null : pillarId);
  };

  return (
    <section className="s1-back-energy">
      <div className="s1-energy-inner">
        {/* ============================================================
            顶部标题组 - 精炼但有力
            当任何支柱卡片展开时，此区域会隐藏以腾出空间
            ============================================================ */}
        <div className={`s1-energy-header ${activePillar ? 'is-hidden' : ''}`}>
          <div className="s1-energy-top-label">THE JUNCTURE</div>
          <h1 className="s1-energy-main-title">YOUR BLUEPRINT IS DRAFTED.</h1>
          <p className="s1-energy-value-prop">
            What if status, influence, and wealth were never about pushing
            harder— but about a set of rules hidden in plain sight? Today you
            read them.
          </p>
        </div>

        {/* ============================================================
            三大支柱 - 能量徽章系统
            ============================================================ */}
        <div className="s1-energy-pillars">
          <div className="s1-energy-pillars-label">
            THE THREE PILLARS OF TRANSFORMATION
          </div>

          <div className="energy-trinity-container">
            {trinityComponents.map((pillar, idx) => (
              <div
                key={pillar.id}
                className={`energy-pillar-card ${
                  activePillar === pillar.id ? "is-active" : ""
                }`}
                onClick={() => handlePillarClick(pillar.id)}
                style={{ animationDelay: `${idx * 0.15}s` }}
              >
                {/* 能量徽章头部 */}
                <div className="energy-pillar-header">
                  {/* 实心能量核心徽章 */}
                  <div className="energy-badge-wrapper">
                    <div
                      className="energy-badge-core"
                      style={{
                        background: `radial-gradient(circle at 35% 35%, ${pillar.primaryColor}, ${pillar.secondaryColor})`,
                        borderColor: pillar.secondaryColor,
                        boxShadow: `0 4px 16px rgba(${pillar.glowColor}, 0.3), 0 0 0 1px rgba(${pillar.glowColor}, 0.1)`,
                      }}
                    >
                      <span
                        className="energy-badge-roman"
                        style={{
                          color: "#0D1B2A",
                          textShadow: `0 1px 2px rgba(${pillar.glowColor}, 0.3)`,
                        }}
                      >
                        {pillar.number}
                      </span>
                    </div>
                  </div>

                  {/* 标题组 */}
                  <div className="energy-pillar-title-group">
                    <h3
                      className="energy-pillar-name"
                      style={{ color: pillar.primaryColor }}
                    >
                      {pillar.name}
                    </h3>
                    <p className="energy-pillar-subtitle">{pillar.subtitle}</p>
                  </div>

                  {/* 展开控制器 */}
                  <div className="energy-expand-controller">
                    <svg
                      className={`energy-expand-icon ${
                        activePillar === pillar.id ? "is-expanded" : ""
                      }`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      style={{ color: pillar.primaryColor }}
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        strokeWidth="2"
                        opacity="0.25"
                      />
                      <line
                        x1="12"
                        y1="8"
                        x2="12"
                        y2="16"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <line
                        x1="8"
                        y1="12"
                        x2="16"
                        y2="12"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>

                {/* 展开内容区 */}
                <div
                  className={`energy-pillar-content ${
                    activePillar === pillar.id ? "is-visible" : ""
                  }`}
                >
                  <p className="energy-pillar-description">
                    {pillar.content}
                  </p>
                </div>

                {/* 底部装饰线 - 仅在展开时显示 */}
                <div
                  className={`energy-accent-line ${
                    activePillar === pillar.id ? "is-visible" : ""
                  }`}
                  style={{
                    background: `linear-gradient(90deg, transparent, rgba(${pillar.glowColor}, 0.4), transparent)`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ============================================================
            Architect区域 - 完整原文
            在展开状态下保持可见以提供权威背书
            ============================================================ */}
        <div className="s1-energy-architect">
          <div className="s1-energy-architect-label">THE ARCHITECT</div>
          <div className="s1-energy-architect-card">
            <h3 className="s1-energy-architect-title">
              A NOTE FROM THE ARCHITECT
            </h3>
            <p className="s1-energy-architect-quote">
              "I didn't architect The Starlight Directive from struggle, but
              from access—inside the very rooms you wish to enter. For years,
              my currency was an Ivy-League diploma and a seat on Wall Street.
              Yet the truly powerful weren't playing the same game. Their
              currency was fluency in unwritten rules. This blueprint isn't my
              story of 'making it'; it is the distillation of a private
              playbook, engineered for those with the discernment to wield it.
              It is a tool of leverage. I am simply its steward."
            </p>
            <p className="s1-energy-architect-sig">— Julianne de Vere</p>
          </div>
        </div>

        {/* ============================================================
            CTA最终召唤区 - 10分奢华金属按钮
            ============================================================ */}
        <div className="s1-energy-cta-final">
          <div className="s1-energy-final-label">THE FINAL SUMMONS</div>
          <p className="s1-energy-final-text">
            This is not a report. It is your initiation.
          </p>

          <button
            type="button"
            className="s1-energy-cta-button"
            onClick={handleClickCTA}
            disabled={isLoading}
          >
            <span className="s1-energy-cta-text">
              INITIATE MY CALIBRATION
            </span>
          </button>

          {/* 价格信息作为支持性元素 - 位于按钮下方确认超值 */}
          <div className="s1-energy-price-highlight">
            A Measured Step Into an Unfair Advantage.
          </div>
        </div>
      </div>

      <style>{`
        /* ═══════════════════════════════════════════════════════════════
           能量重构 - 10分完美方案 CSS系统
           核心设计理念：精致有力，可感知的视觉能量
           ═══════════════════════════════════════════════════════════════ */

        /* ---------------------------------------------------------------
           CSS变量定义 - 全局配色和间距系统
           --------------------------------------------------------------- */
        :root {
          /* 安全区域适配 */
          --safe-top: env(safe-area-inset-top, 0px);
          --safe-bottom: env(safe-area-inset-bottom, 0px);

          /* 核心配色 - 深蓝色基调创造深度而非压抑 */
          --bg-deep-blue: #0D1B2A;
          --bg-navy: #1B263B;
          --text-bright: rgba(255, 255, 255, 0.96);
          --text-medium: rgba(255, 255, 255, 0.78);
          --text-dim: rgba(255, 255, 255, 0.56);
          --border-subtle: rgba(255, 255, 255, 0.12);
          
          /* 金色系统 - 真正的gold而非champagne */
          --gold-primary: #D4AF37;
          --gold-light: #E8C474;
          --gold-glow: rgba(212, 175, 55, 0.35);
        }

        /* ---------------------------------------------------------------
           主容器 - 深蓝色渐变背景
           --------------------------------------------------------------- */
        .s1-back-energy {
          position: relative;
          width: 100%;
          min-height: 100dvh;
          background: linear-gradient(180deg, var(--bg-deep-blue) 0%, var(--bg-navy) 100%);
          color: var(--text-bright);
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif;
          overflow-x: hidden;
        }

        .s1-energy-inner {
          width: 100%;
          max-width: 100%;
          margin: 0 auto;
          padding: 16px 18px calc(var(--safe-bottom) + 16px);
          display: flex;
          flex-direction: column;
          gap: 13px;
          min-height: 100dvh;
        }

        /* ---------------------------------------------------------------
           顶部标题组 - 增大字号创造视觉锚点
           当支柱卡片展开时智能隐藏以节省空间
           --------------------------------------------------------------- */
        .s1-energy-header {
          text-align: center;
          animation: energyFadeIn 0.7s ease-out;
          opacity: 1;
          max-height: 300px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }

        /* 隐藏状态 - 当任何支柱卡片展开时激活 */
        .s1-energy-header.is-hidden {
          opacity: 0;
          max-height: 0;
          margin-top: 0;
          margin-bottom: 0;
          pointer-events: none;
        }

        @keyframes energyFadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .s1-energy-top-label {
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: var(--gold-primary);
          opacity: 0.85;
          margin-bottom: 10px;
          text-shadow: 0 0 10px var(--gold-glow);
        }

        .s1-energy-main-title {
          font-size: 17px;
          font-weight: 700;
          letter-spacing: 0.10em;
          line-height: 1.3;
          margin: 0 0 8px 0;
          text-transform: uppercase;
        }

        .s1-energy-value-prop {
          font-size: 11px;
          line-height: 1.65;
          color: var(--text-medium);
          margin: 0;
          font-weight: 400;
        }

        /* ---------------------------------------------------------------
           三支柱容器
           --------------------------------------------------------------- */
        .s1-energy-pillars {
          flex-shrink: 0;
        }

        .s1-energy-pillars-label {
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: var(--gold-primary);
          opacity: 0.85;
          text-align: center;
          margin-bottom: 10px;
          text-shadow: 0 0 10px var(--gold-glow);
        }

        .energy-trinity-container {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        /* ---------------------------------------------------------------
           能量徽章卡片 - 核心视觉元素
           --------------------------------------------------------------- */
        .energy-pillar-card {
          position: relative;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.04) 0%,
            rgba(255, 255, 255, 0.02) 100%
          );
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.35s cubic-bezier(0.23, 1, 0.32, 1);
          opacity: 0;
          animation: energySlideUp 0.6s ease-out forwards;
          overflow: hidden;
        }

        @keyframes energySlideUp {
          from {
            opacity: 0;
            transform: translateY(25px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .energy-pillar-card:active {
          transform: scale(0.98);
        }

        .energy-pillar-card.is-active {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.18);
        }

        /* ---------------------------------------------------------------
           能量徽章头部布局
           --------------------------------------------------------------- */
        .energy-pillar-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 7px 13px;
          min-height: 38px;
        }

        /* ---------------------------------------------------------------
           实心能量核心徽章 - 强烈的径向渐变创造能量感
           --------------------------------------------------------------- */
        .energy-badge-wrapper {
          flex-shrink: 0;
        }

        .energy-badge-core {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 2.5px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          /* background和borderColor通过内联样式设置 */
          transition: all 0.35s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .energy-pillar-card:active .energy-badge-core {
          transform: scale(0.95);
        }

        /* 罗马数字 - 保持Georgia衬线字体，美国用户完全能识别 */
        .energy-badge-roman {
          font-size: 13px;
          font-weight: 700;
          font-family: Georgia, serif;
          position: relative;
          z-index: 1;
          /* color和textShadow通过内联样式设置 */
        }

        /* ---------------------------------------------------------------
           标题组 - 增大字号和间距
           --------------------------------------------------------------- */
        .energy-pillar-title-group {
          flex: 1;
          min-width: 0;
        }

        .energy-pillar-name {
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.08em;
          margin: 0 0 3px 0;
          line-height: 1.2;
          /* color通过内联样式设置 */
        }

        .energy-pillar-subtitle {
          font-size: 9px;
          font-weight: 400;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--text-dim);
          margin: 0;
          line-height: 1.3;
        }

        /* ---------------------------------------------------------------
           展开控制器 - 更粗的线条创造清晰的视觉反馈
           --------------------------------------------------------------- */
        .energy-expand-controller {
          flex-shrink: 0;
        }

        .energy-expand-icon {
          width: 24px;
          height: 24px;
          opacity: 0.65;
          transition: all 0.35s cubic-bezier(0.23, 1, 0.32, 1);
          /* color通过内联样式设置 */
        }

        .energy-expand-icon.is-expanded {
          transform: rotate(45deg);
          opacity: 0.9;
        }

        .energy-pillar-card:hover .energy-expand-icon {
          opacity: 0.85;
        }

        /* ---------------------------------------------------------------
           展开内容区 - 智能高度管理
           --------------------------------------------------------------- */
        .energy-pillar-content {
          max-height: 0;
          opacity: 0;
          overflow: hidden;
          transition: all 0.45s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .energy-pillar-content.is-visible {
          max-height: 280px;
          opacity: 1;
          padding: 0 14px 14px;
        }

        .energy-pillar-description {
          font-size: 11px;
          line-height: 1.8;
          color: var(--text-medium);
          margin: 0;
          font-weight: 400;
        }

        /* ---------------------------------------------------------------
           底部装饰线 - 展开时显示的能量线
           --------------------------------------------------------------- */
        .energy-accent-line {
          height: 1px;
          opacity: 0;
          transition: opacity 0.35s ease;
          /* background通过内联样式设置 */
        }

        .energy-accent-line.is-visible {
          opacity: 1;
        }

        /* ---------------------------------------------------------------
           Architect区域 - 完整文本
           --------------------------------------------------------------- */
        .s1-energy-architect {
          flex-shrink: 0;
          animation: energyFadeIn 0.7s ease-out 0.3s both;
        }

        .s1-energy-architect-label {
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: var(--gold-primary);
          opacity: 0.85;
          text-align: center;
          margin-bottom: 10px;
          text-shadow: 0 0 10px var(--gold-glow);
        }

        .s1-energy-architect-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          padding: 12px 14px;
        }

        .s1-energy-architect-title {
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--gold-primary);
          margin: 0 0 8px 0;
          text-align: center;
          text-shadow: 0 0 8px var(--gold-glow);
        }

        .s1-energy-architect-quote {
          font-size: 10px;
          line-height: 1.7;
          color: var(--text-medium);
          font-style: italic;
          margin: 0 0 8px 0;
          font-family: Georgia, serif;
          font-weight: 400;
        }

        .s1-energy-architect-sig {
          font-size: 9.5px;
          font-weight: 500;
          color: var(--gold-primary);
          text-align: right;
          margin: 0;
          text-shadow: 0 0 8px var(--gold-glow);
        }

        /* ---------------------------------------------------------------
           CTA最终召唤区 - 10分奢华金属按钮系统
           --------------------------------------------------------------- */
        .s1-energy-cta-final {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          animation: energyFadeIn 0.7s ease-out 0.4s both;
        }

        .s1-energy-final-label {
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: var(--gold-primary);
          opacity: 0.85;
          text-shadow: 0 0 10px var(--gold-glow);
        }

        .s1-energy-final-text {
          font-size: 10.5px;
          color: var(--text-medium);
          font-style: italic;
          margin: 0 0 4px 0;
          font-family: Georgia, serif;
        }

        /* 价格强调元素 - 作为按钮下方的支持性确认信息 */
        .s1-energy-price-highlight {
          font-size: 11px;
          font-weight: 500;
          color: var(--gold-primary);
          text-shadow: 0 0 12px var(--gold-glow);
          margin-top: 8px;
          letter-spacing: 0.02em;
        }

        .price-amount {
          font-size: 15px;
          font-weight: 700;
          color: var(--gold-light);
          text-shadow: 0 0 16px rgba(232, 196, 116, 0.6);
          letter-spacing: 0.04em;
        }

        /* ---------------------------------------------------------------
           10分奢华发光金属板按钮 - 核心设计
           --------------------------------------------------------------- */
        .s1-energy-cta-button {
          position: relative;
          width: 100%;
          max-width: 400px;
          height: 60px;
          padding: 0 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          
          /* 多层次金色渐变 - 从深金到亮金创造立体感 */
          background: linear-gradient(
            160deg,
            #C9A961 0%,
            #D4AF37 25%,
            #E8C474 50%,
            #D4AF37 75%,
            #B8956A 100%
          );
          
          border: none;
          border-radius: 4px;
          cursor: pointer;
          outline: none;
          overflow: hidden;
          
          /* 三层阴影系统创造深度和发光效果 */
          box-shadow: 
            /* 内层：细微的深色边界 */
            inset 0 0 0 1px rgba(0, 0, 0, 0.1),
            /* 中层：金色发光效果 */
            0 0 30px rgba(212, 175, 55, 0.5),
            0 6px 20px rgba(212, 175, 55, 0.4),
            /* 外层：深度投影 */
            0 8px 32px rgba(0, 0, 0, 0.3);
          
          transition: all 0.35s cubic-bezier(0.23, 1, 0.32, 1);
        }

        /* 高光覆层 - 模拟光线在金属表面的反射 */
        .s1-energy-cta-button::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            145deg,
            rgba(255, 255, 255, 0.4) 0%,
            rgba(255, 255, 255, 0.15) 30%,
            transparent 60%
          );
          opacity: 0.8;
          transition: opacity 0.35s ease;
          pointer-events: none;
        }

        /* 顶部高光边缘 - 模拟金属边缘的反光 */
        .s1-energy-cta-button::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.6) 50%,
            transparent 100%
          );
          opacity: 0.7;
          pointer-events: none;
        }

        /* 悬停状态 - 按钮"激活"并浮起 */
        .s1-energy-cta-button:hover {
          transform: translateY(-3px) scale(1.03);
          
          /* 增强所有阴影创造更强的浮起效果 */
          box-shadow: 
            inset 0 0 0 1px rgba(0, 0, 0, 0.15),
            0 0 40px rgba(212, 175, 55, 0.7),
            0 8px 28px rgba(212, 175, 55, 0.55),
            0 12px 48px rgba(0, 0, 0, 0.35);
        }

        .s1-energy-cta-button:hover::before {
          opacity: 1;
        }

        /* 按下状态 - 按钮"下沉"提供物理反馈 */
        .s1-energy-cta-button:active {
          transform: translateY(-1px) scale(0.98);
          
          box-shadow: 
            inset 0 0 0 1px rgba(0, 0, 0, 0.2),
            0 0 20px rgba(212, 175, 55, 0.4),
            0 4px 12px rgba(212, 175, 55, 0.3),
            0 6px 24px rgba(0, 0, 0, 0.25);
        }

        .s1-energy-cta-button:active::before {
          opacity: 0.6;
        }

        /* 禁用状态 */
        .s1-energy-cta-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .s1-energy-cta-button:disabled:hover {
          transform: none;
          box-shadow: 
            inset 0 0 0 1px rgba(0, 0, 0, 0.1),
            0 0 30px rgba(212, 175, 55, 0.5),
            0 6px 20px rgba(212, 175, 55, 0.4),
            0 8px 32px rgba(0, 0, 0, 0.3);
        }

        /* 按钮文字 - 浮雕效果"刻"在金属上 */
        .s1-energy-cta-text {
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 0.12em;
          color: #0D1B2A;
          line-height: 1;
          position: relative;
          z-index: 1;
          
          /* 双向文字阴影创造浮雕效果 */
          text-shadow: 
            0 1px 0 rgba(255, 255, 255, 0.4),
            0 -1px 0 rgba(0, 0, 0, 0.3),
            0 2px 4px rgba(0, 0, 0, 0.2);
        }

        /* ---------------------------------------------------------------
           桌面端响应式优化 - 更大的尺寸和更丰富的交互
           --------------------------------------------------------------- */
        @media (min-width: 768px) {
          .s1-energy-inner {
            max-width: 680px;
            padding: 24px 24px calc(var(--safe-bottom) + 24px);
            gap: 20px;
          }

          /* 标题组 */
          .s1-energy-main-title {
            font-size: 19px;
          }

          .s1-energy-value-prop {
            font-size: 12px;
            line-height: 1.75;
          }

          /* 徽章卡片 */
          .energy-pillar-header {
            padding: 14px 18px;
            min-height: 62px;
          }

          .energy-badge-core {
            width: 52px;
            height: 52px;
          }

          .energy-badge-roman {
            font-size: 17px;
          }

          .energy-pillar-name {
            font-size: 14px;
          }

          .energy-pillar-subtitle {
            font-size: 9.5px;
          }

          .energy-pillar-description {
            font-size: 11.5px;
            line-height: 1.85;
          }

          .energy-pillar-content.is-visible {
            padding: 0 18px 16px;
            max-height: 320px;
          }

          /* Architect */
          .s1-energy-architect-card {
            padding: 16px 20px;
          }

          .s1-energy-architect-title {
            font-size: 9.5px;
            margin-bottom: 12px;
          }

          .s1-energy-architect-quote {
            font-size: 11px;
            line-height: 1.8;
            margin-bottom: 10px;
          }

          .s1-energy-architect-sig {
            font-size: 10px;
          }

          /* CTA按钮桌面端优化 */
          .s1-energy-cta-button {
            height: 64px;
            max-width: 440px;
          }

          .s1-energy-cta-text {
            font-size: 16px;
          }

          .s1-energy-price-highlight {
            font-size: 12px;
          }

          .price-amount {
            font-size: 16px;
          }

          /* 桌面悬停效果增强 */
          .energy-pillar-card:hover {
            border-color: rgba(255, 255, 255, 0.22);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
            transform: translateY(-2px);
          }

          .energy-pillar-card:hover .energy-badge-core {
            transform: scale(1.05);
          }
        }

        /* ---------------------------------------------------------------
           无障碍支持 - 尊重用户的动画偏好
           --------------------------------------------------------------- */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }

          .energy-pillar-card {
            opacity: 1;
            animation: none;
          }

          .s1-energy-header,
          .s1-energy-architect,
          .s1-energy-cta-final {
            animation: none;
          }
        }

        /* 键盘导航焦点指示 */
        .s1-energy-cta-button:focus-visible {
          outline: 3px solid var(--gold-primary);
          outline-offset: 4px;
        }

        .energy-pillar-card:focus-visible {
          outline: 2px solid var(--gold-primary);
          outline-offset: 3px;
        }
      `}</style>
    </section>
  );
}