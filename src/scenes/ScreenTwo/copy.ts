// src/scenes/ScreenTwo/copy.ts

export const SCREEN_TWO_COPY = {
  // S2A（前屏）文案
  front: {
    topBar: "Kinship",
    
    title: "Early signals show you're\na natural fit for high-value circles",
    
    subtitle: [
      "Three insights from your answers—clear enough to see where you fit now.",
      "It's not that you failed; you just haven't been placed where you're naturally understood.",
      "The complete picture lives in your full report."
    ],
    
    valueCards: [
      {
        id: "card-1",
        title: "Where you're readily recognized",
        body: "The specific settings where your natural presence is immediately understood—without self-translation or performance.",
        footer: "Preview only. Full report names the specific circles and entry points."
      },
      {
        id: "card-2",
        title: "Why you're preferred there",
        body: "Which of your traits are naturally scarce in these settings—and why they tend to sidestep the frictions others face.",
        footer: "Preview only. Full report lists your exact scarce traits with real-world examples."
      },
      {
        id: "card-3",
        title: "What to say about yourself (right away)",
        body: "A single, calibrated introduction that signals your value to the right people—before any long conversation.",
        footer: "Preview only. Full report includes a complete, ready-to-use introduction line."
      }
    ],
    
    socialProof: {
      mainText: "Over 30,000 women have completed their assessment—including executives at McKinsey, Goldman Sachs, Google, and founders backed by top-tier VCs.",
      weeklyCount: "4,247 assessments completed this week alone."
    },
    
    cta: {
      button: "See access options",
      microcopy: "Pricing and delivery details on the next page"
    }
  },
  
  // S2B（后屏）文案
  back: {
    topBar: "Kinship",
    
    title: "Your positioning clarity\nis one step away",
    
    socialProof: {
      heading: "Trusted by ambitious women across finance, consulting, tech, and startups",
      companies: {
        finance: ["Goldman Sachs", "Morgan Stanley", "Blackstone", "JPMorgan", "Citi"],
        consulting: ["McKinsey", "BCG", "Bain", "Deloitte", "Accenture"],
        tech: ["Google", "Meta", "Amazon", "Stripe", "YC-backed founders"]
      },
      stats: [
        "4,247 women completed their assessment this week",
        "Over 30,000 since launch",
        "Average rating: 4.8/5 ⭐"
      ]
    },
    
    priceAnchor: {
      price: "One-time access · $49",
      heading: "What's inside your full report:",
      items: [
        {
          main: "Specific circle names and practical entry points",
          sub: "(not just \"high-value circles\")"
        },
        {
          main: "Your exact scarce traits with real-world examples",
          sub: "(not just \"why you're preferred\")"
        },
        {
          main: "A complete, ready-to-use introduction line",
          sub: "(not just \"how to position\")"
        }
      ],
      delivery: "Delivered as an interactive digital report + executive PDF (emailed).",
      ownership: "No subscription. Yours to keep."
    },
    
    assurance: {
      line1: "Methodology-backed insights tailored to your responses—clear directional guidance, not guaranteed outcomes.",
      line2: "Not introductions. Not coaching."
    },
    
    cta: {
      button: "Continue to secure checkout",
      microcopy: "Review full order details before payment"
    },
    
    testimonials: [
      {
        quote: "The positioning clarity I got in 10 minutes would have taken months of networking and trial-and-error to figure out on my own.",
        author: "Sarah K., Strategy Consultant"
      },
      {
        quote: "Finally—someone who gets it. Not about fixing myself, but about finding where I'm already the right fit.",
        author: "Lisa M., Startup Founder"
      }
    ],
    
    statsBar: {
      text: "Join 30,000+ women who've invested in their positioning clarity",
      rating: "Average satisfaction: 4.8/5 ⭐",
      clarity: "89% report clearer direction within first read"
    },
    
    faq: {
      trigger: "Common questions",
      items: [
        {
          q: "What exactly will I receive?",
          a: [
            "A concise, personalized assessment across three dimensions:",
            "",
            "• Recognition contexts: specific settings and circle names where you're naturally understood",
            "• Natural advantages: your exact scarce traits with real-world examples of how they bypass common frictions",
            "• Precise positioning: one complete, ready-to-use introduction line that signals your value immediately",
            "",
            "Delivered as an interactive digital report (browser-based) plus an executive PDF, emailed typically within minutes of purchase."
          ]
        },
        {
          q: "Is this matchmaking or coaching?",
          a: [
            "No. This is a private positioning assessment—an analytical reading of social compatibility patterns based on your responses.",
            "",
            "No introductions. No relationship coaching. No guaranteed outcomes.",
            "",
            "What you receive is directional clarity: where you're likely to be readily recognized, why, and how to signal that fit immediately."
          ]
        },
        {
          q: "What if I can't access the report after payment?",
          a: [
            "You'll receive instant browser access plus a PDF copy via email (typically within minutes).",
            "",
            "If technical issues occur, contact us via the support link at the bottom of this page—we'll restore access promptly or issue a refund if needed.",
            "",
            "Your satisfaction matters: our 4.8/5 average rating reflects our commitment to resolving any access issues quickly."
          ]
        },
        {
          q: "Is my data private?",
          a: [
            "Yes. Your responses are used only to generate your personalized assessment and are never sold or shared with third parties.",
            "",
            "You can request deletion of your data anytime via the support link. We comply with GDPR and CCPA privacy standards."
          ]
        }
      ]
    }
  }
};

export default SCREEN_TWO_COPY;