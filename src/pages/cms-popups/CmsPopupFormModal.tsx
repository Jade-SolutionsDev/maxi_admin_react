import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { maxLength, required, useTranslate } from "ra-core";
import { useFormContext, useWatch } from "react-hook-form";
import type { ReactNode } from "react";
import {
  AlignLeft,
  CalendarClock,
  Heading,
  Image as ImageIcon,
  Link2,
  MessageSquareWarning,
  Monitor,
  MousePointerClick,
  RotateCcw,
  Smartphone,
  Tablet,
} from "lucide-react";

import {
  BooleanInput,
  FormSection,
  ImageUploadInput,
  ResourceFormModal,
  SelectInput,
  TextInput,
} from "@/components/admin";
import { fromDateTimeLocal, toDateTimeLocal } from "../cms-pages/cms-text";

type Variante = "desktop" | "tablet" | "mobile";

const textoOpcional = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : null;

const imagen = (value: unknown) => {
  const asset = (value ?? {}) as {
    src?: string;
    width?: number;
    height?: number;
  };
  // Sin fuente no hay imagen: se manda null para que la API no reciba un
  // objeto a medias, que su CHECK rechazaría.
  return asset.src ? { src: asset.src, width: asset.width, height: asset.height } : null;
};

const sanitizeCmsPopup = (data: Record<string, unknown>) => ({
  title: data.title,
  body: data.body,
  buttonLabel: textoOpcional(data.buttonLabel),
  buttonHref: textoOpcional(data.buttonHref),
  desktop: imagen(data.desktop),
  tablet: imagen(data.tablet),
  mobile: imagen(data.mobile),
  startsAt: fromDateTimeLocal(data.startsAt as string | null),
  endsAt: fromDateTimeLocal(data.endsAt as string | null),
  repeatAfterHours:
    data.repeatAfterHours === "" || data.repeatAfterHours == null
      ? null
      : Number(data.repeatAfterHours),
  isActive: data.isActive ?? true,
});

export default function CmsPopupFormModal({
  mode,
}: {
  mode: "create" | "edit";
}) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const translate = useTranslate();
  const isEdit = mode === "edit";
  const name = translate("resources.cms-popups.name", { _: "Aviso emergente" });

  return (
    <ResourceFormModal
      mode={mode}
      id={id}
      onClose={() => navigate("/cms-popups")}
      icon={<MessageSquareWarning className="h-5 w-5" />}
      title={translate(
        isEdit ? "shared.actions.edit_title" : "shared.actions.create_title",
        { name },
      )}
      subtitle={translate("cms-popups.form.subtitle", {
        _: "Se guarda como borrador: para que salga en la tienda hay que publicarlo.",
      })}
      transform={sanitizeCmsPopup}
    >
      <CamposDelAviso isEdit={isEdit} />
    </ResourceFormModal>
  );
}

function CamposDelAviso({ isEdit }: { isEdit: boolean }) {
  const translate = useTranslate();

  return (
    <>
      <TextInput
        source="title"
        label={translate("cms-popups.fields.title", { _: "Título" })}
        validate={[required(), maxLength(160)]}
        icon={<Heading />}
        helperText="cms-popups.form.hints.title"
      />

      <TextInput
        source="body"
        label={translate("cms-popups.fields.body", { _: "Texto" })}
        validate={[required(), maxLength(600)]}
        multiline
        rows={3}
        icon={<AlignLeft />}
        helperText="cms-popups.form.hints.body"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          source="buttonLabel"
          label={translate("cms-popups.fields.buttonLabel", {
            _: "Texto del botón",
          })}
          validate={maxLength(60)}
          icon={<MousePointerClick />}
          helperText="cms-popups.form.hints.buttonLabel"
        />
        <TextInput
          source="buttonHref"
          label={translate("cms-popups.fields.buttonHref", {
            _: "A dónde lleva",
          })}
          validate={maxLength(300)}
          icon={<Link2 />}
          placeholder="/catalog"
          helperText="cms-popups.form.hints.buttonHref"
        />
      </div>

      <FormSection
        icon={<CalendarClock />}
        title={translate("cms-popups.form.schedule_title", {
          _: "Cuándo se ve",
        })}
        subtitle={translate("cms-popups.form.schedule_hint", {
          _: "Con fecha de fin se retira solo: nadie tiene que acordarse de apagarlo.",
        })}
        className="border-t pt-5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            source="startsAt"
            type="datetime-local"
            label={translate("cms-popups.fields.startsAt", { _: "Desde" })}
            icon={<CalendarClock />}
            format={toDateTimeLocal}
            helperText="cms-popups.form.hints.startsAt"
          />
          <TextInput
            source="endsAt"
            type="datetime-local"
            label={translate("cms-popups.fields.endsAt", { _: "Hasta" })}
            icon={<CalendarClock />}
            format={toDateTimeLocal}
            helperText="cms-popups.form.hints.endsAt"
          />
        </div>

        <SelectInput
          source="repeatAfterHours"
          label={translate("cms-popups.fields.repeatAfterHours", {
            _: "Si lo cierran, vuelve a salir",
          })}
          choices={[
            { id: 24, name: "cms-popups.repeat.day" },
            { id: 168, name: "cms-popups.repeat.week" },
          ]}
          emptyText="cms-popups.repeat.never"
          helperText="cms-popups.form.hints.repeatAfterHours"
        />
      </FormSection>

      <FormSection
        icon={<ImageIcon />}
        title={translate("cms-popups.form.images_title", { _: "Imagen" })}
        subtitle={translate("cms-popups.form.images_hint", {
          _: "Opcional, pero si pones una van las tres medidas: así no se recorta en el teléfono.",
        })}
        className="border-t pt-5"
      >
        <div className="grid gap-4">
          <CampoDeImagen
            variante="desktop"
            icono={<Monitor className="h-4 w-4 text-primary" />}
            medida="1200 x 500"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <CampoDeImagen
              variante="tablet"
              icono={<Tablet className="h-4 w-4 text-primary" />}
              medida="900 x 500"
            />
            <CampoDeImagen
              variante="mobile"
              icono={<Smartphone className="h-4 w-4 text-primary" />}
              medida="640 x 480"
            />
          </div>
        </div>
      </FormSection>

      <VistaPrevia />

      {isEdit && (
        <div className="border-t pt-5">
          <BooleanInput
            source="isActive"
            label={translate("list.fields.status")}
            defaultValue={true}
            helperText="cms-popups.form.hints.isActive"
          />
        </div>
      )}
    </>
  );
}

