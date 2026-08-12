import React from "react";
import Image from "next/image";

type Size = "wide" | "tall";

const moments: {
  image: string;
  imageAlt: string;
  caption: string;
  venue: string;
  size: Size;
}[] = [
  {
    image: "/images/highlights/festival.jpg",
    imageAlt: "A DJ duo throwing peace signs to a massive daytime festival crowd",
    caption: "Main stage, golden hour",
    venue: "Millennium Park",
    size: "wide",
  },
  {
    image: "/images/highlights/sports.jpg",
    imageAlt: "A packed arena watching a basketball game from the lower bowl",
    caption: "Crucial World Cup Qualifier",
    venue: "Godswill Akpabio International Stadium",
    size: "tall",
  },
  {
    image: "/images/highlights/concerts.jpg",
    imageAlt: "Performers mid-routine on stage under green stage lighting",
    caption: "Three songs into the encore",
    venue: "Eko Atlantic City",
    size: "wide",
  },
  {
    image: "/images/highlights/nightband.jpg",
    imageAlt: "A singer performing at a small outdoor night stage strung with lights",
    caption: "The warm-up act, side stage",
    venue: "Lagos Island, before doors",
    size: "tall",
  },
  {
    image: "/images/highlights/theatre.jpg",
    imageAlt: "Rows of dancers in colorful costumes lined up on a theatre stage",
    caption: "Opening night, curtain up",
    venue: "MUSON Centre",
    size: "wide",
  },
];

const sizeClasses: Record<Size, string> = {
  wide: "w-[72vw] sm:w-[420px] md:w-[520px]",
  tall: "w-[48vw] sm:w-[280px] md:w-[340px]",
};

const Highlights = () => {
  return (
    <section className="bg-stage py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <p className="mb-3 font-mono text-xs tracking-[0.25em] text-brass uppercase">
          Highlights
        </p>
        <h2 className="max-w-xl font-heading text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Straight from the crowd
        </h2>
        <p className="mt-3 max-w-md text-white/70">
          A look at recent nights, up close.
        </p>
      </div>

      <div className="scrollbar-none mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 px-6 pb-2 md:scroll-px-10 md:px-10">
        {moments.map((moment) => (
          <figure
            key={moment.caption}
            className={`group relative h-75 shrink-0 snap-start overflow-hidden rounded-2xl sm:h-105 md:h-120 ${sizeClasses[moment.size]}`}
          >
            <Image
              src={moment.image}
              alt={moment.imageAlt}
              fill
              sizes="(min-width: 768px) 520px, 70vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-linear-to-t from-stage/85 via-stage/0 to-stage/0" />
            <figcaption className="absolute inset-x-0 bottom-0 p-5">
              <p className="font-medium text-white">{moment.caption}</p>
              <p className="mt-0.5 font-mono text-xs tracking-wide text-white/60 uppercase">
                {moment.venue}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
};

export default Highlights;
