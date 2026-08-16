import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  Clock,
  HandHeart,
  Headset,
  HeartHandshake,
  Leaf,
  Lock,
  MessageSquareText,
  PiggyBank,
  ShieldCheck,
  Truck,
} from "lucide-react";

/**
 * Icons offered for service cards. MUST stay in sync with the storefront's
 * allowlist (maxi_web_client_next src/feature/home/constants/service-icons.ts):
 * the storefront maps these names to lucide components and falls back to a
 * default for unknown ones.
 */
export const SERVICE_ICON_COMPONENTS: Record<string, LucideIcon> = {
  ShieldCheck,
  Lock,
  MessageSquareText,
  Truck,
  Clock,
  HeartHandshake,
  BadgeCheck,
  Headset,
  PiggyBank,
  Leaf,
};

export const SERVICE_ICON_NAMES = Object.keys(SERVICE_ICON_COMPONENTS);

/** Same fallback the storefront uses for names outside the allowlist. */
export const resolveServiceIcon = (name: string): LucideIcon =>
  SERVICE_ICON_COMPONENTS[name] ?? HandHeart;
