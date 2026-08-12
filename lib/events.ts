export type Category = "Concerts" | "Sports" | "Theatre" | "Festivals";

export const categories: Category[] = [
  "Sports",
  "Concerts",
  "Theatre",
  "Festivals",
];

export type TicketTier = {
  name: string;
  price: number;
  description: string;
};

export type Session = {
  id: string;
  label: string;
  time: string;
  datetime: string;
  doors?: string;
  tiers: TicketTier[];
};

export type EventDetail = {
  slug: string;
  category: Category;
  title: string;
  venue: string;
  city: string;
  address: string;
  image: string;
  imageAlt: string;
  description: string;
  sessions: Session[];
};

export const events: EventDetail[] = [
  {
    slug: "detty-december-concert",
    category: "Concerts",
    title: "Detty December Concert",
    venue: "Eko Atlantic City",
    city: "Lagos, LA",
    address: "Eko Atlantic City, Victoria Island, Lagos",
    image: "/images/events/concerts.jpg",
    imageAlt: "A massive crowd at an outdoor Afrobeats concert",
    description:
      "Experience the ultimate Detty December with live performances from top Afrobeats stars, incredible stage design, and an electric atmosphere. Arrive early for the best spots.",
    sessions: [
      {
        id: "night",
        label: "Sat, Dec 26",
        time: "8:00 PM",
        datetime: "2026-12-26T20:00:00",
        doors: "6:00 PM",
        tiers: [
          {
            name: "Regular",
            price: 15000,
            description: "Standing room on the main floor.",
          },
          {
            name: "VIP",
            price: 50000,
            description: "Reserved viewing platform with dedicated drinks service.",
          },
          {
            name: "VVIP",
            price: 150000,
            description: "Exclusive front stage access, express entry, and complimentary drinks.",
          },
        ],
      },
    ],
  },
  {
    slug: "super-eagles-vs-black-stars",
    category: "Sports",
    title: "Super Eagles vs. Black Stars",
    venue: "Godswill Akpabio International Stadium",
    city: "Uyo, AK",
    address: "Goodluck Jonathan Blvd, Uyo, Akwa Ibom",
    image: "/images/events/sports.jpg",
    imageAlt: "Fans cheering in a packed football stadium",
    description:
      "The classic West African derby returns. The Super Eagles host the Black Stars in a crucial World Cup qualifier match. Expect a packed stadium and high intensity.",
    sessions: [
      {
        id: "match",
        label: "Sat, Oct 10",
        time: "4:00 PM",
        datetime: "2026-10-10T16:00:00",
        doors: "2:00 PM",
        tiers: [
          {
            name: "Popular Stand",
            price: 2000,
            description: "Open seating in the upper and lower bowls.",
          },
          {
            name: "VIP",
            price: 10000,
            description: "Covered seating with a better view of the pitch.",
          },
          {
            name: "VVIP",
            price: 25000,
            description: "Premium seating with lounge access and refreshments.",
          },
        ],
      },
    ],
  },
  {
    slug: "the-lions-jewel",
    category: "Theatre",
    title: "The Lion and the Jewel",
    venue: "MUSON Centre",
    city: "Lagos, LA",
    address: "8/9 Marina, Onikan, Lagos",
    image: "/images/events/theatre.jpg",
    imageAlt: "Actors performing on a brightly lit theatre stage",
    description:
      "A captivating stage adaptation of Wole Soyinka's classic play. Experience a blend of rich culture, humor, and brilliant performances.",
    sessions: [
      {
        id: "sep14",
        label: "Mon, Sep 14",
        time: "7:00 PM",
        datetime: "2026-09-14T19:00:00",
        doors: "6:30 PM",
        tiers: theatreTiers(),
      },
      {
        id: "sep15",
        label: "Tue, Sep 15",
        time: "7:00 PM",
        datetime: "2026-09-15T19:00:00",
        doors: "6:30 PM",
        tiers: theatreTiers(),
      },
      {
        id: "sep16",
        label: "Wed, Sep 16",
        time: "7:00 PM",
        datetime: "2026-09-16T19:00:00",
        doors: "6:30 PM",
        tiers: theatreTiers(),
      },
    ],
  },
  {
    slug: "calabar-carnival-pass",
    category: "Festivals",
    title: "Calabar Carnival — Access Pass",
    venue: "Millennium Park",
    city: "Calabar, CR",
    address: "11/12 Marian Road, Calabar, Cross River",
    image: "/images/events/festivals.jpg",
    imageAlt: "Colorful dancers in spectacular costumes parading at a street festival",
    description:
      "Africa's biggest street party! Enjoy spectacular floats, colorful costumes, music, and dance spanning across multiple days.",
    sessions: [
      {
        id: "day1",
        label: "Sun · Day 1",
        time: "10:00 AM",
        datetime: "2026-12-27T10:00:00",
        tiers: festivalTiers(),
      },
      {
        id: "day2",
        label: "Mon · Day 2",
        time: "10:00 AM",
        datetime: "2026-12-28T10:00:00",
        tiers: festivalTiers(),
      },
      {
        id: "day3",
        label: "Tue · Day 3",
        time: "10:00 AM",
        datetime: "2026-12-29T10:00:00",
        tiers: festivalTiers(),
      },
    ],
  },
];

function theatreTiers(): TicketTier[] {
  return [
    {
      name: "Regular",
      price: 5000,
      description: "Balcony seating.",
    },
    {
      name: "Premium",
      price: 15000,
      description: "Orchestra level, center rows.",
    },
    {
      name: "VIP",
      price: 30000,
      description: "Front row plus a post-show reception with the cast.",
    },
  ];
}

function festivalTiers(): TicketTier[] {
  return [
    {
      name: "Regular",
      price: 10000,
      description: "Full-day access to all stages.",
    },
    {
      name: "Premium",
      price: 25000,
      description: "Shaded viewing deck and fast-lane entry.",
    },
    {
      name: "VIP",
      price: 50000,
      description: "Backstage lounge access and an artist meet-and-greet.",
    },
  ];
}

export function getEventBySlug(slug: string): EventDetail | undefined {
  return events.find((event) => event.slug === slug);
}

export function startingPrice(event: EventDetail): number {
  return Math.min(...event.sessions[0].tiers.map((tier) => tier.price));
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatMonthDay(datetime: string): { month: string; day: string } {
  const date = new Date(datetime);
  return {
    month: MONTHS[date.getMonth()],
    day: String(date.getDate()).padStart(2, "0"),
  };
}
