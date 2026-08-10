export type Category = "Concerts" | "Sports" | "Theatre" | "Festivals";

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
    slug: "the-midnight-parade",
    category: "Concerts",
    title: "The Midnight Parade",
    venue: "Bellwood Amphitheater",
    city: "Austin, TX",
    address: "2200 Riverside Dr, Austin, TX",
    image: "/images/events/concerts.jpg",
    imageAlt:
      "A crowd facing a colorful stage light show at an outdoor night concert",
    description:
      "An outdoor amphitheater night of high-energy live sets, full production lighting, and a finale set that closes with a confetti drop over the whole floor. Gates open early — arrive before sundown to catch the opening acts.",
    sessions: [
      {
        id: "night",
        label: "Sat, Aug 22",
        time: "7:00 PM",
        datetime: "2026-08-22T19:00:00",
        doors: "6:00 PM",
        tiers: [
          {
            name: "General Admission",
            price: 48,
            description: "Standing room on the main floor.",
          },
          {
            name: "Premium",
            price: 89,
            description: "Reserved viewing platform with a dedicated bar.",
          },
          {
            name: "VIP",
            price: 165,
            description: "Side-stage access, express entry, and a merch pack.",
          },
        ],
      },
    ],
  },
  {
    slug: "fc-union-vs-ironside",
    category: "Sports",
    title: "FC Union vs. Ironside",
    venue: "Harbor Stadium",
    city: "Portland, OR",
    address: "1844 Harborview Rd, Portland, OR",
    image: "/images/events/sports.jpg",
    imageAlt: "Fans watching a soccer match from the stands under stadium floodlights",
    description:
      "The city derby returns. FC Union hosts Ironside in what's shaping up to be the tightest match of the season — both sides unbeaten in their last five.",
    sessions: [
      {
        id: "match",
        label: "Sat, Sep 5",
        time: "3:30 PM",
        datetime: "2026-09-05T15:30:00",
        doors: "2:00 PM",
        tiers: [
          {
            name: "General Admission",
            price: 32,
            description: "Upper bowl seating, any open section.",
          },
          {
            name: "Premium",
            price: 68,
            description: "Lower bowl, closer to the pitch.",
          },
          {
            name: "VIP",
            price: 140,
            description: "Pitchside club seats with in-seat service.",
          },
        ],
      },
    ],
  },
  {
    slug: "a-winters-hush",
    category: "Theatre",
    title: "A Winter's Hush",
    venue: "Aldgate Playhouse",
    city: "Chicago, IL",
    address: "412 Aldgate St, Chicago, IL",
    image: "/images/events/theatre.jpg",
    imageAlt: "Rows of empty seats facing a small, ornate theatre stage",
    description:
      "A quiet, unsettling new play about a family snowed into a house that isn't quite empty. Ninety minutes, no intermission.",
    sessions: [
      {
        id: "sep14",
        label: "Mon, Sep 14",
        time: "7:30 PM",
        datetime: "2026-09-14T19:30:00",
        doors: "7:00 PM",
        tiers: theatreTiers(),
      },
      {
        id: "sep15",
        label: "Tue, Sep 15",
        time: "7:30 PM",
        datetime: "2026-09-15T19:30:00",
        doors: "7:00 PM",
        tiers: theatreTiers(),
      },
      {
        id: "sep16",
        label: "Wed, Sep 16",
        time: "7:30 PM",
        datetime: "2026-09-16T19:30:00",
        doors: "7:00 PM",
        tiers: theatreTiers(),
      },
    ],
  },
  {
    slug: "lowland-festival-day-pass",
    category: "Festivals",
    title: "Lowland Festival — Day Pass",
    venue: "Greenfield Park",
    city: "Denver, CO",
    address: "900 Greenfield Pkwy, Denver, CO",
    image: "/images/events/festivals.jpg",
    imageAlt: "A crowd gathered in front of a large, colorful festival main stage at sunset",
    description:
      "Three days, four stages, and a lineup that spans headline sets to sunrise closers. Pick a single day or come back for all three.",
    sessions: [
      {
        id: "day1",
        label: "Fri · Day 1",
        time: "12:00 PM",
        datetime: "2026-10-03T12:00:00",
        tiers: festivalTiers(),
      },
      {
        id: "day2",
        label: "Sat · Day 2",
        time: "12:00 PM",
        datetime: "2026-10-04T12:00:00",
        tiers: festivalTiers(),
      },
      {
        id: "day3",
        label: "Sun · Day 3",
        time: "12:00 PM",
        datetime: "2026-10-05T12:00:00",
        tiers: festivalTiers(),
      },
    ],
  },
];

function theatreTiers(): TicketTier[] {
  return [
    {
      name: "General Admission",
      price: 65,
      description: "Balcony seating.",
    },
    {
      name: "Premium",
      price: 95,
      description: "Orchestra level, center rows.",
    },
    {
      name: "VIP",
      price: 150,
      description: "Front row plus a post-show reception with the cast.",
    },
  ];
}

function festivalTiers(): TicketTier[] {
  return [
    {
      name: "General Admission",
      price: 89,
      description: "Full-day access to all stages.",
    },
    {
      name: "Premium",
      price: 149,
      description: "Shaded viewing deck and fast-lane entry.",
    },
    {
      name: "VIP",
      price: 299,
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
