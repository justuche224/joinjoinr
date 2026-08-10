import React from "react";
import Image from "next/image";
import { Button } from "../ui/button";
import Nav from "../shared/nav";
import heroBg from "@/public/images/hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative flex h-screen min-h-[640px] w-full flex-col overflow-hidden bg-stage">
      <Image
        src={heroBg}
        alt="A festival crowd raising their hands as confetti falls under the stage lights"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-stage via-stage/55 to-stage/15" />

      <Nav />

      <div className="relative mt-auto w-full px-6 pt-32 pb-16 md:px-10 md:pb-24">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 font-mono text-xs tracking-[0.25em] text-brass uppercase">
            Live events, everywhere
          </p>
          <h1 className="max-w-3xl font-heading text-5xl leading-[0.95] font-semibold tracking-tight text-white sm:text-6xl md:text-7xl">
            Discover an experience to remember.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-white/70">
            Concerts, raves, exhibitions, and festivals near you — browse
            what&apos;s on and get in.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button className="btn-ticket h-12 rounded-xl bg-brass px-8 text-[0.9rem] font-semibold text-stage hover:bg-brass/90">
              Get tickets
            </Button>
            <Button
              variant="outline"
              className="h-12 rounded-full border-white/25 bg-transparent px-7 text-[0.9rem] font-medium text-white hover:bg-white/10 hover:text-white"
            >
              See what&apos;s on
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
