import { useState } from "react";
import { useCreate, useNotify, useRefresh, useTranslate, useUpdate } from "ra-core";
import { Bitcoin, Landmark, Link2, QrCode } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { PaymentMethodRecord } from "./PaymentMethodsPage";

export type InstructionType = "bank" | "qr" | "link" | "crypto";

const TYPES: {
  value: InstructionType;
  icon: React.ComponentType<{ size?: number }>;
  labelKey: string;
  fallback: string;
}[] = [
  { value: "bank", icon: Landmark, labelKey: "payment-methods.types.bank", fallback: "Transferencia" },
  { value: "qr", icon: QrCode, labelKey: "payment-methods.types.qr", fallback: "Código QR" },
  { value: "link", icon: Link2, labelKey: "payment-methods.types.link", fallback: "Enlace" },
  { value: "crypto", icon: Bitcoin, labelKey: "payment-methods.types.crypto", fallback: "Cripto" },
];

interface FormState {
  label: string;
  description: string;
  type: InstructionType;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  cardNumber: string;
  imageUrl: string;
  url: string;
  address: string;
  network: string;
  asset: string;
  memo: string;
  note: string;
}

const emptyForm = (method?: PaymentMethodRecord): FormState => {
  const i = method?.instructions;
  return {
    label: method?.label ?? "",
    description: method?.description ?? "",
    type: (i?.type as InstructionType) ?? "bank",
    bankName: (i?.bankName as string) ?? "",
    accountHolder: (i?.accountHolder as string) ?? "",
    accountNumber: (i?.accountNumber as string) ?? "",
    cardNumber: (i?.cardNumber as string) ?? "",
    imageUrl: (i?.imageUrl as string) ?? "",
    url: (i?.url as string) ?? "",
    address: (i?.address as string) ?? "",
    network: (i?.network as string) ?? "",
    asset: (i?.asset as string) ?? "",
    memo: (i?.memo as string) ?? "",
    note: (i?.note as string) ?? "",
  };
};

const buildInstructions = (form: FormState) => {
  const note = form.note.trim() || undefined;
  switch (form.type) {
    case "bank":
      return {
        type: "bank",
        bankName: form.bankName.trim(),
        accountHolder: form.accountHolder.trim() || undefined,
        accountNumber: form.accountNumber.trim() || undefined,
        cardNumber: form.cardNumber.trim() || undefined,
        note,
      };
    case "qr":
      return { type: "qr", imageUrl: form.imageUrl.trim(), note };
    case "link":
      return { type: "link", url: form.url.trim(), note };
    case "crypto":
      return {
        type: "crypto",
        address: form.address.trim(),
        network: form.network.trim(),
        asset: form.asset.trim() || undefined,
        memo: form.memo.trim() || undefined,
        note,
      };
  }
};

interface PaymentMethodFormDialogProps {
  open: boolean;
  method?: PaymentMethodRecord;
  onClose: () => void;
}

/**
 * Alta y edición de un método manual. El tipo manda qué hace falta: la red es
 * obligatoria en cripto porque mandar por la equivocada pierde los fondos.
 */
