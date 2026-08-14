"use client";

import { useMemo, useState } from "react";
import { PERMISSION_GROUPS } from "./permissions";

export function RolePermissionMatrix({ initial, name, description, system }: { initial: string[]; name: string; description?: string | null; system: boolean }) {
  const [codes, setCodes] = useState<string[]>(initial);

  const toggle = (code: string, on: boolean) => {
    setCodes((prev) => (on ? [...prev, code] : prev.filter((c) => c !== code)));
  };

  const groupCounts = useMemo(
    () =>
      PERMISSION_GROUPS.map((g) => ({
        key: g.key,
        label: g.label,
        total: g.perms.length,
        checked: g.perms.filter((p) => codes.includes(p.code)).length,
      })),
    [codes],
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-medium text-slate-300">Role name</span>
          <input name="name" defaultValue={name} readOnly={system} className={`mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent ${system ? "opacity-60" : ""}`} />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-300">Description</span>
          <input name="description" defaultValue={description ?? ""} className="mt-1.5 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none focus:border-accent" />
        </label>
      </div>

      <div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">
            {codes.length} permissions selected
          </span>
          {groupCounts.map((g) => (
            <span key={g.key} className={`rounded-full px-3 py-1 text-[11px] ${g.checked === g.total && g.total > 0 ? "bg-emerald-500/15 text-emerald-300" : g.checked > 0 ? "bg-amber-500/10 text-amber-300" : "bg-white/5 text-slate-500"}`}>
              {g.label}: {g.checked}/{g.total}
            </span>
          ))}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {PERMISSION_GROUPS.map((g) => {
            const allOn = g.perms.every((p) => codes.includes(p.code));
            return (
              <fieldset key={g.key} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <legend className="flex w-full items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{g.label}</span>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <input type="checkbox" className="accent-accent" checked={allOn} onChange={(e) => g.perms.forEach((p) => toggle(p.code, e.target.checked))} />
                    All
                  </label>
                </legend>
                <div className="mt-3 space-y-2">
                  {g.perms.map((p) => (
                    <label key={p.code} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <input type="checkbox" name={`perm::${p.code}`} className="accent-accent" checked={codes.includes(p.code)} onChange={(e) => toggle(p.code, e.target.checked)} />
                      {p.label}
                      <span className="ml-auto font-mono text-[10px] text-slate-600">{p.code}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" className="rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-accent/90">
          Save permissions
        </button>
        <a href="/admin/roles" className="rounded-lg border border-white/10 px-5 py-2.5 text-sm text-slate-300 hover:text-white">
          Cancel
        </a>
      </div>
    </div>
  );
}
