import type { AreaDict } from "@/lib/i18n/config";

// Travellers + Hosts + About. Keys namespaced "travellers.*", "hosts.*", "about.*".
export const marketingB: AreaDict = {
  en: {
    // ---------------------------------------------------------------- Travellers
    "travellers.badge": "For travellers",
    "travellers.hero.title": "Park, transfer and charge — sorted in a single booking",
    "travellers.hero.subtitle":
      "ParkGo turns the most stressful part of flying into the easiest. One transparent price, verified people and live tracking from your driveway search to landing back home.",
    "travellers.hero.cta.book": "Start a booking",
    "travellers.hero.cta.how": "See how it works",
    "travellers.trust.hosts": "Verified hosts",
    "travellers.trust.drivers": "Licensed drivers",
    "travellers.trust.camera": "Live camera & CCTV",

    "travellers.benefits.eyebrow": "Why travellers choose ParkGo",
    "travellers.benefits.title": "Everything the trip needs, none of the hassle",
    "travellers.benefits.body":
      "We bundled the things you used to book separately — and added the trust and visibility that airport parking has always been missing.",
    "travellers.benefit.oneprice.title": "One price, one booking",
    "travellers.benefit.oneprice.body":
      "Parking, a licensed transfer and EV charging in a single transparent checkout. No juggling apps, no hidden extras.",
    "travellers.benefit.verified.title": "Verified & secure",
    "travellers.benefit.verified.body":
      "Every host is ID-checked and every driver is licensed and insured. CCTV and verified handovers throughout.",
    "travellers.benefit.tracking.title": "Live tracking & camera",
    "travellers.benefit.tracking.body":
      "Follow your driver on a live map and watch your parked car on an in-app camera with a LIVE badge.",
    "travellers.benefit.ev.title": "EV charging",
    "travellers.benefit.ev.body":
      "Add a top-up while you travel at hosts that offer a charger. Land back to a car that's ready to go.",
    "travellers.benefit.multilingual.title": "Multilingual",
    "travellers.benefit.multilingual.body":
      "Use ParkGo in your language — four launch languages across the UK & Ireland, with more to follow.",
    "travellers.benefit.corporate.title": "Corporate accounts",
    "travellers.benefit.corporate.body":
      "Travelling for work? Centralised bookings, monthly invoicing and priority support for teams.",
    "travellers.benefit.referral.title": "Referral programme",
    "travellers.benefit.referral.body":
      "Share ParkGo with friends and family and you both get rewarded when they take their first trip.",
    "travellers.benefit.cheaper.title": "Often cheaper",
    "travellers.benefit.cheaper.body":
      "Verified driveways near the terminal frequently undercut official long-stay car parks — without the shuttle wait.",

    "travellers.how.eyebrow": "How it works",
    "travellers.how.title": "Booked in minutes, sorted for the whole trip",
    "travellers.how.step1.title": "Search & compare",
    "travellers.how.step1.body":
      "Pick your airport and dates. See verified spaces with price, distance, EV and ratings.",
    "travellers.how.step2.title": "Build your bundle",
    "travellers.how.step2.body":
      "Add a licensed transfer and EV charging. One price, one secure checkout.",
    "travellers.how.step3.title": "Park, track, fly",
    "travellers.how.step3.body":
      "Get your QR, track your driver live, watch your car and confirm a verified handover.",
    "travellers.how.cta": "See the full journey",

    "travellers.faq.eyebrow": "Good to know",
    "travellers.faq.title": "Questions travellers ask first",
    "travellers.faq.body": "A few quick answers before you book. There's plenty more in our full FAQ.",
    "travellers.faq.cta": "Read the full FAQ",
    "travellers.faq.q1": "Is my car safe while I'm away?",
    "travellers.faq.a1":
      "Hosts are ID-verified, spaces can include CCTV, and you can watch a live in-app camera. Drop-off and collection both use a verified, logged handover.",
    "travellers.faq.q2": "What if my flight is delayed?",
    "travellers.faq.a2":
      "Your booking and return transfer are tied to your trip, so a delay is handled gracefully — you won't lose your space or your ride home.",
    "travellers.faq.q3": "Can I pay in one go?",
    "travellers.faq.a3":
      "Yes. Parking, transfer and EV charging are combined into a single transparent price with a small, clearly shown service fee.",

    "travellers.waitlist.title": "Be first to book at your airport",
    "travellers.waitlist.body":
      "We're launching across the UK & Ireland. Join the waitlist and we'll let you know the moment ParkGo goes live where you fly from.",

    // -------------------------------------------------------------------- Hosts
    "hosts.badge": "For hosts & landlords",
    "hosts.hero.title": "Earn from a driveway near the airport",
    "hosts.hero.subtitle":
      "If you live near a UK or Irish airport, your empty driveway, yard or spare space could be earning. Get verified, list it in minutes and keep the large majority of every booking.",
    "hosts.hero.cta.list": "List your space",
    "hosts.hero.cta.onboarding": "How onboarding works",
    "hosts.hero.keep": "Keep ~{pct}% of parking",
    "hosts.hero.travellers": "Verified travellers",

    "hosts.earnings.label": "What you keep",
    "hosts.earnings.ofBooking": "of every parking booking",
    "hosts.earnings.indicative": "Indicative",
    "hosts.earnings.travellerPays": "Traveller pays for parking",
    "hosts.earnings.commission": "ParkGo commission",
    "hosts.earnings.youReceive": "You receive",
    "hosts.earnings.note":
      "EV charging revenue follows the same split — you own the charger. Figures are indicative and to be confirmed at launch.",

    "hosts.why.eyebrow": "Why host with ParkGo",
    "trav.compare.eyebrow": "Compare",
    "trav.compare.heading": "ParkGo vs typical on-site parking",
    "trav.compare.sub": "What you get with a verified private space instead of the official car park.",
    "trav.compare.col.feature": "What matters",
    "trav.compare.col.official": "Typical on-site parking",
    "trav.compare.price": "Price per day",
    "trav.compare.price.official": "£20–£40 typical",
    "trav.compare.price.parkgo": "From £6 — hosts set the price",
    "trav.compare.camera": "Watch your own car",
    "trav.compare.camera.official": "—",
    "trav.compare.camera.parkgo": "Live camera view + CCTV badges",
    "trav.compare.cancel": "Cancellation",
    "trav.compare.cancel.official": "Fees often apply",
    "trav.compare.cancel.parkgo": "Free up to 24h before drop-off",
    "trav.compare.transfer": "Terminal transfer",
    "trav.compare.transfer.official": "Shared shuttle bus",
    "trav.compare.transfer.parkgo": "Licensed private taxi in the same booking",
    "trav.compare.ev": "EV charging",
    "trav.compare.ev.official": "Limited bays",
    "trav.compare.ev.parkgo": "Bookable add-on at many spaces",
    "trav.compare.support": "Support",
    "trav.compare.support.official": "Phone queues",
    "trav.compare.support.parkgo": "Instant chat in 5 languages",
    "trav.compare.note": "Indicative comparison — on-site prices and policies vary by airport and operator.",
    "hosts.calc.eyebrow": "Your earnings",
    "hosts.calc.heading": "What could your space earn?",
    "hosts.calc.sub": "Move the sliders — your price, your availability.",
    "hosts.calc.price": "Your price per day",
    "hosts.calc.days": "Booked days per month",
    "hosts.calc.monthly": "Estimated monthly earnings",
    "hosts.calc.yearly": "per year",
    "hosts.calc.youKeep": "You keep",
    "hosts.calc.note": "An estimate, not a guarantee — actual earnings depend on demand, your price and availability.",
    "hosts.why.title": "Put unused space to work",
    "hosts.why.body":
      "Travellers want a secure, convenient place to leave the car. If you're near a terminal, that's exactly what your space already is.",
    "hosts.why.economics.title": "Strong economics",
    "hosts.why.economics.body":
      "Keep around {pct}% of each parking booking, with EV charging on top where you offer it.",
    "hosts.why.usewhat.title": "Use what you have",
    "hosts.why.usewhat.body":
      "A driveway, a yard, a spare bay — no building work, no new equipment required to start.",
    "hosts.why.ev.title": "Earn more with EV",
    "hosts.why.ev.body": "List a charger and capture EV charging revenue while travellers are away.",
    "hosts.why.risk.title": "Lower risk",
    "hosts.why.risk.body":
      "Verified travellers, optional CCTV and verified handovers mean fewer surprises.",

    "hosts.onboarding.eyebrow": "Getting set up",
    "hosts.onboarding.title": "From sign-up to go-live in a few clear steps",
    "hosts.onboarding.body":
      "Onboarding is built around trust on both sides. Every host is verified before a single traveller can book.",
    "hosts.onboarding.identity.title": "Verify your identity",
    "hosts.onboarding.identity.body":
      "A quick KYC check confirms who you are. Documents are encrypted and stored separately from your profile.",
    "hosts.onboarding.address.title": "Verify your address",
    "hosts.onboarding.address.body":
      "We confirm the location of the space you want to list so travellers know exactly where they're parking.",
    "hosts.onboarding.details.title": "Add property details",
    "hosts.onboarding.details.body":
      "Photos, bay dimensions, access notes and whether you offer EV charging or CCTV — the things travellers filter on.",
    "hosts.onboarding.declaration.title": "Right-to-list declaration",
    "hosts.onboarding.declaration.body":
      "Confirm you're entitled to rent the space (owner or with permission) and that it's safe and legal to use.",
    "hosts.onboarding.bank.title": "Add bank details",
    "hosts.onboarding.bank.body":
      "Tell us where to send your payouts. Bank details are encrypted and never shown to travellers.",
    "hosts.onboarding.review.title": "Compliance review",
    "hosts.onboarding.review.body":
      "Our team reviews your listing against our trust and safety standards before it can go live.",
    "hosts.onboarding.golive.title": "Go live & earn",
    "hosts.onboarding.golive.body":
      "Set your availability and price. Your space starts appearing in traveller searches straight away.",

    "hosts.trust.eyebrow": "Trust & protection",
    "hosts.trust.title": "Built to protect hosts as much as travellers",
    "hosts.trust.body":
      "You're inviting someone to use your space, so trust matters. ParkGo verifies both sides and keeps a clear, logged record of every booking.",
    "hosts.trust.travellers.title": "Verified travellers",
    "hosts.trust.travellers.body":
      "Bookings come from real, registered ParkGo customers — and you can review them too.",
    "hosts.trust.cctv.title": "Optional CCTV & live camera",
    "hosts.trust.cctv.body":
      "Add a camera to your listing for extra reassurance, for you and the traveller alike.",
    "hosts.trust.handover.title": "Verified handovers",
    "hosts.trust.handover.body":
      "Every drop-off and collection is confirmed with a one-time code, timestamped and logged.",
    "hosts.trust.terms.title": "Clear terms",
    "hosts.trust.terms.body":
      "Transparent host terms, a defined right-to-list declaration and platform support if anything goes wrong.",
    "hosts.trust.cta": "Read trust & safety",

    "hosts.payouts.title": "Simple, secure payouts",
    "hosts.payouts.percompleted.title": "Paid per completed booking",
    "hosts.payouts.percompleted.body":
      "Earnings are released after each trip completes — no chasing, no invoicing on your side.",
    "hosts.payouts.tobank.title": "Straight to your bank",
    "hosts.payouts.tobank.body":
      "Payouts go to the encrypted bank details you add during onboarding.",
    "hosts.payouts.statements.title": "Clear statements",
    "hosts.payouts.statements.body":
      "See every booking, the commission taken and your payout in one place.",
    "hosts.payouts.setprice.title": "You set the price",
    "hosts.payouts.setprice.body":
      "Choose your per-day rate and availability — raise it for peak periods whenever you like.",
    "hosts.payouts.cta": "See host economics",

    "hosts.waitlist.title": "Ready to earn from your space?",
    "hosts.waitlist.body":
      "Join the host waitlist and we'll invite you to get verified and list as soon as we launch near you.",
    "hosts.waitlist.nospam": "No obligation — list only when you're ready.",

    // -------------------------------------------------------------------- About
    "about.badge": "About ParkGo",
    "about.hero.title": "Making airport access seamless for the UK & Ireland",
    "about.hero.subtitle":
      "ParkGo brings parking, licensed transfers, EV charging and live security into one trusted booking — so getting to your flight is the easy part of the trip.",

    "about.mission.eyebrow": "Our mission",
    "about.mission.title": "Parking for every journey, built on trust",
    "about.mission.body":
      "We believe getting to the airport should be as well designed as the flight itself. Our mission is to connect verified hosts, an independent licensed transfer operator and travellers in a single, transparent journey — across the UK & Ireland and in your language.",

    "about.problem.title": "The problem",
    "about.problem.body":
      "Airport travel is fragmented. You book parking on one site, a transfer on another, hunt for EV charging separately, and just hope your car is safe while you're away. Prices are opaque, shuttles are slow, and there's no real visibility on the day it matters.",
    "about.problem.point1": "Multiple bookings, multiple prices",
    "about.problem.point2": "No clear view of where your car or driver is",
    "about.problem.point3": "Limited trust and patchy verification",

    "about.approach.title": "Our approach",
    "about.approach.body":
      "ParkGo bundles the whole journey into one checkout, then makes it visible and verifiable. Verified hosts, licensed drivers, a single transparent price, and live tracking with an in-app camera and verified handovers from start to finish.",
    "about.approach.point1": "One booking, one price, one app",
    "about.approach.point2": "Two-sided verification and trust scoring",
    "about.approach.point3": "Live tracking, camera and verified handovers",

    "about.values.eyebrow": "What we value",
    "about.values.title": "The principles behind the product",
    "about.value.trust.title": "Trust first",
    "about.value.trust.body":
      "Verification, visibility and clear records sit at the heart of every decision we make.",
    "about.value.integrated.title": "Genuinely integrated",
    "about.value.integrated.body":
      "One booking, one price, one app — we refuse to ship another disconnected experience.",
    "about.value.human.title": "Human by default",
    "about.value.human.body":
      "Multilingual, accessible and supportive. Travel is stressful enough already.",
    "about.value.fair.title": "Open & fair",
    "about.value.fair.body":
      "Transparent pricing for travellers and fair, configurable economics for hosts and partners.",

    "about.team.eyebrow": "Our team",
    "about.team.title": "The people building ParkGo",
    "about.team.body":
      "A small, focused team obsessed with trust, design and getting travellers to their flight without the stress.",
    "about.team.role.ceo": "Founder & CEO",
    "about.team.role.product": "Head of Product",
    "about.team.role.engineering": "Head of Engineering",
    "about.team.role.trust": "Trust & Safety Lead",
    "about.team.growing": "We're growing — see open roles on our",
    "about.team.contactPage": "contact page",

    "about.vision.mission.k": "1 mission",
    "about.vision.mission.v": "Seamless airport access",
    "about.vision.region.k": "UK & Ireland",
    "about.vision.region.v": "Where we're launching first",
    "about.vision.sides.k": "3 sides",
    "about.vision.sides.v": "Travellers, hosts & partners",
    "about.vision.trust.k": "Built to trust",
    "about.vision.trust.v": "Verification at every step",

    "about.waitlist.title": "Come along for the journey",
    "about.waitlist.body":
      "We're building ParkGo in the open and launching airport by airport. Join the waitlist and grow with us.",
    "about.waitlist.cta": "See how it works",
  },

  ur: {
    // ---------------------------------------------------------------- Travellers
    "travellers.badge": "مسافروں کے لیے",
    "travellers.hero.title": "پارک کریں، ٹرانسفر لیں اور چارج کریں — سب کچھ ایک ہی بکنگ میں",
    "travellers.hero.subtitle":
      "پارک گو پرواز کے سب سے پریشان کن حصے کو سب سے آسان بنا دیتا ہے۔ ایک شفاف قیمت، تصدیق شدہ افراد اور آپ کی ڈرائیو وے کی تلاش سے لے کر گھر واپسی تک لائیو ٹریکنگ۔",
    "travellers.hero.cta.book": "بکنگ شروع کریں",
    "travellers.hero.cta.how": "دیکھیں یہ کیسے کام کرتا ہے",
    "travellers.trust.hosts": "تصدیق شدہ میزبان",
    "travellers.trust.drivers": "لائسنس یافتہ ڈرائیور",
    "travellers.trust.camera": "لائیو کیمرہ اور سی سی ٹی وی",

    "travellers.benefits.eyebrow": "مسافر پارک گو کیوں منتخب کرتے ہیں",
    "travellers.benefits.title": "سفر کے لیے درکار سب کچھ، بغیر کسی جھنجھٹ کے",
    "travellers.benefits.body":
      "ہم نے وہ چیزیں یکجا کر دیں جو آپ پہلے الگ الگ بک کرتے تھے — اور وہ اعتماد اور شفافیت شامل کی جو ایئرپورٹ پارکنگ میں ہمیشہ سے کمی تھی۔",
    "travellers.benefit.oneprice.title": "ایک قیمت، ایک بکنگ",
    "travellers.benefit.oneprice.body":
      "پارکنگ، ایک لائسنس یافتہ ٹرانسفر اور ای وی چارجنگ ایک ہی شفاف چیک آؤٹ میں۔ نہ ایپس کا جھنجھٹ، نہ کوئی چھپے ہوئے اضافی اخراجات۔",
    "travellers.benefit.verified.title": "تصدیق شدہ اور محفوظ",
    "travellers.benefit.verified.body":
      "ہر میزبان کی شناخت جانچی جاتی ہے اور ہر ڈرائیور لائسنس یافتہ اور بیمہ شدہ ہے۔ سی سی ٹی وی اور تصدیق شدہ ہینڈ اوور ہر جگہ۔",
    "travellers.benefit.tracking.title": "لائیو ٹریکنگ اور کیمرہ",
    "travellers.benefit.tracking.body":
      "اپنے ڈرائیور کو لائیو نقشے پر دیکھیں اور اپنی پارک شدہ گاڑی کو ایپ میں کیمرے پر لائیو بیج کے ساتھ دیکھیں۔",
    "travellers.benefit.ev.title": "ای وی چارجنگ",
    "travellers.benefit.ev.body":
      "سفر کے دوران ان میزبانوں کے پاس چارج کروائیں جو چارجر فراہم کرتے ہیں۔ واپسی پر ایک تیار گاڑی پائیں۔",
    "travellers.benefit.multilingual.title": "کثیر لسانی",
    "travellers.benefit.multilingual.body":
      "پارک گو کو اپنی زبان میں استعمال کریں — برطانیہ اور آئرلینڈ بھر میں چار لانچ زبانیں، مزید آنے والی ہیں۔",
    "travellers.benefit.corporate.title": "کارپوریٹ اکاؤنٹس",
    "travellers.benefit.corporate.body":
      "کام کے لیے سفر کر رہے ہیں؟ ٹیموں کے لیے مرکزی بکنگ، ماہانہ انوائسنگ اور ترجیحی معاونت۔",
    "travellers.benefit.referral.title": "ریفرل پروگرام",
    "travellers.benefit.referral.body":
      "پارک گو کو دوستوں اور خاندان کے ساتھ شیئر کریں اور جب وہ اپنا پہلا سفر کریں تو آپ دونوں کو انعام ملے گا۔",
    "travellers.benefit.cheaper.title": "اکثر سستا",
    "travellers.benefit.cheaper.body":
      "ٹرمینل کے قریب تصدیق شدہ ڈرائیو ویز اکثر سرکاری لانگ سٹے کار پارکس سے سستے ہوتے ہیں — اور بغیر شٹل کے انتظار کے۔",

    "travellers.how.eyebrow": "یہ کیسے کام کرتا ہے",
    "travellers.how.title": "منٹوں میں بک، پورے سفر کے لیے تیار",
    "travellers.how.step1.title": "تلاش اور موازنہ کریں",
    "travellers.how.step1.body":
      "اپنا ایئرپورٹ اور تاریخیں منتخب کریں۔ قیمت، فاصلے، ای وی اور ریٹنگ کے ساتھ تصدیق شدہ جگہیں دیکھیں۔",
    "travellers.how.step2.title": "اپنا بنڈل بنائیں",
    "travellers.how.step2.body":
      "ایک لائسنس یافتہ ٹرانسفر اور ای وی چارجنگ شامل کریں۔ ایک قیمت، ایک محفوظ چیک آؤٹ۔",
    "travellers.how.step3.title": "پارک کریں، ٹریک کریں، اڑان بھریں",
    "travellers.how.step3.body":
      "اپنا کیو آر حاصل کریں، اپنے ڈرائیور کو لائیو ٹریک کریں، اپنی گاڑی دیکھیں اور تصدیق شدہ ہینڈ اوور کی تصدیق کریں۔",
    "travellers.how.cta": "مکمل سفر دیکھیں",

    "travellers.faq.eyebrow": "جاننا اچھا ہے",
    "travellers.faq.title": "مسافر سب سے پہلے جو سوالات پوچھتے ہیں",
    "travellers.faq.body": "بکنگ سے پہلے چند فوری جوابات۔ ہمارے مکمل عمومی سوالات میں اور بہت کچھ ہے۔",
    "travellers.faq.cta": "مکمل عمومی سوالات پڑھیں",
    "travellers.faq.q1": "کیا میری غیر موجودگی میں میری گاڑی محفوظ ہے؟",
    "travellers.faq.a1":
      "میزبانوں کی شناخت تصدیق شدہ ہوتی ہے، جگہوں میں سی سی ٹی وی شامل ہو سکتا ہے، اور آپ ایپ میں لائیو کیمرہ دیکھ سکتے ہیں۔ گاڑی چھوڑنے اور لینے دونوں میں تصدیق شدہ، ریکارڈ شدہ ہینڈ اوور ہوتا ہے۔",
    "travellers.faq.q2": "اگر میری پرواز میں تاخیر ہو جائے تو؟",
    "travellers.faq.a2":
      "آپ کی بکنگ اور واپسی ٹرانسفر آپ کے سفر سے منسلک ہیں، اس لیے تاخیر کو احسن طریقے سے سنبھالا جاتا ہے — آپ اپنی جگہ یا گھر واپسی کی سواری نہیں کھوئیں گے۔",
    "travellers.faq.q3": "کیا میں ایک ہی بار میں ادائیگی کر سکتا ہوں؟",
    "travellers.faq.a3":
      "جی ہاں۔ پارکنگ، ٹرانسفر اور ای وی چارجنگ کو ایک شفاف قیمت میں جوڑا جاتا ہے، ایک چھوٹی، واضح طور پر ظاہر کردہ سروس فیس کے ساتھ۔",

    "travellers.waitlist.title": "اپنے ایئرپورٹ پر بکنگ کرنے والے پہلے شخص بنیں",
    "travellers.waitlist.body":
      "ہم برطانیہ اور آئرلینڈ بھر میں لانچ کر رہے ہیں۔ ویٹ لسٹ میں شامل ہوں اور جیسے ہی پارک گو آپ کے پرواز کے مقام پر لائیو ہو، ہم آپ کو بتائیں گے۔",

    // -------------------------------------------------------------------- Hosts
    "hosts.badge": "میزبانوں اور مالکان کے لیے",
    "hosts.hero.title": "ایئرپورٹ کے قریب ڈرائیو وے سے کمائیں",
    "hosts.hero.subtitle":
      "اگر آپ برطانیہ یا آئرلینڈ کے کسی ایئرپورٹ کے قریب رہتے ہیں، تو آپ کا خالی ڈرائیو وے، صحن یا اضافی جگہ کما سکتی ہے۔ تصدیق کروائیں، منٹوں میں فہرست میں شامل کریں اور ہر بکنگ کی بڑی اکثریت اپنے پاس رکھیں۔",
    "hosts.hero.cta.list": "اپنی جگہ فہرست میں شامل کریں",
    "hosts.hero.cta.onboarding": "آن بورڈنگ کیسے کام کرتی ہے",
    "hosts.hero.keep": "پارکنگ کا تقریباً {pct}% رکھیں",
    "hosts.hero.travellers": "تصدیق شدہ مسافر",

    "hosts.earnings.label": "آپ کیا رکھتے ہیں",
    "hosts.earnings.ofBooking": "ہر پارکنگ بکنگ میں سے",
    "hosts.earnings.indicative": "اشاراتی",
    "hosts.earnings.travellerPays": "مسافر پارکنگ کی ادائیگی کرتا ہے",
    "hosts.earnings.commission": "پارک گو کمیشن",
    "hosts.earnings.youReceive": "آپ کو ملتا ہے",
    "hosts.earnings.note":
      "ای وی چارجنگ کی آمدنی بھی اسی تقسیم کے مطابق ہوتی ہے — چارجر آپ کا ہے۔ اعداد و شمار اشاراتی ہیں اور لانچ کے وقت طے کیے جائیں گے۔",

    "hosts.why.eyebrow": "پارک گو کے ساتھ میزبانی کیوں کریں",
    "trav.compare.eyebrow": "موازنہ",
    "trav.compare.heading": "پارک گو بمقابلہ عام آن سائٹ پارکنگ",
    "trav.compare.sub": "سرکاری کار پارک کے بجائے تصدیق شدہ نجی جگہ کے ساتھ آپ کو کیا ملتا ہے۔",
    "trav.compare.col.feature": "اہم چیزیں",
    "trav.compare.col.official": "عام آن سائٹ پارکنگ",
    "trav.compare.price": "یومیہ قیمت",
    "trav.compare.price.official": "عموماً £20–£40",
    "trav.compare.price.parkgo": "£6 سے — قیمت میزبان طے کرتے ہیں",
    "trav.compare.camera": "اپنی گاڑی خود دیکھیں",
    "trav.compare.camera.official": "—",
    "trav.compare.camera.parkgo": "لائیو کیمرا ویو + CCTV بیجز",
    "trav.compare.cancel": "منسوخی",
    "trav.compare.cancel.official": "اکثر فیس لگتی ہے",
    "trav.compare.cancel.parkgo": "ڈراپ آف سے 24 گھنٹے پہلے تک مفت",
    "trav.compare.transfer": "ٹرمینل ٹرانسفر",
    "trav.compare.transfer.official": "مشترکہ شٹل بس",
    "trav.compare.transfer.parkgo": "اسی بکنگ میں لائسنس یافتہ پرائیویٹ ٹیکسی",
    "trav.compare.ev": "EV چارجنگ",
    "trav.compare.ev.official": "محدود جگہیں",
    "trav.compare.ev.parkgo": "کئی جگہوں پر بک ہونے والا ایڈ آن",
    "trav.compare.support": "سپورٹ",
    "trav.compare.support.official": "فون کی قطاریں",
    "trav.compare.support.parkgo": "5 زبانوں میں فوری چیٹ",
    "trav.compare.note": "اشارتی موازنہ — آن سائٹ قیمتیں اور پالیسیاں ہر ہوائی اڈے اور آپریٹر پر مختلف ہوتی ہیں۔",
    "hosts.calc.eyebrow": "آپ کی آمدنی",
    "hosts.calc.heading": "آپ کی جگہ کتنا کما سکتی ہے؟",
    "hosts.calc.sub": "سلائیڈرز ہلائیں — قیمت اور دستیابی آپ کی اپنی۔",
    "hosts.calc.price": "آپ کی یومیہ قیمت",
    "hosts.calc.days": "ماہانہ بک شدہ دن",
    "hosts.calc.monthly": "تخمینی ماہانہ آمدنی",
    "hosts.calc.yearly": "سالانہ",
    "hosts.calc.youKeep": "آپ رکھتے ہیں",
    "hosts.calc.note": "یہ تخمینہ ہے، ضمانت نہیں — اصل آمدنی طلب، قیمت اور دستیابی پر منحصر ہے۔",
    "hosts.why.title": "غیر استعمال شدہ جگہ کو کام میں لائیں",
    "hosts.why.body":
      "مسافر گاڑی چھوڑنے کے لیے ایک محفوظ، آسان جگہ چاہتے ہیں۔ اگر آپ ٹرمینل کے قریب ہیں، تو آپ کی جگہ پہلے سے بالکل ویسی ہی ہے۔",
    "hosts.why.economics.title": "مضبوط معاشیات",
    "hosts.why.economics.body":
      "ہر پارکنگ بکنگ کا تقریباً {pct}% رکھیں، اور جہاں آپ پیش کریں وہاں ای وی چارجنگ اضافی۔",
    "hosts.why.usewhat.title": "جو آپ کے پاس ہے اسے استعمال کریں",
    "hosts.why.usewhat.body":
      "ایک ڈرائیو وے، ایک صحن، ایک اضافی جگہ — شروع کرنے کے لیے کوئی تعمیراتی کام نہیں، کوئی نیا سامان نہیں چاہیے۔",
    "hosts.why.ev.title": "ای وی سے زیادہ کمائیں",
    "hosts.why.ev.body": "ایک چارجر فہرست میں شامل کریں اور مسافروں کی غیر موجودگی میں ای وی چارجنگ کی آمدنی حاصل کریں۔",
    "hosts.why.risk.title": "کم خطرہ",
    "hosts.why.risk.body":
      "تصدیق شدہ مسافر، اختیاری سی سی ٹی وی اور تصدیق شدہ ہینڈ اوور کا مطلب ہے کم حیرانیاں۔",

    "hosts.onboarding.eyebrow": "سیٹ اپ کرنا",
    "hosts.onboarding.title": "سائن اپ سے لائیو ہونے تک چند واضح مراحل میں",
    "hosts.onboarding.body":
      "آن بورڈنگ دونوں طرف کے اعتماد پر بنائی گئی ہے۔ ہر میزبان کی تصدیق ہوتی ہے اس سے پہلے کہ کوئی ایک مسافر بھی بک کر سکے۔",
    "hosts.onboarding.identity.title": "اپنی شناخت کی تصدیق کریں",
    "hosts.onboarding.identity.body":
      "ایک فوری کے وائی سی جانچ آپ کی شناخت کی تصدیق کرتی ہے۔ دستاویزات خفیہ اور آپ کے پروفائل سے الگ محفوظ کی جاتی ہیں۔",
    "hosts.onboarding.address.title": "اپنے پتے کی تصدیق کریں",
    "hosts.onboarding.address.body":
      "ہم اس جگہ کے مقام کی تصدیق کرتے ہیں جسے آپ فہرست میں شامل کرنا چاہتے ہیں تاکہ مسافروں کو بالکل معلوم ہو کہ وہ کہاں پارک کر رہے ہیں۔",
    "hosts.onboarding.details.title": "جائیداد کی تفصیلات شامل کریں",
    "hosts.onboarding.details.body":
      "تصاویر، جگہ کی پیمائش، رسائی کے نوٹس اور کیا آپ ای وی چارجنگ یا سی سی ٹی وی پیش کرتے ہیں — وہ چیزیں جن پر مسافر فلٹر کرتے ہیں۔",
    "hosts.onboarding.declaration.title": "فہرست میں شامل کرنے کے حق کا اعلان",
    "hosts.onboarding.declaration.body":
      "تصدیق کریں کہ آپ جگہ کرائے پر دینے کے حقدار ہیں (مالک یا اجازت کے ساتھ) اور یہ کہ اسے استعمال کرنا محفوظ اور قانونی ہے۔",
    "hosts.onboarding.bank.title": "بینک تفصیلات شامل کریں",
    "hosts.onboarding.bank.body":
      "ہمیں بتائیں کہ آپ کی ادائیگیاں کہاں بھیجنی ہیں۔ بینک تفصیلات خفیہ ہیں اور مسافروں کو کبھی نہیں دکھائی جاتیں۔",
    "hosts.onboarding.review.title": "تعمیل کا جائزہ",
    "hosts.onboarding.review.body":
      "ہماری ٹیم آپ کی فہرست کا ہمارے اعتماد اور حفاظتی معیارات کے مطابق جائزہ لیتی ہے اس سے پہلے کہ یہ لائیو ہو سکے۔",
    "hosts.onboarding.golive.title": "لائیو ہوں اور کمائیں",
    "hosts.onboarding.golive.body":
      "اپنی دستیابی اور قیمت مقرر کریں۔ آپ کی جگہ فوراً مسافروں کی تلاش میں ظاہر ہونا شروع ہو جاتی ہے۔",

    "hosts.trust.eyebrow": "اعتماد اور تحفظ",
    "hosts.trust.title": "میزبانوں کو مسافروں جتنا ہی تحفظ دینے کے لیے بنایا گیا",
    "hosts.trust.body":
      "آپ کسی کو اپنی جگہ استعمال کرنے کی دعوت دے رہے ہیں، اس لیے اعتماد اہم ہے۔ پارک گو دونوں طرف کی تصدیق کرتا ہے اور ہر بکنگ کا واضح، ریکارڈ شدہ ریکارڈ رکھتا ہے۔",
    "hosts.trust.travellers.title": "تصدیق شدہ مسافر",
    "hosts.trust.travellers.body":
      "بکنگز حقیقی، رجسٹرڈ پارک گو صارفین سے آتی ہیں — اور آپ ان کا جائزہ بھی لے سکتے ہیں۔",
    "hosts.trust.cctv.title": "اختیاری سی سی ٹی وی اور لائیو کیمرہ",
    "hosts.trust.cctv.body":
      "اضافی اطمینان کے لیے اپنی فہرست میں ایک کیمرہ شامل کریں، آپ اور مسافر دونوں کے لیے۔",
    "hosts.trust.handover.title": "تصدیق شدہ ہینڈ اوور",
    "hosts.trust.handover.body":
      "ہر گاڑی چھوڑنے اور لینے کی تصدیق ایک بار کے کوڈ سے کی جاتی ہے، وقت کی مہر اور ریکارڈ کے ساتھ۔",
    "hosts.trust.terms.title": "واضح شرائط",
    "hosts.trust.terms.body":
      "شفاف میزبان شرائط، ایک متعین فہرست میں شامل کرنے کے حق کا اعلان اور اگر کچھ غلط ہو جائے تو پلیٹ فارم کی معاونت۔",
    "hosts.trust.cta": "اعتماد اور حفاظت پڑھیں",

    "hosts.payouts.title": "آسان، محفوظ ادائیگیاں",
    "hosts.payouts.percompleted.title": "ہر مکمل بکنگ پر ادائیگی",
    "hosts.payouts.percompleted.body":
      "آمدنی ہر سفر مکمل ہونے کے بعد جاری کی جاتی ہے — آپ کی طرف سے کوئی پیچھا نہیں، کوئی انوائسنگ نہیں۔",
    "hosts.payouts.tobank.title": "سیدھے آپ کے بینک میں",
    "hosts.payouts.tobank.body":
      "ادائیگیاں ان خفیہ بینک تفصیلات میں جاتی ہیں جو آپ آن بورڈنگ کے دوران شامل کرتے ہیں۔",
    "hosts.payouts.statements.title": "واضح گوشوارے",
    "hosts.payouts.statements.body":
      "ہر بکنگ، لیا گیا کمیشن اور آپ کی ادائیگی سب ایک جگہ دیکھیں۔",
    "hosts.payouts.setprice.title": "آپ قیمت مقرر کرتے ہیں",
    "hosts.payouts.setprice.body":
      "اپنی فی دن قیمت اور دستیابی منتخب کریں — چوٹی کے اوقات کے لیے جب چاہیں اسے بڑھا دیں۔",
    "hosts.payouts.cta": "میزبان معاشیات دیکھیں",

    "hosts.waitlist.title": "اپنی جگہ سے کمانے کے لیے تیار ہیں؟",
    "hosts.waitlist.body":
      "میزبان ویٹ لسٹ میں شامل ہوں اور ہم آپ کو تصدیق کروانے اور فہرست میں شامل کرنے کی دعوت دیں گے جیسے ہی ہم آپ کے قریب لانچ کریں۔",
    "hosts.waitlist.nospam": "کوئی پابندی نہیں — صرف اسی وقت فہرست میں شامل کریں جب آپ تیار ہوں۔",

    // -------------------------------------------------------------------- About
    "about.badge": "پارک گو کے بارے میں",
    "about.hero.title": "برطانیہ اور آئرلینڈ کے لیے ایئرپورٹ تک رسائی کو بے رکاوٹ بنانا",
    "about.hero.subtitle":
      "پارک گو پارکنگ، لائسنس یافتہ ٹرانسفرز، ای وی چارجنگ اور لائیو سیکیورٹی کو ایک قابل اعتماد بکنگ میں لاتا ہے — تاکہ اپنی پرواز تک پہنچنا سفر کا آسان حصہ ہو۔",

    "about.mission.eyebrow": "ہمارا مشن",
    "about.mission.title": "ہر سفر کے لیے پارکنگ، اعتماد کی بنیاد پر",
    "about.mission.body":
      "ہمارا ماننا ہے کہ ایئرپورٹ تک پہنچنا اتنا ہی اچھی طرح ڈیزائن کیا جانا چاہیے جتنی خود پرواز۔ ہمارا مشن تصدیق شدہ میزبانوں، ایک آزاد لائسنس یافتہ ٹرانسفر آپریٹر اور مسافروں کو ایک واحد، شفاف سفر میں جوڑنا ہے — برطانیہ اور آئرلینڈ بھر میں اور آپ کی زبان میں۔",

    "about.problem.title": "مسئلہ",
    "about.problem.body":
      "ایئرپورٹ کا سفر بکھرا ہوا ہے۔ آپ ایک سائٹ پر پارکنگ بک کرتے ہیں، دوسری پر ٹرانسفر، ای وی چارجنگ کو الگ سے ڈھونڈتے ہیں، اور بس امید کرتے ہیں کہ آپ کی غیر موجودگی میں آپ کی گاڑی محفوظ ہے۔ قیمتیں غیر واضح ہیں، شٹلیں سست ہیں، اور جس دن یہ اہم ہوتا ہے اس دن کوئی حقیقی شفافیت نہیں ہوتی۔",
    "about.problem.point1": "متعدد بکنگز، متعدد قیمتیں",
    "about.problem.point2": "اس بات کا کوئی واضح منظر نہیں کہ آپ کی گاڑی یا ڈرائیور کہاں ہے",
    "about.problem.point3": "محدود اعتماد اور نامکمل تصدیق",

    "about.approach.title": "ہمارا طریقہ",
    "about.approach.body":
      "پارک گو پورے سفر کو ایک چیک آؤٹ میں جوڑتا ہے، پھر اسے قابلِ مشاہدہ اور قابلِ تصدیق بناتا ہے۔ تصدیق شدہ میزبان، لائسنس یافتہ ڈرائیور، ایک واحد شفاف قیمت، اور شروع سے آخر تک ایپ میں کیمرہ اور تصدیق شدہ ہینڈ اوور کے ساتھ لائیو ٹریکنگ۔",
    "about.approach.point1": "ایک بکنگ، ایک قیمت، ایک ایپ",
    "about.approach.point2": "دو طرفہ تصدیق اور اعتماد سکورنگ",
    "about.approach.point3": "لائیو ٹریکنگ، کیمرہ اور تصدیق شدہ ہینڈ اوور",

    "about.values.eyebrow": "ہم کس چیز کی قدر کرتے ہیں",
    "about.values.title": "پروڈکٹ کے پیچھے اصول",
    "about.value.trust.title": "پہلے اعتماد",
    "about.value.trust.body":
      "تصدیق، شفافیت اور واضح ریکارڈ ہمارے ہر فیصلے کے مرکز میں ہیں۔",
    "about.value.integrated.title": "حقیقتاً مربوط",
    "about.value.integrated.body":
      "ایک بکنگ، ایک قیمت، ایک ایپ — ہم ایک اور منقطع تجربہ پیش کرنے سے انکار کرتے ہیں۔",
    "about.value.human.title": "بنیادی طور پر انسانی",
    "about.value.human.body":
      "کثیر لسانی، قابل رسائی اور معاون۔ سفر پہلے ہی کافی پریشان کن ہے۔",
    "about.value.fair.title": "کھلا اور منصفانہ",
    "about.value.fair.body":
      "مسافروں کے لیے شفاف قیمتیں اور میزبانوں اور شراکت داروں کے لیے منصفانہ، قابلِ ترتیب معاشیات۔",

    "about.team.eyebrow": "ہماری ٹیم",
    "about.team.title": "پارک گو بنانے والے لوگ",
    "about.team.body":
      "ایک چھوٹی، مرکوز ٹیم جو اعتماد، ڈیزائن اور مسافروں کو بغیر تناؤ کے ان کی پرواز تک پہنچانے کی دھن میں ہے۔",
    "about.team.role.ceo": "بانی اور سی ای او",
    "about.team.role.product": "سربراہ پروڈکٹ",
    "about.team.role.engineering": "سربراہ انجینئرنگ",
    "about.team.role.trust": "اعتماد اور حفاظت کی سربراہ",
    "about.team.growing": "ہم بڑھ رہے ہیں — کھلی آسامیاں دیکھیں ہمارے",
    "about.team.contactPage": "رابطہ صفحہ پر",

    "about.vision.mission.k": "1 مشن",
    "about.vision.mission.v": "بے رکاوٹ ایئرپورٹ رسائی",
    "about.vision.region.k": "برطانیہ اور آئرلینڈ",
    "about.vision.region.v": "جہاں ہم پہلے لانچ کر رہے ہیں",
    "about.vision.sides.k": "3 اطراف",
    "about.vision.sides.v": "مسافر، میزبان اور شراکت دار",
    "about.vision.trust.k": "اعتماد کے لیے بنایا گیا",
    "about.vision.trust.v": "ہر مرحلے پر تصدیق",

    "about.waitlist.title": "اس سفر میں ہمارے ساتھ چلیں",
    "about.waitlist.body":
      "ہم پارک گو کو کھلے عام بنا رہے ہیں اور ایک ایک ایئرپورٹ لانچ کر رہے ہیں۔ ویٹ لسٹ میں شامل ہوں اور ہمارے ساتھ بڑھیں۔",
    "about.waitlist.cta": "دیکھیں یہ کیسے کام کرتا ہے",
  },

  hi: {
    // ---------------------------------------------------------------- Travellers
    "travellers.badge": "यात्रियों के लिए",
    "travellers.hero.title": "पार्क करें, ट्रांसफर लें और चार्ज करें — सब एक ही बुकिंग में",
    "travellers.hero.subtitle":
      "ParkGo उड़ान के सबसे तनावपूर्ण हिस्से को सबसे आसान बना देता है। एक पारदर्शी कीमत, सत्यापित लोग और आपकी ड्राइववे खोज से लेकर घर वापसी तक लाइव ट्रैकिंग।",
    "travellers.hero.cta.book": "बुकिंग शुरू करें",
    "travellers.hero.cta.how": "देखें यह कैसे काम करता है",
    "travellers.trust.hosts": "सत्यापित होस्ट",
    "travellers.trust.drivers": "लाइसेंस प्राप्त ड्राइवर",
    "travellers.trust.camera": "लाइव कैमरा और सीसीटीवी",

    "travellers.benefits.eyebrow": "यात्री ParkGo क्यों चुनते हैं",
    "travellers.benefits.title": "यात्रा के लिए जो चाहिए सब, बिना किसी झंझट के",
    "travellers.benefits.body":
      "हमने वे चीजें एक साथ जोड़ दीं जिन्हें आप पहले अलग-अलग बुक करते थे — और वह भरोसा और पारदर्शिता जोड़ी जो एयरपोर्ट पार्किंग में हमेशा से कमी थी।",
    "travellers.benefit.oneprice.title": "एक कीमत, एक बुकिंग",
    "travellers.benefit.oneprice.body":
      "पार्किंग, एक लाइसेंस प्राप्त ट्रांसफर और ईवी चार्जिंग एक ही पारदर्शी चेकआउट में। न ऐप्स का झंझट, न कोई छिपे हुए अतिरिक्त शुल्क।",
    "travellers.benefit.verified.title": "सत्यापित और सुरक्षित",
    "travellers.benefit.verified.body":
      "हर होस्ट की आईडी जांची जाती है और हर ड्राइवर लाइसेंस प्राप्त और बीमित है। हर जगह सीसीटीवी और सत्यापित हैंडओवर।",
    "travellers.benefit.tracking.title": "लाइव ट्रैकिंग और कैमरा",
    "travellers.benefit.tracking.body":
      "अपने ड्राइवर को लाइव मानचित्र पर देखें और अपनी पार्क की गई कार को ऐप में कैमरे पर LIVE बैज के साथ देखें।",
    "travellers.benefit.ev.title": "ईवी चार्जिंग",
    "travellers.benefit.ev.body":
      "यात्रा के दौरान उन होस्ट के पास चार्ज कराएं जो चार्जर प्रदान करते हैं। वापसी पर एक तैयार कार पाएं।",
    "travellers.benefit.multilingual.title": "बहुभाषी",
    "travellers.benefit.multilingual.body":
      "ParkGo को अपनी भाषा में उपयोग करें — यूके और आयरलैंड भर में चार लॉन्च भाषाएँ, और भी आने वाली हैं।",
    "travellers.benefit.corporate.title": "कॉर्पोरेट खाते",
    "travellers.benefit.corporate.body":
      "काम के लिए यात्रा कर रहे हैं? टीमों के लिए केंद्रीकृत बुकिंग, मासिक इनवॉइसिंग और प्राथमिकता समर्थन।",
    "travellers.benefit.referral.title": "रेफरल प्रोग्राम",
    "travellers.benefit.referral.body":
      "ParkGo को दोस्तों और परिवार के साथ साझा करें और जब वे अपनी पहली यात्रा करें तो आप दोनों को इनाम मिलेगा।",
    "travellers.benefit.cheaper.title": "अक्सर सस्ता",
    "travellers.benefit.cheaper.body":
      "टर्मिनल के पास सत्यापित ड्राइववे अक्सर आधिकारिक लॉन्ग-स्टे कार पार्कों से सस्ते होते हैं — और शटल के इंतजार के बिना।",

    "travellers.how.eyebrow": "यह कैसे काम करता है",
    "travellers.how.title": "मिनटों में बुक, पूरी यात्रा के लिए तैयार",
    "travellers.how.step1.title": "खोजें और तुलना करें",
    "travellers.how.step1.body":
      "अपना एयरपोर्ट और तारीखें चुनें। कीमत, दूरी, ईवी और रेटिंग के साथ सत्यापित स्थान देखें।",
    "travellers.how.step2.title": "अपना बंडल बनाएं",
    "travellers.how.step2.body":
      "एक लाइसेंस प्राप्त ट्रांसफर और ईवी चार्जिंग जोड़ें। एक कीमत, एक सुरक्षित चेकआउट।",
    "travellers.how.step3.title": "पार्क करें, ट्रैक करें, उड़ान भरें",
    "travellers.how.step3.body":
      "अपना क्यूआर प्राप्त करें, अपने ड्राइवर को लाइव ट्रैक करें, अपनी कार देखें और सत्यापित हैंडओवर की पुष्टि करें।",
    "travellers.how.cta": "पूरी यात्रा देखें",

    "travellers.faq.eyebrow": "जानना अच्छा है",
    "travellers.faq.title": "यात्री सबसे पहले जो सवाल पूछते हैं",
    "travellers.faq.body": "बुकिंग से पहले कुछ त्वरित उत्तर। हमारे पूर्ण FAQ में और भी बहुत कुछ है।",
    "travellers.faq.cta": "पूरा FAQ पढ़ें",
    "travellers.faq.q1": "क्या मेरी अनुपस्थिति में मेरी कार सुरक्षित है?",
    "travellers.faq.a1":
      "होस्ट आईडी-सत्यापित होते हैं, स्थानों में सीसीटीवी शामिल हो सकता है, और आप ऐप में लाइव कैमरा देख सकते हैं। कार छोड़ना और लेना दोनों में एक सत्यापित, रिकॉर्ड किया गया हैंडओवर होता है।",
    "travellers.faq.q2": "अगर मेरी उड़ान में देरी हो जाए तो?",
    "travellers.faq.a2":
      "आपकी बुकिंग और वापसी ट्रांसफर आपकी यात्रा से जुड़े होते हैं, इसलिए देरी को सहजता से संभाला जाता है — आप अपना स्थान या घर वापसी की सवारी नहीं खोएंगे।",
    "travellers.faq.q3": "क्या मैं एक ही बार में भुगतान कर सकता हूँ?",
    "travellers.faq.a3":
      "हाँ। पार्किंग, ट्रांसफर और ईवी चार्जिंग को एक पारदर्शी कीमत में जोड़ा जाता है, एक छोटे, स्पष्ट रूप से दिखाए गए सेवा शुल्क के साथ।",

    "travellers.waitlist.title": "अपने एयरपोर्ट पर बुकिंग करने वाले पहले व्यक्ति बनें",
    "travellers.waitlist.body":
      "हम यूके और आयरलैंड भर में लॉन्च कर रहे हैं। वेटलिस्ट में शामिल हों और जैसे ही ParkGo आपकी उड़ान के स्थान पर लाइव हो, हम आपको बताएंगे।",

    // -------------------------------------------------------------------- Hosts
    "hosts.badge": "होस्ट और मकान मालिकों के लिए",
    "hosts.hero.title": "एयरपोर्ट के पास ड्राइववे से कमाएं",
    "hosts.hero.subtitle":
      "अगर आप यूके या आयरिश एयरपोर्ट के पास रहते हैं, तो आपका खाली ड्राइववे, आँगन या अतिरिक्त जगह कमा सकती है। सत्यापित हों, मिनटों में सूचीबद्ध करें और हर बुकिंग का बड़ा हिस्सा अपने पास रखें।",
    "hosts.hero.cta.list": "अपनी जगह सूचीबद्ध करें",
    "hosts.hero.cta.onboarding": "ऑनबोर्डिंग कैसे काम करती है",
    "hosts.hero.keep": "पार्किंग का ~{pct}% रखें",
    "hosts.hero.travellers": "सत्यापित यात्री",

    "hosts.earnings.label": "आप क्या रखते हैं",
    "hosts.earnings.ofBooking": "हर पार्किंग बुकिंग में से",
    "hosts.earnings.indicative": "संकेतात्मक",
    "hosts.earnings.travellerPays": "यात्री पार्किंग के लिए भुगतान करता है",
    "hosts.earnings.commission": "ParkGo कमीशन",
    "hosts.earnings.youReceive": "आपको मिलता है",
    "hosts.earnings.note":
      "ईवी चार्जिंग राजस्व भी इसी विभाजन के अनुसार होता है — चार्जर आपका है। आंकड़े संकेतात्मक हैं और लॉन्च के समय पुष्टि किए जाएंगे।",

    "hosts.why.eyebrow": "ParkGo के साथ होस्ट क्यों बनें",
    "trav.compare.eyebrow": "तुलना",
    "trav.compare.heading": "ParkGo बनाम सामान्य ऑन-साइट पार्किंग",
    "trav.compare.sub": "आधिकारिक कार पार्क की जगह सत्यापित निजी जगह के साथ आपको क्या मिलता है।",
    "trav.compare.col.feature": "क्या मायने रखता है",
    "trav.compare.col.official": "सामान्य ऑन-साइट पार्किंग",
    "trav.compare.price": "प्रति दिन कीमत",
    "trav.compare.price.official": "आमतौर पर £20–£40",
    "trav.compare.price.parkgo": "£6 से — कीमत होस्ट तय करते हैं",
    "trav.compare.camera": "अपनी कार खुद देखें",
    "trav.compare.camera.official": "—",
    "trav.compare.camera.parkgo": "लाइव कैमरा व्यू + CCTV बैज",
    "trav.compare.cancel": "रद्दीकरण",
    "trav.compare.cancel.official": "अक्सर शुल्क लगता है",
    "trav.compare.cancel.parkgo": "ड्रॉप-ऑफ से 24 घंटे पहले तक मुफ़्त",
    "trav.compare.transfer": "टर्मिनल ट्रांसफर",
    "trav.compare.transfer.official": "साझा शटल बस",
    "trav.compare.transfer.parkgo": "उसी बुकिंग में लाइसेंस प्राप्त निजी टैक्सी",
    "trav.compare.ev": "EV चार्जिंग",
    "trav.compare.ev.official": "सीमित स्थान",
    "trav.compare.ev.parkgo": "कई जगहों पर बुक होने वाला ऐड-ऑन",
    "trav.compare.support": "सहायता",
    "trav.compare.support.official": "फ़ोन कतारें",
    "trav.compare.support.parkgo": "5 भाषाओं में तुरंत चैट",
    "trav.compare.note": "सांकेतिक तुलना — ऑन-साइट कीमतें और नीतियाँ हवाई अड्डे और ऑपरेटर के अनुसार बदलती हैं।",
    "hosts.calc.eyebrow": "आपकी कमाई",
    "hosts.calc.heading": "आपकी जगह कितना कमा सकती है?",
    "hosts.calc.sub": "स्लाइडर घुमाएँ — कीमत और उपलब्धता आपकी अपनी।",
    "hosts.calc.price": "आपकी प्रति दिन कीमत",
    "hosts.calc.days": "प्रति माह बुक दिन",
    "hosts.calc.monthly": "अनुमानित मासिक कमाई",
    "hosts.calc.yearly": "प्रति वर्ष",
    "hosts.calc.youKeep": "आप रखते हैं",
    "hosts.calc.note": "यह अनुमान है, गारंटी नहीं — वास्तविक कमाई मांग, कीमत और उपलब्धता पर निर्भर है।",
    "hosts.why.title": "अनुपयोगी जगह को काम में लगाएं",
    "hosts.why.body":
      "यात्री कार छोड़ने के लिए एक सुरक्षित, सुविधाजनक जगह चाहते हैं। अगर आप टर्मिनल के पास हैं, तो आपकी जगह पहले से ही ठीक वैसी है।",
    "hosts.why.economics.title": "मजबूत अर्थशास्त्र",
    "hosts.why.economics.body":
      "हर पार्किंग बुकिंग का लगभग {pct}% रखें, और जहाँ आप पेश करें वहाँ ईवी चार्जिंग अतिरिक्त।",
    "hosts.why.usewhat.title": "जो आपके पास है उसका उपयोग करें",
    "hosts.why.usewhat.body":
      "एक ड्राइववे, एक आँगन, एक अतिरिक्त जगह — शुरू करने के लिए कोई निर्माण कार्य नहीं, कोई नया उपकरण नहीं चाहिए।",
    "hosts.why.ev.title": "ईवी के साथ अधिक कमाएं",
    "hosts.why.ev.body": "एक चार्जर सूचीबद्ध करें और यात्रियों की अनुपस्थिति में ईवी चार्जिंग राजस्व प्राप्त करें।",
    "hosts.why.risk.title": "कम जोखिम",
    "hosts.why.risk.body":
      "सत्यापित यात्री, वैकल्पिक सीसीटीवी और सत्यापित हैंडओवर का मतलब है कम आश्चर्य।",

    "hosts.onboarding.eyebrow": "सेटअप करना",
    "hosts.onboarding.title": "साइन-अप से लाइव होने तक कुछ स्पष्ट चरणों में",
    "hosts.onboarding.body":
      "ऑनबोर्डिंग दोनों तरफ के भरोसे पर बनाई गई है। हर होस्ट को सत्यापित किया जाता है इससे पहले कि कोई एक यात्री भी बुक कर सके।",
    "hosts.onboarding.identity.title": "अपनी पहचान सत्यापित करें",
    "hosts.onboarding.identity.body":
      "एक त्वरित KYC जांच आपकी पहचान की पुष्टि करती है। दस्तावेज़ एन्क्रिप्टेड होते हैं और आपकी प्रोफ़ाइल से अलग संग्रहीत किए जाते हैं।",
    "hosts.onboarding.address.title": "अपना पता सत्यापित करें",
    "hosts.onboarding.address.body":
      "हम उस जगह के स्थान की पुष्टि करते हैं जिसे आप सूचीबद्ध करना चाहते हैं ताकि यात्रियों को ठीक-ठीक पता हो कि वे कहाँ पार्क कर रहे हैं।",
    "hosts.onboarding.details.title": "संपत्ति का विवरण जोड़ें",
    "hosts.onboarding.details.body":
      "तस्वीरें, जगह के आयाम, पहुँच नोट्स और क्या आप ईवी चार्जिंग या सीसीटीवी प्रदान करते हैं — वे चीजें जिन पर यात्री फ़िल्टर करते हैं।",
    "hosts.onboarding.declaration.title": "सूचीबद्ध करने के अधिकार की घोषणा",
    "hosts.onboarding.declaration.body":
      "पुष्टि करें कि आप जगह किराए पर देने के हकदार हैं (मालिक या अनुमति के साथ) और यह कि इसका उपयोग सुरक्षित और कानूनी है।",
    "hosts.onboarding.bank.title": "बैंक विवरण जोड़ें",
    "hosts.onboarding.bank.body":
      "हमें बताएं कि आपका भुगतान कहाँ भेजना है। बैंक विवरण एन्क्रिप्टेड हैं और यात्रियों को कभी नहीं दिखाए जाते।",
    "hosts.onboarding.review.title": "अनुपालन समीक्षा",
    "hosts.onboarding.review.body":
      "हमारी टीम आपकी लिस्टिंग की हमारे भरोसा और सुरक्षा मानकों के अनुसार समीक्षा करती है इससे पहले कि यह लाइव हो सके।",
    "hosts.onboarding.golive.title": "लाइव हों और कमाएं",
    "hosts.onboarding.golive.body":
      "अपनी उपलब्धता और कीमत निर्धारित करें। आपकी जगह तुरंत यात्री खोजों में दिखाई देने लगती है।",

    "hosts.trust.eyebrow": "भरोसा और सुरक्षा",
    "hosts.trust.title": "होस्ट को यात्रियों जितना ही सुरक्षित रखने के लिए बनाया गया",
    "hosts.trust.body":
      "आप किसी को अपनी जगह का उपयोग करने के लिए आमंत्रित कर रहे हैं, इसलिए भरोसा मायने रखता है। ParkGo दोनों पक्षों को सत्यापित करता है और हर बुकिंग का स्पष्ट, रिकॉर्ड किया गया रिकॉर्ड रखता है।",
    "hosts.trust.travellers.title": "सत्यापित यात्री",
    "hosts.trust.travellers.body":
      "बुकिंग असली, पंजीकृत ParkGo ग्राहकों से आती हैं — और आप उनकी समीक्षा भी कर सकते हैं।",
    "hosts.trust.cctv.title": "वैकल्पिक सीसीटीवी और लाइव कैमरा",
    "hosts.trust.cctv.body":
      "अतिरिक्त आश्वासन के लिए अपनी लिस्टिंग में एक कैमरा जोड़ें, आपके और यात्री दोनों के लिए।",
    "hosts.trust.handover.title": "सत्यापित हैंडओवर",
    "hosts.trust.handover.body":
      "हर कार छोड़ने और लेने की पुष्टि एक बार के कोड से की जाती है, टाइमस्टैम्प और रिकॉर्ड के साथ।",
    "hosts.trust.terms.title": "स्पष्ट शर्तें",
    "hosts.trust.terms.body":
      "पारदर्शी होस्ट शर्तें, एक परिभाषित सूचीबद्ध करने के अधिकार की घोषणा और अगर कुछ गलत हो जाए तो प्लेटफ़ॉर्म समर्थन।",
    "hosts.trust.cta": "भरोसा और सुरक्षा पढ़ें",

    "hosts.payouts.title": "सरल, सुरक्षित भुगतान",
    "hosts.payouts.percompleted.title": "हर पूर्ण बुकिंग पर भुगतान",
    "hosts.payouts.percompleted.body":
      "आय हर यात्रा पूरी होने के बाद जारी की जाती है — आपकी तरफ से कोई पीछा नहीं, कोई इनवॉइसिंग नहीं।",
    "hosts.payouts.tobank.title": "सीधे आपके बैंक में",
    "hosts.payouts.tobank.body":
      "भुगतान उन एन्क्रिप्टेड बैंक विवरणों में जाते हैं जो आप ऑनबोर्डिंग के दौरान जोड़ते हैं।",
    "hosts.payouts.statements.title": "स्पष्ट विवरण",
    "hosts.payouts.statements.body":
      "हर बुकिंग, लिया गया कमीशन और आपका भुगतान सब एक जगह देखें।",
    "hosts.payouts.setprice.title": "आप कीमत तय करते हैं",
    "hosts.payouts.setprice.body":
      "अपनी प्रति-दिन दर और उपलब्धता चुनें — चरम अवधि के लिए जब चाहें इसे बढ़ाएं।",
    "hosts.payouts.cta": "होस्ट अर्थशास्त्र देखें",

    "hosts.waitlist.title": "अपनी जगह से कमाने के लिए तैयार हैं?",
    "hosts.waitlist.body":
      "होस्ट वेटलिस्ट में शामिल हों और हम आपको सत्यापित होने और सूचीबद्ध करने के लिए आमंत्रित करेंगे जैसे ही हम आपके पास लॉन्च करें।",
    "hosts.waitlist.nospam": "कोई बाध्यता नहीं — केवल तभी सूचीबद्ध करें जब आप तैयार हों।",

    // -------------------------------------------------------------------- About
    "about.badge": "ParkGo के बारे में",
    "about.hero.title": "यूके और आयरलैंड के लिए एयरपोर्ट तक पहुँच को निर्बाध बनाना",
    "about.hero.subtitle":
      "ParkGo पार्किंग, लाइसेंस प्राप्त ट्रांसफर, ईवी चार्जिंग और लाइव सुरक्षा को एक भरोसेमंद बुकिंग में लाता है — ताकि अपनी उड़ान तक पहुँचना यात्रा का आसान हिस्सा हो।",

    "about.mission.eyebrow": "हमारा मिशन",
    "about.mission.title": "हर सफ़र के लिए पार्किंग, भरोसे की बुनियाद पर",
    "about.mission.body":
      "हमारा मानना है कि एयरपोर्ट तक पहुँचना उतना ही अच्छी तरह डिज़ाइन किया जाना चाहिए जितनी उड़ान खुद। हमारा मिशन सत्यापित होस्ट, एक स्वतंत्र लाइसेंस प्राप्त ट्रांसफर ऑपरेटर और यात्रियों को एक एकल, पारदर्शी यात्रा में जोड़ना है — यूके और आयरलैंड भर में और आपकी भाषा में।",

    "about.problem.title": "समस्या",
    "about.problem.body":
      "एयरपोर्ट यात्रा खंडित है। आप एक साइट पर पार्किंग बुक करते हैं, दूसरी पर ट्रांसफर, ईवी चार्जिंग को अलग से ढूंढते हैं, और बस उम्मीद करते हैं कि आपकी अनुपस्थिति में आपकी कार सुरक्षित है। कीमतें अपारदर्शी हैं, शटल धीमी हैं, और जिस दिन यह मायने रखता है उस दिन कोई वास्तविक पारदर्शिता नहीं होती।",
    "about.problem.point1": "कई बुकिंग, कई कीमतें",
    "about.problem.point2": "इसका कोई स्पष्ट दृश्य नहीं कि आपकी कार या ड्राइवर कहाँ है",
    "about.problem.point3": "सीमित भरोसा और अधूरा सत्यापन",

    "about.approach.title": "हमारा दृष्टिकोण",
    "about.approach.body":
      "ParkGo पूरी यात्रा को एक चेकआउट में जोड़ता है, फिर उसे दृश्यमान और सत्यापन योग्य बनाता है। सत्यापित होस्ट, लाइसेंस प्राप्त ड्राइवर, एक एकल पारदर्शी कीमत, और शुरू से अंत तक ऐप में कैमरा और सत्यापित हैंडओवर के साथ लाइव ट्रैकिंग।",
    "about.approach.point1": "एक बुकिंग, एक कीमत, एक ऐप",
    "about.approach.point2": "दो-तरफा सत्यापन और भरोसा स्कोरिंग",
    "about.approach.point3": "लाइव ट्रैकिंग, कैमरा और सत्यापित हैंडओवर",

    "about.values.eyebrow": "हम किसे महत्व देते हैं",
    "about.values.title": "उत्पाद के पीछे के सिद्धांत",
    "about.value.trust.title": "पहले भरोसा",
    "about.value.trust.body":
      "सत्यापन, पारदर्शिता और स्पष्ट रिकॉर्ड हमारे हर निर्णय के केंद्र में हैं।",
    "about.value.integrated.title": "वास्तव में एकीकृत",
    "about.value.integrated.body":
      "एक बुकिंग, एक कीमत, एक ऐप — हम एक और असंबद्ध अनुभव देने से इनकार करते हैं।",
    "about.value.human.title": "स्वभाव से मानवीय",
    "about.value.human.body":
      "बहुभाषी, सुलभ और सहायक। यात्रा पहले से ही काफी तनावपूर्ण है।",
    "about.value.fair.title": "खुला और निष्पक्ष",
    "about.value.fair.body":
      "यात्रियों के लिए पारदर्शी मूल्य निर्धारण और होस्ट और भागीदारों के लिए निष्पक्ष, विन्यास योग्य अर्थशास्त्र।",

    "about.team.eyebrow": "हमारी टीम",
    "about.team.title": "ParkGo बनाने वाले लोग",
    "about.team.body":
      "एक छोटी, केंद्रित टीम जो भरोसे, डिज़ाइन और यात्रियों को बिना तनाव के उनकी उड़ान तक पहुँचाने की धुन में है।",
    "about.team.role.ceo": "संस्थापक और सीईओ",
    "about.team.role.product": "प्रमुख उत्पाद",
    "about.team.role.engineering": "प्रमुख इंजीनियरिंग",
    "about.team.role.trust": "भरोसा और सुरक्षा प्रमुख",
    "about.team.growing": "हम बढ़ रहे हैं — खुली भूमिकाएँ देखें हमारे",
    "about.team.contactPage": "संपर्क पृष्ठ पर",

    "about.vision.mission.k": "1 मिशन",
    "about.vision.mission.v": "निर्बाध एयरपोर्ट पहुँच",
    "about.vision.region.k": "यूके और आयरलैंड",
    "about.vision.region.v": "जहाँ हम पहले लॉन्च कर रहे हैं",
    "about.vision.sides.k": "3 पक्ष",
    "about.vision.sides.v": "यात्री, होस्ट और भागीदार",
    "about.vision.trust.k": "भरोसे के लिए बनाया गया",
    "about.vision.trust.v": "हर चरण पर सत्यापन",

    "about.waitlist.title": "इस यात्रा में हमारे साथ चलें",
    "about.waitlist.body":
      "हम ParkGo को खुले तौर पर बना रहे हैं और एक-एक एयरपोर्ट लॉन्च कर रहे हैं। वेटलिस्ट में शामिल हों और हमारे साथ बढ़ें।",
    "about.waitlist.cta": "देखें यह कैसे काम करता है",
  },

  de: {
    // ---------------------------------------------------------------- Travellers
    "travellers.badge": "Für Reisende",
    "travellers.hero.title": "Parken, Transfer und Laden — in einer einzigen Buchung erledigt",
    "travellers.hero.subtitle":
      "ParkGo macht den stressigsten Teil des Fliegens zum einfachsten. Ein transparenter Preis, geprüfte Personen und Live-Tracking von der Stellplatzsuche bis zur Rückkehr nach Hause.",
    "travellers.hero.cta.book": "Buchung starten",
    "travellers.hero.cta.how": "So funktioniert's",
    "travellers.trust.hosts": "Geprüfte Gastgeber",
    "travellers.trust.drivers": "Lizenzierte Fahrer",
    "travellers.trust.camera": "Live-Kamera & Videoüberwachung",

    "travellers.benefits.eyebrow": "Warum Reisende ParkGo wählen",
    "travellers.benefits.title": "Alles, was die Reise braucht, ohne den Aufwand",
    "travellers.benefits.body":
      "Wir haben die Dinge gebündelt, die Sie früher einzeln buchen mussten — und das Vertrauen und die Transparenz hinzugefügt, die dem Flughafenparken immer gefehlt haben.",
    "travellers.benefit.oneprice.title": "Ein Preis, eine Buchung",
    "travellers.benefit.oneprice.body":
      "Parken, ein lizenzierter Transfer und das Laden von E-Autos in einem transparenten Checkout. Kein App-Jonglieren, keine versteckten Extras.",
    "travellers.benefit.verified.title": "Geprüft & sicher",
    "travellers.benefit.verified.body":
      "Jeder Gastgeber ist ID-geprüft und jeder Fahrer lizenziert und versichert. Videoüberwachung und geprüfte Übergaben durchgehend.",
    "travellers.benefit.tracking.title": "Live-Tracking & Kamera",
    "travellers.benefit.tracking.body":
      "Verfolgen Sie Ihren Fahrer auf einer Live-Karte und beobachten Sie Ihr geparktes Auto per In-App-Kamera mit LIVE-Kennzeichnung.",
    "travellers.benefit.ev.title": "E-Auto-Laden",
    "travellers.benefit.ev.body":
      "Laden Sie während der Reise bei Gastgebern nach, die einen Ladepunkt anbieten. Kehren Sie zu einem startbereiten Auto zurück.",
    "travellers.benefit.multilingual.title": "Mehrsprachig",
    "travellers.benefit.multilingual.body":
      "Nutzen Sie ParkGo in Ihrer Sprache — vier Startsprachen in ganz Großbritannien & Irland, weitere folgen.",
    "travellers.benefit.corporate.title": "Firmenkonten",
    "travellers.benefit.corporate.body":
      "Geschäftlich unterwegs? Zentrale Buchungen, monatliche Abrechnung und bevorzugter Support für Teams.",
    "travellers.benefit.referral.title": "Empfehlungsprogramm",
    "travellers.benefit.referral.body":
      "Teilen Sie ParkGo mit Freunden und Familie — Sie beide werden belohnt, wenn sie ihre erste Reise antreten.",
    "travellers.benefit.cheaper.title": "Oft günstiger",
    "travellers.benefit.cheaper.body":
      "Geprüfte Stellplätze in Terminalnähe unterbieten häufig offizielle Langzeitparkplätze — ohne Shuttle-Wartezeit.",

    "travellers.how.eyebrow": "So funktioniert's",
    "travellers.how.title": "In Minuten gebucht, für die ganze Reise erledigt",
    "travellers.how.step1.title": "Suchen & vergleichen",
    "travellers.how.step1.body":
      "Wählen Sie Ihren Flughafen und die Daten. Sehen Sie geprüfte Plätze mit Preis, Entfernung, E-Auto und Bewertungen.",
    "travellers.how.step2.title": "Ihr Paket zusammenstellen",
    "travellers.how.step2.body":
      "Fügen Sie einen lizenzierten Transfer und das Laden von E-Autos hinzu. Ein Preis, ein sicherer Checkout.",
    "travellers.how.step3.title": "Parken, verfolgen, fliegen",
    "travellers.how.step3.body":
      "Erhalten Sie Ihren QR-Code, verfolgen Sie Ihren Fahrer live, beobachten Sie Ihr Auto und bestätigen Sie eine geprüfte Übergabe.",
    "travellers.how.cta": "Den kompletten Ablauf ansehen",

    "travellers.faq.eyebrow": "Gut zu wissen",
    "travellers.faq.title": "Fragen, die Reisende zuerst stellen",
    "travellers.faq.body": "Ein paar schnelle Antworten vor Ihrer Buchung. In unseren vollständigen FAQ gibt es noch viel mehr.",
    "travellers.faq.cta": "Die vollständigen FAQ lesen",
    "travellers.faq.q1": "Ist mein Auto sicher, während ich weg bin?",
    "travellers.faq.a1":
      "Gastgeber sind ID-geprüft, Plätze können Videoüberwachung umfassen, und Sie können eine Live-Kamera in der App verfolgen. Abgabe und Abholung erfolgen beide über eine geprüfte, protokollierte Übergabe.",
    "travellers.faq.q2": "Was, wenn mein Flug verspätet ist?",
    "travellers.faq.a2":
      "Ihre Buchung und der Rücktransfer sind mit Ihrer Reise verknüpft, sodass eine Verspätung problemlos gehandhabt wird — Sie verlieren weder Ihren Platz noch Ihre Heimfahrt.",
    "travellers.faq.q3": "Kann ich alles auf einmal bezahlen?",
    "travellers.faq.a3":
      "Ja. Parken, Transfer und das Laden von E-Autos werden zu einem transparenten Preis zusammengefasst, mit einer kleinen, klar ausgewiesenen Servicegebühr.",

    "travellers.waitlist.title": "Buchen Sie als Erste an Ihrem Flughafen",
    "travellers.waitlist.body":
      "Wir starten in ganz Großbritannien & Irland. Tragen Sie sich in die Warteliste ein und wir informieren Sie, sobald ParkGo an Ihrem Abflugort live geht.",

    // -------------------------------------------------------------------- Hosts
    "hosts.badge": "Für Gastgeber & Vermieter",
    "hosts.hero.title": "Verdienen Sie mit einer Einfahrt in Flughafennähe",
    "hosts.hero.subtitle":
      "Wenn Sie in der Nähe eines britischen oder irischen Flughafens wohnen, könnte Ihre leere Einfahrt, Ihr Hof oder Ihr freier Platz Geld einbringen. Lassen Sie sich verifizieren, inserieren Sie in Minuten und behalten Sie den Großteil jeder Buchung.",
    "hosts.hero.cta.list": "Platz inserieren",
    "hosts.hero.cta.onboarding": "So funktioniert das Onboarding",
    "hosts.hero.keep": "Behalten Sie ~{pct}% des Parkens",
    "hosts.hero.travellers": "Geprüfte Reisende",

    "hosts.earnings.label": "Was Sie behalten",
    "hosts.earnings.ofBooking": "jeder Parkbuchung",
    "hosts.earnings.indicative": "Richtwert",
    "hosts.earnings.travellerPays": "Reisender zahlt fürs Parken",
    "hosts.earnings.commission": "ParkGo-Provision",
    "hosts.earnings.youReceive": "Sie erhalten",
    "hosts.earnings.note":
      "Die Einnahmen aus dem E-Auto-Laden folgen derselben Aufteilung — der Ladepunkt gehört Ihnen. Die Zahlen sind Richtwerte und werden zum Start bestätigt.",

    "hosts.why.eyebrow": "Warum bei ParkGo Gastgeber werden",
    "trav.compare.eyebrow": "Vergleich",
    "trav.compare.heading": "ParkGo vs. typisches Parken am Flughafen",
    "trav.compare.sub": "Was Sie mit einem verifizierten Privatstellplatz statt des offiziellen Parkhauses bekommen.",
    "trav.compare.col.feature": "Worauf es ankommt",
    "trav.compare.col.official": "Typisches Parken vor Ort",
    "trav.compare.price": "Preis pro Tag",
    "trav.compare.price.official": "Typisch £20–£40",
    "trav.compare.price.parkgo": "Ab £6 — Gastgeber bestimmen den Preis",
    "trav.compare.camera": "Das eigene Auto sehen",
    "trav.compare.camera.official": "—",
    "trav.compare.camera.parkgo": "Live-Kamerablick + CCTV-Badges",
    "trav.compare.cancel": "Stornierung",
    "trav.compare.cancel.official": "Oft mit Gebühren",
    "trav.compare.cancel.parkgo": "Kostenlos bis 24 h vor Abgabe",
    "trav.compare.transfer": "Terminal-Transfer",
    "trav.compare.transfer.official": "Geteilter Shuttlebus",
    "trav.compare.transfer.parkgo": "Lizenziertes Privattaxi in derselben Buchung",
    "trav.compare.ev": "EV-Laden",
    "trav.compare.ev.official": "Wenige Plätze",
    "trav.compare.ev.parkgo": "Buchbares Add-on an vielen Plätzen",
    "trav.compare.support": "Support",
    "trav.compare.support.official": "Telefon-Warteschleifen",
    "trav.compare.support.parkgo": "Sofort-Chat in 5 Sprachen",
    "trav.compare.note": "Indikativer Vergleich — Preise und Bedingungen vor Ort variieren je nach Flughafen und Betreiber.",
    "hosts.calc.eyebrow": "Ihre Einnahmen",
    "hosts.calc.heading": "Was könnte Ihr Stellplatz verdienen?",
    "hosts.calc.sub": "Schieberegler bewegen — Ihr Preis, Ihre Verfügbarkeit.",
    "hosts.calc.price": "Ihr Preis pro Tag",
    "hosts.calc.days": "Gebuchte Tage pro Monat",
    "hosts.calc.monthly": "Geschätzte Monatseinnahmen",
    "hosts.calc.yearly": "pro Jahr",
    "hosts.calc.youKeep": "Sie behalten",
    "hosts.calc.note": "Eine Schätzung, keine Garantie — tatsächliche Einnahmen hängen von Nachfrage, Preis und Verfügbarkeit ab.",
    "hosts.why.title": "Ungenutzten Platz nutzbar machen",
    "hosts.why.body":
      "Reisende wollen einen sicheren, bequemen Ort, um ihr Auto abzustellen. Wenn Sie in Terminalnähe sind, ist Ihr Platz genau das bereits.",
    "hosts.why.economics.title": "Starke Wirtschaftlichkeit",
    "hosts.why.economics.body":
      "Behalten Sie rund {pct}% jeder Parkbuchung, plus Einnahmen aus dem E-Auto-Laden, wo Sie es anbieten.",
    "hosts.why.usewhat.title": "Nutzen Sie, was Sie haben",
    "hosts.why.usewhat.body":
      "Eine Einfahrt, ein Hof, ein freier Stellplatz — kein Umbau, keine neue Ausrüstung nötig, um zu starten.",
    "hosts.why.ev.title": "Mehr verdienen mit E-Auto",
    "hosts.why.ev.body": "Inserieren Sie einen Ladepunkt und erfassen Sie Ladeeinnahmen, während Reisende unterwegs sind.",
    "hosts.why.risk.title": "Geringeres Risiko",
    "hosts.why.risk.body":
      "Geprüfte Reisende, optionale Videoüberwachung und geprüfte Übergaben bedeuten weniger Überraschungen.",

    "hosts.onboarding.eyebrow": "Einrichtung",
    "hosts.onboarding.title": "Von der Anmeldung bis zum Livegang in wenigen klaren Schritten",
    "hosts.onboarding.body":
      "Das Onboarding basiert auf beidseitigem Vertrauen. Jeder Gastgeber wird verifiziert, bevor auch nur ein einziger Reisender buchen kann.",
    "hosts.onboarding.identity.title": "Identität verifizieren",
    "hosts.onboarding.identity.body":
      "Eine schnelle KYC-Prüfung bestätigt, wer Sie sind. Dokumente werden verschlüsselt und getrennt von Ihrem Profil gespeichert.",
    "hosts.onboarding.address.title": "Adresse verifizieren",
    "hosts.onboarding.address.body":
      "Wir bestätigen den Standort des Platzes, den Sie inserieren möchten, damit Reisende genau wissen, wo sie parken.",
    "hosts.onboarding.details.title": "Objektdetails hinzufügen",
    "hosts.onboarding.details.body":
      "Fotos, Stellplatzmaße, Zugangshinweise und ob Sie E-Auto-Laden oder Videoüberwachung anbieten — die Dinge, nach denen Reisende filtern.",
    "hosts.onboarding.declaration.title": "Erklärung zur Inserierungsberechtigung",
    "hosts.onboarding.declaration.body":
      "Bestätigen Sie, dass Sie berechtigt sind, den Platz zu vermieten (Eigentümer oder mit Erlaubnis) und dass die Nutzung sicher und rechtmäßig ist.",
    "hosts.onboarding.bank.title": "Bankdaten hinzufügen",
    "hosts.onboarding.bank.body":
      "Teilen Sie uns mit, wohin Ihre Auszahlungen gehen sollen. Bankdaten werden verschlüsselt und Reisenden nie angezeigt.",
    "hosts.onboarding.review.title": "Compliance-Prüfung",
    "hosts.onboarding.review.body":
      "Unser Team prüft Ihr Inserat anhand unserer Vertrauens- und Sicherheitsstandards, bevor es live gehen kann.",
    "hosts.onboarding.golive.title": "Live gehen & verdienen",
    "hosts.onboarding.golive.body":
      "Legen Sie Ihre Verfügbarkeit und Ihren Preis fest. Ihr Platz erscheint sofort in den Suchergebnissen der Reisenden.",

    "hosts.trust.eyebrow": "Vertrauen & Schutz",
    "hosts.trust.title": "Gebaut, um Gastgeber genauso zu schützen wie Reisende",
    "hosts.trust.body":
      "Sie laden jemanden ein, Ihren Platz zu nutzen, deshalb ist Vertrauen wichtig. ParkGo verifiziert beide Seiten und führt ein klares, protokolliertes Register jeder Buchung.",
    "hosts.trust.travellers.title": "Geprüfte Reisende",
    "hosts.trust.travellers.body":
      "Buchungen kommen von echten, registrierten ParkGo-Kunden — und Sie können sie ebenfalls bewerten.",
    "hosts.trust.cctv.title": "Optionale Videoüberwachung & Live-Kamera",
    "hosts.trust.cctv.body":
      "Fügen Sie Ihrem Inserat eine Kamera hinzu — für zusätzliche Sicherheit, für Sie und den Reisenden gleichermaßen.",
    "hosts.trust.handover.title": "Geprüfte Übergaben",
    "hosts.trust.handover.body":
      "Jede Abgabe und Abholung wird mit einem Einmalcode bestätigt, mit Zeitstempel und protokolliert.",
    "hosts.trust.terms.title": "Klare Bedingungen",
    "hosts.trust.terms.body":
      "Transparente Gastgeberbedingungen, eine definierte Erklärung zur Inserierungsberechtigung und Plattform-Support, falls etwas schiefgeht.",
    "hosts.trust.cta": "Vertrauen & Sicherheit lesen",

    "hosts.payouts.title": "Einfache, sichere Auszahlungen",
    "hosts.payouts.percompleted.title": "Bezahlung pro abgeschlossener Buchung",
    "hosts.payouts.percompleted.body":
      "Einnahmen werden nach Abschluss jeder Reise freigegeben — kein Nachlaufen, keine Rechnungsstellung Ihrerseits.",
    "hosts.payouts.tobank.title": "Direkt auf Ihr Bankkonto",
    "hosts.payouts.tobank.body":
      "Auszahlungen gehen an die verschlüsselten Bankdaten, die Sie beim Onboarding hinzufügen.",
    "hosts.payouts.statements.title": "Klare Abrechnungen",
    "hosts.payouts.statements.body":
      "Sehen Sie jede Buchung, die einbehaltene Provision und Ihre Auszahlung an einem Ort.",
    "hosts.payouts.setprice.title": "Sie bestimmen den Preis",
    "hosts.payouts.setprice.body":
      "Wählen Sie Ihren Tagessatz und Ihre Verfügbarkeit — erhöhen Sie ihn für Spitzenzeiten, wann immer Sie möchten.",
    "hosts.payouts.cta": "Gastgeber-Wirtschaftlichkeit ansehen",

    "hosts.waitlist.title": "Bereit, mit Ihrem Platz zu verdienen?",
    "hosts.waitlist.body":
      "Treten Sie der Gastgeber-Warteliste bei und wir laden Sie ein, sich verifizieren zu lassen und zu inserieren, sobald wir in Ihrer Nähe starten.",
    "hosts.waitlist.nospam": "Keine Verpflichtung — inserieren Sie erst, wenn Sie bereit sind.",

    // -------------------------------------------------------------------- About
    "about.badge": "Über ParkGo",
    "about.hero.title": "Nahtloser Flughafenzugang für Großbritannien & Irland",
    "about.hero.subtitle":
      "ParkGo vereint Parken, lizenzierte Transfers, das Laden von E-Autos und Live-Sicherheit in einer vertrauenswürdigen Buchung — damit die Anreise zum Flug der einfache Teil der Reise ist.",

    "about.mission.eyebrow": "Unsere Mission",
    "about.mission.title": "Parken für jede Fahrt, auf Vertrauen gebaut",
    "about.mission.body":
      "Wir glauben, dass die Anreise zum Flughafen genauso gut gestaltet sein sollte wie der Flug selbst. Unsere Mission ist es, geprüfte Gastgeber, einen unabhängigen lizenzierten Transferbetreiber und Reisende in einer einzigen, transparenten Reise zu verbinden — in ganz Großbritannien & Irland und in Ihrer Sprache.",

    "about.problem.title": "Das Problem",
    "about.problem.body":
      "Flughafenreisen sind fragmentiert. Sie buchen das Parken auf einer Seite, einen Transfer auf einer anderen, suchen separat nach E-Auto-Laden und hoffen einfach, dass Ihr Auto sicher ist, während Sie weg sind. Preise sind undurchsichtig, Shuttles langsam, und am entscheidenden Tag gibt es keine echte Transparenz.",
    "about.problem.point1": "Mehrere Buchungen, mehrere Preise",
    "about.problem.point2": "Kein klarer Überblick, wo Ihr Auto oder Fahrer ist",
    "about.problem.point3": "Begrenztes Vertrauen und lückenhafte Verifizierung",

    "about.approach.title": "Unser Ansatz",
    "about.approach.body":
      "ParkGo bündelt die gesamte Reise in einem Checkout und macht sie dann sichtbar und überprüfbar. Geprüfte Gastgeber, lizenzierte Fahrer, ein einziger transparenter Preis und Live-Tracking mit In-App-Kamera und geprüften Übergaben von Anfang bis Ende.",
    "about.approach.point1": "Eine Buchung, ein Preis, eine App",
    "about.approach.point2": "Beidseitige Verifizierung und Vertrauensbewertung",
    "about.approach.point3": "Live-Tracking, Kamera und geprüfte Übergaben",

    "about.values.eyebrow": "Was uns wichtig ist",
    "about.values.title": "Die Prinzipien hinter dem Produkt",
    "about.value.trust.title": "Vertrauen zuerst",
    "about.value.trust.body":
      "Verifizierung, Transparenz und klare Aufzeichnungen stehen im Zentrum jeder Entscheidung, die wir treffen.",
    "about.value.integrated.title": "Wirklich integriert",
    "about.value.integrated.body":
      "Eine Buchung, ein Preis, eine App — wir weigern uns, ein weiteres unzusammenhängendes Erlebnis auszuliefern.",
    "about.value.human.title": "Menschlich von Grund auf",
    "about.value.human.body":
      "Mehrsprachig, barrierefrei und unterstützend. Reisen ist schon stressig genug.",
    "about.value.fair.title": "Offen & fair",
    "about.value.fair.body":
      "Transparente Preise für Reisende und faire, konfigurierbare Wirtschaftlichkeit für Gastgeber und Partner.",

    "about.team.eyebrow": "Unser Team",
    "about.team.title": "Die Menschen, die ParkGo bauen",
    "about.team.body":
      "Ein kleines, fokussiertes Team, besessen von Vertrauen, Design und dem stressfreien Weg der Reisenden zu ihrem Flug.",
    "about.team.role.ceo": "Gründer & CEO",
    "about.team.role.product": "Leiter Produkt",
    "about.team.role.engineering": "Leiter Technik",
    "about.team.role.trust": "Leiterin Vertrauen & Sicherheit",
    "about.team.growing": "Wir wachsen — offene Stellen finden Sie auf unserer",
    "about.team.contactPage": "Kontaktseite",

    "about.vision.mission.k": "1 Mission",
    "about.vision.mission.v": "Nahtloser Flughafenzugang",
    "about.vision.region.k": "GB & Irland",
    "about.vision.region.v": "Wo wir zuerst starten",
    "about.vision.sides.k": "3 Seiten",
    "about.vision.sides.v": "Reisende, Gastgeber & Partner",
    "about.vision.trust.k": "Auf Vertrauen gebaut",
    "about.vision.trust.v": "Verifizierung bei jedem Schritt",

    "about.waitlist.title": "Kommen Sie mit auf die Reise",
    "about.waitlist.body":
      "Wir bauen ParkGo offen auf und starten Flughafen für Flughafen. Treten Sie der Warteliste bei und wachsen Sie mit uns.",
    "about.waitlist.cta": "So funktioniert's",
  },

  zh: {
    // ---------------------------------------------------------------- Travellers
    "travellers.badge": "旅客专区",
    "travellers.hero.title": "停车、接送与充电 — 一次预订全部搞定",
    "travellers.hero.subtitle":
      "ParkGo 把飞行中最令人头疼的环节变成最轻松的部分。一个透明价格、经过验证的服务人员，以及从车位搜索到返家全程的实时追踪。",
    "travellers.hero.cta.book": "开始预订",
    "travellers.hero.cta.how": "了解运作方式",
    "travellers.trust.hosts": "认证房东",
    "travellers.trust.drivers": "持牌司机",
    "travellers.trust.camera": "实时摄像头与闭路电视",

    "travellers.benefits.eyebrow": "旅客为何选择 ParkGo",
    "travellers.benefits.title": "旅程所需一应俱全，省去所有麻烦",
    "travellers.benefits.body":
      "我们把您过去分别预订的服务整合在一起 — 并加入了机场停车一直缺失的信任与可视化。",
    "travellers.benefit.oneprice.title": "一个价格，一次预订",
    "travellers.benefit.oneprice.body":
      "停车、持牌接送和电动车充电，在一次透明结账中完成。无需在多个应用间切换，也没有隐藏费用。",
    "travellers.benefit.verified.title": "已验证且安全",
    "travellers.benefit.verified.body":
      "每位房东都经过身份核验，每位司机均持牌且有保险。全程配备闭路电视和已验证的交接。",
    "travellers.benefit.tracking.title": "实时追踪与摄像头",
    "travellers.benefit.tracking.body":
      "在实时地图上追踪您的司机，并通过带有 LIVE 标识的应用内摄像头查看您停放的爱车。",
    "travellers.benefit.ev.title": "电动车充电",
    "travellers.benefit.ev.body":
      "出行期间在提供充电桩的房东处补电。返程时迎接一辆随时可上路的爱车。",
    "travellers.benefit.multilingual.title": "多语言",
    "travellers.benefit.multilingual.body":
      "用您的语言使用 ParkGo — 覆盖英国和爱尔兰的四种上线语言，更多语言即将推出。",
    "travellers.benefit.corporate.title": "企业账户",
    "travellers.benefit.corporate.body":
      "因公出行？为团队提供集中预订、按月开票和优先支持。",
    "travellers.benefit.referral.title": "推荐计划",
    "travellers.benefit.referral.body":
      "把 ParkGo 分享给亲朋好友，当他们完成首次行程时，你们双方都能获得奖励。",
    "travellers.benefit.cheaper.title": "往往更划算",
    "travellers.benefit.cheaper.body":
      "航站楼附近经过验证的私家车位常常比官方长期停车场更便宜 — 而且无需等候摆渡车。",

    "travellers.how.eyebrow": "运作方式",
    "travellers.how.title": "几分钟完成预订，全程无忧",
    "travellers.how.step1.title": "搜索与比较",
    "travellers.how.step1.body":
      "选择您的机场和日期。查看带有价格、距离、电动车充电和评分的已验证车位。",
    "travellers.how.step2.title": "组合您的套餐",
    "travellers.how.step2.body":
      "添加持牌接送和电动车充电。一个价格，一次安全结账。",
    "travellers.how.step3.title": "停车、追踪、起飞",
    "travellers.how.step3.body":
      "获取您的二维码，实时追踪司机，查看爱车并确认已验证的交接。",
    "travellers.how.cta": "查看完整流程",

    "travellers.faq.eyebrow": "值得了解",
    "travellers.faq.title": "旅客最先问的问题",
    "travellers.faq.body": "预订前的几个快速解答。我们的完整常见问题中还有更多内容。",
    "travellers.faq.cta": "阅读完整常见问题",
    "travellers.faq.q1": "我离开期间爱车安全吗？",
    "travellers.faq.a1":
      "房东经过身份验证，车位可配备闭路电视，您还能通过应用内实时摄像头查看。停放和取车均采用经过验证、有记录的交接。",
    "travellers.faq.q2": "如果我的航班延误怎么办？",
    "travellers.faq.a2":
      "您的预订和返程接送与您的行程绑定，因此延误会被妥善处理 — 您不会失去车位或回家的车。",
    "travellers.faq.q3": "我可以一次性付款吗？",
    "travellers.faq.a3":
      "可以。停车、接送和电动车充电整合为一个透明价格，并附带一笔明确标示的小额服务费。",

    "travellers.waitlist.title": "抢先在您的机场预订",
    "travellers.waitlist.body":
      "我们正在英国和爱尔兰各地上线。加入等候名单，ParkGo 在您的出发机场上线时我们会第一时间通知您。",

    // -------------------------------------------------------------------- Hosts
    "hosts.badge": "房东与业主专区",
    "hosts.hero.title": "用机场附近的车道赚取收入",
    "hosts.hero.subtitle":
      "如果您住在英国或爱尔兰机场附近，您闲置的车道、院子或多余空间就能创收。完成验证，几分钟内即可发布，并保留每笔预订的大部分收入。",
    "hosts.hero.cta.list": "发布您的车位",
    "hosts.hero.cta.onboarding": "入驻流程如何进行",
    "hosts.hero.keep": "保留约 {pct}% 的停车收入",
    "hosts.hero.travellers": "认证旅客",

    "hosts.earnings.label": "您可保留",
    "hosts.earnings.ofBooking": "每笔停车预订中",
    "hosts.earnings.indicative": "参考值",
    "hosts.earnings.travellerPays": "旅客支付停车费",
    "hosts.earnings.commission": "ParkGo 佣金",
    "hosts.earnings.youReceive": "您实得",
    "hosts.earnings.note":
      "电动车充电收入采用相同的分成方式 — 充电桩归您所有。数据为参考值，将在上线时确认。",

    "hosts.why.eyebrow": "为何选择 ParkGo 做房东",
    "trav.compare.eyebrow": "对比",
    "trav.compare.heading": "ParkGo 对比机场官方停车",
    "trav.compare.sub": "选择经过认证的私人车位，而不是官方停车场，您能得到什么。",
    "trav.compare.col.feature": "关键点",
    "trav.compare.col.official": "官方停车（典型）",
    "trav.compare.price": "每天价格",
    "trav.compare.price.official": "通常 £20–£40",
    "trav.compare.price.parkgo": "低至 £6——价格由房东设定",
    "trav.compare.camera": "实时看到自己的车",
    "trav.compare.camera.official": "—",
    "trav.compare.camera.parkgo": "实时摄像头 + CCTV 标识",
    "trav.compare.cancel": "取消政策",
    "trav.compare.cancel.official": "常收取费用",
    "trav.compare.cancel.parkgo": "停车前 24 小时内免费取消",
    "trav.compare.transfer": "航站楼接送",
    "trav.compare.transfer.official": "共享摆渡巴士",
    "trav.compare.transfer.parkgo": "同一订单内的持牌专车",
    "trav.compare.ev": "电动车充电",
    "trav.compare.ev.official": "车位有限",
    "trav.compare.ev.parkgo": "许多车位可预订充电",
    "trav.compare.support": "客服",
    "trav.compare.support.official": "电话排队",
    "trav.compare.support.parkgo": "5 种语言即时聊天",
    "trav.compare.note": "仅为参考对比——官方价格与政策因机场和运营方而异。",
    "hosts.calc.eyebrow": "您的收入",
    "hosts.calc.heading": "您的车位能赚多少？",
    "hosts.calc.sub": "拖动滑块——价格和可用天数由您决定。",
    "hosts.calc.price": "您的每日价格",
    "hosts.calc.days": "每月被预订天数",
    "hosts.calc.monthly": "预计每月收入",
    "hosts.calc.yearly": "每年",
    "hosts.calc.youKeep": "您保留",
    "hosts.calc.note": "仅为估算，非保证——实际收入取决于需求、价格和可用天数。",
    "hosts.why.title": "让闲置空间创造价值",
    "hosts.why.body":
      "旅客需要一个安全、便利的地方停放爱车。如果您就在航站楼附近，您的空间正是他们所需。",
    "hosts.why.economics.title": "可观收益",
    "hosts.why.economics.body":
      "每笔停车预订保留约 {pct}%，若您提供电动车充电，还可额外获得充电收入。",
    "hosts.why.usewhat.title": "善用现有空间",
    "hosts.why.usewhat.body":
      "一条车道、一个院子、一个空车位 — 无需施工，无需新设备即可开始。",
    "hosts.why.ev.title": "借电动车赚得更多",
    "hosts.why.ev.body": "发布充电桩，在旅客外出期间获取电动车充电收入。",
    "hosts.why.risk.title": "风险更低",
    "hosts.why.risk.body":
      "认证旅客、可选闭路电视和已验证的交接意味着更少意外。",

    "hosts.onboarding.eyebrow": "开始设置",
    "hosts.onboarding.title": "从注册到上线，只需几个清晰步骤",
    "hosts.onboarding.body":
      "入驻流程围绕双方信任而设计。每位房东都要经过验证，之后旅客才能预订。",
    "hosts.onboarding.identity.title": "验证您的身份",
    "hosts.onboarding.identity.body":
      "快速的 KYC 核验确认您的身份。文件经过加密，并与您的个人资料分开存储。",
    "hosts.onboarding.address.title": "验证您的地址",
    "hosts.onboarding.address.body":
      "我们确认您想发布的空间位置，让旅客清楚知道自己将在何处停车。",
    "hosts.onboarding.details.title": "添加物业详情",
    "hosts.onboarding.details.body":
      "照片、车位尺寸、出入说明，以及是否提供电动车充电或闭路电视 — 这些都是旅客筛选的依据。",
    "hosts.onboarding.declaration.title": "发布权声明",
    "hosts.onboarding.declaration.body":
      "确认您有权出租该空间（业主或已获许可），且使用安全合法。",
    "hosts.onboarding.bank.title": "添加银行信息",
    "hosts.onboarding.bank.body":
      "告诉我们将款项汇往何处。银行信息经过加密，绝不会向旅客展示。",
    "hosts.onboarding.review.title": "合规审核",
    "hosts.onboarding.review.body":
      "我们的团队会依据信任与安全标准审核您的房源，之后才可上线。",
    "hosts.onboarding.golive.title": "上线并赚取收入",
    "hosts.onboarding.golive.body":
      "设置您的可用时间和价格。您的空间将立即出现在旅客搜索结果中。",

    "hosts.trust.eyebrow": "信任与保障",
    "hosts.trust.title": "对房东与旅客同等保护",
    "hosts.trust.body":
      "您邀请他人使用您的空间，因此信任至关重要。ParkGo 对双方进行验证，并为每笔预订保留清晰、可追溯的记录。",
    "hosts.trust.travellers.title": "认证旅客",
    "hosts.trust.travellers.body":
      "预订来自真实、已注册的 ParkGo 客户 — 您也可以对他们进行评价。",
    "hosts.trust.cctv.title": "可选闭路电视与实时摄像头",
    "hosts.trust.cctv.body":
      "在房源中添加摄像头，为您和旅客双方带来额外安心。",
    "hosts.trust.handover.title": "已验证的交接",
    "hosts.trust.handover.body":
      "每次停放和取车都通过一次性验证码确认，附带时间戳并记录在案。",
    "hosts.trust.terms.title": "清晰条款",
    "hosts.trust.terms.body":
      "透明的房东条款、明确的发布权声明，以及万一出现问题时的平台支持。",
    "hosts.trust.cta": "阅读信任与安全",

    "hosts.payouts.title": "简单、安全的收款",
    "hosts.payouts.percompleted.title": "按完成的预订付款",
    "hosts.payouts.percompleted.body":
      "每次行程完成后即释放收入 — 您无需催收，也无需开票。",
    "hosts.payouts.tobank.title": "直达您的银行账户",
    "hosts.payouts.tobank.body":
      "款项汇入您在入驻时添加的加密银行信息。",
    "hosts.payouts.statements.title": "清晰对账单",
    "hosts.payouts.statements.body":
      "在一处查看每笔预订、所收佣金及您的收款。",
    "hosts.payouts.setprice.title": "由您定价",
    "hosts.payouts.setprice.body":
      "选择您的每日费率和可用时间 — 在高峰时段随时上调。",
    "hosts.payouts.cta": "查看房东收益",

    "hosts.waitlist.title": "准备好用您的空间赚钱了吗？",
    "hosts.waitlist.body":
      "加入房东等候名单，一旦我们在您附近上线，我们将邀请您完成验证并发布房源。",
    "hosts.waitlist.nospam": "无任何约束 — 准备好了再发布。",

    // -------------------------------------------------------------------- About
    "about.badge": "关于 ParkGo",
    "about.hero.title": "让英国和爱尔兰的机场出行畅通无阻",
    "about.hero.subtitle":
      "ParkGo 将停车、持牌接送、电动车充电和实时安防整合为一次值得信赖的预订 — 让前往航班成为旅程中最轻松的部分。",

    "about.mission.eyebrow": "我们的使命",
    "about.mission.title": "建立在信任之上、服务每段旅程的停车平台",
    "about.mission.body":
      "我们相信，前往机场的过程应当与航班本身一样精心设计。我们的使命是把认证房东、独立的持牌接送运营商和旅客连接到一段统一、透明的旅程中 — 覆盖英国和爱尔兰，并以您的语言呈现。",

    "about.problem.title": "问题所在",
    "about.problem.body":
      "机场出行是割裂的。您在一个网站预订停车，在另一个网站预订接送，还要单独寻找电动车充电，然后只能寄望离开期间爱车安全。价格不透明，摆渡车缓慢，而在最关键的那天却毫无真正的可视化。",
    "about.problem.point1": "多次预订，多个价格",
    "about.problem.point2": "无法清楚了解爱车或司机的位置",
    "about.problem.point3": "信任有限，验证不完善",

    "about.approach.title": "我们的方法",
    "about.approach.body":
      "ParkGo 将整段旅程整合到一次结账中，再让它可视化、可验证。认证房东、持牌司机、单一透明价格，以及从头到尾配备应用内摄像头和已验证交接的实时追踪。",
    "about.approach.point1": "一次预订，一个价格，一个应用",
    "about.approach.point2": "双向验证与信任评分",
    "about.approach.point3": "实时追踪、摄像头与已验证的交接",

    "about.values.eyebrow": "我们的价值观",
    "about.values.title": "产品背后的原则",
    "about.value.trust.title": "信任优先",
    "about.value.trust.body":
      "验证、可视化和清晰记录是我们每一个决策的核心。",
    "about.value.integrated.title": "真正一体化",
    "about.value.integrated.body":
      "一次预订、一个价格、一个应用 — 我们拒绝再推出又一个割裂的体验。",
    "about.value.human.title": "以人为本",
    "about.value.human.body":
      "多语言、无障碍且贴心。旅行本已足够令人紧张。",
    "about.value.fair.title": "开放与公平",
    "about.value.fair.body":
      "为旅客提供透明定价，为房东和合作伙伴提供公平、可配置的收益机制。",

    "about.team.eyebrow": "我们的团队",
    "about.team.title": "打造 ParkGo 的团队",
    "about.team.body":
      "一支精悍专注的团队，执着于信任、设计，以及让旅客毫无压力地赶上航班。",
    "about.team.role.ceo": "创始人兼首席执行官",
    "about.team.role.product": "产品负责人",
    "about.team.role.engineering": "工程负责人",
    "about.team.role.trust": "信任与安全负责人",
    "about.team.growing": "我们正在壮大 — 查看空缺职位，请访问我们的",
    "about.team.contactPage": "联系页面",

    "about.vision.mission.k": "1 个使命",
    "about.vision.mission.v": "畅通无阻的机场出行",
    "about.vision.region.k": "英国和爱尔兰",
    "about.vision.region.v": "我们率先上线的地区",
    "about.vision.sides.k": "3 方",
    "about.vision.sides.v": "旅客、房东与合作伙伴",
    "about.vision.trust.k": "为信任而生",
    "about.vision.trust.v": "每一步都经过验证",

    "about.waitlist.title": "与我们一同踏上旅程",
    "about.waitlist.body":
      "我们正公开打造 ParkGo，并逐个机场上线。加入等候名单，与我们共同成长。",
    "about.waitlist.cta": "了解运作方式",
  },
};
