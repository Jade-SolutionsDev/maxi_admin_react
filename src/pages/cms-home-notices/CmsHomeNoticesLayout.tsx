import { Outlet } from "react-router-dom";
import { ResourceContextProvider } from "ra-core";

import { CmsTabsNav } from "../cms-shared/CmsTabsNav";
import { CmsTextsList } from "../cms-pages/CmsTextsList";
import { NOTICE_SCREEN } from "../cms-pages/cms-text-screens";

export function CmsHomeNoticesLayout() {
  return (
    <ResourceContextProvider value="cms-home-notices">
      <CmsTabsNav />
      <CmsTextsList screen={NOTICE_SCREEN} />
      <Outlet />
    </ResourceContextProvider>
  );
}
