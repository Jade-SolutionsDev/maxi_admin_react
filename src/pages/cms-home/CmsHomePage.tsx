import { useCallback, useEffect, useState } from "react";
import {
  useCanAccess,
  useDataProvider,
  useNotify,
  useTranslate,
} from "ra-core";
import {
  LayoutGrid,
  LayoutTemplate,
  Loader2,
  ShoppingBasket,
  Undo2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { backendMessage } from "@/pages/users/errors";
import type {
  CmsHomeChange,
  CmsHomeState,
  ExtendedDataProvider,
} from "@/providers/dataProvider";
import { CmsTabsNav } from "../cms-shared/CmsTabsNav";
import { ChangeHistory } from "./ChangeHistory";
import { FeaturedPicker } from "./FeaturedPicker";
import type { HomeLayout } from "./home-layout";
import { PublishStatusCard } from "./PublishStatusCard";
import { SectionOrderEditor } from "./SectionOrderEditor";

/** The storefront shows at most this many featured products and departments. */
const MAX_FEATURED = 24;

type Busy = "save" | "publish" | "preview" | null;

/**
 * Singleton editor for the storefront home. Edits stay local until «Guardar
 * borrador»; the saved draft can be previewed on the real storefront and then
 * published. Banners are edited in their own tab and join the same draft.
 */
export function CmsHomePage() {
  const translate = useTranslate();
  const notify = useNotify();
  const dataProvider = useDataProvider<ExtendedDataProvider>();
  const { canAccess: canEdit } = useCanAccess({
    resource: "cms-home",
    action: "edit",
  });
  const { canAccess: canPublish } = useCanAccess({
    resource: "cms-home",
    action: "publish",
  });

  const [state, setState] = useState<CmsHomeState | null>(null);
  const [layout, setLayout] = useState<HomeLayout | null>(null);
  const [changes, setChanges] = useState<CmsHomeChange[] | null>(null);
  const [busy, setBusy] = useState<Busy>(null);

  const applyState = useCallback((next: CmsHomeState) => {
    setState(next);
    setLayout(next.layout);
  }, []);

  const loadChanges = useCallback(
    () =>
      dataProvider
        .getCmsHomeChanges()
        .then(({ data }) => setChanges(data))
        .catch(() => setChanges([])),
    [dataProvider],
  );

  const fail = useCallback(
    (error: unknown) =>
      notify(backendMessage(error, translate("shared.actions.error")), {
        type: "error",
      }),
    [notify, translate],
  );

  useEffect(() => {
    dataProvider
      .getCmsHome()
      .then(({ data }) => applyState(data))
      .catch(fail);
    loadChanges();
  }, [dataProvider, applyState, loadChanges, fail]);

  const isDirty =
    !!state && !!layout && JSON.stringify(layout) !== JSON.stringify(state.layout);
  const editable = Boolean(canEdit) && busy === null;

  const save = async () => {
    if (!layout) return;
    setBusy("save");
    try {
      const { data } = await dataProvider.updateCmsHomeLayout(layout);
      applyState(data);
      notify("cms-home.notify.saved", { type: "info" });
      await loadChanges();
    } catch (error) {
      fail(error);
    } finally {
      setBusy(null);
    }
  };

  const publish = async () => {
    setBusy("publish");
    try {
      const { data } = await dataProvider.publishCmsHome();
      applyState(data);
      notify("cms-home.notify.published", { type: "info" });
      await loadChanges();
    } catch (error) {
      fail(error);
    } finally {
      setBusy(null);
    }
  };

  // The tab is opened synchronously (inside the click) so pop-up blockers let
  // it through; it is pointed at the storefront once the link is signed.
  const preview = async () => {
    const tab = window.open("", "_blank");
    if (!tab) {
      notify("cms-home.notify.preview_blocked", { type: "warning" });
      return;
    }
    tab.opener = null;
    setBusy("preview");
    try {
      const { data } = await dataProvider.createCmsHomePreview();
      tab.location.href = data.url;
    } catch (error) {
      tab.close();
      fail(error);
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <CmsTabsNav />
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <LayoutTemplate className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {translate("resources.cms-home.name")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {translate("cms-home.subtitle")}
            </p>
          </div>
        </div>

        {!state || !layout ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <>
            <PublishStatusCard
              state={state}
              isDirty={isDirty}
              canPublish={Boolean(canPublish)}
              isPreviewing={busy === "preview"}
              isPublishing={busy === "publish"}
              onPreview={preview}
              onPublish={publish}
            />

            <p className="text-sm text-muted-foreground">
              {translate(
                canEdit ? "cms-home.flow_hint" : "cms-home.status.read_only",
              )}
            </p>

            <SectionOrderEditor
              sections={layout.sections}
              disabled={!editable}
              onChange={(sections) => setLayout({ ...layout, sections })}
            />

            <div className="border-t pt-5">
              <FeaturedPicker
                resource="products"
                ids={layout.featuredProductIds}
                max={MAX_FEATURED}
                icon={<ShoppingBasket />}
                title={translate("cms-home.featured.products_title")}
                hint={translate("cms-home.featured.products_hint", {
                  max: MAX_FEATURED,
                })}
                addLabel={translate("cms-home.featured.add_product")}
                disabled={!editable}
                onChange={(featuredProductIds) =>
                  setLayout({ ...layout, featuredProductIds })
                }
              />
            </div>

            <div className="border-t pt-5">
              <FeaturedPicker
                resource="departments"
                ids={layout.featuredDepartmentIds}
                max={MAX_FEATURED}
                icon={<LayoutGrid />}
                title={translate("cms-home.featured.departments_title")}
                hint={translate("cms-home.featured.departments_hint")}
                addLabel={translate("cms-home.featured.add_department")}
                disabled={!editable}
                onChange={(featuredDepartmentIds) =>
                  setLayout({ ...layout, featuredDepartmentIds })
                }
              />
            </div>

            {canEdit && (
              <div className="sticky bottom-0 flex justify-end gap-2 border-t bg-background/95 py-4 backdrop-blur">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={!isDirty || busy !== null}
                  onClick={() => setLayout(state.layout)}
                >
                  <Undo2 className="h-4 w-4" />
                  {translate("cms-home.actions.discard")}
                </Button>
                <Button
                  type="button"
                  disabled={!isDirty || busy !== null}
                  onClick={save}
                >
                  {busy === "save" && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {translate("cms-home.actions.save")}
                </Button>
              </div>
            )}

            <div className="border-t pt-5">
              <ChangeHistory changes={changes} />
            </div>
          </>
        )}
      </div>
    </>
  );
}