export function PaymentMethodFormDialog({
  open,
  method,
  onClose,
}: PaymentMethodFormDialogProps) {
  const translate = useTranslate();
  const notify = useNotify();
  const refresh = useRefresh();
  const [create, { isPending: creating }] = useCreate();
  const [update, { isPending: updating }] = useUpdate();
  const [form, setForm] = useState<FormState>(() => emptyForm(method));

  const isEdit = Boolean(method);
  const isPending = creating || updating;
  const set = (patch: Partial<FormState>) =>
    setForm((current) => ({ ...current, ...patch }));

  const missing =
    !form.label.trim() ||
    (form.type === "bank" &&
      (!form.bankName.trim() ||
        (!form.accountNumber.trim() && !form.cardNumber.trim()))) ||
    (form.type === "qr" && !form.imageUrl.trim()) ||
    (form.type === "link" && !form.url.trim()) ||
    (form.type === "crypto" && (!form.address.trim() || !form.network.trim()));

  const onError = (error: unknown) => {
    const backendMessage = (error as { body?: { error?: { message?: string } } })
      ?.body?.error?.message;
    notify(backendMessage ?? translate("shared.actions.error"), {
      type: "error",
    });
  };

  const submit = () => {
    const data = {
      label: form.label.trim(),
      description: form.description.trim() || null,
      instructions: buildInstructions(form),
    };
    const onSuccess = () => {
      notify(
        isEdit ? "shared.notifications.updated" : "shared.notifications.created",
        { type: "info" },
      );
      refresh();
      onClose();
    };

    if (isEdit && method) {
      update(
        "payment-methods",
        { id: method.id, data, previousData: method },
        { onSuccess, onError },
      );
      return;
    }
    create("payment-methods", { data }, { onSuccess, onError });
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {translate(
              isEdit
                ? "payment-methods.form.edit_title"
                : "payment-methods.form.create_title",
              { _: isEdit ? "Editar método de pago" : "Nuevo método de pago" },
            )}
          </DialogTitle>
          <DialogDescription>
            {translate("payment-methods.form.subtitle", {
              _: "El cliente verá estas instrucciones y alguien confirmará el pago a mano.",
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="method-label">
              {translate("payment-methods.form.label", { _: "Nombre" })}
            </Label>
            <Input
              id="method-label"
              value={form.label}
              onChange={(event) => set({ label: event.target.value })}
              placeholder="Transfermóvil"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="method-description">
              {translate("payment-methods.form.description", {
                _: "Descripción",
              })}
            </Label>
            <Textarea
              id="method-description"
              value={form.description}
              onChange={(event) => set({ description: event.target.value })}
              placeholder="Paga desde la app y envíanos el número de la transacción."
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>
              {translate("payment-methods.form.type", { _: "Tipo de pago" })}
            </Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {TYPES.map(({ value, icon: Icon, labelKey, fallback }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => set({ type: value })}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-lg border p-3 text-xs transition-colors",
                    form.type === value
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border text-muted-foreground hover:bg-muted",
                  )}
                >
                  <Icon size={18} />
                  {translate(labelKey, { _: fallback })}
                </button>
              ))}
            </div>
          </div>

          {form.type === "bank" && (
            <>
              <Field
                id="bank-name"
                label={translate("payment-methods.form.bank", { _: "Banco" })}
                value={form.bankName}
                onChange={(bankName) => set({ bankName })}
              />
              <Field
                id="bank-holder"
                label={translate("payment-methods.form.holder", {
                  _: "Titular",
                })}
                value={form.accountHolder}
                onChange={(accountHolder) => set({ accountHolder })}
              />
              <Field
                id="bank-account"
                label={translate("payment-methods.form.account", {
                  _: "Número de cuenta",
                })}
                value={form.accountNumber}
                onChange={(accountNumber) => set({ accountNumber })}
              />
              <Field
                id="bank-card"
                label={translate("payment-methods.form.card", {
                  _: "Número de tarjeta",
                })}
                value={form.cardNumber}
                onChange={(cardNumber) => set({ cardNumber })}
              />
            </>
          )}

          {form.type === "qr" && (
            <Field
              id="qr-url"
              label={translate("payment-methods.form.qr_url", {
                _: "URL de la imagen del QR",
              })}
              value={form.imageUrl}
              onChange={(imageUrl) => set({ imageUrl })}
              placeholder="https://…/qr.png"
            />
          )}

          {form.type === "link" && (
            <Field
              id="link-url"
              label={translate("payment-methods.form.link_url", {
                _: "Enlace de pago",
              })}
              value={form.url}
              onChange={(url) => set({ url })}
              placeholder="https://…"
            />
          )}

          {form.type === "crypto" && (
            <>
              <Field
                id="crypto-address"
                label={translate("payment-methods.form.address", {
                  _: "Dirección de la wallet",
                })}
                value={form.address}
                onChange={(address) => set({ address })}
              />
              <Field
                id="crypto-network"
                label={translate("payment-methods.form.network", {
                  _: "Red (obligatoria)",
                })}
                value={form.network}
                onChange={(network) => set({ network })}
                placeholder="BEP20, TRC20, ERC20…"
                helper={translate("payment-methods.form.network_hint", {
                  _: "Enviar por la red equivocada pierde los fondos.",
                })}
              />
              <Field
                id="crypto-asset"
                label={translate("payment-methods.form.asset", { _: "Moneda" })}
                value={form.asset}
                onChange={(asset) => set({ asset })}
                placeholder="USDT"
              />
              <Field
                id="crypto-memo"
                label={translate("payment-methods.form.memo", {
                  _: "Memo / Tag",
                })}
                value={form.memo}
                onChange={(memo) => set({ memo })}
                helper={translate("payment-methods.form.memo_hint", {
                  _: "Sólo si tu dirección lo pide: sin él el pago se traba.",
                })}
              />
            </>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="method-note">
              {translate("payment-methods.form.note", {
                _: "Nota para el cliente",
              })}
            </Label>
            <Textarea
              id="method-note"
              value={form.note}
              onChange={(event) => set({ note: event.target.value })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {translate("shared.actions.cancel", { _: "Cancelar" })}
          </Button>
          <Button
            type="button"
            disabled={missing || isPending}
            onClick={submit}
          >
            {translate("shared.actions.save", { _: "Guardar" })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  helper,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helper?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
    </div>
  );
}
