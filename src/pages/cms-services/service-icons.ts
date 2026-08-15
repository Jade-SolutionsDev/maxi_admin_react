/**
 * Icon names offered for service cards. MUST stay in sync with the
 * storefront's allowlist (maxi_web_client_next
 * src/feature/home/constants/service-icons.ts): the storefront maps these
 * names to lucide components and falls back to a default for unknown ones.
 */
export const SERVICE_ICON_NAMES = [
  "ShieldCheck",
  "Lock",
  "MessageSquareText",
  "Truck",
  "Clock",
  "HeartHandshake",
  "BadgeCheck",
  "Headset",
  "PiggyBank",
  "Leaf",
] as const;

export const SERVICE_ICON_CHOICES = SERVICE_ICON_NAMES.map((name) => ({
  id: name,
  name,
}));
