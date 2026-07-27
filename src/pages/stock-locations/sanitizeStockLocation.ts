import type { PickupAddress } from "./PickupAddressesInput";

// Keep only the fields the backend DTO accepts. Pickup addresses are stripped of
// their `id` (the nested DTO forbids non-whitelisted keys) and blank rows are
// dropped. Shared by the create modal and the detail edit tab.
export function sanitizeStockLocation(data: Record<string, unknown>) {
  const pickupAddresses = Array.isArray(data.pickupAddresses)
    ? (data.pickupAddresses as PickupAddress[])
        .map((a) => ({
          label: a.label?.trim() || undefined,
          address: (a.address ?? "").trim(),
        }))
        .filter((a) => a.address)
    : undefined;
  return {
    name: data.name,
    isActive: data.isActive,
    coverage: data.coverage,
    ...(data.grocerIds !== undefined ? { grocerIds: data.grocerIds } : {}),
    ...(pickupAddresses !== undefined ? { pickupAddresses } : {}),
  };
}
