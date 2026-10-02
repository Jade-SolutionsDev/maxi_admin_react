import { CmsTextFormModal } from "../cms-pages/CmsTextFormModal";
import { NOTICE_SCREEN } from "../cms-pages/cms-text-screens";

export default function CmsHomeNoticeCreate() {
  return <CmsTextFormModal screen={NOTICE_SCREEN} mode="create" />;
}
