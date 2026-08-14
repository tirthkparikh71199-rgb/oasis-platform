import Link from "next/link";
import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import { schema } from "@oasis/db";
import { db } from "@/lib/db";

export async function CustomerProfile({ email }: { email: string }) {
  const dbs = db();
  const [customer] = await dbs
    .select()
    .from(schema.customers)
    .where(ilike(schema.customers.email, email))
    .limit(1);

  const [inquiries, requests, conversations, orders] = await Promise.all([
    dbs
      .select({
        id: schema.inquiries.id,
        name: schema.inquiries.name,
        company: schema.inquiries.company,
        email: schema.inquiries.email,
        phone: schema.inquiries.phone,
        message: schema.inquiries.message,
        source: schema.inquiries.source,
        status: schema.inquiries.status,
        product: schema.products.name,
        createdAt: schema.inquiries.createdAt,
      })
      .from(schema.inquiries)
      .leftJoin(schema.products, eq(schema.inquiries.productId, schema.products.id))
      .where(ilike(schema.inquiries.email, email))
      .orderBy(desc(schema.inquiries.createdAt)),
    dbs
      .select()
      .from(schema.productRequests)
      .where(ilike(schema.productRequests.email, email))
      .orderBy(desc(schema.productRequests.createdAt)),
    dbs
      .select({ id: schema.conversations.id, channel: schema.conversations.channel, externalId: schema.conversations.externalId, status: schema.conversations.status, updatedAt: schema.conversations.updatedAt })
      .from(schema.conversations)
      .where(or(eq(schema.conversations.customerId, customer?.id ?? ""), ilike(schema.conversations.externalId, `wa:${email}`)))
      .orderBy(desc(schema.conversations.updatedAt)),
    customer
      ? dbs
          .select({ id: schema.orders.id, orderNumber: schema.orders.orderNumber, product: schema.products.name, quantity: schema.orders.quantity, unit: schema.orders.unit, status: schema.orders.status, createdAt: schema.orders.createdAt })
          .from(schema.orders)
          .leftJoin(schema.products, eq(schema.orders.productId, schema.products.id))
          .where(eq(schema.orders.customerId, customer.id))
          .orderBy(desc(schema.orders.createdAt))
      : Promise.resolve([]),
  ]);

  const reminders = await dbs
    .select({ id: schema.reminders.id, title: schema.reminders.title, dueAt: schema.reminders.dueAt, done: schema.reminders.done })
    .from(schema.reminders)
    .where(and(eq(schema.reminders.entity, "inquiry"), ilike(schema.reminders.title, `%${email.split("@")[0]}%`)))
    .orderBy(asc(schema.reminders.dueAt));

  return (
    <div className="rounded-xl border border-accent/30 bg-white/[0.03] p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-white">360° profile — {email}</h2>
        <a href="/admin/customers" className="text-xs text-slate-400 hover:text-white">
          Close
        </a>
      </div>

      <div className="mt-3 rounded-lg bg-white/[0.03] p-3 text-sm">
        {customer ? (
          <div className="grid gap-1 text-slate-300 sm:grid-cols-2">
            <p>
              <span className="text-slate-500">Name:</span> {customer.name}
            </p>
            <p>
              <span className="text-slate-500">Company:</span> {customer.company ?? "—"}
            </p>
            <p>
              <span className="text-slate-500">Phone:</span> {customer.phone ?? "—"}
            </p>
            <p>
              <span className="text-slate-500">Status:</span>{" "}
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${customer.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-300" : customer.status === "LEAD" ? "bg-amber-500/10 text-amber-300" : "bg-slate-500/10 text-slate-400"}`}>
                {customer.status}
              </span>
            </p>
            <a href={`/admin/customers?edit=${customer.id}`} className="mt-1 text-xs text-accent hover:underline">
              Edit customer record →
            </a>
          </div>
        ) : (
          <p className="text-slate-400">
            No saved customer record for this email yet.{" "}
            <a href={`/admin/customers?email=${encodeURIComponent(email)}&add=1`} className="text-accent hover:underline">
              Create one →
            </a>
          </p>
        )}
      </div>

      <ProfileSection title={`Inquiries (${inquiries.length})`}>
        {inquiries.length === 0 ? (
          <Empty />
        ) : (
          inquiries.map((i) => (
            <li key={i.id} className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-slate-300">
                {i.product ?? "General"} — {i.message?.slice(0, 90) ?? "no message"}
              </span>
              <span className="flex items-center gap-2 text-xs text-slate-500">
                <span className={`rounded-full px-2 py-0.5 font-medium ${statusStyle(i.status)}`}>{i.status}</span>
                {new Date(i.createdAt).toLocaleDateString("en-IN")}
              </span>
            </li>
          ))
        )}
      </ProfileSection>

      <ProfileSection title={`Product requests (${requests.length})`}>
        {requests.length === 0 ? (
          <Empty />
        ) : (
          requests.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-slate-300">
                {r.productName}
                {r.message ? ` — ${r.message.slice(0, 90)}` : ""}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle(r.status)}`}>{r.status}</span>
            </li>
          ))
        )}
      </ProfileSection>

      <ProfileSection title={`Chats & WhatsApp (${conversations.length})`}>
        {conversations.length === 0 ? (
          <Empty />
        ) : (
          conversations.map((c) => (
            <li key={c.id}>
              <Link href={`/admin/chats/${c.id}`} className="text-slate-300 hover:text-accent">
                [{c.channel}] {c.externalId ?? "—"} — {c.status}
              </Link>
            </li>
          ))
        )}
      </ProfileSection>

      <ProfileSection title={`Orders (${orders.length})`}>
        {orders.length === 0 ? (
          <Empty />
        ) : (
          orders.map((o) => (
            <li key={o.id} className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-slate-300">
                {o.orderNumber} — {o.product ?? "—"} {o.quantity ? `(${o.quantity}${o.unit ? " " + o.unit : ""})` : ""}
              </span>
              <span className="text-xs text-slate-500">{o.status}</span>
            </li>
          ))
        )}
      </ProfileSection>

      <ProfileSection title={`Open follow-ups (${reminders.filter((r) => !r.done).length})`}>
        {reminders.length === 0 ? (
          <Empty />
        ) : (
          reminders.map((r) => (
            <li key={r.id} className={`flex flex-wrap items-center justify-between gap-2 ${r.done ? "opacity-50 line-through" : ""}`}>
              <span className="text-slate-300">{r.title}</span>
              <span className="text-xs text-slate-500">{new Date(r.dueAt).toLocaleString("en-IN")}</span>
            </li>
          ))
        )}
      </ProfileSection>
    </div>
  );
}

function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400">{title}</h3>
      <ul className="mt-2 space-y-1.5 text-sm">{children}</ul>
    </div>
  );
}

function Empty() {
  return <li className="text-xs text-slate-600">None.</li>;
}

function statusStyle(status: string) {
  return { NEW: "bg-sky-500/10 text-sky-300", CONTACTED: "bg-violet-500/10 text-violet-300", QUALIFIED: "bg-blue-500/10 text-blue-300", IN_PROGRESS: "bg-amber-500/10 text-amber-300", CONVERTED: "bg-emerald-500/10 text-emerald-300", CLOSED: "bg-slate-500/10 text-slate-400", QUOTING: "bg-violet-500/10 text-violet-300", AVAILABLE: "bg-emerald-500/10 text-emerald-300", DECLINED: "bg-slate-500/10 text-slate-400" }[status] ?? "bg-white/5 text-slate-400";
}
