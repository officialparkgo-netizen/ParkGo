import type { AreaDict } from "@/lib/i18n/config";

// Privacy + Terms. Keys namespaced "privacy.*" and "terms.*".
export const legal: AreaDict = {
  en: {
    // -------------------------------------------------------------- Privacy
    "privacy.hero.title": "Privacy Policy",
    "privacy.hero.intro":
      "ParkGo is built so that trust is the product. We collect as little personal data as possible, keep sensitive verification documents separate and encrypted, and give you clear control over your information.",
    "privacy.lastUpdated": "Last updated:",

    "privacy.who.title": "1. Who we are",
    "privacy.who.p1":
      "This policy explains how ParkGo (“ParkGo”, “we”, “us”) handles personal data when you use our website and apps across the United Kingdom and Ireland. For data-protection purposes, ParkGo is the data controller for the personal data described here.",
    "privacy.who.p2":
      "We comply with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018, and, where the Irish service applies, the EU GDPR. We are guided by the standards and codes published by the Information Commissioner’s Office (ICO).",

    "privacy.data.title": "2. The data we collect",
    "privacy.data.intro": "We collect only what we need to run the marketplace safely:",
    "privacy.data.traveller.label": "Traveller details (minimal):",
    "privacy.data.traveller.body":
      "your name, email, phone number, preferred language and basic vehicle information (make, model, colour, registration and size) so a host and licensed driver can identify the correct car. We do not ask travellers for identity documents.",
    "privacy.data.kyc.label": "Host verification (KYC):",
    "privacy.data.kyc.body":
      "identity documents, proof of address and right-to-list declarations. This sensitive material is collected only from hosts, is held in a separate, access-controlled store, and is encrypted. The independent licensed transfer operator manages its own driver and vehicle licensing and insurance.",
    "privacy.data.booking.label": "Booking and payment data:",
    "privacy.data.booking.body":
      "the bundle you book, dates, price and a payment reference. Card details are processed by our regulated payment provider; we do not store full card numbers.",
    "privacy.data.travelDay.label": "Travel-day data:",
    "privacy.data.travelDay.body":
      "live location during an active transfer and handover confirmations, used to deliver the service and provide a security record.",
    "privacy.data.technical.label": "Technical data:",
    "privacy.data.technical.body":
      "device, log and cookie data needed to keep the service secure and working.",

    "privacy.lawful.title": "3. Lawful bases for processing",
    "privacy.lawful.intro": "We rely on the following lawful bases under UK GDPR Article 6:",
    "privacy.lawful.contract.label": "Contract:",
    "privacy.lawful.contract.body":
      "to create your account, take bookings, process payments and provide transfers and handovers.",
    "privacy.lawful.legal.label": "Legal obligation:",
    "privacy.lawful.legal.body":
      "to verify hosts, prevent fraud and meet tax and licensing requirements.",
    "privacy.lawful.interests.label": "Legitimate interests:",
    "privacy.lawful.interests.body":
      "to keep the platform safe, calculate trust scores from genuine reviews, and improve our service — balanced against your rights.",
    "privacy.lawful.consent.label": "Consent:",
    "privacy.lawful.consent.body":
      "for optional marketing emails and non-essential cookies, which you can withdraw at any time.",
    "privacy.lawful.note":
      "Verification documents are special-category-adjacent and treated with heightened safeguards: strict access controls, encryption and minimal retention.",

    "privacy.share.title": "4. How we share data",
    "privacy.share.p1":
      "ParkGo is a marketplace, so some data must be shared to deliver a booking. We share the minimum necessary: a host sees the vehicle details and arrival window for a confirmed booking; the independent licensed transfer operator receives, via a secure API, only what its driver needs to complete the transfer and handover. We also use trusted processors — for payments, hosting, identity verification and communications — under written contracts that require them to protect your data and use it only on our instructions.",
    "privacy.share.p2":
      "We never sell your personal data. We may disclose data where required by law, or to protect the safety of our users and the integrity of the platform.",

    "privacy.transfers.title": "5. International transfers",
    "privacy.transfers.body":
      "Where data is transferred outside the UK or EEA, we rely on adequacy decisions or appropriate safeguards such as the UK International Data Transfer Agreement or Standard Contractual Clauses, so your data remains protected to an equivalent standard.",

    "privacy.retention.title": "6. How long we keep it",
    "privacy.retention.body":
      "We keep personal data only as long as necessary. Booking and payment records are retained for as long as required for tax, accounting and dispute purposes (typically up to six years). KYC documents are retained for the period required by anti-fraud and licensing obligations and then securely deleted. Marketing data is kept until you unsubscribe. Inactive accounts are reviewed and deleted in line with these periods.",

    "privacy.rights.title": "7. Your rights",
    "privacy.rights.intro": "Under data-protection law you have the right to:",
    "privacy.rights.access": "access a copy of the personal data we hold about you;",
    "privacy.rights.rectify": "have inaccurate data corrected;",
    "privacy.rights.erase":
      "request erasure of your data where there is no overriding legal reason to keep it;",
    "privacy.rights.restrict": "restrict or object to certain processing;",
    "privacy.rights.portability": "data portability for data you provided to us;",
    "privacy.rights.withdraw":
      "withdraw consent at any time where processing relies on consent.",
    "privacy.rights.note":
      "To exercise any of these rights, contact our Data Protection Officer using the details below. We will respond within one month. You also have the right to complain to the ICO (in the UK) or the Data Protection Commission (in Ireland), though we hope you will contact us first so we can put things right.",

    "privacy.cookies.title": "8. Cookies",
    "privacy.cookies.body":
      "We use essential cookies to keep you signed in and the service secure, and — only with your consent — analytics cookies that help us understand how the site is used. You can manage non-essential cookies through your browser settings and our cookie controls. Essential cookies cannot be switched off as the service will not function without them.",

    "privacy.security.title": "9. Security",
    "privacy.security.body":
      "We protect personal data with encryption in transit and at rest, strict role-based access controls, and a clear separation between everyday account data and sensitive KYC documents. Access to verification material is limited to our trust and safety function on a need-to-know basis and is logged.",

    "privacy.dpo.title": "10. Contact our DPO",
    "privacy.dpo.intro":
      "For any privacy question or to exercise your rights, contact our Data Protection Officer:",
    "privacy.dpo.emailLabel": "Email:",
    "privacy.dpo.post": "Post: Data Protection Officer, PARKGO LIMITED, 128 City Road, London, EC1V 2NX, United Kingdom",
    "privacy.dpo.updates":
      "We may update this policy from time to time. When we do, we will revise the “last updated” date above and, for significant changes, let you know directly.",

    // ---------------------------------------------------------------- Terms
    "terms.hero.title": "Terms of Service",
    "terms.hero.intro":
      "These terms set out the agreement between you and ParkGo when you use our marketplace to book parking, transfers and EV charging, or to list a space as a host.",
    "terms.lastUpdated": "Last updated:",

    "terms.role.title": "1. Our role as a marketplace",
    "terms.role.p1":
      "ParkGo operates an online marketplace that connects travellers with independent hosts who provide private parking spaces, and with an independent licensed transfer operator who provides terminal transfers. Unless we state otherwise in writing, ParkGo is not the provider of the parking space or the transfer; we facilitate the booking, take payment and provide the supporting technology.",
    "terms.role.p2":
      "The contract for parking is between you and the host; the transfer is delivered by the independent licensed transfer operator, whose service is integrated with ParkGo by API. ParkGo verifies hosts before they join, and you acknowledge that hosts and the transfer operator are independent businesses responsible for their own licensing, insurance and compliance.",

    "terms.eligibility.title": "2. Eligibility and your account",
    "terms.eligibility.body":
      "You must be at least 18 and able to enter a legally binding contract. You agree to provide accurate information, keep your account secure, and not share your access credentials. You are responsible for activity that takes place under your account.",

    "terms.bookings.title": "3. Bookings and payments",
    "terms.bookings.intro":
      "When you book, you purchase a bundle that may include parking, a licensed transfer and EV charging at a single transparent price shown before you pay. The price you see at checkout is the price you pay. Prices are shown in pounds sterling for UK airports and euro for Irish airports.",
    "terms.bookings.confirm": "A booking is confirmed once payment has been successfully taken.",
    "terms.bookings.payments":
      "Payments are processed by our regulated payment provider; ParkGo collects payment and distributes the host and transfer operator shares, retaining its service and commission fees.",
    "terms.bookings.ev":
      "EV charging, where included, is priced per kilowatt-hour as shown on the listing and forms part of your total.",

    "terms.cancellations.title": "4. Changes and cancellations",
    "terms.cancellations.body":
      "Travel plans change, so our cancellation policy is simple and shown before you pay. You can cancel a paid booking free of charge until 24 hours before your drop-off time and receive a full refund. If you cancel within 24 hours of drop-off, a late-cancellation fee of 20% of the booking total is retained and the remaining 80% is refunded. A booking can no longer be cancelled once the drop-off time has passed. Refunds go back to your original payment method, typically within 5–10 working days. If a host or the transfer operator cancels or cannot honour a confirmed booking, you receive a full refund and we will help you find an alternative where possible.",

    "terms.hostObligations.title": "5. Host obligations",
    "terms.hostObligations.intro": "If you list a space, you agree that you will:",
    "terms.hostObligations.right":
      "have the legal right to offer the space and comply with any tenancy, mortgage, lease or planning conditions;",
    "terms.hostObligations.verify":
      "complete identity and right-to-list verification and keep your details current;",
    "terms.hostObligations.describe":
      "describe the space accurately, including distance, size, security features and any EV charging;",
    "terms.hostObligations.available":
      "make the space available for confirmed bookings and provide safe, lawful access;",
    "terms.hostObligations.insurance":
      "hold appropriate insurance for offering your space to third parties.",

    "terms.operator.title": "6. The transfer operator",
    "terms.operator.intro":
      "Terminal transfers are provided by an independent licensed transfer operator whose service is integrated with ParkGo by API. ParkGo does not operate a fleet or engage drivers directly. The operator is solely responsible for:",
    "terms.operator.licence":
      "holding and maintaining a valid private-hire operator licence and the required commercial passenger insurance;",
    "terms.operator.drivers":
      "ensuring every driver is correctly licensed, badged and verified, and every vehicle is roadworthy and insured;",
    "terms.operator.compliance": "its own compliance, record-keeping and periodic re-verification;",
    "terms.operator.handover":
      "completing the verified handover process and meeting the service standards shown to travellers.",

    "terms.handover.title": "7. Verified handover and live features",
    "terms.handover.body":
      "On travel day, the licensed driver, host and traveller may share a live location and must confirm a one-time handover code. This code is timestamped and logged as a security record. Live camera features, where offered by a host, are provided to give travellers reassurance and must not be misused.",

    "terms.prohibited.title": "8. Prohibited use",
    "terms.prohibited.intro": "You agree not to:",
    "terms.prohibited.unlawful": "use the platform for any unlawful purpose or to facilitate fraud;",
    "terms.prohibited.noRight": "list a space you have no right to offer;",
    "terms.prohibited.circumvent":
      "circumvent ParkGo to take bookings or payments off-platform;",
    "terms.prohibited.misrepresent": "misrepresent identity, vehicle or verification details;",
    "terms.prohibited.interfere":
      "interfere with the platform’s security, scrape data, or misuse live location or camera features.",
    "terms.prohibited.note":
      "We may suspend or remove accounts that breach these terms or threaten the safety of our community.",

    "terms.fees.title": "9. Fees and taxes",
    "terms.fees.body":
      "ParkGo charges a service fee to travellers and a commission to hosts, as disclosed at the point of booking or in your host agreement. The transfer operator is remunerated under its own commercial agreement with ParkGo. You are responsible for your own tax obligations arising from income earned through the platform.",

    "terms.liability.title": "10. Liability",
    "terms.liability.body":
      "Nothing in these terms limits liability that cannot be limited by law, including for death or personal injury caused by negligence, or for fraud. Subject to that, ParkGo is not liable for the acts or omissions of independent hosts or the independent licensed transfer operator, and our total liability to you for any claim connected with a booking is limited to the amount you paid for that booking. We are not liable for indirect or consequential loss. These terms do not affect the statutory rights of consumers.",

    "terms.disputes.title": "11. Disputes and complaints",
    "terms.disputes.pre": "If something goes wrong, please contact our support team first via",
    "terms.disputes.link": "our contact page",
    "terms.disputes.post":
      "so we can help resolve it quickly. We operate a clear process for booking disputes, refunds and handover issues.",

    "terms.governingLaw.title": "12. Governing law",
    "terms.governingLaw.body":
      "For travellers and hosts in the United Kingdom, these terms are governed by the laws of England and Wales, and the courts of England and Wales have non-exclusive jurisdiction. For users of our Irish service, these terms are governed by the laws of Ireland, and the Irish courts have non-exclusive jurisdiction. Consumers may also have the right to bring proceedings in their country of residence.",

    "terms.changes.title": "13. Changes to these terms",
    "terms.changes.body":
      "We may update these terms to reflect changes to the service or the law. We will revise the “last updated” date above and, for material changes, give you reasonable notice. Continued use of ParkGo after changes take effect means you accept the updated terms.",
  },

  ur: {
    // -------------------------------------------------------------- Privacy
    "privacy.hero.title": "پرائیویسی پالیسی",
    "privacy.hero.intro":
      "پارک گو اس طرح بنایا گیا ہے کہ اعتماد ہی اصل پروڈکٹ ہو۔ ہم کم سے کم ممکن ذاتی ڈیٹا جمع کرتے ہیں، حساس تصدیقی دستاویزات کو الگ اور خفیہ کاری شدہ رکھتے ہیں، اور آپ کو اپنی معلومات پر واضح کنٹرول دیتے ہیں۔",
    "privacy.lastUpdated": "آخری بار تازہ کاری:",

    "privacy.who.title": "1. ہم کون ہیں",
    "privacy.who.p1":
      "یہ پالیسی وضاحت کرتی ہے کہ جب آپ برطانیہ اور آئرلینڈ بھر میں ہماری ویب سائٹ اور ایپس استعمال کرتے ہیں تو پارک گو (”ParkGo“، ”ہم“) ذاتی ڈیٹا کو کیسے سنبھالتا ہے۔ ڈیٹا کے تحفظ کے مقاصد کے لیے، پارک گو یہاں بیان کردہ ذاتی ڈیٹا کا ڈیٹا کنٹرولر ہے۔",
    "privacy.who.p2":
      "ہم برطانیہ کے جنرل ڈیٹا پروٹیکشن ریگولیشن (UK GDPR) اور ڈیٹا پروٹیکشن ایکٹ 2018 کی تعمیل کرتے ہیں، اور جہاں آئرش سروس لاگو ہوتی ہے وہاں EU GDPR کی۔ ہم انفارمیشن کمشنر آفس (ICO) کے شائع کردہ معیارات اور ضوابط سے رہنمائی لیتے ہیں۔",

    "privacy.data.title": "2. جو ڈیٹا ہم جمع کرتے ہیں",
    "privacy.data.intro": "ہم صرف وہی جمع کرتے ہیں جو مارکیٹ پلیس کو محفوظ طریقے سے چلانے کے لیے درکار ہو:",
    "privacy.data.traveller.label": "مسافر کی تفصیلات (کم سے کم):",
    "privacy.data.traveller.body":
      "آپ کا نام، ای میل، فون نمبر، ترجیحی زبان اور گاڑی کی بنیادی معلومات (میک، ماڈل، رنگ، رجسٹریشن اور سائز) تاکہ میزبان اور لائسنس یافتہ ڈرائیور درست گاڑی کی شناخت کر سکیں۔ ہم مسافروں سے شناختی دستاویزات نہیں مانگتے۔",
    "privacy.data.kyc.label": "میزبان کی تصدیق (KYC):",
    "privacy.data.kyc.body":
      "شناختی دستاویزات، پتے کا ثبوت اور فہرست بندی کے حق کے اعلانات۔ یہ حساس مواد صرف میزبانوں سے جمع کیا جاتا ہے، ایک الگ، رسائی کے کنٹرول والے اسٹور میں رکھا جاتا ہے، اور خفیہ کاری شدہ ہوتا ہے۔ آزاد لائسنس یافتہ ٹرانسفر آپریٹر اپنے ڈرائیور اور گاڑی کی لائسنسنگ اور انشورنس خود سنبھالتا ہے۔",
    "privacy.data.booking.label": "بکنگ اور ادائیگی کا ڈیٹا:",
    "privacy.data.booking.body":
      "وہ بنڈل جو آپ بک کرتے ہیں، تاریخیں، قیمت اور ادائیگی کا حوالہ۔ کارڈ کی تفصیلات ہمارے ریگولیٹڈ ادائیگی فراہم کنندہ کے ذریعے پروسیس ہوتی ہیں؛ ہم مکمل کارڈ نمبر محفوظ نہیں کرتے۔",
    "privacy.data.travelDay.label": "سفر کے دن کا ڈیٹا:",
    "privacy.data.travelDay.body":
      "فعال ٹرانسفر کے دوران لائیو مقام اور ہینڈ اوور کی تصدیقات، جو سروس فراہم کرنے اور حفاظتی ریکارڈ مہیا کرنے کے لیے استعمال ہوتی ہیں۔",
    "privacy.data.technical.label": "تکنیکی ڈیٹا:",
    "privacy.data.technical.body":
      "ڈیوائس، لاگ اور کوکی ڈیٹا جو سروس کو محفوظ اور فعال رکھنے کے لیے درکار ہے۔",

    "privacy.lawful.title": "3. پروسیسنگ کی قانونی بنیادیں",
    "privacy.lawful.intro": "ہم UK GDPR کے آرٹیکل 6 کے تحت درج ذیل قانونی بنیادوں پر انحصار کرتے ہیں:",
    "privacy.lawful.contract.label": "معاہدہ:",
    "privacy.lawful.contract.body":
      "آپ کا اکاؤنٹ بنانے، بکنگز لینے، ادائیگیوں کو پروسیس کرنے اور ٹرانسفرز اور ہینڈ اوورز فراہم کرنے کے لیے۔",
    "privacy.lawful.legal.label": "قانونی ذمہ داری:",
    "privacy.lawful.legal.body":
      "میزبانوں کی تصدیق کرنے، دھوکہ دہی کو روکنے اور ٹیکس اور لائسنسنگ کے تقاضے پورے کرنے کے لیے۔",
    "privacy.lawful.interests.label": "جائز مفادات:",
    "privacy.lawful.interests.body":
      "پلیٹ فارم کو محفوظ رکھنے، اصل جائزوں سے اعتماد کے اسکور نکالنے، اور اپنی سروس کو بہتر بنانے کے لیے — آپ کے حقوق کے ساتھ توازن رکھتے ہوئے۔",
    "privacy.lawful.consent.label": "رضامندی:",
    "privacy.lawful.consent.body":
      "اختیاری مارکیٹنگ ای میلز اور غیر ضروری کوکیز کے لیے، جنہیں آپ کسی بھی وقت واپس لے سکتے ہیں۔",
    "privacy.lawful.note":
      "تصدیقی دستاویزات خصوصی زمرے سے قریبی نوعیت کی ہیں اور ان کے ساتھ بڑھے ہوئے حفاظتی اقدامات کیے جاتے ہیں: سخت رسائی کنٹرول، خفیہ کاری اور کم سے کم برقراری۔",

    "privacy.share.title": "4. ہم ڈیٹا کیسے شیئر کرتے ہیں",
    "privacy.share.p1":
      "پارک گو ایک مارکیٹ پلیس ہے، اس لیے بکنگ فراہم کرنے کے لیے کچھ ڈیٹا شیئر کرنا ضروری ہوتا ہے۔ ہم صرف کم سے کم ضروری شیئر کرتے ہیں: میزبان تصدیق شدہ بکنگ کے لیے گاڑی کی تفصیلات اور آمد کا وقت دیکھتا ہے؛ آزاد لائسنس یافتہ ٹرانسفر آپریٹر ایک محفوظ API کے ذریعے صرف وہی وصول کرتا ہے جو اس کے ڈرائیور کو ٹرانسفر اور ہینڈ اوور مکمل کرنے کے لیے درکار ہو۔ ہم قابلِ اعتماد پروسیسرز بھی استعمال کرتے ہیں — ادائیگیوں، ہوسٹنگ، شناختی تصدیق اور رابطوں کے لیے — تحریری معاہدوں کے تحت جو ان سے آپ کے ڈیٹا کی حفاظت اور اسے صرف ہماری ہدایات پر استعمال کرنے کا تقاضا کرتے ہیں۔",
    "privacy.share.p2":
      "ہم کبھی آپ کا ذاتی ڈیٹا فروخت نہیں کرتے۔ ہم ڈیٹا کا انکشاف کر سکتے ہیں جہاں قانون کی ضرورت ہو، یا اپنے صارفین کی حفاظت اور پلیٹ فارم کی سالمیت کے تحفظ کے لیے۔",

    "privacy.transfers.title": "5. بین الاقوامی منتقلی",
    "privacy.transfers.body":
      "جہاں ڈیٹا برطانیہ یا EEA سے باہر منتقل کیا جاتا ہے، ہم مناسبیت کے فیصلوں یا مناسب حفاظتی اقدامات جیسے UK انٹرنیشنل ڈیٹا ٹرانسفر ایگریمنٹ یا اسٹینڈرڈ کنٹریکچوئل کلاجز پر انحصار کرتے ہیں، تاکہ آپ کا ڈیٹا مساوی معیار تک محفوظ رہے۔",

    "privacy.retention.title": "6. ہم اسے کتنی دیر رکھتے ہیں",
    "privacy.retention.body":
      "ہم ذاتی ڈیٹا صرف اتنی دیر رکھتے ہیں جتنا ضروری ہو۔ بکنگ اور ادائیگی کے ریکارڈ ٹیکس، اکاؤنٹنگ اور تنازعات کے مقاصد کے لیے جتنا درکار ہو رکھے جاتے ہیں (عام طور پر چھ سال تک)۔ KYC دستاویزات انسدادِ دھوکہ دہی اور لائسنسنگ کی ذمہ داریوں کے تحت درکار مدت تک رکھی جاتی ہیں اور پھر محفوظ طریقے سے حذف کر دی جاتی ہیں۔ مارکیٹنگ ڈیٹا اس وقت تک رکھا جاتا ہے جب تک آپ ان سبسکرائب نہ کر دیں۔ غیر فعال اکاؤنٹس کا جائزہ لیا جاتا ہے اور انہیں ان مدتوں کے مطابق حذف کر دیا جاتا ہے۔",

    "privacy.rights.title": "7. آپ کے حقوق",
    "privacy.rights.intro": "ڈیٹا کے تحفظ کے قانون کے تحت آپ کو یہ حق حاصل ہے کہ:",
    "privacy.rights.access": "ہمارے پاس موجود آپ کے ذاتی ڈیٹا کی ایک کاپی تک رسائی حاصل کریں؛",
    "privacy.rights.rectify": "غلط ڈیٹا کو درست کروائیں؛",
    "privacy.rights.erase":
      "اپنے ڈیٹا کو حذف کرنے کی درخواست کریں جہاں اسے رکھنے کی کوئی غالب قانونی وجہ نہ ہو؛",
    "privacy.rights.restrict": "بعض پروسیسنگ کو محدود کریں یا اس پر اعتراض کریں؛",
    "privacy.rights.portability": "اس ڈیٹا کی پورٹیبلٹی جو آپ نے ہمیں فراہم کیا؛",
    "privacy.rights.withdraw":
      "جہاں پروسیسنگ رضامندی پر منحصر ہو وہاں کسی بھی وقت رضامندی واپس لیں۔",
    "privacy.rights.note":
      "ان میں سے کسی بھی حق کو استعمال کرنے کے لیے، نیچے دی گئی تفصیلات کے ذریعے ہمارے ڈیٹا پروٹیکشن آفیسر سے رابطہ کریں۔ ہم ایک ماہ کے اندر جواب دیں گے۔ آپ کو ICO (برطانیہ میں) یا ڈیٹا پروٹیکشن کمیشن (آئرلینڈ میں) سے شکایت کرنے کا بھی حق ہے، اگرچہ ہم امید کرتے ہیں کہ آپ پہلے ہم سے رابطہ کریں گے تاکہ ہم معاملات درست کر سکیں۔",

    "privacy.cookies.title": "8. کوکیز",
    "privacy.cookies.body":
      "ہم آپ کو سائن ان رکھنے اور سروس کو محفوظ رکھنے کے لیے ضروری کوکیز استعمال کرتے ہیں، اور — صرف آپ کی رضامندی سے — تجزیاتی کوکیز جو ہمیں یہ سمجھنے میں مدد دیتی ہیں کہ سائٹ کیسے استعمال ہوتی ہے۔ آپ اپنے براؤزر کی ترتیبات اور ہمارے کوکی کنٹرولز کے ذریعے غیر ضروری کوکیز کا نظم کر سکتے ہیں۔ ضروری کوکیز کو بند نہیں کیا جا سکتا کیونکہ ان کے بغیر سروس کام نہیں کرے گی۔",

    "privacy.security.title": "9. سلامتی",
    "privacy.security.body":
      "ہم ذاتی ڈیٹا کو منتقلی اور ذخیرے کے دوران خفیہ کاری، سخت کردار پر مبنی رسائی کنٹرول، اور روزمرہ کے اکاؤنٹ ڈیٹا اور حساس KYC دستاویزات کے درمیان واضح علیحدگی سے محفوظ رکھتے ہیں۔ تصدیقی مواد تک رسائی صرف ہمارے اعتماد اور حفاظت کے شعبے تک ضرورت کی بنیاد پر محدود ہے اور اسے لاگ کیا جاتا ہے۔",

    "privacy.dpo.title": "10. ہمارے ڈی پی او سے رابطہ کریں",
    "privacy.dpo.intro":
      "کسی بھی پرائیویسی سوال کے لیے یا اپنے حقوق کو استعمال کرنے کے لیے، ہمارے ڈیٹا پروٹیکشن آفیسر سے رابطہ کریں:",
    "privacy.dpo.emailLabel": "ای میل:",
    "privacy.dpo.post": "ڈاک: Data Protection Officer, PARKGO LIMITED, 128 City Road, London, EC1V 2NX, United Kingdom",
    "privacy.dpo.updates":
      "ہم وقتاً فوقتاً اس پالیسی کو تازہ کر سکتے ہیں۔ جب ہم ایسا کریں گے، تو ہم اوپر دی گئی ”آخری بار تازہ کاری“ کی تاریخ کو تبدیل کریں گے اور اہم تبدیلیوں کے لیے آپ کو براہ راست مطلع کریں گے۔",

    // ---------------------------------------------------------------- Terms
    "terms.hero.title": "سروس کی شرائط",
    "terms.hero.intro":
      "یہ شرائط آپ اور پارک گو کے درمیان معاہدہ طے کرتی ہیں جب آپ پارکنگ، ٹرانسفرز اور ای وی چارجنگ بک کرنے، یا میزبان کے طور پر جگہ درج کرنے کے لیے ہماری مارکیٹ پلیس استعمال کرتے ہیں۔",
    "terms.lastUpdated": "آخری بار تازہ کاری:",

    "terms.role.title": "1. مارکیٹ پلیس کے طور پر ہمارا کردار",
    "terms.role.p1":
      "پارک گو ایک آن لائن مارکیٹ پلیس چلاتا ہے جو مسافروں کو آزاد میزبانوں سے جوڑتا ہے جو نجی پارکنگ کی جگہیں فراہم کرتے ہیں، اور ایک آزاد لائسنس یافتہ ٹرانسفر آپریٹر سے جو ٹرمینل ٹرانسفرز فراہم کرتا ہے۔ جب تک ہم تحریری طور پر بصورتِ دیگر بیان نہ کریں، پارک گو پارکنگ کی جگہ یا ٹرانسفر کا فراہم کنندہ نہیں ہے؛ ہم بکنگ کو سہل بناتے ہیں، ادائیگی لیتے ہیں اور معاون ٹیکنالوجی فراہم کرتے ہیں۔",
    "terms.role.p2":
      "پارکنگ کا معاہدہ آپ اور میزبان کے درمیان ہوتا ہے؛ ٹرانسفر آزاد لائسنس یافتہ ٹرانسفر آپریٹر کے ذریعے فراہم کیا جاتا ہے، جس کی سروس API کے ذریعے پارک گو کے ساتھ مربوط ہے۔ پارک گو میزبانوں کے شامل ہونے سے پہلے ان کی تصدیق کرتا ہے، اور آپ تسلیم کرتے ہیں کہ میزبان اور ٹرانسفر آپریٹر آزاد کاروبار ہیں جو اپنی لائسنسنگ، انشورنس اور تعمیل کے خود ذمہ دار ہیں۔",

    "terms.eligibility.title": "2. اہلیت اور آپ کا اکاؤنٹ",
    "terms.eligibility.body":
      "آپ کی عمر کم از کم 18 سال ہونی چاہیے اور آپ قانونی طور پر پابند معاہدہ کرنے کے قابل ہوں۔ آپ درست معلومات فراہم کرنے، اپنا اکاؤنٹ محفوظ رکھنے، اور اپنے رسائی کے اسناد شیئر نہ کرنے پر متفق ہیں۔ آپ اپنے اکاؤنٹ کے تحت ہونے والی سرگرمی کے ذمہ دار ہیں۔",

    "terms.bookings.title": "3. بکنگز اور ادائیگیاں",
    "terms.bookings.intro":
      "جب آپ بک کرتے ہیں، تو آپ ایک بنڈل خریدتے ہیں جس میں پارکنگ، ایک لائسنس یافتہ ٹرانسفر اور ای وی چارجنگ شامل ہو سکتی ہے، ایک واحد شفاف قیمت پر جو ادائیگی سے پہلے دکھائی جاتی ہے۔ چیک آؤٹ پر آپ جو قیمت دیکھتے ہیں وہی آپ ادا کرتے ہیں۔ قیمتیں برطانوی ایئرپورٹس کے لیے پاؤنڈ سٹرلنگ اور آئرش ایئرپورٹس کے لیے یورو میں دکھائی جاتی ہیں۔",
    "terms.bookings.confirm": "ادائیگی کامیابی سے وصول ہو جانے پر بکنگ کی تصدیق ہو جاتی ہے۔",
    "terms.bookings.payments":
      "ادائیگیاں ہمارے ریگولیٹڈ ادائیگی فراہم کنندہ کے ذریعے پروسیس ہوتی ہیں؛ پارک گو ادائیگی جمع کرتا ہے اور میزبان اور ٹرانسفر آپریٹر کے حصے تقسیم کرتا ہے، اپنی سروس اور کمیشن فیس رکھتے ہوئے۔",
    "terms.bookings.ev":
      "ای وی چارجنگ، جہاں شامل ہو، فہرست پر دکھائے گئے مطابق فی کلوواٹ گھنٹہ کے حساب سے قیمت رکھتی ہے اور آپ کی کل میں شامل ہوتی ہے۔",

    "terms.cancellations.title": "4. تبدیلیاں اور منسوخیاں",
    "terms.cancellations.body":
      "سفری منصوبے بدلتے رہتے ہیں، اس لیے ہماری منسوخی پالیسی سادہ ہے اور ادائیگی سے پہلے دکھائی جاتی ہے۔ آپ ادا شدہ بکنگ ڈراپ آف وقت سے 24 گھنٹے پہلے تک مفت منسوخ کر کے مکمل ریفنڈ حاصل کر سکتے ہیں۔ اگر آپ ڈراپ آف کے 24 گھنٹوں کے اندر منسوخ کریں تو بکنگ کے کل کا 20% لیٹ کینسلیشن فیس کے طور پر رکھا جاتا ہے اور باقی 80% ریفنڈ ہوتا ہے۔ ڈراپ آف کا وقت گزر جانے کے بعد بکنگ منسوخ نہیں ہو سکتی۔ ریفنڈ آپ کے اصل ادائیگی کے ذریعے پر واپس جاتا ہے، عموماً 5–10 کاروباری دنوں میں۔ اگر میزبان یا ٹرانسفر آپریٹر منسوخ کرے یا تصدیق شدہ بکنگ پوری نہ کر سکے تو آپ کو مکمل ریفنڈ ملتا ہے اور ہم جہاں ممکن ہو متبادل تلاش کرنے میں مدد کریں گے۔",

    "terms.hostObligations.title": "5. میزبان کی ذمہ داریاں",
    "terms.hostObligations.intro": "اگر آپ کوئی جگہ درج کرتے ہیں، تو آپ متفق ہیں کہ آپ:",
    "terms.hostObligations.right":
      "جگہ پیش کرنے کا قانونی حق رکھیں گے اور کسی بھی کرایہ داری، رہن، لیز یا منصوبہ بندی کی شرائط کی تعمیل کریں گے؛",
    "terms.hostObligations.verify":
      "شناخت اور فہرست بندی کے حق کی تصدیق مکمل کریں گے اور اپنی تفصیلات موجودہ رکھیں گے؛",
    "terms.hostObligations.describe":
      "جگہ کو درست طریقے سے بیان کریں گے، بشمول فاصلہ، سائز، حفاظتی خصوصیات اور کوئی بھی ای وی چارجنگ؛",
    "terms.hostObligations.available":
      "تصدیق شدہ بکنگز کے لیے جگہ دستیاب کریں گے اور محفوظ، قانونی رسائی فراہم کریں گے؛",
    "terms.hostObligations.insurance":
      "تیسرے فریقین کو اپنی جگہ پیش کرنے کے لیے مناسب انشورنس رکھیں گے۔",

    "terms.operator.title": "6. ٹرانسفر آپریٹر",
    "terms.operator.intro":
      "ٹرمینل ٹرانسفرز ایک آزاد لائسنس یافتہ ٹرانسفر آپریٹر فراہم کرتا ہے جس کی سروس API کے ذریعے پارک گو کے ساتھ مربوط ہے۔ پارک گو نہ کوئی بیڑہ چلاتا ہے اور نہ براہ راست ڈرائیورز کو ملازم رکھتا ہے۔ آپریٹر مکمل طور پر ان کا ذمہ دار ہے:",
    "terms.operator.licence":
      "ایک درست پرائیویٹ ہائر آپریٹر لائسنس اور درکار تجارتی مسافر انشورنس رکھنا اور برقرار رکھنا؛",
    "terms.operator.drivers":
      "یہ یقینی بنانا کہ ہر ڈرائیور درست طور پر لائسنس یافتہ، بیج یافتہ اور تصدیق شدہ ہے، اور ہر گاڑی سڑک کے قابل اور انشور شدہ ہے؛",
    "terms.operator.compliance": "اپنی تعمیل، ریکارڈ کیپنگ اور وقتاً فوقتاً دوبارہ تصدیق؛",
    "terms.operator.handover":
      "تصدیق شدہ ہینڈ اوور کا عمل مکمل کرنا اور مسافروں کو دکھائے گئے سروس معیارات پر پورا اترنا۔",

    "terms.handover.title": "7. تصدیق شدہ ہینڈ اوور اور لائیو خصوصیات",
    "terms.handover.body":
      "سفر کے دن، لائسنس یافتہ ڈرائیور، میزبان اور مسافر لائیو مقام شیئر کر سکتے ہیں اور انہیں ایک بار استعمال ہونے والے ہینڈ اوور کوڈ کی تصدیق کرنی ہوگی۔ اس کوڈ پر وقت درج ہوتا ہے اور اسے حفاظتی ریکارڈ کے طور پر لاگ کیا جاتا ہے۔ لائیو کیمرہ خصوصیات، جہاں میزبان پیش کرے، مسافروں کو اطمینان دینے کے لیے فراہم کی جاتی ہیں اور ان کا غلط استعمال نہیں کیا جانا چاہیے۔",

    "terms.prohibited.title": "8. ممنوعہ استعمال",
    "terms.prohibited.intro": "آپ متفق ہیں کہ آپ یہ نہیں کریں گے:",
    "terms.prohibited.unlawful": "پلیٹ فارم کو کسی غیر قانونی مقصد کے لیے یا دھوکہ دہی میں سہولت کے لیے استعمال کرنا؛",
    "terms.prohibited.noRight": "ایسی جگہ درج کرنا جسے پیش کرنے کا آپ کو کوئی حق نہیں؛",
    "terms.prohibited.circumvent":
      "پلیٹ فارم سے باہر بکنگز یا ادائیگیاں لینے کے لیے پارک گو کو نظرانداز کرنا؛",
    "terms.prohibited.misrepresent": "شناخت، گاڑی یا تصدیقی تفصیلات کو غلط طریقے سے پیش کرنا؛",
    "terms.prohibited.interfere":
      "پلیٹ فارم کی سلامتی میں مداخلت کرنا، ڈیٹا کو اسکریپ کرنا، یا لائیو مقام یا کیمرہ خصوصیات کا غلط استعمال کرنا۔",
    "terms.prohibited.note":
      "ہم ان اکاؤنٹس کو معطل یا ہٹا سکتے ہیں جو ان شرائط کی خلاف ورزی کرتے ہیں یا ہماری کمیونٹی کی حفاظت کو خطرے میں ڈالتے ہیں۔",

    "terms.fees.title": "9. فیس اور ٹیکس",
    "terms.fees.body":
      "پارک گو مسافروں سے سروس فیس اور میزبانوں سے کمیشن وصول کرتا ہے، جیسا کہ بکنگ کے وقت یا آپ کے میزبان معاہدے میں ظاہر کیا جاتا ہے۔ ٹرانسفر آپریٹر کو پارک گو کے ساتھ اس کے اپنے تجارتی معاہدے کے تحت معاوضہ دیا جاتا ہے۔ آپ پلیٹ فارم کے ذریعے کمائی گئی آمدنی سے پیدا ہونے والی اپنی ٹیکس ذمہ داریوں کے خود ذمہ دار ہیں۔",

    "terms.liability.title": "10. ذمہ داری",
    "terms.liability.body":
      "ان شرائط میں کوئی چیز اس ذمہ داری کو محدود نہیں کرتی جسے قانون کے تحت محدود نہیں کیا جا سکتا، بشمول غفلت کی وجہ سے موت یا ذاتی چوٹ، یا دھوکہ دہی کے لیے۔ اس کے تابع، پارک گو آزاد میزبانوں یا آزاد لائسنس یافتہ ٹرانسفر آپریٹر کے اعمال یا کوتاہیوں کا ذمہ دار نہیں ہے، اور کسی بکنگ سے منسلک کسی بھی دعوے کے لیے آپ کے حوالے سے ہماری کل ذمہ داری اس رقم تک محدود ہے جو آپ نے اس بکنگ کے لیے ادا کی۔ ہم بالواسطہ یا نتیجتاً ہونے والے نقصان کے ذمہ دار نہیں ہیں۔ یہ شرائط صارفین کے قانونی حقوق کو متاثر نہیں کرتیں۔",

    "terms.disputes.title": "11. تنازعات اور شکایات",
    "terms.disputes.pre": "اگر کچھ غلط ہو جائے، تو براہ کرم پہلے ہماری سپورٹ ٹیم سے رابطہ کریں بذریعہ",
    "terms.disputes.link": "ہمارا رابطہ صفحہ",
    "terms.disputes.post":
      "تاکہ ہم اسے جلد حل کرنے میں مدد کر سکیں۔ ہم بکنگ کے تنازعات، رقم کی واپسی اور ہینڈ اوور کے مسائل کے لیے ایک واضح عمل چلاتے ہیں۔",

    "terms.governingLaw.title": "12. قابلِ اطلاق قانون",
    "terms.governingLaw.body":
      "برطانیہ میں مسافروں اور میزبانوں کے لیے، یہ شرائط انگلینڈ اور ویلز کے قوانین کے تحت چلائی جاتی ہیں، اور انگلینڈ اور ویلز کی عدالتوں کو غیر خصوصی دائرہ اختیار حاصل ہے۔ ہماری آئرش سروس کے صارفین کے لیے، یہ شرائط آئرلینڈ کے قوانین کے تحت چلائی جاتی ہیں، اور آئرش عدالتوں کو غیر خصوصی دائرہ اختیار حاصل ہے۔ صارفین کو اپنے ملکِ رہائش میں کارروائی لانے کا حق بھی حاصل ہو سکتا ہے۔",

    "terms.changes.title": "13. ان شرائط میں تبدیلیاں",
    "terms.changes.body":
      "ہم سروس یا قانون میں تبدیلیوں کی عکاسی کے لیے ان شرائط کو تازہ کر سکتے ہیں۔ ہم اوپر دی گئی ”آخری بار تازہ کاری“ کی تاریخ کو تبدیل کریں گے اور اہم تبدیلیوں کے لیے آپ کو مناسب نوٹس دیں گے۔ تبدیلیاں نافذ ہونے کے بعد پارک گو کا مسلسل استعمال اس بات کا مطلب ہے کہ آپ تازہ شدہ شرائط قبول کرتے ہیں۔",
  },

  hi: {
    // -------------------------------------------------------------- Privacy
    "privacy.hero.title": "गोपनीयता नीति",
    "privacy.hero.intro":
      "ParkGo इस तरह बनाया गया है कि भरोसा ही असली उत्पाद हो। हम यथासंभव कम व्यक्तिगत डेटा एकत्र करते हैं, संवेदनशील सत्यापन दस्तावेज़ों को अलग और एन्क्रिप्टेड रखते हैं, और आपको अपनी जानकारी पर स्पष्ट नियंत्रण देते हैं।",
    "privacy.lastUpdated": "अंतिम अद्यतन:",

    "privacy.who.title": "1. हम कौन हैं",
    "privacy.who.p1":
      "यह नीति बताती है कि जब आप यूके और आयरलैंड भर में हमारी वेबसाइट और ऐप्स का उपयोग करते हैं तो ParkGo (“ParkGo”, “हम”) व्यक्तिगत डेटा को कैसे संभालता है। डेटा-सुरक्षा उद्देश्यों के लिए, यहाँ वर्णित व्यक्तिगत डेटा के लिए ParkGo डेटा नियंत्रक है।",
    "privacy.who.p2":
      "हम यूके जनरल डेटा प्रोटेक्शन रेगुलेशन (UK GDPR) और डेटा प्रोटेक्शन एक्ट 2018 का पालन करते हैं, और जहाँ आयरिश सेवा लागू होती है वहाँ EU GDPR का। हम सूचना आयुक्त कार्यालय (ICO) द्वारा प्रकाशित मानकों और संहिताओं से मार्गदर्शन लेते हैं।",

    "privacy.data.title": "2. जो डेटा हम एकत्र करते हैं",
    "privacy.data.intro": "हम केवल वही एकत्र करते हैं जो मार्केटप्लेस को सुरक्षित रूप से चलाने के लिए आवश्यक हो:",
    "privacy.data.traveller.label": "यात्री विवरण (न्यूनतम):",
    "privacy.data.traveller.body":
      "आपका नाम, ईमेल, फ़ोन नंबर, पसंदीदा भाषा और वाहन की बुनियादी जानकारी (मेक, मॉडल, रंग, पंजीकरण और आकार) ताकि होस्ट और लाइसेंस प्राप्त ड्राइवर सही कार की पहचान कर सकें। हम यात्रियों से पहचान दस्तावेज़ नहीं माँगते।",
    "privacy.data.kyc.label": "होस्ट सत्यापन (KYC):",
    "privacy.data.kyc.body":
      "पहचान दस्तावेज़, पते का प्रमाण और लिस्टिंग-अधिकार घोषणाएँ। यह संवेदनशील सामग्री केवल होस्ट से एकत्र की जाती है, एक अलग, पहुँच-नियंत्रित भंडार में रखी जाती है, और एन्क्रिप्टेड होती है। स्वतंत्र लाइसेंस प्राप्त ट्रांसफर ऑपरेटर अपने ड्राइवर और वाहन की लाइसेंसिंग और बीमा स्वयं प्रबंधित करता है।",
    "privacy.data.booking.label": "बुकिंग और भुगतान डेटा:",
    "privacy.data.booking.body":
      "जो बंडल आप बुक करते हैं, तिथियाँ, कीमत और एक भुगतान संदर्भ। कार्ड विवरण हमारे विनियमित भुगतान प्रदाता द्वारा संसाधित किए जाते हैं; हम पूर्ण कार्ड नंबर संग्रहीत नहीं करते।",
    "privacy.data.travelDay.label": "यात्रा-दिवस डेटा:",
    "privacy.data.travelDay.body":
      "सक्रिय ट्रांसफर के दौरान लाइव स्थान और हैंडओवर पुष्टियाँ, जो सेवा प्रदान करने और सुरक्षा रिकॉर्ड उपलब्ध कराने के लिए उपयोग की जाती हैं।",
    "privacy.data.technical.label": "तकनीकी डेटा:",
    "privacy.data.technical.body":
      "डिवाइस, लॉग और कुकी डेटा जो सेवा को सुरक्षित और कार्यशील बनाए रखने के लिए आवश्यक है।",

    "privacy.lawful.title": "3. प्रसंस्करण के वैध आधार",
    "privacy.lawful.intro": "हम UK GDPR अनुच्छेद 6 के तहत निम्नलिखित वैध आधारों पर निर्भर करते हैं:",
    "privacy.lawful.contract.label": "अनुबंध:",
    "privacy.lawful.contract.body":
      "आपका खाता बनाने, बुकिंग लेने, भुगतान संसाधित करने और ट्रांसफर तथा हैंडओवर प्रदान करने के लिए।",
    "privacy.lawful.legal.label": "कानूनी दायित्व:",
    "privacy.lawful.legal.body":
      "होस्ट का सत्यापन करने, धोखाधड़ी रोकने और कर तथा लाइसेंसिंग आवश्यकताओं को पूरा करने के लिए।",
    "privacy.lawful.interests.label": "वैध हित:",
    "privacy.lawful.interests.body":
      "प्लेटफ़ॉर्म को सुरक्षित रखने, वास्तविक समीक्षाओं से भरोसा स्कोर की गणना करने, और अपनी सेवा को बेहतर बनाने के लिए — आपके अधिकारों के साथ संतुलित।",
    "privacy.lawful.consent.label": "सहमति:",
    "privacy.lawful.consent.body":
      "वैकल्पिक मार्केटिंग ईमेल और गैर-आवश्यक कुकीज़ के लिए, जिन्हें आप किसी भी समय वापस ले सकते हैं।",
    "privacy.lawful.note":
      "सत्यापन दस्तावेज़ विशेष-श्रेणी के निकट हैं और उन्हें बढ़ी हुई सुरक्षा के साथ संभाला जाता है: सख्त पहुँच नियंत्रण, एन्क्रिप्शन और न्यूनतम प्रतिधारण।",

    "privacy.share.title": "4. हम डेटा कैसे साझा करते हैं",
    "privacy.share.p1":
      "ParkGo एक मार्केटप्लेस है, इसलिए बुकिंग प्रदान करने के लिए कुछ डेटा साझा करना आवश्यक होता है। हम केवल न्यूनतम आवश्यक साझा करते हैं: एक होस्ट पुष्टि की गई बुकिंग के लिए वाहन विवरण और आगमन समय देखता है; स्वतंत्र लाइसेंस प्राप्त ट्रांसफर ऑपरेटर एक सुरक्षित API के माध्यम से केवल वही प्राप्त करता है जो उसके ड्राइवर को ट्रांसफर और हैंडओवर पूरा करने के लिए आवश्यक है। हम विश्वसनीय प्रोसेसर भी उपयोग करते हैं — भुगतान, होस्टिंग, पहचान सत्यापन और संचार के लिए — लिखित अनुबंधों के तहत जो उनसे आपके डेटा की सुरक्षा करने और इसे केवल हमारे निर्देशों पर उपयोग करने की अपेक्षा करते हैं।",
    "privacy.share.p2":
      "हम कभी आपका व्यक्तिगत डेटा नहीं बेचते। हम डेटा का खुलासा तब कर सकते हैं जब कानून द्वारा अपेक्षित हो, या अपने उपयोगकर्ताओं की सुरक्षा और प्लेटफ़ॉर्म की अखंडता की रक्षा के लिए।",

    "privacy.transfers.title": "5. अंतरराष्ट्रीय स्थानांतरण",
    "privacy.transfers.body":
      "जहाँ डेटा यूके या EEA के बाहर स्थानांतरित किया जाता है, हम पर्याप्तता निर्णयों या उपयुक्त सुरक्षा उपायों जैसे यूके अंतरराष्ट्रीय डेटा स्थानांतरण समझौता या मानक संविदात्मक खंडों पर निर्भर करते हैं, ताकि आपका डेटा समकक्ष मानक तक सुरक्षित रहे।",

    "privacy.retention.title": "6. हम इसे कितने समय तक रखते हैं",
    "privacy.retention.body":
      "हम व्यक्तिगत डेटा केवल आवश्यक अवधि तक रखते हैं। बुकिंग और भुगतान रिकॉर्ड कर, लेखांकन और विवाद उद्देश्यों के लिए आवश्यक अवधि तक रखे जाते हैं (आमतौर पर छह वर्ष तक)। KYC दस्तावेज़ धोखाधड़ी-रोधी और लाइसेंसिंग दायित्वों द्वारा आवश्यक अवधि तक रखे जाते हैं और फिर सुरक्षित रूप से हटा दिए जाते हैं। मार्केटिंग डेटा तब तक रखा जाता है जब तक आप सदस्यता समाप्त नहीं करते। निष्क्रिय खातों की समीक्षा की जाती है और इन अवधियों के अनुसार हटा दिया जाता है।",

    "privacy.rights.title": "7. आपके अधिकार",
    "privacy.rights.intro": "डेटा-सुरक्षा कानून के तहत आपको यह अधिकार है कि:",
    "privacy.rights.access": "हमारे पास मौजूद आपके व्यक्तिगत डेटा की एक प्रति तक पहुँच प्राप्त करें;",
    "privacy.rights.rectify": "गलत डेटा को सही करवाएँ;",
    "privacy.rights.erase":
      "अपने डेटा को मिटाने का अनुरोध करें जहाँ इसे रखने का कोई प्रभावी कानूनी कारण न हो;",
    "privacy.rights.restrict": "कुछ प्रसंस्करण को प्रतिबंधित करें या उस पर आपत्ति करें;",
    "privacy.rights.portability": "आपके द्वारा हमें प्रदान किए गए डेटा की पोर्टेबिलिटी;",
    "privacy.rights.withdraw":
      "जहाँ प्रसंस्करण सहमति पर निर्भर हो वहाँ किसी भी समय सहमति वापस लें।",
    "privacy.rights.note":
      "इनमें से किसी भी अधिकार का उपयोग करने के लिए, नीचे दिए गए विवरण का उपयोग करके हमारे डेटा संरक्षण अधिकारी से संपर्क करें। हम एक महीने के भीतर जवाब देंगे। आपको ICO (यूके में) या डेटा प्रोटेक्शन कमीशन (आयरलैंड में) को शिकायत करने का भी अधिकार है, हालाँकि हम आशा करते हैं कि आप पहले हमसे संपर्क करेंगे ताकि हम मामलों को ठीक कर सकें।",

    "privacy.cookies.title": "8. कुकीज़",
    "privacy.cookies.body":
      "हम आपको साइन इन रखने और सेवा को सुरक्षित रखने के लिए आवश्यक कुकीज़ का उपयोग करते हैं, और — केवल आपकी सहमति से — विश्लेषण कुकीज़ जो हमें यह समझने में मदद करती हैं कि साइट का उपयोग कैसे किया जाता है। आप अपने ब्राउज़र सेटिंग्स और हमारे कुकी नियंत्रणों के माध्यम से गैर-आवश्यक कुकीज़ का प्रबंधन कर सकते हैं। आवश्यक कुकीज़ को बंद नहीं किया जा सकता क्योंकि उनके बिना सेवा कार्य नहीं करेगी।",

    "privacy.security.title": "9. सुरक्षा",
    "privacy.security.body":
      "हम व्यक्तिगत डेटा को पारगमन और भंडारण के दौरान एन्क्रिप्शन, सख्त भूमिका-आधारित पहुँच नियंत्रण, और रोज़मर्रा के खाता डेटा तथा संवेदनशील KYC दस्तावेज़ों के बीच स्पष्ट पृथक्करण से सुरक्षित रखते हैं। सत्यापन सामग्री तक पहुँच केवल हमारे ट्रस्ट एवं सुरक्षा कार्य तक आवश्यकता के आधार पर सीमित है और इसे लॉग किया जाता है।",

    "privacy.dpo.title": "10. हमारे डीपीओ से संपर्क करें",
    "privacy.dpo.intro":
      "किसी भी गोपनीयता प्रश्न के लिए या अपने अधिकारों का उपयोग करने के लिए, हमारे डेटा संरक्षण अधिकारी से संपर्क करें:",
    "privacy.dpo.emailLabel": "ईमेल:",
    "privacy.dpo.post": "डाक: Data Protection Officer, PARKGO LIMITED, 128 City Road, London, EC1V 2NX, United Kingdom",
    "privacy.dpo.updates":
      "हम समय-समय पर इस नीति को अद्यतन कर सकते हैं। जब हम ऐसा करते हैं, तो हम ऊपर दी गई “अंतिम अद्यतन” तिथि को संशोधित करेंगे और महत्वपूर्ण परिवर्तनों के लिए आपको सीधे सूचित करेंगे।",

    // ---------------------------------------------------------------- Terms
    "terms.hero.title": "सेवा की शर्तें",
    "terms.hero.intro":
      "ये शर्तें आपके और ParkGo के बीच समझौता निर्धारित करती हैं जब आप पार्किंग, ट्रांसफर और ईवी चार्जिंग बुक करने, या होस्ट के रूप में स्थान सूचीबद्ध करने के लिए हमारे मार्केटप्लेस का उपयोग करते हैं।",
    "terms.lastUpdated": "अंतिम अद्यतन:",

    "terms.role.title": "1. मार्केटप्लेस के रूप में हमारी भूमिका",
    "terms.role.p1":
      "ParkGo एक ऑनलाइन मार्केटप्लेस संचालित करता है जो यात्रियों को स्वतंत्र होस्ट से जोड़ता है जो निजी पार्किंग स्थान प्रदान करते हैं, और एक स्वतंत्र लाइसेंस प्राप्त ट्रांसफर ऑपरेटर से जो टर्मिनल ट्रांसफर प्रदान करता है। जब तक हम लिखित रूप में अन्यथा न कहें, ParkGo पार्किंग स्थान या ट्रांसफर का प्रदाता नहीं है; हम बुकिंग को सुगम बनाते हैं, भुगतान लेते हैं और सहायक तकनीक प्रदान करते हैं।",
    "terms.role.p2":
      "पार्किंग का अनुबंध आपके और होस्ट के बीच होता है; ट्रांसफर स्वतंत्र लाइसेंस प्राप्त ट्रांसफर ऑपरेटर द्वारा प्रदान किया जाता है, जिसकी सेवा API के माध्यम से ParkGo के साथ एकीकृत है। ParkGo होस्ट के शामिल होने से पहले उनका सत्यापन करता है, और आप स्वीकार करते हैं कि होस्ट और ट्रांसफर ऑपरेटर स्वतंत्र व्यवसाय हैं जो अपनी लाइसेंसिंग, बीमा और अनुपालन के लिए स्वयं जिम्मेदार हैं।",

    "terms.eligibility.title": "2. पात्रता और आपका खाता",
    "terms.eligibility.body":
      "आपकी आयु कम से कम 18 वर्ष होनी चाहिए और आप कानूनी रूप से बाध्यकारी अनुबंध करने में सक्षम हों। आप सटीक जानकारी प्रदान करने, अपना खाता सुरक्षित रखने, और अपने पहुँच प्रमाण साझा न करने पर सहमत हैं। आप अपने खाते के तहत होने वाली गतिविधि के लिए जिम्मेदार हैं।",

    "terms.bookings.title": "3. बुकिंग और भुगतान",
    "terms.bookings.intro":
      "जब आप बुक करते हैं, तो आप एक बंडल खरीदते हैं जिसमें पार्किंग, एक लाइसेंस प्राप्त ट्रांसफर और ईवी चार्जिंग शामिल हो सकती है, एक ही पारदर्शी कीमत पर जो भुगतान से पहले दिखाई जाती है। चेकआउट पर आप जो कीमत देखते हैं वही आप चुकाते हैं। कीमतें यूके हवाई अड्डों के लिए पाउंड स्टर्लिंग और आयरिश हवाई अड्डों के लिए यूरो में दिखाई जाती हैं।",
    "terms.bookings.confirm": "भुगतान सफलतापूर्वक प्राप्त हो जाने पर बुकिंग की पुष्टि हो जाती है।",
    "terms.bookings.payments":
      "भुगतान हमारे विनियमित भुगतान प्रदाता द्वारा संसाधित किए जाते हैं; ParkGo भुगतान एकत्र करता है और होस्ट तथा ट्रांसफर ऑपरेटर के हिस्से वितरित करता है, अपनी सेवा और कमीशन शुल्क रखते हुए।",
    "terms.bookings.ev":
      "ईवी चार्जिंग, जहाँ शामिल हो, लिस्टिंग पर दिखाए अनुसार प्रति किलोवाट-घंटा की कीमत पर होती है और आपके कुल में शामिल होती है।",

    "terms.cancellations.title": "4. परिवर्तन और रद्दीकरण",
    "terms.cancellations.body":
      "यात्रा की योजनाएं बदलती रहती हैं, इसलिए हमारी रद्दीकरण नीति सरल है और भुगतान से पहले दिखाई जाती है। आप ड्रॉप-ऑफ समय से 24 घंटे पहले तक भुगतान की गई बुकिंग निःशुल्क रद्द कर पूरा रिफंड पा सकते हैं। यदि आप ड्रॉप-ऑफ के 24 घंटों के भीतर रद्द करते हैं, तो बुकिंग कुल का 20% विलंब शुल्क रखा जाता है और शेष 80% रिफंड होता है। ड्रॉप-ऑफ समय बीत जाने के बाद बुकिंग रद्द नहीं की जा सकती। रिफंड आपके मूल भुगतान माध्यम में लौटता है, आमतौर पर 5–10 कार्य दिवसों में। यदि होस्ट या ट्रांसफर ऑपरेटर रद्द करे या पुष्ट बुकिंग पूरी न कर सके, तो आपको पूरा रिफंड मिलता है और हम जहां संभव हो विकल्प खोजने में मदद करेंगे।",

    "terms.hostObligations.title": "5. होस्ट के दायित्व",
    "terms.hostObligations.intro": "यदि आप कोई स्थान सूचीबद्ध करते हैं, तो आप सहमत हैं कि आप:",
    "terms.hostObligations.right":
      "स्थान की पेशकश करने का कानूनी अधिकार रखेंगे और किसी भी किरायेदारी, बंधक, पट्टे या योजना शर्तों का पालन करेंगे;",
    "terms.hostObligations.verify":
      "पहचान और लिस्टिंग-अधिकार सत्यापन पूरा करेंगे और अपने विवरण अद्यतन रखेंगे;",
    "terms.hostObligations.describe":
      "स्थान का सटीक वर्णन करेंगे, जिसमें दूरी, आकार, सुरक्षा सुविधाएँ और कोई भी ईवी चार्जिंग शामिल है;",
    "terms.hostObligations.available":
      "पुष्टि की गई बुकिंग के लिए स्थान उपलब्ध कराएँगे और सुरक्षित, वैध पहुँच प्रदान करेंगे;",
    "terms.hostObligations.insurance":
      "तीसरे पक्षों को अपना स्थान प्रदान करने के लिए उपयुक्त बीमा रखेंगे।",

    "terms.operator.title": "6. ट्रांसफर ऑपरेटर",
    "terms.operator.intro":
      "टर्मिनल ट्रांसफर एक स्वतंत्र लाइसेंस प्राप्त ट्रांसफर ऑपरेटर द्वारा प्रदान किए जाते हैं जिसकी सेवा API के माध्यम से ParkGo के साथ एकीकृत है। ParkGo न तो कोई बेड़ा संचालित करता है और न ही सीधे ड्राइवरों को नियुक्त करता है। ऑपरेटर पूर्ण रूप से इनके लिए जिम्मेदार है:",
    "terms.operator.licence":
      "एक वैध प्राइवेट-हायर ऑपरेटर लाइसेंस और आवश्यक वाणिज्यिक यात्री बीमा रखना और बनाए रखना;",
    "terms.operator.drivers":
      "यह सुनिश्चित करना कि हर ड्राइवर सही ढंग से लाइसेंस प्राप्त, बैज-धारी और सत्यापित है, और हर वाहन सड़क योग्य और बीमाकृत है;",
    "terms.operator.compliance": "अपना अनुपालन, रिकॉर्ड-रखरखाव और समय-समय पर पुनः-सत्यापन;",
    "terms.operator.handover":
      "सत्यापित हैंडओवर प्रक्रिया पूरी करना और यात्रियों को दिखाए गए सेवा मानकों को पूरा करना।",

    "terms.handover.title": "7. सत्यापित हैंडओवर और लाइव सुविधाएँ",
    "terms.handover.body":
      "यात्रा के दिन, लाइसेंस प्राप्त ड्राइवर, होस्ट और यात्री एक लाइव स्थान साझा कर सकते हैं और उन्हें एक बार उपयोग होने वाले हैंडओवर कोड की पुष्टि करनी होगी। इस कोड पर समय-मुद्रांकन होता है और इसे सुरक्षा रिकॉर्ड के रूप में लॉग किया जाता है। लाइव कैमरा सुविधाएँ, जहाँ किसी होस्ट द्वारा प्रदान की जाती हैं, यात्रियों को आश्वस्त करने के लिए दी जाती हैं और इनका दुरुपयोग नहीं किया जाना चाहिए।",

    "terms.prohibited.title": "8. निषिद्ध उपयोग",
    "terms.prohibited.intro": "आप सहमत हैं कि आप ये नहीं करेंगे:",
    "terms.prohibited.unlawful": "प्लेटफ़ॉर्म का उपयोग किसी अवैध उद्देश्य के लिए या धोखाधड़ी को सुगम बनाने के लिए करना;",
    "terms.prohibited.noRight": "ऐसा स्थान सूचीबद्ध करना जिसे पेश करने का आपको कोई अधिकार नहीं;",
    "terms.prohibited.circumvent":
      "प्लेटफ़ॉर्म से बाहर बुकिंग या भुगतान लेने के लिए ParkGo को दरकिनार करना;",
    "terms.prohibited.misrepresent": "पहचान, वाहन या सत्यापन विवरण को गलत तरीके से प्रस्तुत करना;",
    "terms.prohibited.interfere":
      "प्लेटफ़ॉर्म की सुरक्षा में हस्तक्षेप करना, डेटा स्क्रैप करना, या लाइव स्थान या कैमरा सुविधाओं का दुरुपयोग करना।",
    "terms.prohibited.note":
      "हम उन खातों को निलंबित या हटा सकते हैं जो इन शर्तों का उल्लंघन करते हैं या हमारे समुदाय की सुरक्षा को खतरे में डालते हैं।",

    "terms.fees.title": "9. शुल्क और कर",
    "terms.fees.body":
      "ParkGo यात्रियों से सेवा शुल्क और होस्ट से कमीशन लेता है, जैसा कि बुकिंग के समय या आपके होस्ट समझौते में प्रकट किया जाता है। ट्रांसफर ऑपरेटर को ParkGo के साथ उसके अपने वाणिज्यिक समझौते के तहत पारिश्रमिक दिया जाता है। आप प्लेटफ़ॉर्म के माध्यम से अर्जित आय से उत्पन्न अपने कर दायित्वों के लिए स्वयं जिम्मेदार हैं।",

    "terms.liability.title": "10. दायित्व",
    "terms.liability.body":
      "इन शर्तों में कुछ भी उस दायित्व को सीमित नहीं करता जिसे कानून द्वारा सीमित नहीं किया जा सकता, जिसमें लापरवाही के कारण मृत्यु या व्यक्तिगत चोट, या धोखाधड़ी शामिल है। इसके अधीन, ParkGo स्वतंत्र होस्ट या स्वतंत्र लाइसेंस प्राप्त ट्रांसफर ऑपरेटर के कार्यों या चूक के लिए उत्तरदायी नहीं है, और किसी बुकिंग से जुड़े किसी भी दावे के लिए आपके प्रति हमारा कुल दायित्व उस राशि तक सीमित है जो आपने उस बुकिंग के लिए चुकाई। हम अप्रत्यक्ष या परिणामी हानि के लिए उत्तरदायी नहीं हैं। ये शर्तें उपभोक्ताओं के वैधानिक अधिकारों को प्रभावित नहीं करतीं।",

    "terms.disputes.title": "11. विवाद और शिकायतें",
    "terms.disputes.pre": "यदि कुछ गलत हो जाए, तो कृपया पहले हमारी सहायता टीम से संपर्क करें",
    "terms.disputes.link": "हमारे संपर्क पृष्ठ",
    "terms.disputes.post":
      "के माध्यम से ताकि हम इसे शीघ्र हल करने में मदद कर सकें। हम बुकिंग विवादों, धनवापसी और हैंडओवर मुद्दों के लिए एक स्पष्ट प्रक्रिया संचालित करते हैं।",

    "terms.governingLaw.title": "12. शासी कानून",
    "terms.governingLaw.body":
      "यूके में यात्रियों और होस्ट के लिए, ये शर्तें इंग्लैंड और वेल्स के कानूनों द्वारा शासित हैं, और इंग्लैंड तथा वेल्स की अदालतों को गैर-अनन्य क्षेत्राधिकार प्राप्त है। हमारी आयरिश सेवा के उपयोगकर्ताओं के लिए, ये शर्तें आयरलैंड के कानूनों द्वारा शासित हैं, और आयरिश अदालतों को गैर-अनन्य क्षेत्राधिकार प्राप्त है। उपभोक्ताओं को अपने निवास के देश में कार्यवाही लाने का अधिकार भी हो सकता है।",

    "terms.changes.title": "13. इन शर्तों में परिवर्तन",
    "terms.changes.body":
      "हम सेवा या कानून में परिवर्तनों को दर्शाने के लिए इन शर्तों को अद्यतन कर सकते हैं। हम ऊपर दी गई “अंतिम अद्यतन” तिथि को संशोधित करेंगे और महत्वपूर्ण परिवर्तनों के लिए आपको उचित सूचना देंगे। परिवर्तन प्रभावी होने के बाद ParkGo का निरंतर उपयोग इसका अर्थ है कि आप अद्यतन शर्तों को स्वीकार करते हैं।",
  },

  de: {
    // -------------------------------------------------------------- Privacy
    "privacy.hero.title": "Datenschutzerklärung",
    "privacy.hero.intro":
      "ParkGo ist so aufgebaut, dass Vertrauen das Produkt ist. Wir erheben so wenig personenbezogene Daten wie möglich, bewahren sensible Verifizierungsdokumente getrennt und verschlüsselt auf und geben Ihnen klare Kontrolle über Ihre Informationen.",
    "privacy.lastUpdated": "Zuletzt aktualisiert:",

    "privacy.who.title": "1. Wer wir sind",
    "privacy.who.p1":
      "Diese Erklärung beschreibt, wie ParkGo („ParkGo“, „wir“, „uns“) personenbezogene Daten verarbeitet, wenn Sie unsere Website und Apps im Vereinigten Königreich und in Irland nutzen. Zu Datenschutzzwecken ist ParkGo der Verantwortliche für die hier beschriebenen personenbezogenen Daten.",
    "privacy.who.p2":
      "Wir halten uns an die UK-Datenschutz-Grundverordnung (UK GDPR) und den Data Protection Act 2018 sowie, soweit der irische Dienst gilt, an die EU-DSGVO. Wir orientieren uns an den vom Information Commissioner’s Office (ICO) veröffentlichten Standards und Verhaltensregeln.",

    "privacy.data.title": "2. Die Daten, die wir erheben",
    "privacy.data.intro": "Wir erheben nur das, was wir benötigen, um den Marktplatz sicher zu betreiben:",
    "privacy.data.traveller.label": "Angaben zum Reisenden (minimal):",
    "privacy.data.traveller.body":
      "Ihr Name, Ihre E-Mail, Telefonnummer, bevorzugte Sprache und grundlegende Fahrzeuginformationen (Marke, Modell, Farbe, Kennzeichen und Größe), damit ein Gastgeber und ein lizenzierter Fahrer das richtige Auto erkennen können. Von Reisenden verlangen wir keine Ausweisdokumente.",
    "privacy.data.kyc.label": "Gastgeber-Verifizierung (KYC):",
    "privacy.data.kyc.body":
      "Ausweisdokumente, Adressnachweis und Erklärungen zum Vermietungsrecht. Dieses sensible Material wird nur von Gastgebern erhoben, in einem separaten, zugriffskontrollierten Speicher aufbewahrt und verschlüsselt. Der unabhängige lizenzierte Transferbetreiber verwaltet die Lizenzierung und Versicherung seiner Fahrer und Fahrzeuge selbst.",
    "privacy.data.booking.label": "Buchungs- und Zahlungsdaten:",
    "privacy.data.booking.body":
      "das von Ihnen gebuchte Paket, Daten, Preis und eine Zahlungsreferenz. Kartendaten werden von unserem regulierten Zahlungsdienstleister verarbeitet; wir speichern keine vollständigen Kartennummern.",
    "privacy.data.travelDay.label": "Daten am Reisetag:",
    "privacy.data.travelDay.body":
      "Live-Standort während eines aktiven Transfers und Übergabebestätigungen, die zur Erbringung des Dienstes und als Sicherheitsnachweis verwendet werden.",
    "privacy.data.technical.label": "Technische Daten:",
    "privacy.data.technical.body":
      "Geräte-, Protokoll- und Cookie-Daten, die erforderlich sind, um den Dienst sicher und funktionsfähig zu halten.",

    "privacy.lawful.title": "3. Rechtsgrundlagen für die Verarbeitung",
    "privacy.lawful.intro": "Wir stützen uns auf die folgenden Rechtsgrundlagen gemäß Artikel 6 UK GDPR:",
    "privacy.lawful.contract.label": "Vertrag:",
    "privacy.lawful.contract.body":
      "um Ihr Konto zu erstellen, Buchungen entgegenzunehmen, Zahlungen abzuwickeln sowie Transfers und Übergaben bereitzustellen.",
    "privacy.lawful.legal.label": "Rechtliche Verpflichtung:",
    "privacy.lawful.legal.body":
      "um Gastgeber zu verifizieren, Betrug zu verhindern und steuerliche sowie lizenzrechtliche Anforderungen zu erfüllen.",
    "privacy.lawful.interests.label": "Berechtigte Interessen:",
    "privacy.lawful.interests.body":
      "um die Plattform sicher zu halten, Vertrauensbewertungen aus echten Rezensionen zu berechnen und unseren Dienst zu verbessern — abgewogen gegen Ihre Rechte.",
    "privacy.lawful.consent.label": "Einwilligung:",
    "privacy.lawful.consent.body":
      "für optionale Marketing-E-Mails und nicht wesentliche Cookies, die Sie jederzeit widerrufen können.",
    "privacy.lawful.note":
      "Verifizierungsdokumente sind besonderen Kategorien angenähert und werden mit erhöhten Schutzmaßnahmen behandelt: strenge Zugriffskontrollen, Verschlüsselung und minimale Aufbewahrung.",

    "privacy.share.title": "4. Wie wir Daten weitergeben",
    "privacy.share.p1":
      "ParkGo ist ein Marktplatz, daher müssen einige Daten weitergegeben werden, um eine Buchung zu erfüllen. Wir geben nur das Notwendigste weiter: Ein Gastgeber sieht die Fahrzeugdaten und das Ankunftsfenster für eine bestätigte Buchung; der unabhängige lizenzierte Transferbetreiber erhält über eine sichere API nur das, was sein Fahrer benötigt, um Transfer und Übergabe abzuschließen. Wir nutzen außerdem vertrauenswürdige Auftragsverarbeiter — für Zahlungen, Hosting, Identitätsprüfung und Kommunikation — im Rahmen schriftlicher Verträge, die sie verpflichten, Ihre Daten zu schützen und nur nach unseren Weisungen zu verwenden.",
    "privacy.share.p2":
      "Wir verkaufen Ihre personenbezogenen Daten niemals. Wir können Daten offenlegen, sofern dies gesetzlich vorgeschrieben ist oder um die Sicherheit unserer Nutzer und die Integrität der Plattform zu schützen.",

    "privacy.transfers.title": "5. Internationale Übermittlungen",
    "privacy.transfers.body":
      "Wo Daten außerhalb des Vereinigten Königreichs oder des EWR übermittelt werden, stützen wir uns auf Angemessenheitsbeschlüsse oder geeignete Garantien wie das UK International Data Transfer Agreement oder Standardvertragsklauseln, sodass Ihre Daten auf einem gleichwertigen Niveau geschützt bleiben.",

    "privacy.retention.title": "6. Wie lange wir sie aufbewahren",
    "privacy.retention.body":
      "Wir bewahren personenbezogene Daten nur so lange auf, wie es erforderlich ist. Buchungs- und Zahlungsunterlagen werden so lange aufbewahrt, wie es für Steuer-, Buchhaltungs- und Streitzwecke erforderlich ist (in der Regel bis zu sechs Jahre). KYC-Dokumente werden für den durch Betrugsbekämpfungs- und Lizenzpflichten erforderlichen Zeitraum aufbewahrt und anschließend sicher gelöscht. Marketingdaten werden aufbewahrt, bis Sie sich abmelden. Inaktive Konten werden überprüft und im Einklang mit diesen Fristen gelöscht.",

    "privacy.rights.title": "7. Ihre Rechte",
    "privacy.rights.intro": "Nach dem Datenschutzrecht haben Sie das Recht:",
    "privacy.rights.access": "auf eine Kopie der personenbezogenen Daten zuzugreifen, die wir über Sie speichern;",
    "privacy.rights.rectify": "unrichtige Daten berichtigen zu lassen;",
    "privacy.rights.erase":
      "die Löschung Ihrer Daten zu verlangen, sofern kein vorrangiger rechtlicher Grund für die Aufbewahrung besteht;",
    "privacy.rights.restrict": "bestimmte Verarbeitungen einzuschränken oder ihnen zu widersprechen;",
    "privacy.rights.portability": "auf Datenübertragbarkeit für die von Ihnen bereitgestellten Daten;",
    "privacy.rights.withdraw":
      "die Einwilligung jederzeit zu widerrufen, wenn sich die Verarbeitung auf die Einwilligung stützt.",
    "privacy.rights.note":
      "Um eines dieser Rechte auszuüben, wenden Sie sich unter den unten stehenden Angaben an unseren Datenschutzbeauftragten. Wir antworten innerhalb eines Monats. Sie haben außerdem das Recht, sich beim ICO (im Vereinigten Königreich) oder bei der Data Protection Commission (in Irland) zu beschweren, wir hoffen jedoch, dass Sie sich zuerst an uns wenden, damit wir die Angelegenheit in Ordnung bringen können.",

    "privacy.cookies.title": "8. Cookies",
    "privacy.cookies.body":
      "Wir verwenden wesentliche Cookies, um Sie angemeldet zu halten und den Dienst sicher zu machen, und — nur mit Ihrer Einwilligung — Analyse-Cookies, die uns helfen zu verstehen, wie die Website genutzt wird. Sie können nicht wesentliche Cookies über Ihre Browsereinstellungen und unsere Cookie-Steuerungen verwalten. Wesentliche Cookies können nicht abgeschaltet werden, da der Dienst ohne sie nicht funktioniert.",

    "privacy.security.title": "9. Sicherheit",
    "privacy.security.body":
      "Wir schützen personenbezogene Daten durch Verschlüsselung bei der Übertragung und im Ruhezustand, strenge rollenbasierte Zugriffskontrollen und eine klare Trennung zwischen alltäglichen Kontodaten und sensiblen KYC-Dokumenten. Der Zugriff auf Verifizierungsmaterial ist auf unsere Trust-and-Safety-Funktion nach dem Grundsatz „need-to-know“ beschränkt und wird protokolliert.",

    "privacy.dpo.title": "10. Kontaktieren Sie unseren DSB",
    "privacy.dpo.intro":
      "Bei Datenschutzfragen oder zur Ausübung Ihrer Rechte wenden Sie sich an unseren Datenschutzbeauftragten:",
    "privacy.dpo.emailLabel": "E-Mail:",
    "privacy.dpo.post": "Post: Data Protection Officer, PARKGO LIMITED, 128 City Road, London, EC1V 2NX, United Kingdom",
    "privacy.dpo.updates":
      "Wir können diese Erklärung von Zeit zu Zeit aktualisieren. In diesem Fall überarbeiten wir das oben stehende Datum „Zuletzt aktualisiert“ und informieren Sie bei wesentlichen Änderungen direkt.",

    // ---------------------------------------------------------------- Terms
    "terms.hero.title": "Nutzungsbedingungen",
    "terms.hero.intro":
      "Diese Bedingungen regeln die Vereinbarung zwischen Ihnen und ParkGo, wenn Sie unseren Marktplatz nutzen, um Parken, Transfers und E-Auto-Laden zu buchen oder als Gastgeber einen Platz anzubieten.",
    "terms.lastUpdated": "Zuletzt aktualisiert:",

    "terms.role.title": "1. Unsere Rolle als Marktplatz",
    "terms.role.p1":
      "ParkGo betreibt einen Online-Marktplatz, der Reisende mit unabhängigen Gastgebern verbindet, die private Parkplätze anbieten, sowie mit einem unabhängigen lizenzierten Transferbetreiber, der Terminaltransfers erbringt. Sofern wir nicht schriftlich etwas anderes angeben, ist ParkGo nicht der Anbieter des Parkplatzes oder des Transfers; wir ermöglichen die Buchung, nehmen die Zahlung entgegen und stellen die unterstützende Technologie bereit.",
    "terms.role.p2":
      "Der Vertrag über das Parken besteht zwischen Ihnen und dem Gastgeber; der Transfer wird vom unabhängigen lizenzierten Transferbetreiber erbracht, dessen Dienst per API in ParkGo integriert ist. ParkGo verifiziert Gastgeber, bevor sie beitreten, und Sie erkennen an, dass Gastgeber und der Transferbetreiber unabhängige Unternehmen sind, die für ihre eigene Lizenzierung, Versicherung und Compliance verantwortlich sind.",

    "terms.eligibility.title": "2. Berechtigung und Ihr Konto",
    "terms.eligibility.body":
      "Sie müssen mindestens 18 Jahre alt und in der Lage sein, einen rechtsverbindlichen Vertrag abzuschließen. Sie verpflichten sich, korrekte Angaben zu machen, Ihr Konto sicher zu halten und Ihre Zugangsdaten nicht weiterzugeben. Sie sind für Aktivitäten verantwortlich, die unter Ihrem Konto stattfinden.",

    "terms.bookings.title": "3. Buchungen und Zahlungen",
    "terms.bookings.intro":
      "Wenn Sie buchen, erwerben Sie ein Paket, das Parken, einen lizenzierten Transfer und E-Auto-Laden zu einem einzigen transparenten Preis umfassen kann, der vor der Zahlung angezeigt wird. Der Preis, den Sie an der Kasse sehen, ist der Preis, den Sie zahlen. Preise werden für britische Flughäfen in Pfund Sterling und für irische Flughäfen in Euro angezeigt.",
    "terms.bookings.confirm": "Eine Buchung ist bestätigt, sobald die Zahlung erfolgreich eingezogen wurde.",
    "terms.bookings.payments":
      "Zahlungen werden von unserem regulierten Zahlungsdienstleister abgewickelt; ParkGo zieht die Zahlung ein und verteilt die Anteile des Gastgebers und des Transferbetreibers, wobei es seine Service- und Provisionsgebühren einbehält.",
    "terms.bookings.ev":
      "E-Auto-Laden wird, sofern enthalten, pro Kilowattstunde wie in der Anzeige ausgewiesen berechnet und ist Teil Ihres Gesamtbetrags.",

    "terms.cancellations.title": "4. Änderungen und Stornierungen",
    "terms.cancellations.body":
      "Reisepläne ändern sich — unsere Stornierungsregeln sind daher einfach und werden vor der Zahlung angezeigt. Sie können eine bezahlte Buchung bis 24 Stunden vor der Abgabezeit kostenlos stornieren und erhalten eine volle Erstattung. Bei Stornierung innerhalb von 24 Stunden vor der Abgabe wird eine Spätstornogebühr von 20% des Buchungsbetrags einbehalten; die übrigen 80% werden erstattet. Nach Ablauf der Abgabezeit ist keine Stornierung mehr möglich. Erstattungen gehen an Ihre ursprüngliche Zahlungsmethode zurück, in der Regel innerhalb von 5–10 Werktagen. Storniert ein Gastgeber oder der Transfer-Operator oder kann eine bestätigte Buchung nicht erfüllen, erhalten Sie eine volle Erstattung, und wir helfen nach Möglichkeit bei einer Alternative.",

    "terms.hostObligations.title": "5. Pflichten des Gastgebers",
    "terms.hostObligations.intro": "Wenn Sie einen Platz anbieten, verpflichten Sie sich:",
    "terms.hostObligations.right":
      "das gesetzliche Recht zu haben, den Platz anzubieten, und alle Miet-, Hypotheken-, Pacht- oder Planungsbedingungen einzuhalten;",
    "terms.hostObligations.verify":
      "die Identitäts- und Vermietungsrechtsprüfung abzuschließen und Ihre Angaben aktuell zu halten;",
    "terms.hostObligations.describe":
      "den Platz genau zu beschreiben, einschließlich Entfernung, Größe, Sicherheitsmerkmalen und etwaigem E-Auto-Laden;",
    "terms.hostObligations.available":
      "den Platz für bestätigte Buchungen bereitzustellen und einen sicheren, rechtmäßigen Zugang zu gewähren;",
    "terms.hostObligations.insurance":
      "eine angemessene Versicherung für das Anbieten Ihres Platzes an Dritte zu unterhalten.",

    "terms.operator.title": "6. Der Transferbetreiber",
    "terms.operator.intro":
      "Terminaltransfers werden von einem unabhängigen lizenzierten Transferbetreiber erbracht, dessen Dienst per API in ParkGo integriert ist. ParkGo betreibt keine Flotte und beauftragt keine Fahrer direkt. Der Betreiber ist allein verantwortlich für:",
    "terms.operator.licence":
      "das Vorhalten und Aufrechterhalten einer gültigen Private-Hire-Betreiberlizenz und der erforderlichen gewerblichen Personenversicherung;",
    "terms.operator.drivers":
      "die Sicherstellung, dass jeder Fahrer ordnungsgemäß lizenziert, mit Ausweis versehen und verifiziert ist und jedes Fahrzeug verkehrssicher und versichert ist;",
    "terms.operator.compliance": "seine eigene Compliance, Dokumentation und regelmäßige Nachverifizierung;",
    "terms.operator.handover":
      "den Abschluss des verifizierten Übergabeprozesses und die Einhaltung der den Reisenden gezeigten Servicestandards.",

    "terms.handover.title": "7. Verifizierte Übergabe und Live-Funktionen",
    "terms.handover.body":
      "Am Reisetag können der lizenzierte Fahrer, der Gastgeber und der Reisende einen Live-Standort teilen und müssen einen einmaligen Übergabecode bestätigen. Dieser Code wird mit einem Zeitstempel versehen und als Sicherheitsnachweis protokolliert. Live-Kamera-Funktionen, sofern von einem Gastgeber angeboten, dienen der Beruhigung der Reisenden und dürfen nicht missbraucht werden.",

    "terms.prohibited.title": "8. Unzulässige Nutzung",
    "terms.prohibited.intro": "Sie verpflichten sich, Folgendes zu unterlassen:",
    "terms.prohibited.unlawful": "die Plattform für rechtswidrige Zwecke oder zur Erleichterung von Betrug zu nutzen;",
    "terms.prohibited.noRight": "einen Platz anzubieten, zu dessen Angebot Sie nicht berechtigt sind;",
    "terms.prohibited.circumvent":
      "ParkGo zu umgehen, um Buchungen oder Zahlungen außerhalb der Plattform abzuwickeln;",
    "terms.prohibited.misrepresent": "Identitäts-, Fahrzeug- oder Verifizierungsangaben falsch darzustellen;",
    "terms.prohibited.interfere":
      "die Sicherheit der Plattform zu beeinträchtigen, Daten zu scrapen oder Live-Standort- oder Kamerafunktionen zu missbrauchen.",
    "terms.prohibited.note":
      "Wir können Konten sperren oder entfernen, die gegen diese Bedingungen verstoßen oder die Sicherheit unserer Community gefährden.",

    "terms.fees.title": "9. Gebühren und Steuern",
    "terms.fees.body":
      "ParkGo erhebt eine Servicegebühr von Reisenden und eine Provision von Gastgebern, wie zum Zeitpunkt der Buchung oder in Ihrer Gastgebervereinbarung offengelegt. Der Transferbetreiber wird im Rahmen seiner eigenen kommerziellen Vereinbarung mit ParkGo vergütet. Sie sind für Ihre eigenen Steuerpflichten verantwortlich, die aus über die Plattform erzielten Einkünften entstehen.",

    "terms.liability.title": "10. Haftung",
    "terms.liability.body":
      "Nichts in diesen Bedingungen beschränkt eine Haftung, die gesetzlich nicht beschränkt werden kann, einschließlich für Tod oder Personenschäden aufgrund von Fahrlässigkeit oder für Betrug. Vorbehaltlich dessen haftet ParkGo nicht für Handlungen oder Unterlassungen unabhängiger Gastgeber oder des unabhängigen lizenzierten Transferbetreibers, und unsere Gesamthaftung Ihnen gegenüber für jeglichen mit einer Buchung verbundenen Anspruch ist auf den Betrag begrenzt, den Sie für diese Buchung gezahlt haben. Wir haften nicht für indirekte oder Folgeschäden. Diese Bedingungen berühren nicht die gesetzlichen Rechte von Verbrauchern.",

    "terms.disputes.title": "11. Streitigkeiten und Beschwerden",
    "terms.disputes.pre": "Wenn etwas schiefgeht, wenden Sie sich bitte zuerst an unser Support-Team über",
    "terms.disputes.link": "unsere Kontaktseite",
    "terms.disputes.post":
      "damit wir bei einer raschen Lösung helfen können. Wir betreiben ein klares Verfahren für Buchungsstreitigkeiten, Erstattungen und Übergabeprobleme.",

    "terms.governingLaw.title": "12. Anwendbares Recht",
    "terms.governingLaw.body":
      "Für Reisende und Gastgeber im Vereinigten Königreich unterliegen diese Bedingungen dem Recht von England und Wales, und die Gerichte von England und Wales sind nicht ausschließlich zuständig. Für Nutzer unseres irischen Dienstes unterliegen diese Bedingungen dem Recht Irlands, und die irischen Gerichte sind nicht ausschließlich zuständig. Verbraucher können auch das Recht haben, in ihrem Wohnsitzland ein Verfahren einzuleiten.",

    "terms.changes.title": "13. Änderungen dieser Bedingungen",
    "terms.changes.body":
      "Wir können diese Bedingungen aktualisieren, um Änderungen des Dienstes oder der Rechtslage widerzuspiegeln. Wir überarbeiten das oben stehende Datum „Zuletzt aktualisiert“ und geben Ihnen bei wesentlichen Änderungen eine angemessene Vorankündigung. Die fortgesetzte Nutzung von ParkGo nach Inkrafttreten der Änderungen bedeutet, dass Sie die aktualisierten Bedingungen akzeptieren.",
  },

  zh: {
    // -------------------------------------------------------------- Privacy
    "privacy.hero.title": "隐私政策",
    "privacy.hero.intro":
      "ParkGo 的构建理念是让信任成为产品本身。我们尽可能少地收集个人数据，将敏感的验证文件单独存放并加密，并让您清晰地掌控自己的信息。",
    "privacy.lastUpdated": "最后更新：",

    "privacy.who.title": "1. 我们是谁",
    "privacy.who.p1":
      "本政策说明当您在英国和爱尔兰使用我们的网站和应用时，ParkGo（“ParkGo”、“我们”）如何处理个人数据。就数据保护而言，ParkGo 是此处所述个人数据的数据控制者。",
    "privacy.who.p2":
      "我们遵守英国《通用数据保护条例》（UK GDPR）和《2018 年数据保护法》，在适用爱尔兰服务的情况下遵守欧盟 GDPR。我们以信息专员办公室（ICO）发布的标准和守则为指引。",

    "privacy.data.title": "2. 我们收集的数据",
    "privacy.data.intro": "我们只收集安全运营市场平台所需的数据：",
    "privacy.data.traveller.label": "旅客信息（最少化）：",
    "privacy.data.traveller.body":
      "您的姓名、电子邮箱、电话号码、首选语言以及基本车辆信息（品牌、型号、颜色、车牌和尺寸），以便房东和持牌司机识别正确的车辆。我们不会向旅客索取身份证件。",
    "privacy.data.kyc.label": "房东验证（KYC）：",
    "privacy.data.kyc.body":
      "身份证件、地址证明和有权挂牌的声明。这些敏感材料仅从房东处收集，存放于独立的、访问受控的存储中并加密。独立的持牌接送运营商自行管理其司机和车辆的牌照及保险。",
    "privacy.data.booking.label": "预订和付款数据：",
    "privacy.data.booking.body":
      "您预订的套餐、日期、价格和付款参考号。银行卡信息由我们受监管的支付服务商处理；我们不存储完整的卡号。",
    "privacy.data.travelDay.label": "出行当天数据：",
    "privacy.data.travelDay.body":
      "接送进行期间的实时位置和交接确认，用于提供服务并留存安全记录。",
    "privacy.data.technical.label": "技术数据：",
    "privacy.data.technical.body":
      "为保持服务安全和正常运行所需的设备、日志和 Cookie 数据。",

    "privacy.lawful.title": "3. 处理的合法依据",
    "privacy.lawful.intro": "我们依据 UK GDPR 第 6 条的以下合法依据进行处理：",
    "privacy.lawful.contract.label": "合同：",
    "privacy.lawful.contract.body":
      "用于创建您的账户、接受预订、处理付款以及提供接送和交接。",
    "privacy.lawful.legal.label": "法律义务：",
    "privacy.lawful.legal.body":
      "用于验证房东、防止欺诈以及履行税务和牌照要求。",
    "privacy.lawful.interests.label": "正当利益：",
    "privacy.lawful.interests.body":
      "用于保持平台安全、根据真实评价计算信任评分以及改进我们的服务——并与您的权利相平衡。",
    "privacy.lawful.consent.label": "同意：",
    "privacy.lawful.consent.body":
      "用于可选的营销邮件和非必要 Cookie，您可随时撤回同意。",
    "privacy.lawful.note":
      "验证文件接近特殊类别数据，受到更高的保护措施：严格的访问控制、加密和最短的留存期。",

    "privacy.share.title": "4. 我们如何共享数据",
    "privacy.share.p1":
      "ParkGo 是一个市场平台，因此为完成预订必须共享部分数据。我们仅共享必要的最少信息：房东可看到已确认预订的车辆信息和到达时间段；独立的持牌接送运营商通过安全 API 仅接收其司机完成接送和交接所需的信息。我们还使用可信的处理方——用于付款、托管、身份验证和通讯——并在书面合同下要求他们保护您的数据并仅按我们的指示使用。",
    "privacy.share.p2":
      "我们绝不出售您的个人数据。在法律要求时，或为保护我们用户的安全和平台的完整性，我们可能会披露数据。",

    "privacy.transfers.title": "5. 国际传输",
    "privacy.transfers.body":
      "当数据被传输至英国或欧洲经济区之外时，我们依据充分性决定或适当的保障措施，例如英国《国际数据传输协议》或标准合同条款，以使您的数据保持同等水平的保护。",

    "privacy.retention.title": "6. 我们保存多长时间",
    "privacy.retention.body":
      "我们仅在必要期间内保存个人数据。预订和付款记录会在税务、会计和争议目的所需的期间内保留（通常最长六年）。KYC 文件会在反欺诈和牌照义务所要求的期间内保留，随后安全删除。营销数据保存至您取消订阅为止。不活跃账户会按照上述期限进行审查并删除。",

    "privacy.rights.title": "7. 您的权利",
    "privacy.rights.intro": "根据数据保护法，您有权：",
    "privacy.rights.access": "获取我们持有的关于您的个人数据副本；",
    "privacy.rights.rectify": "更正不准确的数据；",
    "privacy.rights.erase":
      "在没有优先法律理由保留的情况下，请求删除您的数据；",
    "privacy.rights.restrict": "限制或反对某些处理；",
    "privacy.rights.portability": "对您提供给我们的数据进行数据可携；",
    "privacy.rights.withdraw":
      "在处理依赖同意的情况下随时撤回同意。",
    "privacy.rights.note":
      "如需行使上述任何权利，请使用下方联系方式联系我们的数据保护官。我们将在一个月内答复。您也有权向 ICO（在英国）或数据保护委员会（在爱尔兰）投诉，但我们希望您先联系我们，以便我们妥善处理。",

    "privacy.cookies.title": "8. Cookie",
    "privacy.cookies.body":
      "我们使用必要 Cookie 以保持您的登录状态并确保服务安全，并且——仅在获得您同意的情况下——使用分析 Cookie 帮助我们了解网站的使用情况。您可以通过浏览器设置和我们的 Cookie 控件管理非必要 Cookie。必要 Cookie 无法关闭，否则服务将无法运行。",

    "privacy.security.title": "9. 安全",
    "privacy.security.body":
      "我们通过传输中和静态时的加密、严格的基于角色的访问控制，以及日常账户数据与敏感 KYC 文件之间的清晰分离来保护个人数据。对验证材料的访问仅限于我们的信任与安全部门，按需知悉原则进行并留有日志记录。",

    "privacy.dpo.title": "10. 联系我们的数据保护官",
    "privacy.dpo.intro":
      "如有任何隐私问题或需行使您的权利，请联系我们的数据保护官：",
    "privacy.dpo.emailLabel": "电子邮箱：",
    "privacy.dpo.post": "邮寄：Data Protection Officer, PARKGO LIMITED, 128 City Road, London, EC1V 2NX, United Kingdom",
    "privacy.dpo.updates":
      "我们可能会不时更新本政策。届时，我们将修订上方的“最后更新”日期，并在发生重大变更时直接通知您。",

    // ---------------------------------------------------------------- Terms
    "terms.hero.title": "服务条款",
    "terms.hero.intro":
      "这些条款规定了当您使用我们的市场平台预订停车、接送和电动车充电，或作为房东挂牌车位时，您与 ParkGo 之间的协议。",
    "terms.lastUpdated": "最后更新：",

    "terms.role.title": "1. 我们作为市场平台的角色",
    "terms.role.p1":
      "ParkGo 运营一个在线市场平台，将旅客与提供私人停车位的独立房东，以及提供航站楼接送的独立持牌接送运营商相连接。除非我们另有书面说明，ParkGo 并非停车位或接送的提供方；我们促成预订、收取款项并提供支持性技术。",
    "terms.role.p2":
      "停车合同是您与房东之间的合同；接送由独立的持牌接送运营商提供，其服务通过 API 与 ParkGo 集成。ParkGo 在房东加入前对其进行验证，您承认房东和接送运营商是独立的企业，各自负责其自身的牌照、保险和合规。",

    "terms.eligibility.title": "2. 资格与您的账户",
    "terms.eligibility.body":
      "您必须年满 18 周岁并能够订立具有法律约束力的合同。您同意提供准确的信息、保护账户安全，并且不共享您的访问凭据。您对在您账户下发生的活动负责。",

    "terms.bookings.title": "3. 预订与付款",
    "terms.bookings.intro":
      "当您预订时，您购买的套餐可能包括停车、持牌接送和电动车充电，以付款前显示的单一透明价格计价。结账时您看到的价格即为您支付的价格。价格以英镑显示（英国机场）和以欧元显示（爱尔兰机场）。",
    "terms.bookings.confirm": "一旦付款成功收取，预订即告确认。",
    "terms.bookings.payments":
      "付款由我们受监管的支付服务商处理；ParkGo 收取款项并分配房东和接送运营商的份额，同时保留其服务费和佣金。",
    "terms.bookings.ev":
      "电动车充电（如包含在内）按挂牌所示的每千瓦时计价，并构成您总额的一部分。",

    "terms.cancellations.title": "4. 变更与取消",
    "terms.cancellations.body":
      "出行计划会变化，因此我们的取消政策简单明了，并在付款前展示。您可在停车开始时间前24小时以上免费取消已付款预订并获得全额退款。若在停车开始前24小时内取消，将收取预订总额20%的滞后取消费用，其余80%退还。停车开始时间过后即无法取消。退款将原路返回您的付款方式，通常在5–10个工作日内到账。如房东或接送运营商取消或无法履行已确认的预订，您将获得全额退款，我们也会尽力协助您寻找替代方案。",

    "terms.hostObligations.title": "5. 房东义务",
    "terms.hostObligations.intro": "如果您挂牌车位，即表示您同意：",
    "terms.hostObligations.right":
      "拥有提供该车位的合法权利，并遵守任何租赁、按揭、租约或规划条件；",
    "terms.hostObligations.verify":
      "完成身份和挂牌权利验证，并保持您的信息为最新；",
    "terms.hostObligations.describe":
      "准确描述车位，包括距离、尺寸、安全设施和任何电动车充电；",
    "terms.hostObligations.available":
      "为已确认的预订提供车位，并提供安全、合法的出入；",
    "terms.hostObligations.insurance":
      "为向第三方提供您的车位持有适当的保险。",

    "terms.operator.title": "6. 接送运营商",
    "terms.operator.intro":
      "航站楼接送由独立的持牌接送运营商提供，其服务通过 API 与 ParkGo 集成。ParkGo 不运营车队，也不直接雇用司机。运营商独自负责：",
    "terms.operator.licence":
      "持有并维持有效的私人租车运营商牌照及所需的商业乘客保险；",
    "terms.operator.drivers":
      "确保每位司机均已正确取得牌照、佩戴证章并通过验证，且每辆车适于道路行驶并已投保；",
    "terms.operator.compliance": "其自身的合规、记录保存和定期重新验证；",
    "terms.operator.handover":
      "完成已验证的交接流程，并达到向旅客展示的服务标准。",

    "terms.handover.title": "7. 已验证交接与实时功能",
    "terms.handover.body":
      "在出行当天，持牌司机、房东和旅客可共享实时位置，并须确认一次性交接代码。该代码带有时间戳并作为安全记录被记录。房东提供的实时摄像头功能旨在让旅客安心，不得被滥用。",

    "terms.prohibited.title": "8. 禁止的使用",
    "terms.prohibited.intro": "您同意不得：",
    "terms.prohibited.unlawful": "将平台用于任何非法目的或为欺诈提供便利；",
    "terms.prohibited.noRight": "挂牌您无权提供的车位；",
    "terms.prohibited.circumvent":
      "绕过 ParkGo 在平台外进行预订或收付款；",
    "terms.prohibited.misrepresent": "虚假陈述身份、车辆或验证信息；",
    "terms.prohibited.interfere":
      "干扰平台的安全、抓取数据，或滥用实时位置或摄像头功能。",
    "terms.prohibited.note":
      "对于违反这些条款或危及我们社区安全的账户，我们可能予以暂停或移除。",

    "terms.fees.title": "9. 费用与税项",
    "terms.fees.body":
      "ParkGo 向旅客收取服务费、向房东收取佣金，具体在预订时或您的房东协议中披露。接送运营商根据其与 ParkGo 的商业协议获得报酬。您需自行负责因通过平台赚取的收入而产生的税务义务。",

    "terms.liability.title": "10. 责任",
    "terms.liability.body":
      "本条款中的任何内容均不限制依法不得限制的责任，包括因疏忽导致的死亡或人身伤害，或因欺诈产生的责任。在此前提下，ParkGo 不对独立房东或独立持牌接送运营商的作为或不作为承担责任，且我们就与某次预订相关的任何索赔向您承担的责任总额，以您为该次预订所支付的金额为限。我们不对间接或后果性损失承担责任。本条款不影响消费者的法定权利。",

    "terms.disputes.title": "11. 争议与投诉",
    "terms.disputes.pre": "如果出现问题，请先通过",
    "terms.disputes.link": "我们的联系页面",
    "terms.disputes.post":
      "联系我们的支持团队，以便我们协助快速解决。我们针对预订争议、退款和交接问题设有清晰的处理流程。",

    "terms.governingLaw.title": "12. 适用法律",
    "terms.governingLaw.body":
      "对于英国的旅客和房东，本条款受英格兰和威尔士法律管辖，英格兰和威尔士法院具有非专属管辖权。对于我们爱尔兰服务的用户，本条款受爱尔兰法律管辖，爱尔兰法院具有非专属管辖权。消费者也可能有权在其居住国提起诉讼。",

    "terms.changes.title": "13. 本条款的变更",
    "terms.changes.body":
      "我们可能更新本条款，以反映服务或法律的变化。我们将修订上方的“最后更新”日期，并在发生重大变更时向您提供合理的通知。变更生效后继续使用 ParkGo 即表示您接受更新后的条款。",
  },
  ar: {
    "privacy.hero.title": "سياسة الخصوصية",
    "privacy.hero.intro":
      "بُني ParkGo بحيث تكون الثقة هي المنتج نفسه. نجمع أقل قدر ممكن من البيانات الشخصية، ونحفظ مستندات التحقق الحساسة منفصلة ومشفّرة، ونمنحك تحكماً واضحاً في معلوماتك.",
    "privacy.lastUpdated": "آخر تحديث:",

    "privacy.who.title": "1. من نحن",
    "privacy.who.p1":
      "توضح هذه السياسة كيف يتعامل ParkGo («ParkGo»، «نحن») مع البيانات الشخصية عند استخدامك موقعنا وتطبيقاتنا في المملكة المتحدة وأيرلندا. ولأغراض حماية البيانات، يُعد ParkGo المتحكم في البيانات الشخصية الموصوفة هنا.",
    "privacy.who.p2":
      "نلتزم باللائحة العامة لحماية البيانات في المملكة المتحدة (UK GDPR) وقانون حماية البيانات لعام 2018، وباللائحة الأوروبية (EU GDPR) حيثما تنطبق الخدمة الأيرلندية. ونسترشد بالمعايير والمدونات الصادرة عن مكتب مفوض المعلومات (ICO).",

    "privacy.data.title": "2. البيانات التي نجمعها",
    "privacy.data.intro": "نجمع فقط ما نحتاجه لتشغيل السوق بأمان:",
    "privacy.data.traveller.label": "بيانات المسافر (الحد الأدنى):",
    "privacy.data.traveller.body":
      "اسمك وبريدك الإلكتروني ورقم هاتفك ولغتك المفضلة ومعلومات أساسية عن مركبتك (الصانع والطراز واللون ورقم التسجيل والحجم) ليتمكن المضيف والسائق المرخّص من التعرف على السيارة الصحيحة. لا نطلب من المسافرين مستندات هوية.",
    "privacy.data.kyc.label": "تحقق المضيف (KYC):",
    "privacy.data.kyc.body":
      "مستندات الهوية وإثبات العنوان وإقرارات حق العرض. تُجمع هذه المواد الحساسة من المضيفين فقط، وتُحفظ في مخزن منفصل مقيد الوصول، وتكون مشفّرة. ويدير مشغّل النقل المرخّص المستقل تراخيص سائقيه ومركباته وتأمينه بنفسه.",
    "privacy.data.booking.label": "بيانات الحجز والدفع:",
    "privacy.data.booking.body":
      "الباقة التي تحجزها والتواريخ والسعر ومرجع الدفع. تُعالج بيانات البطاقة لدى مزوّد الدفع الخاضع للتنظيم؛ ولا نخزّن أرقام البطاقات الكاملة.",
    "privacy.data.travelDay.label": "بيانات يوم السفر:",
    "privacy.data.travelDay.body":
      "الموقع المباشر أثناء النقل النشط وتأكيدات التسليم، وتُستخدم لتقديم الخدمة وتوفير سجل أمني.",
    "privacy.data.technical.label": "بيانات تقنية:",
    "privacy.data.technical.body":
      "بيانات الجهاز والسجلات وملفات تعريف الارتباط اللازمة لإبقاء الخدمة آمنة وعاملة.",

    "privacy.lawful.title": "3. الأسس القانونية للمعالجة",
    "privacy.lawful.intro": "نستند إلى الأسس القانونية التالية بموجب المادة 6 من UK GDPR:",
    "privacy.lawful.contract.label": "العقد:",
    "privacy.lawful.contract.body":
      "لإنشاء حسابك وتلقي الحجوزات ومعالجة المدفوعات وتقديم خدمات النقل والتسليم.",
    "privacy.lawful.legal.label": "الالتزام القانوني:",
    "privacy.lawful.legal.body":
      "للتحقق من المضيفين ومنع الاحتيال والوفاء بمتطلبات الضرائب والترخيص.",
    "privacy.lawful.interests.label": "المصالح المشروعة:",
    "privacy.lawful.interests.body":
      "للحفاظ على أمان المنصة، وحساب درجات الثقة من تقييمات حقيقية، وتحسين خدمتنا — بما يوازن حقوقك.",
    "privacy.lawful.consent.label": "الموافقة:",
    "privacy.lawful.consent.body":
      "لرسائل التسويق الاختيارية وملفات تعريف الارتباط غير الضرورية، ويمكنك سحبها في أي وقت.",
    "privacy.lawful.note":
      "تُعامل مستندات التحقق باعتبارها قريبة من الفئات الخاصة وبضمانات مشددة: ضوابط وصول صارمة وتشفير وحد أدنى من الاحتفاظ.",

    "privacy.share.title": "4. كيف نشارك البيانات",
    "privacy.share.p1":
      "ParkGo سوق، لذا لا بد من مشاركة بعض البيانات لإتمام الحجز. نشارك الحد الأدنى الضروري: يرى المضيف بيانات المركبة ونافذة الوصول لحجز مؤكد؛ ويتلقى مشغّل النقل المرخّص المستقل، عبر API آمنة، ما يحتاجه سائقه فقط لإتمام النقل والتسليم. كما نستعين بمعالجين موثوقين — للمدفوعات والاستضافة والتحقق من الهوية والاتصالات — بموجب عقود مكتوبة تلزمهم بحماية بياناتك واستخدامها وفق تعليماتنا فقط.",
    "privacy.share.p2":
      "لا نبيع بياناتك الشخصية أبداً. وقد نفصح عن بيانات حيثما يقتضي القانون، أو لحماية سلامة مستخدمينا وسلامة المنصة.",

    "privacy.transfers.title": "5. عمليات النقل الدولية",
    "privacy.transfers.body":
      "عند نقل البيانات خارج المملكة المتحدة أو المنطقة الاقتصادية الأوروبية، نعتمد على قرارات الملاءمة أو ضمانات مناسبة مثل اتفاقية نقل البيانات الدولية البريطانية أو البنود التعاقدية القياسية، لتبقى بياناتك محمية بمعيار مكافئ.",

    "privacy.retention.title": "6. مدة الاحتفاظ",
    "privacy.retention.body":
      "نحتفظ بالبيانات الشخصية للمدة اللازمة فقط. تُحفظ سجلات الحجز والدفع للمدة التي تقتضيها أغراض الضرائب والمحاسبة والنزاعات (عادة حتى ست سنوات). وتُحفظ مستندات KYC للمدة التي تفرضها التزامات مكافحة الاحتيال والترخيص ثم تُحذف بأمان. وتبقى بيانات التسويق حتى إلغاء اشتراكك. وتُراجع الحسابات الخاملة وتُحذف وفق هذه المدد.",

    "privacy.rights.title": "7. حقوقك",
    "privacy.rights.intro": "بموجب قانون حماية البيانات يحق لك:",
    "privacy.rights.access": "الحصول على نسخة من بياناتك الشخصية التي نحتفظ بها؛",
    "privacy.rights.rectify": "تصحيح البيانات غير الدقيقة؛",
    "privacy.rights.erase":
      "طلب محو بياناتك حيث لا يوجد سبب قانوني راجح للاحتفاظ بها؛",
    "privacy.rights.restrict": "تقييد معالجات معينة أو الاعتراض عليها؛",
    "privacy.rights.portability": "قابلية نقل البيانات التي قدمتها لنا؛",
    "privacy.rights.withdraw":
      "سحب الموافقة في أي وقت حيث تعتمد المعالجة على الموافقة.",
    "privacy.rights.note":
      "لممارسة أي من هذه الحقوق، تواصل مع مسؤول حماية البيانات لدينا عبر البيانات أدناه. سنرد خلال شهر واحد. ويحق لك أيضاً تقديم شكوى إلى ICO (في المملكة المتحدة) أو لجنة حماية البيانات (في أيرلندا)، ونأمل أن تتواصل معنا أولاً لنصحح الأمر.",

    "privacy.cookies.title": "8. ملفات تعريف الارتباط",
    "privacy.cookies.body":
      "نستخدم ملفات تعريف ارتباط ضرورية لإبقائك مسجلاً وللحفاظ على أمان الخدمة، و— بموافقتك فقط — ملفات تحليلات تساعدنا على فهم استخدام الموقع. يمكنك إدارة الملفات غير الضرورية من إعدادات متصفحك وأدوات التحكم لدينا. لا يمكن إيقاف الملفات الضرورية لأن الخدمة لا تعمل بدونها.",

    "privacy.security.title": "9. الأمان",
    "privacy.security.body":
      "نحمي البيانات الشخصية بالتشفير أثناء النقل وفي التخزين، وضوابط وصول صارمة حسب الدور، وفصل واضح بين بيانات الحساب اليومية ومستندات KYC الحساسة. ويقتصر الوصول إلى مواد التحقق على فريق الثقة والسلامة وفق مبدأ الحاجة إلى المعرفة ويُسجَّل.",

    "privacy.dpo.title": "10. تواصل مع مسؤول حماية البيانات",
    "privacy.dpo.intro":
      "لأي سؤال عن الخصوصية أو لممارسة حقوقك، تواصل مع مسؤول حماية البيانات لدينا:",
    "privacy.dpo.emailLabel": "البريد الإلكتروني:",
    "privacy.dpo.post": "البريد: Data Protection Officer, PARKGO LIMITED, 128 City Road, London, EC1V 2NX, United Kingdom",
    "privacy.dpo.updates":
      "قد نحدّث هذه السياسة من حين لآخر. وعند ذلك سنعدّل تاريخ «آخر تحديث» أعلاه، وسنخبرك مباشرة بالتغييرات الجوهرية.",

    "terms.hero.title": "شروط الخدمة",
    "terms.hero.intro":
      "تحدد هذه الشروط الاتفاق بينك وبين ParkGo عند استخدامك سوقنا لحجز المواقف والنقل وشحن EV، أو لعرض مساحة بصفتك مضيفاً.",
    "terms.lastUpdated": "آخر تحديث:",

    "terms.role.title": "1. دورنا كسوق",
    "terms.role.p1":
      "يشغّل ParkGo سوقاً إلكترونية تربط المسافرين بمضيفين مستقلين يوفرون مواقف خاصة، وبمشغّل نقل مرخّص مستقل يوفر النقل إلى الصالات. وما لم نذكر خلاف ذلك كتابةً، فإن ParkGo ليس مقدم خدمة الموقف أو النقل؛ بل نيسّر الحجز ونحصّل الدفع ونوفر التقنية الداعمة.",
    "terms.role.p2":
      "عقد الموقف بينك وبين المضيف؛ ويقدَّم النقل من مشغّل النقل المرخّص المستقل الذي تتكامل خدمته مع ParkGo عبر API. يتحقق ParkGo من المضيفين قبل انضمامهم، وتقرّ بأن المضيفين ومشغّل النقل أعمال مستقلة مسؤولة عن تراخيصها وتأمينها وامتثالها.",

    "terms.eligibility.title": "2. الأهلية وحسابك",
    "terms.eligibility.body":
      "يجب أن تكون في الثامنة عشرة على الأقل وقادراً على إبرام عقد ملزم قانوناً. وتوافق على تقديم معلومات دقيقة، والحفاظ على أمان حسابك، وعدم مشاركة بيانات دخولك. وأنت مسؤول عن النشاط الذي يجري عبر حسابك.",

    "terms.bookings.title": "3. الحجوزات والمدفوعات",
    "terms.bookings.intro":
      "عند الحجز تشتري باقة قد تشمل الموقف ونقلاً مرخّصاً وشحن EV بسعر واحد شفاف يظهر قبل الدفع. السعر الذي تراه عند الدفع هو ما تدفعه. تُعرض الأسعار بالجنيه الإسترليني لمطارات المملكة المتحدة وباليورو للمطارات الأيرلندية.",
    "terms.bookings.confirm": "يُعد الحجز مؤكداً بعد نجاح تحصيل الدفع.",
    "terms.bookings.payments":
      "تُعالج المدفوعات لدى مزوّد الدفع الخاضع للتنظيم؛ يحصّل ParkGo الدفع ويوزع حصتي المضيف ومشغّل النقل، محتفظاً برسوم الخدمة والعمولة.",
    "terms.bookings.ev":
      "يُسعَّر شحن EV، حيثما كان مشمولاً، لكل كيلوواط/ساعة كما هو مبيّن في القائمة ويكون جزءاً من إجماليك.",

    "terms.cancellations.title": "4. التغييرات والإلغاءات",
    "terms.cancellations.body":
      "خطط السفر تتغير، لذا سياسة الإلغاء لدينا بسيطة وتظهر قبل الدفع. يمكنك إلغاء حجز مدفوع مجاناً حتى 24 ساعة قبل موعد تسليم السيارة واسترداد المبلغ كاملاً. وإذا ألغيت خلال 24 ساعة من التسليم، يُحتجز رسم إلغاء متأخر قدره 20% من إجمالي الحجز ويُرد 80% المتبقية. ولا يمكن الإلغاء بعد مرور موعد التسليم. تعود المبالغ إلى وسيلة الدفع الأصلية خلال 5–10 أيام عمل عادة. وإذا ألغى المضيف أو مشغّل النقل حجزاً مؤكداً أو تعذر الوفاء به، تسترد المبلغ كاملاً وسنساعدك في إيجاد بديل حيثما أمكن.",

    "terms.hostObligations.title": "5. التزامات المضيف",
    "terms.hostObligations.intro": "إذا عرضت مساحة فأنت توافق على أن:",
    "terms.hostObligations.right":
      "تملك الحق القانوني في عرض المساحة وتلتزم بأي شروط إيجار أو رهن أو عقد أو تخطيط؛",
    "terms.hostObligations.verify":
      "تُكمل التحقق من الهوية وحق العرض وتُبقي بياناتك محدّثة؛",
    "terms.hostObligations.describe":
      "تصف المساحة بدقة، بما في ذلك المسافة والحجم وميزات الأمان وأي شحن EV؛",
    "terms.hostObligations.available":
      "تُتيح المساحة للحجوزات المؤكدة وتوفر وصولاً آمناً ومشروعاً؛",
    "terms.hostObligations.insurance":
      "تحمل تأميناً مناسباً لعرض مساحتك على أطراف ثالثة.",

    "terms.operator.title": "6. مشغّل النقل",
    "terms.operator.intro":
      "تُقدَّم خدمات النقل إلى الصالات من مشغّل نقل مرخّص مستقل تتكامل خدمته مع ParkGo عبر API. لا يشغّل ParkGo أسطولاً ولا يتعاقد مع سائقين مباشرة. والمشغّل وحده مسؤول عن:",
    "terms.operator.licence":
      "حيازة رخصة مشغّل نقل خاص سارية والحفاظ عليها مع تأمين الركاب التجاري المطلوب؛",
    "terms.operator.drivers":
      "ضمان أن كل سائق مرخّص وموثّق ويحمل شارته، وأن كل مركبة صالحة للطريق ومؤمَّنة؛",
    "terms.operator.compliance": "امتثاله وحفظ سجلاته وإعادة التحقق الدوري؛",
    "terms.operator.handover":
      "إتمام عملية التسليم الموثّق والوفاء بمعايير الخدمة المعروضة للمسافرين.",

    "terms.handover.title": "7. التسليم الموثّق والميزات المباشرة",
    "terms.handover.body":
      "في يوم السفر، قد يتشارك السائق المرخّص والمضيف والمسافر موقعاً مباشراً، وعليهم تأكيد رمز تسليم لمرة واحدة. يُسجَّل هذا الرمز بختم زمني كسجل أمني. وتُقدَّم ميزات الكاميرا المباشرة، حيثما وفرها المضيف، لطمأنة المسافرين ويجب عدم إساءة استخدامها.",

    "terms.prohibited.title": "8. الاستخدام المحظور",
    "terms.prohibited.intro": "توافق على ألا:",
    "terms.prohibited.unlawful": "تستخدم المنصة لأي غرض غير مشروع أو لتسهيل الاحتيال؛",
    "terms.prohibited.noRight": "تعرض مساحة لا تملك حق عرضها؛",
    "terms.prohibited.circumvent":
      "تتجاوز ParkGo لأخذ الحجوزات أو المدفوعات خارج المنصة؛",
    "terms.prohibited.misrepresent": "تحرّف بيانات الهوية أو المركبة أو التحقق؛",
    "terms.prohibited.interfere":
      "تتدخل في أمان المنصة، أو تكشط البيانات، أو تسيء استخدام ميزات الموقع المباشر أو الكاميرا.",
    "terms.prohibited.note":
      "قد نعلّق أو نزيل الحسابات التي تخالف هذه الشروط أو تهدد سلامة مجتمعنا.",

    "terms.fees.title": "9. الرسوم والضرائب",
    "terms.fees.body":
      "يتقاضى ParkGo رسم خدمة من المسافرين وعمولة من المضيفين، كما يُفصح عنه عند الحجز أو في اتفاقية المضيف. ويُعوَّض مشغّل النقل بموجب اتفاقه التجاري الخاص مع ParkGo. وأنت مسؤول عن التزاماتك الضريبية الناشئة عن الدخل المكتسب عبر المنصة.",

    "terms.liability.title": "10. المسؤولية",
    "terms.liability.body":
      "لا شيء في هذه الشروط يحد من مسؤولية لا يجيز القانون الحد منها، بما فيها الوفاة أو الإصابة الشخصية الناجمة عن الإهمال، أو الاحتيال. ومع مراعاة ذلك، لا يتحمل ParkGo مسؤولية أفعال أو إغفالات المضيفين المستقلين أو مشغّل النقل المرخّص المستقل، وتنحصر مسؤوليتنا الإجمالية تجاهك عن أي مطالبة مرتبطة بحجز في المبلغ الذي دفعته لذلك الحجز. ولا نتحمل مسؤولية الخسائر غير المباشرة أو التبعية. ولا تمس هذه الشروط الحقوق القانونية للمستهلكين.",

    "terms.disputes.title": "11. النزاعات والشكاوى",
    "terms.disputes.pre": "إذا حدث خطأ، يرجى التواصل مع فريق الدعم أولاً عبر",
    "terms.disputes.link": "صفحة التواصل",
    "terms.disputes.post":
      "لنساعد في حله سريعاً. لدينا آلية واضحة لنزاعات الحجز والاستردادات ومشكلات التسليم.",

    "terms.governingLaw.title": "12. القانون الحاكم",
    "terms.governingLaw.body":
      "للمسافرين والمضيفين في المملكة المتحدة، تخضع هذه الشروط لقوانين إنجلترا وويلز، ولمحاكمها اختصاص غير حصري. ولمستخدمي خدمتنا الأيرلندية، تخضع الشروط لقوانين أيرلندا وللمحاكم الأيرلندية اختصاص غير حصري. وقد يحق للمستهلكين أيضاً رفع الدعاوى في بلد إقامتهم.",

    "terms.changes.title": "13. تغييرات هذه الشروط",
    "terms.changes.body":
      "قد نحدّث هذه الشروط لتعكس تغييرات الخدمة أو القانون. وسنعدّل تاريخ «آخر تحديث» أعلاه، وسنمنحك إشعاراً معقولاً بالتغييرات الجوهرية. واستمرار استخدامك ParkGo بعد سريان التغييرات يعني قبولك الشروط المحدّثة.",
  },
};
