import Link from "next/link";
import type { Product } from "@oasis/db";
import { Reveal } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";

const CATEGORY_GLYPH: Record<string, { bg: string; icon: React.ReactNode }> = {
  "pvc-resin": {
    bg: "from-brand-3 to-brand-ink",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 8l8-4 8 4-8 4-8-4z" />
        <path d="M4 8v8l8 4 8-4V8" />
        <path d="M12 12v8" />
      </svg>
    ),
  },
  "pet-resin": {
    bg: "from-emerald-600 to-emerald-900",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l4 4v4l4 4v6h-5v-4h-6v4H5v-6l4-4V7l4-4z" />
        <path d="M12 7v3" />
      </svg>
    ),
  },
  "pvc-regrind": {
    bg: "from-ink-3 to-ink",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
      </svg>
    ),
  },
  "calcium-carbonate": {
    bg: "from-slate-500 to-slate-800",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="4" />
        <circle cx="16.5" cy="9.5" r="3" opacity="0.75" />
        <circle cx="12" cy="16.5" r="3.5" opacity="0.85" />
      </svg>
    ),
  },
};

function getGlyph(category?: { slug: string } | null) {
  const key = category?.slug ?? "";
  if (key in CATEGORY_GLYPH) return CATEGORY_GLYPH[key];
  return {
    bg: "from-brand-2 to-brand-ink",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="9" r="6" />
        <path d="M13.5 13.5L20 20" />
      </svg>
    ),
  };
}

interface Props {
  product: Product;
  categorySlug?: string;
  index?: number;
}

export function ProductCard({ product, categorySlug, index = 0 }: Props) {
  const glyph = getGlyph(categorySlug ? { slug: categorySlug } : null);
  const specEntries = Object.entries(product.specifications ?? {}).slice(0, 2);

  return (
    <Reveal delay={(index % 3) * 0.08} className="h-full">
      <TiltCard className="h-full">
        <Link
          href={`/products/${product.slug}`}
          data-cursor
          className="card card-hover group flex h-full flex-col"
        >
          <div className={`relative flex h-40 items-center justify-center bg-gradient-to-br ${glyph.bg} text-white`}>
            <div className="grid-bg absolute inset-0 opacity-50" />
            <div className="relative transition-transform duration-500 group-hover:scale-110">{glyph.icon}</div>
            <span className="absolute right-3 top-3 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur">
              {product.unit}
            </span>
          </div>

          <div className="flex flex-1 flex-col p-5">
            <h3 className="text-lg font-bold text-ink transition-colors group-hover:text-brand">{product.name}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink/60">{product.shortDescription}</p>

            {specEntries.length > 0 && (
              <dl className="mt-4 space-y-1.5 text-xs">
                {specEntries.map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-2">
                    <dt className="text-ink/45">{k}</dt>
                    <dd className="font-medium text-ink/75">{v}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="mt-auto flex items-center justify-between pt-5">
              <span className="text-sm font-semibold text-brand transition-colors group-hover:text-brand-2">View details</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mist text-brand transition-all duration-300 group-hover:bg-brand group-hover:text-white">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </Link>
      </TiltCard>
    </Reveal>
  );
}
