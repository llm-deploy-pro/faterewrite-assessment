// src/components/Wordmark.tsx

interface WordmarkProps {
  /** 品牌名称 */
  name?: string;
  /** 跳转链接（可选） */
  href?: string;
}

export default function Wordmark({
  name = "Kinship",
  href = "/",
}: WordmarkProps) {
  return (
    <>
      <div
        className="wm-brand"
        role="banner"
        aria-label="Kinship - Find your circles"
      >
        <a
          className="wm-brand__link"
          href={href}
          aria-label={`${name} home`}
        >
          <span className="wm-brand__mark"></span>
          <span className="wm-brand__text">{name}</span>
        </a>
      </div>

      <style>{`
        /* ═══════════════════════════════════════════════════════════════════
           品牌 Wordmark：Kinship（从 ScreenOneFront 提炼，零修改）
           ─ 加分优化仅通过“新增选择器/媒体查询/兼容性增强”，不改不删原样式
           ═══════════════════════════════════════════════════════════════════ */
        .wm-brand {
          position: fixed;
          top: max(24px, env(safe-area-inset-top));
          left: max(24px, env(safe-area-inset-left));
          z-index: 20;
          opacity: 0;
          animation: wmFadeIn 400ms ease 300ms forwards;
          color-scheme: dark; /* 新增：在深色环境下获得更一致的系统样式 */
        }

        .wm-brand__link {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          text-decoration: none;
          color: inherit;
        }

        .wm-brand__mark {
          width: 24px;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(184, 149, 106, 0.5) 50%,
            transparent 100%
          );
          opacity: 0;
          animation: markFadeIn 400ms ease 500ms forwards;
        }

        .wm-brand__text {
          display: inline-block;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 16px;
          font-weight: 500;
          line-height: 1.2;
          color: #F5F5F0;
          opacity: 0.85;
          letter-spacing: 0.02em;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
          font-feature-settings: "liga" 1, "kern" 1;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
          transition: all 200ms ease;
        }

        @media (hover: hover) {
          .wm-brand__link:hover .wm-brand__text {
            opacity: 1.0;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            transition: all 300ms ease;
          }
          .wm-brand__link:hover .wm-brand__mark {
            opacity: 0.7;
            transition: opacity 300ms ease;
          }
        }

        .wm-brand__link:active .wm-brand__text {
          opacity: 0.68;
          transform: translateY(1px);
          transition: all 100ms ease;
        }

        .wm-brand__link:focus-visible .wm-brand__text {
          outline: 2px solid rgba(184, 149, 106, 0.6);
          outline-offset: 4px;
          border-radius: 2px;
        }
        .wm-brand__link:focus:not(:focus-visible) .wm-brand__text {
          outline: none;
        }

        @keyframes wmFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes markFadeIn {
          from { opacity: 0; transform: scaleX(0); }
          to   { opacity: 0.5; transform: scaleX(1); }
        }

        @media (min-width: 769px) and (max-width: 1279px) {
          .wm-brand { top: max(28px, env(safe-area-inset-top)); left: max(28px, env(safe-area-inset-left)); }
          .wm-brand__mark { width: 28px; }
          .wm-brand__text { font-size: 18px; }
        }

        @media (min-width: 1280px) {
          .wm-brand { top: max(32px, env(safe-area-inset-top)); left: max(32px, env(safe-area-inset-left)); }
          .wm-brand__mark { width: 32px; }
          .wm-brand__text { font-size: 20px; }
        }

        @media (max-width: 359px) {
          .wm-brand { top: 20px; left: 20px; }
          .wm-brand__mark { width: 20px; }
          .wm-brand__text { font-size: 14px; }
        }

        /* ───────────────────────────────
           ✅ 加分优化 A11y：减动 & 高对比
           ─────────────────────────────── */
        @media (prefers-reduced-motion: reduce) {
          .wm-brand,
          .wm-brand__mark {
            animation: none !important;
            opacity: 1 !important;
          }
        }
        @media (prefers-contrast: more) {
          .wm-brand__text { opacity: 0.95; text-shadow: none; }
          .wm-brand__mark { opacity: 0.85; }
        }
        @media (forced-colors: active) {
          .wm-brand,
          .wm-brand__link,
          .wm-brand__text,
          .wm-brand__mark {
            forced-color-adjust: none;
            color: CanvasText;
          }
          .wm-brand__mark {
            background: CanvasText;
          }
          .wm-brand__link:focus-visible .wm-brand__text {
            outline-color: CanvasText;
          }
        }

        /* ───────────────────────────────
           ✅ 加分优化 细节：不可选文本 & 提示
           ─────────────────────────────── */
        .wm-brand,
        .wm-brand__text {
          user-select: none; /* 提升交互质感：避免误选中文字 */
        }
      `}</style>
    </>
  );
}
