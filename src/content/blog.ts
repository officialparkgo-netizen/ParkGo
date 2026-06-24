/**
 * Typed blog content for the ParkGo marketing site.
 *
 * Posts are authored as plain data so they render server-side with zero
 * dependencies. Each `body` entry is a paragraph; a line beginning with
 * "## " is rendered as an <h2> subheading by the post page.
 */

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  /** ISO date string, e.g. "2026-05-14". */
  date: string;
  author: string;
  readMins: number;
  tags: string[];
  body: string[];
}

export const posts: BlogPost[] = [
  {
    slug: "real-cost-of-airport-parking",
    title: "The real cost of airport parking (and how bundling fixes it)",
    excerpt:
      "Sticker prices rarely tell the whole story. Here is where the money actually goes on a typical airport trip — and why one combined booking usually beats four separate ones.",
    date: "2026-05-28",
    author: "The ParkGo Team",
    readMins: 6,
    tags: ["Pricing", "Travel tips", "Bundling"],
    body: [
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
    ],
  },
  {
    slug: "how-parkgo-verifies-hosts-and-drivers",
    title: "How ParkGo verifies hosts and drivers",
    excerpt:
      "Trust is the product. Here is exactly how we check the people who look after your car and get you to the terminal — and how we keep their documents safe.",
    date: "2026-05-14",
    author: "Priya, Trust & Safety",
    readMins: 7,
    tags: ["Trust & safety", "Verification", "How it works"],
    body: [
      "Handing your car to a stranger and trusting someone else to drive you to a flight only works if the checks behind the scenes are real. At ParkGo, verification is not a badge we hand out lightly — it is a process every host and every transfer partner completes before they can take a single booking.",
      "## Verifying hosts",
      "Before a parking space goes live, the host behind it completes identity verification, confirms their right to list the space, and submits photographs of the actual bay. We confirm an address and run identity documents against recognised checks. Only once that review is approved does a listing move from pending to live and become bookable.",
      "Every space also carries clear, honest detail: how far it really is from the terminal, the maximum vehicle size it fits, and whether it offers CCTV or a live camera. Hosts cannot quietly upgrade those claims — what you see on the listing is what has been verified.",
      "## Verifying transfer partners and drivers",
      "Transfer is where licensing matters most. Partners must hold a valid private-hire operator licence, and we record the licence number, commercial passenger insurance and its expiry, and the badge details of each driver. Drivers are verified individually, not just waved through under a company account, and partners are periodically re-verified so an expired insurance certificate cannot slip through unnoticed.",
      "On travel day, the licensed driver, the host and you share a single live map, and the handover is confirmed with a one-time code that both parties enter. That code is timestamped and logged, so there is always a clear record of who collected the car and when.",
      "## Keeping sensitive documents safe",
      "Verification means handling sensitive material — passports, licences, insurance certificates. We treat those KYC documents as a separate, access-controlled category, kept apart from everyday account data and encrypted. The marketplace stores a reference to a document, not the document itself, so the people building features never need to touch the underlying files.",
      "The result is a trust score you can actually reason about: built from verification status, genuine reviews from completed bookings, reliability and tenure. It is not a vanity metric — it is the same signal we use internally to decide who belongs on the platform.",
    ],
  },
  {
    slug: "ev-charging-while-you-fly",
    title: "EV charging while you fly: what to know",
    excerpt:
      "Coming home to a fully charged car is one of the quiet joys of driving electric. Here is how to make airport EV charging work for you, from connectors to costs.",
    date: "2026-04-30",
    author: "The ParkGo Team",
    readMins: 5,
    tags: ["EV", "Travel tips", "Sustainability"],
    body: [
      "There are few nicer ways to end a trip than walking back to a car that has quietly charged itself while you were away. For EV drivers, airport parking is a rare stretch of time when the car sits still for days — perfect for a slow, gentle top-up that is kinder to the battery than rapid charging on the move.",
      "## Match the connector to your car",
      "Most home-style charging uses a Type 2 connector at around 7 kW, which is ideal for a multi-day stay: plenty of time to reach a full charge without stressing the battery. Faster options using CCS can deliver 22 kW or more, useful for a short trip where you want to leave with range to spare. Before you book, check that the space lists the connector and speed your car supports.",
      "## Understand what you will pay",
      "EV charging is usually priced per kilowatt-hour, so the cost depends on how much energy you actually draw rather than how long you are plugged in. A space that shows its per-kWh rate up front lets you estimate the cost in advance — and when charging is part of a single bundled booking, that figure sits in the same transparent total as your parking and transfer, with no separate app or payment to wrestle with on the day.",
      "## A few practical tips",
      "Arrive with a sensible state of charge rather than nearly empty; trickle charging from a low level over several days is fine, but you do not need to cut it fine on the drive in. If your car lets you set a charge limit, 80 percent is gentler on the battery for longer stays. And do bring or confirm a cable if the listing says one is required — some hosts provide one, others expect you to use your own.",
      "Charging while you fly is one of those small details that turns a stressful travel day into an easy one. Pick a space with the right connector, check the per-kWh price, and let the car do the boring part while you are somewhere far more interesting.",
    ],
  },
  {
    slug: "travellers-guide-to-heathrow-parking",
    title: "A traveller's guide to Heathrow parking",
    excerpt:
      "Heathrow is the UK's busiest airport and parking can feel like a maze. Here is how to choose between terminals, save money, and arrive relaxed.",
    date: "2026-04-16",
    author: "The ParkGo Team",
    readMins: 7,
    tags: ["Heathrow", "Travel tips", "Airports"],
    body: [
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
    ],
  },
];

/** All posts, newest first. */
export function getAllPosts(): BlogPost[] {
  return [...posts].sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

/** Look up a single post by slug. */
export function getPost(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}
