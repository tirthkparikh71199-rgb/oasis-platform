export function ProductMarquee({ items }: { items: string[] }) {
  const list = items.length ? items : ["PVC RESIN", "PET RESIN", "PVC REGRIND", "CALCIUM CARBONATE"];
  const row = [...list, ...list];
  return (
    <div className="marquee-paused relative overflow-hidden border-y border-line bg-white py-4">
      <div className="animate-marquee flex w-max items-center gap-8 whitespace-nowrap">
        {row.map((item, i) => (
          <div key={i} className="flex items-center gap-8">
            <span className="font-display text-sm font-bold uppercase tracking-[0.18em] text-ink/70">{item}</span>
            <span className="h-1.5 w-1.5 rotate-45 bg-accent" aria-hidden />
          </div>
        ))}
      </div>
    </div>
  );
}
