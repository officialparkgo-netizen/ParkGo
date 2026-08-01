import type { AreaDict } from "@/lib/i18n/config";

// Airport landing pages. Keys namespaced "airport.*".
// Sentences that wrap a dynamic value (airport name, IATA code, price, count)
// are split into fragments so they can be composed around the value in JSX/JS,
// because the translator has no interpolation.
export const airports: AreaDict = {
  en: {
    // Breadcrumb / hero
    "airport.home": "Home",
    "airport.parkingSuffix": "parking",
    "airport.countryIE": "Ireland",
    "airport.countryUK": "UK",
    "airport.heroTitleSuffix": "airport parking",
    "airport.heroSubtitleA": "Verified private parking near ",
    "airport.heroSubtitleB":
      ", bundled with a licensed terminal transfer, EV charging and live security — one booking, one transparent price.",
    "airport.parkingFrom": "Parking from",
    "airport.findParkingAt": "Find parking at",
    "airport.seeAvailableSpaces": "See available spaces",
    "airport.verifiedHosts": "Verified hosts",
    "airport.licensedDrivers": "Licensed drivers",
    "airport.liveCameraCctv": "Live camera & CCTV",

    // At-a-glance facts card
    "airport.atAGlance": "At a glance",
    "airport.parkingNear": "Parking near",
    "airport.factSpaces": "Verified spaces",
    "airport.factFrom": "From",
    "airport.comingSoon": "Coming soon",
    "airport.factEv": "With EV charging",
    "airport.factCamera": "With live camera",
    "airport.terminalsServed": "Terminals served",

    // Available spaces section
    "airport.availableNow": "Available now",
    "airport.spacesHeadingA": "Verified parking spaces near",
    "airport.spacesBody":
      "Every space is ID-verified, with the real distance to your terminal, transparent pricing and ratings from travellers who have parked here.",

    // Empty state
    "airport.emptyTitleA": "We are lining up spaces at",
    "airport.emptyBodyA": "Listings here are launching soon. Join the waitlist and we will let you know the moment",
    "airport.emptyBodyB": "goes live.",

    // Why ParkGo here
    "airport.whyEyebrow": "Why ParkGo",
    "airport.whyHeadingA": "Why book",
    "airport.whyHeadingB": "parking with ParkGo",
    "airport.why1.title": "One booking, one price",
    "airport.why1.bodyA": "Parking, a licensed transfer to your",
    "airport.why1.bodyB": "terminal, EV charging and security — combined at a single transparent price.",
    "airport.why2.title": "Verified & licensed",
    "airport.why2.body":
      "Every host is ID-verified and every transfer driver is licensed and insured. No anonymous listings.",
    "airport.why3.title": "Watch it live",
    "airport.why3.body":
      "Track your licensed driver on a live map and check your parked car on camera, right from the departure lounge.",
    "airport.why4.title": "Minutes from the terminal",
    "airport.why4.bodyA": "Private spaces sit close to",
    "airport.why4.bodyB": ", so your transfer is short, predictable and stress-free.",

    // FAQ
    "airport.faqEyebrow": "Good to know",
    "airport.faqHeadingA": "parking FAQs",
    "airport.faqIntroA": "The questions travellers ask most about parking at",
    "airport.faq1.qA": "How much does parking at",
    "airport.faq1.qB": "cost?",
    "airport.faq1.aA": "Verified private parking near",
    "airport.faq1.aB":
      "on ParkGo. Because parking, your licensed terminal transfer and any EV charging are bundled into one booking, the total you see at checkout is the total you pay — with no separate shuttle fees.",
    "airport.faq1.fromPrice": "starts from",
    "airport.faq1.perDay": "per day",
    "airport.faq1.competitive": "starts from competitive daily rates",
    "airport.faq2.qA": "How do I get from the parking space to the",
    "airport.faq2.qB": "terminal?",
    "airport.faq2.aA":
      "Add a licensed terminal transfer to your booking and a verified, insured driver collects you for the short trip to your",
    "airport.faq2.aB":
      "terminal. You can track them live on a map, and the handover is confirmed with a one-time code.",
    "airport.faq3.q": "Is my car secure while I am away?",
    "airport.faq3.aA": "Spaces near",
    "airport.faq3.aB":
      "are hosted by ID-verified hosts, and many offer CCTV or a live camera you can check from your phone — so you can keep an eye on your car from the departure lounge or even overseas.",
    "airport.faq4ev.qA": "Can I charge my electric car at",
    "airport.faq4ev.qB": "?",
    "airport.faq4ev.aA": "Yes —",
    "airport.faq4ev.aSpace": "space",
    "airport.faq4ev.aSpaces": "spaces",
    "airport.faq4ev.aNear": "near",
    "airport.faq4ev.aB":
      "offer EV charging, priced transparently per kWh and included in your single bundled total. Filter for EV charging when you search and come home to a charged car.",
    "airport.faq4t.qA": "Which terminals does ParkGo cover at",
    "airport.faq4t.qB": "?",
    "airport.faq4t.aA": "ParkGo lists verified spaces serving every terminal at",
    "airport.faq4t.aB":
      ". Each listing shows the real drive time to the terminals, so you can pick the space best placed for your departure.",

    // CTA
    "airport.ctaHeadingA": "Ready to park at",
    "airport.ctaHeadingB": "?",
    "airport.ctaBody":
      "Compare verified spaces, add a licensed transfer and EV charging, and pay one transparent price.",
  },

  ur: {
    "airport.home": "ہوم",
    "airport.parkingSuffix": "پارکنگ",
    "airport.countryIE": "آئرلینڈ",
    "airport.countryUK": "برطانیہ",
    "airport.heroTitleSuffix": "ایئرپورٹ پارکنگ",
    "airport.heroSubtitleA": "تصدیق شدہ نجی پارکنگ قریب ",
    "airport.heroSubtitleB":
      "، ایک لائسنس یافتہ ٹرمینل ٹرانسفر، ای وی چارجنگ اور لائیو سیکیورٹی کے ساتھ — ایک بکنگ، ایک شفاف قیمت۔",
    "airport.parkingFrom": "پارکنگ شروع",
    "airport.findParkingAt": "پارکنگ تلاش کریں",
    "airport.seeAvailableSpaces": "دستیاب جگہیں دیکھیں",
    "airport.verifiedHosts": "تصدیق شدہ میزبان",
    "airport.licensedDrivers": "لائسنس یافتہ ڈرائیور",
    "airport.liveCameraCctv": "لائیو کیمرہ اور سی سی ٹی وی",

    "airport.atAGlance": "ایک نظر میں",
    "airport.parkingNear": "قریب پارکنگ",
    "airport.factSpaces": "تصدیق شدہ جگہیں",
    "airport.factFrom": "شروع",
    "airport.comingSoon": "جلد آ رہا ہے",
    "airport.factEv": "ای وی چارجنگ کے ساتھ",
    "airport.factCamera": "لائیو کیمرے کے ساتھ",
    "airport.terminalsServed": "خدمت میں شامل ٹرمینلز",

    "airport.availableNow": "ابھی دستیاب",
    "airport.spacesHeadingA": "تصدیق شدہ پارکنگ جگہیں قریب",
    "airport.spacesBody":
      "ہر جگہ شناختی طور پر تصدیق شدہ ہے، آپ کے ٹرمینل تک حقیقی فاصلے، شفاف قیمتوں اور یہاں پارک کرنے والے مسافروں کی ریٹنگز کے ساتھ۔",

    "airport.emptyTitleA": "ہم جگہیں تیار کر رہے ہیں",
    "airport.emptyBodyA": "یہاں فہرستیں جلد شروع ہو رہی ہیں۔ ویٹ لسٹ میں شامل ہوں اور ہم آپ کو اسی لمحے بتائیں گے جب",
    "airport.emptyBodyB": "لائیو ہوگا۔",

    "airport.whyEyebrow": "پارک گو کیوں",
    "airport.whyHeadingA": "کیوں بک کریں",
    "airport.whyHeadingB": "پارکنگ پارک گو کے ساتھ",
    "airport.why1.title": "ایک بکنگ، ایک قیمت",
    "airport.why1.bodyA": "پارکنگ، آپ کے",
    "airport.why1.bodyB": "ٹرمینل تک لائسنس یافتہ ٹرانسفر، ای وی چارجنگ اور سیکیورٹی — ایک ہی شفاف قیمت میں یکجا۔",
    "airport.why2.title": "تصدیق شدہ اور لائسنس یافتہ",
    "airport.why2.body":
      "ہر میزبان شناختی طور پر تصدیق شدہ ہے اور ہر ٹرانسفر ڈرائیور لائسنس یافتہ اور بیمہ شدہ ہے۔ کوئی گمنام فہرست نہیں۔",
    "airport.why3.title": "اسے لائیو دیکھیں",
    "airport.why3.body":
      "اپنے لائسنس یافتہ ڈرائیور کو لائیو نقشے پر ٹریک کریں اور اپنی پارک شدہ گاڑی کو کیمرے پر دیکھیں، بالکل ڈپارچر لاؤنج سے۔",
    "airport.why4.title": "ٹرمینل سے چند منٹ",
    "airport.why4.bodyA": "نجی جگہیں قریب ہیں",
    "airport.why4.bodyB": "، تاکہ آپ کا ٹرانسفر مختصر، قابلِ پیش گوئی اور بے فکر ہو۔",

    "airport.faqEyebrow": "جاننا اچھا ہے",
    "airport.faqHeadingA": "پارکنگ کے عمومی سوالات",
    "airport.faqIntroA": "مسافر پارکنگ کے بارے میں سب سے زیادہ جو سوالات پوچھتے ہیں، وہ ہیں",
    "airport.faq1.qA": "پارکنگ کی قیمت کتنی ہے",
    "airport.faq1.qB": "؟",
    "airport.faq1.aA": "تصدیق شدہ نجی پارکنگ قریب",
    "airport.faq1.aB":
      "پارک گو پر۔ چونکہ پارکنگ، آپ کا لائسنس یافتہ ٹرمینل ٹرانسفر اور کوئی بھی ای وی چارجنگ ایک بکنگ میں شامل ہیں، اس لیے چیک آؤٹ پر جو کل رقم آپ دیکھتے ہیں وہی آپ ادا کرتے ہیں — کسی الگ شٹل فیس کے بغیر۔",
    "airport.faq1.fromPrice": "شروع",
    "airport.faq1.perDay": "فی دن",
    "airport.faq1.competitive": "مسابقتی یومیہ نرخوں سے شروع",
    "airport.faq2.qA": "میں پارکنگ کی جگہ سے",
    "airport.faq2.qB": "ٹرمینل تک کیسے پہنچوں؟",
    "airport.faq2.aA":
      "اپنی بکنگ میں لائسنس یافتہ ٹرمینل ٹرانسفر شامل کریں اور ایک تصدیق شدہ، بیمہ شدہ ڈرائیور آپ کو آپ کے",
    "airport.faq2.aB":
      "ٹرمینل تک مختصر سفر کے لیے لینے آتا ہے۔ آپ انہیں لائیو نقشے پر ٹریک کر سکتے ہیں، اور ہینڈ اوور ایک بار کے کوڈ سے تصدیق ہوتا ہے۔",
    "airport.faq3.q": "کیا میری گاڑی میری غیر موجودگی میں محفوظ ہے؟",
    "airport.faq3.aA": "قریب جگہیں",
    "airport.faq3.aB":
      "شناختی طور پر تصدیق شدہ میزبانوں کے پاس ہیں، اور بہت سی سی سی ٹی وی یا لائیو کیمرہ پیش کرتی ہیں جسے آپ اپنے فون سے دیکھ سکتے ہیں — تاکہ آپ ڈپارچر لاؤنج سے یا بیرونِ ملک سے بھی اپنی گاڑی پر نظر رکھ سکیں۔",
    "airport.faq4ev.qA": "کیا میں اپنی الیکٹرک گاڑی چارج کر سکتا ہوں",
    "airport.faq4ev.qB": "؟",
    "airport.faq4ev.aA": "جی ہاں —",
    "airport.faq4ev.aSpace": "جگہ",
    "airport.faq4ev.aSpaces": "جگہیں",
    "airport.faq4ev.aNear": "قریب",
    "airport.faq4ev.aB":
      "ای وی چارجنگ پیش کرتی ہیں، جس کی قیمت فی کلو واٹ گھنٹہ شفاف طور پر مقرر ہے اور آپ کے واحد یکجا کل میں شامل ہے۔ تلاش کرتے وقت ای وی چارجنگ کے لیے فلٹر کریں اور چارج شدہ گاڑی پر گھر آئیں۔",
    "airport.faq4t.qA": "پارک گو کن ٹرمینلز کا احاطہ کرتا ہے",
    "airport.faq4t.qB": "؟",
    "airport.faq4t.aA": "پارک گو ہر ٹرمینل کی خدمت کرنے والی تصدیق شدہ جگہوں کی فہرست دیتا ہے",
    "airport.faq4t.aB":
      "۔ ہر فہرست ٹرمینلز تک حقیقی ڈرائیو کا وقت دکھاتی ہے، تاکہ آپ اپنی روانگی کے لیے بہترین جگہ منتخب کر سکیں۔",

    "airport.ctaHeadingA": "پارک کرنے کے لیے تیار ہیں",
    "airport.ctaHeadingB": "؟",
    "airport.ctaBody":
      "تصدیق شدہ جگہوں کا موازنہ کریں، لائسنس یافتہ ٹرانسفر اور ای وی چارجنگ شامل کریں، اور ایک شفاف قیمت ادا کریں۔",
  },

  hi: {
    "airport.home": "होम",
    "airport.parkingSuffix": "पार्किंग",
    "airport.countryIE": "आयरलैंड",
    "airport.countryUK": "यूके",
    "airport.heroTitleSuffix": "एयरपोर्ट पार्किंग",
    "airport.heroSubtitleA": "सत्यापित निजी पार्किंग ",
    "airport.heroSubtitleB":
      " के पास, एक लाइसेंस प्राप्त टर्मिनल ट्रांसफर, ईवी चार्जिंग और लाइव सुरक्षा के साथ — एक बुकिंग, एक पारदर्शी कीमत।",
    "airport.parkingFrom": "पार्किंग शुरू",
    "airport.findParkingAt": "यहाँ पार्किंग खोजें",
    "airport.seeAvailableSpaces": "उपलब्ध स्थान देखें",
    "airport.verifiedHosts": "सत्यापित होस्ट",
    "airport.licensedDrivers": "लाइसेंस प्राप्त ड्राइवर",
    "airport.liveCameraCctv": "लाइव कैमरा और सीसीटीवी",

    "airport.atAGlance": "एक नज़र में",
    "airport.parkingNear": "पार्किंग पास में",
    "airport.factSpaces": "सत्यापित स्थान",
    "airport.factFrom": "शुरू",
    "airport.comingSoon": "जल्द आ रहा है",
    "airport.factEv": "ईवी चार्जिंग के साथ",
    "airport.factCamera": "लाइव कैमरे के साथ",
    "airport.terminalsServed": "सेवित टर्मिनल",

    "airport.availableNow": "अभी उपलब्ध",
    "airport.spacesHeadingA": "सत्यापित पार्किंग स्थान पास में",
    "airport.spacesBody":
      "हर स्थान आईडी-सत्यापित है, आपके टर्मिनल तक वास्तविक दूरी, पारदर्शी मूल्य निर्धारण और यहाँ पार्क कर चुके यात्रियों की रेटिंग के साथ।",

    "airport.emptyTitleA": "हम यहाँ स्थान तैयार कर रहे हैं",
    "airport.emptyBodyA": "यहाँ लिस्टिंग जल्द शुरू हो रही हैं। वेटलिस्ट में शामिल हों और जैसे ही",
    "airport.emptyBodyB": "लाइव होगा हम आपको बता देंगे।",

    "airport.whyEyebrow": "ParkGo क्यों",
    "airport.whyHeadingA": "क्यों बुक करें",
    "airport.whyHeadingB": "पार्किंग ParkGo के साथ",
    "airport.why1.title": "एक बुकिंग, एक कीमत",
    "airport.why1.bodyA": "पार्किंग, आपके",
    "airport.why1.bodyB": "टर्मिनल तक लाइसेंस प्राप्त ट्रांसफर, ईवी चार्जिंग और सुरक्षा — एक ही पारदर्शी कीमत पर संयुक्त।",
    "airport.why2.title": "सत्यापित और लाइसेंस प्राप्त",
    "airport.why2.body":
      "हर होस्ट आईडी-सत्यापित है और हर ट्रांसफर ड्राइवर लाइसेंस प्राप्त और बीमित है। कोई गुमनाम लिस्टिंग नहीं।",
    "airport.why3.title": "इसे लाइव देखें",
    "airport.why3.body":
      "अपने लाइसेंस प्राप्त ड्राइवर को लाइव मानचित्र पर ट्रैक करें और अपनी पार्क की गई कार को कैमरे पर देखें, सीधे प्रस्थान लाउंज से।",
    "airport.why4.title": "टर्मिनल से कुछ ही मिनट",
    "airport.why4.bodyA": "निजी स्थान पास में हैं",
    "airport.why4.bodyB": ", ताकि आपका ट्रांसफर छोटा, अनुमानित और तनावमुक्त हो।",

    "airport.faqEyebrow": "जानना अच्छा है",
    "airport.faqHeadingA": "पार्किंग सामान्य प्रश्न",
    "airport.faqIntroA": "यात्री पार्किंग के बारे में सबसे अधिक जो प्रश्न पूछते हैं, वे हैं",
    "airport.faq1.qA": "पार्किंग की लागत कितनी है",
    "airport.faq1.qB": "?",
    "airport.faq1.aA": "सत्यापित निजी पार्किंग पास में",
    "airport.faq1.aB":
      "ParkGo पर। चूँकि पार्किंग, आपका लाइसेंस प्राप्त टर्मिनल ट्रांसफर और कोई भी ईवी चार्जिंग एक बुकिंग में शामिल हैं, इसलिए चेकआउट पर जो कुल आप देखते हैं वही आप भुगतान करते हैं — बिना किसी अलग शटल शुल्क के।",
    "airport.faq1.fromPrice": "शुरू",
    "airport.faq1.perDay": "प्रति दिन",
    "airport.faq1.competitive": "प्रतिस्पर्धी दैनिक दरों से शुरू",
    "airport.faq2.qA": "मैं पार्किंग स्थान से",
    "airport.faq2.qB": "टर्मिनल तक कैसे पहुँचूँ?",
    "airport.faq2.aA":
      "अपनी बुकिंग में लाइसेंस प्राप्त टर्मिनल ट्रांसफर जोड़ें और एक सत्यापित, बीमित ड्राइवर आपको आपके",
    "airport.faq2.aB":
      "टर्मिनल तक छोटी यात्रा के लिए लेने आता है। आप उन्हें लाइव मानचित्र पर ट्रैक कर सकते हैं, और हैंडओवर एक बार के कोड से पुष्टि होता है।",
    "airport.faq3.q": "क्या मेरे दूर रहने के दौरान मेरी कार सुरक्षित है?",
    "airport.faq3.aA": "पास के स्थान",
    "airport.faq3.aB":
      "आईडी-सत्यापित होस्ट द्वारा संचालित हैं, और कई सीसीटीवी या लाइव कैमरा प्रदान करते हैं जिसे आप अपने फोन से देख सकते हैं — ताकि आप प्रस्थान लाउंज से या विदेश से भी अपनी कार पर नज़र रख सकें।",
    "airport.faq4ev.qA": "क्या मैं अपनी इलेक्ट्रिक कार चार्ज कर सकता हूँ",
    "airport.faq4ev.qB": "?",
    "airport.faq4ev.aA": "हाँ —",
    "airport.faq4ev.aSpace": "स्थान",
    "airport.faq4ev.aSpaces": "स्थान",
    "airport.faq4ev.aNear": "पास",
    "airport.faq4ev.aB":
      "ईवी चार्जिंग प्रदान करते हैं, जिसकी कीमत प्रति kWh पारदर्शी रूप से तय है और आपके एकल संयुक्त कुल में शामिल है। खोजते समय ईवी चार्जिंग के लिए फ़िल्टर करें और चार्ज की गई कार के साथ घर आएँ।",
    "airport.faq4t.qA": "ParkGo किन टर्मिनलों को कवर करता है",
    "airport.faq4t.qB": "?",
    "airport.faq4t.aA": "ParkGo हर टर्मिनल की सेवा करने वाले सत्यापित स्थानों को सूचीबद्ध करता है",
    "airport.faq4t.aB":
      "। हर लिस्टिंग टर्मिनलों तक वास्तविक ड्राइव समय दिखाती है, ताकि आप अपने प्रस्थान के लिए सबसे उपयुक्त स्थान चुन सकें।",

    "airport.ctaHeadingA": "पार्क करने के लिए तैयार हैं",
    "airport.ctaHeadingB": "?",
    "airport.ctaBody":
      "सत्यापित स्थानों की तुलना करें, लाइसेंस प्राप्त ट्रांसफर और ईवी चार्जिंग जोड़ें, और एक पारदर्शी कीमत चुकाएँ।",
  },

  de: {
    "airport.home": "Startseite",
    "airport.parkingSuffix": "Parken",
    "airport.countryIE": "Irland",
    "airport.countryUK": "GB",
    "airport.heroTitleSuffix": "Flughafenparken",
    "airport.heroSubtitleA": "Geprüfte private Parkplätze in der Nähe von ",
    "airport.heroSubtitleB":
      ", gebündelt mit einem lizenzierten Terminaltransfer, E-Auto-Laden und Live-Sicherheit — eine Buchung, ein transparenter Preis.",
    "airport.parkingFrom": "Parken ab",
    "airport.findParkingAt": "Parkplatz finden am",
    "airport.seeAvailableSpaces": "Verfügbare Plätze ansehen",
    "airport.verifiedHosts": "Geprüfte Gastgeber",
    "airport.licensedDrivers": "Lizenzierte Fahrer",
    "airport.liveCameraCctv": "Live-Kamera & Videoüberwachung",

    "airport.atAGlance": "Auf einen Blick",
    "airport.parkingNear": "Parken in der Nähe von",
    "airport.factSpaces": "Geprüfte Plätze",
    "airport.factFrom": "Ab",
    "airport.comingSoon": "Demnächst",
    "airport.factEv": "Mit E-Auto-Laden",
    "airport.factCamera": "Mit Live-Kamera",
    "airport.terminalsServed": "Bediente Terminals",

    "airport.availableNow": "Jetzt verfügbar",
    "airport.spacesHeadingA": "Geprüfte Parkplätze in der Nähe von",
    "airport.spacesBody":
      "Jeder Platz ist ID-geprüft, mit der echten Entfernung zu Ihrem Terminal, transparenter Preisgestaltung und Bewertungen von Reisenden, die hier geparkt haben.",

    "airport.emptyTitleA": "Wir stellen gerade Plätze zusammen am",
    "airport.emptyBodyA":
      "Angebote hier starten bald. Tragen Sie sich in die Warteliste ein und wir informieren Sie, sobald",
    "airport.emptyBodyB": "live geht.",

    "airport.whyEyebrow": "Warum ParkGo",
    "airport.whyHeadingA": "Warum",
    "airport.whyHeadingB": "-Parken mit ParkGo buchen",
    "airport.why1.title": "Eine Buchung, ein Preis",
    "airport.why1.bodyA": "Parken, ein lizenzierter Transfer zu Ihrem",
    "airport.why1.bodyB": "-Terminal, E-Auto-Laden und Sicherheit — zu einem einzigen transparenten Preis kombiniert.",
    "airport.why2.title": "Geprüft & lizenziert",
    "airport.why2.body":
      "Jeder Gastgeber ist ID-geprüft und jeder Transferfahrer ist lizenziert und versichert. Keine anonymen Angebote.",
    "airport.why3.title": "Live mitverfolgen",
    "airport.why3.body":
      "Verfolgen Sie Ihren lizenzierten Fahrer auf einer Live-Karte und prüfen Sie Ihr geparktes Auto per Kamera, direkt aus dem Abflugbereich.",
    "airport.why4.title": "Minuten vom Terminal",
    "airport.why4.bodyA": "Private Plätze liegen nahe an",
    "airport.why4.bodyB": ", sodass Ihr Transfer kurz, planbar und stressfrei ist.",

    "airport.faqEyebrow": "Gut zu wissen",
    "airport.faqHeadingA": "-Parken FAQ",
    "airport.faqIntroA": "Die Fragen, die Reisende am häufigsten zum Parken stellen am",
    "airport.faq1.qA": "Wie viel kostet das Parken am",
    "airport.faq1.qB": "?",
    "airport.faq1.aA": "Geprüfte private Parkplätze in der Nähe von",
    "airport.faq1.aB":
      "bei ParkGo. Da Parken, Ihr lizenzierter Terminaltransfer und jegliches E-Auto-Laden in einer Buchung gebündelt sind, ist der Gesamtbetrag, den Sie beim Checkout sehen, der Betrag, den Sie zahlen — ohne separate Shuttle-Gebühren.",
    "airport.faq1.fromPrice": "beginnt bei",
    "airport.faq1.perDay": "pro Tag",
    "airport.faq1.competitive": "beginnt bei attraktiven Tagespreisen",
    "airport.faq2.qA": "Wie komme ich vom Parkplatz zum",
    "airport.faq2.qB": "-Terminal?",
    "airport.faq2.aA":
      "Fügen Sie Ihrer Buchung einen lizenzierten Terminaltransfer hinzu und ein geprüfter, versicherter Fahrer holt Sie für die kurze Fahrt zu Ihrem",
    "airport.faq2.aB":
      "-Terminal ab. Sie können ihn live auf einer Karte verfolgen, und die Übergabe wird mit einem Einmalcode bestätigt.",
    "airport.faq3.q": "Ist mein Auto sicher, während ich weg bin?",
    "airport.faq3.aA": "Plätze in der Nähe von",
    "airport.faq3.aB":
      "werden von ID-geprüften Gastgebern betrieben, und viele bieten Videoüberwachung oder eine Live-Kamera, die Sie von Ihrem Telefon aus prüfen können — so behalten Sie Ihr Auto vom Abflugbereich oder sogar aus dem Ausland im Blick.",
    "airport.faq4ev.qA": "Kann ich mein Elektroauto laden am",
    "airport.faq4ev.qB": "?",
    "airport.faq4ev.aA": "Ja —",
    "airport.faq4ev.aSpace": "Platz",
    "airport.faq4ev.aSpaces": "Plätze",
    "airport.faq4ev.aNear": "in der Nähe von",
    "airport.faq4ev.aB":
      "bieten E-Auto-Laden, transparent pro kWh berechnet und in Ihrem einzigen gebündelten Gesamtpreis enthalten. Filtern Sie bei der Suche nach E-Auto-Laden und kommen Sie zu einem aufgeladenen Auto nach Hause.",
    "airport.faq4t.qA": "Welche Terminals deckt ParkGo ab am",
    "airport.faq4t.qB": "?",
    "airport.faq4t.aA": "ParkGo listet geprüfte Plätze, die jedes Terminal bedienen am",
    "airport.faq4t.aB":
      ". Jedes Angebot zeigt die echte Fahrzeit zu den Terminals, sodass Sie den für Ihren Abflug am besten gelegenen Platz wählen können.",

    "airport.ctaHeadingA": "Bereit zum Parken am",
    "airport.ctaHeadingB": "?",
    "airport.ctaBody":
      "Vergleichen Sie geprüfte Plätze, fügen Sie einen lizenzierten Transfer und E-Auto-Laden hinzu und zahlen Sie einen transparenten Preis.",
  },

  zh: {
    "airport.home": "首页",
    "airport.parkingSuffix": "停车",
    "airport.countryIE": "爱尔兰",
    "airport.countryUK": "英国",
    "airport.heroTitleSuffix": "机场停车",
    "airport.heroSubtitleA": "经过验证的私人停车位，靠近 ",
    "airport.heroSubtitleB":
      "，搭配持牌航站楼接送、电动车充电和实时安防 — 一次预订，一个透明价格。",
    "airport.parkingFrom": "停车起价",
    "airport.findParkingAt": "查找停车位：",
    "airport.seeAvailableSpaces": "查看可用车位",
    "airport.verifiedHosts": "认证房东",
    "airport.licensedDrivers": "持牌司机",
    "airport.liveCameraCctv": "实时摄像头与闭路电视",

    "airport.atAGlance": "一览",
    "airport.parkingNear": "停车位靠近",
    "airport.factSpaces": "认证车位",
    "airport.factFrom": "起价",
    "airport.comingSoon": "即将推出",
    "airport.factEv": "含电动车充电",
    "airport.factCamera": "含实时摄像头",
    "airport.terminalsServed": "服务航站楼",

    "airport.availableNow": "现在可用",
    "airport.spacesHeadingA": "经过验证的停车位靠近",
    "airport.spacesBody":
      "每个车位均经身份验证，标明到您航站楼的真实距离、透明价格，以及曾在此停车的旅客评价。",

    "airport.emptyTitleA": "我们正在为该机场安排车位：",
    "airport.emptyBodyA": "此处的房源即将上线。加入等候名单，一旦",
    "airport.emptyBodyB": "上线我们会立即通知您。",

    "airport.whyEyebrow": "为什么选择 ParkGo",
    "airport.whyHeadingA": "为什么在 ParkGo 预订",
    "airport.whyHeadingB": "停车",
    "airport.why1.title": "一次预订，一个价格",
    "airport.why1.bodyA": "停车、前往您",
    "airport.why1.bodyB": "航站楼的持牌接送、电动车充电和安防 — 以单一透明价格组合在一起。",
    "airport.why2.title": "已验证且持牌",
    "airport.why2.body":
      "每位房东均经身份验证，每位接送司机均持牌并投保。绝无匿名房源。",
    "airport.why3.title": "实时查看",
    "airport.why3.body":
      "在实时地图上追踪您的持牌司机，并通过摄像头查看您停放的爱车，就在候机厅里。",
    "airport.why4.title": "距航站楼仅几分钟",
    "airport.why4.bodyA": "私人车位靠近",
    "airport.why4.bodyB": "，因此您的接送短途、可预期且无压力。",

    "airport.faqEyebrow": "须知",
    "airport.faqHeadingA": "停车常见问题",
    "airport.faqIntroA": "旅客关于在此停车最常问的问题：",
    "airport.faq1.qA": "在",
    "airport.faq1.qB": "停车的费用是多少？",
    "airport.faq1.aA": "在 ParkGo 上，靠近",
    "airport.faq1.aB":
      "。由于停车、您的持牌航站楼接送和任何电动车充电都合并为一次预订，您在结账时看到的总价即为您支付的总价 — 没有单独的班车费用。",
    "airport.faq1.fromPrice": "的经过验证私人停车位起价",
    "airport.faq1.perDay": "/天",
    "airport.faq1.competitive": "的经过验证私人停车位起价具竞争力的每日费率",
    "airport.faq2.qA": "我如何从停车位前往",
    "airport.faq2.qB": "航站楼？",
    "airport.faq2.aA":
      "在您的预订中添加持牌航站楼接送，一位经过验证、已投保的司机会来接您，短途前往您的",
    "airport.faq2.aB":
      "航站楼。您可以在地图上实时追踪，交接通过一次性验证码确认。",
    "airport.faq3.q": "我离开期间爱车安全吗？",
    "airport.faq3.aA": "靠近",
    "airport.faq3.aB":
      "的车位由经身份验证的房东提供，许多还配有闭路电视或可用手机查看的实时摄像头 — 因此您可以在候机厅甚至身处海外时留意您的爱车。",
    "airport.faq4ev.qA": "我可以在",
    "airport.faq4ev.qB": "为电动车充电吗？",
    "airport.faq4ev.aA": "可以 —",
    "airport.faq4ev.aSpace": "个车位",
    "airport.faq4ev.aSpaces": "个车位",
    "airport.faq4ev.aNear": "靠近",
    "airport.faq4ev.aB":
      "提供电动车充电，按每千瓦时透明计价，并包含在您的单一组合总价中。搜索时筛选电动车充电，取车时爱车已充满电。",
    "airport.faq4t.qA": "ParkGo 覆盖",
    "airport.faq4t.qB": "的哪些航站楼？",
    "airport.faq4t.aA": "ParkGo 列出服务",
    "airport.faq4t.aB":
      "每个航站楼的经过验证的车位。每个房源都显示到各航站楼的真实驾车时间，方便您为出行选择位置最佳的车位。",

    "airport.ctaHeadingA": "准备好在",
    "airport.ctaHeadingB": "停车了吗？",
    "airport.ctaBody":
      "比较经过验证的车位，添加持牌接送和电动车充电，只需支付一个透明价格。",
  },
  ar: {
    "airport.home": "الرئيسية",
    "airport.parkingSuffix": "مواقف",
    "airport.countryIE": "أيرلندا",
    "airport.countryUK": "المملكة المتحدة",
    "airport.heroTitleSuffix": "مواقف المطار",
    "airport.heroSubtitleA": "مواقف خاصة موثّقة قرب ",
    "airport.heroSubtitleB":
      "، مع نقل مرخّص إلى الصالة وشحن EV وأمان مباشر — حجز واحد وسعر واحد شفاف.",
    "airport.parkingFrom": "المواقف ابتداءً من",
    "airport.findParkingAt": "ابحث عن موقف في",
    "airport.seeAvailableSpaces": "شاهد المواقف المتاحة",
    "airport.verifiedHosts": "مضيفون موثّقون",
    "airport.licensedDrivers": "سائقون مرخّصون",
    "airport.liveCameraCctv": "كاميرا مباشرة وكاميرات CCTV",

    "airport.atAGlance": "لمحة سريعة",
    "airport.parkingNear": "مواقف قرب",
    "airport.factSpaces": "مواقف موثّقة",
    "airport.factFrom": "ابتداءً من",
    "airport.comingSoon": "قريباً",
    "airport.factEv": "مع شحن EV",
    "airport.factCamera": "مع كاميرا مباشرة",
    "airport.terminalsServed": "الصالات المخدومة",

    "airport.availableNow": "متاح الآن",
    "airport.spacesHeadingA": "مواقف موثّقة قرب",
    "airport.spacesBody":
      "كل موقف موثّق الهوية، مع المسافة الحقيقية إلى صالتك وتسعير شفاف وتقييمات من مسافرين ركنوا هنا فعلاً.",

    "airport.emptyTitleA": "نجهّز المواقف في",
    "airport.emptyBodyA": "القوائم هنا تنطلق قريباً. انضم إلى قائمة الانتظار وسنخبرك لحظة أن",
    "airport.emptyBodyB": "تصبح متاحة.",

    "airport.whyEyebrow": "لماذا ParkGo",
    "airport.whyHeadingA": "لماذا تحجز مواقف",
    "airport.whyHeadingB": "مع ParkGo",
    "airport.why1.title": "حجز واحد، سعر واحد",
    "airport.why1.bodyA": "الموقف، ونقل مرخّص إلى صالة",
    "airport.why1.bodyB": "، وشحن EV والأمان — كلها بسعر واحد شفاف.",
    "airport.why2.title": "موثّق ومرخّص",
    "airport.why2.body":
      "كل مضيف موثّق الهوية وكل سائق نقل مرخّص ومؤمَّن. لا قوائم مجهولة.",
    "airport.why3.title": "شاهدها مباشرة",
    "airport.why3.body":
      "تتبّع سائقك المرخّص على خريطة مباشرة وراقب سيارتك المركونة بالكاميرا، من صالة المغادرة نفسها.",
    "airport.why4.title": "دقائق من الصالة",
    "airport.why4.bodyA": "المواقف الخاصة قريبة من",
    "airport.why4.bodyB": "، فيكون نقلك قصيراً ومتوقعاً وبلا توتر.",

    "airport.faqEyebrow": "معلومات مفيدة",
    "airport.faqHeadingA": "أسئلة شائعة عن المواقف",
    "airport.faqIntroA": "أكثر ما يسأل عنه المسافرون حول المواقف في",
    "airport.faq1.qA": "كم تكلفة المواقف في",
    "airport.faq1.qB": "؟",
    "airport.faq1.aA": "المواقف الخاصة الموثّقة قرب",
    "airport.faq1.aB":
      "على ParkGo. ولأن الموقف والنقل المرخّص وأي شحن EV تُجمع في حجز واحد، فإن الإجمالي الذي تراه عند الدفع هو ما تدفعه فعلاً — بلا رسوم حافلات منفصلة.",
    "airport.faq1.fromPrice": "تبدأ من",
    "airport.faq1.perDay": "في اليوم",
    "airport.faq1.competitive": "تبدأ من أسعار يومية منافسة",
    "airport.faq2.qA": "كيف أنتقل من الموقف إلى صالة",
    "airport.faq2.qB": "؟",
    "airport.faq2.aA":
      "أضف نقلاً مرخّصاً إلى حجزك ليقلّك سائق موثّق ومؤمَّن في رحلة قصيرة إلى صالة",
    "airport.faq2.aB":
      "الخاصة بك. يمكنك تتبّعه مباشرة على الخريطة، ويُؤكَّد التسليم برمز لمرة واحدة.",
    "airport.faq3.q": "هل سيارتي آمنة أثناء غيابي؟",
    "airport.faq3.aA": "المواقف قرب",
    "airport.faq3.aB":
      "يستضيفها مضيفون موثّقو الهوية، وكثير منها يوفر كاميرات CCTV أو كاميرا مباشرة تتابعها من هاتفك — فتطمئن على سيارتك من صالة المغادرة أو حتى من الخارج.",
    "airport.faq4ev.qA": "هل يمكنني شحن سيارتي الكهربائية في",
    "airport.faq4ev.qB": "؟",
    "airport.faq4ev.aA": "نعم —",
    "airport.faq4ev.aSpace": "موقف",
    "airport.faq4ev.aSpaces": "مواقف",
    "airport.faq4ev.aNear": "قرب",
    "airport.faq4ev.aB":
      "توفر شحن EV بتسعير شفاف لكل kWh ضمن إجماليك الموحّد. رشّح نتائج البحث بخيار شحن EV وعد إلى سيارة مشحونة.",
    "airport.faq4t.qA": "أي الصالات يغطيها ParkGo في",
    "airport.faq4t.qB": "؟",
    "airport.faq4t.aA": "يعرض ParkGo مواقف موثّقة تخدم كل صالة في",
    "airport.faq4t.aB":
      ". كل قائمة تُظهر زمن القيادة الحقيقي إلى الصالات، لتختار الموقف الأنسب لمغادرتك.",

    "airport.ctaHeadingA": "جاهز للركن في",
    "airport.ctaHeadingB": "؟",
    "airport.ctaBody":
      "قارن المواقف الموثّقة، وأضف نقلاً مرخّصاً وشحن EV، وادفع سعراً واحداً شفافاً.",
  },
};