/**
 * Las medidas reales se leen del archivo cargado, igual que en los banners:
 * quien redacta no tiene por qué saber cuántos píxeles mide su imagen, y la
 * tienda las necesita para no servir la del escritorio a un teléfono.
 */
function CampoDeImagen({
  variante,
  icono,
  medida,
}: {
  variante: Variante;
  icono: ReactNode;
  medida: string;
}) {
  const translate = useTranslate();
  const { setValue } = useFormContext();
  const src = useWatch({ name: `${variante}.src` }) as string | undefined;
  const width = useWatch({ name: `${variante}.width` }) as number | undefined;
  const height = useWatch({ name: `${variante}.height` }) as number | undefined;

  useEffect(() => {
    if (!src) {
      setValue(`${variante}.width`, undefined);
      setValue(`${variante}.height`, undefined);
      return;
    }
    const image = new Image();
    image.onload = () => {
      setValue(`${variante}.width`, image.naturalWidth, { shouldDirty: true });
      setValue(`${variante}.height`, image.naturalHeight, {
        shouldDirty: true,
      });
    };
    image.src = src;
  }, [src, setValue, variante]);

  return (
    <div className="rounded-xl border border-border p-4">
      <ImageUploadInput
        source={`${variante}.src`}
        uploadPrefix="cms"
        label={
          <span className="flex items-center gap-2">
            {icono}
            {translate(`cms-popups.form.variants.${variante}`)}
          </span>
        }
        recommendedSize={medida}
      />
      <p className="mt-2 text-xs text-muted-foreground">
        {width && height ? `${width} x ${height} px` : ""}
      </p>
    </div>
  );
}

/**
 * Lo que verá quien entre, mientras se escribe.
 *
 * Es la misma composición que pinta la tienda —imagen arriba, título, texto y
 * botón—, para que nadie publique a ciegas. No es un iframe de la tienda: eso
 * ataría el panel a que la tienda esté levantada.
 */
function VistaPrevia() {
  const translate = useTranslate();
  const titulo = useWatch({ name: "title" }) as string | undefined;
  const texto = useWatch({ name: "body" }) as string | undefined;
  const boton = useWatch({ name: "buttonLabel" }) as string | undefined;
  const imagen = useWatch({ name: "desktop.src" }) as string | undefined;

  return (
    <FormSection
      icon={<RotateCcw />}
      title={translate("cms-popups.form.preview_title", {
        _: "Así lo verá quien entre",
      })}
      className="border-t pt-5"
    >
      <div className="flex justify-center rounded-xl bg-muted/60 p-6">
        <div className="w-80 overflow-hidden rounded-2xl bg-background shadow-lg">
          {imagen ? (
            <img src={imagen} alt="" className="h-32 w-full object-cover" />
          ) : (
            <div className="flex h-32 w-full items-center justify-center bg-primary/10">
              <ImageIcon className="h-7 w-7 text-primary/60" aria-hidden />
            </div>
          )}
          <div className="flex flex-col gap-2 p-5">
            <p className="text-base leading-tight font-bold text-foreground">
              {titulo ||
                translate("cms-popups.form.preview_title_empty", {
                  _: "El título del aviso",
                })}
            </p>
            <p className="text-sm text-muted-foreground">
              {texto ||
                translate("cms-popups.form.preview_body_empty", {
                  _: "El texto que lo acompaña.",
                })}
            </p>
            {boton ? (
              <span className="mt-1 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">
                {boton}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </FormSection>
  );
}
