// src/scenes/ScreenTwo/copy.ts

export const SCREEN_TWO_COPY = {
  // Tonight's Map - 单页面文案（10分优化版）
  back: {
    topBar: "Kinship",
    
    // Headline（强证据）- 优化破折号
    headline: {
      main: "Join 4,247 women who got Tonight's Map this week",
      sub: "30,000+ already use it to stop guessing and be noticed—tonight" // 使用em dash
    },
    
    // Golden Testimonial（黄金证言）
    testimonial: {
      quote: "I went where the map said—the hotel bar by 8:30. Someone started talking to me within ten minutes. It felt effortless.",
      author: "Sarah K., Los Angeles"
    },
    
    // Value Recap（统一移除句号，保持一致性）
    valueList: [
      "Instant PDF — one page in under 60 seconds",
      "Tonight's intel — 3 vetted venues, prime-time window, exact seat/zone",
      "One subtle signal — a cue that lets them open first",
      "One-time $49 — no subscription, no hidden fees",
      "Private & compliant — not a matchmaking service; no names, no guarantees"
    ],
    
    // Final CTA
    cta: {
      button: "Get Tonight's Map — $49",
      microcopy: "Updates daily by 5 PM. Instant download."
    },
    
    // Footer reassurance
    footer: {
      text: "Trusted clarity for 30,000+ women. Your room is waiting."
    }
  },
  
  // 保留front属性以避免其他文件引用报错
  front: {
    topBar: "Kinship",
    title: "",
    subtitle: [],
    valueCards: [],
    socialProof: {
      mainText: "",
      weeklyCount: ""
    },
    cta: {
      button: "",
      microcopy: ""
    }
  }
};

export default SCREEN_TWO_COPY;