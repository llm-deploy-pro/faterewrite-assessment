// ScreenOne · copy (EN only) — Destiny Debug Report Edition
export const COPY = {
  // 第一屏文案（保持不变）
  topLabel: "System Log — 7B Self-Check",
  title: "Destiny Debug Report — be in the right timeline.",
  sub1: "This cycle's debug shortlist: 3 structural misroutes in your source code, the prime-failure window, the exact recurring decoy loop, and the override that lands.",
  keyPoints: [
    "where the 7B hijack hits your route",
    "how you read as \"out of sync\"", 
    "the 48-hour override"
  ],
  statusLabel: "Self-check engine ready",
  membersCount: "487 7B signatures logged this cycle",
  ctaText: "Generate My Debug Report",
  privacyNote: "Encrypted. One-time generation. Not therapy.",

  // 第二屏文案（全部替换）
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