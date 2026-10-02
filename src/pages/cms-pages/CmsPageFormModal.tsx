import { CmsTextFormModal } from "./CmsTextFormModal";
import { PAGE_SCREEN } from "./cms-text-screens";

export default function CmsPageFormModal({
  mode,
}: {
  mode: "create" | "edit";
}) {
  return <CmsTextFormModal screen={PAGE_SCREEN} mode={mode} />;
}
