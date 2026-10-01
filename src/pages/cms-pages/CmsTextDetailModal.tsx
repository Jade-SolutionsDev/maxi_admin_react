import { Link, useNavigate, useParams } from "react-router-dom";
import {
  RecordContextProvider,
  useCanAccess,
  useDelete,
  useGetOne,
  useNotify,
  useRefresh,
  useTranslate,
} from "ra-core";
import {
  AlignLeft,
  ArrowUpDown,
  CalendarClock,
  CircleDot,
  FileText,
  Megaphone,
  Pencil,
  Trash2,
} from "lucide-react";

import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
import {
  DetailField,
  DetailTextBlock,
  ResourceDetailModal,
} from "@/components/admin/resource-detail-modal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { backendMessage } from "@/pages/users/errors";
import type { CmsText } from "./cms-text";
import type { CmsTextScreen } from "./cms-text-screens";
import { NoticeSchedule } from "./NoticeSchedule";
import { PublicationPanel } from "./PublicationPanel";
import { VersionHistory } from "./VersionHistory";

/** Detail of a store text: its draft, where it stands and its history. */
export function CmsTextDetailModal({ screen }: { screen: CmsTextScreen }) {
  const translate = useTranslate();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const notify = useNotify();
  const refresh = useRefresh();
  const [deleteOne, { isPending: removing }] = useDelete();
  const { canAccess: canEdit } = useCanAccess({
    resource: screen.resource,
    action: "edit",
  });
  const { canAccess: canDelete } = useCanAccess({
    resource: screen.resource,
    action: "delete",
  });

  const onClose = () => navigate(screen.basePath);
  const {
    data: record,
    isLoading,
    refetch,
  } = useGetOne<CmsText>(
    screen.resource,
    { id: id as string },
    { enabled: Boolean(id), onError: onClose },
  );

  const remove = () =>
    deleteOne(
      screen.resource,
      { id: record!.id, previousData: record },
      {
        mutationMode: "pessimistic",
        onSuccess: () => {
          notify("shared.actions.delete_success", { type: "info" });
          refresh();
          navigate(screen.basePath);
        },
        onError: (error: unknown) =>
          notify(backendMessage(error, translate("shared.actions.error")), {
            type: "error",
          }),
      },
    );

  return (
    <ResourceDetailModal
      onClose={onClose}
      isLoading={isLoading || !record}
      icon={
        screen.isNotice ? (
          <Megaphone className="h-5 w-5" />
        ) : (
          <FileText className="h-5 w-5" />
        )
      }
      title={record?.title ?? translate("shared.actions.view", { _: "Details" })}
      subtitle={screen.isNotice ? undefined : (record?.slug ?? "")}
      footer={
        record ? (
          <>
            {canDelete && (
              <ConfirmActionButton
                label={translate("shared.actions.delete", { _: "Delete" })}
                icon={<Trash2 className="mr-2 h-4 w-4" />}
                destructive
                disabled={removing}
                title={translate("shared.actions.delete_confirm_title", {
                  name: translate(`resources.${screen.resource}.name`),
                  _: "Delete",
                })}
                description={translate(
                  `${screen.i18n}.delete_confirm_description`,
                  { name: record.title },
                )}
                confirmLabel={translate("shared.actions.delete", {
                  _: "Delete",
                })}
                onConfirm={remove}
              />
            )}
            {canEdit && (
              <Link
                to={`${screen.basePath}/edit/${record.id}`}
                className={cn(buttonVariants())}
              >
                <Pencil className="mr-2 h-4 w-4" />
                {translate("cms-texts.actions.edit_draft")}
              </Link>
            )}
          </>
        ) : undefined
      }
    >
      {record && (
        <RecordContextProvider value={record}>
          <PublicationPanel
            screen={screen}
            record={record}
            onPublished={() => {
              void refetch();
              refresh();
            }}
          />

          <DetailTextBlock
            label={translate("cms-texts.draft")}
            icon={<AlignLeft />}
          >
            {record.content}
          </DetailTextBlock>

          <div className="grid gap-4 border-t pt-5 sm:grid-cols-3">
            {screen.isNotice && (
              <DetailField
                label={translate("cms-home-notices.fields.schedule")}
                icon={<CalendarClock />}
              >
                <NoticeSchedule notice={record} />
              </DetailField>
            )}
            <DetailField
              label={translate("list.fields.sortOrder")}
              icon={<ArrowUpDown />}
            >
              {record.sortOrder ?? 0}
            </DetailField>
            <DetailField
              label={translate("list.fields.status")}
              icon={<CircleDot />}
            >
              {record.isActive
                ? translate("shared.status.active", { _: "Active" })
                : translate("shared.status.inactive", { _: "Inactive" })}
            </DetailField>
          </div>

          <VersionHistory screen={screen} record={record} />
        </RecordContextProvider>
      )}
    </ResourceDetailModal>
  );
}
