const ITEMS = ["PVC RESIN", "PET RESIN", "PVC REGRIND", "CALCIUM CARBONATE", "IMPORT · SUPPLY · TRUST", "K-67 · K-57", "IV 0.80 BOTTLE GRADE", "PAN-INDIA DISPATCH"];

export function ProductMarquee() {
  const row = [...ITEMS, ...ITEMS];
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
