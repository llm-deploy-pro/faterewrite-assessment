// ScreenOne · copy (EN only) — Ultimate Black Book Edition (极致版)
export const COPY = {
  // Headline（46字符）- 保持不变
  title: "Insider's Black Book — be in the right rooms.",

  // Subhead（最终策略版本 - 具体交付物）
  sub1: "This month's insider shortlist: 3 specific venues, the prime-time window, the exact stand zone, and the opener that lands.",

  // Key Points（最终策略版本 - 更具体更内行）
  keyPoints: [
    "where to be seen fast",
    "how to look \"of the room\"",
    "the first sentence"
  ],

  // 极致版文案 - Section Lead（保持原样）
  lead: [
    "47 women used this. 41 are now ungoogleable.",
    "The $50M Miami list (expires in 72h)",
    "A signature intro lets the right people know where you belong."
  ],

  // 极致版文案 - 三大模块（保持原样）
  bullets: [
    "The Kill Zones: 7 addresses worth $500M/night. Penthouse 67 — Where divorces create millionaires (Tuesdays only, 10:47pm entry).",
    "The Formula: Say these 9 words. Watch him invest. Ignore everyone. Corner table. Whisper: 'My fund closes Thursday.' Then silence.",
    "The Exit: Make him chase by walking away first. 'I don't date. I evaluate. Your portfolio has 10 seconds.'"
  ],

  // 保持原有免责（简洁有力）
  trust: "Locations, timing can change; use judgment. Intel not outcomes.",
  
  // Primary CTA - 极致版（保持原样）
  cta: "Download Before Midnight →",
  
  // Secondary CTA（保持原样）
  ctaAlt: "See who's single this week →",
  
  // Privacy/Assurance - 添加紧迫感（保持原样）
  support: "117 copies left. Private PDF expires at midnight.",
  
  footer: {
    privacy: "Privacy: used only to generate the report; export/delete anytime",
    security: "Security: TLS encryption; shortest-necessary data retention policy"
  }
} as const;

export type Copy = typeof COPY;
