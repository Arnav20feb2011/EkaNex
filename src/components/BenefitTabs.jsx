import { useState } from 'react';
import Reveal from './Reveal';
import CheckList from './CheckList';

/**
 * Outcomes by audience. On mobile it's a tab switcher (one panel at a time);
 * from md up all three columns are shown together.
 * groups: [{ key, tabLabel, title, icon, items }]
 */
export default function BenefitTabs({ groups }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      {/* Mobile tab switcher */}
      <div
        className="mb-6 flex gap-1 rounded-full bg-white p-1 shadow-card md:hidden"
        role="tablist"
        aria-label="Outcomes by audience"
      >
        {groups.map((g, i) => (
          <button
            key={g.key}
            type="button"
            role="tab"
            aria-selected={active === i}
            className={`flex-1 rounded-full px-2 py-2 text-sm font-semibold transition-colors ${
              active === i ? 'bg-navy text-white' : 'text-muted hover:text-navy'
            }`}
            onClick={() => setActive(i)}
          >
            {g.tabLabel}
          </button>
        ))}
      </div>

      {/* Panels / columns */}
      <div className="grid gap-6 md:grid-cols-3">
        {groups.map((g, i) => (
          <div
            key={g.key}
            role="tabpanel"
            aria-label={g.title}
            className={`${active === i ? 'block' : 'hidden'} md:block`}
          >
            <Reveal
              delay={i * 0.08}
              className="h-full rounded-card bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-cardHover sm:p-7"
            >
              <div className="mb-5 flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-navy/5 text-navy">
                  {g.icon}
                </span>
                <h3 className="text-lg font-bold text-navy">{g.title}</h3>
              </div>
              <CheckList items={g.items} />
            </Reveal>
          </div>
        ))}
      </div>
    </div>
  );
}
