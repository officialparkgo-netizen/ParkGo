import type { AreaDict } from "@/lib/i18n/config";

// Pricing + Trust & Safety + Contact. Keys namespaced "pricing.*", "trust.*", "contact.*".
export const marketingC: AreaDict = {
  en: {
    // ---------------------------------------------------------------- Pricing
    "pricing.hero.badge": "Transparent by design",
    "pricing.hero.title": "One clear price. No surprises at the gate.",
    "pricing.hero.subtitle":
      "ParkGo bundles parking, a licensed transfer and EV charging into a single price with one small, clearly shown service fee. Hosts earn on fair, transparent terms.",
    "pricing.hero.ctaStart": "Start a booking",
    "pricing.hero.ctaHow": "How the bundle adds up",

    "pricing.bundle.eyebrow": "The bundle price",
    "pricing.bundle.title": "Four services, one price you can read in seconds",
    "pricing.bundle.body":
      "Instead of three checkouts and a mental sum, ParkGo shows you a single total before you pay. Here's how an indicative bundle breaks down.",
    "pricing.bundle.point1": "Per-day parking from your chosen verified host",
    "pricing.bundle.point2": "A licensed terminal transfer, both ways",
    "pricing.bundle.point3": "Optional EV charging where the host offers it",
    "pricing.bundle.point4": "A flat {fee} service fee, shown before you pay",

    "pricing.receipt.label": "Indicative bundle",
    "pricing.receipt.parking": "Verified parking",
    "pricing.receipt.parkingNote": "host driveway near the terminal",
    "pricing.receipt.transfer": "Licensed transfer",
    "pricing.receipt.transferNote": "both ways, licensed driver",
    "pricing.receipt.ev": "EV charging",
    "pricing.receipt.evNote": "optional top-up",
    "pricing.receipt.fee": "Service fee",
    "pricing.receipt.feeNote": "flat platform fee",
    "pricing.receipt.total": "One price at checkout",
    "pricing.receipt.disclaimer":
      "Indicative example only. Your price depends on airport, dates and the add-ons you choose.",

    "pricing.economics.eyebrow": "How the bundle adds up",
    "pricing.economics.title": "Fair economics, clearly explained",
    "pricing.economics.body":
      "ParkGo takes a commission on parking and a small flat service fee. The licensed transfer is included via an integrated operator. Everyone can see exactly where the money goes.",

    "pricing.econ.hosts.who": "Hosts",
    "pricing.econ.hosts.line": "on parking & EV",
    "pricing.econ.hosts.keep": "Keep ~{pct}%",
    "pricing.econ.hosts.body":
      "Commission is taken per parking booking; EV charging revenue follows the same split because the host owns the charger.",
    "pricing.econ.transfer.who": "Licensed transfer",
    "pricing.econ.transfer.commission": "Included",
    "pricing.econ.transfer.line": "in your bundle price",
    "pricing.econ.transfer.keep": "No partner onboarding",
    "pricing.econ.transfer.body":
      "The terminal transfer is provided by an independent, licensed and insured operator, integrated with ParkGo by API. There is no fleet to onboard — it is simply bundled into your one price.",
    "pricing.econ.fee.who": "Service fee",
    "pricing.econ.fee.line": "flat, per booking",
    "pricing.econ.fee.keep": "Shown at checkout",
    "pricing.econ.fee.body":
      "A small flat platform fee added once per booking. It is never hidden — travellers see it before they pay.",

    "pricing.econ.ctaHost": "Earn as a host",
    "pricing.econ.ctaTransfer": "How the transfer works",
    "pricing.econ.note": "Indicative commission of ~{pct}% on parking. Rates are to be confirmed at launch.",

    "pricing.more.eyebrow": "More ways to save",
    "pricing.more.title": "Built for teams and for sharing",

    "pricing.corporate.title": "Corporate accounts",
    "pricing.corporate.body":
      "Centralise travel for your team with one account, consolidated billing and priority support.",
    "pricing.corporate.point1": "Monthly invoicing instead of per-trip cards",
    "pricing.corporate.point2": "Centralised bookings across your travellers",
    "pricing.corporate.point3": "Priority support for time-critical trips",
    "pricing.corporate.point4": "Clear statements for easy expensing",
    "pricing.corporate.cta": "Talk to us about teams",

    "pricing.referral.title": "Referral programme",
    "pricing.referral.body":
      "Love ParkGo? Share it. When a friend takes their first trip, you both get rewarded.",
    "pricing.referral.point1": "Share your personal referral link",
    "pricing.referral.point2": "Your friend gets a welcome reward",
    "pricing.referral.point3": "You're rewarded after their first completed trip",
    "pricing.referral.point4": "Refer as many people as you like",
    "pricing.referral.cta": "Start travelling",

    "pricing.included.eyebrow": "Included in every booking",
    "pricing.included.title": "The price always includes the important parts",
    "pricing.included.verified.title": "Verified people",
    "pricing.included.verified.body": "ID-checked hosts and licensed, insured drivers — always.",
    "pricing.included.secure.title": "Secure payment",
    "pricing.included.secure.body": "One transparent checkout with the total shown up front.",
    "pricing.included.noFees.title": "No hidden fees",
    "pricing.included.noFees.body": "The only platform fee is the flat service fee, shown before you pay.",
    "pricing.included.live.title": "Live travel day",
    "pricing.included.live.body": "Live tracking, in-app camera and verified handovers at no extra cost.",

    "pricing.cta.title": "See your price before you commit",
    "pricing.cta.body":
      "Start a booking to get a single transparent total for your airport and dates — no account required to look.",
    "pricing.cta.start": "Start a booking",
    "pricing.cta.how": "How it works",

    // -------------------------------------------------------- Trust & safety
    "trust.hero.badge": "Trust & safety",
    "trust.hero.title": "Safety you can see, data you can trust",
    "trust.hero.subtitle":
      "ParkGo is built on verification, visibility and strict data protection. Here's exactly how we keep travellers and hosts safe — and how we handle your information.",
    "trust.hero.ctaData": "Data & privacy",
    "trust.hero.ctaFaq": "Read the FAQ",

    "trust.pillars.eyebrow": "Safety on both sides",
    "trust.pillars.title": "Verified people and verified moments",
    "trust.pillars.body":
      "Trust isn't a badge — it's a set of checks that happen before, during and after every booking.",

    "trust.pillar.verification.title": "Two-sided verification",
    "trust.pillar.verification.body":
      "Both sides of every booking are verified. Hosts complete identity and address checks; travellers register real accounts; the terminal transfer is handled by a licensed operator.",
    "trust.pillar.idHosts.title": "ID-checked hosts",
    "trust.pillar.idHosts.body":
      "Every host passes a KYC identity check and a right-to-list declaration before a single space goes live.",
    "trust.pillar.operator.title": "Licensed & insured transfer operator",
    "trust.pillar.operator.body":
      "Your terminal transfer is provided by an independent, licensed and insured operator, integrated by API. Their operator, vehicle and driver compliance sits with them; ParkGo keeps the customer-facing trust — live location and a verified handover.",
    "trust.pillar.cctv.title": "CCTV & live camera",
    "trust.pillar.cctv.body":
      "Spaces can include CCTV, and travellers can watch a live in-app camera of their car with a LIVE badge and timestamp.",
    "trust.pillar.handovers.title": "Verified handovers",
    "trust.pillar.handovers.body":
      "Drop-off and collection are each confirmed with a one-time code, creating a timestamped, logged chain of custody.",
    "trust.pillar.scoring.title": "Two-sided trust scoring",
    "trust.pillar.scoring.body":
      "Travellers and hosts rate each other after every trip, and you can rate your transfer too. Scores keep the network honest and high quality.",

    "trust.handover.eyebrow": "The verified handover",
    "trust.handover.title": "A clear, logged chain of custody",
    "trust.handover.body":
      "The handover is the moment that matters most. ParkGo turns it into a confirmed, timestamped event so there's never any doubt about who had the car and when.",
    "trust.handover.codes.title": "One-time codes",
    "trust.handover.codes.body": "A unique code is confirmed by both parties at drop-off and collection.",
    "trust.handover.logged.title": "Timestamped & logged",
    "trust.handover.logged.body": "Each confirmation is recorded with a time, creating an auditable trail.",
    "trust.handover.context.title": "Live context",
    "trust.handover.context.body":
      "Live location and the in-app camera give everyone the same picture in real time.",
    "trust.handover.confirmed": "Handover confirmed",
    "trust.handover.oneTimeCode": "One-time code",
    "trust.handover.byBoth": "Confirmed by both parties · 14:32",
    "trust.handover.step1": "Host confirmed drop-off",
    "trust.handover.step2": "Driver confirmed pick-up",
    "trust.handover.step3": "Event written to audit log",

    "trust.data.eyebrow": "Data protection",
    "trust.data.title": "GDPR and ICO-aligned, by design",
    "trust.data.body":
      "We treat your data as something we look after, not something we own. Our approach is built around UK GDPR principles and ICO guidance.",
    "trust.data.minimal.title": "Minimal data",
    "trust.data.minimal.body":
      "We collect only what a booking genuinely needs — and no more. Data minimisation is the default.",
    "trust.data.lawful.title": "Lawful basis & consent",
    "trust.data.lawful.body":
      "Every use of your data has a lawful basis. Where we rely on consent, it's specific, informed and easy to withdraw.",
    "trust.data.retention.title": "Defined retention",
    "trust.data.retention.body":
      "Personal data is kept only as long as needed, then deleted or anonymised on a defined retention schedule.",
    "trust.data.requests.title": "Data-subject requests",
    "trust.data.requests.body":
      "Access, correct, export or erase your data. We honour data-subject requests in line with UK GDPR.",
    "trust.data.kyc.title": "Separated, encrypted KYC",
    "trust.data.kyc.body":
      "Identity and bank documents are encrypted and stored separately from your everyday profile data.",
    "trust.data.audit.title": "Audit logging",
    "trust.data.audit.body":
      "Sensitive actions are recorded in an audit log so access can be reviewed and accounted for.",
    "trust.data.rls.title": "Least privilege & RLS",
    "trust.data.rls.body":
      "Strict access controls and row-level security mean people and services only ever see what they should.",
    "trust.data.breach.title": "Breach response",
    "trust.data.breach.body":
      "A defined incident process means we contain, assess and notify quickly if anything ever goes wrong.",

    "trust.security.eyebrow": "Under the hood",
    "trust.security.title": "Security baked into the platform",
    "trust.security.body":
      "Good intentions aren't enough — protection has to be engineered in. These are the controls that sit behind every booking.",
    "trust.security.encryption.title": "Encryption of sensitive data",
    "trust.security.encryption.body":
      "Identity and payment-related documents are encrypted at rest and in transit.",
    "trust.security.rls.title": "Least privilege & row-level security",
    "trust.security.rls.body": "Access is restricted to the minimum needed, enforced at the data layer.",
    "trust.security.audit.title": "Audit logging",
    "trust.security.audit.body":
      "Sensitive operations are logged so access can be reviewed and accounted for.",
    "trust.security.breach.title": "Defined breach response",
    "trust.security.breach.body": "A clear incident process to contain, assess and notify without delay.",

    "trust.cta.title": "Have a question about safety or privacy?",
    "trust.cta.body":
      "We're happy to explain anything about how we verify people or handle your data. Get in touch and we'll point you to the detail.",
    "trust.cta.contact": "Contact us",
    "trust.cta.faq": "Read the FAQ",
    "trust.cta.note": "Verification and re-verification run continuously, not just at sign-up.",

    // --------------------------------------------------------------- Contact
    "contact.hero.badge": "Contact us",
    "contact.hero.title": "We'd love to hear from you",
    "contact.hero.subtitle":
      "Travellers, hosts and teams — whatever you need, our support team across the UK & Ireland is here to help.",

    "contact.channels.eyebrow": "Get in touch",
    "contact.channels.title": "Pick the right inbox, or just send us a message",
    "contact.channels.body":
      "ParkGo is building integrated airport access for the UK & Ireland. We aim to reply to every enquiry quickly — choose the team that fits, or use the form and we'll route it for you.",
    "contact.channel.support.title": "Support",
    "contact.channel.support.body": "Questions about a booking, your account or payments.",
    "contact.channel.partnerships.title": "Partnerships",
    "contact.channel.partnerships.body": "Hosting at scale or corporate travel for your team.",
    "contact.channel.press.title": "Press & general",
    "contact.channel.press.body": "Media enquiries and everything else.",

    "contact.teams.text": "Setting up travel for a team?",
    "contact.teams.link": "See corporate accounts",
    "contact.teams.suffix": "for monthly invoicing and priority support.",

    "contact.form.title": "Send us a message",
    "contact.form.subtitle": "Fill in the form and we'll get back to you by email.",
    "contact.form.name": "Name",
    "contact.form.namePh": "Your name",
    "contact.form.email": "Email",
    "contact.form.emailPh": "you@email.com",
    "contact.form.message": "Message",
    "contact.form.messagePh": "How can we help?",
    "contact.form.submit": "Send message",
    "contact.form.sending": "Sending…",
    "contact.form.disclaimer": "We'll only use your details to reply to this enquiry.",
    "contact.form.successTitle": "Message sent",
    "contact.form.successBody":
      "Thanks for getting in touch — we'll reply to your email as soon as we can.",

    "contact.quick.eyebrow": "Before you write",
    "contact.quick.title": "You might find your answer faster here",
    "contact.quick.faq.title": "Read the FAQ",
    "contact.quick.faq.body": "Most questions are answered here.",
    "contact.quick.travellers.title": "For travellers",
    "contact.quick.travellers.body": "How booking and travel day work.",
    "contact.quick.hosts.title": "For hosts",
    "contact.quick.hosts.body": "List a space and start earning.",
    "contact.quick.trust.title": "Trust & safety",
    "contact.quick.trust.body": "How we keep every booking safe.",

    "contact.cta.title": "Ready to park smart and travel easy?",
    "contact.cta.body":
      "Start a booking or explore how ParkGo brings parking, transfers and EV charging into one trusted journey.",
    "contact.cta.start": "Start a booking",
    "contact.cta.how": "How it works",
    "contact.cta.note": "Parking across the UK & Ireland — airports, cities & events.",
  },

  ur: {
    // ---------------------------------------------------------------- Pricing
    "pricing.hero.badge": "ڈیزائن کے لحاظ سے شفاف",
    "pricing.hero.title": "ایک واضح قیمت۔ گیٹ پر کوئی حیرانی نہیں۔",
    "pricing.hero.subtitle":
      "پارک گو پارکنگ، لائسنس یافتہ ٹرانسفر اور ای وی چارجنگ کو ایک ہی قیمت میں جوڑتا ہے، ساتھ میں ایک چھوٹی، واضح طور پر دکھائی گئی سروس فیس۔ میزبان منصفانہ، شفاف شرائط پر کماتے ہیں۔",
    "pricing.hero.ctaStart": "بکنگ شروع کریں",
    "pricing.hero.ctaHow": "بنڈل کیسے جڑتا ہے",

    "pricing.bundle.eyebrow": "بنڈل قیمت",
    "pricing.bundle.title": "چار خدمات، ایک قیمت جو آپ سیکنڈوں میں پڑھ سکتے ہیں",
    "pricing.bundle.body":
      "تین چیک آؤٹ اور ذہنی جمع کے بجائے، پارک گو ادائیگی سے پہلے آپ کو ایک ہی کل رقم دکھاتا ہے۔ ایک اشاراتی بنڈل اس طرح تقسیم ہوتا ہے۔",
    "pricing.bundle.point1": "آپ کے منتخب کردہ تصدیق شدہ میزبان سے فی دن پارکنگ",
    "pricing.bundle.point2": "ایک لائسنس یافتہ ٹرمینل ٹرانسفر، دونوں طرف",
    "pricing.bundle.point3": "اختیاری ای وی چارجنگ جہاں میزبان پیش کرتا ہو",
    "pricing.bundle.point4": "ایک فلیٹ {fee} سروس فیس، ادائیگی سے پہلے دکھائی گئی",

    "pricing.receipt.label": "اشاراتی بنڈل",
    "pricing.receipt.parking": "تصدیق شدہ پارکنگ",
    "pricing.receipt.parkingNote": "ٹرمینل کے قریب میزبان کا ڈرائیو وے",
    "pricing.receipt.transfer": "لائسنس یافتہ ٹرانسفر",
    "pricing.receipt.transferNote": "دونوں طرف، لائسنس یافتہ ڈرائیور",
    "pricing.receipt.ev": "ای وی چارجنگ",
    "pricing.receipt.evNote": "اختیاری ٹاپ اپ",
    "pricing.receipt.fee": "سروس فیس",
    "pricing.receipt.feeNote": "فلیٹ پلیٹ فارم فیس",
    "pricing.receipt.total": "چیک آؤٹ پر ایک قیمت",
    "pricing.receipt.disclaimer":
      "صرف اشاراتی مثال۔ آپ کی قیمت ایئرپورٹ، تاریخوں اور آپ کے منتخب کردہ ایڈ آنز پر منحصر ہے۔",

    "pricing.economics.eyebrow": "بنڈل کیسے جڑتا ہے",
    "pricing.economics.title": "منصفانہ معاشیات، واضح طور پر بیان کردہ",
    "pricing.economics.body":
      "پارک گو پارکنگ پر ایک کمیشن اور ایک چھوٹی فلیٹ سروس فیس لیتا ہے۔ لائسنس یافتہ ٹرانسفر ایک مربوط آپریٹر کے ذریعے شامل ہے۔ ہر کوئی دیکھ سکتا ہے کہ پیسہ کہاں جاتا ہے۔",

    "pricing.econ.hosts.who": "میزبان",
    "pricing.econ.hosts.line": "پارکنگ اور ای وی پر",
    "pricing.econ.hosts.keep": "~{pct}% رکھیں",
    "pricing.econ.hosts.body":
      "کمیشن فی پارکنگ بکنگ پر لیا جاتا ہے؛ ای وی چارجنگ کی آمدنی اسی تقسیم کی پیروی کرتی ہے کیونکہ چارجر کا مالک میزبان ہے۔",
    "pricing.econ.transfer.who": "لائسنس یافتہ ٹرانسفر",
    "pricing.econ.transfer.commission": "شامل",
    "pricing.econ.transfer.line": "آپ کی بنڈل قیمت میں",
    "pricing.econ.transfer.keep": "کوئی پارٹنر آن بورڈنگ نہیں",
    "pricing.econ.transfer.body":
      "ٹرمینل ٹرانسفر ایک آزاد، لائسنس یافتہ اور بیمہ شدہ آپریٹر فراہم کرتا ہے، جو API کے ذریعے پارک گو سے مربوط ہے۔ آن بورڈ کرنے کے لیے کوئی فلیٹ نہیں — یہ محض آپ کی ایک قیمت میں شامل ہے۔",
    "pricing.econ.fee.who": "سروس فیس",
    "pricing.econ.fee.line": "فلیٹ، فی بکنگ",
    "pricing.econ.fee.keep": "چیک آؤٹ پر دکھائی گئی",
    "pricing.econ.fee.body":
      "ایک چھوٹی فلیٹ پلیٹ فارم فیس جو فی بکنگ ایک بار شامل کی جاتی ہے۔ یہ کبھی چھپائی نہیں جاتی — مسافر ادائیگی سے پہلے اسے دیکھتے ہیں۔",

    "pricing.econ.ctaHost": "میزبان کے طور پر کمائیں",
    "pricing.econ.ctaTransfer": "ٹرانسفر کیسے کام کرتا ہے",
    "pricing.econ.note": "پارکنگ پر ~{pct}% کا اشاراتی کمیشن۔ شرحیں لانچ پر طے کی جائیں گی۔",

    "pricing.more.eyebrow": "بچت کے مزید طریقے",
    "pricing.more.title": "ٹیموں اور اشتراک کے لیے بنایا گیا",

    "pricing.corporate.title": "کارپوریٹ اکاؤنٹس",
    "pricing.corporate.body":
      "اپنی ٹیم کے سفر کو ایک اکاؤنٹ، مجموعی بلنگ اور ترجیحی مدد کے ساتھ مرکزی بنائیں۔",
    "pricing.corporate.point1": "فی سفر کارڈز کے بجائے ماہانہ انوائسنگ",
    "pricing.corporate.point2": "آپ کے مسافروں میں مرکزی بکنگز",
    "pricing.corporate.point3": "وقت کے لحاظ سے اہم سفروں کے لیے ترجیحی مدد",
    "pricing.corporate.point4": "آسان اخراجات کے لیے واضح گوشوارے",
    "pricing.corporate.cta": "ٹیموں کے بارے میں ہم سے بات کریں",

    "pricing.referral.title": "ریفرل پروگرام",
    "pricing.referral.body":
      "پارک گو پسند ہے؟ اسے شیئر کریں۔ جب کوئی دوست اپنا پہلا سفر کرتا ہے، تو آپ دونوں کو انعام ملتا ہے۔",
    "pricing.referral.point1": "اپنا ذاتی ریفرل لنک شیئر کریں",
    "pricing.referral.point2": "آپ کے دوست کو خوش آمدید انعام ملتا ہے",
    "pricing.referral.point3": "ان کے پہلے مکمل سفر کے بعد آپ کو انعام ملتا ہے",
    "pricing.referral.point4": "جتنے چاہیں لوگوں کو ریفر کریں",
    "pricing.referral.cta": "سفر شروع کریں",

    "pricing.included.eyebrow": "ہر بکنگ میں شامل",
    "pricing.included.title": "قیمت میں ہمیشہ اہم حصے شامل ہوتے ہیں",
    "pricing.included.verified.title": "تصدیق شدہ لوگ",
    "pricing.included.verified.body": "شناختی جانچ شدہ میزبان اور لائسنس یافتہ، بیمہ شدہ ڈرائیور — ہمیشہ۔",
    "pricing.included.secure.title": "محفوظ ادائیگی",
    "pricing.included.secure.body": "ایک شفاف چیک آؤٹ جس میں کل رقم پہلے سے دکھائی جاتی ہے۔",
    "pricing.included.noFees.title": "کوئی چھپی ہوئی فیس نہیں",
    "pricing.included.noFees.body": "واحد پلیٹ فارم فیس فلیٹ سروس فیس ہے، جو ادائیگی سے پہلے دکھائی جاتی ہے۔",
    "pricing.included.live.title": "سفر کا دن لائیو",
    "pricing.included.live.body": "لائیو ٹریکنگ، ایپ میں کیمرہ اور تصدیق شدہ ہینڈ اوور بغیر کسی اضافی لاگت کے۔",

    "pricing.cta.title": "عہد سے پہلے اپنی قیمت دیکھیں",
    "pricing.cta.body":
      "اپنے ایئرپورٹ اور تاریخوں کے لیے ایک شفاف کل رقم حاصل کرنے کے لیے بکنگ شروع کریں — دیکھنے کے لیے کسی اکاؤنٹ کی ضرورت نہیں۔",
    "pricing.cta.start": "بکنگ شروع کریں",
    "pricing.cta.how": "یہ کیسے کام کرتا ہے",

    // -------------------------------------------------------- Trust & safety
    "trust.hero.badge": "اعتماد اور حفاظت",
    "trust.hero.title": "حفاظت جو آپ دیکھ سکیں، ڈیٹا جس پر آپ بھروسہ کر سکیں",
    "trust.hero.subtitle":
      "پارک گو تصدیق، شفافیت اور سخت ڈیٹا تحفظ پر بنایا گیا ہے۔ یہاں بالکل واضح ہے کہ ہم مسافروں اور میزبانوں کو کیسے محفوظ رکھتے ہیں — اور ہم آپ کی معلومات کو کیسے سنبھالتے ہیں۔",
    "trust.hero.ctaData": "ڈیٹا اور رازداری",
    "trust.hero.ctaFaq": "عمومی سوالات پڑھیں",

    "trust.pillars.eyebrow": "دونوں طرف حفاظت",
    "trust.pillars.title": "تصدیق شدہ لوگ اور تصدیق شدہ لمحات",
    "trust.pillars.body":
      "اعتماد کوئی بیج نہیں ہے — یہ جانچوں کا ایک سلسلہ ہے جو ہر بکنگ سے پہلے، دوران اور بعد میں ہوتی ہیں۔",

    "trust.pillar.verification.title": "دو طرفہ تصدیق",
    "trust.pillar.verification.body":
      "ہر بکنگ کے دونوں فریق تصدیق شدہ ہوتے ہیں۔ میزبان شناخت اور پتے کی جانچ مکمل کرتے ہیں؛ مسافر حقیقی اکاؤنٹس رجسٹر کرتے ہیں؛ ٹرمینل ٹرانسفر ایک لائسنس یافتہ آپریٹر سنبھالتا ہے۔",
    "trust.pillar.idHosts.title": "شناختی جانچ شدہ میزبان",
    "trust.pillar.idHosts.body":
      "ہر میزبان ایک KYC شناختی جانچ اور رائٹ ٹو لسٹ اعلامیہ پاس کرتا ہے اس سے پہلے کہ کوئی ایک جگہ بھی لائیو ہو۔",
    "trust.pillar.operator.title": "لائسنس یافتہ اور بیمہ شدہ ٹرانسفر آپریٹر",
    "trust.pillar.operator.body":
      "آپ کا ٹرمینل ٹرانسفر ایک آزاد، لائسنس یافتہ اور بیمہ شدہ آپریٹر فراہم کرتا ہے، جو API کے ذریعے مربوط ہے۔ ان کے آپریٹر، گاڑی اور ڈرائیور کی تعمیل ان کی ذمہ داری ہے؛ پارک گو صارف کا سامنا کرنے والا اعتماد برقرار رکھتا ہے — لائیو مقام اور ایک تصدیق شدہ ہینڈ اوور۔",
    "trust.pillar.cctv.title": "سی سی ٹی وی اور لائیو کیمرہ",
    "trust.pillar.cctv.body":
      "جگہوں میں سی سی ٹی وی شامل ہو سکتا ہے، اور مسافر LIVE بیج اور ٹائم اسٹیمپ کے ساتھ اپنی گاڑی کا ایپ میں لائیو کیمرہ دیکھ سکتے ہیں۔",
    "trust.pillar.handovers.title": "تصدیق شدہ ہینڈ اوور",
    "trust.pillar.handovers.body":
      "ڈراپ آف اور وصولی دونوں کی ایک بار استعمال ہونے والے کوڈ سے تصدیق کی جاتی ہے، جو ایک ٹائم اسٹیمپ شدہ، لاگ شدہ کسٹڈی چین بناتا ہے۔",
    "trust.pillar.scoring.title": "دو طرفہ اعتماد اسکورنگ",
    "trust.pillar.scoring.body":
      "مسافر اور میزبان ہر سفر کے بعد ایک دوسرے کو ریٹ کرتے ہیں، اور آپ اپنے ٹرانسفر کو بھی ریٹ کر سکتے ہیں۔ اسکور نیٹ ورک کو ایماندار اور اعلیٰ معیار کا رکھتے ہیں۔",

    "trust.handover.eyebrow": "تصدیق شدہ ہینڈ اوور",
    "trust.handover.title": "ایک واضح، لاگ شدہ کسٹڈی چین",
    "trust.handover.body":
      "ہینڈ اوور سب سے اہم لمحہ ہے۔ پارک گو اسے ایک تصدیق شدہ، ٹائم اسٹیمپ شدہ واقعے میں بدل دیتا ہے تاکہ کبھی کوئی شک نہ رہے کہ گاڑی کس کے پاس تھی اور کب۔",
    "trust.handover.codes.title": "ایک بار استعمال ہونے والے کوڈ",
    "trust.handover.codes.body": "ایک منفرد کوڈ کی ڈراپ آف اور وصولی پر دونوں فریق تصدیق کرتے ہیں۔",
    "trust.handover.logged.title": "ٹائم اسٹیمپ شدہ اور لاگ شدہ",
    "trust.handover.logged.body": "ہر تصدیق وقت کے ساتھ ریکارڈ کی جاتی ہے، جو ایک آڈٹ کے قابل ٹریل بناتی ہے۔",
    "trust.handover.context.title": "لائیو سیاق و سباق",
    "trust.handover.context.body":
      "لائیو مقام اور ایپ میں کیمرہ سب کو حقیقی وقت میں ایک ہی تصویر دیتے ہیں۔",
    "trust.handover.confirmed": "ہینڈ اوور کی تصدیق ہو گئی",
    "trust.handover.oneTimeCode": "ایک بار استعمال ہونے والا کوڈ",
    "trust.handover.byBoth": "دونوں فریق نے تصدیق کی · 14:32",
    "trust.handover.step1": "میزبان نے ڈراپ آف کی تصدیق کی",
    "trust.handover.step2": "ڈرائیور نے پک اپ کی تصدیق کی",
    "trust.handover.step3": "واقعہ آڈٹ لاگ میں درج ہو گیا",

    "trust.data.eyebrow": "ڈیٹا کا تحفظ",
    "trust.data.title": "ڈیزائن کے لحاظ سے GDPR اور ICO کے مطابق",
    "trust.data.body":
      "ہم آپ کے ڈیٹا کو ایسی چیز سمجھتے ہیں جس کی ہم دیکھ بھال کرتے ہیں، نہ کہ ایسی چیز جس کے ہم مالک ہیں۔ ہمارا طریقہ کار UK GDPR اصولوں اور ICO رہنمائی کے گرد بنایا گیا ہے۔",
    "trust.data.minimal.title": "کم سے کم ڈیٹا",
    "trust.data.minimal.body":
      "ہم صرف وہی جمع کرتے ہیں جس کی بکنگ کو واقعی ضرورت ہو — اور اس سے زیادہ نہیں۔ ڈیٹا کو کم سے کم رکھنا ہماری بنیادی حکمت عملی ہے۔",
    "trust.data.lawful.title": "قانونی بنیاد اور رضامندی",
    "trust.data.lawful.body":
      "آپ کے ڈیٹا کے ہر استعمال کی ایک قانونی بنیاد ہے۔ جہاں ہم رضامندی پر انحصار کرتے ہیں، وہ مخصوص، باخبر اور واپس لینے میں آسان ہوتی ہے۔",
    "trust.data.retention.title": "متعین برقراری",
    "trust.data.retention.body":
      "ذاتی ڈیٹا صرف اتنے عرصے تک رکھا جاتا ہے جتنا ضروری ہو، پھر ایک متعین برقراری شیڈول پر حذف یا گمنام کر دیا جاتا ہے۔",
    "trust.data.requests.title": "ڈیٹا سبجیکٹ درخواستیں",
    "trust.data.requests.body":
      "اپنے ڈیٹا تک رسائی، اسے درست، برآمد یا حذف کریں۔ ہم UK GDPR کے مطابق ڈیٹا سبجیکٹ درخواستوں کا احترام کرتے ہیں۔",
    "trust.data.kyc.title": "علیحدہ، خفیہ کردہ KYC",
    "trust.data.kyc.body":
      "شناخت اور بینک دستاویزات خفیہ کی جاتی ہیں اور آپ کے روزمرہ پروفائل ڈیٹا سے علیحدہ محفوظ کی جاتی ہیں۔",
    "trust.data.audit.title": "آڈٹ لاگنگ",
    "trust.data.audit.body":
      "حساس اقدامات آڈٹ لاگ میں درج کیے جاتے ہیں تاکہ رسائی کا جائزہ لیا جا سکے اور اس کا حساب رکھا جا سکے۔",
    "trust.data.rls.title": "کم سے کم اختیار اور RLS",
    "trust.data.rls.body":
      "سخت رسائی کنٹرول اور رو لیول سیکیورٹی کا مطلب ہے کہ لوگ اور خدمات صرف وہی دیکھتے ہیں جو انہیں دیکھنا چاہیے۔",
    "trust.data.breach.title": "خلاف ورزی کا جواب",
    "trust.data.breach.body":
      "ایک متعین واقعاتی عمل کا مطلب ہے کہ اگر کبھی کچھ غلط ہو جائے تو ہم جلدی سے قابو، جائزہ اور اطلاع دیتے ہیں۔",

    "trust.security.eyebrow": "پردے کے پیچھے",
    "trust.security.title": "پلیٹ فارم میں شامل حفاظت",
    "trust.security.body":
      "اچھے ارادے کافی نہیں ہیں — تحفظ کو انجینئر کرنا پڑتا ہے۔ یہ وہ کنٹرول ہیں جو ہر بکنگ کے پیچھے بیٹھتے ہیں۔",
    "trust.security.encryption.title": "حساس ڈیٹا کی خفیہ کاری",
    "trust.security.encryption.body":
      "شناخت اور ادائیگی سے متعلق دستاویزات آرام اور منتقلی دونوں میں خفیہ کی جاتی ہیں۔",
    "trust.security.rls.title": "کم سے کم اختیار اور رو لیول سیکیورٹی",
    "trust.security.rls.body": "رسائی کم سے کم ضروری تک محدود ہے، جو ڈیٹا کی سطح پر نافذ کی جاتی ہے۔",
    "trust.security.audit.title": "آڈٹ لاگنگ",
    "trust.security.audit.body":
      "حساس آپریشنز لاگ کیے جاتے ہیں تاکہ رسائی کا جائزہ لیا جا سکے اور اس کا حساب رکھا جا سکے۔",
    "trust.security.breach.title": "متعین خلاف ورزی کا جواب",
    "trust.security.breach.body": "قابو، جائزہ اور بلا تاخیر اطلاع دینے کے لیے ایک واضح واقعاتی عمل۔",

    "trust.cta.title": "حفاظت یا رازداری کے بارے میں کوئی سوال ہے؟",
    "trust.cta.body":
      "ہم خوشی سے وضاحت کریں گے کہ ہم لوگوں کی تصدیق کیسے کرتے ہیں یا آپ کے ڈیٹا کو کیسے سنبھالتے ہیں۔ رابطہ کریں اور ہم آپ کو تفصیل کی طرف رہنمائی کریں گے۔",
    "trust.cta.contact": "ہم سے رابطہ کریں",
    "trust.cta.faq": "عمومی سوالات پڑھیں",
    "trust.cta.note": "تصدیق اور دوبارہ تصدیق مسلسل چلتی ہے، صرف سائن اپ پر نہیں۔",

    // --------------------------------------------------------------- Contact
    "contact.hero.badge": "ہم سے رابطہ کریں",
    "contact.hero.title": "ہم آپ سے سننا پسند کریں گے",
    "contact.hero.subtitle":
      "مسافر، میزبان اور ٹیمیں — آپ کو جو بھی درکار ہو، برطانیہ اور آئرلینڈ بھر میں ہماری سپورٹ ٹیم مدد کے لیے حاضر ہے۔",

    "contact.channels.eyebrow": "رابطہ کریں",
    "contact.channels.title": "صحیح ان باکس منتخب کریں، یا بس ہمیں پیغام بھیجیں",
    "contact.channels.body":
      "پارک گو برطانیہ اور آئرلینڈ کے لیے مربوط ایئرپورٹ رسائی بنا رہا ہے۔ ہم ہر استفسار کا جلد جواب دینے کا ارادہ رکھتے ہیں — موزوں ٹیم منتخب کریں، یا فارم استعمال کریں اور ہم اسے آپ کے لیے بھیج دیں گے۔",
    "contact.channel.support.title": "سپورٹ",
    "contact.channel.support.body": "بکنگ، آپ کے اکاؤنٹ یا ادائیگیوں کے بارے میں سوالات۔",
    "contact.channel.partnerships.title": "شراکت داریاں",
    "contact.channel.partnerships.body": "بڑے پیمانے پر میزبانی یا آپ کی ٹیم کے لیے کارپوریٹ سفر۔",
    "contact.channel.press.title": "پریس اور عمومی",
    "contact.channel.press.body": "میڈیا استفسارات اور باقی سب کچھ۔",

    "contact.teams.text": "کسی ٹیم کے لیے سفر ترتیب دے رہے ہیں؟",
    "contact.teams.link": "کارپوریٹ اکاؤنٹس دیکھیں",
    "contact.teams.suffix": "ماہانہ انوائسنگ اور ترجیحی مدد کے لیے۔",

    "contact.form.title": "ہمیں پیغام بھیجیں",
    "contact.form.subtitle": "فارم بھریں اور ہم آپ کو ای میل کے ذریعے جواب دیں گے۔",
    "contact.form.name": "نام",
    "contact.form.namePh": "آپ کا نام",
    "contact.form.email": "ای میل",
    "contact.form.emailPh": "you@email.com",
    "contact.form.message": "پیغام",
    "contact.form.messagePh": "ہم کیسے مدد کر سکتے ہیں؟",
    "contact.form.submit": "پیغام بھیجیں",
    "contact.form.sending": "بھیجا جا رہا ہے…",
    "contact.form.disclaimer": "ہم آپ کی تفصیلات صرف اس استفسار کا جواب دینے کے لیے استعمال کریں گے۔",
    "contact.form.successTitle": "پیغام بھیج دیا گیا",
    "contact.form.successBody":
      "رابطہ کرنے کا شکریہ — ہم جلد از جلد آپ کے ای میل کا جواب دیں گے۔",

    "contact.quick.eyebrow": "لکھنے سے پہلے",
    "contact.quick.title": "شاید آپ کو اپنا جواب یہاں تیزی سے مل جائے",
    "contact.quick.faq.title": "عمومی سوالات پڑھیں",
    "contact.quick.faq.body": "زیادہ تر سوالات کا جواب یہاں ہے۔",
    "contact.quick.travellers.title": "مسافروں کے لیے",
    "contact.quick.travellers.body": "بکنگ اور سفر کا دن کیسے کام کرتا ہے۔",
    "contact.quick.hosts.title": "میزبانوں کے لیے",
    "contact.quick.hosts.body": "ایک جگہ درج کریں اور کمانا شروع کریں۔",
    "contact.quick.trust.title": "اعتماد اور حفاظت",
    "contact.quick.trust.body": "ہم ہر بکنگ کو کیسے محفوظ رکھتے ہیں۔",

    "contact.cta.title": "ہوشیاری سے پارک کرنے اور آسانی سے سفر کرنے کے لیے تیار ہیں؟",
    "contact.cta.body":
      "بکنگ شروع کریں یا دریافت کریں کہ پارک گو پارکنگ، ٹرانسفر اور ای وی چارجنگ کو ایک قابل اعتماد سفر میں کیسے جوڑتا ہے۔",
    "contact.cta.start": "بکنگ شروع کریں",
    "contact.cta.how": "یہ کیسے کام کرتا ہے",
    "contact.cta.note": "برطانیہ اور آئرلینڈ بھر میں پارکنگ — ہوائی اڈے، شہر اور ایونٹس۔",
  },

  hi: {
    // ---------------------------------------------------------------- Pricing
    "pricing.hero.badge": "डिज़ाइन से पारदर्शी",
    "pricing.hero.title": "एक स्पष्ट कीमत। गेट पर कोई आश्चर्य नहीं।",
    "pricing.hero.subtitle":
      "ParkGo पार्किंग, एक लाइसेंस प्राप्त ट्रांसफर और ईवी चार्जिंग को एक ही कीमत में जोड़ता है, साथ में एक छोटा, स्पष्ट रूप से दिखाया गया सेवा शुल्क। होस्ट निष्पक्ष, पारदर्शी शर्तों पर कमाते हैं।",
    "pricing.hero.ctaStart": "बुकिंग शुरू करें",
    "pricing.hero.ctaHow": "बंडल कैसे जुड़ता है",

    "pricing.bundle.eyebrow": "बंडल कीमत",
    "pricing.bundle.title": "चार सेवाएँ, एक कीमत जिसे आप सेकंडों में पढ़ सकते हैं",
    "pricing.bundle.body":
      "तीन चेकआउट और मानसिक जोड़ के बजाय, ParkGo भुगतान से पहले आपको एक ही कुल दिखाता है। एक सांकेतिक बंडल इस तरह विभाजित होता है।",
    "pricing.bundle.point1": "आपके चुने हुए सत्यापित होस्ट से प्रति दिन पार्किंग",
    "pricing.bundle.point2": "एक लाइसेंस प्राप्त टर्मिनल ट्रांसफर, दोनों तरफ",
    "pricing.bundle.point3": "वैकल्पिक ईवी चार्जिंग जहाँ होस्ट प्रदान करता हो",
    "pricing.bundle.point4": "एक फ्लैट {fee} सेवा शुल्क, भुगतान से पहले दिखाया गया",

    "pricing.receipt.label": "सांकेतिक बंडल",
    "pricing.receipt.parking": "सत्यापित पार्किंग",
    "pricing.receipt.parkingNote": "टर्मिनल के पास होस्ट का ड्राइववे",
    "pricing.receipt.transfer": "लाइसेंस प्राप्त ट्रांसफर",
    "pricing.receipt.transferNote": "दोनों तरफ, लाइसेंस प्राप्त ड्राइवर",
    "pricing.receipt.ev": "ईवी चार्जिंग",
    "pricing.receipt.evNote": "वैकल्पिक टॉप-अप",
    "pricing.receipt.fee": "सेवा शुल्क",
    "pricing.receipt.feeNote": "फ्लैट प्लेटफ़ॉर्म शुल्क",
    "pricing.receipt.total": "चेकआउट पर एक कीमत",
    "pricing.receipt.disclaimer":
      "केवल सांकेतिक उदाहरण। आपकी कीमत एयरपोर्ट, तारीखों और आपके चुने हुए ऐड-ऑन पर निर्भर करती है।",

    "pricing.economics.eyebrow": "बंडल कैसे जुड़ता है",
    "pricing.economics.title": "निष्पक्ष अर्थशास्त्र, स्पष्ट रूप से समझाया गया",
    "pricing.economics.body":
      "ParkGo पार्किंग पर एक कमीशन और एक छोटा फ्लैट सेवा शुल्क लेता है। लाइसेंस प्राप्त ट्रांसफर एक एकीकृत ऑपरेटर के माध्यम से शामिल है। हर कोई देख सकता है कि पैसा कहाँ जाता है।",

    "pricing.econ.hosts.who": "होस्ट",
    "pricing.econ.hosts.line": "पार्किंग और ईवी पर",
    "pricing.econ.hosts.keep": "~{pct}% रखें",
    "pricing.econ.hosts.body":
      "कमीशन प्रति पार्किंग बुकिंग पर लिया जाता है; ईवी चार्जिंग राजस्व उसी विभाजन का पालन करता है क्योंकि चार्जर का मालिक होस्ट है।",
    "pricing.econ.transfer.who": "लाइसेंस प्राप्त ट्रांसफर",
    "pricing.econ.transfer.commission": "शामिल",
    "pricing.econ.transfer.line": "आपकी बंडल कीमत में",
    "pricing.econ.transfer.keep": "कोई पार्टनर ऑनबोर्डिंग नहीं",
    "pricing.econ.transfer.body":
      "टर्मिनल ट्रांसफर एक स्वतंत्र, लाइसेंस प्राप्त और बीमित ऑपरेटर द्वारा प्रदान किया जाता है, जो API द्वारा ParkGo से एकीकृत है। ऑनबोर्ड करने के लिए कोई फ्लीट नहीं — इसे बस आपकी एक कीमत में जोड़ दिया जाता है।",
    "pricing.econ.fee.who": "सेवा शुल्क",
    "pricing.econ.fee.line": "फ्लैट, प्रति बुकिंग",
    "pricing.econ.fee.keep": "चेकआउट पर दिखाया गया",
    "pricing.econ.fee.body":
      "एक छोटा फ्लैट प्लेटफ़ॉर्म शुल्क जो प्रति बुकिंग एक बार जोड़ा जाता है। यह कभी छिपाया नहीं जाता — यात्री भुगतान से पहले इसे देखते हैं।",

    "pricing.econ.ctaHost": "होस्ट के रूप में कमाएँ",
    "pricing.econ.ctaTransfer": "ट्रांसफर कैसे काम करता है",
    "pricing.econ.note": "पार्किंग पर ~{pct}% का सांकेतिक कमीशन। दरें लॉन्च पर तय की जाएँगी।",

    "pricing.more.eyebrow": "बचत के और तरीके",
    "pricing.more.title": "टीमों और साझा करने के लिए बनाया गया",

    "pricing.corporate.title": "कॉर्पोरेट खाते",
    "pricing.corporate.body":
      "अपनी टीम की यात्रा को एक खाते, समेकित बिलिंग और प्राथमिकता समर्थन के साथ केंद्रीकृत करें।",
    "pricing.corporate.point1": "प्रति-यात्रा कार्ड के बजाय मासिक इनवॉइसिंग",
    "pricing.corporate.point2": "आपके यात्रियों में केंद्रीकृत बुकिंग",
    "pricing.corporate.point3": "समय-महत्वपूर्ण यात्राओं के लिए प्राथमिकता समर्थन",
    "pricing.corporate.point4": "आसान खर्च के लिए स्पष्ट विवरण",
    "pricing.corporate.cta": "टीमों के बारे में हमसे बात करें",

    "pricing.referral.title": "रेफरल कार्यक्रम",
    "pricing.referral.body":
      "ParkGo पसंद है? इसे साझा करें। जब कोई मित्र अपनी पहली यात्रा करता है, तो आप दोनों को पुरस्कृत किया जाता है।",
    "pricing.referral.point1": "अपना व्यक्तिगत रेफरल लिंक साझा करें",
    "pricing.referral.point2": "आपके मित्र को एक स्वागत पुरस्कार मिलता है",
    "pricing.referral.point3": "उनकी पहली पूर्ण यात्रा के बाद आपको पुरस्कृत किया जाता है",
    "pricing.referral.point4": "जितने चाहें उतने लोगों को रेफर करें",
    "pricing.referral.cta": "यात्रा शुरू करें",

    "pricing.included.eyebrow": "हर बुकिंग में शामिल",
    "pricing.included.title": "कीमत में हमेशा महत्वपूर्ण भाग शामिल होते हैं",
    "pricing.included.verified.title": "सत्यापित लोग",
    "pricing.included.verified.body": "आईडी-जांचे होस्ट और लाइसेंस प्राप्त, बीमित ड्राइवर — हमेशा।",
    "pricing.included.secure.title": "सुरक्षित भुगतान",
    "pricing.included.secure.body": "एक पारदर्शी चेकआउट जिसमें कुल राशि पहले से दिखाई जाती है।",
    "pricing.included.noFees.title": "कोई छिपा शुल्क नहीं",
    "pricing.included.noFees.body": "एकमात्र प्लेटफ़ॉर्म शुल्क फ्लैट सेवा शुल्क है, जो भुगतान से पहले दिखाया जाता है।",
    "pricing.included.live.title": "यात्रा का दिन लाइव",
    "pricing.included.live.body": "लाइव ट्रैकिंग, ऐप में कैमरा और सत्यापित हैंडओवर बिना किसी अतिरिक्त लागत के।",

    "pricing.cta.title": "प्रतिबद्ध होने से पहले अपनी कीमत देखें",
    "pricing.cta.body":
      "अपने एयरपोर्ट और तारीखों के लिए एक पारदर्शी कुल पाने के लिए बुकिंग शुरू करें — देखने के लिए किसी खाते की आवश्यकता नहीं।",
    "pricing.cta.start": "बुकिंग शुरू करें",
    "pricing.cta.how": "यह कैसे काम करता है",

    // -------------------------------------------------------- Trust & safety
    "trust.hero.badge": "भरोसा और सुरक्षा",
    "trust.hero.title": "सुरक्षा जो आप देख सकें, डेटा जिस पर आप भरोसा कर सकें",
    "trust.hero.subtitle":
      "ParkGo सत्यापन, दृश्यता और सख्त डेटा सुरक्षा पर बना है। यहाँ बिल्कुल स्पष्ट है कि हम यात्रियों और होस्ट को कैसे सुरक्षित रखते हैं — और हम आपकी जानकारी को कैसे संभालते हैं।",
    "trust.hero.ctaData": "डेटा और गोपनीयता",
    "trust.hero.ctaFaq": "सामान्य प्रश्न पढ़ें",

    "trust.pillars.eyebrow": "दोनों तरफ सुरक्षा",
    "trust.pillars.title": "सत्यापित लोग और सत्यापित पल",
    "trust.pillars.body":
      "भरोसा कोई बैज नहीं है — यह जाँचों का एक सेट है जो हर बुकिंग से पहले, दौरान और बाद में होती हैं।",

    "trust.pillar.verification.title": "दो-तरफा सत्यापन",
    "trust.pillar.verification.body":
      "हर बुकिंग के दोनों पक्ष सत्यापित होते हैं। होस्ट पहचान और पते की जाँच पूरी करते हैं; यात्री वास्तविक खाते पंजीकृत करते हैं; टर्मिनल ट्रांसफर एक लाइसेंस प्राप्त ऑपरेटर संभालता है।",
    "trust.pillar.idHosts.title": "आईडी-जांचे होस्ट",
    "trust.pillar.idHosts.body":
      "हर होस्ट एक KYC पहचान जाँच और राइट-टू-लिस्ट घोषणा पास करता है, इससे पहले कि कोई एक स्थान भी लाइव हो।",
    "trust.pillar.operator.title": "लाइसेंस प्राप्त और बीमित ट्रांसफर ऑपरेटर",
    "trust.pillar.operator.body":
      "आपका टर्मिनल ट्रांसफर एक स्वतंत्र, लाइसेंस प्राप्त और बीमित ऑपरेटर द्वारा प्रदान किया जाता है, जो API द्वारा एकीकृत है। उनके ऑपरेटर, वाहन और ड्राइवर की अनुपालना उनके पास रहती है; ParkGo ग्राहक-सामने वाला भरोसा बनाए रखता है — लाइव स्थान और एक सत्यापित हैंडओवर।",
    "trust.pillar.cctv.title": "सीसीटीवी और लाइव कैमरा",
    "trust.pillar.cctv.body":
      "स्थानों में सीसीटीवी शामिल हो सकता है, और यात्री LIVE बैज और टाइमस्टैम्प के साथ अपनी कार का ऐप में लाइव कैमरा देख सकते हैं।",
    "trust.pillar.handovers.title": "सत्यापित हैंडओवर",
    "trust.pillar.handovers.body":
      "ड्रॉप-ऑफ और संग्रह दोनों की एक बार उपयोग होने वाले कोड से पुष्टि की जाती है, जो एक टाइमस्टैम्प्ड, लॉग की गई कस्टडी शृंखला बनाता है।",
    "trust.pillar.scoring.title": "दो-तरफा भरोसा स्कोरिंग",
    "trust.pillar.scoring.body":
      "यात्री और होस्ट हर यात्रा के बाद एक-दूसरे को रेट करते हैं, और आप अपने ट्रांसफर को भी रेट कर सकते हैं। स्कोर नेटवर्क को ईमानदार और उच्च गुणवत्ता वाला रखते हैं।",

    "trust.handover.eyebrow": "सत्यापित हैंडओवर",
    "trust.handover.title": "एक स्पष्ट, लॉग की गई कस्टडी शृंखला",
    "trust.handover.body":
      "हैंडओवर वह पल है जो सबसे अधिक मायने रखता है। ParkGo इसे एक पुष्ट, टाइमस्टैम्प्ड घटना में बदल देता है ताकि कभी कोई संदेह न रहे कि कार किसके पास थी और कब।",
    "trust.handover.codes.title": "एक बार उपयोग होने वाले कोड",
    "trust.handover.codes.body": "एक अद्वितीय कोड की ड्रॉप-ऑफ और संग्रह पर दोनों पक्षों द्वारा पुष्टि की जाती है।",
    "trust.handover.logged.title": "टाइमस्टैम्प्ड और लॉग किया गया",
    "trust.handover.logged.body": "हर पुष्टि एक समय के साथ दर्ज की जाती है, जो एक ऑडिट-योग्य ट्रेल बनाती है।",
    "trust.handover.context.title": "लाइव संदर्भ",
    "trust.handover.context.body":
      "लाइव स्थान और ऐप में कैमरा सभी को वास्तविक समय में एक ही तस्वीर देते हैं।",
    "trust.handover.confirmed": "हैंडओवर पुष्ट",
    "trust.handover.oneTimeCode": "एक बार उपयोग होने वाला कोड",
    "trust.handover.byBoth": "दोनों पक्षों द्वारा पुष्ट · 14:32",
    "trust.handover.step1": "होस्ट ने ड्रॉप-ऑफ की पुष्टि की",
    "trust.handover.step2": "ड्राइवर ने पिक-अप की पुष्टि की",
    "trust.handover.step3": "घटना ऑडिट लॉग में लिखी गई",

    "trust.data.eyebrow": "डेटा सुरक्षा",
    "trust.data.title": "डिज़ाइन से GDPR और ICO के अनुरूप",
    "trust.data.body":
      "हम आपके डेटा को ऐसी चीज़ मानते हैं जिसकी हम देखभाल करते हैं, न कि ऐसी चीज़ जिसके हम मालिक हैं। हमारा दृष्टिकोण UK GDPR सिद्धांतों और ICO मार्गदर्शन के इर्द-गिर्द बना है।",
    "trust.data.minimal.title": "न्यूनतम डेटा",
    "trust.data.minimal.body":
      "हम केवल वही एकत्र करते हैं जिसकी बुकिंग को वास्तव में आवश्यकता होती है — और इससे अधिक नहीं। डेटा न्यूनीकरण डिफ़ॉल्ट है।",
    "trust.data.lawful.title": "कानूनी आधार और सहमति",
    "trust.data.lawful.body":
      "आपके डेटा के हर उपयोग का एक कानूनी आधार है। जहाँ हम सहमति पर निर्भर करते हैं, वह विशिष्ट, सूचित और वापस लेने में आसान होती है।",
    "trust.data.retention.title": "निर्धारित प्रतिधारण",
    "trust.data.retention.body":
      "व्यक्तिगत डेटा केवल आवश्यकता तक रखा जाता है, फिर एक निर्धारित प्रतिधारण अनुसूची पर हटा या अनाम कर दिया जाता है।",
    "trust.data.requests.title": "डेटा-विषय अनुरोध",
    "trust.data.requests.body":
      "अपने डेटा तक पहुँचें, उसे सही करें, निर्यात करें या मिटाएँ। हम UK GDPR के अनुरूप डेटा-विषय अनुरोधों का सम्मान करते हैं।",
    "trust.data.kyc.title": "अलग, एन्क्रिप्टेड KYC",
    "trust.data.kyc.body":
      "पहचान और बैंक दस्तावेज़ एन्क्रिप्ट किए जाते हैं और आपके रोज़मर्रा के प्रोफ़ाइल डेटा से अलग संग्रहीत किए जाते हैं।",
    "trust.data.audit.title": "ऑडिट लॉगिंग",
    "trust.data.audit.body":
      "संवेदनशील कार्य एक ऑडिट लॉग में दर्ज किए जाते हैं ताकि पहुँच की समीक्षा और हिसाब रखा जा सके।",
    "trust.data.rls.title": "न्यूनतम विशेषाधिकार और RLS",
    "trust.data.rls.body":
      "सख्त पहुँच नियंत्रण और रो-लेवल सुरक्षा का मतलब है कि लोग और सेवाएँ केवल वही देखते हैं जो उन्हें देखना चाहिए।",
    "trust.data.breach.title": "उल्लंघन प्रतिक्रिया",
    "trust.data.breach.body":
      "एक निर्धारित घटना प्रक्रिया का मतलब है कि अगर कभी कुछ गलत हो जाए तो हम जल्दी से नियंत्रित, आकलन और सूचित करते हैं।",

    "trust.security.eyebrow": "पर्दे के पीछे",
    "trust.security.title": "प्लेटफ़ॉर्म में शामिल सुरक्षा",
    "trust.security.body":
      "अच्छे इरादे काफी नहीं हैं — सुरक्षा को इंजीनियर करना पड़ता है। ये वे नियंत्रण हैं जो हर बुकिंग के पीछे बैठते हैं।",
    "trust.security.encryption.title": "संवेदनशील डेटा का एन्क्रिप्शन",
    "trust.security.encryption.body":
      "पहचान और भुगतान-संबंधी दस्तावेज़ आराम और पारगमन दोनों में एन्क्रिप्ट किए जाते हैं।",
    "trust.security.rls.title": "न्यूनतम विशेषाधिकार और रो-लेवल सुरक्षा",
    "trust.security.rls.body": "पहुँच न्यूनतम आवश्यक तक सीमित है, जो डेटा परत पर लागू की जाती है।",
    "trust.security.audit.title": "ऑडिट लॉगिंग",
    "trust.security.audit.body":
      "संवेदनशील ऑपरेशन लॉग किए जाते हैं ताकि पहुँच की समीक्षा और हिसाब रखा जा सके।",
    "trust.security.breach.title": "निर्धारित उल्लंघन प्रतिक्रिया",
    "trust.security.breach.body": "नियंत्रित, आकलन और बिना देरी सूचित करने के लिए एक स्पष्ट घटना प्रक्रिया।",

    "trust.cta.title": "सुरक्षा या गोपनीयता के बारे में कोई प्रश्न है?",
    "trust.cta.body":
      "हम खुशी से समझाएँगे कि हम लोगों को कैसे सत्यापित करते हैं या आपके डेटा को कैसे संभालते हैं। संपर्क करें और हम आपको विवरण की ओर ले जाएँगे।",
    "trust.cta.contact": "हमसे संपर्क करें",
    "trust.cta.faq": "सामान्य प्रश्न पढ़ें",
    "trust.cta.note": "सत्यापन और पुनः सत्यापन लगातार चलता है, केवल साइन-अप पर नहीं।",

    // --------------------------------------------------------------- Contact
    "contact.hero.badge": "हमसे संपर्क करें",
    "contact.hero.title": "हमें आपसे सुनना अच्छा लगेगा",
    "contact.hero.subtitle":
      "यात्री, होस्ट और टीमें — आपको जो भी चाहिए, यूके और आयरलैंड भर में हमारी सहायता टीम मदद के लिए यहाँ है।",

    "contact.channels.eyebrow": "संपर्क करें",
    "contact.channels.title": "सही इनबॉक्स चुनें, या बस हमें एक संदेश भेजें",
    "contact.channels.body":
      "ParkGo यूके और आयरलैंड के लिए एकीकृत एयरपोर्ट पहुँच बना रहा है। हम हर पूछताछ का जल्दी जवाब देने का लक्ष्य रखते हैं — उपयुक्त टीम चुनें, या फॉर्म का उपयोग करें और हम इसे आपके लिए भेज देंगे।",
    "contact.channel.support.title": "सहायता",
    "contact.channel.support.body": "बुकिंग, आपके खाते या भुगतान के बारे में प्रश्न।",
    "contact.channel.partnerships.title": "साझेदारियाँ",
    "contact.channel.partnerships.body": "बड़े पैमाने पर होस्टिंग या आपकी टीम के लिए कॉर्पोरेट यात्रा।",
    "contact.channel.press.title": "प्रेस और सामान्य",
    "contact.channel.press.body": "मीडिया पूछताछ और बाकी सब कुछ।",

    "contact.teams.text": "किसी टीम के लिए यात्रा सेट कर रहे हैं?",
    "contact.teams.link": "कॉर्पोरेट खाते देखें",
    "contact.teams.suffix": "मासिक इनवॉइसिंग और प्राथमिकता समर्थन के लिए।",

    "contact.form.title": "हमें एक संदेश भेजें",
    "contact.form.subtitle": "फॉर्म भरें और हम आपको ईमेल द्वारा जवाब देंगे।",
    "contact.form.name": "नाम",
    "contact.form.namePh": "आपका नाम",
    "contact.form.email": "ईमेल",
    "contact.form.emailPh": "you@email.com",
    "contact.form.message": "संदेश",
    "contact.form.messagePh": "हम कैसे मदद कर सकते हैं?",
    "contact.form.submit": "संदेश भेजें",
    "contact.form.sending": "भेजा जा रहा है…",
    "contact.form.disclaimer": "हम आपके विवरण का उपयोग केवल इस पूछताछ का जवाब देने के लिए करेंगे।",
    "contact.form.successTitle": "संदेश भेजा गया",
    "contact.form.successBody":
      "संपर्क करने के लिए धन्यवाद — हम जितनी जल्दी हो सके आपके ईमेल का जवाब देंगे।",

    "contact.quick.eyebrow": "लिखने से पहले",
    "contact.quick.title": "शायद आपको अपना जवाब यहाँ तेज़ी से मिल जाए",
    "contact.quick.faq.title": "सामान्य प्रश्न पढ़ें",
    "contact.quick.faq.body": "अधिकांश प्रश्नों का उत्तर यहाँ है।",
    "contact.quick.travellers.title": "यात्रियों के लिए",
    "contact.quick.travellers.body": "बुकिंग और यात्रा का दिन कैसे काम करता है।",
    "contact.quick.hosts.title": "होस्ट के लिए",
    "contact.quick.hosts.body": "एक स्थान सूचीबद्ध करें और कमाई शुरू करें।",
    "contact.quick.trust.title": "भरोसा और सुरक्षा",
    "contact.quick.trust.body": "हम हर बुकिंग को कैसे सुरक्षित रखते हैं।",

    "contact.cta.title": "स्मार्ट पार्क करने और आसानी से यात्रा करने के लिए तैयार हैं?",
    "contact.cta.body":
      "बुकिंग शुरू करें या जानें कि ParkGo पार्किंग, ट्रांसफर और ईवी चार्जिंग को एक भरोसेमंद यात्रा में कैसे जोड़ता है।",
    "contact.cta.start": "बुकिंग शुरू करें",
    "contact.cta.how": "यह कैसे काम करता है",
    "contact.cta.note": "यूके और आयरलैंड भर में पार्किंग — एयरपोर्ट, शहर और इवेंट।",
  },

  de: {
    // ---------------------------------------------------------------- Pricing
    "pricing.hero.badge": "Transparent durch Design",
    "pricing.hero.title": "Ein klarer Preis. Keine Überraschungen am Tor.",
    "pricing.hero.subtitle":
      "ParkGo bündelt Parken, einen lizenzierten Transfer und das Laden von E-Autos zu einem Preis mit einer kleinen, klar ausgewiesenen Servicegebühr. Gastgeber verdienen zu fairen, transparenten Konditionen.",
    "pricing.hero.ctaStart": "Buchung starten",
    "pricing.hero.ctaHow": "Wie sich das Paket zusammensetzt",

    "pricing.bundle.eyebrow": "Der Paketpreis",
    "pricing.bundle.title": "Vier Leistungen, ein Preis, den Sie in Sekunden erfassen",
    "pricing.bundle.body":
      "Statt drei Bezahlvorgängen und Kopfrechnen zeigt Ihnen ParkGo eine einzige Gesamtsumme vor der Zahlung. So setzt sich ein beispielhaftes Paket zusammen.",
    "pricing.bundle.point1": "Parken pro Tag bei Ihrem gewählten geprüften Gastgeber",
    "pricing.bundle.point2": "Ein lizenzierter Terminaltransfer, hin und zurück",
    "pricing.bundle.point3": "Optionales E-Auto-Laden, wo der Gastgeber es anbietet",
    "pricing.bundle.point4": "Eine pauschale Servicegebühr von {fee}, vor der Zahlung ausgewiesen",

    "pricing.receipt.label": "Beispielhaftes Paket",
    "pricing.receipt.parking": "Geprüftes Parken",
    "pricing.receipt.parkingNote": "Einfahrt des Gastgebers in Terminalnähe",
    "pricing.receipt.transfer": "Lizenzierter Transfer",
    "pricing.receipt.transferNote": "hin und zurück, lizenzierter Fahrer",
    "pricing.receipt.ev": "E-Auto-Laden",
    "pricing.receipt.evNote": "optionales Aufladen",
    "pricing.receipt.fee": "Servicegebühr",
    "pricing.receipt.feeNote": "pauschale Plattformgebühr",
    "pricing.receipt.total": "Ein Preis beim Checkout",
    "pricing.receipt.disclaimer":
      "Nur ein beispielhafter Wert. Ihr Preis hängt vom Flughafen, den Daten und den gewählten Zusatzleistungen ab.",

    "pricing.economics.eyebrow": "Wie sich das Paket zusammensetzt",
    "pricing.economics.title": "Faire Ökonomie, klar erklärt",
    "pricing.economics.body":
      "ParkGo erhebt eine Provision auf das Parken und eine kleine pauschale Servicegebühr. Der lizenzierte Transfer ist über einen integrierten Betreiber enthalten. Jeder kann genau sehen, wohin das Geld fließt.",

    "pricing.econ.hosts.who": "Gastgeber",
    "pricing.econ.hosts.line": "auf Parken & E-Auto",
    "pricing.econ.hosts.keep": "Behalten Sie ~{pct}%",
    "pricing.econ.hosts.body":
      "Die Provision wird pro Parkbuchung erhoben; die Einnahmen aus dem E-Auto-Laden folgen derselben Aufteilung, da der Gastgeber der Eigentümer der Ladestation ist.",
    "pricing.econ.transfer.who": "Lizenzierter Transfer",
    "pricing.econ.transfer.commission": "Inbegriffen",
    "pricing.econ.transfer.line": "in Ihrem Paketpreis",
    "pricing.econ.transfer.keep": "Kein Partner-Onboarding",
    "pricing.econ.transfer.body":
      "Der Terminaltransfer wird von einem unabhängigen, lizenzierten und versicherten Betreiber bereitgestellt, der per API mit ParkGo integriert ist. Es gibt keine Flotte zum Onboarden — er ist einfach in Ihren einen Preis eingebunden.",
    "pricing.econ.fee.who": "Servicegebühr",
    "pricing.econ.fee.line": "pauschal, pro Buchung",
    "pricing.econ.fee.keep": "Beim Checkout angezeigt",
    "pricing.econ.fee.body":
      "Eine kleine pauschale Plattformgebühr, die einmal pro Buchung hinzugefügt wird. Sie wird nie versteckt — Reisende sehen sie vor der Zahlung.",

    "pricing.econ.ctaHost": "Als Gastgeber verdienen",
    "pricing.econ.ctaTransfer": "So funktioniert der Transfer",
    "pricing.econ.note": "Beispielhafte Provision von ~{pct}% auf das Parken. Die Sätze werden zum Start bestätigt.",

    "pricing.more.eyebrow": "Mehr Sparmöglichkeiten",
    "pricing.more.title": "Für Teams und zum Teilen gemacht",

    "pricing.corporate.title": "Firmenkonten",
    "pricing.corporate.body":
      "Zentralisieren Sie die Reisen Ihres Teams mit einem Konto, gebündelter Abrechnung und bevorzugtem Support.",
    "pricing.corporate.point1": "Monatliche Rechnungsstellung statt Karten pro Fahrt",
    "pricing.corporate.point2": "Zentralisierte Buchungen für Ihre Reisenden",
    "pricing.corporate.point3": "Bevorzugter Support für zeitkritische Reisen",
    "pricing.corporate.point4": "Klare Abrechnungen für einfache Spesen",
    "pricing.corporate.cta": "Sprechen Sie mit uns über Teams",

    "pricing.referral.title": "Empfehlungsprogramm",
    "pricing.referral.body":
      "Sie lieben ParkGo? Teilen Sie es. Wenn ein Freund seine erste Reise macht, werden Sie beide belohnt.",
    "pricing.referral.point1": "Teilen Sie Ihren persönlichen Empfehlungslink",
    "pricing.referral.point2": "Ihr Freund erhält eine Willkommensprämie",
    "pricing.referral.point3": "Sie werden nach seiner ersten abgeschlossenen Reise belohnt",
    "pricing.referral.point4": "Empfehlen Sie so viele Personen, wie Sie möchten",
    "pricing.referral.cta": "Mit dem Reisen beginnen",

    "pricing.included.eyebrow": "In jeder Buchung enthalten",
    "pricing.included.title": "Der Preis enthält immer die wichtigen Teile",
    "pricing.included.verified.title": "Geprüfte Personen",
    "pricing.included.verified.body": "ID-geprüfte Gastgeber und lizenzierte, versicherte Fahrer — immer.",
    "pricing.included.secure.title": "Sichere Zahlung",
    "pricing.included.secure.body": "Ein transparenter Checkout mit im Voraus angezeigter Gesamtsumme.",
    "pricing.included.noFees.title": "Keine versteckten Gebühren",
    "pricing.included.noFees.body":
      "Die einzige Plattformgebühr ist die pauschale Servicegebühr, vor der Zahlung ausgewiesen.",
    "pricing.included.live.title": "Live am Reisetag",
    "pricing.included.live.body":
      "Live-Tracking, In-App-Kamera und geprüfte Übergaben ohne Aufpreis.",

    "pricing.cta.title": "Sehen Sie Ihren Preis, bevor Sie sich festlegen",
    "pricing.cta.body":
      "Starten Sie eine Buchung, um eine einzige transparente Gesamtsumme für Ihren Flughafen und Ihre Daten zu erhalten — kein Konto zum Ansehen erforderlich.",
    "pricing.cta.start": "Buchung starten",
    "pricing.cta.how": "So funktioniert's",

    // -------------------------------------------------------- Trust & safety
    "trust.hero.badge": "Vertrauen & Sicherheit",
    "trust.hero.title": "Sicherheit, die Sie sehen, Daten, denen Sie vertrauen",
    "trust.hero.subtitle":
      "ParkGo baut auf Verifizierung, Transparenz und strengem Datenschutz auf. Hier erfahren Sie genau, wie wir Reisende und Gastgeber schützen — und wie wir mit Ihren Informationen umgehen.",
    "trust.hero.ctaData": "Daten & Datenschutz",
    "trust.hero.ctaFaq": "FAQ lesen",

    "trust.pillars.eyebrow": "Sicherheit auf beiden Seiten",
    "trust.pillars.title": "Geprüfte Personen und geprüfte Momente",
    "trust.pillars.body":
      "Vertrauen ist kein Abzeichen — es ist eine Reihe von Prüfungen, die vor, während und nach jeder Buchung stattfinden.",

    "trust.pillar.verification.title": "Beidseitige Verifizierung",
    "trust.pillar.verification.body":
      "Beide Seiten jeder Buchung werden verifiziert. Gastgeber durchlaufen Identitäts- und Adressprüfungen; Reisende registrieren echte Konten; der Terminaltransfer wird von einem lizenzierten Betreiber abgewickelt.",
    "trust.pillar.idHosts.title": "ID-geprüfte Gastgeber",
    "trust.pillar.idHosts.body":
      "Jeder Gastgeber besteht eine KYC-Identitätsprüfung und eine Berechtigungserklärung, bevor auch nur ein Platz live geht.",
    "trust.pillar.operator.title": "Lizenzierter & versicherter Transferbetreiber",
    "trust.pillar.operator.body":
      "Ihr Terminaltransfer wird von einem unabhängigen, lizenzierten und versicherten Betreiber bereitgestellt, per API integriert. Die Konformität von Betreiber, Fahrzeug und Fahrer liegt bei ihm; ParkGo bewahrt das kundenseitige Vertrauen — Live-Standort und eine geprüfte Übergabe.",
    "trust.pillar.cctv.title": "Videoüberwachung & Live-Kamera",
    "trust.pillar.cctv.body":
      "Plätze können Videoüberwachung enthalten, und Reisende können eine Live-Kamera ihres Autos in der App mit LIVE-Abzeichen und Zeitstempel ansehen.",
    "trust.pillar.handovers.title": "Geprüfte Übergaben",
    "trust.pillar.handovers.body":
      "Abgabe und Abholung werden jeweils mit einem Einmalcode bestätigt und schaffen so eine zeitgestempelte, protokollierte Übergabekette.",
    "trust.pillar.scoring.title": "Beidseitige Vertrauensbewertung",
    "trust.pillar.scoring.body":
      "Reisende und Gastgeber bewerten sich nach jeder Reise gegenseitig, und Sie können auch Ihren Transfer bewerten. Bewertungen halten das Netzwerk ehrlich und hochwertig.",

    "trust.handover.eyebrow": "Die geprüfte Übergabe",
    "trust.handover.title": "Eine klare, protokollierte Übergabekette",
    "trust.handover.body":
      "Die Übergabe ist der wichtigste Moment. ParkGo macht daraus ein bestätigtes, zeitgestempeltes Ereignis, sodass nie ein Zweifel besteht, wer das Auto wann hatte.",
    "trust.handover.codes.title": "Einmalcodes",
    "trust.handover.codes.body": "Ein einzigartiger Code wird bei Abgabe und Abholung von beiden Parteien bestätigt.",
    "trust.handover.logged.title": "Zeitgestempelt & protokolliert",
    "trust.handover.logged.body": "Jede Bestätigung wird mit einer Uhrzeit erfasst und schafft eine prüfbare Spur.",
    "trust.handover.context.title": "Live-Kontext",
    "trust.handover.context.body":
      "Live-Standort und die In-App-Kamera geben allen in Echtzeit dasselbe Bild.",
    "trust.handover.confirmed": "Übergabe bestätigt",
    "trust.handover.oneTimeCode": "Einmalcode",
    "trust.handover.byBoth": "Von beiden Parteien bestätigt · 14:32",
    "trust.handover.step1": "Gastgeber hat Abgabe bestätigt",
    "trust.handover.step2": "Fahrer hat Abholung bestätigt",
    "trust.handover.step3": "Ereignis ins Audit-Protokoll geschrieben",

    "trust.data.eyebrow": "Datenschutz",
    "trust.data.title": "DSGVO- und ICO-konform, durch Design",
    "trust.data.body":
      "Wir behandeln Ihre Daten als etwas, das wir hüten, nicht als etwas, das uns gehört. Unser Ansatz orientiert sich an den Grundsätzen der UK-DSGVO und den ICO-Leitlinien.",
    "trust.data.minimal.title": "Minimale Daten",
    "trust.data.minimal.body":
      "Wir erfassen nur, was eine Buchung wirklich braucht — und nicht mehr. Datenminimierung ist der Standard.",
    "trust.data.lawful.title": "Rechtsgrundlage & Einwilligung",
    "trust.data.lawful.body":
      "Jede Nutzung Ihrer Daten hat eine Rechtsgrundlage. Wo wir uns auf die Einwilligung stützen, ist sie spezifisch, informiert und leicht widerrufbar.",
    "trust.data.retention.title": "Festgelegte Aufbewahrung",
    "trust.data.retention.body":
      "Personenbezogene Daten werden nur so lange wie nötig aufbewahrt und dann nach einem festgelegten Aufbewahrungsplan gelöscht oder anonymisiert.",
    "trust.data.requests.title": "Betroffenenanfragen",
    "trust.data.requests.body":
      "Greifen Sie auf Ihre Daten zu, berichtigen, exportieren oder löschen Sie sie. Wir erfüllen Betroffenenanfragen im Einklang mit der UK-DSGVO.",
    "trust.data.kyc.title": "Getrennte, verschlüsselte KYC",
    "trust.data.kyc.body":
      "Identitäts- und Bankdokumente werden verschlüsselt und getrennt von Ihren alltäglichen Profildaten gespeichert.",
    "trust.data.audit.title": "Audit-Protokollierung",
    "trust.data.audit.body":
      "Sensible Aktionen werden in einem Audit-Protokoll erfasst, damit Zugriffe überprüft und nachvollzogen werden können.",
    "trust.data.rls.title": "Geringste Rechte & RLS",
    "trust.data.rls.body":
      "Strenge Zugriffskontrollen und Sicherheit auf Zeilenebene bedeuten, dass Personen und Dienste nur das sehen, was sie sollen.",
    "trust.data.breach.title": "Reaktion auf Datenschutzverletzungen",
    "trust.data.breach.body":
      "Ein festgelegter Vorfallsprozess bedeutet, dass wir schnell eindämmen, bewerten und benachrichtigen, falls jemals etwas schiefgeht.",

    "trust.security.eyebrow": "Unter der Haube",
    "trust.security.title": "Sicherheit fest in der Plattform verankert",
    "trust.security.body":
      "Gute Absichten reichen nicht — Schutz muss technisch verankert werden. Dies sind die Kontrollen, die hinter jeder Buchung stehen.",
    "trust.security.encryption.title": "Verschlüsselung sensibler Daten",
    "trust.security.encryption.body":
      "Identitäts- und zahlungsbezogene Dokumente werden im Ruhezustand und bei der Übertragung verschlüsselt.",
    "trust.security.rls.title": "Geringste Rechte & Sicherheit auf Zeilenebene",
    "trust.security.rls.body":
      "Der Zugriff ist auf das Nötigste beschränkt und wird auf der Datenebene durchgesetzt.",
    "trust.security.audit.title": "Audit-Protokollierung",
    "trust.security.audit.body":
      "Sensible Vorgänge werden protokolliert, damit Zugriffe überprüft und nachvollzogen werden können.",
    "trust.security.breach.title": "Festgelegte Reaktion auf Datenschutzverletzungen",
    "trust.security.breach.body":
      "Ein klarer Vorfallsprozess, um ohne Verzögerung einzudämmen, zu bewerten und zu benachrichtigen.",

    "trust.cta.title": "Haben Sie eine Frage zu Sicherheit oder Datenschutz?",
    "trust.cta.body":
      "Wir erklären gerne alles darüber, wie wir Personen verifizieren oder mit Ihren Daten umgehen. Nehmen Sie Kontakt auf und wir zeigen Ihnen die Details.",
    "trust.cta.contact": "Kontakt aufnehmen",
    "trust.cta.faq": "FAQ lesen",
    "trust.cta.note": "Verifizierung und erneute Verifizierung laufen kontinuierlich, nicht nur bei der Anmeldung.",

    // --------------------------------------------------------------- Contact
    "contact.hero.badge": "Kontakt",
    "contact.hero.title": "Wir freuen uns, von Ihnen zu hören",
    "contact.hero.subtitle":
      "Reisende, Gastgeber und Teams — was auch immer Sie brauchen, unser Support-Team in ganz Großbritannien & Irland ist für Sie da.",

    "contact.channels.eyebrow": "Kontakt aufnehmen",
    "contact.channels.title": "Wählen Sie das richtige Postfach oder senden Sie uns einfach eine Nachricht",
    "contact.channels.body":
      "ParkGo baut integrierten Flughafenzugang für Großbritannien & Irland auf. Wir sind bestrebt, jede Anfrage schnell zu beantworten — wählen Sie das passende Team oder nutzen Sie das Formular, und wir leiten es für Sie weiter.",
    "contact.channel.support.title": "Support",
    "contact.channel.support.body": "Fragen zu einer Buchung, Ihrem Konto oder Zahlungen.",
    "contact.channel.partnerships.title": "Partnerschaften",
    "contact.channel.partnerships.body": "Hosting im großen Stil oder Geschäftsreisen für Ihr Team.",
    "contact.channel.press.title": "Presse & Allgemeines",
    "contact.channel.press.body": "Medienanfragen und alles andere.",

    "contact.teams.text": "Reisen für ein Team einrichten?",
    "contact.teams.link": "Firmenkonten ansehen",
    "contact.teams.suffix": "für monatliche Rechnungsstellung und bevorzugten Support.",

    "contact.form.title": "Senden Sie uns eine Nachricht",
    "contact.form.subtitle": "Füllen Sie das Formular aus und wir melden uns per E-Mail bei Ihnen.",
    "contact.form.name": "Name",
    "contact.form.namePh": "Ihr Name",
    "contact.form.email": "E-Mail",
    "contact.form.emailPh": "du@email.com",
    "contact.form.message": "Nachricht",
    "contact.form.messagePh": "Wie können wir helfen?",
    "contact.form.submit": "Nachricht senden",
    "contact.form.sending": "Wird gesendet…",
    "contact.form.disclaimer": "Wir verwenden Ihre Daten nur, um auf diese Anfrage zu antworten.",
    "contact.form.successTitle": "Nachricht gesendet",
    "contact.form.successBody":
      "Danke für Ihre Kontaktaufnahme — wir antworten so schnell wie möglich auf Ihre E-Mail.",

    "contact.quick.eyebrow": "Bevor Sie schreiben",
    "contact.quick.title": "Vielleicht finden Sie Ihre Antwort hier schneller",
    "contact.quick.faq.title": "FAQ lesen",
    "contact.quick.faq.body": "Die meisten Fragen werden hier beantwortet.",
    "contact.quick.travellers.title": "Für Reisende",
    "contact.quick.travellers.body": "Wie Buchung und Reisetag funktionieren.",
    "contact.quick.hosts.title": "Für Gastgeber",
    "contact.quick.hosts.body": "Einen Platz einstellen und Geld verdienen.",
    "contact.quick.trust.title": "Vertrauen & Sicherheit",
    "contact.quick.trust.body": "Wie wir jede Buchung sicher halten.",

    "contact.cta.title": "Bereit, clever zu parken und entspannt zu reisen?",
    "contact.cta.body":
      "Starten Sie eine Buchung oder entdecken Sie, wie ParkGo Parken, Transfers und E-Auto-Laden zu einer vertrauenswürdigen Reise verbindet.",
    "contact.cta.start": "Buchung starten",
    "contact.cta.how": "So funktioniert's",
    "contact.cta.note": "Parken in ganz Großbritannien & Irland — Flughäfen, Städte & Events.",
  },

  zh: {
    // ---------------------------------------------------------------- Pricing
    "pricing.hero.badge": "以透明为设计初衷",
    "pricing.hero.title": "一个清晰的价格。到闸口不再有意外。",
    "pricing.hero.subtitle":
      "ParkGo 将停车、持牌接送和电动车充电整合为一个价格，外加一笔清晰列明的小额服务费。房东以公平、透明的条件赚取收益。",
    "pricing.hero.ctaStart": "开始预订",
    "pricing.hero.ctaHow": "套餐如何构成",

    "pricing.bundle.eyebrow": "套餐价格",
    "pricing.bundle.title": "四项服务，一个几秒就能看懂的价格",
    "pricing.bundle.body":
      "无需三次结账和心算，ParkGo 在您付款前显示一个总价。以下是一个示例套餐的构成。",
    "pricing.bundle.point1": "来自您所选认证房东的每日停车",
    "pricing.bundle.point2": "一次持牌航站楼接送，往返双程",
    "pricing.bundle.point3": "在房东提供的地点可选电动车充电",
    "pricing.bundle.point4": "一笔 {fee} 的固定服务费，付款前列明",

    "pricing.receipt.label": "示例套餐",
    "pricing.receipt.parking": "认证停车",
    "pricing.receipt.parkingNote": "航站楼附近的房东车道",
    "pricing.receipt.transfer": "持牌接送",
    "pricing.receipt.transferNote": "往返双程，持牌司机",
    "pricing.receipt.ev": "电动车充电",
    "pricing.receipt.evNote": "可选充电",
    "pricing.receipt.fee": "服务费",
    "pricing.receipt.feeNote": "固定平台费",
    "pricing.receipt.total": "结账时一个价格",
    "pricing.receipt.disclaimer":
      "仅为示例。您的价格取决于机场、日期以及您选择的附加服务。",

    "pricing.economics.eyebrow": "套餐如何构成",
    "pricing.economics.title": "公平的经济模式，清晰说明",
    "pricing.economics.body":
      "ParkGo 对停车收取佣金并收取一笔小额固定服务费。持牌接送通过一体化运营商包含在内。每个人都能清楚看到钱的去向。",

    "pricing.econ.hosts.who": "房东",
    "pricing.econ.hosts.line": "停车与电动车充电",
    "pricing.econ.hosts.keep": "保留约 {pct}%",
    "pricing.econ.hosts.body":
      "佣金按每笔停车预订收取；电动车充电收入遵循相同的分成，因为充电桩归房东所有。",
    "pricing.econ.transfer.who": "持牌接送",
    "pricing.econ.transfer.commission": "已包含",
    "pricing.econ.transfer.line": "在您的套餐价格中",
    "pricing.econ.transfer.keep": "无需合作伙伴接入",
    "pricing.econ.transfer.body":
      "航站楼接送由一家独立、持牌且投保的运营商提供，通过 API 与 ParkGo 集成。无需接入车队 — 它只是被整合进您的一个价格中。",
    "pricing.econ.fee.who": "服务费",
    "pricing.econ.fee.line": "固定，每笔预订",
    "pricing.econ.fee.keep": "结账时显示",
    "pricing.econ.fee.body":
      "每笔预订仅收取一次的小额固定平台费。它从不隐藏 — 旅客在付款前就能看到。",

    "pricing.econ.ctaHost": "成为房东赚取收益",
    "pricing.econ.ctaTransfer": "接送如何运作",
    "pricing.econ.note": "停车约 {pct}% 的示例佣金。费率将在上线时确认。",

    "pricing.more.eyebrow": "更多省钱方式",
    "pricing.more.title": "为团队和分享而打造",

    "pricing.corporate.title": "企业账户",
    "pricing.corporate.body":
      "用一个账户、合并账单和优先支持，集中管理您团队的出行。",
    "pricing.corporate.point1": "按月开具发票，而非逐次刷卡",
    "pricing.corporate.point2": "跨旅客的集中预订",
    "pricing.corporate.point3": "为时间紧迫的行程提供优先支持",
    "pricing.corporate.point4": "清晰的对账单，便于报销",
    "pricing.corporate.cta": "就团队方案与我们联系",

    "pricing.referral.title": "推荐计划",
    "pricing.referral.body":
      "喜欢 ParkGo？分享它吧。当朋友完成首次行程时，你们双方都能获得奖励。",
    "pricing.referral.point1": "分享您的专属推荐链接",
    "pricing.referral.point2": "您的朋友获得欢迎奖励",
    "pricing.referral.point3": "在他们完成首次行程后您获得奖励",
    "pricing.referral.point4": "推荐人数不限",
    "pricing.referral.cta": "开始出行",

    "pricing.included.eyebrow": "每次预订均包含",
    "pricing.included.title": "价格始终包含最重要的部分",
    "pricing.included.verified.title": "已验证人员",
    "pricing.included.verified.body": "经身份核验的房东以及持牌、投保的司机 — 始终如此。",
    "pricing.included.secure.title": "安全支付",
    "pricing.included.secure.body": "一次透明的结账，总价预先显示。",
    "pricing.included.noFees.title": "没有隐藏费用",
    "pricing.included.noFees.body": "唯一的平台费是固定服务费，付款前列明。",
    "pricing.included.live.title": "出行当天实时",
    "pricing.included.live.body": "实时追踪、应用内摄像头和已验证的交接，均不额外收费。",

    "pricing.cta.title": "在决定前先看价格",
    "pricing.cta.body":
      "开始预订即可获得针对您的机场和日期的单一透明总价 — 无需账户即可查看。",
    "pricing.cta.start": "开始预订",
    "pricing.cta.how": "运作方式",

    // -------------------------------------------------------- Trust & safety
    "trust.hero.badge": "信任与安全",
    "trust.hero.title": "看得见的安全，信得过的数据",
    "trust.hero.subtitle":
      "ParkGo 建立在验证、可见性和严格的数据保护之上。以下正是我们如何保障旅客与房东的安全 — 以及我们如何处理您的信息。",
    "trust.hero.ctaData": "数据与隐私",
    "trust.hero.ctaFaq": "阅读常见问题",

    "trust.pillars.eyebrow": "双方都安全",
    "trust.pillars.title": "已验证的人与已验证的时刻",
    "trust.pillars.body":
      "信任不是一枚徽章 — 而是一系列在每次预订之前、期间和之后进行的检查。",

    "trust.pillar.verification.title": "双向验证",
    "trust.pillar.verification.body":
      "每次预订的双方都经过验证。房东完成身份和地址核查；旅客注册真实账户；航站楼接送由持牌运营商负责。",
    "trust.pillar.idHosts.title": "经身份核验的房东",
    "trust.pillar.idHosts.body":
      "在任何一个车位上线之前，每位房东都要通过 KYC 身份核查和出租权声明。",
    "trust.pillar.operator.title": "持牌且投保的接送运营商",
    "trust.pillar.operator.body":
      "您的航站楼接送由一家独立、持牌且投保的运营商提供，通过 API 集成。其运营商、车辆和司机合规由其负责；ParkGo 保持面向客户的信任 — 实时位置和已验证的交接。",
    "trust.pillar.cctv.title": "闭路电视与实时摄像头",
    "trust.pillar.cctv.body":
      "车位可配备闭路电视，旅客可在应用内观看带有 LIVE 标记和时间戳的爱车实时摄像头。",
    "trust.pillar.handovers.title": "已验证的交接",
    "trust.pillar.handovers.body":
      "停车和取车均以一次性验证码确认，形成带时间戳、有记录的保管链条。",
    "trust.pillar.scoring.title": "双向信任评分",
    "trust.pillar.scoring.body":
      "旅客和房东在每次行程后互相评分，您也可以为接送评分。评分让整个网络保持诚信和高品质。",

    "trust.handover.eyebrow": "已验证的交接",
    "trust.handover.title": "一条清晰、有记录的保管链条",
    "trust.handover.body":
      "交接是最重要的时刻。ParkGo 将其转化为一个已确认、带时间戳的事件，因此谁在何时保管车辆从无疑问。",
    "trust.handover.codes.title": "一次性验证码",
    "trust.handover.codes.body": "在停车和取车时，由双方确认一个唯一验证码。",
    "trust.handover.logged.title": "带时间戳且有记录",
    "trust.handover.logged.body": "每次确认都记录时间，形成可审计的轨迹。",
    "trust.handover.context.title": "实时情境",
    "trust.handover.context.body":
      "实时位置和应用内摄像头让每个人实时看到相同的画面。",
    "trust.handover.confirmed": "交接已确认",
    "trust.handover.oneTimeCode": "一次性验证码",
    "trust.handover.byBoth": "双方已确认 · 14:32",
    "trust.handover.step1": "房东已确认停车",
    "trust.handover.step2": "司机已确认取车",
    "trust.handover.step3": "事件已写入审计日志",

    "trust.data.eyebrow": "数据保护",
    "trust.data.title": "以设计遵循 GDPR 和 ICO",
    "trust.data.body":
      "我们将您的数据视为需要守护之物，而非我们所拥有之物。我们的方法围绕英国 GDPR 原则和 ICO 指南构建。",
    "trust.data.minimal.title": "最少数据",
    "trust.data.minimal.body":
      "我们只收集预订确实需要的信息 — 绝不多收。数据最小化是默认原则。",
    "trust.data.lawful.title": "合法依据与同意",
    "trust.data.lawful.body":
      "对您数据的每一次使用都有合法依据。在我们依赖同意之处，同意是具体、知情且易于撤回的。",
    "trust.data.retention.title": "明确的保留期限",
    "trust.data.retention.body":
      "个人数据仅保留必要的时间，随后按明确的保留计划删除或匿名化。",
    "trust.data.requests.title": "数据主体请求",
    "trust.data.requests.body":
      "访问、更正、导出或删除您的数据。我们按照英国 GDPR 履行数据主体请求。",
    "trust.data.kyc.title": "分离、加密的 KYC",
    "trust.data.kyc.body":
      "身份和银行文件经过加密，并与您的日常个人资料数据分开存储。",
    "trust.data.audit.title": "审计日志",
    "trust.data.audit.body":
      "敏感操作记录在审计日志中，以便可以审查和追责访问行为。",
    "trust.data.rls.title": "最小权限与行级安全",
    "trust.data.rls.body":
      "严格的访问控制和行级安全意味着人员和服务只能看到他们应看到的内容。",
    "trust.data.breach.title": "违规响应",
    "trust.data.breach.body":
      "明确的事件流程意味着，一旦出现问题，我们会迅速控制、评估并通知。",

    "trust.security.eyebrow": "幕后机制",
    "trust.security.title": "安全深植于平台之中",
    "trust.security.body":
      "仅有良好意图并不够 — 保护必须从工程上构建。以下是支撑每次预订的控制措施。",
    "trust.security.encryption.title": "敏感数据加密",
    "trust.security.encryption.body":
      "身份和与支付相关的文件在静态和传输中均经过加密。",
    "trust.security.rls.title": "最小权限与行级安全",
    "trust.security.rls.body": "访问被限制在所需的最低范围，并在数据层强制执行。",
    "trust.security.audit.title": "审计日志",
    "trust.security.audit.body":
      "敏感操作会被记录，以便可以审查和追责访问行为。",
    "trust.security.breach.title": "明确的违规响应",
    "trust.security.breach.body": "一套清晰的事件流程，用以毫不延迟地控制、评估和通知。",

    "trust.cta.title": "对安全或隐私有疑问吗？",
    "trust.cta.body":
      "关于我们如何验证人员或处理您的数据，我们很乐意作出任何说明。联系我们，我们会为您指明细节。",
    "trust.cta.contact": "联系我们",
    "trust.cta.faq": "阅读常见问题",
    "trust.cta.note": "验证和重新验证持续进行，而不仅仅在注册时。",

    // --------------------------------------------------------------- Contact
    "contact.hero.badge": "联系我们",
    "contact.hero.title": "我们期待您的来信",
    "contact.hero.subtitle":
      "旅客、房东和团队 — 无论您需要什么，我们遍布英国和爱尔兰的支持团队都乐意帮忙。",

    "contact.channels.eyebrow": "取得联系",
    "contact.channels.title": "选择合适的收件箱，或直接给我们发消息",
    "contact.channels.body":
      "ParkGo 正在为英国和爱尔兰打造一体化机场出行。我们力求快速回复每一条咨询 — 选择合适的团队，或使用表单，我们会为您转交。",
    "contact.channel.support.title": "支持",
    "contact.channel.support.body": "关于预订、账户或付款的问题。",
    "contact.channel.partnerships.title": "合作",
    "contact.channel.partnerships.body": "大规模托管或为您团队安排企业出行。",
    "contact.channel.press.title": "媒体与综合",
    "contact.channel.press.body": "媒体咨询及其他一切。",

    "contact.teams.text": "在为团队安排出行吗？",
    "contact.teams.link": "查看企业账户",
    "contact.teams.suffix": "以获得按月开票和优先支持。",

    "contact.form.title": "给我们发消息",
    "contact.form.subtitle": "填写表单，我们将通过电子邮件回复您。",
    "contact.form.name": "姓名",
    "contact.form.namePh": "您的姓名",
    "contact.form.email": "电子邮箱",
    "contact.form.emailPh": "you@email.com",
    "contact.form.message": "消息",
    "contact.form.messagePh": "我们能帮您什么？",
    "contact.form.submit": "发送消息",
    "contact.form.sending": "发送中…",
    "contact.form.disclaimer": "我们仅会使用您的信息来回复此次咨询。",
    "contact.form.successTitle": "消息已发送",
    "contact.form.successBody":
      "感谢您的联系 — 我们会尽快回复您的电子邮件。",

    "contact.quick.eyebrow": "在您来信之前",
    "contact.quick.title": "您也许能在这里更快找到答案",
    "contact.quick.faq.title": "阅读常见问题",
    "contact.quick.faq.body": "大多数问题都能在这里得到解答。",
    "contact.quick.travellers.title": "旅客专区",
    "contact.quick.travellers.body": "预订和出行当天如何运作。",
    "contact.quick.hosts.title": "房东专区",
    "contact.quick.hosts.body": "发布车位，开始赚取收益。",
    "contact.quick.trust.title": "信任与安全",
    "contact.quick.trust.body": "我们如何保障每次预订的安全。",

    "contact.cta.title": "准备好聪明停车、轻松出行了吗？",
    "contact.cta.body":
      "开始预订，或了解 ParkGo 如何将停车、接送和电动车充电融为一段值得信赖的旅程。",
    "contact.cta.start": "开始预订",
    "contact.cta.how": "运作方式",
    "contact.cta.note": "覆盖英国和爱尔兰 — 机场、城市与活动场馆。",
  },
};
