import CTA from "./CTA";
import Wordmark from "@/components/Wordmark";

export default function ScreenTwoBack() {
  return (
    <section className="s1-back">
      {/* Brand wordmark */}
      <Wordmark name="Kinship" href="/" />

      <div className="s1-back-inner">
        {/* Identity confirmation line */}
        <p className="s1-identity-brief">
          Initial screening indicates strong alignment with high-value circles
        </p>

        {/* Three preview points */}
        <ul className="s1-list">
          <li className="s1-list-item">
            <span className="s1-list-dot" />
            <p className="s1-list-text">
              Friendly-circle profile: the roles, industries, and atmospheres
              where you're readily recognized, and the expression styles they value.
            </p>
          </li>
          <li className="s1-list-item">
            <span className="s1-list-dot" />
            <p className="s1-list-text">
              Reasons you're preferred: which of your traits are naturally scarce
              in these contexts, and why they're readily accepted.
            </p>
          </li>
          <li className="s1-list-item">
            <span className="s1-list-dot" />
            <p className="s1-list-text">
              One precise self-introduction: a clear positioning line that lets
              the right people know immediately where you belong.
            </p>
          </li>
        </ul>

        {/* CTA */}
        <div className="s1-cta">
          <CTA label="View my matching assessment · $49" />
        </div>

        {/* Assist line */}
        <p className="s1-assist">One-time access · Instant PDF · Sample pages included</p>

        {/* Compliance copy */}
        <p className="s1-compliance">
          Methodology-backed insights from your responses; results may vary.
        </p>
      </div>

      <style>{`
        /* Layout */
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

        /* Identity brief */
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
          opacity: 0;
          transform: translateY(6px);
          animation: itemFadeIn 360ms cubic-bezier(0.23, 1, 0.32, 1) 30ms forwards;
        }

        /* List */
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
        .s1-list-item:nth-child(1) { animation-delay: 100ms; }
        .s1-list-item:nth-child(2) { animation-delay: 280ms; }
        .s1-list-item:nth-child(3) { animation-delay: 460ms; }
        .s1-list-item:last-child { margin-bottom: 0; }

        @keyframes itemFadeIn { to { opacity: 1; transform: translateY(0); } }

        .s1-list-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #B8956A;
          flex-shrink: 0;
          margin-top: 8px;
          opacity: 0.85;
        }
        .s1-list-text {
          margin: 0;
          font-size: 16px;
          line-height: 1.72;
          font-weight: 400;
          font-family: Georgia, 'Times New Roman', serif;
          color: #F5F5F0;
          opacity: 0.92;
        }

        /* CTA container */
        .s1-cta {
          margin: 44px 0 0 0;
          opacity: 0;
          transform: translateY(6px);
          animation: itemFadeIn 360ms cubic-bezier(0.23, 1, 0.32, 1) 640ms forwards;
        }

        /* Assist & compliance */
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
        .s1-compliance {
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
          animation: itemFadeIn 360ms cubic-bezier(0.23, 1, 0.32, 1) 1000ms forwards;
        }

        /* Responsive */
        @media (min-width: 769px) {
          .s1-back-inner { max-width: 580px; }
          .s1-identity-brief { font-size: 14px; }
          .s1-list-item { gap: 16px; margin-bottom: 24px; }
          .s1-list-dot { margin-top: 9px; }
          .s1-list-text { font-size: 17px; }
          .s1-cta { margin-top: 48px; }
          .s1-assist { font-size: 13px; margin-top: 14px; }
          .s1-compliance { font-size: 11px; margin-top: 28px; }
        }
        @media (max-width: 768px) {
          .s1-back { padding: 20px; }
          .s1-list-item { gap: 12px; margin-bottom: 18px; }
          .s1-list-text { font-size: 15px; }
        }
        @media (max-width: 359px) {
          .s1-back { padding: 16px; }
          .s1-identity-brief { font-size: 12px; }
          .s1-list-text { font-size: 14px; }
          .s1-assist { font-size: 11px; }
          .s1-compliance { font-size: 9px; }
        }

        /* Accessibility */
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
          .s1-compliance { opacity: 0.60 !important; }
        }
      `}</style>
    </section>
  );
}
