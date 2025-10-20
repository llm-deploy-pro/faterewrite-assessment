// src/scenes/ScreenTwo/copy.ts

export const SCREEN_TWO_COPY = {
  // Tonight's Map - 单页面文案（第三屏 · 强社会证明 · 收官版）
  back: {
    topBar: "Kinship",
    
    // Headline（强证据）
    headline: {
      main: "When you’re in the right room, it moves fast.",
      sub: "Field notes this week — Los Angeles, New York, Miami"
    },
    
    // Recent Reader Notes（以证言容器呈现）
    testimonial: {
      quote:
        "Los Angeles · Fri 8:34 PM — “Stood in the zone; bartender glanced twice. Conversation opened in under 10 minutes.”  •  New York · Thu 7:52 PM — “R2 timing hit. Two intros without trying—felt native, not ‘trying’.”  •  Miami · Sat 9:18 PM — “Opener #2 worked instantly. Stayed 70 minutes, left high.”",
      author: "Recent Reader Notes"
    },
    
    // Final Checklist（最终交付物清单）
    valueList: [
      "This month’s 3 rooms that matter",
      "Prime-time window and the exact stand zone",
      "Entry cues that read as “of the room”",
      "One-line opener that lands"
    ],
    
    // Final CTA
    cta: {
      button: "Unlock the Black Book",
      microcopy: ""
    },
    
    // Footer（保持原有安心文案，以免版式突变）
    footer: {
      text: "Trusted clarity for 30,000+ women. Your room is waiting."
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
