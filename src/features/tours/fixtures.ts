import { TourDetailSchema, type TourDetail } from "./schema";

/**
 * Mock tour catalog behind `data.ts`. Each entry parses through TourDetailSchema
 * so it can't drift. Slugs + ids match the destinations `FEATURED_TOURS` teasers
 * so a TourCard anywhere links into the matching detail page. Swap for API calls
 * later without touching components.
 */

/** Curated Unsplash photo per seed (no API key); unknown seeds fall back to picsum. */
const UNSPLASH_BY_SEED: Record<string, string> = {
  "angkor-1": "1563492065599-3520f775eeed",
  "angkor-2": "1539367628448-4bc5c9d171c8",
  "angkor-3": "1528127269322-539801943592",
  "angkor-4": "1600880292089-90a7e086ee0c",
  "tonle-1": "1544551763-46a013bb70d5",
  "cooking-1": "1414235077428-338989a2e8c0",
  "jeju-1": "1559128010-7c1ad6e1b6a5",
  "jeju-2": "1464822759023-fed622ff2c3b",
  "jeju-3": "1507525428034-b723cf961d3e",
  "jeju-4": "1517154421773-0529f29ea451",
  "seoul-1": "1485871981521-5b1fd3805eee",
  "seoul-2": "1538485399081-7c8ce013b933",
  "seoul-3": "1552465011-b4e21bf6e79a",
  "kyoto-1": "1528181304800-259b08848526",
  "kyoto-2": "1545569341-9eb8b30979d9",
  "kyoto-3": "1493976040374-85c8e12f0c0e",
};

const img = (seed: string, w = 1200, h = 800) => {
  const id = UNSPLASH_BY_SEED[seed];
  return id
    ? `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`
    : `https://picsum.photos/seed/${seed}/${w}/${h}`;
};

const avatar = (n: number) => `https://i.pravatar.cc/120?img=${n}`;
const agencyLogo = (seed: string) => `https://picsum.photos/seed/${seed}/160/160`;

