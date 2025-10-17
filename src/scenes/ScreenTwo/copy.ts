export const SCREEN_TWO_COPY = {
  // S2A（前屏）- 保持不变
  front: {
    topBar: "Kinship",
    
    title: "Early signs confirm\na natural fit in selective circles",
    
    subtitle: [
      "Your answers reveal the places you're read without effort—no self-translation required.",
      "The full blueprint names the fastest opening doors for you."
    ],
    
    valueCards: [
      {
        id: "card-1",
        title: "Where you're instantly recognized",
        body: "Settings that read you quickly—members-only dinners, invite-only salons, off-agenda drinks—so intros arrive warm.",
        footer: "Full report: exact circle types + entry paths."
      },
      {
        id: "card-2",
        title: "Why you're preferred there",
        body: "Your signals that glide past frictions others still meet.",
        footer: "Full report: scarce signals + lived examples."
      },
      {
        id: "card-3",
        title: "What to say about yourself (right away)",
        body: "One signature line that announces your value—before any conversation begins.",
        footer: "Full report: complete, ready-to-use intro."
      }
    ],
    
    socialProof: {
      mainText: "Trusted by 30,000+ women pursuing exceptional lives across industries and cities worldwide.",
      weeklyCount: "4,247 chose clarity this week."
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
    
    title: "Your recognition signal is\none step away",
    
    socialProof: {
      heading: "30,000+ women didn't guess—they followed a profile that showed exactly where they're received as themselves.",
      companies: {
        finance: [],
        consulting: [],
        tech: []
      },
      stats: [
        "4,247 chose clarity this week.",
        "4.8/5 ★ — \"It felt like someone finally handed me the map.\"",
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
      line1: "No coaching pitch—just a map to rooms already ready for you.",
      line2: "You're the right fit; translation isn't needed."
    },
    
    cta: {
      button: "Unlock my recognition signal",
      microcopy: "See full details before you decide · $49"
    },
    
    // 🔥 策略B：只保留最强力的1条评价（节省 ~70px）
    testimonials: [
      {
        quote: "I stopped trying to fit. Once I saw my map, invitations found me—without forcing anything.",
        author: "Sarah K., finally placed where her value reads"
      }
    ],
    
    statsBar: {
      text: "Trusted clarity for 30,000+ women building uncommon lives.",
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
