import { useEffect, useRef } from "react";
import Wordmark from "@/components/Wordmark";

export default function ScreenTwoFront() {
  // tracking refs
  const startTimeRef = useRef<number>(0);
  const engaged3sRef = useRef<boolean>(false);
  const pageViewTrackedRef = useRef<boolean>(false);

  // progress emitter (kept same timings)
  useEffect(() => {
    const TOTAL = 3000;
    const DELAY = 480;
    const at80 = DELAY + Math.round(TOTAL * 0.8);
    const at100 = DELAY + TOTAL;

    const emit = (name: string, detail?: any) =>
      window.dispatchEvent(new CustomEvent(`s2:${name}`, { detail }));

    const t0 = window.setTimeout(() => emit("progress:start"), DELAY);
    const t1 = window.setTimeout(() => emit("progress:80"), at80);
    const t2 = window.setTimeout(() => emit("progress:done"), at100);

    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  // FB pixel basic events
  useEffect(() => {
    startTimeRef.current = Date.now();

    // 1) PageView
    const loadTimer = setTimeout(() => {
      if (!pageViewTrackedRef.current && typeof window.fbq !== "undefined") {
        window.fbq("track", "PageView", {
          content_name: "ScreenTwo_Front",
          content_category: "Assessment_Verification",
        });
        pageViewTrackedRef.current = true;
      }
    }, 100);

    // 2) Engaged 3s
    const engageTimer = setTimeout(() => {
      if (!engaged3sRef.current && typeof window.fbq !== "undefined") {
        window.fbq("trackCustom", "Engaged3s", {
          content_name: "ScreenTwo_Front",
          engagement_type: "view_3s",
        });
        engaged3sRef.current = true;
      }
    }, 3000);

    // 3) TimeOnPage
    return () => {
      clearTimeout(loadTimer);
      clearTimeout(engageTimer);

      if (typeof window.fbq !== "undefined" && startTimeRef.current > 0) {
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
        const bucket = getDurationBucket(duration);
        window.fbq("trackCustom", "TimeOnPage", {
          content_name: "ScreenTwo_Front",
          duration_seconds: duration,
          duration_bucket: bucket,
        });
      }
    };
  }, []);

  const getDurationBucket = (seconds: number): string => {
    if (seconds < 3) return "under_3s";
    if (seconds < 5) return "3_to_5s";
    if (seconds < 10) return "5_to_10s";
    return "over_10s";
  };

  return (
    <section className="screen-front-container">
      {/* Brand wordmark */}
      <Wordmark name="Kinship" href="/" />

      <div className="screen-front-content">
        {/* Title */}
        <h1
          className="screen-front-title"
          aria-label="The right circles have been waiting for you"
        >
          <span className="h1-chunk">The right circles</span>
          <span className="h1-chunk">have been waiting for you</span>
        </h1>

        {/* Subtitle */}
        <p className="screen-front-subtitle">
          <span className="subline">
            This matching assessment will <em className="key-phrase">point out</em>: who is
            more likely to understand you,
          </span>
          <span className="subline">
            and <em className="key-phrase">which environments</em> let your value speak for
            itself.
          </span>
        </p>

        {/* Tagline */}
        <p className="screen-front-tagline">Not reforming, but aligning.</p>

        {/* Status label */}
        <p className="s1-status-label">Assessment ready</p>

        {/* Static progress visual */}
        <div className="s1-progress" aria-hidden="true">
          <span className="s1-progress-dot left" />
          <span className="s1-progress-dot right" />
        </div>
      </div>

      <style>{`
        :root{
          --s1-total: 3000ms;
          --s1-delay: 480ms;
          --s1-shine-intensity: 0.35;
          --s1-outro-start: 2760ms;
          --s1-outro-dur: 220ms;
        }

        .screen-front-container {
          position: fixed;
          inset: 0;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          box-sizing: border-box;
        }

        .screen-front-content {
          position: relative;
          width: 100%;
          max-width: 520px;
          text-align: left;
          color: #F5F5F0;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }

        /* Title */
        .screen-front-title {
          margin: 0 0 32px 0;
          padding: 0;
          font-size: 34px;
          line-height: 1.25;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: #F5F5F0;
          font-family: Georgia, 'Times New Roman', serif;
          text-wrap: balance;
          font-kerning: normal;
          font-feature-settings: "liga" 1, "kern" 1, "pnum" 1;
        }

        .h1-chunk {
          display: block;
          opacity: 0;
          transform: translateY(8px);
          will-change: transform, opacity;
          animation:
            chunkIn 420ms cubic-bezier(0.23, 1, 0.32, 1) forwards,
            microOutro var(--s1-outro-dur) ease-out var(--s1-outro-start) forwards;
        }
        .h1-chunk:nth-child(1) {
          animation-name: chunkIn, chunkPulse, microOutro;
          animation-duration: 420ms, 180ms, var(--s1-outro-dur);
          animation-timing-function: cubic-bezier(0.23,1,0.32,1), ease-out, ease-out;
          animation-delay: 60ms, 400ms, var(--s1-outro-start);
          animation-fill-mode: forwards, none, forwards;
        }
        .h1-chunk:nth-child(2) { animation-delay: 240ms, var(--s1-outro-start); }

        @keyframes chunkIn {
          0%   { opacity: 0; transform: translateY(8px); }
          80%  { opacity: 1; transform: translateY(-0.5px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes chunkPulse { 0%{opacity:1} 50%{opacity:.94} 100%{opacity:1} }
        @keyframes microOutro { to { opacity: .96; transform: translateY(-2px); } }

        /* Subtitle */
        .screen-front-subtitle {
          margin: 0 0 40px 0;
          padding: 0;
          font-size: 17px;
          line-height: 1.72;
          color: #F5F5F0;
          font-weight: 400;
        }
        .subline {
          display: block;
          opacity: 0;
          transform: translateY(6px);
          animation:
            subIn 360ms cubic-bezier(0.23,1,0.32,1) forwards,
            microOutro var(--s1-outro-dur) ease-out var(--s1-outro-start) forwards;
        }
        .subline:nth-child(1) { animation-delay: 560ms, var(--s1-outro-start); }
        .subline:nth-child(2) { animation-delay: 760ms, var(--s1-outro-start); }
        @keyframes subIn { to { opacity: 1; transform: translateY(0); } }

        .key-phrase {
          font-style: normal;
          position: relative;
          white-space: nowrap;
        }
        .key-phrase::after {
          content: "";
          position: absolute;
          left: 0; bottom: -2px;
          height: 1px;
          width: 0%;
          background: rgba(184, 149, 106, 0.22);
          transform-origin: left center;
          animation: underlineOnce 160ms ease-out forwards;
        }
        .subline:nth-child(1) .key-phrase::after { animation-delay: 1200ms; }
        .subline:nth-child(2) .key-phrase::after { animation-delay: 1300ms; }
        @keyframes underlineOnce {
          0%   { width: 0%; opacity: 0; }
          60%  { width: 100%; opacity: 1; }
          100% { width: 100%; opacity: 0.6; }
        }

        /* Tagline */
        .screen-front-tagline {
          margin: 0 0 56px 0;
          padding: 0;
          font-size: 13px;
          line-height: 1.5;
          color: #F5F5F0;
          opacity: 0.68;
          font-style: italic;
          font-weight: 400;
          transform: translateY(6px);
          animation:
            taglineIn 320ms cubic-bezier(0.23,1,0.32,1) 1700ms forwards,
            microOutro var(--s1-outro-dur) ease-out var(--s1-outro-start) forwards;
        }
        @keyframes taglineIn { to { opacity: 0.68; transform: translateY(0); } }
        .screen-front-tagline::after {
          content: "";
          display: block;
          width: 34px; height: 1px;
          margin-top: 18px;
          background: #B8956A;
          opacity: 0.12;
          animation: taglineShine 185ms ease-out 1860ms both;
        }
        @keyframes taglineShine {
          0%{opacity:0} 60%{opacity:.25} 100%{opacity:.12}
        }

        /* Progress visual */
        .s1-progress{
          position: relative;
          width: 120px;
          height: 6px;
          margin-top: 28px;
          opacity: 0;
          left: 0;
          animation: s1ProgFade 400ms ease var(--s1-delay) forwards;
          contain: layout style paint;
          pointer-events: none;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
          overflow: visible;
        }
        @keyframes s1ProgFade { to { opacity: 1; } }

        .s1-progress::before{
          content:"";
          position:absolute; inset:0;
          border-radius:999px;
          background: rgba(200,200,192,0.12);
          border: 1px solid rgba(200,200,192,0.08);
          z-index:1;
          box-sizing: border-box;
        }

        .s1-progress::after{
          content:"";
          position:absolute; 
          top: 1px; left: 1px; right: 1px; bottom: 1px;
          border-radius:999px;
          background:#B8956A;
          transform-origin: left center;
          transform: scaleX(0);
          will-change: transform, box-shadow;
          z-index:2;
          animation:
            s1Fill var(--s1-total) linear var(--s1-delay) forwards,
            s1Shine var(--s1-total) linear var(--s1-delay) forwards;
        }

        .s1-progress-dot{
          position:absolute; top:50%; width:7px; height:7px;
          border-radius:50%; transform: translateY(-50%);
          z-index:3; background: #B8956A; opacity: 0.85;
        }
        .s1-progress-dot.left  { left: -16px; }
        .s1-progress-dot.right { right:-16px; }

        @keyframes s1Fill{
          0%{transform:scaleX(0)}
          70%{transform:scaleX(.7)}
          80%{transform:scaleX(.81)}
          90%{transform:scaleX(.93)}
          95%{transform:scaleX(.975)}
          100%{transform:scaleX(1)}
        }
        @keyframes s1Shine{
          0%,79%{ box-shadow:none }
          80%{ box-shadow:0 0 14px rgba(184,149,106,.21), 0 0 28px rgba(184,149,106,.105) }
          82%{ box-shadow:0 0 18px rgba(184,149,106,.385), 0 0 36px rgba(184,149,106,.175), inset 0 0 10px rgba(255,255,255,.2) }
          84%{ box-shadow:0 0 14px rgba(184,149,106,.245), 0 0 28px rgba(184,149,106,.122) }
          86%,100%{ box-shadow:none }
        }

        /* Responsive */
        @media (min-width: 769px) {
          .screen-front-title { font-size: 42px; line-height: 1.22; }
          .screen-front-subtitle { font-size: 18px; }
          .screen-front-content { max-width: 580px; }
          .s1-status-label { font-size: 12px; }
          .s1-progress { width: 140px; }
        }

        /* Accessibility */
        @media (prefers-reduced-motion: reduce) {
          .h1-chunk, .subline, .screen-front-tagline, .s1-status-label {
            opacity: 1 !important;
            transform: none !important;
            animation: none !important;
          }
          .key-phrase::after, .screen-front-tagline::after {
            animation: none !important;
            opacity: 0.12 !important;
          }
          .s1-progress{ opacity:1 !important; animation:none !important; }
          .s1-progress::after{ animation:none !important; transform: scaleX(1) !important; }
          .s1-status-label { opacity: 0.85 !important; }
        }
        @media (prefers-contrast: more) {
          .s1-progress::before {
            background: rgba(200,200,192,0.18);
            border-color: rgba(200,200,192,0.12);
          }
        }
        @media (forced-colors: active) {
          .s1-progress,
          .s1-progress::before,
          .s1-progress::after,
          .s1-progress-dot {
            forced-color-adjust: none;
          }
          .s1-progress::before {
            background: CanvasText;
            opacity: .12;
            border: 1px solid CanvasText;
          }
          .s1-progress::after,
          .s1-progress-dot {
            background: CanvasText;
          }
        }
      `}</style>
    </section>
  );
}

/** TS global typing for fbq (kept single, unified with ScreenOneFront) */
declare global {
  interface Window {
    fbq: (...args: any[]) => void;
  }
}
export {};
