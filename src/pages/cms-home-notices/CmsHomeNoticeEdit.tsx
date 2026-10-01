import { CmsTextFormModal } from "../cms-pages/CmsTextFormModal";
import { NOTICE_SCREEN } from "../cms-pages/cms-text-screens";

export default function CmsHomeNoticeEdit() {
  return <CmsTextFormModal screen={NOTICE_SCREEN} mode="edit" />;
}
