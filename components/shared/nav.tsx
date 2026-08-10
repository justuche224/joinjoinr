import React from "react";
import Link from "next/link";
import { Button } from "../ui/button";
import { Search } from "lucide-react";

const categories = ["Sports", "Concerts", "Theatre", "Festivals"];

const Nav = () => {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-stage/35 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-10">
        <Link
          href="/"
          className="font-heading text-lg font-semibold tracking-tight text-white"
        >
          JoinJoinR
        </Link>

        <ul className="hidden items-center gap-8 font-mono text-[11px] tracking-[0.15em] text-white/65 uppercase lg:flex">
          {categories.map((category) => (
            <li key={category}>
              <Link
                href="#"
                className="transition-colors hover:text-white"
              >
                {category}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label="Search events"
            className="text-white hover:bg-white/10 hover:text-white"
          >
            <Search />
          </Button>
          <Button
            variant="ghost"
            className="hidden text-white hover:bg-white/10 hover:text-white sm:inline-flex"
          >
            Log in
          </Button>
          <Button className="rounded-full bg-white px-4 text-stage hover:bg-white/85">
            Get tickets
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Nav;
