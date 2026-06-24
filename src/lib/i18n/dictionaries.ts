import type { Locale } from "@/types";

/**
 * Flat, dotted-key dictionaries. `en` is the complete source of truth; other
 * locales translate a representative subset and fall back to English for any
 * missing key (see getDictionary). This demonstrates the switcher + RTL while
 * keeping the dataset maintainable; full coverage is a content task, not code.
 */
export type Dict = Record<string, string>;

const en: Dict = {
  "brand.tagline": "Park Smart. Travel Easy.",
  "nav.travellers": "For Travellers",
  "nav.hosts": "For Hosts",
  "nav.transfer": "For Transfer Partners",
  "nav.pricing": "Pricing",
  "nav.trust": "Trust & Safety",
  "nav.how": "How it works",
  "nav.signin": "Sign in",
  "nav.getStarted": "Get started",
  "hero.title": "Airport parking, transfer, EV & security — one booking.",
  "hero.subtitle":
    "ParkGo bundles a verified private parking space, a licensed terminal transfer, EV charging and live security into a single price and a single checkout. Across the UK & Ireland.",
  "hero.searchCta": "Find parking",
  "hero.airport": "Airport",
  "hero.from": "From",
  "hero.to": "To",
  "hero.trustline": "Verified hosts · Licensed drivers · Live camera · CCTV",
  "common.search": "Search",
  "common.book": "Book now",
  "common.learnMore": "Learn more",
  "common.from": "from",
  "common.perDay": "/ day",
  "common.allIn": "all-in",
  "common.bookBundle": "Book bundle",
  "common.joinWaitlist": "Join the waitlist",
  "common.email": "Email address",
  "common.submit": "Submit",
  "value.bundle.title": "One bundle, one price",
  "value.bundle.body": "Parking + licensed transfer + EV + security, combined at checkout.",
  "value.trust.title": "Verified & secure",
  "value.trust.body": "ID-checked hosts, licensed drivers, CCTV and a live camera of your car.",
  "value.realtime.title": "Live on travel day",
  "value.realtime.body": "Track your driver, watch your car, confirm a verified handover in-app.",
  "value.ev.title": "EV ready",
  "value.ev.body": "Filter for on-site charging and arrive to a topped-up car.",
  "footer.product": "Product",
  "footer.company": "Company",
  "footer.legal": "Legal",
  "footer.rights": "All rights reserved.",
  "waitlist.title": "Be first to park smart",
  "waitlist.body": "Join the waitlist and we'll let you know when ParkGo launches at your airport.",
  "waitlist.success": "You're on the list. We'll be in touch.",
};

const ur: Dict = {
  "brand.tagline": "ہوشیاری سے پارک کریں۔ آسانی سے سفر کریں۔",
  "nav.travellers": "مسافروں کے لیے",
  "nav.hosts": "میزبانوں کے لیے",
  "nav.transfer": "ٹرانسفر پارٹنرز کے لیے",
  "nav.pricing": "قیمتیں",
  "nav.trust": "اعتماد اور حفاظت",
  "nav.how": "یہ کیسے کام کرتا ہے",
  "nav.signin": "سائن ان",
  "nav.getStarted": "شروع کریں",
  "hero.title": "ایئرپورٹ پارکنگ، ٹرانسفر، ای وی اور سیکیورٹی — ایک ہی بکنگ۔",
  "hero.subtitle":
    "پارک گو ایک تصدیق شدہ نجی پارکنگ، لائسنس یافتہ ٹرمینل ٹرانسفر، ای وی چارجنگ اور لائیو سیکیورٹی کو ایک قیمت میں جوڑتا ہے۔",
  "hero.searchCta": "پارکنگ تلاش کریں",
  "common.book": "ابھی بک کریں",
  "common.joinWaitlist": "ویٹ لسٹ میں شامل ہوں",
  "common.email": "ای میل ایڈریس",
};

const hi: Dict = {
  "brand.tagline": "स्मार्ट पार्क करें। आसानी से यात्रा करें।",
  "nav.travellers": "यात्रियों के लिए",
  "nav.hosts": "होस्ट के लिए",
  "nav.transfer": "ट्रांसफर पार्टनर के लिए",
  "nav.pricing": "मूल्य निर्धारण",
  "nav.trust": "भरोसा और सुरक्षा",
  "nav.how": "यह कैसे काम करता है",
  "nav.signin": "साइन इन",
  "nav.getStarted": "शुरू करें",
  "hero.title": "एयरपोर्ट पार्किंग, ट्रांसफर, ईवी और सुरक्षा — एक बुकिंग।",
  "hero.subtitle":
    "ParkGo एक सत्यापित निजी पार्किंग, लाइसेंस प्राप्त ट्रांसफर, ईवी चार्जिंग और लाइव सुरक्षा को एक ही कीमत में जोड़ता है।",
  "hero.searchCta": "पार्किंग खोजें",
  "common.book": "अभी बुक करें",
  "common.joinWaitlist": "वेटलिस्ट में शामिल हों",
  "common.email": "ईमेल पता",
};

const de: Dict = {
  "brand.tagline": "Clever parken. Entspannt reisen.",
  "nav.travellers": "Für Reisende",
  "nav.hosts": "Für Gastgeber",
  "nav.transfer": "Für Transferpartner",
  "nav.pricing": "Preise",
  "nav.trust": "Vertrauen & Sicherheit",
  "nav.how": "So funktioniert's",
  "nav.signin": "Anmelden",
  "nav.getStarted": "Loslegen",
  "hero.title": "Flughafenparken, Transfer, E-Auto & Sicherheit — eine Buchung.",
  "hero.subtitle":
    "ParkGo bündelt einen geprüften privaten Stellplatz, einen lizenzierten Transfer, das Laden von E-Autos und Live-Sicherheit zu einem Preis.",
  "hero.searchCta": "Parkplatz finden",
  "common.book": "Jetzt buchen",
  "common.joinWaitlist": "Warteliste beitreten",
  "common.email": "E-Mail-Adresse",
};

const zh: Dict = {
  "brand.tagline": "聪明停车，轻松出行。",
  "nav.travellers": "旅客专区",
  "nav.hosts": "房东专区",
  "nav.transfer": "接送合作伙伴",
  "nav.pricing": "价格",
  "nav.trust": "信任与安全",
  "nav.how": "运作方式",
  "nav.signin": "登录",
  "nav.getStarted": "开始使用",
  "hero.title": "机场停车、接送、电动车充电与安全 — 一次预订全搞定。",
  "hero.subtitle":
    "ParkGo 将经过验证的私人停车位、持牌航站楼接送、电动车充电和实时安防整合为一个价格、一次结账。",
  "hero.searchCta": "查找停车位",
  "common.book": "立即预订",
  "common.joinWaitlist": "加入等候名单",
  "common.email": "电子邮箱",
};

export const dictionaries: Record<Locale, Dict> = { en, ur, hi, de, zh };
