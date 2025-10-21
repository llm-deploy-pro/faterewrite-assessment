// src/scenes/ScreenTwo/copy.ts

export const SCREEN_TWO_COPY = {
  // Tonight's Map - 单页面文案（第三屏 · 强社会证明 · 收官版）
  back: {
    topBar: "Kinship",
    
    // Headline（强证据）
    headline: {
      main: "Patch the right code. Reality moves fast.",
      sub: "Field notes this cycle — Debugger #284 · #079 · #412"
    },
    
    // Recent Reader Notes（以证言容器呈现）
    testimonial: {
      quote:
        "LA · Fri 8:34 PM — “Deployed Override-1. Old loop surfaced; ignored. Opened target convo in <3 min.”  •  NYC · Thu 7:52 PM — “Two high-value intros with zero pitch—felt like a system update.”  •  MIA · Sat 9:18 PM — “97% crash pattern triggered. Used Constraint Key #2. Exited with asset.”",
      author: "Recent Field Logs"
    },
    
    // Final Checklist（最终交付物清单）
    valueList: [
      "This cycle’s 3 structural misroutes",
      "The prime-failure window & recurring decoy loop",
      "Your “out of sync” signature analysis",
      "The 48-hour override command that lands"
    ],
    
    // Final CTA
    cta: {
      button: "Unlock Protocol →",
      microcopy: "Validated across 17,839 protocol runs. 11h window remains. Private PDF. Intel, not outcomes. Not therapy."
    },
    
    // Footer（保持原有安心文案，以免版式突变）
    footer: {
      text: "Trusted clarity for 30,000+ readers. Your route is waiting."
    }
  },
  
  // 保留front属性以避免其他文件引用报错（不改）
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
