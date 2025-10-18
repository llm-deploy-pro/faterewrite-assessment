// 文件路径: src/scenes/ScreenOne/ScreenOneBack.tsx
import { useEffect, useRef } from "react";
import CTA from "./CTA";
import Wordmark from "@/components/Wordmark";
import { COPY } from "./copy";

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
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
      value
    )}; path=/; domain=.faterewrite.com; expires=${exp}; SameSite=Lax`;
    if (document.cookie.indexOf(name + "=") === -1) {
      document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
        value
      )}; path=/; expires=${exp}; SameSite=Lax`;
    }
  } catch {}
}

function markOnce(key: string, devMode: boolean = false): boolean {
  if (devMode && window.location.hostname === 'localhost') {
    console.log(`[DEV] 事件 ${key} 触发（开发模式不去重）`);
    return true;
  }

  // ✅ 改为“第一屏专用”去重 Cookie，避免跨页面冲突
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
/* ========================================================== */

export default function ScreenOneBack() {
  const hasTrackedRef = useRef(false);

  // ═══════════════════════════════════════════════════════════════
  // 🎯 核心打点：后屏成功加载（唯一的后屏事件）
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    // 防止组件重复挂载导致多次触发
    if (hasTrackedRef.current) return;
    hasTrackedRef.current = true;

    const frid = ensureFrid();
    const isDev = window.location.hostname === 'localhost';

    // 🎯 事件：后屏成功加载（User级去重：key = s1bl）
    const timer = setTimeout(() => {
      if (typeof window.fbq !== "undefined") {
        if (markOnce("s1bl", isDev)) {
          const eventId = "ev_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
          
          window.fbq("trackCustom", "S1_Back_Loaded", {
            content_name: "ScreenOne_Back",
            content_category: "Assessment_Offer",
            // ✅ 增加关键维度
            screen_position: "back",
            screen_number: 1,
            page_url: window.location.href,
            referrer: document.referrer,
            frid: frid,
          }, { 
            eventID: eventId 
          });
          
          console.log(`[FB打点] S1_Back_Loaded 触发成功`, { frid, eventId });
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  /* ──────────────────────────────────────────────────────────────
     ✅ 新增：后屏停留 ≥3s 去重人数打点（严格最小增量）
     事件名：S1_Back_Engaged_3s
     去重 key：s1be3
     不改其它任何逻辑
  ────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const frid = ensureFrid();
    const isDev = window.location.hostname === 'localhost';

    const dwellTimer = setTimeout(() => {
      if (typeof window.fbq !== "undefined") {
        if (markOnce("s1be3", isDev)) {
          const eventId = "ev_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

          window.fbq("trackCustom", "S1_Back_Engaged_3s", {
            content_name: "ScreenOne_Back",
            content_category: "Assessment_Offer",
            engagement_type: "view_3s",
            screen_position: "back",
            screen_number: 1,
            page_url: window.location.href,
            referrer: document.referrer,
            frid: frid,
          }, { eventID: eventId });

          console.log(`[FB打点] S1_Back_Engaged_3s 触发成功`, { frid, eventId });
        }
      }
    }, 3000);

    return () => clearTimeout(dwellTimer);
  }, []);

  return (
    <section className="s1-back">
      
      {/* ═══════════════════════════════════════════════════════
          品牌 Logo（复用 Wordmark 组件）
          ═══════════════════════════════════════════════════════ */}
      <Wordmark name="Kinship" href="/" />
      
      <div className="s1-back-inner">
        
        {/* 身份确认语句（克制版）*/}
        <p className="s1-identity-brief">
          {COPY.lead[0]}
        </p>
        
        {/* 价值点列表 */}
        <ul className="s1-list">
          <li className="s1-list-item">
            <span className="s1-list-dot" />
            <p className="s1-list-text">
              {COPY.bullets[0]}
            </p>
          </li>
          <li className="s1-list-item">
            <span className="s1-list-dot" />
            <p className="s1-list-text">
              {COPY.bullets[1]}
            </p>
          </li>
          <li className="s1-list-item">
            <span className="s1-list-dot" />
            <p className="s1-list-text">
              {COPY.bullets[2]}
            </p>
          </li>
        </ul>
        
        {/* CTA 按钮 */}
        <div className="s1-cta">
          <CTA label={COPY.cta} />
        </div>
        
        {/* 辅助说明文字 */}
        <p className="s1-assist">{COPY.support}</p>
        
        {/* 合规文案（方法学背书 + 温和免责）*/}
        <p className="s1-compliance">
          {COPY.trust}
        </p>
        
      </div>

      <style>{`
        /* ═══════════════════════════════════════════════════════════════════
           【10.0/10 后屏】合规文案间距优化版
           ═══════════════════════════════════════════════════════════════════ */

        /* ═══════════════════════════════════════════════════════════════════
           A. 容器布局
           ═══════════════════════════════════════════════════════════════════ */
        .s1-back {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          z-index: 10;
          box-sizing: border-box;
        }

        /* 全屏遮罩（微妙暗化背景） */
        .s1-back::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: rgba(0, 0, 0, 0.12);
          backdrop-filter: blur(1px);
        }

        .s1-back-inner {
          position: relative;
          width: 100%;
          max-width: 520px;
          color: #F5F5F0;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }

        /* ═══════════════════════════════════════════════════════════════════
           B. 身份确认样式（极简克制版）
           ═══════════════════════════════════════════════════════════════════ */
        .s1-identity-brief {
          font-size: 13px;
          line-height: 1.5;
          color: #B8956A;
          opacity: 0.85;
          font-family: Georgia, 'Times New Roman', serif;
          font-style: italic;
          text-align: center;
          margin: 0 0 32px;
          padding: 0 24px;
          letter-spacing: 0.01em;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          opacity: 0;
          transform: translateY(6px);
          animation: itemFadeIn 360ms cubic-bezier(0.23, 1, 0.32, 1) 30ms forwards;
        }

        /* ═══════════════════════════════════════════════════════════════════
           C. 列表样式（与前屏统一字体/行高）
           ═══════════════════════════════════════════════════════════════════ */
        .s1-list {
          list-style: none;
          margin: 0 0 40px 0;
          padding: 0;
        }

        .s1-list-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 20px;
          opacity: 0;
          transform: translateY(6px);
          animation: itemFadeIn 360ms cubic-bezier(0.23, 1, 0.32, 1) forwards;
        }

        /* 依次淡入 */
        .s1-list-item:nth-child(1) { animation-delay: 100ms; }
        .s1-list-item:nth-child(2) { animation-delay: 280ms; }
        .s1-list-item:nth-child(3) { animation-delay: 460ms; }

        .s1-list-item:last-child {
          margin-bottom: 0;
        }

        @keyframes itemFadeIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* 金色圆点（与前屏进度条呼应） */
        .s1-list-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #B8956A;
          flex-shrink: 0;
          margin-top: 8px;
          opacity: 0.85;
        }

        /* 列表文本（与前屏副标题统一） */
        .s1-list-text {
          margin: 0;
          font-size: 16px;
          line-height: 1.72;
          font-weight: 400;
          font-family: Georgia, 'Times New Roman', serif;
          color: #F5F5F0;
          opacity: 0.92;
        }

        /* ═══════════════════════════════════════════════════════════════════
           D. CTA 按钮容器
           ═══════════════════════════════════════════════════════════════════ */
        .s1-cta {
          margin: 44px 0 0 0;
          opacity: 0;
          transform: translateY(6px);
          animation: itemFadeIn 360ms cubic-bezier(0.23, 1, 0.32, 1) 640ms forwards;
        }

        /* ═══════════════════════════════════════════════════════════════════
           E. 辅助说明文字
           ═══════════════════════════════════════════════════════════════════ */
        .s1-assist {
          margin: 12px 0 0;
          padding: 0;
          font-size: 12px;
          line-height: 1.5;
          text-align: center;
          color: #C8C8C0;
          opacity: 0;
          font-family: Georgia, 'Times New Roman', serif;
          font-style: italic;
          animation: itemFadeIn 360ms cubic-bezier(0.23, 1, 0.32, 1) 820ms forwards;
        }

        /* ═══════════════════════════════════════════════════════════════════
           F. 合规文案（方法学背书 + 温和免责）
           ═══════════════════════════════════════════════════════════════════ */
        .s1-compliance {
          /* 间距优化：从 16px 改为 24px（移动端）*/
          margin: 24px 0 0;
          padding: 0;
          font-size: 10px;
          line-height: 1.5;
          text-align: center;
          color: #B8956A;
          opacity: 0;
          font-family: Georgia, 'Times New Roman', serif;
          font-style: italic;
          letter-spacing: 0.02em;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          animation: itemFadeIn 360ms cubic-bezier(0.23, 1, 0.32, 1) 1000ms forwards;
        }

        /* ═══════════════════════════════════════════════════════════════════
           桌面端适配
           ═══════════════════════════════════════════════════════════════════ */
        @media (min-width: 769px) {
          .s1-back-inner {
            max-width: 580px;
          }

          .s1-identity-brief {
            font-size: 14px;
          }

          .s1-list-item {
            gap: 16px;
            margin-bottom: 24px;
          }

          .s1-list-dot {
            margin-top: 9px;
          }

          .s1-list-text {
            font-size: 17px;
          }

          .s1-cta {
            margin-top: 48px;
          }

          .s1-assist {
            font-size: 13px;
            margin-top: 14px;
          }

          /* 间距优化：从 18px 改为 28px（桌面端）*/
          .s1-compliance {
            font-size: 11px;
            margin-top: 28px;
          }
        }

        /* ═══════════════════════════════════════════════════════════════════
           移动端优化（<768px）
           ═══════════════════════════════════════════════════════════════════ */
        @media (max-width: 768px) {
          .s1-back {
            padding: 20px;
          }

          .s1-list-item {
            gap: 12px;
            margin-bottom: 18px;
          }

          .s1-list-text {
            font-size: 15px;
          }
        }

        /* 极小屏适配（<360px） */
        @media (max-width: 359px) {
          .s1-back {
            padding: 16px;
          }

          .s1-identity-brief {
            font-size: 12px;
          }

          .s1-list-text {
            font-size: 14px;
          }

          .s1-assist {
            font-size: 11px;
          }

          .s1-compliance {
            font-size: 9px;
          }
        }

        /* ═══════════════════════════════════════════════════════════════════
           无障碍降级
           ═══════════════════════════════════════════════════════════════════ */
        @media (prefers-reduced-motion: reduce) {
          .s1-identity-brief,
          .s1-list-item,
          .s1-cta,
          .s1-assist,
          .s1-compliance {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }

          .s1-compliance {
            opacity: 0.60 !important;
          }
        }

        /* ═══════════════════════════════════════════════════════════════════
           【后屏打点】验收清单
           
           🎯 唯一保留事件：
           ✅ S1_Back_Loaded（后屏加载成功，User级去重：key=s1bl）
           
           去重逻辑：
           - 生产环境：Cookie跨子域去重（30天有效期）
           - 开发环境：localhost 不去重（方便测试）
           - 组件级防护：hasTrackedRef 防止重复挂载
           - 控制台日志：清晰标注触发/去重状态
           
           完全保留（0修改）：
           ✅ 所有样式（身份确认/列表/CTA容器/辅助文字/合规文案）
           ✅ 所有动画（依次淡入效果）
           ✅ 所有响应式适配
           ✅ 所有无障碍支持
           ✅ Logo 引用
           ✅ CTA 组件引用

           新增事件（最小增量）：
           ✅ S1_Back_Engaged_3s（后屏停留≥3秒，User级去重：key=s1be3）
           ═══════════════════════════════════════════════════════════════════ */
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
