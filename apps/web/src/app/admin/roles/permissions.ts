export interface PermissionItem {
  code: string;
  label: string;
}

export interface PermissionGroup {
  key: string;
  label: string;
  perms: PermissionItem[];
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    perms: [{ code: "reports.read", label: "View reports & dashboard" }],
  },
  {
    key: "leads",
    label: "Leads & inquiries",
    perms: [
      { code: "leads.read", label: "View inquiries" },
      { code: "leads.write", label: "Update status & assign" },
      { code: "leads.export", label: "Export leads" },
    ],
  },
  {
    key: "requests",
    label: "Product requests",
    perms: [
      { code: "requests.read", label: "View product requests" },
      { code: "requests.write", label: "Update status & notes" },
    ],
  },
  {
    key: "chats",
    label: "Chats & WhatsApp",
    perms: [
      { code: "chat.read", label: "View conversations" },
      { code: "chat.reply", label: "Reply as agent" },
      { code: "handoffs.manage", label: "Manage handoffs" },
    ],
  },
  {
    key: "customers",
    label: "Customers",
    perms: [
      { code: "partners.read", label: "View customers" },
      { code: "partners.write", label: "Create or edit customers" },
    ],
  },
  {
    key: "catalog",
    label: "Product catalogue",
    perms: [
      { code: "catalog.read", label: "View products" },
      { code: "catalog.write", label: "Create or edit products" },
      { code: "catalog.publish", label: "Toggle public visibility" },
    ],
  },
  {
    key: "orders",
    label: "Orders",
    perms: [
      { code: "orders.read", label: "View orders" },
      { code: "orders.write", label: "Create or edit orders" },
      { code: "orders.manage", label: "Manage & cancel orders" },
    ],
  },
  {
    key: "inventory",
    label: "Inventory (legacy)",
    perms: [
      { code: "inventory.read", label: "View inventory" },
      { code: "inventory.write", label: "Record movements" },
      { code: "inventory.manage", label: "Manage warehouses" },
    ],
  },
  {
    key: "content",
    label: "Website content",
    perms: [
      { code: "settings.read", label: "View content & settings" },
      { code: "settings.write", label: "Edit content & retrain AI" },
      { code: "knowledge.read", label: "View knowledge base" },
      { code: "knowledge.write", label: "Upload knowledge documents" },
      { code: "knowledge.publish", label: "Change document visibility" },
      { code: "seo.read", label: "View SEO pages" },
      { code: "seo.write", label: "Edit SEO pages" },
    ],
  },
  {
    key: "campaigns",
    label: "Email campaigns",
    perms: [
      { code: "campaigns.read", label: "View campaigns" },
      { code: "campaigns.write", label: "Create & send campaigns" },
    ],
  },
  {
    key: "analytics",
    label: "Analytics",
    perms: [{ code: "analytics.read", label: "View analytics dashboard" }],
  },
  {
    key: "team",
    label: "Team & roles",
    perms: [
      { code: "users.read", label: "View team" },
      { code: "users.write", label: "Create or edit users" },
      { code: "users.deactivate", label: "Deactivate users" },
      { code: "roles.manage", label: "Manage roles & permissions" },
    ],
  },
  {
    key: "system",
    label: "System",
    perms: [
      { code: "audit.read", label: "View audit log" },
      { code: "system.monitor", label: "View system health & jobs" },
      { code: "integrations.manage", label: "Configure integrations" },
    ],
  },
];

export const ALL_PERMISSION_CODES = PERMISSION_GROUPS.flatMap((g) => g.perms.map((p) => p.code));
