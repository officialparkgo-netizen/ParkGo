import type { AreaDict } from "@/lib/i18n/config";

// How-it-works + FAQ. Keys namespaced "how.*" and "faq.*".
// English is the source of truth; other locales fall back to English per-key.
// NOTE: FAQ on-page JSON-LD stays English (separate source in faq/page.tsx) for SEO;
// only the visible Q&A is translated via these keys.
export const marketingA: AreaDict = {
  en: {
    // -------------------------------------------------------------- How it works
    "how.hero.badge": "One booking · one price · one app",
    "how.hero.title": "How ParkGo works, from search to verified handover",
    "how.hero.subtitle":
      "Most travellers juggle parking, a transfer and EV charging across three apps and prices. ParkGo brings them into a single trusted journey you can watch the whole way.",
    "how.hero.cta": "Start a booking",
    "how.hero.pricing": "See pricing",

    "how.journey.eyebrow": "The traveller journey",
    "how.journey.title": "Five steps from your driveway search to landing back home",
    "how.journey.body":
      "Every step is verified, transparent and tracked. No surprises at the gate, no guessing where your car is.",

    "how.step1.title": "Search & compare",
    "how.step1.body":
      "Tell us your airport and dates. ParkGo shows verified private spaces with price, distance to the terminal, EV charging, CCTV and real traveller ratings — side by side, no hidden extras.",
    "how.step1.point1": "Verified, ID-checked hosts only",
    "how.step1.point2": "Transparent per-day pricing",
    "how.step1.point3": "Filter by EV, CCTV and distance",

    "how.step2.title": "Build your bundle",
    "how.step2.body":
      "Add a licensed terminal transfer, EV charging and live security to your parking — then pay once. Explainable AI suggests the right combination for your trip, with a single transparent price.",
    "how.step2.point1": "Parking + transfer + EV + security",
    "how.step2.point2": "One checkout, one price",
    "how.step2.point3": "AI suggestions you can understand",

    "how.step3.title": "Pay & get your QR",
    "how.step3.body":
      "Check out securely and receive a QR access code instantly. It is everything you need for the parking gate, your driver and the verified handover — all stored in your booking.",
    "how.step3.point1": "Secure card payment",
    "how.step3.point2": "Instant QR access code",
    "how.step3.point3": "Booking saved offline in-app",

    "how.step4.title": "Travel day",
    "how.step4.body":
      "Watch it all happen. Track your licensed driver on a live map, see your parked car on a live in-app camera, and confirm a verified handover with a one-time code — timestamped and logged.",
    "how.step4.point1": "Live map of customer, host & driver",
    "how.step4.point2": "Live camera of your car",
    "how.step4.point3": "Verified, logged handover",

    "how.step5.title": "Return & review",
    "how.step5.body":
      "Land, get picked up and collect your car with another verified handover. Then rate your host and driver — two-sided trust scoring keeps the whole network honest and high quality.",
    "how.step5.point1": "Return transfer on landing",
    "how.step5.point2": "Collect with verified handover",
    "how.step5.point3": "Two-sided reviews",

    "how.live.eyebrow": "Live on travel day",
    "how.live.title": "Peace of mind you can actually watch",
    "how.live.body":
      "ParkGo's differentiators come alive the day you fly. These three features turn a stressful morning into something you can follow in real time.",
    "how.live.feat1.title": "Live location sharing",
    "how.live.feat1.body": "You, your host and your licensed driver share one live map on travel day.",
    "how.live.feat2.title": "Live camera of your car",
    "how.live.feat2.body": "Open the app to watch your parked vehicle with a LIVE badge and timestamp.",
    "how.live.feat3.title": "Verified handover",
    "how.live.feat3.body": "Both parties confirm a one-time code at drop-off and collection — every event logged.",

    "how.bundle.eyebrow": "One transparent price",
    "how.bundle.title": "Four services, bundled into a single checkout",
    "how.bundle.body":
      "No bouncing between providers or comparing apples with oranges. ParkGo combines everything into one price you can understand, with a small, clearly shown service fee.",
    "how.bundle.item1.title": "Verified private parking",
    "how.bundle.item1.body": "An ID-checked host's driveway or yard near your terminal.",
    "how.bundle.item2.title": "Licensed terminal transfer",
    "how.bundle.item2.body": "A licensed, insured driver to and from the airport door.",
    "how.bundle.item3.title": "EV charging",
    "how.bundle.item3.body": "Top up while you travel where the host offers a charger.",
    "how.bundle.item4.title": "Live security",
    "how.bundle.item4.body": "CCTV, a live camera and verified handovers throughout.",

    "how.example.label": "Example bundle",
    "how.example.parking": "Airport parking",
    "how.example.parkingV": "from your chosen host",
    "how.example.transfer": "Licensed transfer",
    "how.example.transferV": "both ways",
    "how.example.ev": "EV charging",
    "how.example.evV": "optional add-on",
    "how.example.fee": "Service fee",
    "how.example.onePrice": "One price at checkout",
    "how.example.note":
      "Indicative example. Your price depends on airport, dates and the add-ons you choose.",
    "how.example.cta": "How pricing works",

    "how.other.eyebrow": "The other side of the network",
    "how.other.title": "How hosting works, and who runs your transfer",
    "how.other.body":
      "Travellers get a seamless trip because hosts are verified and the terminal transfer is handled by a licensed operator. Here is the short version of each.",

    "how.hosts.title": "For hosts",
    "how.hosts.step1.title": "Get verified",
    "how.hosts.step1.body": "Confirm your identity and address, then add your space — dimensions, EV, CCTV and photos.",
    "how.hosts.step2.title": "Go live",
    "how.hosts.step2.body": "Pass a quick compliance review, set availability and your driveway starts earning.",
    "how.hosts.step3.title": "Get paid",
    "how.hosts.step3.body": "Receive secure payouts after each completed booking — you keep the large majority.",
    "how.hosts.cta": "List your space",

    "how.transfer.title": "Who runs your transfer",
    "how.transfer.body1":
      "ParkGo does not run a fleet or onboard drivers. Your terminal transfer is provided by an independent, licensed and insured operator, integrated with ParkGo by API. It comes pre-attached to your parking booking, so you still get one price at checkout.",
    "how.transfer.body2":
      "The customer experience stays exactly the same — a bundled booking, live driver location and ETA on travel day, and a verified handover — all powered by the operator's API rather than a ParkGo-built driver app.",
    "how.transfer.cta": "How we keep it safe",

    "how.cta.title": "Ready to park smart and travel easy?",
    "how.cta.body":
      "Start a booking in minutes, or join the waitlist for your airport and we'll let you know the moment we go live.",
    "how.cta.start": "Start a booking",
    "how.cta.travellers": "For travellers",
    "how.cta.airports": "Parking across the UK & Ireland — airports, cities & events.",

    // ----------------------------------------------------------------------- FAQ
    "faq.hero.badge": "Frequently asked questions",
    "faq.hero.title": "Everything you wanted to ask about ParkGo",
    "faq.hero.subtitle":
      "Answers for travellers and hosts. Can't find what you need? Our team is one message away.",

    "faq.cat.travellers": "For travellers",
    "faq.cat.hosts": "For hosts",
    "faq.cat.payments": "Payments & pricing",
    "faq.cat.security": "Security & languages",

    "faq.t1.q": "What exactly is included in a ParkGo booking?",
    "faq.t1.a":
      "A ParkGo booking bundles a verified private parking space, a licensed terminal transfer (both ways), optional EV charging and live security — CCTV, an in-app camera and verified handovers — into one price and one checkout.",
    "faq.t2.q": "Is my car safe while I am away?",
    "faq.t2.a":
      "Yes. Hosts are ID-verified, spaces can include CCTV, and you can watch your parked car on a live in-app camera with a LIVE badge and timestamp. Both drop-off and collection use a verified, logged handover with a one-time code.",
    "faq.t3.q": "Are transfers run by ParkGo's own drivers?",
    "faq.t3.a":
      "No. ParkGo does not run a fleet or onboard drivers. Your terminal transfer is provided by an independent, licensed and insured operator, integrated with ParkGo by API. You still get the same experience — a bundled booking, live driver location and ETA, and a verified handover — powered by the operator's API.",
    "faq.t4.q": "What happens if my flight is delayed?",
    "faq.t4.a":
      "Your parking and your return transfer are tied to your trip, so a delay is handled gracefully — you will not lose your space or your ride home. If plans change significantly, you can manage your booking in the app.",
    "faq.t5.q": "Which locations does ParkGo cover?",
    "faq.t5.a":
      "We cover Heathrow, Gatwick, Stansted, Luton, Manchester, Birmingham, Edinburgh and Dublin airports, plus city-centre, station and stadium parking across the UK and Ireland — with more locations to follow. Join the waitlist to hear when we reach yours.",

    "faq.h1.q": "Who can become a host?",
    "faq.h1.a":
      "Anyone with a legal right to rent out a suitable space near a launch airport — a driveway, yard or spare bay. You complete identity and address verification and a right-to-list declaration before your space can go live.",
    "faq.h2.q": "How much can I earn as a host?",
    "faq.h2.a":
      "You keep the large majority of every parking booking — indicatively around 80 to 85 percent, with EV charging revenue on top where you offer it. You set your own per-day price and availability. Figures are indicative and to be confirmed at launch.",
    "faq.h3.q": "How and when do I get paid?",
    "faq.h3.a":
      "Payouts are released after each completed booking and sent to the bank details you add during onboarding. Your bank details are encrypted and never shown to travellers, and you get clear statements for every booking.",

    "faq.p1.q": "How does ParkGo pricing work?",
    "faq.p1.a":
      "Parking, the licensed transfer and EV charging are combined into a single transparent price, plus a small flat service fee of £2.99 that is always shown before you pay. There are no hidden extras.",
    "faq.p2.q": "How much commission does ParkGo take?",
    "faq.p2.a":
      "Indicatively around 18 percent on parking, plus the flat service fee, shown clearly in host payout statements. The terminal transfer is provided by an independent licensed operator and is included in your bundle price. Figures are indicative and to be confirmed.",
    "faq.p3.q": "Do you offer corporate accounts?",
    "faq.p3.a":
      "Yes. Corporate accounts add centralised bookings, monthly invoicing instead of per-trip cards, priority support and clear statements for expensing. Contact us to set your team up.",

    "faq.s1.q": "How does ParkGo protect my data?",
    "faq.s1.a":
      "We align with UK GDPR and ICO guidance: data minimisation, a lawful basis for every use, defined retention, and easy data-subject requests. Identity and bank documents are encrypted and stored separately, with audit logging and least-privilege access controls.",
    "faq.s2.q": "What does a verified handover mean?",
    "faq.s2.a":
      "At drop-off and collection, both parties confirm a one-time code in the app. Each confirmation is timestamped and written to an audit log, creating a clear chain of custody for your vehicle.",
    "faq.s3.q": "What languages is ParkGo available in?",
    "faq.s3.a":
      "ParkGo launches in five languages across the UK and Ireland, with more planned. You can switch language at any time from the site header.",

    "faq.cta.title": "Still have a question?",
    "faq.cta.body":
      "We're happy to help with anything about bookings, hosting, partnering or your data. Send us a message and we'll get back to you.",
    "faq.cta.contact": "Contact us",
    "faq.cta.how": "How it works",
  },

  ur: {
    // -------------------------------------------------------------- How it works
    "how.hero.badge": "ایک بکنگ · ایک قیمت · ایک ایپ",
    "how.hero.title": "پارک گو کیسے کام کرتا ہے، تلاش سے تصدیق شدہ ہینڈ اوور تک",
    "how.hero.subtitle":
      "زیادہ تر مسافر پارکنگ، ٹرانسفر اور ای وی چارجنگ کو تین ایپس اور قیمتوں میں سنبھالتے ہیں۔ پارک گو انہیں ایک قابلِ اعتماد سفر میں لاتا ہے جسے آپ پورے راستے دیکھ سکتے ہیں۔",
    "how.hero.cta": "بکنگ شروع کریں",
    "how.hero.pricing": "قیمتیں دیکھیں",

    "how.journey.eyebrow": "مسافر کا سفر",
    "how.journey.title": "آپ کے ڈرائیو وے کی تلاش سے واپس گھر اترنے تک پانچ مراحل",
    "how.journey.body":
      "ہر مرحلہ تصدیق شدہ، شفاف اور ٹریک شدہ ہے۔ گیٹ پر کوئی حیرانی نہیں، اور یہ اندازہ لگانے کی ضرورت نہیں کہ آپ کی گاڑی کہاں ہے۔",

    "how.step1.title": "تلاش اور موازنہ",
    "how.step1.body":
      "ہمیں اپنا ایئرپورٹ اور تاریخیں بتائیں۔ پارک گو تصدیق شدہ نجی جگہیں دکھاتا ہے — قیمت، ٹرمینل سے فاصلہ، ای وی چارجنگ، سی سی ٹی وی اور مسافروں کی حقیقی درجہ بندی کے ساتھ، ساتھ ساتھ، بغیر کسی چھپے اضافی اخراجات کے۔",
    "how.step1.point1": "صرف تصدیق شدہ، شناختی جانچ شدہ میزبان",
    "how.step1.point2": "شفاف یومیہ قیمتیں",
    "how.step1.point3": "ای وی، سی سی ٹی وی اور فاصلے کے لحاظ سے فلٹر کریں",

    "how.step2.title": "اپنا بنڈل بنائیں",
    "how.step2.body":
      "اپنی پارکنگ میں لائسنس یافتہ ٹرمینل ٹرانسفر، ای وی چارجنگ اور لائیو سیکیورٹی شامل کریں — پھر ایک بار ادائیگی کریں۔ قابلِ وضاحت اے آئی آپ کے سفر کے لیے صحیح امتزاج تجویز کرتا ہے، ایک شفاف قیمت کے ساتھ۔",
    "how.step2.point1": "پارکنگ + ٹرانسفر + ای وی + سیکیورٹی",
    "how.step2.point2": "ایک چیک آؤٹ، ایک قیمت",
    "how.step2.point3": "اے آئی تجاویز جنہیں آپ سمجھ سکتے ہیں",

    "how.step3.title": "ادائیگی کریں اور اپنا کیو آر حاصل کریں",
    "how.step3.body":
      "محفوظ طریقے سے چیک آؤٹ کریں اور فوراً ایک کیو آر رسائی کوڈ حاصل کریں۔ یہ پارکنگ گیٹ، آپ کے ڈرائیور اور تصدیق شدہ ہینڈ اوور کے لیے درکار سب کچھ ہے — سب آپ کی بکنگ میں محفوظ۔",
    "how.step3.point1": "محفوظ کارڈ ادائیگی",
    "how.step3.point2": "فوری کیو آر رسائی کوڈ",
    "how.step3.point3": "بکنگ ایپ میں آف لائن محفوظ",

    "how.step4.title": "سفر کا دن",
    "how.step4.body":
      "سب کچھ ہوتے دیکھیں۔ اپنے لائسنس یافتہ ڈرائیور کو لائیو نقشے پر ٹریک کریں، اپنی پارک شدہ گاڑی کو ایپ میں لائیو کیمرے پر دیکھیں، اور ایک بار استعمال ہونے والے کوڈ سے تصدیق شدہ ہینڈ اوور کی تصدیق کریں — وقت کے نشان اور ریکارڈ کے ساتھ۔",
    "how.step4.point1": "گاہک، میزبان اور ڈرائیور کا لائیو نقشہ",
    "how.step4.point2": "آپ کی گاڑی کا لائیو کیمرہ",
    "how.step4.point3": "تصدیق شدہ، ریکارڈ شدہ ہینڈ اوور",

    "how.step5.title": "واپسی اور جائزہ",
    "how.step5.body":
      "اتریں، پک اپ حاصل کریں اور ایک اور تصدیق شدہ ہینڈ اوور کے ساتھ اپنی گاڑی لے لیں۔ پھر اپنے میزبان اور ڈرائیور کی درجہ بندی کریں — دو طرفہ اعتماد کی اسکورنگ پورے نیٹ ورک کو ایماندار اور اعلیٰ معیار کا رکھتی ہے۔",
    "how.step5.point1": "اترنے پر واپسی کا ٹرانسفر",
    "how.step5.point2": "تصدیق شدہ ہینڈ اوور کے ساتھ وصولی",
    "how.step5.point3": "دو طرفہ جائزے",

    "how.live.eyebrow": "سفر کے دن لائیو",
    "how.live.title": "ذہنی سکون جسے آپ واقعی دیکھ سکتے ہیں",
    "how.live.body":
      "پارک گو کی خصوصیات اسی دن جیتی جاگتی ہو جاتی ہیں جب آپ سفر کرتے ہیں۔ یہ تین خصوصیات ایک پریشان کن صبح کو ایسی چیز میں بدل دیتی ہیں جسے آپ حقیقی وقت میں دیکھ سکتے ہیں۔",
    "how.live.feat1.title": "لائیو مقام کا اشتراک",
    "how.live.feat1.body": "آپ، آپ کا میزبان اور آپ کا لائسنس یافتہ ڈرائیور سفر کے دن ایک ہی لائیو نقشہ شیئر کرتے ہیں۔",
    "how.live.feat2.title": "آپ کی گاڑی کا لائیو کیمرہ",
    "how.live.feat2.body": "اپنی پارک شدہ گاڑی کو LIVE بیج اور وقت کے نشان کے ساتھ دیکھنے کے لیے ایپ کھولیں۔",
    "how.live.feat3.title": "تصدیق شدہ ہینڈ اوور",
    "how.live.feat3.body": "دونوں فریق ڈراپ آف اور وصولی پر ایک بار استعمال ہونے والے کوڈ کی تصدیق کرتے ہیں — ہر واقعہ ریکارڈ ہوتا ہے۔",

    "how.bundle.eyebrow": "ایک شفاف قیمت",
    "how.bundle.title": "چار خدمات، ایک ہی چیک آؤٹ میں یکجا",
    "how.bundle.body":
      "فراہم کنندگان کے درمیان اچھلنے یا غیر مماثل چیزوں کا موازنہ کرنے کی ضرورت نہیں۔ پارک گو ہر چیز کو ایک قیمت میں یکجا کرتا ہے جسے آپ سمجھ سکتے ہیں، ایک چھوٹی، واضح طور پر دکھائی گئی سروس فیس کے ساتھ۔",
    "how.bundle.item1.title": "تصدیق شدہ نجی پارکنگ",
    "how.bundle.item1.body": "آپ کے ٹرمینل کے قریب شناختی جانچ شدہ میزبان کا ڈرائیو وے یا صحن۔",
    "how.bundle.item2.title": "لائسنس یافتہ ٹرمینل ٹرانسفر",
    "how.bundle.item2.body": "ایئرپورٹ کے دروازے تک اور واپسی کے لیے ایک لائسنس یافتہ، بیمہ شدہ ڈرائیور۔",
    "how.bundle.item3.title": "ای وی چارجنگ",
    "how.bundle.item3.body": "جہاں میزبان چارجر پیش کرے وہاں سفر کے دوران چارج کریں۔",
    "how.bundle.item4.title": "لائیو سیکیورٹی",
    "how.bundle.item4.body": "سی سی ٹی وی، ایک لائیو کیمرہ اور شروع سے آخر تک تصدیق شدہ ہینڈ اوور۔",

    "how.example.label": "مثالی بنڈل",
    "how.example.parking": "ایئرپورٹ پارکنگ",
    "how.example.parkingV": "آپ کے منتخب میزبان سے",
    "how.example.transfer": "لائسنس یافتہ ٹرانسفر",
    "how.example.transferV": "دونوں طرف",
    "how.example.ev": "ای وی چارجنگ",
    "how.example.evV": "اختیاری اضافہ",
    "how.example.fee": "سروس فیس",
    "how.example.onePrice": "چیک آؤٹ پر ایک قیمت",
    "how.example.note":
      "اشاراتی مثال۔ آپ کی قیمت ایئرپورٹ، تاریخوں اور آپ کے منتخب کردہ اضافوں پر منحصر ہے۔",
    "how.example.cta": "قیمتیں کیسے کام کرتی ہیں",

    "how.other.eyebrow": "نیٹ ورک کا دوسرا پہلو",
    "how.other.title": "میزبانی کیسے کام کرتی ہے، اور آپ کا ٹرانسفر کون چلاتا ہے",
    "how.other.body":
      "مسافروں کو بلا رکاوٹ سفر ملتا ہے کیونکہ میزبان تصدیق شدہ ہوتے ہیں اور ٹرمینل ٹرانسفر ایک لائسنس یافتہ آپریٹر سنبھالتا ہے۔ یہاں ہر ایک کا مختصر بیان ہے۔",

    "how.hosts.title": "میزبانوں کے لیے",
    "how.hosts.step1.title": "تصدیق کروائیں",
    "how.hosts.step1.body": "اپنی شناخت اور پتے کی تصدیق کریں، پھر اپنی جگہ شامل کریں — پیمائش، ای وی، سی سی ٹی وی اور تصاویر۔",
    "how.hosts.step2.title": "لائیو ہو جائیں",
    "how.hosts.step2.body": "ایک فوری تعمیل کا جائزہ پاس کریں، دستیابی مقرر کریں اور آپ کا ڈرائیو وے کمانا شروع کر دیتا ہے۔",
    "how.hosts.step3.title": "ادائیگی حاصل کریں",
    "how.hosts.step3.body": "ہر مکمل بکنگ کے بعد محفوظ ادائیگیاں حاصل کریں — آپ بڑی اکثریت اپنے پاس رکھتے ہیں۔",
    "how.hosts.cta": "اپنی جگہ درج کریں",

    "how.transfer.title": "آپ کا ٹرانسفر کون چلاتا ہے",
    "how.transfer.body1":
      "پارک گو کوئی فلیٹ نہیں چلاتا اور نہ ہی ڈرائیوروں کو شامل کرتا ہے۔ آپ کا ٹرمینل ٹرانسفر ایک آزاد، لائسنس یافتہ اور بیمہ شدہ آپریٹر فراہم کرتا ہے، جو ای پی آئی کے ذریعے پارک گو کے ساتھ مربوط ہے۔ یہ آپ کی پارکنگ بکنگ کے ساتھ پہلے سے منسلک آتا ہے، لہٰذا آپ کو پھر بھی چیک آؤٹ پر ایک قیمت ملتی ہے۔",
    "how.transfer.body2":
      "گاہک کا تجربہ بالکل ویسا ہی رہتا ہے — ایک بنڈل شدہ بکنگ، سفر کے دن لائیو ڈرائیور کا مقام اور متوقع وقت، اور ایک تصدیق شدہ ہینڈ اوور — یہ سب پارک گو کی بنائی ہوئی ڈرائیور ایپ کے بجائے آپریٹر کے ای پی آئی سے چلتا ہے۔",
    "how.transfer.cta": "ہم اسے کیسے محفوظ رکھتے ہیں",

    "how.cta.title": "ہوشیاری سے پارک کرنے اور آسانی سے سفر کرنے کے لیے تیار ہیں؟",
    "how.cta.body":
      "منٹوں میں بکنگ شروع کریں، یا اپنے ایئرپورٹ کے لیے ویٹ لسٹ میں شامل ہوں اور جیسے ہی ہم لائیو ہوں گے ہم آپ کو بتا دیں گے۔",
    "how.cta.start": "بکنگ شروع کریں",
    "how.cta.travellers": "مسافروں کے لیے",
    "how.cta.airports": "برطانیہ اور آئرلینڈ بھر میں پارکنگ — ہوائی اڈے، شہر اور ایونٹس۔",

    // ----------------------------------------------------------------------- FAQ
    "faq.hero.badge": "اکثر پوچھے جانے والے سوالات",
    "faq.hero.title": "پارک گو کے بارے میں وہ سب کچھ جو آپ پوچھنا چاہتے تھے",
    "faq.hero.subtitle":
      "مسافروں اور میزبانوں کے لیے جوابات۔ جو چاہیے وہ نہیں مل رہا؟ ہماری ٹیم ایک پیغام کی دوری پر ہے۔",

    "faq.cat.travellers": "مسافروں کے لیے",
    "faq.cat.hosts": "میزبانوں کے لیے",
    "faq.cat.payments": "ادائیگیاں اور قیمتیں",
    "faq.cat.security": "سیکیورٹی اور زبانیں",

    "faq.t1.q": "پارک گو کی بکنگ میں بالکل کیا شامل ہے؟",
    "faq.t1.a":
      "پارک گو کی بکنگ ایک تصدیق شدہ نجی پارکنگ جگہ، ایک لائسنس یافتہ ٹرمینل ٹرانسفر (دونوں طرف)، اختیاری ای وی چارجنگ اور لائیو سیکیورٹی — سی سی ٹی وی، ایپ میں کیمرہ اور تصدیق شدہ ہینڈ اوور — کو ایک قیمت اور ایک چیک آؤٹ میں جوڑتی ہے۔",
    "faq.t2.q": "کیا میری گاڑی میری غیر موجودگی میں محفوظ ہے؟",
    "faq.t2.a":
      "جی ہاں۔ میزبان شناختی طور پر تصدیق شدہ ہوتے ہیں، جگہوں میں سی سی ٹی وی شامل ہو سکتا ہے، اور آپ اپنی پارک شدہ گاڑی کو LIVE بیج اور وقت کے نشان کے ساتھ ایپ میں لائیو کیمرے پر دیکھ سکتے ہیں۔ ڈراپ آف اور وصولی دونوں میں ایک بار استعمال ہونے والے کوڈ کے ساتھ تصدیق شدہ، ریکارڈ شدہ ہینڈ اوور ہوتا ہے۔",
    "faq.t3.q": "کیا ٹرانسفر پارک گو کے اپنے ڈرائیور چلاتے ہیں؟",
    "faq.t3.a":
      "نہیں۔ پارک گو کوئی فلیٹ نہیں چلاتا اور نہ ہی ڈرائیوروں کو شامل کرتا ہے۔ آپ کا ٹرمینل ٹرانسفر ایک آزاد، لائسنس یافتہ اور بیمہ شدہ آپریٹر فراہم کرتا ہے، جو ای پی آئی کے ذریعے پارک گو کے ساتھ مربوط ہے۔ آپ کو پھر بھی وہی تجربہ ملتا ہے — ایک بنڈل شدہ بکنگ، لائیو ڈرائیور کا مقام اور متوقع وقت، اور ایک تصدیق شدہ ہینڈ اوور — جو آپریٹر کے ای پی آئی سے چلتا ہے۔",
    "faq.t4.q": "اگر میری پرواز میں تاخیر ہو تو کیا ہوگا؟",
    "faq.t4.a":
      "آپ کی پارکنگ اور آپ کا واپسی ٹرانسفر آپ کے سفر سے جڑے ہوتے ہیں، لہٰذا تاخیر کو احسن طریقے سے سنبھالا جاتا ہے — آپ اپنی جگہ یا گھر واپسی کی سواری نہیں کھوئیں گے۔ اگر منصوبے نمایاں طور پر بدل جائیں، تو آپ ایپ میں اپنی بکنگ کا انتظام کر سکتے ہیں۔",
    "faq.t5.q": "پارک گو کن مقامات کا احاطہ کرتا ہے؟",
    "faq.t5.a":
      "ہم ہیتھرو، گیٹوک، سٹینسٹڈ، لیوٹن، مانچسٹر، برمنگھم، ایڈنبرا اور ڈبلن کے ہوائی اڈوں کے ساتھ ساتھ برطانیہ اور آئرلینڈ بھر میں شہر، اسٹیشن اور اسٹیڈیم پارکنگ کا احاطہ کرتے ہیں — مزید مقامات جلد۔ یہ جاننے کے لیے کہ ہم آپ تک کب پہنچیں گے، ویٹ لسٹ میں شامل ہوں۔",

    "faq.h1.q": "میزبان کون بن سکتا ہے؟",
    "faq.h1.a":
      "کوئی بھی جسے لانچ ایئرپورٹ کے قریب ایک مناسب جگہ کرائے پر دینے کا قانونی حق ہو — ایک ڈرائیو وے، صحن یا فالتو جگہ۔ آپ کی جگہ لائیو ہونے سے پہلے آپ شناخت اور پتے کی تصدیق اور درج کرنے کے حق کا اعلامیہ مکمل کرتے ہیں۔",
    "faq.h2.q": "میں بطور میزبان کتنا کما سکتا ہوں؟",
    "faq.h2.a":
      "آپ ہر پارکنگ بکنگ کی بڑی اکثریت اپنے پاس رکھتے ہیں — اشاراتی طور پر تقریباً 80 سے 85 فیصد، اور جہاں آپ ای وی چارجنگ پیش کرتے ہیں وہاں اس کی آمدنی اس کے علاوہ۔ آپ اپنی یومیہ قیمت اور دستیابی خود مقرر کرتے ہیں۔ اعداد و شمار اشاراتی ہیں اور لانچ پر تصدیق کیے جائیں گے۔",
    "faq.h3.q": "مجھے ادائیگی کیسے اور کب ملتی ہے؟",
    "faq.h3.a":
      "ادائیگیاں ہر مکمل بکنگ کے بعد جاری کی جاتی ہیں اور آن بورڈنگ کے دوران آپ کے شامل کردہ بینک تفصیلات پر بھیجی جاتی ہیں۔ آپ کی بینک تفصیلات خفیہ کاری شدہ ہوتی ہیں اور مسافروں کو کبھی نہیں دکھائی جاتیں، اور آپ کو ہر بکنگ کے لیے واضح گوشوارے ملتے ہیں۔",

    "faq.p1.q": "پارک گو کی قیمتیں کیسے کام کرتی ہیں؟",
    "faq.p1.a":
      "پارکنگ، لائسنس یافتہ ٹرانسفر اور ای وی چارجنگ کو ایک شفاف قیمت میں جوڑا جاتا ہے، اس کے علاوہ £2.99 کی ایک چھوٹی مقررہ سروس فیس جو ادائیگی سے پہلے ہمیشہ دکھائی جاتی ہے۔ کوئی چھپے اضافی اخراجات نہیں ہیں۔",
    "faq.p2.q": "پارک گو کتنا کمیشن لیتا ہے؟",
    "faq.p2.a":
      "اشاراتی طور پر پارکنگ پر تقریباً 18 فیصد، اور مقررہ سروس فیس، جو میزبان کے ادائیگی گوشواروں میں واضح طور پر دکھائی جاتی ہے۔ ٹرمینل ٹرانسفر ایک آزاد لائسنس یافتہ آپریٹر فراہم کرتا ہے اور یہ آپ کی بنڈل قیمت میں شامل ہے۔ اعداد و شمار اشاراتی ہیں اور تصدیق کیے جائیں گے۔",
    "faq.p3.q": "کیا آپ کارپوریٹ اکاؤنٹس پیش کرتے ہیں؟",
    "faq.p3.a":
      "جی ہاں۔ کارپوریٹ اکاؤنٹس مرکزی بکنگز، فی سفر کارڈز کے بجائے ماہانہ انوائسنگ، ترجیحی مدد اور اخراجات کے لیے واضح گوشوارے شامل کرتے ہیں۔ اپنی ٹیم کو ترتیب دینے کے لیے ہم سے رابطہ کریں۔",

    "faq.s1.q": "پارک گو میرے ڈیٹا کی حفاظت کیسے کرتا ہے؟",
    "faq.s1.a":
      "ہم برطانیہ کے جی ڈی پی آر اور آئی سی او رہنمائی سے ہم آہنگ ہیں: ڈیٹا کم سے کم کرنا، ہر استعمال کے لیے ایک قانونی بنیاد، مقررہ برقراری، اور آسان ڈیٹا سبجیکٹ درخواستیں۔ شناخت اور بینک دستاویزات خفیہ کاری شدہ اور الگ سے محفوظ کی جاتی ہیں، آڈٹ لاگنگ اور کم سے کم استحقاق تک رسائی کنٹرول کے ساتھ۔",
    "faq.s2.q": "تصدیق شدہ ہینڈ اوور کا کیا مطلب ہے؟",
    "faq.s2.a":
      "ڈراپ آف اور وصولی پر، دونوں فریق ایپ میں ایک بار استعمال ہونے والے کوڈ کی تصدیق کرتے ہیں۔ ہر تصدیق پر وقت کا نشان لگتا ہے اور اسے آڈٹ لاگ میں لکھا جاتا ہے، جو آپ کی گاڑی کے لیے ایک واضح حراستی سلسلہ تشکیل دیتا ہے۔",
    "faq.s3.q": "پارک گو کن زبانوں میں دستیاب ہے؟",
    "faq.s3.a":
      "پارک گو برطانیہ اور آئرلینڈ بھر میں پانچ زبانوں میں لانچ ہوتا ہے، مزید کی منصوبہ بندی کے ساتھ۔ آپ سائٹ کے ہیڈر سے کسی بھی وقت زبان تبدیل کر سکتے ہیں۔",

    "faq.cta.title": "کیا اب بھی کوئی سوال ہے؟",
    "faq.cta.body":
      "ہم بکنگز، میزبانی، شراکت داری یا آپ کے ڈیٹا کے بارے میں کسی بھی چیز میں خوشی سے مدد کرتے ہیں۔ ہمیں ایک پیغام بھیجیں اور ہم آپ سے رابطہ کریں گے۔",
    "faq.cta.contact": "ہم سے رابطہ کریں",
    "faq.cta.how": "یہ کیسے کام کرتا ہے",
  },

  hi: {
    // -------------------------------------------------------------- How it works
    "how.hero.badge": "एक बुकिंग · एक कीमत · एक ऐप",
    "how.hero.title": "ParkGo कैसे काम करता है, खोज से सत्यापित हैंडओवर तक",
    "how.hero.subtitle":
      "अधिकांश यात्री पार्किंग, ट्रांसफर और ईवी चार्जिंग को तीन ऐप्स और कीमतों में संभालते हैं। ParkGo उन्हें एक भरोसेमंद यात्रा में लाता है जिसे आप पूरे रास्ते देख सकते हैं।",
    "how.hero.cta": "बुकिंग शुरू करें",
    "how.hero.pricing": "मूल्य निर्धारण देखें",

    "how.journey.eyebrow": "यात्री की यात्रा",
    "how.journey.title": "आपके ड्राइववे की खोज से वापस घर उतरने तक पाँच चरण",
    "how.journey.body":
      "हर चरण सत्यापित, पारदर्शी और ट्रैक किया जाता है। गेट पर कोई आश्चर्य नहीं, और यह अनुमान लगाने की ज़रूरत नहीं कि आपकी कार कहाँ है।",

    "how.step1.title": "खोजें और तुलना करें",
    "how.step1.body":
      "हमें अपना एयरपोर्ट और तारीखें बताएं। ParkGo सत्यापित निजी स्थान दिखाता है — कीमत, टर्मिनल से दूरी, ईवी चार्जिंग, सीसीटीवी और वास्तविक यात्री रेटिंग के साथ, साथ-साथ, बिना किसी छिपे अतिरिक्त शुल्क के।",
    "how.step1.point1": "केवल सत्यापित, आईडी-जांचे होस्ट",
    "how.step1.point2": "पारदर्शी प्रति-दिन मूल्य निर्धारण",
    "how.step1.point3": "ईवी, सीसीटीवी और दूरी के अनुसार फ़िल्टर करें",

    "how.step2.title": "अपना बंडल बनाएं",
    "how.step2.body":
      "अपनी पार्किंग में एक लाइसेंस प्राप्त टर्मिनल ट्रांसफर, ईवी चार्जिंग और लाइव सुरक्षा जोड़ें — फिर एक बार भुगतान करें। समझाने योग्य एआई आपकी यात्रा के लिए सही संयोजन सुझाता है, एक पारदर्शी कीमत के साथ।",
    "how.step2.point1": "पार्किंग + ट्रांसफर + ईवी + सुरक्षा",
    "how.step2.point2": "एक चेकआउट, एक कीमत",
    "how.step2.point3": "एआई सुझाव जिन्हें आप समझ सकते हैं",

    "how.step3.title": "भुगतान करें और अपना क्यूआर पाएं",
    "how.step3.body":
      "सुरक्षित रूप से चेकआउट करें और तुरंत एक क्यूआर एक्सेस कोड प्राप्त करें। यह पार्किंग गेट, आपके ड्राइवर और सत्यापित हैंडओवर के लिए आवश्यक सब कुछ है — सब आपकी बुकिंग में संग्रहीत।",
    "how.step3.point1": "सुरक्षित कार्ड भुगतान",
    "how.step3.point2": "तत्काल क्यूआर एक्सेस कोड",
    "how.step3.point3": "बुकिंग ऐप में ऑफ़लाइन सहेजी गई",

    "how.step4.title": "यात्रा का दिन",
    "how.step4.body":
      "सब कुछ होते हुए देखें। अपने लाइसेंस प्राप्त ड्राइवर को लाइव मानचित्र पर ट्रैक करें, अपनी पार्क की गई कार को ऐप में लाइव कैमरे पर देखें, और एक बार उपयोग होने वाले कोड से सत्यापित हैंडओवर की पुष्टि करें — टाइमस्टैम्प और लॉग किया हुआ।",
    "how.step4.point1": "ग्राहक, होस्ट और ड्राइवर का लाइव मानचित्र",
    "how.step4.point2": "आपकी कार का लाइव कैमरा",
    "how.step4.point3": "सत्यापित, लॉग किया गया हैंडओवर",

    "how.step5.title": "वापसी और समीक्षा",
    "how.step5.body":
      "उतरें, पिक-अप पाएं और एक और सत्यापित हैंडओवर के साथ अपनी कार लें। फिर अपने होस्ट और ड्राइवर की रेटिंग करें — दो-तरफ़ा विश्वास स्कोरिंग पूरे नेटवर्क को ईमानदार और उच्च गुणवत्ता वाला रखती है।",
    "how.step5.point1": "उतरने पर वापसी ट्रांसफर",
    "how.step5.point2": "सत्यापित हैंडओवर के साथ कार लें",
    "how.step5.point3": "दो-तरफ़ा समीक्षाएं",

    "how.live.eyebrow": "यात्रा के दिन लाइव",
    "how.live.title": "मन की शांति जिसे आप सचमुच देख सकते हैं",
    "how.live.body":
      "ParkGo की विशिष्टताएं उसी दिन जीवंत हो जाती हैं जब आप उड़ान भरते हैं। ये तीन सुविधाएं एक तनावपूर्ण सुबह को ऐसी चीज़ में बदल देती हैं जिसे आप वास्तविक समय में देख सकते हैं।",
    "how.live.feat1.title": "लाइव स्थान साझाकरण",
    "how.live.feat1.body": "आप, आपके होस्ट और आपके लाइसेंस प्राप्त ड्राइवर यात्रा के दिन एक ही लाइव मानचित्र साझा करते हैं।",
    "how.live.feat2.title": "आपकी कार का लाइव कैमरा",
    "how.live.feat2.body": "अपनी पार्क की गई गाड़ी को LIVE बैज और टाइमस्टैम्प के साथ देखने के लिए ऐप खोलें।",
    "how.live.feat3.title": "सत्यापित हैंडओवर",
    "how.live.feat3.body": "दोनों पक्ष ड्रॉप-ऑफ और कार लेने पर एक बार उपयोग होने वाले कोड की पुष्टि करते हैं — हर घटना लॉग की जाती है।",

    "how.bundle.eyebrow": "एक पारदर्शी कीमत",
    "how.bundle.title": "चार सेवाएं, एक ही चेकआउट में बंडल",
    "how.bundle.body":
      "प्रदाताओं के बीच उछलने या असमान चीज़ों की तुलना करने की ज़रूरत नहीं। ParkGo सब कुछ एक कीमत में जोड़ता है जिसे आप समझ सकते हैं, एक छोटे, स्पष्ट रूप से दिखाए गए सेवा शुल्क के साथ।",
    "how.bundle.item1.title": "सत्यापित निजी पार्किंग",
    "how.bundle.item1.body": "आपके टर्मिनल के पास एक आईडी-जांचे होस्ट का ड्राइववे या आँगन।",
    "how.bundle.item2.title": "लाइसेंस प्राप्त टर्मिनल ट्रांसफर",
    "how.bundle.item2.body": "एयरपोर्ट के दरवाज़े तक और वापसी के लिए एक लाइसेंस प्राप्त, बीमाकृत ड्राइवर।",
    "how.bundle.item3.title": "ईवी चार्जिंग",
    "how.bundle.item3.body": "जहाँ होस्ट चार्जर प्रदान करे वहाँ यात्रा के दौरान चार्ज करें।",
    "how.bundle.item4.title": "लाइव सुरक्षा",
    "how.bundle.item4.body": "सीसीटीवी, एक लाइव कैमरा और आरंभ से अंत तक सत्यापित हैंडओवर।",

    "how.example.label": "उदाहरण बंडल",
    "how.example.parking": "एयरपोर्ट पार्किंग",
    "how.example.parkingV": "आपके चुने हुए होस्ट से",
    "how.example.transfer": "लाइसेंस प्राप्त ट्रांसफर",
    "how.example.transferV": "दोनों तरफ",
    "how.example.ev": "ईवी चार्जिंग",
    "how.example.evV": "वैकल्पिक ऐड-ऑन",
    "how.example.fee": "सेवा शुल्क",
    "how.example.onePrice": "चेकआउट पर एक कीमत",
    "how.example.note":
      "सांकेतिक उदाहरण। आपकी कीमत एयरपोर्ट, तारीखों और आपके चुने गए ऐड-ऑन पर निर्भर करती है।",
    "how.example.cta": "मूल्य निर्धारण कैसे काम करता है",

    "how.other.eyebrow": "नेटवर्क का दूसरा पक्ष",
    "how.other.title": "होस्टिंग कैसे काम करती है, और आपका ट्रांसफर कौन चलाता है",
    "how.other.body":
      "यात्रियों को निर्बाध यात्रा मिलती है क्योंकि होस्ट सत्यापित होते हैं और टर्मिनल ट्रांसफर एक लाइसेंस प्राप्त ऑपरेटर संभालता है। यहाँ प्रत्येक का संक्षिप्त विवरण है।",

    "how.hosts.title": "होस्ट के लिए",
    "how.hosts.step1.title": "सत्यापित हों",
    "how.hosts.step1.body": "अपनी पहचान और पते की पुष्टि करें, फिर अपना स्थान जोड़ें — आयाम, ईवी, सीसीटीवी और तस्वीरें।",
    "how.hosts.step2.title": "लाइव हो जाएं",
    "how.hosts.step2.body": "एक त्वरित अनुपालन समीक्षा पास करें, उपलब्धता निर्धारित करें और आपका ड्राइववे कमाना शुरू कर देता है।",
    "how.hosts.step3.title": "भुगतान पाएं",
    "how.hosts.step3.body": "हर पूर्ण बुकिंग के बाद सुरक्षित भुगतान प्राप्त करें — आप बड़ा हिस्सा अपने पास रखते हैं।",
    "how.hosts.cta": "अपना स्थान सूचीबद्ध करें",

    "how.transfer.title": "आपका ट्रांसफर कौन चलाता है",
    "how.transfer.body1":
      "ParkGo कोई बेड़ा नहीं चलाता और न ही ड्राइवरों को शामिल करता है। आपका टर्मिनल ट्रांसफर एक स्वतंत्र, लाइसेंस प्राप्त और बीमाकृत ऑपरेटर प्रदान करता है, जो एपीआई के माध्यम से ParkGo के साथ एकीकृत है। यह आपकी पार्किंग बुकिंग के साथ पहले से संलग्न आता है, इसलिए आपको फिर भी चेकआउट पर एक कीमत मिलती है।",
    "how.transfer.body2":
      "ग्राहक अनुभव बिल्कुल वैसा ही रहता है — एक बंडल बुकिंग, यात्रा के दिन लाइव ड्राइवर स्थान और अनुमानित समय, और एक सत्यापित हैंडओवर — यह सब ParkGo द्वारा बनाए गए ड्राइवर ऐप के बजाय ऑपरेटर के एपीआई से संचालित होता है।",
    "how.transfer.cta": "हम इसे कैसे सुरक्षित रखते हैं",

    "how.cta.title": "स्मार्ट पार्किंग और आसान यात्रा के लिए तैयार हैं?",
    "how.cta.body":
      "मिनटों में बुकिंग शुरू करें, या अपने एयरपोर्ट के लिए वेटलिस्ट में शामिल हों और जैसे ही हम लाइव होंगे हम आपको बता देंगे।",
    "how.cta.start": "बुकिंग शुरू करें",
    "how.cta.travellers": "यात्रियों के लिए",
    "how.cta.airports": "यूके और आयरलैंड भर में पार्किंग — एयरपोर्ट, शहर और इवेंट।",

    // ----------------------------------------------------------------------- FAQ
    "faq.hero.badge": "अक्सर पूछे जाने वाले प्रश्न",
    "faq.hero.title": "ParkGo के बारे में वह सब कुछ जो आप पूछना चाहते थे",
    "faq.hero.subtitle":
      "यात्रियों और होस्ट के लिए उत्तर। जो चाहिए वह नहीं मिल रहा? हमारी टीम एक संदेश की दूरी पर है।",

    "faq.cat.travellers": "यात्रियों के लिए",
    "faq.cat.hosts": "होस्ट के लिए",
    "faq.cat.payments": "भुगतान और मूल्य निर्धारण",
    "faq.cat.security": "सुरक्षा और भाषाएं",

    "faq.t1.q": "ParkGo बुकिंग में वास्तव में क्या शामिल है?",
    "faq.t1.a":
      "एक ParkGo बुकिंग एक सत्यापित निजी पार्किंग स्थान, एक लाइसेंस प्राप्त टर्मिनल ट्रांसफर (दोनों तरफ), वैकल्पिक ईवी चार्जिंग और लाइव सुरक्षा — सीसीटीवी, ऐप में कैमरा और सत्यापित हैंडओवर — को एक कीमत और एक चेकआउट में जोड़ती है।",
    "faq.t2.q": "क्या मेरी कार मेरी अनुपस्थिति में सुरक्षित है?",
    "faq.t2.a":
      "हाँ। होस्ट आईडी-सत्यापित होते हैं, स्थानों में सीसीटीवी शामिल हो सकता है, और आप अपनी पार्क की गई कार को LIVE बैज और टाइमस्टैम्प के साथ ऐप में लाइव कैमरे पर देख सकते हैं। ड्रॉप-ऑफ और कार लेने दोनों में एक बार उपयोग होने वाले कोड के साथ सत्यापित, लॉग किया गया हैंडओवर होता है।",
    "faq.t3.q": "क्या ट्रांसफर ParkGo के अपने ड्राइवर चलाते हैं?",
    "faq.t3.a":
      "नहीं। ParkGo कोई बेड़ा नहीं चलाता और न ही ड्राइवरों को शामिल करता है। आपका टर्मिनल ट्रांसफर एक स्वतंत्र, लाइसेंस प्राप्त और बीमाकृत ऑपरेटर प्रदान करता है, जो एपीआई के माध्यम से ParkGo के साथ एकीकृत है। आपको फिर भी वही अनुभव मिलता है — एक बंडल बुकिंग, लाइव ड्राइवर स्थान और अनुमानित समय, और एक सत्यापित हैंडओवर — जो ऑपरेटर के एपीआई से संचालित होता है।",
    "faq.t4.q": "अगर मेरी उड़ान में देरी हो तो क्या होगा?",
    "faq.t4.a":
      "आपकी पार्किंग और आपका वापसी ट्रांसफर आपकी यात्रा से जुड़े होते हैं, इसलिए देरी को सहजता से संभाला जाता है — आप अपना स्थान या घर वापसी की सवारी नहीं खोएंगे। यदि योजनाएं काफी बदल जाती हैं, तो आप ऐप में अपनी बुकिंग प्रबंधित कर सकते हैं।",
    "faq.t5.q": "ParkGo किन स्थानों को कवर करता है?",
    "faq.t5.a":
      "हम हीथ्रो, गैटविक, स्टैनस्टेड, ल्यूटन, मैनचेस्टर, बर्मिंघम, एडिनबर्ग और डबलिन एयरपोर्ट के साथ-साथ यूके और आयरलैंड भर में शहर, स्टेशन और स्टेडियम पार्किंग कवर करते हैं — और स्थान जल्द ही। यह जानने के लिए कि हम आप तक कब पहुंचेंगे, वेटलिस्ट में शामिल हों।",

    "faq.h1.q": "होस्ट कौन बन सकता है?",
    "faq.h1.a":
      "कोई भी जिसे लॉन्च एयरपोर्ट के पास एक उपयुक्त स्थान किराए पर देने का कानूनी अधिकार हो — एक ड्राइववे, आँगन या अतिरिक्त बे। आपका स्थान लाइव होने से पहले आप पहचान और पते का सत्यापन और सूचीबद्ध करने के अधिकार की घोषणा पूरी करते हैं।",
    "faq.h2.q": "मैं एक होस्ट के रूप में कितना कमा सकता हूँ?",
    "faq.h2.a":
      "आप हर पार्किंग बुकिंग का बड़ा हिस्सा अपने पास रखते हैं — सांकेतिक रूप से लगभग 80 से 85 प्रतिशत, और जहाँ आप ईवी चार्जिंग प्रदान करते हैं वहाँ उसकी आय इसके ऊपर। आप अपनी प्रति-दिन कीमत और उपलब्धता स्वयं निर्धारित करते हैं। आंकड़े सांकेतिक हैं और लॉन्च पर पुष्टि किए जाएंगे।",
    "faq.h3.q": "मुझे भुगतान कैसे और कब मिलता है?",
    "faq.h3.a":
      "भुगतान हर पूर्ण बुकिंग के बाद जारी किए जाते हैं और ऑनबोर्डिंग के दौरान आपके द्वारा जोड़े गए बैंक विवरण पर भेजे जाते हैं। आपके बैंक विवरण एन्क्रिप्ट किए जाते हैं और यात्रियों को कभी नहीं दिखाए जाते, और आपको हर बुकिंग के लिए स्पष्ट विवरण मिलते हैं।",

    "faq.p1.q": "ParkGo मूल्य निर्धारण कैसे काम करता है?",
    "faq.p1.a":
      "पार्किंग, लाइसेंस प्राप्त ट्रांसफर और ईवी चार्जिंग को एक पारदर्शी कीमत में जोड़ा जाता है, साथ ही £2.99 का एक छोटा सपाट सेवा शुल्क जो भुगतान से पहले हमेशा दिखाया जाता है। कोई छिपे अतिरिक्त शुल्क नहीं हैं।",
    "faq.p2.q": "ParkGo कितना कमीशन लेता है?",
    "faq.p2.a":
      "सांकेतिक रूप से पार्किंग पर लगभग 18 प्रतिशत, साथ ही सपाट सेवा शुल्क, जो होस्ट भुगतान विवरण में स्पष्ट रूप से दिखाया जाता है। टर्मिनल ट्रांसफर एक स्वतंत्र लाइसेंस प्राप्त ऑपरेटर प्रदान करता है और यह आपकी बंडल कीमत में शामिल है। आंकड़े सांकेतिक हैं और पुष्टि किए जाने हैं।",
    "faq.p3.q": "क्या आप कॉर्पोरेट खाते प्रदान करते हैं?",
    "faq.p3.a":
      "हाँ। कॉर्पोरेट खाते केंद्रीकृत बुकिंग, प्रति-यात्रा कार्ड के बजाय मासिक चालान, प्राथमिकता समर्थन और खर्च के लिए स्पष्ट विवरण जोड़ते हैं। अपनी टीम को सेट करने के लिए हमसे संपर्क करें।",

    "faq.s1.q": "ParkGo मेरे डेटा की सुरक्षा कैसे करता है?",
    "faq.s1.a":
      "हम यूके जीडीपीआर और आईसीओ मार्गदर्शन के अनुरूप हैं: डेटा न्यूनीकरण, हर उपयोग के लिए एक वैध आधार, परिभाषित प्रतिधारण, और आसान डेटा-विषय अनुरोध। पहचान और बैंक दस्तावेज़ एन्क्रिप्ट किए जाते हैं और अलग से संग्रहीत किए जाते हैं, ऑडिट लॉगिंग और न्यूनतम-विशेषाधिकार पहुंच नियंत्रण के साथ।",
    "faq.s2.q": "सत्यापित हैंडओवर का क्या अर्थ है?",
    "faq.s2.a":
      "ड्रॉप-ऑफ और कार लेने पर, दोनों पक्ष ऐप में एक बार उपयोग होने वाले कोड की पुष्टि करते हैं। प्रत्येक पुष्टि पर टाइमस्टैम्प लगता है और उसे ऑडिट लॉग में लिखा जाता है, जो आपके वाहन के लिए एक स्पष्ट अभिरक्षा श्रृंखला बनाता है।",
    "faq.s3.q": "ParkGo किन भाषाओं में उपलब्ध है?",
    "faq.s3.a":
      "ParkGo यूके और आयरलैंड भर में पाँच भाषाओं में लॉन्च होता है, और अधिक की योजना है। आप साइट हेडर से किसी भी समय भाषा बदल सकते हैं।",

    "faq.cta.title": "अभी भी कोई प्रश्न है?",
    "faq.cta.body":
      "हम बुकिंग, होस्टिंग, साझेदारी या आपके डेटा के बारे में किसी भी चीज़ में मदद करने में खुश हैं। हमें एक संदेश भेजें और हम आपसे संपर्क करेंगे।",
    "faq.cta.contact": "संपर्क करें",
    "faq.cta.how": "यह कैसे काम करता है",
  },

  de: {
    // -------------------------------------------------------------- How it works
    "how.hero.badge": "Eine Buchung · ein Preis · eine App",
    "how.hero.title": "So funktioniert ParkGo, von der Suche bis zur verifizierten Übergabe",
    "how.hero.subtitle":
      "Die meisten Reisenden jonglieren Parken, einen Transfer und das Laden von E-Autos über drei Apps und Preise. ParkGo führt sie zu einer vertrauenswürdigen Reise zusammen, die Sie den ganzen Weg verfolgen können.",
    "how.hero.cta": "Buchung starten",
    "how.hero.pricing": "Preise ansehen",

    "how.journey.eyebrow": "Die Reise des Reisenden",
    "how.journey.title": "Fünf Schritte von der Stellplatzsuche bis zur Landung zu Hause",
    "how.journey.body":
      "Jeder Schritt ist geprüft, transparent und nachverfolgt. Keine Überraschungen am Tor, kein Rätselraten, wo Ihr Auto steht.",

    "how.step1.title": "Suchen & vergleichen",
    "how.step1.body":
      "Nennen Sie uns Ihren Flughafen und Ihre Termine. ParkGo zeigt geprüfte private Stellplätze mit Preis, Entfernung zum Terminal, E-Auto-Laden, Videoüberwachung und echten Reisebewertungen — nebeneinander, ohne versteckte Extras.",
    "how.step1.point1": "Nur geprüfte, ID-verifizierte Gastgeber",
    "how.step1.point2": "Transparente Preise pro Tag",
    "how.step1.point3": "Nach E-Auto, Videoüberwachung und Entfernung filtern",

    "how.step2.title": "Ihr Paket zusammenstellen",
    "how.step2.body":
      "Fügen Sie Ihrem Parkplatz einen lizenzierten Terminaltransfer, das Laden von E-Autos und Live-Sicherheit hinzu — und zahlen Sie einmal. Erklärbare KI schlägt die richtige Kombination für Ihre Reise vor, zu einem einzigen transparenten Preis.",
    "how.step2.point1": "Parken + Transfer + E-Auto + Sicherheit",
    "how.step2.point2": "Ein Checkout, ein Preis",
    "how.step2.point3": "KI-Vorschläge, die Sie verstehen können",

    "how.step3.title": "Bezahlen & QR-Code erhalten",
    "how.step3.body":
      "Zahlen Sie sicher und erhalten Sie sofort einen QR-Zugangscode. Er enthält alles, was Sie für die Parkschranke, Ihren Fahrer und die verifizierte Übergabe brauchen — alles in Ihrer Buchung gespeichert.",
    "how.step3.point1": "Sichere Kartenzahlung",
    "how.step3.point2": "Sofortiger QR-Zugangscode",
    "how.step3.point3": "Buchung offline in der App gespeichert",

    "how.step4.title": "Reisetag",
    "how.step4.body":
      "Sehen Sie alles live mit. Verfolgen Sie Ihren lizenzierten Fahrer auf einer Live-Karte, sehen Sie Ihr geparktes Auto auf einer Live-Kamera in der App und bestätigen Sie eine verifizierte Übergabe mit einem Einmalcode — mit Zeitstempel und protokolliert.",
    "how.step4.point1": "Live-Karte von Kunde, Gastgeber & Fahrer",
    "how.step4.point2": "Live-Kamera Ihres Autos",
    "how.step4.point3": "Verifizierte, protokollierte Übergabe",

    "how.step5.title": "Rückkehr & Bewertung",
    "how.step5.body":
      "Landen Sie, lassen Sie sich abholen und holen Sie Ihr Auto mit einer weiteren verifizierten Übergabe ab. Bewerten Sie dann Ihren Gastgeber und Fahrer — beidseitiges Vertrauensrating hält das gesamte Netzwerk ehrlich und hochwertig.",
    "how.step5.point1": "Rücktransfer bei der Landung",
    "how.step5.point2": "Abholung mit verifizierter Übergabe",
    "how.step5.point3": "Beidseitige Bewertungen",

    "how.live.eyebrow": "Live am Reisetag",
    "how.live.title": "Ruhe, die Sie tatsächlich mitverfolgen können",
    "how.live.body":
      "Die Alleinstellungsmerkmale von ParkGo werden an dem Tag lebendig, an dem Sie fliegen. Diese drei Funktionen verwandeln einen stressigen Morgen in etwas, das Sie in Echtzeit verfolgen können.",
    "how.live.feat1.title": "Live-Standortfreigabe",
    "how.live.feat1.body": "Sie, Ihr Gastgeber und Ihr lizenzierter Fahrer teilen sich am Reisetag eine Live-Karte.",
    "how.live.feat2.title": "Live-Kamera Ihres Autos",
    "how.live.feat2.body": "Öffnen Sie die App, um Ihr geparktes Fahrzeug mit LIVE-Abzeichen und Zeitstempel zu sehen.",
    "how.live.feat3.title": "Verifizierte Übergabe",
    "how.live.feat3.body": "Beide Parteien bestätigen bei Abgabe und Abholung einen Einmalcode — jedes Ereignis wird protokolliert.",

    "how.bundle.eyebrow": "Ein transparenter Preis",
    "how.bundle.title": "Vier Leistungen, in einem Checkout gebündelt",
    "how.bundle.body":
      "Kein Hin- und Herspringen zwischen Anbietern oder Vergleichen von Äpfeln mit Birnen. ParkGo kombiniert alles zu einem Preis, den Sie verstehen können, mit einer kleinen, klar ausgewiesenen Servicegebühr.",
    "how.bundle.item1.title": "Geprüftes privates Parken",
    "how.bundle.item1.body": "Die Einfahrt oder der Hof eines ID-geprüften Gastgebers in Terminalnähe.",
    "how.bundle.item2.title": "Lizenzierter Terminaltransfer",
    "how.bundle.item2.body": "Ein lizenzierter, versicherter Fahrer zur und von der Flughafentür.",
    "how.bundle.item3.title": "E-Auto-Laden",
    "how.bundle.item3.body": "Laden Sie während Ihrer Reise auf, wo der Gastgeber einen Ladepunkt anbietet.",
    "how.bundle.item4.title": "Live-Sicherheit",
    "how.bundle.item4.body": "Videoüberwachung, eine Live-Kamera und verifizierte Übergaben durchgehend.",

    "how.example.label": "Beispielpaket",
    "how.example.parking": "Flughafenparken",
    "how.example.parkingV": "von Ihrem gewählten Gastgeber",
    "how.example.transfer": "Lizenzierter Transfer",
    "how.example.transferV": "beide Richtungen",
    "how.example.ev": "E-Auto-Laden",
    "how.example.evV": "optionale Zusatzleistung",
    "how.example.fee": "Servicegebühr",
    "how.example.onePrice": "Ein Preis beim Checkout",
    "how.example.note":
      "Beispielhafte Angabe. Ihr Preis hängt von Flughafen, Terminen und den gewählten Zusatzleistungen ab.",
    "how.example.cta": "So funktioniert die Preisgestaltung",

    "how.other.eyebrow": "Die andere Seite des Netzwerks",
    "how.other.title": "Wie das Gastgeben funktioniert und wer Ihren Transfer durchführt",
    "how.other.body":
      "Reisende erhalten eine nahtlose Reise, weil Gastgeber geprüft sind und der Terminaltransfer von einem lizenzierten Betreiber abgewickelt wird. Hier ist die Kurzfassung von beidem.",

    "how.hosts.title": "Für Gastgeber",
    "how.hosts.step1.title": "Verifizieren lassen",
    "how.hosts.step1.body": "Bestätigen Sie Ihre Identität und Adresse, fügen Sie dann Ihren Platz hinzu — Maße, E-Auto, Videoüberwachung und Fotos.",
    "how.hosts.step2.title": "Live gehen",
    "how.hosts.step2.body": "Bestehen Sie eine schnelle Compliance-Prüfung, legen Sie die Verfügbarkeit fest und Ihre Einfahrt beginnt zu verdienen.",
    "how.hosts.step3.title": "Bezahlt werden",
    "how.hosts.step3.body": "Erhalten Sie sichere Auszahlungen nach jeder abgeschlossenen Buchung — Sie behalten den Großteil.",
    "how.hosts.cta": "Platz inserieren",

    "how.transfer.title": "Wer Ihren Transfer durchführt",
    "how.transfer.body1":
      "ParkGo betreibt keine Flotte und stellt keine Fahrer ein. Ihr Terminaltransfer wird von einem unabhängigen, lizenzierten und versicherten Betreiber bereitgestellt, der über eine API mit ParkGo integriert ist. Er ist Ihrer Parkbuchung bereits beigefügt, sodass Sie beim Checkout weiterhin einen Preis erhalten.",
    "how.transfer.body2":
      "Das Kundenerlebnis bleibt genau gleich — eine gebündelte Buchung, Live-Standort und voraussichtliche Ankunftszeit des Fahrers am Reisetag und eine verifizierte Übergabe — alles über die API des Betreibers statt über eine von ParkGo entwickelte Fahrer-App.",
    "how.transfer.cta": "Wie wir es sicher halten",

    "how.cta.title": "Bereit, clever zu parken und entspannt zu reisen?",
    "how.cta.body":
      "Starten Sie in wenigen Minuten eine Buchung oder tragen Sie sich in die Warteliste für Ihren Flughafen ein, und wir informieren Sie, sobald wir live gehen.",
    "how.cta.start": "Buchung starten",
    "how.cta.travellers": "Für Reisende",
    "how.cta.airports": "Parken in Großbritannien & Irland — Flughäfen, Städte & Events.",

    // ----------------------------------------------------------------------- FAQ
    "faq.hero.badge": "Häufig gestellte Fragen",
    "faq.hero.title": "Alles, was Sie über ParkGo wissen wollten",
    "faq.hero.subtitle":
      "Antworten für Reisende und Gastgeber. Finden Sie nicht, was Sie brauchen? Unser Team ist nur eine Nachricht entfernt.",

    "faq.cat.travellers": "Für Reisende",
    "faq.cat.hosts": "Für Gastgeber",
    "faq.cat.payments": "Zahlungen & Preise",
    "faq.cat.security": "Sicherheit & Sprachen",

    "faq.t1.q": "Was genau ist in einer ParkGo-Buchung enthalten?",
    "faq.t1.a":
      "Eine ParkGo-Buchung bündelt einen geprüften privaten Stellplatz, einen lizenzierten Terminaltransfer (beide Richtungen), optionales E-Auto-Laden und Live-Sicherheit — Videoüberwachung, eine Kamera in der App und verifizierte Übergaben — zu einem Preis und einem Checkout.",
    "faq.t2.q": "Ist mein Auto sicher, während ich weg bin?",
    "faq.t2.a":
      "Ja. Gastgeber sind ID-verifiziert, Plätze können Videoüberwachung enthalten, und Sie können Ihr geparktes Auto auf einer Live-Kamera in der App mit LIVE-Abzeichen und Zeitstempel sehen. Sowohl Abgabe als auch Abholung nutzen eine verifizierte, protokollierte Übergabe mit einem Einmalcode.",
    "faq.t3.q": "Werden Transfers von ParkGos eigenen Fahrern durchgeführt?",
    "faq.t3.a":
      "Nein. ParkGo betreibt keine Flotte und stellt keine Fahrer ein. Ihr Terminaltransfer wird von einem unabhängigen, lizenzierten und versicherten Betreiber bereitgestellt, der über eine API mit ParkGo integriert ist. Sie erhalten dennoch dasselbe Erlebnis — eine gebündelte Buchung, Live-Standort und voraussichtliche Ankunftszeit des Fahrers und eine verifizierte Übergabe — über die API des Betreibers.",
    "faq.t4.q": "Was passiert, wenn mein Flug verspätet ist?",
    "faq.t4.a":
      "Ihr Parkplatz und Ihr Rücktransfer sind an Ihre Reise gebunden, sodass eine Verspätung problemlos gehandhabt wird — Sie verlieren weder Ihren Platz noch Ihre Fahrt nach Hause. Wenn sich Pläne wesentlich ändern, können Sie Ihre Buchung in der App verwalten.",
    "faq.t5.q": "Welche Orte deckt ParkGo ab?",
    "faq.t5.a":
      "Wir decken die Flughäfen Heathrow, Gatwick, Stansted, Luton, Manchester, Birmingham, Edinburgh und Dublin ab — plus Innenstadt-, Bahnhofs- und Stadionparken in Großbritannien und Irland, weitere Orte folgen. Tragen Sie sich in die Warteliste ein, um zu erfahren, wann wir Sie erreichen.",

    "faq.h1.q": "Wer kann Gastgeber werden?",
    "faq.h1.a":
      "Jeder mit einem gesetzlichen Recht, einen geeigneten Platz in der Nähe eines Startflughafens zu vermieten — eine Einfahrt, einen Hof oder eine freie Bucht. Sie schließen die Identitäts- und Adressverifizierung sowie eine Berechtigungserklärung ab, bevor Ihr Platz live gehen kann.",
    "faq.h2.q": "Wie viel kann ich als Gastgeber verdienen?",
    "faq.h2.a":
      "Sie behalten den Großteil jeder Parkbuchung — richtwertartig rund 80 bis 85 Prozent, plus Einnahmen aus dem E-Auto-Laden, wo Sie es anbieten. Sie legen Ihren eigenen Tagespreis und Ihre Verfügbarkeit fest. Die Angaben sind Richtwerte und werden beim Start bestätigt.",
    "faq.h3.q": "Wie und wann werde ich bezahlt?",
    "faq.h3.a":
      "Auszahlungen werden nach jeder abgeschlossenen Buchung freigegeben und an die Bankdaten gesendet, die Sie beim Onboarding hinzufügen. Ihre Bankdaten sind verschlüsselt und werden Reisenden nie angezeigt, und Sie erhalten klare Abrechnungen für jede Buchung.",

    "faq.p1.q": "Wie funktioniert die Preisgestaltung von ParkGo?",
    "faq.p1.a":
      "Parken, der lizenzierte Transfer und das E-Auto-Laden werden zu einem einzigen transparenten Preis kombiniert, zuzüglich einer kleinen pauschalen Servicegebühr von £2,99, die immer vor der Zahlung angezeigt wird. Es gibt keine versteckten Extras.",
    "faq.p2.q": "Wie viel Provision nimmt ParkGo?",
    "faq.p2.a":
      "Richtwertartig rund 18 Prozent auf das Parken, zuzüglich der pauschalen Servicegebühr, klar in den Auszahlungsabrechnungen der Gastgeber ausgewiesen. Der Terminaltransfer wird von einem unabhängigen lizenzierten Betreiber bereitgestellt und ist in Ihrem Paketpreis enthalten. Die Angaben sind Richtwerte und noch zu bestätigen.",
    "faq.p3.q": "Bieten Sie Firmenkonten an?",
    "faq.p3.a":
      "Ja. Firmenkonten ergänzen zentrale Buchungen, monatliche Rechnungsstellung statt Karten pro Reise, vorrangigen Support und klare Abrechnungen für die Spesenabrechnung. Kontaktieren Sie uns, um Ihr Team einzurichten.",

    "faq.s1.q": "Wie schützt ParkGo meine Daten?",
    "faq.s1.a":
      "Wir richten uns nach der UK-DSGVO und den ICO-Vorgaben: Datenminimierung, eine Rechtsgrundlage für jede Nutzung, definierte Aufbewahrung und einfache Betroffenenanfragen. Identitäts- und Bankdokumente werden verschlüsselt und getrennt gespeichert, mit Audit-Protokollierung und Zugriffskontrollen nach dem Prinzip der geringsten Rechte.",
    "faq.s2.q": "Was bedeutet eine verifizierte Übergabe?",
    "faq.s2.a":
      "Bei Abgabe und Abholung bestätigen beide Parteien einen Einmalcode in der App. Jede Bestätigung erhält einen Zeitstempel und wird in ein Audit-Protokoll geschrieben, wodurch eine klare Verwahrkette für Ihr Fahrzeug entsteht.",
    "faq.s3.q": "In welchen Sprachen ist ParkGo verfügbar?",
    "faq.s3.a":
      "ParkGo startet in fünf Sprachen in Großbritannien und Irland, weitere sind geplant. Sie können die Sprache jederzeit über die Kopfzeile der Website wechseln.",

    "faq.cta.title": "Haben Sie noch eine Frage?",
    "faq.cta.body":
      "Wir helfen Ihnen gerne bei allem rund um Buchungen, Gastgeben, Partnerschaften oder Ihre Daten. Senden Sie uns eine Nachricht und wir melden uns bei Ihnen.",
    "faq.cta.contact": "Kontakt aufnehmen",
    "faq.cta.how": "So funktioniert's",
  },

  zh: {
    // -------------------------------------------------------------- How it works
    "how.hero.badge": "一次预订 · 一个价格 · 一个应用",
    "how.hero.title": "ParkGo 的运作方式：从搜索到已验证的交接",
    "how.hero.subtitle":
      "大多数旅客要在三个应用和三种价格之间处理停车、接送和电动车充电。ParkGo 将它们整合为一段可全程查看的可信旅程。",
    "how.hero.cta": "开始预订",
    "how.hero.pricing": "查看价格",

    "how.journey.eyebrow": "旅客的旅程",
    "how.journey.title": "从搜索车位到落地回家的五个步骤",
    "how.journey.body":
      "每一步都经过验证、透明且可追踪。在闸口没有意外，也无需猜测您的爱车在哪里。",

    "how.step1.title": "搜索与比较",
    "how.step1.body":
      "告诉我们您的机场和日期。ParkGo 会并排展示经过验证的私人车位——包含价格、到航站楼的距离、电动车充电、闭路电视和真实旅客评分，绝无隐藏费用。",
    "how.step1.point1": "仅限已验证、身份核验的房东",
    "how.step1.point2": "透明的按天价格",
    "how.step1.point3": "按电动车充电、闭路电视和距离筛选",

    "how.step2.title": "组合您的套餐",
    "how.step2.body":
      "在您的停车中加入持牌航站楼接送、电动车充电和实时安防——然后一次付款。可解释的 AI 会为您的行程推荐合适的组合，并给出单一透明价格。",
    "how.step2.point1": "停车 + 接送 + 电动车充电 + 安防",
    "how.step2.point2": "一次结账，一个价格",
    "how.step2.point3": "您能看懂的 AI 建议",

    "how.step3.title": "付款并获取二维码",
    "how.step3.body":
      "安全结账并即时获得一个二维码通行码。它包含您在停车闸口、见到司机以及已验证交接时所需的一切——全部保存在您的预订中。",
    "how.step3.point1": "安全的银行卡支付",
    "how.step3.point2": "即时二维码通行码",
    "how.step3.point3": "预订在应用内离线保存",

    "how.step4.title": "出行当天",
    "how.step4.body":
      "全程亲眼见证。在实时地图上追踪您的持牌司机，在应用内的实时摄像头上查看您停放的爱车，并用一次性验证码确认已验证的交接——带时间戳并记录在案。",
    "how.step4.point1": "顾客、房东和司机的实时地图",
    "how.step4.point2": "您爱车的实时摄像头",
    "how.step4.point3": "已验证、已记录的交接",

    "how.step5.title": "返程与评价",
    "how.step5.body":
      "落地、接您并通过又一次已验证的交接取回爱车。然后为您的房东和司机评分——双向信任评分让整个网络保持诚信和高品质。",
    "how.step5.point1": "落地时的返程接送",
    "how.step5.point2": "通过已验证的交接取车",
    "how.step5.point3": "双向评价",

    "how.live.eyebrow": "出行当天实时",
    "how.live.title": "看得见的安心",
    "how.live.body":
      "ParkGo 的差异化优势在您出行当天真正显现。这三项功能把紧张的清晨变成您可以实时跟进的过程。",
    "how.live.feat1.title": "实时位置共享",
    "how.live.feat1.body": "出行当天，您、您的房东和您的持牌司机共享同一张实时地图。",
    "how.live.feat2.title": "您爱车的实时摄像头",
    "how.live.feat2.body": "打开应用，即可查看带 LIVE 标识和时间戳的停放车辆。",
    "how.live.feat3.title": "已验证的交接",
    "how.live.feat3.body": "双方在停车和取车时确认一次性验证码——每个环节都记录在案。",

    "how.bundle.eyebrow": "一个透明价格",
    "how.bundle.title": "四项服务，整合进一次结账",
    "how.bundle.body":
      "无需在多家供应商之间来回切换，也无需拿苹果比橘子。ParkGo 将一切整合为一个您能看懂的价格，并附有一笔清晰列示的小额服务费。",
    "how.bundle.item1.title": "已验证的私人停车",
    "how.bundle.item1.body": "航站楼附近一位身份核验房东的车道或院子。",
    "how.bundle.item2.title": "持牌航站楼接送",
    "how.bundle.item2.body": "一位持牌、有保险的司机往返机场门口。",
    "how.bundle.item3.title": "电动车充电",
    "how.bundle.item3.body": "在房东提供充电桩的地方，出行期间即可充电。",
    "how.bundle.item4.title": "实时安防",
    "how.bundle.item4.body": "全程闭路电视、实时摄像头和已验证的交接。",

    "how.example.label": "示例套餐",
    "how.example.parking": "机场停车",
    "how.example.parkingV": "来自您选择的房东",
    "how.example.transfer": "持牌接送",
    "how.example.transferV": "往返双程",
    "how.example.ev": "电动车充电",
    "how.example.evV": "可选附加项",
    "how.example.fee": "服务费",
    "how.example.onePrice": "结账时一个价格",
    "how.example.note":
      "示意性示例。您的价格取决于机场、日期以及您选择的附加项。",
    "how.example.cta": "价格如何计算",

    "how.other.eyebrow": "网络的另一面",
    "how.other.title": "房东如何运作，以及谁负责您的接送",
    "how.other.body":
      "旅客能获得顺畅的旅程，是因为房东都经过验证，且航站楼接送由持牌运营商负责。以下是两者的简要说明。",

    "how.hosts.title": "房东专区",
    "how.hosts.step1.title": "完成验证",
    "how.hosts.step1.body": "确认您的身份和地址，然后添加您的车位——尺寸、电动车充电、闭路电视和照片。",
    "how.hosts.step2.title": "正式上线",
    "how.hosts.step2.body": "通过快速合规审核，设置可用时间，您的车道便开始赚钱。",
    "how.hosts.step3.title": "获得收款",
    "how.hosts.step3.body": "每完成一次预订后即可获得安全打款——您可保留其中的大部分。",
    "how.hosts.cta": "发布您的车位",

    "how.transfer.title": "谁负责您的接送",
    "how.transfer.body1":
      "ParkGo 不运营车队，也不招募司机。您的航站楼接送由一家独立、持牌且有保险的运营商提供，并通过 API 与 ParkGo 集成。它已预先附加到您的停车预订中，因此您在结账时仍然只需支付一个价格。",
    "how.transfer.body2":
      "顾客体验完全保持不变——一次打包预订、出行当天的实时司机位置和预计到达时间，以及一次已验证的交接——这一切都由运营商的 API 驱动，而非 ParkGo 自建的司机应用。",
    "how.transfer.cta": "我们如何保障安全",

    "how.cta.title": "准备好聪明停车、轻松出行了吗？",
    "how.cta.body":
      "几分钟内即可开始预订，或加入您所在机场的等候名单，我们上线时会第一时间通知您。",
    "how.cta.start": "开始预订",
    "how.cta.travellers": "旅客专区",
    "how.cta.airports": "覆盖英国和爱尔兰 — 机场、城市与活动场馆。",

    // ----------------------------------------------------------------------- FAQ
    "faq.hero.badge": "常见问题",
    "faq.hero.title": "关于 ParkGo 您想问的一切",
    "faq.hero.subtitle":
      "为旅客和房东提供的解答。没找到您需要的？我们的团队随时为您服务。",

    "faq.cat.travellers": "旅客专区",
    "faq.cat.hosts": "房东专区",
    "faq.cat.payments": "付款与价格",
    "faq.cat.security": "安全与语言",

    "faq.t1.q": "一次 ParkGo 预订究竟包含什么？",
    "faq.t1.a":
      "一次 ParkGo 预订将经过验证的私人停车位、持牌航站楼接送（往返双程）、可选的电动车充电以及实时安防——闭路电视、应用内摄像头和已验证的交接——整合为一个价格、一次结账。",
    "faq.t2.q": "我离开时爱车安全吗？",
    "faq.t2.a":
      "安全。房东经过身份验证，车位可配备闭路电视，您还可以在应用内的实时摄像头上查看停放的爱车，带 LIVE 标识和时间戳。停车和取车均采用带一次性验证码的已验证、已记录交接。",
    "faq.t3.q": "接送是由 ParkGo 自己的司机运营的吗？",
    "faq.t3.a":
      "不是。ParkGo 不运营车队，也不招募司机。您的航站楼接送由一家独立、持牌且有保险的运营商提供，并通过 API 与 ParkGo 集成。您仍能获得相同的体验——一次打包预订、实时司机位置和预计到达时间，以及一次已验证的交接——由运营商的 API 驱动。",
    "faq.t4.q": "如果我的航班延误了怎么办？",
    "faq.t4.a":
      "您的停车和返程接送都与您的行程绑定，因此延误会被妥善处理——您不会失去车位或回家的车。如果计划有重大变动，您可以在应用内管理您的预订。",
    "faq.t5.q": "ParkGo 覆盖哪些地点？",
    "faq.t5.a":
      "我们覆盖希思罗、盖特威克、斯坦斯特德、卢顿、曼彻斯特、伯明翰、爱丁堡和都柏林机场，以及英国和爱尔兰的市中心、车站与球场停车 — 更多地点即将上线。加入候补名单，第一时间获知我们何时到达您的城市。",

    "faq.h1.q": "谁可以成为房东？",
    "faq.h1.a":
      "任何在首发机场附近拥有合法出租权、可提供合适场地的人——车道、院子或空余车位。在您的车位上线之前，您需完成身份和地址验证以及出租权声明。",
    "faq.h2.q": "作为房东我能赚多少？",
    "faq.h2.a":
      "每笔停车预订您都可保留其中的大部分——示意性地约为 80% 至 85%，若您提供电动车充电，还可额外获得充电收入。您可自行设定按天价格和可用时间。数字为示意性数据，将在上线时确认。",
    "faq.h3.q": "我如何以及何时收款？",
    "faq.h3.a":
      "每完成一次预订后即发放打款，并汇入您在注册时填写的银行账户。您的银行信息经过加密，绝不会向旅客展示，并且您会为每笔预订获得清晰的对账单。",

    "faq.p1.q": "ParkGo 的价格如何计算？",
    "faq.p1.a":
      "停车、持牌接送和电动车充电整合为一个透明价格，另加一笔 £2.99 的小额固定服务费，付款前始终会显示。绝无隐藏费用。",
    "faq.p2.q": "ParkGo 收取多少佣金？",
    "faq.p2.a":
      "示意性地约为停车费的 18%，另加固定服务费，并在房东打款对账单中清晰列示。航站楼接送由一家独立持牌运营商提供，已包含在您的套餐价格中。数字为示意性数据，尚待确认。",
    "faq.p3.q": "你们提供企业账户吗？",
    "faq.p3.a":
      "提供。企业账户增加了集中预订、按月开票（取代逐次行程刷卡）、优先支持以及便于报销的清晰对账单。请联系我们为您的团队开通。",

    "faq.s1.q": "ParkGo 如何保护我的数据？",
    "faq.s1.a":
      "我们遵循英国 GDPR 和 ICO 指南：数据最小化、每一项使用都有合法依据、明确的保留期限，以及便捷的数据主体请求。身份和银行文件经过加密并单独存储，配有审计日志和最小权限访问控制。",
    "faq.s2.q": "已验证的交接是什么意思？",
    "faq.s2.a":
      "在停车和取车时，双方在应用内确认一次性验证码。每次确认都带有时间戳并写入审计日志，为您的车辆建立清晰的保管链条。",
    "faq.s3.q": "ParkGo 提供哪些语言？",
    "faq.s3.a":
      "ParkGo 在英国和爱尔兰以五种语言推出，并计划增加更多。您可以随时从网站页眉切换语言。",

    "faq.cta.title": "还有疑问吗？",
    "faq.cta.body":
      "关于预订、房东、合作或您的数据的任何问题，我们都乐意帮助。给我们发条消息，我们会尽快回复您。",
    "faq.cta.contact": "联系我们",
    "faq.cta.how": "运作方式",
  },
};
