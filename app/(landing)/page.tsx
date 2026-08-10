import Hero from "@/components/landing/hero";
import FeaturedEvents from "@/components/landing/featured-events";
import Highlights from "@/components/landing/highlights";
import React from "react";

const page = () => {
  return (
    <>
      <Hero />
      <FeaturedEvents />
      <Highlights />
    </>
  );
};

export default page;
