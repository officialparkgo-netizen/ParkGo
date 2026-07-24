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
    keywords: [
      "cancel", "refund", "money back", "change my booking", "rebook", "cancellation",
      // ur / hi / de / zh
      "منسوخ", "ریفنڈ", "پیسے واپس", "रद्द", "रिफंड", "पैसे वापस",
      "stornieren", "storno", "erstattung", "geld zurück", "取消", "退款",
    ],
  },
  {
    id: "included",
    labelKey: "support.topic.included",
    answerKey: "faq.t1.a",
    keywords: [
      "included", "include", "bundle", "what do i get", "package",
      "شامل", "پیکیج", "शामिल", "पैकेज", "enthalten", "inklusive", "paket",
      "包含", "套餐",
    ],
  },
  {
    id: "safety",
    labelKey: "support.topic.safety",
    answerKey: "faq.t2.a",
    keywords: [
      "safe", "cctv", "camera", "security", "watch my car", "theft", "damage", "insurance",
      "محفوظ", "کیمرہ", "سیکیورٹی", "نقصان", "बीमा", "सुरक्षा", "कैमरा", "नुकसान",
      "sicher", "kamera", "versicherung", "schaden", "安全", "摄像", "保险", "损坏",
    ],
  },
  {
    id: "transfer",
    labelKey: "support.topic.transfer",
    answerKey: "faq.t3.a",
    keywords: [
      "transfer", "driver", "taxi", "shuttle", "terminal", "pick me up", "drop me",
      "ٹرانسفر", "ڈرائیور", "ٹیکسی", "ट्रांसफ़र", "ड्राइवर", "टैक्सी",
      "fahrer", "abholen", "接送", "司机", "航站楼",
    ],
  },
  {
    id: "delay",
    labelKey: "support.topic.delay",
    answerKey: "faq.t4.a",
    keywords: [
      "delay", "delayed", "late flight", "flight change", "missed my",
      "تاخیر", "فلائٹ لیٹ", "देरी", "फ्लाइट लेट", "verspätung", "verspätet",
      "延误", "晚点", "航班改",
    ],
  },
  {
    id: "payment",
    labelKey: "support.topic.payment",
    answerKey: "support.answer.payment",
    keywords: [
      "pay", "price", "cost", "charge", "card", "receipt", "invoice", "fee", "extend",
      "قیمت", "ادائیگی", "رسید", "کارڈ", "क़ीमत", "कीमत", "भुगतान", "रसीद",
      "preis", "bezahl", "zahlung", "quittung", "rechnung", "价格", "支付", "收据", "发票",
    ],
  },
  {
    id: "airports",
    labelKey: "support.topic.airports",
    answerKey: "faq.t5.a",
    keywords: [
      "airport", "airports", "heathrow", "gatwick", "luton", "stansted",
      "manchester", "birmingham", "edinburgh", "dublin", "which cities", "where do you",
      "ایئرپورٹ", "ہوائی اڈہ", "एयरपोर्ट", "हवाई अड्डा", "flughafen", "机场", "哪些城市",
    ],
  },
  {
    id: "host",
    labelKey: "support.topic.host",
    answerKey: "faq.h1.a",
    keywords: [
      "host", "list my", "earn", "payout", "rent my", "driveway", "landlord", "my space",
      "میزبان", "کمائی", "جگہ کرائے", "मेज़बान", "कमाई", "किराए पर",
      "gastgeber", "verdienen", "vermieten", "stellplatz", "房东", "出租", "赚钱",
    ],
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