const RAW_TOURS = [
  {
    id: "tour-angkor-3d",
    slug: "angkor-discovery-3d2n",
    title: "Angkor Discovery — Temples & Sunrise",
    tagline: "Three days through Angkor's greatest temples with a local guide.",
    description:
      "Wake before dawn for the legendary sunrise over Angkor Wat, then trace a thousand years of Khmer history across Bayon, Ta Prohm and the Angkor Thom complex. Between temples you'll cruise the Tonlé Sap floating villages and cook a Khmer feast with a market chef. Small groups, air-conditioned transport, and an English- or Khmer-speaking guide throughout.",
    heroImage: img("angkor-1"),
    gallery: [img("angkor-1"), img("angkor-2"), img("angkor-3"), img("angkor-4"), img("tonle-1"), img("cooking-1")],
    travelType: "CULTURAL",
    province: "Siem Reap",
    durationDays: 3,
    groupSizeMax: 12,
    languages: ["English", "Khmer"],
    cancellationPolicy: "free",
    rating: 4.9,
    reviewCount: 412,
    highlights: [
      "Sunrise at Angkor Wat before the crowds",
      "Explore Ta Prohm, the jungle temple",
      "Tonlé Sap floating village boat cruise",
      "Hands-on Khmer cooking class",
    ],
    included: [
      "Professional licensed guide",
      "Air-conditioned transport",
      "Angkor 3-day temple pass",
      "Daily breakfast + cooking-class lunch",
      "Hotel pickup and drop-off",
    ],
    excluded: ["International flights", "Travel insurance", "Personal expenses & tips"],
    unitPrice: 289,
    platformFee: 18,
    availability: "available",
    agency: {
      id: "ag-angkor",
      slug: "angkor-trails-agency",
      name: "Angkor Trails Agency",
      owner: "Dara Veasna",
      logo: agencyLogo("agency-angkor"),
      province: "Siem Reap",
      status: "APPROVED",
      rating: 4.9,
      reviewCount: 412,
      tourCount: 8,
      bio: "Siem Reap-based specialists in Angkor heritage and Tonlé Sap eco-tours since 2012. Every guide is a licensed Khmer historian.",
      contactEmail: "hello@angkortrails.test",
      contactPhone: "+855 63 555 0142",
    },
    travelPlan: [
      {
        day: 1,
        title: "Arrival & Angkor Thom",
        stops: [
          { order: 1, name: "Hotel pickup, Siem Reap", durationLabel: "30 min", notes: "Meet your guide and group." },
          { order: 2, name: "Angkor Thom & Bayon", durationLabel: "3 hours", image: img("angkor-3"), notes: "The smiling stone faces of Bayon." },
          { order: 3, name: "Ta Prohm", durationLabel: "1.5 hours", image: img("angkor-2"), notes: "Temple wrapped in jungle roots." },
        ],
      },
      {
        day: 2,
        title: "Sunrise & Tonlé Sap",
        stops: [
          { order: 1, name: "Angkor Wat sunrise", durationLabel: "2.5 hours", image: img("angkor-1"), notes: "Arrive at 5am for the reflection pools." },
          { order: 2, name: "Tonlé Sap floating village", durationLabel: "3 hours", image: img("tonle-1"), notes: "Boat cruise through stilt-house communities." },
        ],
      },
      {
        day: 3,
        title: "Market & cooking class",
        stops: [
          { order: 1, name: "Local market tour", durationLabel: "1 hour", notes: "Shop for fresh herbs and spices." },
          { order: 2, name: "Khmer cooking class", durationLabel: "2.5 hours", image: img("cooking-1"), notes: "Cook amok and lok lak, then feast." },
        ],
      },
    ],
    reviews: [
      { id: "tr-ak-1", authorName: "Sophea Chan", authorAvatar: avatar(12), rating: 5, comment: "Sunrise over Angkor Wat was unreal. Our guide knew every hidden corner and the cooking class was a blast.", createdAt: "2026-05-28T08:15:00.000Z", photos: [img("angkor-1", 400, 300), img("cooking-1", 400, 300)], bookingCompleted: true },
      { id: "tr-ak-2", authorName: "James Whitfield", authorAvatar: avatar(15), rating: 5, comment: "Perfectly paced over three days. Small group, comfy van, and the Tonlé Sap cruise was a highlight.", createdAt: "2026-05-10T11:00:00.000Z", photos: [], bookingCompleted: true },
      { id: "tr-ak-3", authorName: "Dara Sok", authorAvatar: avatar(45), rating: 4, comment: "Wonderful trip — only wish we had more time at Ta Prohm. Guide was excellent.", createdAt: "2026-04-22T09:30:00.000Z", photos: [img("angkor-2", 400, 300)], bookingCompleted: true },
      { id: "tr-ak-4", authorName: "Mai Tanaka", authorAvatar: avatar(48), rating: 5, comment: "Booked for my parents and they loved every minute. Highly professional agency.", createdAt: "2026-04-05T14:45:00.000Z", photos: [], bookingCompleted: true },
    ],
  },
  {
    id: "tour-jeju-4d",
    slug: "jeju-nature-escape-4d3n",
    title: "Jeju Nature Escape",
    tagline: "Four days of volcanic coastline, crater hikes and oceanfront calm.",
    description:
      "Circle South Korea's island of waterfalls: hike the Hallasan crater rim, walk the Seongsan sunrise peak, and unwind at an oceanfront resort. A relaxed nature-first itinerary with plenty of time for tangerine farms, black-sand beaches and seafood markets.",
    heroImage: img("jeju-1"),
    gallery: [img("jeju-1"), img("jeju-2"), img("jeju-3"), img("jeju-4")],
    travelType: "NATURE",
    province: "Jeju",
    durationDays: 4,
    groupSizeMax: 10,
    languages: ["English", "Korean"],
    cancellationPolicy: "free",
    rating: 4.8,
    reviewCount: 318,
    highlights: [
      "Hallasan crater-rim hike",
      "Seongsan Ilchulbong sunrise peak",
      "Oceanfront resort stay",
      "Tangerine farm & seafood market",
    ],
    included: ["English/Korean guide", "3 nights oceanfront resort", "Daily breakfast", "Island transport", "Park entrance fees"],
    excluded: ["Flights to Jeju", "Lunches & dinners", "Travel insurance"],
    unitPrice: 540,
    platformFee: 30,
    availability: "limited",
    agency: {
      id: "ag-hallasan",
      slug: "hallasan-tours",
      name: "Hallasan Tours",
      owner: "Min-jun Park",
      logo: agencyLogo("agency-hallasan"),
      province: "Jeju",
      status: "APPROVED",
      rating: 4.8,
      reviewCount: 318,
      tourCount: 6,
      bio: "Jeju-born guides sharing the island's volcanic trails and hidden coves. Sustainable, small-group nature travel.",
      contactEmail: "trips@hallasantours.test",
      contactPhone: "+82 64 555 7720",
    },
    travelPlan: [
      {
        day: 1,
        title: "Arrival & west coast",
        stops: [
          { order: 1, name: "Jeju Airport pickup", durationLabel: "30 min" },
          { order: 2, name: "Hallim Park & coastline", durationLabel: "2 hours", image: img("jeju-3"), notes: "Subtropical gardens and lava caves." },
        ],
      },
      {
        day: 2,
        title: "Hallasan hike",
        stops: [
          { order: 1, name: "Hallasan crater trail", durationLabel: "5 hours", image: img("jeju-2"), notes: "Korea's highest peak — moderate difficulty." },
        ],
      },
      {
        day: 3,
        title: "Sunrise peak & east",
        stops: [
          { order: 1, name: "Seongsan Ilchulbong", durationLabel: "2 hours", image: img("jeju-4"), notes: "Tuff cone sunrise hike." },
          { order: 2, name: "Tangerine farm visit", durationLabel: "1 hour" },
        ],
      },
      {
        day: 4,
        title: "Markets & departure",
        stops: [{ order: 1, name: "Dongmun seafood market", durationLabel: "1.5 hours" }],
      },
    ],
    reviews: [
      { id: "tr-jj-1", authorName: "Min-jun Park", authorAvatar: avatar(33), rating: 5, comment: "Jeju's crater hike and coastline were the highlight of our trip. Guide was patient and knowledgeable.", createdAt: "2026-05-22T13:40:00.000Z", photos: [img("jeju-2", 400, 300)], bookingCompleted: true },
      { id: "tr-jj-2", authorName: "Elena Rossi", authorAvatar: avatar(24), rating: 5, comment: "Resort was stunning and the pace was relaxing. Perfect for a nature lover.", createdAt: "2026-05-02T10:10:00.000Z", photos: [], bookingCompleted: true },
      { id: "tr-jj-3", authorName: "Ji-woo Lee", authorAvatar: avatar(20), rating: 4, comment: "Loved the sunrise peak. A little rushed on the last day but overall excellent.", createdAt: "2026-04-18T08:00:00.000Z", photos: [], bookingCompleted: true },
    ],
  },
  {
    id: "tour-seoul-2d",
    slug: "seoul-culture-food-2d1n",
    title: "Seoul Culture & Street Food",
    tagline: "Two days of palaces, hanok lanes and night-market street eats.",
    description:
      "A fast, flavour-packed weekend in Seoul: wander Bukchon's hanok lanes, tour Gyeongbokgung Palace, then graze your way through Gwangjang Market before a Han River night cruise. Ideal for first-timers who want culture and food in one trip.",
    heroImage: img("seoul-1"),
    gallery: [img("seoul-1"), img("seoul-2"), img("seoul-3")],
    travelType: "FOOD",
    province: "Seoul",
    durationDays: 2,
    groupSizeMax: 14,
    languages: ["English", "Korean"],
    cancellationPolicy: "nonRefundable",
    rating: 4.7,
    reviewCount: 256,
    highlights: ["Bukchon Hanok Village walk", "Gyeongbokgung Palace tour", "Gwangjang Market food crawl", "Han River night cruise"],
    included: ["Local food guide", "1 night downtown hotel", "Market tastings", "River cruise ticket"],
    excluded: ["Flights", "Some meals", "Travel insurance"],
    unitPrice: 175,
    platformFee: 12,
    availability: "available",
    agency: {
      id: "ag-hangang",
      slug: "hangang-journeys",
      name: "Hangang Journeys",
      owner: "Seo-yeon Kim",
      logo: agencyLogo("agency-hangang"),
      province: "Seoul",
      status: "APPROVED",
      rating: 4.7,
      reviewCount: 256,
      tourCount: 5,
      bio: "Seoul foodies and culture nerds running tight, tasty weekend itineraries across the capital.",
      contactEmail: "eat@hangangjourneys.test",
      contactPhone: "+82 2 555 3361",
    },
    travelPlan: [
      {
        day: 1,
        title: "Palaces & hanok",
        stops: [
          { order: 1, name: "Gyeongbokgung Palace", durationLabel: "2 hours", image: img("seoul-2"), notes: "Catch the changing-of-the-guard." },
          { order: 2, name: "Bukchon Hanok Village", durationLabel: "1.5 hours", image: img("seoul-1"), notes: "Traditional lanes between the palaces." },
        ],
      },
      {
        day: 2,
        title: "Market & river",
        stops: [
          { order: 1, name: "Gwangjang Market food crawl", durationLabel: "2 hours", notes: "Bindaetteok and mayak gimbap." },
          { order: 2, name: "Han River night cruise", durationLabel: "1.5 hours", image: img("seoul-3"), notes: "Banpo Bridge rainbow fountain." },
        ],
      },
    ],
    reviews: [
      { id: "tr-sl-1", authorName: "Hana Kim", authorAvatar: avatar(5), rating: 5, comment: "The market food crawl was incredible — our guide ordered all the best stalls.", createdAt: "2026-05-15T19:20:00.000Z", photos: [img("seoul-3", 400, 300)], bookingCompleted: true },
      { id: "tr-sl-2", authorName: "Tom Becker", authorAvatar: avatar(51), rating: 4, comment: "Great intro to Seoul. Packed but well organised. Cruise at night was lovely.", createdAt: "2026-04-29T12:00:00.000Z", photos: [], bookingCompleted: true },
    ],
  },
  {
    id: "tour-kyoto-3d",
    slug: "kyoto-shrines-3d2n",
    title: "Kyoto Shrines & Gardens",
    tagline: "Three days of torii gates, zen gardens and tea-house lanes.",
    description:
      "Slow travel through old Kyoto: climb the vermilion torii of Fushimi Inari, sit with the raked gravel of Ryoan-ji, and stroll the lantern-lit lanes of Gion. A gentle cultural itinerary with a matcha workshop and time to simply wander.",
    heroImage: img("kyoto-1"),
    gallery: [img("kyoto-1"), img("kyoto-2"), img("kyoto-3")],
    travelType: "CULTURAL",
    province: "Kyoto",
    durationDays: 3,
    groupSizeMax: 10,
    languages: ["English", "Japanese"],
    cancellationPolicy: "free",
    rating: 4.9,
    reviewCount: 389,
    highlights: ["Fushimi Inari torii climb", "Ryoan-ji zen garden", "Gion old-town stroll", "Matcha tea workshop"],
    included: ["English/Japanese guide", "2 nights ryokan-style stay", "Daily breakfast", "Temple entrance fees", "Tea workshop"],
    excluded: ["Flights to Kansai", "Lunches & dinners", "Travel insurance"],
    unitPrice: 460,
    platformFee: 26,
    availability: "available",
    agency: {
      id: "ag-sakura",
      slug: "sakura-voyages",
      name: "Sakura Voyages",
      owner: "Haruki Tanaka",
      logo: agencyLogo("agency-sakura"),
      province: "Kyoto",
      status: "APPROVED",
      rating: 4.9,
      reviewCount: 389,
      tourCount: 7,
      bio: "Boutique Kyoto agency crafting unhurried cultural journeys with licensed guides and family-run ryokan partners.",
      contactEmail: "hello@sakuravoyages.test",
      contactPhone: "+81 75 555 8890",
    },
    travelPlan: [
      {
        day: 1,
        title: "Southern shrines",
        stops: [
          { order: 1, name: "Fushimi Inari Shrine", durationLabel: "3 hours", image: img("kyoto-1"), notes: "Thousands of torii up the mountain." },
          { order: 2, name: "Tofuku-ji garden", durationLabel: "1 hour", image: img("kyoto-3") },
        ],
      },
      {
        day: 2,
        title: "Zen & golden temples",
        stops: [
          { order: 1, name: "Ryoan-ji rock garden", durationLabel: "1.5 hours", image: img("kyoto-2"), notes: "Japan's most famous zen garden." },
          { order: 2, name: "Kinkaku-ji (Golden Pavilion)", durationLabel: "1 hour" },
        ],
      },
      {
        day: 3,
        title: "Gion & tea",
        stops: [
          { order: 1, name: "Matcha tea workshop", durationLabel: "1.5 hours", notes: "Whisk your own bowl of matcha." },
          { order: 2, name: "Gion old-town stroll", durationLabel: "2 hours" },
        ],
      },
    ],
    reviews: [
      { id: "tr-ky-1", authorName: "Aiko Mori", authorAvatar: avatar(40), rating: 5, comment: "Beautifully unhurried. The ryokan stay and tea workshop made it special.", createdAt: "2026-05-20T07:30:00.000Z", photos: [img("kyoto-2", 400, 300)], bookingCompleted: true },
      { id: "tr-ky-2", authorName: "Olivia Grant", authorAvatar: avatar(9), rating: 5, comment: "Fushimi Inari at golden hour was magic. Our guide's stories brought every shrine to life.", createdAt: "2026-05-04T16:00:00.000Z", photos: [], bookingCompleted: true },
      { id: "tr-ky-3", authorName: "Kenji Sato", authorAvatar: avatar(53), rating: 4, comment: "Lovely pace and great guide. Gion was a little crowded but expected.", createdAt: "2026-04-12T10:30:00.000Z", photos: [], bookingCompleted: true },
    ],
  },
] satisfies Array<Record<string, unknown>>;

export const TOURS: TourDetail[] = RAW_TOURS.map((tour) => TourDetailSchema.parse(tour));
