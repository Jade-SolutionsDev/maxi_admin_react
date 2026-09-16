export const CMS_BANNER_TARGET_TYPES = [
  "department",
  "category",
  "product",
] as const;

export type CmsBannerTargetType = (typeof CMS_BANNER_TARGET_TYPES)[number];

export type CmsBannerTarget = {
  type: CmsBannerTargetType;
  id: string;
  name: string | null;
  slug: string | null;
  isAvailable: boolean;
};

export type CmsBannerTargetPayload = Pick<CmsBannerTarget, "type" | "id">;

export const CMS_BANNER_TARGET_CHOICES = CMS_BANNER_TARGET_TYPES.map((type) => ({
  id: type,
  name: `cms-banners.target.types.${type}`,
}));

export const CMS_BANNER_TARGET_RESOURCES: Record<
  CmsBannerTargetType,
  string
> = {
  department: "departments",
  category: "categories",
  product: "products",
};

export function getCmsBannerTargetAdminPath(
  target: Pick<CmsBannerTarget, "type" | "id">,
) {
  return `/${CMS_BANNER_TARGET_RESOURCES[target.type]}/${target.id}`;
}

export function toCmsBannerTargetPayload(
  value: unknown,
): CmsBannerTargetPayload | null {
  const target = value as Partial<CmsBannerTargetPayload> | null | undefined;
  if (
    !target?.id ||
    !target.type ||
    !CMS_BANNER_TARGET_TYPES.includes(target.type)
  ) {
    return null;
  }

  return { type: target.type, id: target.id };
}

export function cmsBannerTargetsEqual(
  left: CmsBannerTargetPayload | null,
  right: CmsBannerTargetPayload | null,
) {
  return left?.type === right?.type && left?.id === right?.id;
}
