import { useEffect, useState } from "react";
import { Form, required, useDataProvider, useNotify, useTranslate } from "ra-core";
import { useFieldArray, useFormContext } from "react-hook-form";
import {
  AlignLeft,
  Copyright,
  CreditCard,
  HandHeart,
  Heading,
  Link2,
  Loader2,
  Mail,
  Phone,
  Plus,
  Settings2,
  Trash2,
} from "lucide-react";

import { BooleanInput, FormSection, TextInput } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  ExtendedDataProvider,
  SiteSettingsData,
} from "@/providers/dataProvider";

/**
 * Singleton editor: unlike every other resource there is no list/create/
 * delete — one document is loaded on mount and the whole thing is PATCHed
 * back on save (last write wins). See DESIGN.md "Settings singleton page".
 */
export function CmsSettingsPage() {
  const translate = useTranslate();
  const notify = useNotify();
  const dataProvider = useDataProvider<ExtendedDataProvider>();

  const [settings, setSettings] = useState<SiteSettingsData | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    dataProvider
      .getSiteSettings()
      .then(({ data }) => {
        if (!cancelled) setSettings(data);
      })
      .catch(() => {
        if (!cancelled) notify("shared.actions.error", { type: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [dataProvider, notify]);

  const save = async (values: Record<string, unknown>) => {
    setSaving(true);
    try {
      const { data } = await dataProvider.updateSiteSettings(
        values as unknown as SiteSettingsData,
      );
      setSettings(data);
      notify("cms-settings.saved", { type: "info" });
    } catch (error) {
      const backendMessage = (
        error as { body?: { error?: { message?: string } } }
      )?.body?.error?.message;
      notify(backendMessage ?? translate("shared.actions.error"), {
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Settings2 className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {translate("resources.cms-settings.name")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {translate("cms-settings.subtitle", { _: "" })}
          </p>
        </div>
      </div>

      {!settings ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <Form
          onSubmit={save}
          record={settings as unknown as Record<string, unknown>}
          className="flex flex-col gap-6"
        >
          <FormSection
            icon={<AlignLeft />}
            title={translate("cms-settings.sections.footer")}
            subtitle={translate("cms-settings.sections.footer_hint", { _: "" })}
          >
            <TextInput
              source="footer.blurb"
              label={translate("cms-settings.fields.blurb")}
              validate={required()}
              multiline
              icon={<AlignLeft />}
              helperText="cms-settings.hints.blurb"
            />
            <TextInput
              source="footer.copyright"
              label={translate("cms-settings.fields.copyright")}
              validate={required()}
              icon={<Copyright />}
              helperText="cms-settings.hints.copyright"
            />
            <LegalLinksInput />
          </FormSection>

          <FormSection
            icon={<Mail />}
            title={translate("cms-settings.sections.contact")}
            className="border-t pt-5"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                source="contact.email"
                label={translate("cms-settings.fields.email")}
                validate={required()}
                icon={<Mail />}
                helperText="cms-settings.hints.email"
              />
              <TextInput
                source="contact.phone"
                label={translate("cms-settings.fields.phone")}
                validate={required()}
                icon={<Phone />}
                helperText="cms-settings.hints.phone"
              />
            </div>
          </FormSection>

          <FormSection
            icon={<CreditCard />}
            title={translate("cms-settings.sections.payments")}
            subtitle={translate("cms-settings.sections.payments_hint", {
              _: "",
            })}
            className="border-t pt-5"
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <BooleanInput
                source="payments.visa"
                label="Visa"
                helperText={false}
              />
              <BooleanInput
                source="payments.mastercard"
                label="Mastercard"
                helperText={false}
              />
              <BooleanInput
                source="payments.mibilletera"
                label="Mi Billetera"
                helperText={false}
              />
            </div>
          </FormSection>

          <FormSection
            icon={<HandHeart />}
            title={translate("cms-settings.sections.services")}
            subtitle={translate("cms-settings.sections.services_hint", {
              _: "",
            })}
            className="border-t pt-5"
          >
            <TextInput
              source="services.heading"
              label={translate("cms-settings.fields.heading")}
              validate={required()}
              icon={<Heading />}
              helperText={false}
            />
            <TextInput
              source="services.subheading"
              label={translate("cms-settings.fields.subheading")}
              validate={required()}
              multiline
              icon={<AlignLeft />}
              helperText={false}
            />
          </FormSection>

          <div className="flex justify-end border-t pt-5">
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {translate("ra.action.save", { _: "Save" })}
            </Button>
          </div>
        </Form>
      )}
    </div>
  );
}

/** Label + CmsPage slug pairs feeding the footer's legal links. */
function LegalLinksInput() {
  const translate = useTranslate();
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "footer.legalLinks",
  });

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-foreground">
        {translate("cms-settings.fields.legalLinks")}
      </p>
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-start gap-2">
          <div className="grid flex-1 gap-2 sm:grid-cols-2">
            <TextInput
              source={`footer.legalLinks.${index}.label`}
              label={translate("cms-settings.fields.linkLabel")}
              validate={required()}
              helperText={false}
            />
            <TextInput
              source={`footer.legalLinks.${index}.slug`}
              label={translate("cms-settings.fields.linkSlug")}
              validate={required()}
              icon={<Link2 />}
              helperText={false}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="mt-7 shrink-0 text-destructive"
            aria-label={translate("shared.actions.delete", { _: "Delete" })}
            onClick={() => remove(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => append({ label: "", slug: "" })}
      >
        <Plus className="mr-2 h-4 w-4" />
        {translate("cms-settings.actions.add_link")}
      </Button>
      <p className="text-xs text-muted-foreground">
        {translate("cms-settings.hints.legalLinks", { _: "" })}
      </p>
    </div>
  );
}
