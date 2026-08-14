"use client";

import { useState } from "react";
import type { SiteContent } from "@/lib/site-content";
import { removeSiteMedia, resetSiteContent, saveCompanyProfile, saveContentArea, uploadSiteMedia } from "./actions";

type ObjField = { key: string; label: string; type?: "textarea" };
type ObjItem = Record<string, string>;

function inputCls() {
  return "mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent";
}
function labelCls() {
  return "text-xs font-medium text-slate-300";
}

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <h2 className="text-base font-bold text-white">{title}</h2>
      {desc ? <p className="mt-1 text-xs text-slate-500">{desc}</p> : null}
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function SaveReset({ dirty, onSave, onReset }: { dirty: boolean; onSave: () => void; onReset: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 pt-1">
      <button type="button" onClick={onReset} className="rounded-lg border border-white/10 px-4 py-2 text-xs font-medium text-slate-400 hover:text-white">
        Reset to defaults
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={!dirty}
        className="rounded-lg bg-accent px-5 py-2 text-sm font-bold text-slate-950 transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Save changes
      </button>
    </div>
  );
}

function AreaSection({
  area,
  title,
  desc,
  initial,
  children,
}: {
  area: string;
  title: string;
  desc?: string;
  initial: Record<string, unknown>;
  children: (v: Record<string, unknown>, set: (patch: Record<string, unknown>) => void) => React.ReactNode;
}) {
  const [value, setValue] = useState<Record<string, unknown>>(initial);
  const [dirty, setDirty] = useState(false);

  const set = (patch: Record<string, unknown>) => {
    setValue((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  };

  const save = () => {
    const fd = new FormData();
    fd.set("area", area);
    fd.set("payload", JSON.stringify(value));
    void saveContentArea(fd);
  };
  const reset = () => {
    const fd = new FormData();
    fd.set("area", area);
    void resetSiteContent(fd);
  };

  return (
    <Section title={title} desc={desc}>
      {children(value, set)}
      <SaveReset dirty={dirty} onSave={save} onReset={reset} />
    </Section>
  );
}

function Group({
  label,
  v,
  set,
  k,
  children,
}: {
  label: string;
  v: Record<string, unknown>;
  set: (p: Record<string, unknown>) => void;
  k: string;
  children: (gv: Record<string, unknown>, gset: (p: Record<string, unknown>) => void) => React.ReactNode;
}) {
  const sub = (v[k] ?? {}) as Record<string, unknown>;
  const gset = (patch: Record<string, unknown>) => set({ [k]: { ...sub, ...patch } });
  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/40 p-3">
      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="space-y-3">{children(sub, gset)}</div>
    </div>
  );
}

function StrInput({ label, v, set, k }: { label: string; v: Record<string, unknown>; set: (p: Record<string, unknown>) => void; k: string }) {
  return (
    <label className="block">
      <span className={labelCls()}>{label}</span>
      <input className={inputCls()} defaultValue={String(v[k] ?? "")} onChange={(e) => set({ [k]: e.target.value })} />
    </label>
  );
}

function StrArea({ label, v, set, k, rows = 4 }: { label: string; v: Record<string, unknown>; set: (p: Record<string, unknown>) => void; k: string; rows?: number }) {
  return (
    <label className="block">
      <span className={labelCls()}>{label}</span>
      <textarea className={inputCls()} rows={rows} defaultValue={String(v[k] ?? "")} onChange={(e) => set({ [k]: e.target.value })} />
    </label>
  );
}

function ListText({ label, v, set, k }: { label: string; v: Record<string, unknown>; set: (p: Record<string, unknown>) => void; k: string }) {
  const arr = Array.isArray(v[k]) ? (v[k] as string[]) : [];
  return (
    <label className="block">
      <span className={labelCls()}>{label} — one per line</span>
      <textarea
        className={inputCls()}
        rows={5}
        defaultValue={arr.join("\n")}
        onChange={(e) => set({ [k]: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
      />
    </label>
  );
}

function ObjListEditor({
  label,
  v,
  set,
  k,
  fields,
}: {
  label: string;
  v: Record<string, unknown>;
  set: (p: Record<string, unknown>) => void;
  k: string;
  fields: ObjField[];
}) {
  const items = (Array.isArray(v[k]) ? v[k] : []) as ObjItem[];
  const update = (next: ObjItem[]) => set({ [k]: next });
  return (
    <div>
      <span className={labelCls()}>{label}</span>
      <div className="mt-1.5 space-y-2">
        {items.map((item, i) => (
          <div key={i} className="rounded-lg border border-white/10 bg-slate-950/40 p-3">
            <div className="grid gap-2">
              {fields.map((f) => (
                <label key={f.key} className="block">
                  <span className="text-[11px] text-slate-500">{f.label}</span>
                  {f.type === "textarea" ? (
                    <textarea
                      className={inputCls()}
                      rows={2}
                      defaultValue={item[f.key] ?? ""}
                      onChange={(e) => update(items.map((x, j) => (j === i ? { ...x, [f.key]: e.target.value } : x)))}
                    />
                  ) : (
                    <input
                      className={inputCls()}
                      defaultValue={item[f.key] ?? ""}
                      onChange={(e) => update(items.map((x, j) => (j === i ? { ...x, [f.key]: e.target.value } : x)))}
                    />
                  )}
                </label>
              ))}
            </div>
            <button type="button" onClick={() => update(items.filter((_, j) => j !== i))} className="mt-2 text-xs font-medium text-red-400 hover:text-red-300">
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => update([...items, Object.fromEntries(fields.map((f) => [f.key, ""]))])}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white"
        >
          + Add item
        </button>
      </div>
    </div>
  );
}

const STAT_FIELDS: ObjField[] = [
  { key: "value", label: "Value" },
  { key: "suffix", label: "Suffix" },
  { key: "label", label: "Label" },
];
const TITLE_TEXT_FIELDS: ObjField[] = [
  { key: "title", label: "Title" },
  { key: "text", label: "Text", type: "textarea" },
];

export default function ContentEditor({
  content,
  profile,
  contact,
}: {
  content: SiteContent;
  profile: Record<string, unknown>;
  contact: Record<string, unknown>;
}) {
  const p = content;
  const reg = (profile.registration ?? {}) as Record<string, unknown>;
  const offices = (profile.offices ?? []) as { address?: string }[];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Section title="Company profile" desc="Used across the whole site — address, phones, hours, registrations.">
        <form action={saveCompanyProfile} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={labelCls()}>Company name</span>
              <input name="name" className={inputCls()} defaultValue={String(profile.name ?? "")} />
            </label>
            <label className="block">
              <span className={labelCls()}>Legal name</span>
              <input name="legalName" className={inputCls()} defaultValue={String(profile.legalName ?? "")} />
            </label>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <label className="block">
              <span className={labelCls()}>Established</span>
              <input name="established" type="number" className={inputCls()} defaultValue={String(profile.established ?? 2010)} />
            </label>
            <label className="block">
              <span className={labelCls()}>Employees</span>
              <input name="employees" className={inputCls()} defaultValue={String(profile.employees ?? "")} />
            </label>
            <label className="block">
              <span className={labelCls()}>Lead time</span>
              <input name="leadTime" className={inputCls()} defaultValue={String(profile.leadTime ?? "")} />
            </label>
          </div>
          <label className="block">
            <span className={labelCls()}>Tagline</span>
            <input name="tagline" className={inputCls()} defaultValue={String(profile.tagline ?? "")} />
          </label>
          <label className="block">
            <span className={labelCls()}>Business type</span>
            <input name="businessType" className={inputCls()} defaultValue={String(profile.businessType ?? "")} />
          </label>
          <label className="block">
            <span className={labelCls()}>Head office address</span>
            <textarea name="officeAddress" className={inputCls()} rows={3} defaultValue={String(offices[0]?.address ?? "")} />
          </label>
          <label className="block">
            <span className={labelCls()}>Warehouse address</span>
            <textarea name="warehouse" className={inputCls()} rows={3} defaultValue={String(profile.warehouse ?? "")} />
          </label>
          <label className="block">
            <span className={labelCls()}>Phones — one per line</span>
            <textarea name="phones" className={inputCls()} rows={3} defaultValue={(Array.isArray(profile.phones) ? (profile.phones as string[]) : []).join("\n")} />
          </label>
          <label className="block">
            <span className={labelCls()}>Markets — one per line</span>
            <textarea name="markets" className={inputCls()} rows={2} defaultValue={(Array.isArray(profile.markets) ? (profile.markets as string[]) : []).join("\n")} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={labelCls()}>Business hours</span>
              <input name="hours" className={inputCls()} defaultValue={String(profile.hours ?? "")} />
            </label>
            <label className="block">
              <span className={labelCls()}>Sales email</span>
              <input name="salesEmail" className={inputCls()} defaultValue={String(contact.email ?? "")} />
            </label>
            <label className="block">
              <span className={labelCls()}>Sales phone</span>
              <input name="salesPhone" className={inputCls()} defaultValue={String(contact.phone ?? "")} />
            </label>
            <label className="block">
              <span className={labelCls()}>Sales WhatsApp</span>
              <input name="salesWhatsapp" className={inputCls()} defaultValue={String(contact.whatsapp ?? "")} />
            </label>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <label className="block">
              <span className={labelCls()}>GSTIN</span>
              <input name="gstin" className={inputCls()} defaultValue={String(profile.gstin ?? reg.gstin ?? "")} />
            </label>
            <label className="block">
              <span className={labelCls()}>LEI</span>
              <input name="lei" className={inputCls()} defaultValue={String(profile.lei ?? reg.lei ?? "")} />
            </label>
            <label className="block">
              <span className={labelCls()}>AEO</span>
              <input name="aeo" className={inputCls()} defaultValue={String(profile.aeo ?? reg.aeo ?? "")} />
            </label>
          </div>
          <button type="submit" className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-accent/90">
            Save company profile
          </button>
        </form>
      </Section>

      <Section title="Images & media" desc="Upload hero, about and social images. Stored in /uploads/site.">
        <div className="space-y-4">
          {(["heroImage", "aboutImage", "ogImage", "logo"] as const).map((slot) => (
            <div key={slot} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-slate-950/40 p-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-300">{slot}</p>
                {p.media[slot] ? <p className="mt-0.5 truncate text-[11px] text-slate-500">{p.media[slot]}</p> : <p className="mt-0.5 text-[11px] text-slate-600">Not uploaded</p>}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <form action={uploadSiteMedia}>
                  <input type="hidden" name="slot" value={slot} />
                  <label className="cursor-pointer rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white">
                    Upload
                    <input type="file" name="file" accept="image/*" className="hidden" onChange={(e) => e.currentTarget.form?.requestSubmit()} />
                  </label>
                </form>
                {p.media[slot] ? (
                  <form action={removeSiteMedia}>
                    <input type="hidden" name="slot" value={slot} />
                    <button className="rounded-lg border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10">Remove</button>
                  </form>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <AreaSection area="home" title="Home page" desc="Hero, marquee, stats, sections and call-to-action." initial={p.home as unknown as Record<string, unknown>}>
        {(v, set) => (
          <>
            <Group label="Hero" v={v} set={set} k="hero">
              {(gv, gset) => (
                <>
                  <StrInput label="Eyebrow" v={gv} set={gset} k="eyebrow" />
                  <div className="grid grid-cols-2 gap-3">
                    <StrInput label="Headline line 1" v={gv} set={gset} k="headline1" />
                    <StrInput label="Headline line 2" v={gv} set={gset} k="headline2" />
                  </div>
                  <StrArea label="Subtext" v={gv} set={gset} k="subtext" />
                  <div className="grid grid-cols-2 gap-3">
                    <StrInput label="Primary CTA label" v={gv} set={gset} k="ctaPrimary" />
                    <StrInput label="Secondary CTA label" v={gv} set={gset} k="ctaSecondary" />
                  </div>
                </>
              )}
            </Group>
            <ObjListEditor label="Hero stats" v={v} set={set} k="stats" fields={STAT_FIELDS} />
            <ListText label="Marquee items" v={v} set={set} k="marquee" />
            <Group label="Product section" v={v} set={set} k="productSection">
              {(gv, gset) => (
                <>
                  <StrInput label="Eyebrow" v={gv} set={gset} k="eyebrow" />
                  <StrInput label="Title" v={gv} set={gset} k="title" />
                  <StrInput label="CTA label" v={gv} set={gset} k="ctaLabel" />
                </>
              )}
            </Group>
            <Group label="Supply chain section" v={v} set={set} k="supplyChain">
              {(gv, gset) => (
                <>
                  <StrInput label="Eyebrow" v={gv} set={gset} k="eyebrow" />
                  <StrInput label="Title" v={gv} set={gset} k="title" />
                  <StrArea label="Text" v={gv} set={gset} k="text" />
                </>
              )}
            </Group>
            <Group label="Why section" v={v} set={set} k="whySection">
              {(gv, gset) => (
                <>
                  <StrInput label="Eyebrow" v={gv} set={gset} k="eyebrow" />
                  <StrInput label="Title" v={gv} set={gset} k="title" />
                  <StrArea label="Text" v={gv} set={gset} k="text" />
                  <ObjListEditor label="Stats" v={gv} set={gset} k="stats" fields={STAT_FIELDS} />
                  <ObjListEditor label="Highlights" v={gv} set={gset} k="highlights" fields={TITLE_TEXT_FIELDS} />
                </>
              )}
            </Group>
            <Group label="Process / how it works" v={v} set={set} k="process">
              {(gv, gset) => (
                <>
                  <StrInput label="Eyebrow" v={gv} set={gset} k="eyebrow" />
                  <StrInput label="Title" v={gv} set={gset} k="title" />
                  <ObjListEditor
                    label="Steps"
                    v={gv}
                    set={gset}
                    k="steps"
                    fields={[
                      { key: "step", label: "Number" },
                      { key: "title", label: "Title" },
                      { key: "text", label: "Text", type: "textarea" },
                    ]}
                  />
                </>
              )}
            </Group>
            <Group label="Call to action" v={v} set={set} k="cta">
              {(gv, gset) => (
                <>
                  <StrInput label="Title" v={gv} set={gset} k="title" />
                  <StrArea label="Text" v={gv} set={gset} k="text" />
                  <StrInput label="Button label" v={gv} set={gset} k="buttonLabel" />
                  <StrInput label="Call label (use {phone} placeholder)" v={gv} set={gset} k="callLabel" />
                </>
              )}
            </Group>
          </>
        )}
      </AreaSection>

      <AreaSection area="about" title="About page" desc="Story, registrations, team, focus and who we serve." initial={p.about as unknown as Record<string, unknown>}>
        {(v, set) => (
          <>
            <Group label="Hero" v={v} set={set} k="hero">
              {(gv, gset) => (
                <>
                  <StrInput label="Eyebrow" v={gv} set={gset} k="eyebrow" />
                  <StrInput label="Title" v={gv} set={gset} k="title" />
                </>
              )}
            </Group>
            <Group label="Who we are" v={v} set={set} k="whoWeAre">
              {(gv, gset) => (
                <>
                  <StrInput label="Title" v={gv} set={gset} k="title" />
                  <ListText label="Paragraphs" v={gv} set={gset} k="paragraphs" />
                </>
              )}
            </Group>
            <ObjListEditor label="Stats" v={v} set={set} k="stats" fields={STAT_FIELDS} />
            <Group label="Registrations" v={v} set={set} k="registrations">
              {(gv, gset) => (
                <>
                  <StrInput label="Eyebrow" v={gv} set={gset} k="eyebrow" />
                  <StrInput label="Title" v={gv} set={gset} k="title" />
                  <ObjListEditor label="Cards" v={gv} set={gset} k="cards" fields={[{ key: "label", label: "Label" }, { key: "value", label: "Value" }]} />
                  <StrArea label="Note (optional)" v={gv} set={gset} k="note" rows={2} />
                </>
              )}
            </Group>
            <Group label="How we trade" v={v} set={set} k="trade">
              {(gv, gset) => (
                <>
                  <StrInput label="Eyebrow" v={gv} set={gset} k="eyebrow" />
                  <StrInput label="Title" v={gv} set={gset} k="title" />
                  <StrArea label="Text" v={gv} set={gset} k="text" />
                  <ObjListEditor label="Cards" v={gv} set={gset} k="cards" fields={[{ key: "label", label: "Label" }, { key: "text", label: "Text", type: "textarea" }]} />
                </>
              )}
            </Group>
            <Group label="Locations" v={v} set={set} k="locations">
              {(gv, gset) => (
                <>
                  <StrInput label="Title" v={gv} set={gset} k="title" />
                  <StrInput label="Head office card title" v={gv} set={gset} k="headOfficeTitle" />
                  <StrInput label="Warehouse card title" v={gv} set={gset} k="warehouseTitle" />
                  <StrArea label="Note (optional)" v={gv} set={gset} k="note" rows={2} />
                </>
              )}
            </Group>
            <Group label="Team" v={v} set={set} k="team">
              {(gv, gset) => (
                <>
                  <StrInput label="Eyebrow" v={gv} set={gset} k="eyebrow" />
                  <StrInput label="Title" v={gv} set={gset} k="title" />
                  <ObjListEditor label="Members" v={gv} set={gset} k="members" fields={[{ key: "name", label: "Name" }, { key: "role", label: "Role" }, { key: "note", label: "Note", type: "textarea" }]} />
                  <StrArea label="Footer note (optional)" v={gv} set={gset} k="footerNote" rows={2} />
                </>
              )}
            </Group>
            <Group label="Focus" v={v} set={set} k="focus">
              {(gv, gset) => (
                <>
                  <StrInput label="Title" v={gv} set={gset} k="title" />
                  <ObjListEditor label="Values" v={gv} set={gset} k="values" fields={TITLE_TEXT_FIELDS} />
                </>
              )}
            </Group>
            <Group label="Who we serve" v={v} set={set} k="whoWeServe">
              {(gv, gset) => (
                <>
                  <StrInput label="Title" v={gv} set={gset} k="title" />
                  <StrArea label="Text" v={gv} set={gset} k="text" />
                  <ObjListEditor label="Segments" v={gv} set={gset} k="segments" fields={TITLE_TEXT_FIELDS} />
                </>
              )}
            </Group>
          </>
        )}
      </AreaSection>

      <AreaSection area="contactPage" title="Contact page" desc="Hero, titles and intro." initial={p.contactPage as unknown as Record<string, unknown>}>
        {(v, set) => (
          <>
            <Group label="Hero" v={v} set={set} k="hero">
              {(gv, gset) => (
                <>
                  <StrInput label="Eyebrow" v={gv} set={gset} k="eyebrow" />
                  <StrInput label="Title" v={gv} set={gset} k="title" />
                  <StrArea label="Subtext" v={gv} set={gset} k="subtext" />
                </>
              )}
            </Group>
            <StrInput label="Direct lines card title" v={v} set={set} k="directLinesTitle" />
            <StrInput label="Email card title" v={v} set={set} k="emailTitle" />
            <StrInput label="Head office card title" v={v} set={set} k="headOfficeTitle" />
            <StrArea label="Form intro (optional)" v={v} set={set} k="formIntro" rows={2} />
          </>
        )}
      </AreaSection>

      <AreaSection area="productsPage" title="Products page" desc="Catalogue page heading." initial={p.productsPage as unknown as Record<string, unknown>}>
        {(v, set) => (
          <>
            <StrInput label="Eyebrow" v={v} set={set} k="eyebrow" />
            <StrInput label="Title" v={v} set={set} k="title" />
            <StrArea label="Subtext" v={v} set={set} k="subtext" />
          </>
        )}
      </AreaSection>

      <AreaSection area="footer" title="Footer" desc="Site-wide footer text." initial={p.footer as unknown as Record<string, unknown>}>
        {(v, set) => (
          <>
            <StrInput label="Tagline" v={v} set={set} k="tagline" />
            <StrArea label="Description" v={v} set={set} k="description" rows={2} />
            <StrInput label="Products column title" v={v} set={set} k="productsTitle" />
            <StrInput label="Company column title" v={v} set={set} k="companyTitle" />
            <StrInput label="Bottom tagline" v={v} set={set} k="bottomTagline" />
          </>
        )}
      </AreaSection>

      <AreaSection area="chat" title="Chat assistant" desc="Name, welcome message and quick prompts shown in the chat widget." initial={p.chat as unknown as Record<string, unknown>}>
        {(v, set) => (
          <>
            <StrInput label="Assistant name" v={v} set={set} k="assistantName" />
            <StrArea label="Welcome message" v={v} set={set} k="welcome" />
            <ListText label="Quick prompts" v={v} set={set} k="quickPrompts" />
          </>
        )}
      </AreaSection>
    </div>
  );
}
