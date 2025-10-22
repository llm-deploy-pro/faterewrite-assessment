// ScreenOne · copy (EN only) — Timeline Calibration Protocol Edition

export const COPY = {
  // Phase A · Hero (Front Screen)
  topLabel: "SYSTEM LOG // CALIBRATION",
  title: "Timeline Calibration Protocol",
  sub1: "Destiny is a system. Debug it.",
  executiveBriefingLabel: "EXECUTIVE BRIEFING:",
  keyPoints: [
    "Identifies the vector of your 7B hijack",
    "Calculates your signal-to-noise ratio (\"out of sync\")",
    "Generates the 48-hour override key"
  ],
  statusLabel: "SYSTEM STATUS: STANDBY. 487 SIGNATURES LOGGED THIS CYCLE. ENGINE NOMINAL.",
  ctaText: "Access the Self-Check Interface",
  privacyNote: "Proprietary framework. One-time protocol generation. Not therapy or astrological advice.",
  
  // Phase B · Back Screen (Not shown in current component but included for completeness)
  backTopLabel: "System Alert — Pattern 7B Analysis",
  
  lead: [
    "Last cycle, 137 7B signatures ignored the protocol.",
    "129 stalled at 97% — their routes went dark.",
    "Your self-check window (expires in 11h)."
  ],
  
  bullets: [
    {
      title: "The Glitch Zone:",
      text: "Location Log: high-value rooftop mixers. The 7B hijack spikes at 8:47 PM—exactly when C-level attention is most fluid. You feel the urge to \"wait for the perfect moment.\" The window shifts. Route resets. No opener lands."
    },
    {
      title: "The Decoy Formula:",
      text: "Five words that collapse status: \"I just need one chance.\" Micro-withdrawal follows—you've signaled need, not value. The working route was silence, a slight nod, 0.7s eye contact, then the premise line: \"My next move is already funded.\" No pitch."
    },
    {
      title: "The Override Command:",
      text: "Exit first to reframe: \"My time is allocated.\" Not a rejection—a calibration. Presumed value > proven value. Your Debug Protocol contains the full 48-hour script and timing marks."
    }
  ],
  
  cta: "Generate Protocol →",
  ctaAlt: "See who's single this week →",
  support: "117 protocol files remain. Private PDF access expires at lockdown.",
  trust: "Locations and timing can shift; use judgment. Intel, not outcomes.",
  
  footer: {
    privacy: "Privacy: used only to generate the report; export/delete anytime",
    security: "Security: TLS encryption; shortest-necessary data retention policy"
  }
} as const;

export type Copy = typeof COPY;