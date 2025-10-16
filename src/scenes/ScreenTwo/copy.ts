// src/scenes/ScreenTwo/copy.ts

export const SCREEN_TWO_COPY = {
  // S2A（前屏）- 保持不变
  front: {
    topBar: "Kinship",
    
    title: "Early signals show you're\na natural fit for high-value circles",
    
    subtitle: [
      "Your answers reveal where you're naturally recognized—without self-translation.",
      "The full report shows your exact entry points."
    ],
    
    valueCards: [
      {
        id: "card-1",
        title: "Where you're readily recognized",
        body: "Settings where your presence is read instantly—members-only dinners, invite-only salons, off-agenda drinks—where introductions come warm.",
        footer: "Full report: specific circle types + entry paths."
      },
      {
        id: "card-2",
        title: "Why you're preferred there",
        body: "Your traits that bypass the frictions others face.",
        footer: "Full report: exact scarce traits + real examples."
      },
      {
        id: "card-3",
        title: "What to say about yourself (right away)",
        body: "One line that signals your value—before any conversation.",
        footer: "Full report: complete, ready-to-use intro."
      }
    ],
    
    socialProof: {
      mainText: "30,000+ women—including McKinsey, Goldman Sachs, Google executives and VC-backed founders.",
      weeklyCount: "4,247 this week."
    },
    
    cta: {
      button: "See access options",
      microcopy: "Pricing and delivery details on the next page"
    }
  },
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔥 S2B（后屏）- 策略B优化版（只保留1条评价）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  back: {
    topBar: "Kinship",
    
    title: "Your positioning clarity is\none step away",
    
    socialProof: {
      heading: "The women at Goldman Sachs, McKinsey, and Google who already know where they fit—30,000+ of them—didn't guess.",
      companies: {
        finance: ["Goldman Sachs", "McKinsey", "Google"],
        consulting: [],
        tech: []
      },
      stats: [
        "4,247 women got their report this week.",
        "4.8/5 ⭐ — They're not trying to fit anymore. They found their circle.",
        ""
      ]
    },
    
    priceAnchor: {
      price: "",
      heading: "",
      items: [],
      delivery: "",
      ownership: ""
    },
    
    assurance: {
      line1: "This isn't about fixing you or teaching you to network better.",
      line2: "It's about finding where you're already the right fit—no translation needed."
    },
    
    cta: {
      button: "Get my positioning clarity",
      microcopy: "See full details before you decide · $49"
    },
    
    // 🔥 策略B：只保留最强力的1条评价（节省 ~70px）
    testimonials: [
      {
        quote: "I was exhausted from pretending to fit. Then I realized—I don't need to translate myself. I just needed to find my circle.",
        author: "Sarah K., now at a firm that gets her"
      }
    ],
    
    statsBar: {
      text: "30,000+ women in your industry already have this clarity.",
      rating: "",
      clarity: "Your room is waiting."
    },
    
    faq: {
      trigger: "",
      items: []
    },
    
    complianceNote: "Company names represent self-reported affiliations and do not imply endorsement."
  }
};

export default SCREEN_TWO_COPY;