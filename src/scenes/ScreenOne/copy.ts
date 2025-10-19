// ScreenOne · copy (EN only) — God-Tier Version II · The Moment of Being Recognized
export const COPY = {
  // Headline（36）
  title: "Be recognized tonight—just be there.",

  // Subhead（85）
  sub1:
    "One-page map: 3 local venues, exact time & spot, one signal, plus a 90-min exit rule.",

  // Italic microline（27）
  sub2: "Not introductions. Mapping.",

  lead: [
    "Early signals show a strong fit with high-value circles.",
    "Where your presence is read instantly, invitations come warm.",
    "A signature intro lets the right people know where you belong."
  ],
  bullets: [
    "The Scenes: Not just any bar. Three vetted venues nearby, picked for tonight. Names, cross streets, and ideal area to stand or sit so eyes find you fast.",
    "The Playbook: Step-by-step—prime time window, exact seat/standing zone, plus route to reach it. No guesswork; simple moves so you look native—now.",
    "The Signal: One simple move or line that invites approach. Not a pickup line—just a small cue that lets them open first, naturally."
  ],
  trust:
    "Locations, timing can change; use judgment. Intel not outcomes.",
  // Primary CTA（含箭头的可视总长度=22；按钮内文案部分为不含箭头的文本）
  cta: "Get Tonight’s Map →",
  // Privacy/Assurance（25）
  support: "Private instant PDF—3 venues tonight, prime time, a seat, one signal.",
  footer: {
    privacy: "Privacy: used only to generate the report; export/delete anytime",
    security: "Security: TLS encryption; shortest-necessary data retention policy"
  }
} as const;

export type Copy = typeof COPY;
