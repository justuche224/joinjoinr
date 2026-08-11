"use client";

import React, { useEffect, useState } from "react";

type Remaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getRemaining(target: string): Remaining {
  const diff = Math.max(0, new Date(target).getTime() - Date.now());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
  };
}

const units: { key: keyof Remaining; label: string }[] = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hrs" },
  { key: "minutes", label: "Min" },
  { key: "seconds", label: "Sec" },
];

const Countdown = ({ target }: { target: string }) => {
  const [remaining, setRemaining] = useState<Remaining | null>(null);

  useEffect(() => {
    // Computed from Date.now(), which must not run during render (server and
    // client would disagree) — syncing it from an effect is the correct
    // pattern here, not a derivable-during-render value.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRemaining(getRemaining(target));
    const id = setInterval(() => setRemaining(getRemaining(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  return (
    <div className="flex items-start gap-5">
      {units.map((unit) => (
        <div key={unit.key} className="flex flex-col items-center gap-1">
          <span className="font-mono text-2xl font-semibold tabular-nums text-white sm:text-3xl">
            {remaining ? String(remaining[unit.key]).padStart(2, "0") : "00"}
          </span>
          <span className="font-mono text-[10px] tracking-[0.15em] text-white/50 uppercase">
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Countdown;
