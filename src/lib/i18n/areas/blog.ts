import type { AreaDict } from "@/lib/i18n/config";

// Blog index + article chrome + per-post content. Keys namespaced "blog.*".
export const blog: AreaDict = {
  en: {
    // ---- Index hero ----
    "blog.hero.eyebrow": "The ParkGo blog",
    "blog.hero.title": "Smarter airport parking & travel",
    "blog.hero.subtitle":
      "Practical guides on parking, licensed transfers, EV charging and the trust and safety that holds it all together.",

    // ---- Chrome ----
    "blog.featured": "Featured",
    "blog.readArticle": "Read article",
    "blog.readMore": "Read more",
    "blog.minRead": "min read",
    "blog.min": "min",
    "blog.by": "by",
    "blog.backToBlog": "All articles",
    "blog.tags": "Tags",

    // ---- Article CTA ----
    "blog.cta.eyebrow": "Park Smart. Travel Easy.",
    "blog.cta.title": "One booking for parking, transfer & EV",
    "blog.cta.body": "See verified spaces near your airport at one transparent price.",
    "blog.cta.start": "Start a booking",
    "blog.cta.more": "More articles",

    // ---- Post: real-cost-of-airport-parking ----
    "blog.post.real-cost-of-airport-parking.title":
      "The real cost of airport parking (and how bundling fixes it)",
    "blog.post.real-cost-of-airport-parking.excerpt":
      "Sticker prices rarely tell the whole story. Here is where the money actually goes on a typical airport trip — and why one combined booking usually beats four separate ones.",
    "blog.post.real-cost-of-airport-parking.body": [
      "Ask most travellers what airport parking costs and they will quote you a daily rate. It is a fair starting point, but it is almost never the figure that lands on your card. Between booking fees, peak-date surcharges, shuttle waits, fuel for a detour and the odd EV top-up at a motorway services, the headline price and the real price can drift a long way apart.",
      "## Where the money actually goes",
      "A standard week-long trip usually involves four separate purchases: somewhere to leave the car, a way to reach the terminal, charging if you drive an EV, and the peace of mind of knowing your vehicle is safe. Booked individually, each of those carries its own fee, its own cancellation rules and its own customer-service queue. The friction is the hidden cost, and it compounds the moment a flight is delayed or plans change.",
      "Off-airport car parks advertise low daily rates, then add a shuttle transfer that runs on its own timetable. On-airport options skip the shuttle but charge a premium for the convenience. Neither tells you, up front, what charging your car will cost or whether anyone is actually watching it while you are away.",
      "## The case for one price",
      "ParkGo takes the four things travellers normally juggle — a verified parking space, a licensed terminal transfer, EV charging and live security — and combines them into a single transparent price at one checkout. You see the full total before you pay, not a base rate that quietly grows as you add the things you actually need.",
      "Bundling is not just tidier; it is usually cheaper. When parking and transfer are sold together, there is no second booking fee and no incentive to pad a low daily rate with surprise extras. And because the price is explainable, our suggestions tell you why a particular space and transfer pairing is the best value for your dates, rather than simply pushing the most expensive option.",
      "## What to check before you book",
      "Whoever you book with, three questions will save you money and stress. First, is the total you see the total you pay, including transfer and any EV charging? Second, what happens if your flight time changes — are cancellations flexible? Third, can you actually verify the space is secure, ideally with CCTV or a live camera you can check from your phone?",
      "Airport parking does not have to be a guessing game. When the price is honest and everything you need is in one booking, the real cost finally matches the one on the screen — and that is exactly the experience we set out to build.",
    ].join("\n\n"),

    // ---- Post: how-parkgo-verifies-hosts-and-drivers ----
    "blog.post.how-parkgo-verifies-hosts-and-drivers.title":
      "How ParkGo verifies hosts and licensed transfers",
    "blog.post.how-parkgo-verifies-hosts-and-drivers.excerpt":
      "Trust is the product. Here is exactly how we verify the hosts who look after your car, how the licensed transfer operator we integrate handles driver compliance, and how we keep documents safe.",
    "blog.post.how-parkgo-verifies-hosts-and-drivers.body": [
      "Handing your car to a stranger and trusting someone else to drive you to a flight only works if the checks behind the scenes are real. At ParkGo, host verification is not a badge we hand out lightly — it is a process every host completes before they can take a single booking. The terminal transfer is provided by an independent, licensed operator we integrate by API, and driver compliance sits with them.",
      "## Verifying hosts",
      "Before a parking space goes live, the host behind it completes identity verification, confirms their right to list the space, and submits photographs of the actual bay. We confirm an address and run identity documents against recognised checks. Only once that review is approved does a listing move from pending to live and become bookable.",
      "Every space also carries clear, honest detail: how far it really is from the terminal, the maximum vehicle size it fits, and whether it offers CCTV or a live camera. Hosts cannot quietly upgrade those claims — what you see on the listing is what has been verified.",
      "## The licensed transfer operator",
      "ParkGo does not run its own drivers or a driver app. The terminal transfer is fulfilled by an independent, licensed and insured operator we connect to by API. That operator holds the private-hire operator licence, the commercial passenger insurance and each driver's badge, and is responsible for vetting drivers individually and re-checking them periodically — so an expired certificate cannot slip through. We surface their live status, SLA and ratings in the app, but the driver-side compliance is theirs to hold.",
      "On travel day, the licensed driver, the host and you share a single live map, and the handover is confirmed with a one-time code that both parties enter. That code is timestamped and logged, so there is always a clear record of who collected the car and when.",
      "## Keeping sensitive documents safe",
      "Verification means handling sensitive material — passports, licences, insurance certificates. We treat those KYC documents as a separate, access-controlled category, kept apart from everyday account data and encrypted. The marketplace stores a reference to a document, not the document itself, so the people building features never need to touch the underlying files.",
      "The result is a trust score you can actually reason about: built from verification status, genuine reviews from completed bookings, reliability and tenure. It is not a vanity metric — it is the same signal we use internally to decide who belongs on the platform.",
    ].join("\n\n"),

    // ---- Post: ev-charging-while-you-fly ----
    "blog.post.ev-charging-while-you-fly.title": "EV charging while you fly: what to know",
    "blog.post.ev-charging-while-you-fly.excerpt":
      "Coming home to a fully charged car is one of the quiet joys of driving electric. Here is how to make airport EV charging work for you, from connectors to costs.",
    "blog.post.ev-charging-while-you-fly.body": [
      "There are few nicer ways to end a trip than walking back to a car that has quietly charged itself while you were away. For EV drivers, airport parking is a rare stretch of time when the car sits still for days — perfect for a slow, gentle top-up that is kinder to the battery than rapid charging on the move.",
      "## Match the connector to your car",
      "Most home-style charging uses a Type 2 connector at around 7 kW, which is ideal for a multi-day stay: plenty of time to reach a full charge without stressing the battery. Faster options using CCS can deliver 22 kW or more, useful for a short trip where you want to leave with range to spare. Before you book, check that the space lists the connector and speed your car supports.",
      "## Understand what you will pay",
      "EV charging is usually priced per kilowatt-hour, so the cost depends on how much energy you actually draw rather than how long you are plugged in. A space that shows its per-kWh rate up front lets you estimate the cost in advance — and when charging is part of a single bundled booking, that figure sits in the same transparent total as your parking and transfer, with no separate app or payment to wrestle with on the day.",
      "## A few practical tips",
      "Arrive with a sensible state of charge rather than nearly empty; trickle charging from a low level over several days is fine, but you do not need to cut it fine on the drive in. If your car lets you set a charge limit, 80 percent is gentler on the battery for longer stays. And do bring or confirm a cable if the listing says one is required — some hosts provide one, others expect you to use your own.",
      "Charging while you fly is one of those small details that turns a stressful travel day into an easy one. Pick a space with the right connector, check the per-kWh price, and let the car do the boring part while you are somewhere far more interesting.",
    ].join("\n\n"),

    // ---- Post: travellers-guide-to-heathrow-parking ----
    "blog.post.travellers-guide-to-heathrow-parking.title":
      "A traveller's guide to Heathrow parking",
    "blog.post.travellers-guide-to-heathrow-parking.excerpt":
      "Heathrow is the UK's busiest airport and parking can feel like a maze. Here is how to choose between terminals, save money, and arrive relaxed.",
    "blog.post.travellers-guide-to-heathrow-parking.body": [
      "Heathrow handles more passengers than any other UK airport, spread across four terminals and a sprawling network of roads. That scale is exactly why parking there rewards a little planning — the difference between a smooth start and a stressful one often comes down to choosing the right space for your terminal.",
      "## Know your terminal first",
      "Heathrow's terminals are genuinely far apart, so the single most useful thing you can do is confirm which one you fly from before you book anything. T2 and T3 sit in the central area, T4 is to the south, and T5 is to the west with its own dedicated approach. A space that is four minutes from T5 might be a long, traffic-dependent loop from T4, so match the listing to your terminal rather than to the airport in general.",
      "## Off-airport spaces near Heathrow",
      "The areas immediately around the airport — Longford, Hatton Cross, Harlington and Hounslow — are dotted with private driveways and gated yards that sit far closer to the terminals than the big long-stay car parks. Many are only a few minutes' drive away, which makes a licensed transfer quick and predictable, and several offer CCTV or a live camera so you can check on your car from the departure lounge.",
      "## Timing and traffic",
      "Heathrow's surrounding roads are busy from early morning, and the central terminal area can back up at peak times. Build in a buffer, and where possible pick a space whose stated drive time already accounts for that approach. Booking a parking-and-transfer bundle takes the guesswork out of the final leg: your driver knows the route to your terminal, so you are not navigating an unfamiliar one-way system with a flight to catch.",
      "## Save money without cutting corners",
      "The cheapest option is rarely the one with the lowest daily rate once a separate shuttle and its timetable are factored in. Look instead at the all-in price for parking plus your transfer, check the reviews from travellers who have actually used the space, and confirm it fits your vehicle. Booking a few days ahead, especially around school holidays, almost always beats turning up and paying a gate rate.",
      "## Arrive relaxed",
      "Heathrow does not have to be daunting. Pick a verified space near your specific terminal, bundle in a licensed transfer so the last few minutes are sorted, and use the live camera if your space offers one. Do that and the busiest airport in the country becomes one of the easiest places to start a trip.",
    ].join("\n\n"),
  },

  ur: {
    // ---- Index hero ----
    "blog.hero.eyebrow": "پارک گو بلاگ",
    "blog.hero.title": "ہوشیار ایئرپورٹ پارکنگ اور سفر",
    "blog.hero.subtitle":
      "پارکنگ، لائسنس یافتہ ٹرانسفر، ای وی چارجنگ اور اس اعتماد و حفاظت پر عملی رہنمائی جو ان سب کو جوڑے رکھتی ہے۔",

    // ---- Chrome ----
    "blog.featured": "نمایاں",
    "blog.readArticle": "مضمون پڑھیں",
    "blog.readMore": "مزید پڑھیں",
    "blog.minRead": "منٹ پڑھائی",
    "blog.min": "منٹ",
    "blog.by": "بذریعہ",
    "blog.backToBlog": "تمام مضامین",
    "blog.tags": "ٹیگز",

    // ---- Article CTA ----
    "blog.cta.eyebrow": "ہوشیاری سے پارک کریں۔ آسانی سے سفر کریں۔",
    "blog.cta.title": "پارکنگ، ٹرانسفر اور ای وی کے لیے ایک ہی بکنگ",
    "blog.cta.body": "اپنے ایئرپورٹ کے قریب تصدیق شدہ جگہیں ایک شفاف قیمت پر دیکھیں۔",
    "blog.cta.start": "بکنگ شروع کریں",
    "blog.cta.more": "مزید مضامین",

    // ---- Post: real-cost-of-airport-parking ----
    "blog.post.real-cost-of-airport-parking.title":
      "ایئرپورٹ پارکنگ کی اصل لاگت (اور بنڈلنگ اسے کیسے درست کرتی ہے)",
    "blog.post.real-cost-of-airport-parking.excerpt":
      "ظاہری قیمتیں شاذ و نادر ہی پوری کہانی بتاتی ہیں۔ یہاں دیکھیں کہ ایک عام ایئرپورٹ سفر پر رقم اصل میں کہاں جاتی ہے — اور کیوں ایک مشترکہ بکنگ عام طور پر چار الگ الگ بکنگز سے بہتر ہوتی ہے۔",
    "blog.post.real-cost-of-airport-parking.body": [
      "زیادہ تر مسافروں سے پوچھیں کہ ایئرپورٹ پارکنگ کی لاگت کیا ہے تو وہ آپ کو یومیہ ریٹ بتائیں گے۔ یہ ایک مناسب نقطہ آغاز ہے، لیکن یہ تقریباً کبھی وہ رقم نہیں ہوتی جو آپ کے کارڈ پر آتی ہے۔ بکنگ فیس، مصروف تاریخوں کے اضافی چارجز، شٹل کے انتظار، چکر کے لیے ایندھن اور موٹروے سروسز پر کبھی کبھار ای وی ٹاپ اپ کے درمیان، نمایاں قیمت اور اصل قیمت میں کافی فرق آ سکتا ہے۔",
      "## رقم اصل میں کہاں جاتی ہے",
      "ایک عام ہفتہ بھر کے سفر میں عام طور پر چار الگ خریداریاں شامل ہوتی ہیں: گاڑی چھوڑنے کی جگہ، ٹرمینل تک پہنچنے کا ذریعہ، اگر آپ ای وی چلاتے ہیں تو چارجنگ، اور یہ اطمینان کہ آپ کی گاڑی محفوظ ہے۔ الگ الگ بک کرنے پر ان میں سے ہر ایک کی اپنی فیس، اپنے منسوخی کے قواعد اور اپنی کسٹمر سروس کی قطار ہوتی ہے۔ یہ رکاوٹ ہی چھپی ہوئی لاگت ہے، اور جیسے ہی پرواز میں تاخیر ہوتی ہے یا منصوبے بدلتے ہیں یہ بڑھ جاتی ہے۔",
      "ایئرپورٹ سے باہر کار پارکس کم یومیہ ریٹ کا اشتہار دیتے ہیں، پھر ایک شٹل ٹرانسفر جوڑ دیتے ہیں جو اپنے شیڈول پر چلتی ہے۔ ایئرپورٹ کے اندر کے اختیارات شٹل سے بچتے ہیں لیکن اس سہولت کے لیے زیادہ قیمت لیتے ہیں۔ ان میں سے کوئی بھی آپ کو پہلے سے نہیں بتاتا کہ آپ کی گاڑی چارج کرنے کی لاگت کیا ہوگی یا آپ کی غیر موجودگی میں کوئی واقعی اس کی نگرانی کر رہا ہے یا نہیں۔",
      "## ایک قیمت کا جواز",
      "پارک گو ان چار چیزوں کو لیتا ہے جو مسافر عام طور پر سنبھالتے ہیں — ایک تصدیق شدہ پارکنگ جگہ، لائسنس یافتہ ٹرمینل ٹرانسفر، ای وی چارجنگ اور لائیو سیکیورٹی — اور انہیں ایک ہی چیک آؤٹ پر ایک شفاف قیمت میں جوڑ دیتا ہے۔ آپ ادائیگی سے پہلے پوری رقم دیکھتے ہیں، نہ کہ ایک بنیادی ریٹ جو خاموشی سے بڑھتا جاتا ہے جیسے جیسے آپ اپنی ضرورت کی چیزیں شامل کرتے ہیں۔",
      "بنڈلنگ صرف زیادہ منظم نہیں؛ یہ عام طور پر سستی بھی ہوتی ہے۔ جب پارکنگ اور ٹرانسفر ایک ساتھ بیچے جاتے ہیں تو دوسری بکنگ فیس نہیں ہوتی اور کم یومیہ ریٹ کو حیرت انگیز اضافی چیزوں سے بھرنے کی کوئی ترغیب نہیں ہوتی۔ اور چونکہ قیمت قابل وضاحت ہے، ہماری تجاویز آپ کو بتاتی ہیں کہ کوئی خاص جگہ اور ٹرانسفر کا جوڑ آپ کی تاریخوں کے لیے کیوں بہترین قیمت ہے، بجائے اس کے کہ محض سب سے مہنگا اختیار پیش کیا جائے۔",
      "## بکنگ سے پہلے کیا جانچیں",
      "آپ کسی سے بھی بک کریں، تین سوال آپ کے پیسے اور پریشانی بچائیں گے۔ پہلا، کیا جو کل رقم آپ دیکھتے ہیں وہی آپ ادا کرتے ہیں، بشمول ٹرانسفر اور کوئی بھی ای وی چارجنگ؟ دوسرا، اگر آپ کی پرواز کا وقت بدل جائے تو کیا ہوتا ہے — کیا منسوخیاں لچکدار ہیں؟ تیسرا، کیا آپ واقعی تصدیق کر سکتے ہیں کہ جگہ محفوظ ہے، مثالی طور پر سی سی ٹی وی یا ایک لائیو کیمرے سے جسے آپ اپنے فون سے دیکھ سکیں؟",
      "ایئرپورٹ پارکنگ کو اندازوں کا کھیل ہونے کی ضرورت نہیں۔ جب قیمت ایماندار ہو اور آپ کی ضرورت کی ہر چیز ایک بکنگ میں ہو، تو اصل لاگت آخرکار اسکرین پر موجود لاگت سے مل جاتی ہے — اور بالکل یہی تجربہ ہم نے بنانے کا ارادہ کیا تھا۔",
    ].join("\n\n"),

    // ---- Post: how-parkgo-verifies-hosts-and-drivers ----
    "blog.post.how-parkgo-verifies-hosts-and-drivers.title":
      "پارک گو میزبانوں اور لائسنس یافتہ ٹرانسفرز کی تصدیق کیسے کرتا ہے",
    "blog.post.how-parkgo-verifies-hosts-and-drivers.excerpt":
      "اعتماد ہی پروڈکٹ ہے۔ یہاں بالکل واضح ہے کہ ہم ان میزبانوں کی تصدیق کیسے کرتے ہیں جو آپ کی گاڑی کی دیکھ بھال کرتے ہیں، جس لائسنس یافتہ ٹرانسفر آپریٹر کو ہم مربوط کرتے ہیں وہ ڈرائیور کی تعمیل کیسے سنبھالتا ہے، اور ہم دستاویزات کو کیسے محفوظ رکھتے ہیں۔",
    "blog.post.how-parkgo-verifies-hosts-and-drivers.body": [
      "اپنی گاڑی کسی اجنبی کے حوالے کرنا اور کسی اور پر بھروسہ کرنا کہ وہ آپ کو پرواز تک لے جائے، تبھی کام کرتا ہے جب پردے کے پیچھے کی جانچیں حقیقی ہوں۔ پارک گو پر، میزبان کی تصدیق کوئی ایسا بیج نہیں جو ہم آسانی سے دے دیں — یہ ایک عمل ہے جسے ہر میزبان ایک بھی بکنگ لینے سے پہلے مکمل کرتا ہے۔ ٹرمینل ٹرانسفر ایک آزاد، لائسنس یافتہ آپریٹر فراہم کرتا ہے جسے ہم API کے ذریعے مربوط کرتے ہیں، اور ڈرائیور کی تعمیل ان کی ذمہ داری ہے۔",
      "## میزبانوں کی تصدیق",
      "کسی پارکنگ جگہ کے لائیو ہونے سے پہلے، اس کے پیچھے موجود میزبان شناخت کی تصدیق مکمل کرتا ہے، جگہ درج کرنے کے اپنے حق کی تصدیق کرتا ہے، اور اصل بے کی تصاویر جمع کراتا ہے۔ ہم ایک پتے کی تصدیق کرتے ہیں اور شناختی دستاویزات کو تسلیم شدہ جانچوں کے خلاف چلاتے ہیں۔ صرف اسی وقت جب وہ جائزہ منظور ہو جاتا ہے، ایک فہرست زیرِ التوا سے لائیو ہوتی ہے اور قابلِ بکنگ بنتی ہے۔",
      "ہر جگہ واضح، ایماندار تفصیل بھی رکھتی ہے: یہ ٹرمینل سے واقعی کتنی دور ہے، یہ زیادہ سے زیادہ کس سائز کی گاڑی سماتی ہے، اور یہ سی سی ٹی وی یا لائیو کیمرہ پیش کرتی ہے یا نہیں۔ میزبان ان دعووں کو خاموشی سے بہتر نہیں کر سکتے — جو آپ فہرست پر دیکھتے ہیں وہی تصدیق شدہ ہے۔",
      "## لائسنس یافتہ ٹرانسفر آپریٹر",
      "پارک گو اپنے ڈرائیور یا ڈرائیور ایپ نہیں چلاتا۔ ٹرمینل ٹرانسفر ایک آزاد، لائسنس یافتہ اور بیمہ شدہ آپریٹر پورا کرتا ہے جس سے ہم API کے ذریعے جڑتے ہیں۔ وہ آپریٹر پرائیویٹ ہائر آپریٹر لائسنس، تجارتی مسافر انشورنس اور ہر ڈرائیور کا بیج رکھتا ہے، اور ڈرائیوروں کی انفرادی جانچ پڑتال اور وقتاً فوقتاً دوبارہ جانچ کا ذمہ دار ہے — تاکہ کوئی میعاد ختم شدہ سرٹیفکیٹ گزر نہ جائے۔ ہم ان کی لائیو حیثیت، ایس ایل اے اور ریٹنگز ایپ میں دکھاتے ہیں، لیکن ڈرائیور کی طرف کی تعمیل ان کی ذمہ داری ہے۔",
      "سفر کے دن، لائسنس یافتہ ڈرائیور، میزبان اور آپ ایک ہی لائیو نقشہ شیئر کرتے ہیں، اور ہینڈ اوور ایک بار استعمال ہونے والے کوڈ سے تصدیق کیا جاتا ہے جسے دونوں فریق درج کرتے ہیں۔ اس کوڈ پر وقت کی مہر لگتی ہے اور اسے لاگ کیا جاتا ہے، تاکہ ہمیشہ واضح ریکارڈ رہے کہ گاڑی کس نے اور کب لی۔",
      "## حساس دستاویزات کو محفوظ رکھنا",
      "تصدیق کا مطلب ہے حساس مواد سنبھالنا — پاسپورٹ، لائسنس، انشورنس سرٹیفکیٹ۔ ہم ان KYC دستاویزات کو ایک الگ، رسائی کنٹرول شدہ زمرے کے طور پر لیتے ہیں، جو روزمرہ کے اکاؤنٹ ڈیٹا سے الگ رکھی جاتی ہیں اور خفیہ کاری کی جاتی ہیں۔ مارکیٹ پلیس دستاویز کا حوالہ محفوظ کرتی ہے، خود دستاویز نہیں، تاکہ فیچرز بنانے والے لوگوں کو کبھی بنیادی فائلوں کو چھونے کی ضرورت نہ پڑے۔",
      "نتیجہ ایک ایسا اعتماد اسکور ہے جس کے بارے میں آپ واقعی سوچ سکتے ہیں: تصدیق کی حیثیت، مکمل شدہ بکنگز سے حقیقی جائزوں، بھروسے مندی اور مدتِ رکنیت سے بنا ہوا۔ یہ کوئی نمائشی پیمانہ نہیں — یہ وہی اشارہ ہے جسے ہم اندرونی طور پر یہ فیصلہ کرنے کے لیے استعمال کرتے ہیں کہ پلیٹ فارم پر کون ہونا چاہیے۔",
    ].join("\n\n"),

    // ---- Post: ev-charging-while-you-fly ----
    "blog.post.ev-charging-while-you-fly.title": "پرواز کے دوران ای وی چارجنگ: جاننے کی باتیں",
    "blog.post.ev-charging-while-you-fly.excerpt":
      "سفر سے واپسی پر ایک مکمل چارج شدہ گاڑی کے پاس آنا برقی گاڑی چلانے کی خاموش خوشیوں میں سے ایک ہے۔ یہاں ہے کہ ایئرپورٹ ای وی چارجنگ کو اپنے فائدے میں کیسے کریں، کنیکٹرز سے لے کر اخراجات تک۔",
    "blog.post.ev-charging-while-you-fly.body": [
      "سفر ختم کرنے کے چند ہی بہتر طریقے ہیں کہ آپ ایسی گاڑی کے پاس واپس جائیں جس نے آپ کی غیر موجودگی میں خاموشی سے خود کو چارج کر لیا ہو۔ ای وی ڈرائیوروں کے لیے، ایئرپورٹ پارکنگ وقت کا وہ نادر عرصہ ہوتا ہے جب گاڑی کئی دن تک ساکن رہتی ہے — ایک سست، ہلکے ٹاپ اپ کے لیے بہترین جو چلتے پھرتے تیز چارجنگ کے مقابلے میں بیٹری کے لیے زیادہ نرم ہے۔",
      "## کنیکٹر کو اپنی گاڑی سے ملائیں",
      "زیادہ تر گھریلو طرز کی چارجنگ تقریباً 7 کلو واٹ پر ٹائپ 2 کنیکٹر استعمال کرتی ہے، جو کئی دن کے قیام کے لیے مثالی ہے: بیٹری پر دباؤ ڈالے بغیر مکمل چارج تک پہنچنے کا کافی وقت۔ CCS استعمال کرنے والے تیز تر اختیارات 22 کلو واٹ یا اس سے زیادہ فراہم کر سکتے ہیں، جو ایسے مختصر سفر کے لیے مفید ہے جہاں آپ فاضل رینج کے ساتھ روانہ ہونا چاہتے ہیں۔ بکنگ سے پہلے، جانچ لیں کہ جگہ آپ کی گاڑی کے سپورٹ کردہ کنیکٹر اور رفتار درج کرتی ہے۔",
      "## سمجھیں آپ کیا ادا کریں گے",
      "ای وی چارجنگ کی قیمت عام طور پر فی کلو واٹ گھنٹہ ہوتی ہے، لہٰذا لاگت اس پر منحصر ہے کہ آپ واقعی کتنی توانائی لیتے ہیں نہ کہ آپ کتنی دیر پلگ ان رہتے ہیں۔ ایسی جگہ جو اپنا فی کلو واٹ گھنٹہ ریٹ پہلے سے دکھاتی ہے آپ کو لاگت کا پیشگی اندازہ لگانے دیتی ہے — اور جب چارجنگ ایک ہی بنڈل بکنگ کا حصہ ہو، تو وہ رقم آپ کی پارکنگ اور ٹرانسفر کے ساتھ اسی شفاف کل میں شامل رہتی ہے، بغیر کسی الگ ایپ یا ادائیگی کے جس سے سفر کے دن نمٹنا پڑے۔",
      "## چند عملی مشورے",
      "تقریباً خالی کے بجائے ایک معقول چارج کے ساتھ پہنچیں؛ کئی دنوں میں کم سطح سے دھیمی چارجنگ ٹھیک ہے، لیکن آپ کو راستے میں اسے بہت کم رکھنے کی ضرورت نہیں۔ اگر آپ کی گاڑی آپ کو چارج کی حد مقرر کرنے دیتی ہے تو طویل قیام کے لیے 80 فیصد بیٹری پر زیادہ نرم ہے۔ اور اگر فہرست کہتی ہے کہ کیبل درکار ہے تو ضرور لائیں یا تصدیق کریں — کچھ میزبان کیبل فراہم کرتے ہیں، کچھ توقع کرتے ہیں کہ آپ اپنی استعمال کریں۔",
      "پرواز کے دوران چارجنگ ان چھوٹی تفصیلات میں سے ایک ہے جو ایک پریشان کن سفری دن کو آسان بنا دیتی ہے۔ صحیح کنیکٹر والی جگہ منتخب کریں، فی کلو واٹ گھنٹہ قیمت جانچیں، اور گاڑی کو بورنگ کام کرنے دیں جبکہ آپ کہیں زیادہ دلچسپ جگہ پر ہوں۔",
    ].join("\n\n"),

    // ---- Post: travellers-guide-to-heathrow-parking ----
    "blog.post.travellers-guide-to-heathrow-parking.title":
      "ہیتھرو پارکنگ کے لیے مسافر کی رہنمائی",
    "blog.post.travellers-guide-to-heathrow-parking.excerpt":
      "ہیتھرو برطانیہ کا مصروف ترین ایئرپورٹ ہے اور پارکنگ کسی بھول بھلیوں جیسی لگ سکتی ہے۔ یہاں ہے کہ ٹرمینلز کے درمیان انتخاب کیسے کریں، پیسے کیسے بچائیں، اور پُرسکون کیسے پہنچیں۔",
    "blog.post.travellers-guide-to-heathrow-parking.body": [
      "ہیتھرو کسی بھی دوسرے برطانوی ایئرپورٹ سے زیادہ مسافروں کو سنبھالتا ہے، جو چار ٹرمینلز اور سڑکوں کے وسیع جال میں پھیلے ہوتے ہیں۔ یہ پیمانہ ہی وہ وجہ ہے کہ وہاں پارکنگ تھوڑی منصوبہ بندی کا صلہ دیتی ہے — ایک پُرسکون آغاز اور پریشان کن آغاز کے درمیان فرق اکثر اپنے ٹرمینل کے لیے صحیح جگہ منتخب کرنے پر منحصر ہوتا ہے۔",
      "## پہلے اپنا ٹرمینل جانیں",
      "ہیتھرو کے ٹرمینلز واقعی ایک دوسرے سے کافی دور ہیں، لہٰذا سب سے مفید کام یہ ہے کہ کچھ بھی بک کرنے سے پہلے تصدیق کریں کہ آپ کس ٹرمینل سے پرواز کرتے ہیں۔ T2 اور T3 مرکزی علاقے میں ہیں، T4 جنوب میں ہے، اور T5 مغرب میں اپنے مخصوص راستے کے ساتھ ہے۔ ایسی جگہ جو T5 سے چار منٹ کی دوری پر ہے وہ T4 سے ایک طویل، ٹریفک پر منحصر چکر ہو سکتی ہے، لہٰذا فہرست کو مجموعی ایئرپورٹ کے بجائے اپنے ٹرمینل سے ملائیں۔",
      "## ہیتھرو کے قریب ایئرپورٹ سے باہر جگہیں",
      "ایئرپورٹ کے فوری اردگرد کے علاقے — لونگفورڈ، ہیٹن کراس، ہارلنگٹن اور ہاؤنسلو — نجی ڈرائیو ویز اور گیٹ والے احاطوں سے بھرے ہیں جو بڑے لانگ اسٹے کار پارکس کے مقابلے میں ٹرمینلز کے کہیں زیادہ قریب ہیں۔ بہت سی صرف چند منٹ کی ڈرائیو پر ہیں، جو لائسنس یافتہ ٹرانسفر کو تیز اور قابل پیش گوئی بناتی ہیں، اور کئی سی سی ٹی وی یا لائیو کیمرہ پیش کرتی ہیں تاکہ آپ ڈپارچر لاؤنج سے اپنی گاڑی دیکھ سکیں۔",
      "## وقت اور ٹریفک",
      "ہیتھرو کے آس پاس کی سڑکیں صبح سویرے سے مصروف ہوتی ہیں، اور مرکزی ٹرمینل علاقہ مصروف اوقات میں جام ہو سکتا ہے۔ ایک وقفہ رکھیں، اور جہاں ممکن ہو ایسی جگہ منتخب کریں جس کا بیان کردہ ڈرائیو ٹائم پہلے سے اس راستے کو مدنظر رکھتا ہو۔ پارکنگ اور ٹرانسفر بنڈل بک کرنا آخری مرحلے سے اندازہ نکال دیتا ہے: آپ کا ڈرائیور آپ کے ٹرمینل کا راستہ جانتا ہے، لہٰذا آپ پرواز پکڑنے کی جلدی میں کسی ناواقف ون وے نظام میں راستہ نہیں ڈھونڈ رہے ہوتے۔",
      "## معیار پر سمجھوتہ کیے بغیر پیسے بچائیں",
      "سب سے سستا اختیار شاذ و نادر ہی وہ ہوتا ہے جس کا یومیہ ریٹ سب سے کم ہو، ایک بار جب ایک الگ شٹل اور اس کا شیڈول شامل کر لیا جائے۔ اس کے بجائے پارکنگ اور آپ کے ٹرانسفر کی مجموعی قیمت دیکھیں، ان مسافروں کے جائزے جانچیں جنہوں نے واقعی جگہ استعمال کی ہے، اور تصدیق کریں کہ یہ آپ کی گاڑی میں سماتی ہے۔ چند دن پہلے بکنگ کرنا، خاص طور پر اسکول کی چھٹیوں کے آس پاس، تقریباً ہمیشہ وہاں پہنچ کر گیٹ ریٹ ادا کرنے سے بہتر ہوتا ہے۔",
      "## پُرسکون پہنچیں",
      "ہیتھرو کو خوفناک ہونے کی ضرورت نہیں۔ اپنے مخصوص ٹرمینل کے قریب ایک تصدیق شدہ جگہ منتخب کریں، ایک لائسنس یافتہ ٹرانسفر شامل کریں تاکہ آخری چند منٹ طے ہو جائیں، اور اگر آپ کی جگہ لائیو کیمرہ پیش کرتی ہے تو اسے استعمال کریں۔ ایسا کریں تو ملک کا مصروف ترین ایئرپورٹ سفر شروع کرنے کے سب سے آسان مقامات میں سے ایک بن جاتا ہے۔",
    ].join("\n\n"),
  },

  hi: {
    // ---- Index hero ----
    "blog.hero.eyebrow": "ParkGo ब्लॉग",
    "blog.hero.title": "स्मार्ट एयरपोर्ट पार्किंग और यात्रा",
    "blog.hero.subtitle":
      "पार्किंग, लाइसेंस प्राप्त ट्रांसफर, ईवी चार्जिंग और उस भरोसे व सुरक्षा पर व्यावहारिक मार्गदर्शन जो इन सबको एक साथ जोड़े रखता है।",

    // ---- Chrome ----
    "blog.featured": "विशेष",
    "blog.readArticle": "लेख पढ़ें",
    "blog.readMore": "और पढ़ें",
    "blog.minRead": "मिनट पढ़ाई",
    "blog.min": "मिनट",
    "blog.by": "द्वारा",
    "blog.backToBlog": "सभी लेख",
    "blog.tags": "टैग",

    // ---- Article CTA ----
    "blog.cta.eyebrow": "स्मार्ट पार्क करें। आसानी से यात्रा करें।",
    "blog.cta.title": "पार्किंग, ट्रांसफर और ईवी के लिए एक बुकिंग",
    "blog.cta.body": "अपने एयरपोर्ट के पास सत्यापित स्थान एक पारदर्शी कीमत पर देखें।",
    "blog.cta.start": "बुकिंग शुरू करें",
    "blog.cta.more": "और लेख",

    // ---- Post: real-cost-of-airport-parking ----
    "blog.post.real-cost-of-airport-parking.title":
      "एयरपोर्ट पार्किंग की असली लागत (और बंडलिंग इसे कैसे ठीक करती है)",
    "blog.post.real-cost-of-airport-parking.excerpt":
      "दिखाई गई कीमतें शायद ही कभी पूरी कहानी बताती हैं। यहाँ देखें कि एक सामान्य एयरपोर्ट यात्रा पर पैसा असल में कहाँ जाता है — और क्यों एक संयुक्त बुकिंग आमतौर पर चार अलग-अलग बुकिंग से बेहतर होती है।",
    "blog.post.real-cost-of-airport-parking.body": [
      "अधिकांश यात्रियों से पूछें कि एयरपोर्ट पार्किंग की लागत क्या है तो वे आपको एक दैनिक दर बताएंगे। यह एक उचित शुरुआती बिंदु है, लेकिन यह लगभग कभी वह आँकड़ा नहीं होता जो आपके कार्ड पर आता है। बुकिंग शुल्क, व्यस्त तारीखों के अधिभार, शटल की प्रतीक्षा, चक्कर के लिए ईंधन और मोटरवे सर्विस पर कभी-कभार ईवी टॉप-अप के बीच, प्रमुख कीमत और असली कीमत में काफी अंतर आ सकता है।",
      "## पैसा असल में कहाँ जाता है",
      "एक सामान्य सप्ताह भर की यात्रा में आमतौर पर चार अलग खरीदारियाँ शामिल होती हैं: कार छोड़ने की जगह, टर्मिनल तक पहुँचने का तरीका, यदि आप ईवी चलाते हैं तो चार्जिंग, और यह मन की शांति कि आपकी गाड़ी सुरक्षित है। अलग-अलग बुक करने पर इनमें से हर एक का अपना शुल्क, अपने रद्दीकरण नियम और अपनी ग्राहक-सेवा कतार होती है। यह रुकावट ही छिपी हुई लागत है, और जैसे ही उड़ान में देरी होती है या योजनाएँ बदलती हैं यह बढ़ जाती है।",
      "एयरपोर्ट से बाहर की कार पार्क कम दैनिक दरों का विज्ञापन करते हैं, फिर एक शटल ट्रांसफर जोड़ देते हैं जो अपने समय-सारणी पर चलता है। एयरपोर्ट के भीतर के विकल्प शटल से बचते हैं लेकिन इस सुविधा के लिए अधिक कीमत लेते हैं। इनमें से कोई भी आपको पहले से नहीं बताता कि आपकी गाड़ी चार्ज करने की लागत क्या होगी या आपकी अनुपस्थिति में कोई वास्तव में उस पर नज़र रख रहा है या नहीं।",
      "## एक कीमत का तर्क",
      "ParkGo उन चार चीज़ों को लेता है जिन्हें यात्री आमतौर पर संभालते हैं — एक सत्यापित पार्किंग स्थान, एक लाइसेंस प्राप्त टर्मिनल ट्रांसफर, ईवी चार्जिंग और लाइव सुरक्षा — और उन्हें एक ही चेकआउट पर एक पारदर्शी कीमत में जोड़ देता है। आप भुगतान से पहले पूरी राशि देखते हैं, न कि एक आधार दर जो चुपचाप बढ़ती जाती है जैसे-जैसे आप अपनी ज़रूरत की चीज़ें जोड़ते हैं।",
      "बंडलिंग केवल अधिक व्यवस्थित नहीं है; यह आमतौर पर सस्ती भी होती है। जब पार्किंग और ट्रांसफर एक साथ बेचे जाते हैं, तो कोई दूसरा बुकिंग शुल्क नहीं होता और कम दैनिक दर को आश्चर्यजनक अतिरिक्त शुल्कों से भरने का कोई प्रोत्साहन नहीं होता। और चूँकि कीमत व्याख्या योग्य है, हमारे सुझाव आपको बताते हैं कि कोई विशेष स्थान और ट्रांसफर का संयोजन आपकी तारीखों के लिए सबसे अच्छा मूल्य क्यों है, बजाय इसके कि केवल सबसे महँगा विकल्प थोपा जाए।",
      "## बुकिंग से पहले क्या जाँचें",
      "आप किसी से भी बुक करें, तीन सवाल आपके पैसे और तनाव बचाएंगे। पहला, क्या जो कुल राशि आप देखते हैं वही आप चुकाते हैं, जिसमें ट्रांसफर और कोई भी ईवी चार्जिंग शामिल हो? दूसरा, यदि आपकी उड़ान का समय बदल जाए तो क्या होता है — क्या रद्दीकरण लचीले हैं? तीसरा, क्या आप वास्तव में पुष्टि कर सकते हैं कि स्थान सुरक्षित है, आदर्श रूप से सीसीटीवी या एक लाइव कैमरे के साथ जिसे आप अपने फ़ोन से देख सकें?",
      "एयरपोर्ट पार्किंग को अनुमान का खेल होने की ज़रूरत नहीं। जब कीमत ईमानदार हो और आपकी ज़रूरत की हर चीज़ एक बुकिंग में हो, तो असली लागत आखिरकार स्क्रीन पर मौजूद लागत से मेल खाती है — और यही वह अनुभव है जिसे बनाने का हमने संकल्प लिया था।",
    ].join("\n\n"),

    // ---- Post: how-parkgo-verifies-hosts-and-drivers ----
    "blog.post.how-parkgo-verifies-hosts-and-drivers.title":
      "ParkGo होस्ट और लाइसेंस प्राप्त ट्रांसफर की पुष्टि कैसे करता है",
    "blog.post.how-parkgo-verifies-hosts-and-drivers.excerpt":
      "भरोसा ही उत्पाद है। यहाँ बिल्कुल स्पष्ट है कि हम उन होस्ट की पुष्टि कैसे करते हैं जो आपकी कार की देखभाल करते हैं, जिस लाइसेंस प्राप्त ट्रांसफर ऑपरेटर को हम जोड़ते हैं वह ड्राइवर अनुपालन कैसे संभालता है, और हम दस्तावेज़ों को कैसे सुरक्षित रखते हैं।",
    "blog.post.how-parkgo-verifies-hosts-and-drivers.body": [
      "अपनी कार किसी अजनबी को सौंपना और किसी और पर भरोसा करना कि वह आपको उड़ान तक पहुँचाए, तभी काम करता है जब पर्दे के पीछे की जाँचें वास्तविक हों। ParkGo पर, होस्ट सत्यापन कोई ऐसा बैज नहीं जिसे हम हल्के में दे दें — यह एक प्रक्रिया है जिसे हर होस्ट एक भी बुकिंग लेने से पहले पूरा करता है। टर्मिनल ट्रांसफर एक स्वतंत्र, लाइसेंस प्राप्त ऑपरेटर प्रदान करता है जिसे हम API के ज़रिए जोड़ते हैं, और ड्राइवर अनुपालन उनकी ज़िम्मेदारी है।",
      "## होस्ट का सत्यापन",
      "किसी पार्किंग स्थान के लाइव होने से पहले, उसके पीछे का होस्ट पहचान सत्यापन पूरा करता है, स्थान को सूचीबद्ध करने के अपने अधिकार की पुष्टि करता है, और वास्तविक बे की तस्वीरें जमा करता है। हम एक पते की पुष्टि करते हैं और पहचान दस्तावेज़ों को मान्यता प्राप्त जाँचों के विरुद्ध चलाते हैं। केवल उसी समय जब वह समीक्षा स्वीकृत हो जाती है, एक लिस्टिंग लंबित से लाइव होती है और बुक करने योग्य बनती है।",
      "हर स्थान स्पष्ट, ईमानदार विवरण भी रखता है: यह टर्मिनल से वास्तव में कितनी दूर है, यह अधिकतम किस आकार की गाड़ी समाती है, और यह सीसीटीवी या लाइव कैमरा प्रदान करता है या नहीं। होस्ट इन दावों को चुपचाप बेहतर नहीं कर सकते — जो आप लिस्टिंग पर देखते हैं वही सत्यापित है।",
      "## लाइसेंस प्राप्त ट्रांसफर ऑपरेटर",
      "ParkGo अपने ड्राइवर या ड्राइवर ऐप नहीं चलाता। टर्मिनल ट्रांसफर एक स्वतंत्र, लाइसेंस प्राप्त और बीमित ऑपरेटर पूरा करता है जिससे हम API के ज़रिए जुड़ते हैं। वह ऑपरेटर प्राइवेट-हायर ऑपरेटर लाइसेंस, वाणिज्यिक यात्री बीमा और हर ड्राइवर का बैज रखता है, और ड्राइवरों की व्यक्तिगत जाँच तथा समय-समय पर पुनः जाँच के लिए ज़िम्मेदार है — ताकि कोई समय-सीमा समाप्त प्रमाणपत्र निकल न जाए। हम उनकी लाइव स्थिति, एसएलए और रेटिंग ऐप में दिखाते हैं, लेकिन ड्राइवर-पक्ष का अनुपालन उनकी ज़िम्मेदारी है।",
      "यात्रा के दिन, लाइसेंस प्राप्त ड्राइवर, होस्ट और आप एक ही लाइव नक्शा साझा करते हैं, और हैंडओवर की पुष्टि एक बार उपयोग होने वाले कोड से होती है जिसे दोनों पक्ष दर्ज करते हैं। उस कोड पर समय की मुहर लगती है और उसे लॉग किया जाता है, ताकि हमेशा स्पष्ट रिकॉर्ड रहे कि कार किसने और कब ली।",
      "## संवेदनशील दस्तावेज़ों को सुरक्षित रखना",
      "सत्यापन का मतलब है संवेदनशील सामग्री संभालना — पासपोर्ट, लाइसेंस, बीमा प्रमाणपत्र। हम उन KYC दस्तावेज़ों को एक अलग, पहुँच-नियंत्रित श्रेणी के रूप में मानते हैं, जो रोज़मर्रा के खाता डेटा से अलग रखे जाते हैं और एन्क्रिप्ट किए जाते हैं। मार्केटप्लेस दस्तावेज़ का एक संदर्भ संग्रहीत करता है, स्वयं दस्तावेज़ नहीं, ताकि फ़ीचर बनाने वाले लोगों को कभी अंतर्निहित फ़ाइलों को छूने की ज़रूरत न पड़े।",
      "परिणाम एक ऐसा भरोसा स्कोर है जिसके बारे में आप वास्तव में तर्क कर सकते हैं: सत्यापन स्थिति, पूर्ण की गई बुकिंग से वास्तविक समीक्षाओं, विश्वसनीयता और कार्यकाल से निर्मित। यह कोई दिखावटी मीट्रिक नहीं — यह वही संकेत है जिसका उपयोग हम आंतरिक रूप से यह तय करने के लिए करते हैं कि प्लेटफ़ॉर्म पर कौन होना चाहिए।",
    ].join("\n\n"),

    // ---- Post: ev-charging-while-you-fly ----
    "blog.post.ev-charging-while-you-fly.title": "उड़ान के दौरान ईवी चार्जिंग: जानने योग्य बातें",
    "blog.post.ev-charging-while-you-fly.excerpt":
      "यात्रा से लौटकर एक पूरी तरह चार्ज कार के पास आना इलेक्ट्रिक गाड़ी चलाने की शांत खुशियों में से एक है। यहाँ है कि एयरपोर्ट ईवी चार्जिंग को अपने पक्ष में कैसे करें, कनेक्टर से लेकर लागत तक।",
    "blog.post.ev-charging-while-you-fly.body": [
      "यात्रा समाप्त करने के कुछ ही बेहतर तरीके हैं कि आप ऐसी कार के पास लौटें जिसने आपकी अनुपस्थिति में चुपचाप खुद को चार्ज कर लिया हो। ईवी चालकों के लिए, एयरपोर्ट पार्किंग समय का वह दुर्लभ दौर है जब कार कई दिनों तक स्थिर रहती है — एक धीमे, कोमल टॉप-अप के लिए एकदम सही जो चलते-फिरते तेज़ चार्जिंग की तुलना में बैटरी के लिए अधिक नरम है।",
      "## कनेक्टर को अपनी कार से मिलाएँ",
      "अधिकांश घरेलू-शैली की चार्जिंग लगभग 7 kW पर एक Type 2 कनेक्टर का उपयोग करती है, जो कई दिनों के ठहराव के लिए आदर्श है: बैटरी पर दबाव डाले बिना पूर्ण चार्ज तक पहुँचने के लिए पर्याप्त समय। CCS का उपयोग करने वाले तेज़ विकल्प 22 kW या उससे अधिक दे सकते हैं, जो ऐसी छोटी यात्रा के लिए उपयोगी है जहाँ आप अतिरिक्त रेंज के साथ निकलना चाहते हैं। बुकिंग से पहले, जाँच लें कि स्थान आपकी कार द्वारा समर्थित कनेक्टर और गति सूचीबद्ध करता है।",
      "## समझें आप क्या भुगतान करेंगे",
      "ईवी चार्जिंग की कीमत आमतौर पर प्रति किलोवाट-घंटा होती है, इसलिए लागत इस पर निर्भर करती है कि आप वास्तव में कितनी ऊर्जा खींचते हैं, न कि आप कितनी देर प्लग-इन रहते हैं। ऐसा स्थान जो अपनी प्रति-kWh दर पहले से दिखाता है, आपको लागत का पहले से अनुमान लगाने देता है — और जब चार्जिंग एक ही बंडल बुकिंग का हिस्सा हो, तो वह आँकड़ा आपकी पार्किंग और ट्रांसफर के साथ उसी पारदर्शी कुल में रहता है, बिना किसी अलग ऐप या भुगतान के जिससे यात्रा के दिन जूझना पड़े।",
      "## कुछ व्यावहारिक सुझाव",
      "लगभग खाली के बजाय एक समझदार चार्ज स्तर के साथ पहुँचें; कई दिनों में कम स्तर से धीमी चार्जिंग ठीक है, लेकिन आपको रास्ते में इसे बहुत कम रखने की ज़रूरत नहीं। यदि आपकी कार आपको चार्ज सीमा तय करने देती है, तो लंबे ठहराव के लिए 80 प्रतिशत बैटरी के लिए अधिक नरम है। और यदि लिस्टिंग कहती है कि केबल आवश्यक है तो अवश्य लाएँ या पुष्टि करें — कुछ होस्ट एक प्रदान करते हैं, कुछ अपेक्षा करते हैं कि आप अपनी का उपयोग करें।",
      "उड़ान के दौरान चार्जिंग उन छोटी बातों में से एक है जो एक तनावपूर्ण यात्रा दिन को आसान बना देती है। सही कनेक्टर वाला स्थान चुनें, प्रति-kWh कीमत जाँचें, और कार को उबाऊ काम करने दें जबकि आप कहीं अधिक दिलचस्प जगह पर हों।",
    ].join("\n\n"),

    // ---- Post: travellers-guide-to-heathrow-parking ----
    "blog.post.travellers-guide-to-heathrow-parking.title":
      "हीथ्रो पार्किंग के लिए यात्री की मार्गदर्शिका",
    "blog.post.travellers-guide-to-heathrow-parking.excerpt":
      "हीथ्रो यूके का सबसे व्यस्त एयरपोर्ट है और पार्किंग किसी भूलभुलैया जैसी लग सकती है। यहाँ है कि टर्मिनलों के बीच चुनाव कैसे करें, पैसे कैसे बचाएँ, और आराम से कैसे पहुँचें।",
    "blog.post.travellers-guide-to-heathrow-parking.body": [
      "हीथ्रो किसी भी अन्य यूके एयरपोर्ट से अधिक यात्रियों को संभालता है, जो चार टर्मिनलों और सड़कों के एक विशाल जाल में फैले होते हैं। यह पैमाना ही वह कारण है कि वहाँ पार्किंग थोड़ी योजना का प्रतिफल देती है — एक सहज शुरुआत और तनावपूर्ण शुरुआत के बीच का अंतर अक्सर अपने टर्मिनल के लिए सही स्थान चुनने पर निर्भर करता है।",
      "## पहले अपना टर्मिनल जानें",
      "हीथ्रो के टर्मिनल वास्तव में एक-दूसरे से काफी दूर हैं, इसलिए सबसे उपयोगी काम यह है कि कुछ भी बुक करने से पहले पुष्टि करें कि आप किस टर्मिनल से उड़ान भरते हैं। T2 और T3 केंद्रीय क्षेत्र में हैं, T4 दक्षिण में है, और T5 पश्चिम में अपने समर्पित मार्ग के साथ है। ऐसा स्थान जो T5 से चार मिनट की दूरी पर है वह T4 से एक लंबा, ट्रैफ़िक-निर्भर चक्कर हो सकता है, इसलिए लिस्टिंग को समग्र एयरपोर्ट के बजाय अपने टर्मिनल से मिलाएँ।",
      "## हीथ्रो के पास एयरपोर्ट से बाहर के स्थान",
      "एयरपोर्ट के तत्काल आसपास के क्षेत्र — लॉन्गफोर्ड, हैटन क्रॉस, हार्लिंगटन और हाउन्सलो — निजी ड्राइववे और गेटयुक्त अहातों से भरे हैं जो बड़े लॉन्ग-स्टे कार पार्क की तुलना में टर्मिनलों के कहीं अधिक पास हैं। कई केवल कुछ मिनटों की ड्राइव पर हैं, जो एक लाइसेंस प्राप्त ट्रांसफर को तेज़ और अनुमानित बनाती हैं, और कई सीसीटीवी या एक लाइव कैमरा प्रदान करती हैं ताकि आप डिपार्चर लाउंज से अपनी कार देख सकें।",
      "## समय और ट्रैफ़िक",
      "हीथ्रो के आसपास की सड़कें सुबह जल्दी से व्यस्त होती हैं, और केंद्रीय टर्मिनल क्षेत्र व्यस्त समय में जाम हो सकता है। एक अंतराल रखें, और जहाँ संभव हो ऐसा स्थान चुनें जिसका बताया गया ड्राइव समय पहले से उस मार्ग को ध्यान में रखता हो। पार्किंग और ट्रांसफर बंडल बुक करना अंतिम चरण से अनुमान निकाल देता है: आपका ड्राइवर आपके टर्मिनल का मार्ग जानता है, इसलिए आप उड़ान पकड़ने की जल्दी में किसी अपरिचित वन-वे प्रणाली में रास्ता नहीं ढूँढ रहे होते।",
      "## गुणवत्ता से समझौता किए बिना पैसे बचाएँ",
      "सबसे सस्ता विकल्प शायद ही कभी वह होता है जिसकी दैनिक दर सबसे कम हो, एक बार जब एक अलग शटल और उसकी समय-सारणी को गणना में शामिल कर लिया जाए। इसके बजाय पार्किंग और आपके ट्रांसफर की सर्वसमावेशी कीमत देखें, उन यात्रियों की समीक्षाएँ जाँचें जिन्होंने वास्तव में स्थान का उपयोग किया है, और पुष्टि करें कि यह आपकी गाड़ी में समाती है। कुछ दिन पहले बुकिंग करना, खासकर स्कूल की छुट्टियों के आसपास, लगभग हमेशा वहाँ पहुँचकर गेट दर चुकाने से बेहतर होता है।",
      "## आराम से पहुँचें",
      "हीथ्रो को डरावना होने की ज़रूरत नहीं। अपने विशिष्ट टर्मिनल के पास एक सत्यापित स्थान चुनें, एक लाइसेंस प्राप्त ट्रांसफर जोड़ें ताकि अंतिम कुछ मिनट तय हो जाएँ, और यदि आपका स्थान लाइव कैमरा प्रदान करता है तो उसका उपयोग करें। ऐसा करें तो देश का सबसे व्यस्त एयरपोर्ट यात्रा शुरू करने के सबसे आसान स्थानों में से एक बन जाता है।",
    ].join("\n\n"),
  },

  de: {
    // ---- Index hero ----
    "blog.hero.eyebrow": "Der ParkGo-Blog",
    "blog.hero.title": "Cleveres Flughafenparken & Reisen",
    "blog.hero.subtitle":
      "Praktische Ratgeber zu Parken, lizenzierten Transfers, E-Auto-Laden und dem Vertrauen und der Sicherheit, die alles zusammenhalten.",

    // ---- Chrome ----
    "blog.featured": "Empfohlen",
    "blog.readArticle": "Artikel lesen",
    "blog.readMore": "Weiterlesen",
    "blog.minRead": "Min. Lesezeit",
    "blog.min": "Min.",
    "blog.by": "von",
    "blog.backToBlog": "Alle Artikel",
    "blog.tags": "Schlagwörter",

    // ---- Article CTA ----
    "blog.cta.eyebrow": "Clever parken. Entspannt reisen.",
    "blog.cta.title": "Eine Buchung für Parken, Transfer & E-Auto",
    "blog.cta.body": "Sehen Sie geprüfte Stellplätze in der Nähe Ihres Flughafens zu einem transparenten Preis.",
    "blog.cta.start": "Buchung starten",
    "blog.cta.more": "Weitere Artikel",

    // ---- Post: real-cost-of-airport-parking ----
    "blog.post.real-cost-of-airport-parking.title":
      "Die wahren Kosten des Flughafenparkens (und wie Bündeln sie behebt)",
    "blog.post.real-cost-of-airport-parking.excerpt":
      "Aushangpreise erzählen selten die ganze Geschichte. Hier erfahren Sie, wohin das Geld auf einer typischen Flughafenreise wirklich fließt — und warum eine kombinierte Buchung meist vier einzelne schlägt.",
    "blog.post.real-cost-of-airport-parking.body": [
      "Fragen Sie die meisten Reisenden, was Flughafenparken kostet, und sie nennen Ihnen einen Tagessatz. Das ist ein fairer Ausgangspunkt, aber fast nie die Zahl, die auf Ihrer Karte landet. Zwischen Buchungsgebühren, Aufschlägen für Stoßzeiten, Shuttle-Wartezeiten, Sprit für einen Umweg und dem gelegentlichen E-Auto-Laden an einer Autobahnraststätte können der Aushangpreis und der tatsächliche Preis weit auseinanderdriften.",
      "## Wohin das Geld wirklich fließt",
      "Eine übliche einwöchige Reise umfasst meist vier separate Käufe: einen Ort, um das Auto abzustellen, eine Möglichkeit, das Terminal zu erreichen, das Laden, wenn Sie ein E-Auto fahren, und die Gewissheit, dass Ihr Fahrzeug sicher ist. Einzeln gebucht, hat jeder davon seine eigene Gebühr, seine eigenen Stornoregeln und seine eigene Kundendienst-Warteschlange. Die Reibung ist der versteckte Preis, und sie verstärkt sich in dem Moment, in dem sich ein Flug verspätet oder Pläne ändern.",
      "Flughafenferne Parkplätze werben mit niedrigen Tagessätzen und fügen dann einen Shuttle-Transfer hinzu, der nach seinem eigenen Fahrplan läuft. Flughafennahe Optionen sparen sich den Shuttle, verlangen aber einen Aufpreis für den Komfort. Keine der beiden sagt Ihnen im Voraus, was das Laden Ihres Autos kostet oder ob überhaupt jemand darauf achtet, während Sie weg sind.",
      "## Das Argument für einen Preis",
      "ParkGo nimmt die vier Dinge, die Reisende normalerweise jonglieren — einen geprüften Stellplatz, einen lizenzierten Terminaltransfer, E-Auto-Laden und Live-Sicherheit — und kombiniert sie zu einem transparenten Preis an einem Checkout. Sie sehen die vollständige Summe, bevor Sie zahlen, und nicht einen Grundpreis, der still wächst, während Sie die Dinge hinzufügen, die Sie tatsächlich brauchen.",
      "Bündeln ist nicht nur ordentlicher; es ist meist auch günstiger. Wenn Parken und Transfer zusammen verkauft werden, gibt es keine zweite Buchungsgebühr und keinen Anreiz, einen niedrigen Tagessatz mit überraschenden Extras aufzublähen. Und weil der Preis erklärbar ist, sagen Ihnen unsere Vorschläge, warum eine bestimmte Kombination aus Stellplatz und Transfer das beste Preis-Leistungs-Verhältnis für Ihre Daten bietet, statt einfach die teuerste Option zu bewerben.",
      "## Was Sie vor der Buchung prüfen sollten",
      "Bei wem auch immer Sie buchen, drei Fragen sparen Ihnen Geld und Stress. Erstens: Ist die Summe, die Sie sehen, die Summe, die Sie zahlen, inklusive Transfer und etwaigem E-Auto-Laden? Zweitens: Was passiert, wenn sich Ihre Flugzeit ändert — sind Stornierungen flexibel? Drittens: Können Sie tatsächlich überprüfen, dass der Stellplatz sicher ist, idealerweise mit Videoüberwachung oder einer Live-Kamera, die Sie von Ihrem Handy aus einsehen können?",
      "Flughafenparken muss kein Ratespiel sein. Wenn der Preis ehrlich ist und alles, was Sie brauchen, in einer Buchung steckt, entspricht der wahre Preis endlich dem auf dem Bildschirm — und genau das ist die Erfahrung, die wir schaffen wollten.",
    ].join("\n\n"),

    // ---- Post: how-parkgo-verifies-hosts-and-drivers ----
    "blog.post.how-parkgo-verifies-hosts-and-drivers.title":
      "Wie ParkGo Gastgeber und lizenzierte Transfers prüft",
    "blog.post.how-parkgo-verifies-hosts-and-drivers.excerpt":
      "Vertrauen ist das Produkt. Hier erfahren Sie genau, wie wir die Gastgeber prüfen, die sich um Ihr Auto kümmern, wie der lizenzierte Transferbetreiber, den wir integrieren, die Fahrer-Compliance handhabt, und wie wir Dokumente sicher aufbewahren.",
    "blog.post.how-parkgo-verifies-hosts-and-drivers.body": [
      "Sein Auto einem Fremden zu übergeben und darauf zu vertrauen, dass jemand anderes einen zum Flug fährt, funktioniert nur, wenn die Prüfungen hinter den Kulissen echt sind. Bei ParkGo ist die Gastgeber-Verifizierung kein Abzeichen, das wir leichtfertig vergeben — es ist ein Prozess, den jeder Gastgeber abschließt, bevor er auch nur eine einzige Buchung annehmen kann. Der Terminaltransfer wird von einem unabhängigen, lizenzierten Betreiber erbracht, den wir per API integrieren, und die Fahrer-Compliance liegt bei ihm.",
      "## Gastgeber verifizieren",
      "Bevor ein Stellplatz online geht, schließt der dahinterstehende Gastgeber die Identitätsprüfung ab, bestätigt sein Recht, den Platz anzubieten, und reicht Fotos der tatsächlichen Bucht ein. Wir bestätigen eine Adresse und gleichen Ausweisdokumente mit anerkannten Prüfungen ab. Erst wenn diese Prüfung genehmigt ist, wechselt ein Angebot von ausstehend auf live und wird buchbar.",
      "Jeder Stellplatz trägt außerdem klare, ehrliche Angaben: wie weit er wirklich vom Terminal entfernt ist, welche maximale Fahrzeuggröße hineinpasst und ob er Videoüberwachung oder eine Live-Kamera bietet. Gastgeber können diese Angaben nicht heimlich aufwerten — was Sie im Angebot sehen, ist das, was geprüft wurde.",
      "## Der lizenzierte Transferbetreiber",
      "ParkGo betreibt keine eigenen Fahrer und keine Fahrer-App. Der Terminaltransfer wird von einem unabhängigen, lizenzierten und versicherten Betreiber erfüllt, mit dem wir uns per API verbinden. Dieser Betreiber besitzt die Konzession als Mietwagenbetreiber, die gewerbliche Fahrgastversicherung und die Plakette jedes Fahrers und ist dafür verantwortlich, Fahrer einzeln zu überprüfen und sie regelmäßig erneut zu kontrollieren — damit kein abgelaufenes Zertifikat durchrutschen kann. Wir zeigen ihren Live-Status, ihr SLA und ihre Bewertungen in der App an, aber die fahrerseitige Compliance liegt bei ihnen.",
      "Am Reisetag teilen der lizenzierte Fahrer, der Gastgeber und Sie eine einzige Live-Karte, und die Übergabe wird mit einem Einmalcode bestätigt, den beide Parteien eingeben. Dieser Code wird mit Zeitstempel versehen und protokolliert, sodass es stets eine klare Aufzeichnung darüber gibt, wer das Auto wann abgeholt hat.",
      "## Sensible Dokumente sicher aufbewahren",
      "Verifizierung bedeutet den Umgang mit sensiblem Material — Reisepässe, Führerscheine, Versicherungsnachweise. Wir behandeln diese KYC-Dokumente als separate, zugriffsgeschützte Kategorie, getrennt von alltäglichen Kontodaten und verschlüsselt. Der Marktplatz speichert einen Verweis auf ein Dokument, nicht das Dokument selbst, sodass die Menschen, die Funktionen entwickeln, die zugrunde liegenden Dateien nie berühren müssen.",
      "Das Ergebnis ist ein Vertrauenswert, den Sie tatsächlich nachvollziehen können: aufgebaut aus Verifizierungsstatus, echten Bewertungen aus abgeschlossenen Buchungen, Zuverlässigkeit und Zugehörigkeitsdauer. Es ist keine Eitelkeitskennzahl — es ist dasselbe Signal, das wir intern nutzen, um zu entscheiden, wer auf die Plattform gehört.",
    ].join("\n\n"),

    // ---- Post: ev-charging-while-you-fly ----
    "blog.post.ev-charging-while-you-fly.title": "E-Auto laden, während Sie fliegen: Was Sie wissen sollten",
    "blog.post.ev-charging-while-you-fly.excerpt":
      "Zu einem vollgeladenen Auto zurückzukommen ist eine der stillen Freuden des elektrischen Fahrens. Hier erfahren Sie, wie Sie das E-Auto-Laden am Flughafen für sich nutzen, von Steckern bis zu Kosten.",
    "blog.post.ev-charging-while-you-fly.body": [
      "Es gibt kaum schönere Arten, eine Reise zu beenden, als zu einem Auto zurückzukehren, das sich still selbst aufgeladen hat, während Sie weg waren. Für E-Auto-Fahrer ist Flughafenparken eine seltene Zeitspanne, in der das Auto tagelang stillsteht — perfekt für ein langsames, sanftes Aufladen, das die Batterie schont, mehr als Schnellladen unterwegs.",
      "## Passen Sie den Stecker an Ihr Auto an",
      "Die meisten Ladevorgänge im Heimstil nutzen einen Typ-2-Stecker mit etwa 7 kW, ideal für einen mehrtägigen Aufenthalt: reichlich Zeit, um eine volle Ladung zu erreichen, ohne die Batterie zu belasten. Schnellere Optionen mit CCS können 22 kW oder mehr liefern, nützlich für eine kurze Reise, bei der Sie mit Reichweitenreserve losfahren möchten. Prüfen Sie vor der Buchung, ob der Stellplatz den Stecker und die Geschwindigkeit auflistet, die Ihr Auto unterstützt.",
      "## Verstehen Sie, was Sie zahlen werden",
      "E-Auto-Laden wird meist pro Kilowattstunde berechnet, sodass die Kosten davon abhängen, wie viel Energie Sie tatsächlich beziehen, und nicht davon, wie lange Sie eingesteckt sind. Ein Stellplatz, der seinen kWh-Preis im Voraus anzeigt, lässt Sie die Kosten vorab abschätzen — und wenn das Laden Teil einer einzigen gebündelten Buchung ist, steht diese Zahl in derselben transparenten Summe wie Ihr Parken und Ihr Transfer, ohne separate App oder Zahlung, mit der Sie sich am Tag herumschlagen müssen.",
      "## Ein paar praktische Tipps",
      "Kommen Sie mit einem vernünftigen Ladestand an statt fast leer; langsames Laden von einem niedrigen Stand über mehrere Tage ist in Ordnung, aber Sie müssen es auf der Anfahrt nicht zu knapp bemessen. Wenn Ihr Auto ein Ladelimit zulässt, sind 80 Prozent für längere Aufenthalte schonender für die Batterie. Und bringen Sie ein Kabel mit oder bestätigen Sie es, wenn das Angebot eines verlangt — manche Gastgeber stellen eines bereit, andere erwarten, dass Sie Ihr eigenes verwenden.",
      "Laden, während Sie fliegen, ist eines dieser kleinen Details, das einen stressigen Reisetag in einen leichten verwandelt. Wählen Sie einen Stellplatz mit dem richtigen Stecker, prüfen Sie den kWh-Preis und lassen Sie das Auto den langweiligen Teil erledigen, während Sie an einem weitaus interessanteren Ort sind.",
    ].join("\n\n"),

    // ---- Post: travellers-guide-to-heathrow-parking ----
    "blog.post.travellers-guide-to-heathrow-parking.title":
      "Ein Reiseführer zum Parken in Heathrow",
    "blog.post.travellers-guide-to-heathrow-parking.excerpt":
      "Heathrow ist der verkehrsreichste Flughafen Großbritanniens und Parken kann sich wie ein Labyrinth anfühlen. Hier erfahren Sie, wie Sie zwischen Terminals wählen, Geld sparen und entspannt ankommen.",
    "blog.post.travellers-guide-to-heathrow-parking.body": [
      "Heathrow bewältigt mehr Passagiere als jeder andere britische Flughafen, verteilt auf vier Terminals und ein weitläufiges Straßennetz. Genau dieser Umfang ist der Grund, warum sich Parken dort mit ein wenig Planung auszahlt — der Unterschied zwischen einem reibungslosen und einem stressigen Start hängt oft davon ab, den richtigen Stellplatz für Ihr Terminal zu wählen.",
      "## Kennen Sie zuerst Ihr Terminal",
      "Heathrows Terminals liegen wirklich weit auseinander, daher ist das Nützlichste, was Sie tun können, vor jeder Buchung zu bestätigen, von welchem Sie abfliegen. T2 und T3 liegen im zentralen Bereich, T4 im Süden und T5 im Westen mit eigener Zufahrt. Ein Stellplatz, der vier Minuten von T5 entfernt ist, kann von T4 eine lange, verkehrsabhängige Schleife sein, passen Sie das Angebot also an Ihr Terminal an und nicht an den Flughafen im Allgemeinen.",
      "## Flughafenferne Stellplätze in der Nähe von Heathrow",
      "Die Gebiete unmittelbar rund um den Flughafen — Longford, Hatton Cross, Harlington und Hounslow — sind übersät mit privaten Einfahrten und umzäunten Höfen, die weit näher an den Terminals liegen als die großen Langzeitparkplätze. Viele sind nur wenige Fahrminuten entfernt, was einen lizenzierten Transfer schnell und planbar macht, und mehrere bieten Videoüberwachung oder eine Live-Kamera, sodass Sie Ihr Auto von der Abflughalle aus im Blick behalten können.",
      "## Zeitplanung und Verkehr",
      "Die Straßen rund um Heathrow sind vom frühen Morgen an stark befahren, und der zentrale Terminalbereich kann sich zu Stoßzeiten stauen. Planen Sie einen Puffer ein und wählen Sie nach Möglichkeit einen Stellplatz, dessen angegebene Fahrzeit diese Anfahrt bereits berücksichtigt. Die Buchung eines Park-und-Transfer-Pakets nimmt der letzten Etappe das Rätselraten: Ihr Fahrer kennt die Route zu Ihrem Terminal, sodass Sie sich nicht mit Flug im Nacken durch ein unbekanntes Einbahnstraßensystem navigieren.",
      "## Geld sparen, ohne Abstriche zu machen",
      "Die günstigste Option ist selten die mit dem niedrigsten Tagessatz, sobald ein separater Shuttle und dessen Fahrplan einberechnet sind. Schauen Sie stattdessen auf den All-inclusive-Preis für Parken plus Ihren Transfer, prüfen Sie die Bewertungen von Reisenden, die den Stellplatz tatsächlich genutzt haben, und vergewissern Sie sich, dass er zu Ihrem Fahrzeug passt. Ein paar Tage im Voraus zu buchen, besonders in den Schulferien, schlägt fast immer das Ankommen und Zahlen eines Tarifs vor Ort.",
      "## Entspannt ankommen",
      "Heathrow muss nicht einschüchternd sein. Wählen Sie einen geprüften Stellplatz in der Nähe Ihres konkreten Terminals, bündeln Sie einen lizenzierten Transfer, damit die letzten Minuten geregelt sind, und nutzen Sie die Live-Kamera, falls Ihr Stellplatz eine bietet. Tun Sie das, und der verkehrsreichste Flughafen des Landes wird zu einem der einfachsten Orte, um eine Reise zu beginnen.",
    ].join("\n\n"),
  },

  zh: {
    // ---- Index hero ----
    "blog.hero.eyebrow": "ParkGo 博客",
    "blog.hero.title": "更聪明的机场停车与出行",
    "blog.hero.subtitle":
      "关于停车、持牌接送、电动车充电，以及将这一切紧密联系在一起的信任与安全的实用指南。",

    // ---- Chrome ----
    "blog.featured": "精选",
    "blog.readArticle": "阅读文章",
    "blog.readMore": "阅读更多",
    "blog.minRead": "分钟阅读",
    "blog.min": "分钟",
    "blog.by": "作者",
    "blog.backToBlog": "所有文章",
    "blog.tags": "标签",

    // ---- Article CTA ----
    "blog.cta.eyebrow": "聪明停车，轻松出行。",
    "blog.cta.title": "一次预订搞定停车、接送与电动车充电",
    "blog.cta.body": "以一个透明价格查看您机场附近经过验证的车位。",
    "blog.cta.start": "开始预订",
    "blog.cta.more": "更多文章",

    // ---- Post: real-cost-of-airport-parking ----
    "blog.post.real-cost-of-airport-parking.title":
      "机场停车的真实成本（以及打包如何解决它）",
    "blog.post.real-cost-of-airport-parking.excerpt":
      "标价很少能道出全部真相。这里说明在一次典型的机场出行中钱究竟花在了哪里——以及为什么一次合并预订通常胜过四次分开预订。",
    "blog.post.real-cost-of-airport-parking.body": [
      "问大多数旅客机场停车要多少钱，他们会报给你一个每日价。这是一个合理的出发点，但它几乎从来不是最终落到你卡上的数字。在预订费、旺季附加费、班车等待、绕路的油费，以及偶尔在高速服务区给电动车补电之间，标价和真实价格可能相差甚远。",
      "## 钱究竟花在了哪里",
      "一次标准的为期一周的行程通常涉及四笔各自独立的支出：一个停车的地方、一种抵达航站楼的方式、如果你开电动车还有充电，以及知道爱车安全的那份安心。分开预订时，每一项都有各自的费用、各自的取消规则和各自的客服排队。这种摩擦正是隐藏成本，而且一旦航班延误或计划改变，它便会叠加放大。",
      "机场外的停车场以低廉的每日价招揽顾客，然后再加上一趟按自己时刻表运行的班车接送。机场内的选择省去了班车，却为这份便利收取溢价。两者都不会预先告诉你给爱车充电要花多少钱，或者在你离开时是否真的有人在看管它。",
      "## 一个价格的理由",
      "ParkGo 把旅客通常要同时应付的四样东西——一个经过验证的停车位、一趟持牌航站楼接送、电动车充电和实时安防——在一次结账中整合为一个透明的价格。你在付款前就看到完整总额，而不是一个随着你添加真正需要的东西而悄悄上涨的基础价。",
      "打包不仅更整洁，通常也更便宜。当停车和接送捆绑出售时，就没有第二笔预订费，也没有动机用意外的附加项去填补一个低廉的每日价。而且由于价格可以解释，我们的建议会告诉你为何某个特定的车位与接送组合最适合你的日期、性价比最高，而不是一味推销最贵的选项。",
      "## 预订前该核对什么",
      "无论你向谁预订，三个问题都能为你省下金钱和烦恼。第一，你看到的总额是否就是你要支付的总额，包含接送和任何电动车充电？第二，如果你的航班时间变动会怎样——取消是否灵活？第三，你能否真正核实该车位是安全的，最好配有闭路电视或你能用手机查看的实时摄像头？",
      "机场停车不必是一场猜谜游戏。当价格诚实、你所需的一切都在一次预订之中，真实成本终于与屏幕上显示的一致——而这正是我们着手打造的体验。",
    ].join("\n\n"),

    // ---- Post: how-parkgo-verifies-hosts-and-drivers ----
    "blog.post.how-parkgo-verifies-hosts-and-drivers.title":
      "ParkGo 如何验证房东和持牌接送",
    "blog.post.how-parkgo-verifies-hosts-and-drivers.excerpt":
      "信任就是产品。这里确切说明我们如何验证照看你爱车的房东，我们所对接的持牌接送运营商如何处理司机合规，以及我们如何妥善保管文件。",
    "blog.post.how-parkgo-verifies-hosts-and-drivers.body": [
      "把爱车交给一个陌生人，并信任另一个人开车送你去赶飞机，只有当幕后的核查是真实的时候才行得通。在 ParkGo，房东验证不是我们轻易发放的徽章——它是每位房东在接下第一笔预订之前都要完成的流程。航站楼接送由一家我们通过 API 对接的独立持牌运营商提供，司机合规由他们负责。",
      "## 验证房东",
      "在一个停车位上线之前，其背后的房东要完成身份验证、确认自己有权发布该车位，并提交实际车位的照片。我们核实地址，并将身份证件对照公认的核查进行审核。只有当该审核获批后，一个房源才会从待审转为上线并可供预订。",
      "每个车位还附有清晰、诚实的细节：它距航站楼究竟有多远、可容纳的最大车型，以及是否提供闭路电视或实时摄像头。房东无法悄悄拔高这些声明——你在房源上看到的就是经过验证的。",
      "## 持牌接送运营商",
      "ParkGo 不运营自己的司机或司机应用。航站楼接送由一家我们通过 API 连接的独立、持牌且投保的运营商完成。该运营商持有私人租车运营牌照、商业乘客保险以及每位司机的证章，并负责逐一审查司机、定期复核他们——因此过期的证书无法蒙混过关。我们在应用中呈现他们的实时状态、服务水平协议和评分，但司机端的合规由他们负责。",
      "在出行当天，持牌司机、房东和你共享同一张实时地图，交接通过双方各自输入的一次性验证码确认。该验证码带有时间戳并被记录在案，因此始终有清晰的记录，表明是谁在何时取走了车。",
      "## 妥善保管敏感文件",
      "验证意味着处理敏感材料——护照、驾照、保险凭证。我们把这些 KYC 文件当作一个独立的、受访问控制的类别对待，与日常账户数据分开存放并加密。市场平台存储的是对文件的引用，而非文件本身，因此开发功能的人员永远无需接触底层文件。",
      "其结果是一个你真正可以理解的信任评分：由验证状态、来自已完成预订的真实评价、可靠性和资历构成。它不是虚荣指标——它与我们内部用来决定谁该留在平台上的信号完全一致。",
    ].join("\n\n"),

    // ---- Post: ev-charging-while-you-fly ----
    "blog.post.ev-charging-while-you-fly.title": "飞行途中给电动车充电：你需要知道的",
    "blog.post.ev-charging-while-you-fly.excerpt":
      "回来时迎接你的是一辆充满电的车，这是开电动车的静静乐趣之一。这里说明如何让机场电动车充电为你所用，从接口到费用。",
    "blog.post.ev-charging-while-you-fly.body": [
      "结束一段旅程，很少有比走回一辆在你离开期间已悄悄充好电的车更惬意的方式了。对电动车车主来说，机场停车是车辆连续多日静止的难得时段——非常适合缓慢、温和地补电，比在路上快充对电池更友好。",
      "## 让接口与你的车相匹配",
      "大多数家用式充电使用约 7 kW 的 Type 2 接口，非常适合多日停留：有充足时间充满电而不给电池造成压力。使用 CCS 的更快选择可提供 22 kW 或更高，适合你想留有余量续航再出发的短途出行。预订前，请核对该车位列出的接口和速度是否为你的车所支持。",
      "## 了解你将支付多少",
      "电动车充电通常按每千瓦时计价，因此费用取决于你实际取用了多少电量，而非你插电多久。一个预先显示每千瓦时费率的车位能让你提前估算成本——而当充电是单次打包预订的一部分时，这个数字就与你的停车和接送同处于一个透明总额之中，无需在当天再去应付另一个应用或另一笔付款。",
      "## 几点实用建议",
      "抵达时保持一个合理的电量，而不是几近耗尽；在多日内从较低电量缓慢涓流充电没有问题，但你不必在开车前往的路上把电量压得太低。如果你的车允许设置充电上限，对于较长的停留，80% 对电池更为温和。另外，如果房源说明需要充电线，请务必自带或先行确认——有些房东会提供，有些则希望你使用自己的。",
      "飞行途中充电正是那种能把一个紧张的出行日变得轻松的小细节。挑一个接口合适的车位，核对每千瓦时的价格，让车去做那件枯燥的事，而你则身处远为有趣的地方。",
    ].join("\n\n"),

    // ---- Post: travellers-guide-to-heathrow-parking ----
    "blog.post.travellers-guide-to-heathrow-parking.title":
      "希思罗停车旅客指南",
    "blog.post.travellers-guide-to-heathrow-parking.excerpt":
      "希思罗是英国最繁忙的机场，停车会让人觉得像走迷宫。这里说明如何在各航站楼之间做选择、如何省钱，以及如何从容抵达。",
    "blog.post.travellers-guide-to-heathrow-parking.body": [
      "希思罗处理的旅客比英国任何其他机场都多，分布在四座航站楼和一张庞大的道路网络之中。正是这样的规模，使得在那里停车值得稍加规划——顺利开局与狼狈开局之间的差别，往往取决于为你的航站楼选对车位。",
      "## 先弄清你的航站楼",
      "希思罗各航站楼之间确实相距甚远，因此你能做的最有用的事，就是在预订任何东西之前先确认你从哪一座出发。T2 和 T3 位于中央区域，T4 在南侧，T5 在西侧并有其专属进场道路。一个距 T5 四分钟的车位，从 T4 出发可能要绕一大圈且受路况左右，所以要让房源匹配你的航站楼，而不是笼统地匹配机场。",
      "## 希思罗附近的机场外车位",
      "机场紧邻的区域——朗福德、哈顿十字、哈灵顿和豪恩斯洛——遍布私人车道和带门的院落，它们比大型长停车场离航站楼近得多。许多只需几分钟车程，这让持牌接送快捷而可预测，其中数处还提供闭路电视或实时摄像头，让你在候机厅就能查看爱车。",
      "## 时间与交通",
      "希思罗周边道路从清晨起便车流繁忙，中央航站楼区域在高峰时段可能拥堵。留出缓冲时间，并尽可能选择其标注车程已计入这段进场路况的车位。预订停车加接送的套餐，能为最后一程消除猜测：你的司机熟悉通往你航站楼的路线，因此你无需在赶飞机之际于陌生的单行道系统里摸索。",
      "## 省钱而不将就",
      "一旦把单独的班车及其时刻表计算在内，最便宜的选择很少是每日价最低的那个。不如去看停车加接送的一价全包价格，查看真正用过该车位的旅客评价，并确认它能容下你的车。提前几天预订，尤其是在学校假期前后，几乎总是胜过临到现场支付闸口价。",
      "## 从容抵达",
      "希思罗不必令人生畏。在你具体的航站楼附近挑一个经过验证的车位，捆绑一趟持牌接送好让最后几分钟妥妥当当，如果你的车位提供实时摄像头就用起来。做到这些，全国最繁忙的机场便会成为最适合开启旅程的地方之一。",
    ].join("\n\n"),
  },
};
