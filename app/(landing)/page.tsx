import Hero from "@/components/landing/hero";
import FeaturedEvents from "@/components/landing/featured-events";
import Highlights from "@/components/landing/highlights";
import Newsletter from "@/components/landing/newsletter";
import Footer from "@/components/shared/footer";
import React from "react";

const page = () => {
  return (
    <>
      <Hero />
      <FeaturedEvents />
      <Highlights />
      <Newsletter />
      <Footer />
    </>
  );
};

export default page;
