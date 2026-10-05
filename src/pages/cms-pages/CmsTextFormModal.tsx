import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { required, useNotify, useTranslate, type RaRecord } from "ra-core";
import {
  AlignLeft,
  ArrowUpDown,
  CalendarClock,
  FileText,
  Heading,
  Megaphone,
} from "lucide-react";

import {
  BooleanInput,
  NumberInput,
  ResourceFormModal,
  TextInput,
} from "@/components/admin";
import { fromDateTimeLocal, toDateTimeLocal } from "./cms-text";
import type { CmsTextScreen } from "./cms-text-screens";

interface CmsTextFormModalProps {
  screen: CmsTextScreen;
  mode: "create" | "edit";
}

// The slug is server-generated from the title (taxonomy precedent) and the
// record carries server-managed fields the DTO whitelist rejects. The one
// exception: the mandatory-pages alert prefills an explicit slug so a
// recreated page lands on the canonical slug the storefront references.
// Dates come back from the picker in local time and leave as ISO instants.
const sanitizeFor =
  (screen: CmsTextScreen) => (data: Record<string, unknown>) => ({
    title: data.title,
    content: data.content ?? "",
    ...(data.slug ? { slug: data.slug } : {}),
    sortOrder: data.sortOrder ?? 0,
    isActive: data.isActive ?? true,
    ...(screen.isNotice
      ? {
          startsAt: fromDateTimeLocal(data.startsAt as string | null),
          endsAt: fromDateTimeLocal(data.endsAt as string | null),
        }
      : {}),
  });

/**
 * Create/edit form for a store text. Saving only touches the DRAFT, so it
 * lands on the detail, where the text is published.
 */
export function CmsTextFormModal({ screen, mode }: CmsTextFormModalProps) {
  const navigate = useNavigate();
  const notify = useNotify();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const translate = useTranslate();

  const prefilledTitle = searchParams.get("title") ?? undefined;
  const prefilledSlug = searchParams.get("slug") ?? undefined;

  const isEdit = mode === "edit";
  const name = translate(`resources.${screen.resource}.name`);

  return (
    <ResourceFormModal
      mode={mode}
      id={id}
      resource={screen.resource}
      onClose={() => navigate(screen.basePath)}
      icon={
        screen.isNotice ? (
          <Megaphone className="h-5 w-5" />
        ) : (
          <FileText className="h-5 w-5" />
        )
      }
      title={translate(
        isEdit ? "shared.actions.edit_title" : "shared.actions.create_title",
        { name },
      )}
      subtitle={translate(
        `${screen.i18n}.form.${isEdit ? "edit_subtitle" : "create_subtitle"}`,
      )}
      callout={{
        title: translate("cms-texts.form.draft_title"),
        description: translate(`${screen.i18n}.form.note`),
      }}
      transform={sanitizeFor(screen)}
      defaultValues={
        isEdit ? undefined : { title: prefilledTitle, slug: prefilledSlug }
      }
      mutationOptions={{
        onSuccess: (record: RaRecord) => {
          notify("cms-texts.notify.draft_saved", { type: "info" });
          navigate(`${screen.basePath}/${record.id}`);
        },
      }}
    >
      <CmsTextFormFields screen={screen} isEdit={isEdit} />
    </ResourceFormModal>
  );
}

function CmsTextFormFields({
  screen,
  isEdit,
}: {
  screen: CmsTextScreen;
  isEdit: boolean;
}) {
  const translate = useTranslate();

  return (
    <>
      <TextInput
        source="title"
        label={translate("list.fields.title")}
        validate={required()}
        icon={<Heading />}
        placeholder={translate(`${screen.i18n}.form.placeholders.title`)}
        helperText={`${screen.i18n}.form.hints.title`}
      />

      <TextInput
        source="content"
        label={translate("list.fields.content")}
        validate={required()}
        multiline
        rows={14}
        icon={<AlignLeft />}
        placeholder={translate(`${screen.i18n}.form.placeholders.content`)}
        helperText="cms-texts.form.markdown_hint"
      />

      {screen.isNotice && (
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            source="startsAt"
            type="datetime-local"
            label={translate("cms-home-notices.fields.startsAt")}
            icon={<CalendarClock />}
            format={toDateTimeLocal}
            helperText="cms-home-notices.form.hints.startsAt"
          />
          <TextInput
            source="endsAt"
            type="datetime-local"
            label={translate("cms-home-notices.fields.endsAt")}
            icon={<CalendarClock />}
            format={toDateTimeLocal}
            helperText="cms-home-notices.form.hints.endsAt"
          />
        </div>
      )}

      {isEdit && (
        <div className="grid gap-4 border-t pt-5 sm:grid-cols-2">
          <NumberInput
            source="sortOrder"
            label={translate("list.fields.sortOrder")}
            defaultValue={0}
            icon={<ArrowUpDown />}
            helperText={`${screen.i18n}.form.hints.sortOrder`}
          />
          <BooleanInput
            source="isActive"
            label={translate("list.fields.status")}
            defaultValue={true}
            helperText={`${screen.i18n}.form.hints.isActive`}
          />
        </div>
      )}
    </>
  );
}
