import React from "react";
import Link from "next/link";
import { buttonVariants } from "../ui/button";
import { Search } from "lucide-react";
import { categories } from "@/lib/events-types";
import Image from "next/image";

const Nav = () => {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-stage/35 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-10">
        <Link
          href="/"
          className="font-heading text-lg font-semibold tracking-tight text-white"
        >
          <Image src="/images/logo.jpeg" className="h-10 w-10 rounded-full object-cover" alt="Logo" width={100} height={100} />
        </Link>

        <ul className="hidden items-center gap-8 font-mono text-[11px] tracking-[0.15em] text-white/65 uppercase lg:flex">
          {categories.map((category) => (
            <li key={category}>
              <Link
                href={`/events?category=${category}`}
                className="transition-colors hover:text-white"
              >
                {category}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link
            href="/events"
            aria-label="Search events"
            className={buttonVariants({
              variant: "ghost",
              size: "icon-lg",
              className: "text-white hover:bg-white/10 hover:text-white",
            })}
          >
            <Search />
          </Link>
          <Link
            href="/login"
            className={buttonVariants({
              variant: "ghost",
              className: "hidden text-white hover:bg-white/10 hover:text-white sm:inline-flex",
            })}
          >
            Log in
          </Link>
          <Link
            href="/events"
            className={buttonVariants({
              className: "rounded-full bg-white px-4 text-stage hover:bg-white/85",
            })}
          >
            Get tickets
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Nav;
