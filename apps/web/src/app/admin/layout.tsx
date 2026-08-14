import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser, hasPermission } from "@/lib/auth";
import { logout } from "./actions";

export const metadata = { title: "Admin | Oasis Impex", robots: { index: false, follow: false } };

interface NavItem {
  href: string;
  label: string;
  perm: string;
}

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", perm: "" },
  { href: "/admin/inquiries", label: "Leads & Inquiries", perm: "leads.read" },
  { href: "/admin/chats", label: "Chats & WhatsApp", perm: "chat.read" },
  { href: "/admin/products/requests", label: "Product Requests", perm: "requests.read" },
  { href: "/admin/customers", label: "Customers", perm: "partners.read" },
  { href: "/admin/vendors", label: "Vendors", perm: "partners.read" },
  { href: "/admin/products", label: "Products", perm: "catalog.read" },
  { href: "/admin/inventory", label: "Inventory", perm: "inventory.read" },
  { href: "/admin/campaigns", label: "Email Campaigns", perm: "campaigns.read" },
  { href: "/admin/email-controls", label: "Email Controls", perm: "campaigns.read" },
  { href: "/admin/testimonials", label: "Testimonials", perm: "settings.read" },
  { href: "/admin/analytics", label: "Analytics", perm: "analytics.read" },
  { href: "/admin/reports", label: "Reports", perm: "analytics.read" },
  { href: "/admin/content", label: "Website Content", perm: "settings.read" },
  { href: "/admin/navigation", label: "Navigation", perm: "settings.read" },
  { href: "/admin/forms", label: "Form Builder", perm: "settings.read" },
  { href: "/admin/pages", label: "Page Builder", perm: "settings.read" },
  { href: "/admin/reminders", label: "Follow-ups & Tasks", perm: "leads.read" },
  { href: "/admin/audit", label: "Audit Log", perm: "settings.read" },
  { href: "/admin/users", label: "Team & Roles", perm: "users.read" },
  { href: "/admin/orders", label: "Orders", perm: "orders.read" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const visible = NAV.filter((n) => !n.perm || hasPermission(user, n.perm));

  return (
    <div className="min-h-screen bg-[#0B1320] text-slate-200">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-56 border-r border-white/10 bg-[#0D1626] p-4 md:block">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent font-black text-slate-950">O</span>
          <span className="font-extrabold tracking-tight text-white">
            Oasis<span className="text-accent"> Impex</span>
          </span>
        </Link>
        <nav className="mt-8 space-y-1">
          {visible.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 border-t border-white/10 pt-4">
          <p className="truncate px-3 text-xs font-semibold text-slate-300">{user.name}</p>
          <p className="px-3 text-[11px] text-slate-500">{user.email}</p>
          <p className="px-3 pt-1 text-[10px] uppercase tracking-wide text-slate-600">{user.roles.join(", ")}</p>
          <form action={logout}>
            <button className="mt-2 w-full rounded-lg px-3 py-2 text-left text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-300">
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <div className="md:pl-56">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[#0B1320]/90 px-4 py-3 backdrop-blur md:hidden">
          <Link href="/admin" className="font-extrabold text-white">
            Oasis<span className="text-accent"> Impex</span> <span className="text-sm font-medium text-slate-400">Admin</span>
          </Link>
          <form action={logout}>
            <button className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300">Sign out</button>
          </form>
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-white/10 bg-[#0D1626] px-4 py-2 md:hidden">
          {visible.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-slate-300"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <main className="mx-auto max-w-6xl p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
