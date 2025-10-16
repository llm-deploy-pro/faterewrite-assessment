// 文件路径: src/scenes/ScreenOne/CTA.tsx

/**
 * ═══════════════════════════════════════════════════════════════════
 * CTA 按钮组件 - Quiet Luxury 调性（10分级终极版 + FB打点）
 * 
 * 设计理念：
 * - 浅金色毛玻璃背景（高级感）
 * - 纯白文字（最高对比度 15:1）
 * - 金色边框（品牌色点缀）
 * - 微妙交互反馈（悬停/点击）
 * 
 * 终极优化（vs 9.8版）：
 * - 边框透明度：0.4 → 0.5（+25%，关键提升）
 * - 背景透明度：0.16 → 0.18（+12.5%，微调）
 * - 悬停边框：0.55 → 0.65（+18%，更明显）
 * 
 * 🔧 优化：只保留 S1_CTA_Click 打点（User级去重）
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface CTAProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

/* ===================== 跨子域去重工具 ===================== */
function getCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const list = (document.cookie || "").split("; ");
  for (const item of list) {
    const [k, ...rest] = item.split("=");
    if (decodeURIComponent(k) === name) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return "";
}

function setRootCookie(name: string, value: string, days: number) {
  try {
    const exp = new Date(Date.now() + days * 864e5).toUTCString();
    // 优先写顶级域
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
      value
    )}; path=/; domain=.faterewrite.com; expires=${exp}; SameSite=Lax`;
    // 若失败（本地开发等）退回当前域
    if ((document.cookie || "").indexOf(`${encodeURIComponent(name)}=`) === -1) {
      document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
        value
      )}; path=/; expires=${exp}; SameSite=Lax`;
    }
  } catch {}
}

function markOnce(key: string, devMode: boolean = false): boolean {
  // 开发模式：允许重复触发（方便测试）
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

function withParams(
  url: string,
  params: Record<string, string | number | undefined | null>
) {
  const u = new URL(url, window.location.origin);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") u.searchParams.set(k, String(v));
  });
  return u.pathname + (u.search || "");
}
/* ========================================================== */

