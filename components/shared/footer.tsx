import React from "react";
import Link from "next/link";

const linkColumns: { heading: string; links: string[] }[] = [
  { heading: "Browse", links: ["Sports", "Concerts", "Theatre", "Festivals"] },
  { heading: "Company", links: ["About", "Careers", "Press"] },
  { heading: "Support", links: ["Help Center", "Contact Us", "Refund Policy"] },
];

const Footer = () => {
  return (
    <footer className="bg-stage px-6 py-16 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="col-span-2 sm:col-span-4 lg:col-span-1">
            <Link
              href="/"
              className="font-heading text-lg font-semibold tracking-tight text-white"
            >
              JoinJoinR
            </Link>
            <p className="mt-3 max-w-xs text-sm text-white/60">
              Tickets to the moments worth showing up for.
            </p>
          </div>

          {linkColumns.map((column) => (
            <div key={column.heading}>
              <p className="font-mono text-xs tracking-[0.15em] text-white/40 uppercase">
                {column.heading}
              </p>
              <ul className="mt-4 flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-white/70 transition-colors hover:text-white"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 JoinJoinR. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="#" className="transition-colors hover:text-white">
              Privacy
            </Link>
            <Link href="#" className="transition-colors hover:text-white">
              Terms
            </Link>
            <Link href="#" className="transition-colors hover:text-white">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
