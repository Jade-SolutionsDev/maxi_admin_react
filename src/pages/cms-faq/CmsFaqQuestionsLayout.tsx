import { Outlet } from "react-router-dom";
import { ResourceContextProvider } from "ra-core";
import { CmsTabsNav } from "../cms-shared/CmsTabsNav";
import { CmsFaqManagerTabs } from "./CmsFaqManagerTabs";
import { CmsFaqQuestionsList } from "./CmsFaqQuestionsList";

export function CmsFaqQuestionsLayout() {
  return (
    <ResourceContextProvider value="cms-faq-questions">
      <CmsTabsNav />
      <CmsFaqManagerTabs />
      <CmsFaqQuestionsList />
      <Outlet />
    </ResourceContextProvider>
  );
}
