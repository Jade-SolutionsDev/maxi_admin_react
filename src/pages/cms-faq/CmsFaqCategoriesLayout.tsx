import { Outlet } from "react-router-dom";
import { ResourceContextProvider } from "ra-core";
import { CmsTabsNav } from "../cms-shared/CmsTabsNav";
import { CmsFaqManagerTabs } from "./CmsFaqManagerTabs";
import { CmsFaqCategoriesList } from "./CmsFaqCategoriesList";

export function CmsFaqCategoriesLayout() {
  return (
    <ResourceContextProvider value="cms-faq-categories">
      <CmsTabsNav />
      <CmsFaqManagerTabs />
      <CmsFaqCategoriesList />
      <Outlet />
    </ResourceContextProvider>
  );
}
