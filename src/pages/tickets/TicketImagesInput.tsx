import { ImagePlus, Loader2, X } from "lucide-react";
import { useInput, useNotify, useTranslate } from "ra-core";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  ACCEPTED_IMAGE_LABEL,
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGE_SIZE_LABEL,
  uploadImage,
} from "@/lib/uploads";
import { MAX_IMAGENES } from "./ticketStatus";

/**
 * Las fotos de la incidencia.
 *
 * El `ImageUploadInput` de la casa guarda **una** dirección en el campo, y una
 * incidencia interna casi siempre necesita dos o tres: la pantalla del error,
 * el cable suelto, la etiqueta que salió en blanco. Así que esto guarda una
 * lista, con el mismo contrato: el valor del formulario son direcciones ya
 * subidas, nunca ficheros, para que viaje por el dataProvider sin tocar nada.
 *
 * Los límites —formatos, tamaño— se leen de `@/lib/uploads`, que es donde los
 * declara el backend, para no tener dos cifras que puedan separarse.
 */
export function TicketImagesInput(props: {
  source: string;
  label?: string;
  helperText?: string;
}) {
  const { field } = useInput(props);
  const notify = useNotify();
  const translate = useTranslate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);

  const imagenes = (field.value as string[] | undefined) ?? [];
  const lleno = imagenes.length >= MAX_IMAGENES;

  const anadir = async (ficheros: FileList | null) => {
    if (!ficheros?.length) return;

    // El hueco se calcula antes de subir nada: si alguien elige diez de golpe,
    // no se gastan diez subidas para descartar cuatro.
    const hueco = MAX_IMAGENES - imagenes.length;
    const elegidos = Array.from(ficheros).slice(0, hueco);
    if (ficheros.length > hueco) {
      notify(
        translate("tickets.imagenes.tope", {
          max: MAX_IMAGENES,
          _: `Caben ${MAX_IMAGENES} imágenes por ticket; las de más no se subieron.`,
        }),
        { type: "warning" },
      );
    }

    const validos = elegidos.filter((fichero) => {
      if (!ACCEPTED_IMAGE_TYPES.includes(fichero.type)) {
        notify("shared.upload.invalid_type", { type: "error" });
        return false;
      }
      if (fichero.size > MAX_IMAGE_SIZE_BYTES) {
        notify("shared.upload.too_large", {
          type: "error",
          messageArgs: { max: MAX_IMAGE_SIZE_LABEL },
        });
        return false;
      }
      return true;
    });
    if (!validos.length) return;

    setSubiendo(true);
    try {
      const resultados = await Promise.allSettled(
        validos.map((fichero) => uploadImage(fichero, "tickets")),
      );
      const subidas = resultados
        .filter(
          (r): r is PromiseFulfilledResult<string> => r.status === "fulfilled",
        )
        .map((r) => r.value);
      // Lo que sí subió se queda, aunque alguna fallara: perder tres fotos
      // porque la cuarta falló obligaría a repetirlo todo.
      if (subidas.length) field.onChange([...imagenes, ...subidas]);
      if (subidas.length < validos.length) {
        notify("shared.upload.failed", { type: "error" });
      }
    } finally {
      setSubiendo(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const quitar = (url: string) =>
    field.onChange(imagenes.filter((otra) => otra !== url));

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">
        {props.label ??
          translate("tickets.fields.images", { _: "Fotos de la incidencia" })}
      </p>

      {imagenes.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {imagenes.map((url) => (
            <li key={url} className="relative">
              <img
                src={url}
                alt=""
                className="h-20 w-20 rounded-md border border-border object-cover"
              />
              <button
                type="button"
                onClick={() => quitar(url)}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-background text-muted-foreground shadow ring-1 ring-border hover:text-foreground"
                aria-label={translate("tickets.imagenes.quitar", {
                  _: "Quitar esta imagen",
                })}
              >
                <X size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="sr-only"
        onChange={(e) => void anadir(e.target.files)}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={subiendo || lleno}
        onClick={() => inputRef.current?.click()}
      >
        {subiendo ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <ImagePlus size={16} />
        )}
        {translate("tickets.imagenes.anadir", { _: "Añadir fotos" })}
      </Button>

      <p className="text-xs text-muted-foreground">
        {lleno
          ? translate("tickets.imagenes.completo", {
              max: MAX_IMAGENES,
              _: `Ya hay ${MAX_IMAGENES} imágenes, el máximo por ticket.`,
            })
          : (props.helperText ??
            translate("tickets.imagenes.ayuda", {
              max: MAX_IMAGENES,
              formatos: ACCEPTED_IMAGE_LABEL,
              peso: MAX_IMAGE_SIZE_LABEL,
              _: `Hasta ${MAX_IMAGENES} imágenes · ${ACCEPTED_IMAGE_LABEL} · máx. ${MAX_IMAGE_SIZE_LABEL} cada una`,
            }))}
      </p>
    </div>
  );
}