export default function CTA({ 
  label, 
  onClick, 
  disabled = false 
}: CTAProps) {
  // User级去重状态
  const [hasClicked, setHasClicked] = useState(false);

  // 路由工具
  const navigate = useNavigate();
  const location = useLocation();

  // 组件挂载时检查localStorage
  useEffect(() => {
    try {
      const clicked = localStorage.getItem('cta_clicked_assessment_49');
      if (clicked === 'true') {
        setHasClicked(true);
      }
    } catch (error) {
      console.warn('localStorage not available:', error);
    }
  }, []);

  // 优雅离场 + 跳转封装
  const gentleGo = (to: string) => {
    document.documentElement.classList.add('page-leave');
    setTimeout(() => {
      navigate(to);
      requestAnimationFrame(() => {
        document.documentElement.classList.remove('page-leave');
        window.scrollTo(0, 0);
      });
    }, 220);
  };

  // ═══════════════════════════════════════════════════════════════
  // 🎯 核心打点：CTA点击（唯一保留的CTA事件）
  // ═══════════════════════════════════════════════════════════════
  const handleClick = () => {
    const frid = ensureFrid();
    const fbEventId = "ev_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const isDev = window.location.hostname === 'localhost';

    // 🎯 事件：CTA点击（User级去重：key = s1cc）
    if (!hasClicked && typeof window.fbq !== 'undefined') {
      if (markOnce("s1cc", isDev)) {
        window.fbq('trackCustom', 'S1_CTA_Click', {
          content_name: 'Assessment_CTA',
          content_category: 'Matching_Assessment',
          value: 49,
          currency: 'USD',
          // ✅ 增加关键维度
          screen_position: 'back',
          screen_number: 1,
          page_url: window.location.href,
          referrer: document.referrer,
          frid: frid,
        }, { 
          eventID: fbEventId 
        });

        console.log(`[FB打点] S1_CTA_Click 触发成功`, { frid, fbEventId });
      }

      // 标记已点击（User级去重）
      try {
        localStorage.setItem('cta_clicked_assessment_49', 'true');
        setHasClicked(true);
      } catch (error) {
        console.warn('localStorage not available:', error);
      }
    }

    // 当处于第一屏（/ 或 /screen-1）时，优雅进入第二屏前屏
    if (!onClick) {
      const isOnS1 = location.pathname === '/' || location.pathname === '/screen-1';
      if (isOnS1) {
        gentleGo('/screen-2');
        return;
      }
    }

    // 执行自定义 onClick（如果提供）
    if (onClick) {
      onClick();
    } else {
      // 默认跳转到支付页（非第一屏）—— 携带可追踪参数
      const target = withParams('/checkout', {
        frid,
        src: 's1cta',
        price: 49,
        fb_eid: fbEventId,
      });
      window.location.href = target;
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className="s1-cta-btn"
        aria-label={label}
      >
        <span className="s1-cta-text">{label}</span>
      </button>

      <style>{`
        /* ═══════════════════════════════════════════════════════════════════
           【10/10 CTA + FB打点】Quiet Luxury 按钮（终极优化版）
           ═══════════════════════════════════════════════════════════════════ */

        /* 页面离场过渡（在 html 加 .page-leave 即生效） */
        .page-leave .s1-back,
        .page-leave .screen-front-container {
          opacity: 0;
          transform: translateY(8px);
          filter: blur(1px);
          transition:
            opacity 220ms cubic-bezier(0.23, 1, 0.32, 1),
            transform 220ms cubic-bezier(0.23, 1, 0.32, 1),
            filter 220ms ease-out;
        }

        /* ═══════════════════════════════════════════════════════════════════
           A. 基础样式（移动端优先）
           ═══════════════════════════════════════════════════════════════════ */
        .s1-cta-btn {
          /* 布局 */
          display: block;
          width: 100%;
          height: 52px;
          position: relative;
          
          /* 移除默认样式 */
          border: none;
          margin: 0;
          padding: 0;
          
          /* 圆角（克制，与 Logo 装饰线呼应）*/
          border-radius: 8px;
          
          /* 终极优化1：背景透明度 0.16 → 0.18（+12.5%）*/
          background: rgba(184, 149, 106, 0.18);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          
          /* 终极优化2：边框透明度 0.4 → 0.5（+25%，关键提升）*/
          border: 1.5px solid rgba(184, 149, 106, 0.5);
          box-sizing: border-box;
          
          /* 光标 */
          cursor: pointer;
          
          /* 移除移动端 tap 高亮 */
          -webkit-tap-highlight-color: transparent;
          
          /* 过渡效果 */
          transition: all 250ms cubic-bezier(0.23, 1, 0.32, 1);
          
          /* 字体渲染优化 */
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* 按钮文字 */
        .s1-cta-text {
          display: block;
          width: 100%;
          height: 100%;
          
          /* 纯白文字（最高对比度）*/
          color: #FFFFFF;
          
          /* 字体样式（与前后屏统一）*/
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 15px;
          font-weight: 500;
          line-height: 52px;
          text-align: center;
          letter-spacing: 0.01em;
          
          /* 微妙文字阴影（增强可读性）*/
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
          
          /* 过渡效果 */
          transition: all 250ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        /* ═══════════════════════════════════════════════════════════════════
           B. 交互状态（桌面端悬停）
           ═══════════════════════════════════════════════════════════════════ */
        @media (hover: hover) and (pointer: fine) {
          .s1-cta-btn:hover:not(:disabled) {
            /* 悬停背景：0.24 → 0.26（+8%）*/
            background: rgba(184, 149, 106, 0.26);
            
            /* 终极优化3：悬停边框 0.55 → 0.65（+18%）*/
            border-color: rgba(184, 149, 106, 0.65);
            
            /* 微妙上浮 */
            transform: translateY(-1px);
            
            /* 金色光晕 */
            box-shadow: 
              0 4px 12px rgba(184, 149, 106, 0.15),
              0 2px 6px rgba(0, 0, 0, 0.08);
          }

          .s1-cta-btn:hover:not(:disabled) .s1-cta-text {
            /* 文字更清晰 */
            text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
          }
        }

        /* ═══════════════════════════════════════════════════════════════════
           C. 点击状态（移动端 + 桌面端）
           ═══════════════════════════════════════════════════════════════════ */
        .s1-cta-btn:active:not(:disabled) {
          /* 轻微下沉 */
          transform: translateY(0);
          
          /* 背景瞬间增强 */
          background: rgba(184, 149, 106, 0.3);
          
          /* 点击边框：0.6 → 0.7（+17%）*/
          border-color: rgba(184, 149, 106, 0.7);
          
          /* 过渡加速 */
          transition: all 100ms ease;
        }

        /* ═══════════════════════════════════════════════════════════════════
           D. 聚焦状态（键盘导航无障碍）
           ═══════════════════════════════════════════════════════════════════ */
        .s1-cta-btn:focus-visible {
          /* 聚焦环（保持 0.7）*/
          outline: 2px solid rgba(184, 149, 106, 0.7);
          outline-offset: 4px;
        }

        .s1-cta-btn:focus:not(:focus-visible) {
          outline: none;
        }

        /* ═══════════════════════════════════════════════════════════════════
           E. 禁用状态
           ═══════════════════════════════════════════════════════════════════ */
        .s1-cta-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none;
        }

        .s1-cta-btn:disabled .s1-cta-text {
          text-shadow: none;
        }

        /* ═══════════════════════════════════════════════════════════════════
           F. 桌面端适配
           ═══════════════════════════════════════════════════════════════════ */
        @media (min-width: 769px) {
          .s1-cta-btn {
            height: 56px;
          }

          .s1-cta-text {
            font-size: 16px;
            line-height: 56px;
          }
        }

        /* ═══════════════════════════════════════════════════════════════════
           G. 极小屏适配
           ═══════════════════════════════════════════════════════════════════ */
        @media (max-width: 359px) {
          .s1-cta-btn {
            height: 48px;
          }

          .s1-cta-text {
            font-size: 14px;
            line-height: 48px;
          }
        }

        /* ═══════════════════════════════════════════════════════════════════
           H. 无障碍降级
           ═══════════════════════════════════════════════════════════════════ */
        @media (prefers-reduced-motion: reduce) {
          .s1-cta-btn,
          .s1-cta-text {
            transition: none !important;
          }

          .s1-cta-btn:hover:not(:disabled) {
            transform: none !important;
          }
        }

        @media (prefers-contrast: more) {
          .s1-cta-btn {
            /* 高对比度模式：进一步增强 */
            background: rgba(184, 149, 106, 0.28);
            border-color: rgba(184, 149, 106, 0.7);
          }

          .s1-cta-text {
            text-shadow: none;
          }
        }

        /* ═══════════════════════════════════════════════════════════════════
           【CTA打点】验收清单
           
           🎯 唯一保留事件：
           ✅ S1_CTA_Click（CTA点击，User级去重：key=s1cc）
           
           去重逻辑：
           - Cookie跨子域：frd_s1_dedupe（30天有效期）
           - localStorage兜底：cta_clicked_assessment_49
           - 开发模式：localhost 不去重（方便测试）
           - 控制台日志：清晰标注触发/去重状态
           
           已删除事件：
           ❌ InitiateCheckout（标准事件，已删除）
           
           完全保留（0修改）：
           ✅ 所有CSS样式（毛玻璃/边框/圆角/字体）
           ✅ 所有交互效果（悬停/点击/聚焦）
           ✅ 所有响应式适配
           ✅ 所有无障碍支持
           ✅ 优雅离场动画
           ✅ 路由跳转逻辑
           ✅ 参数传递机制（frid/src/price/fb_eid）
      `}</style>
    </>
  );
}

// TypeScript 类型声明
declare global {
  interface Window {
    fbq: (...args: any[]) => void;
    __frid?: string;
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * 文案 A/B 测试建议（可选）
 * 
 * 当前版本（Version A）：
 * "View my matching assessment · $49"
 * - 优势：第一人称友好，"matching" 强调精准匹配
 * 
 * 备选版本（Version B - 动作导向）：
 * "Get my matching assessment · $49"
 * 
 * 备选版本（Version C - 价值导向）：
 * "See where I fit · $49"
 * 
 * 建议：
 * 1. 先上线 Version A（当前版本）
 * 2. 运行 2 周后，收集数据
 * 3. A/B 测试 Version C（情感驱动版）
 * ═══════════════════════════════════════════════════════════════════
 */
