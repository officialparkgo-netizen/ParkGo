/**
 * Guided-support knowledge base: each topic pairs a chip label with an answer
 * from the translated FAQ content, plus keywords for free-text matching.
 * Matching is deterministic and works offline — the escalation path to a
 * human agent covers everything it can't answer.
 */
export interface SupportTopic {
  id: string;
  labelKey: string;
  answerKey: string;
  keywords: string[];
}

export const SUPPORT_TOPICS: SupportTopic[] = [
  {
    id: "cancel",
    labelKey: "support.topic.cancel",
    answerKey: "support.answer.cancel",
    keywords: ["cancel", "refund", "money back", "change my booking", "rebook", "cancellation"],
  },
  {
    id: "included",
    labelKey: "support.topic.included",
    answerKey: "faq.t1.a",
    keywords: ["included", "include", "bundle", "what do i get", "package"],
  },
  {
    id: "safety",
    labelKey: "support.topic.safety",
    answerKey: "faq.t2.a",
    keywords: ["safe", "cctv", "camera", "security", "watch my car", "theft", "damage", "insurance"],
  },
  {
    id: "transfer",
    labelKey: "support.topic.transfer",
    answerKey: "faq.t3.a",
    keywords: ["transfer", "driver", "taxi", "shuttle", "terminal", "pick me up", "drop me"],
  },
  {
    id: "delay",
    labelKey: "support.topic.delay",
    answerKey: "faq.t4.a",
    keywords: ["delay", "delayed", "late flight", "flight change", "missed my"],
  },
  {
    id: "payment",
    labelKey: "support.topic.payment",
    answerKey: "support.answer.payment",
    keywords: ["pay", "price", "cost", "charge", "card", "receipt", "invoice", "fee", "extend"],
  },
  {
    id: "airports",
    labelKey: "support.topic.airports",
    answerKey: "faq.t5.a",
    keywords: [
      "airport", "airports", "heathrow", "gatwick", "luton", "stansted",
      "manchester", "birmingham", "edinburgh", "dublin", "which cities", "where do you",
    ],
  },
  {
    id: "host",
    labelKey: "support.topic.host",
    answerKey: "faq.h1.a",
    keywords: ["host", "list my", "earn", "payout", "rent my", "driveway", "landlord", "my space"],
  },
];

/** Match free text to a topic, or null when the assistant should escalate. */
export function matchSupportIntent(text: string): SupportTopic | null {
  const q = text.toLowerCase();
  if (!q.trim()) return null;
  for (const topic of SUPPORT_TOPICS) {
    if (topic.keywords.some((k) => q.includes(k))) return topic;
  }
  return null;
}
