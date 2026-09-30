export type InstructionType = "bank" | "qr" | "link" | "crypto" | "cash";

export interface PaymentMethodFormState {
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

interface EditablePaymentMethod {
  label: string;
  description: string | null;
  instructions: Record<string, unknown> | null;
}

export const emptyPaymentMethodForm = (
  method?: EditablePaymentMethod,
): PaymentMethodFormState => {
  const instructions = method?.instructions;

  return {
    label: method?.label ?? "",
    description: method?.description ?? "",
    type: (instructions?.type as InstructionType) ?? "bank",
    bankName: (instructions?.bankName as string) ?? "",
    accountHolder: (instructions?.accountHolder as string) ?? "",
    accountNumber: (instructions?.accountNumber as string) ?? "",
    cardNumber: (instructions?.cardNumber as string) ?? "",
    imageUrl: (instructions?.imageUrl as string) ?? "",
    url: (instructions?.url as string) ?? "",
    address: (instructions?.address as string) ?? "",
    network: (instructions?.network as string) ?? "",
    asset: (instructions?.asset as string) ?? "",
    memo: (instructions?.memo as string) ?? "",
    note: (instructions?.note as string) ?? "",
  };
};

export const buildInstructions = (form: PaymentMethodFormState) => {
  const note = form.note.trim() || undefined;

  switch (form.type) {
    case "bank":
      return {
        type: "bank" as const,
        bankName: form.bankName.trim(),
        accountHolder: form.accountHolder.trim() || undefined,
        accountNumber: form.accountNumber.trim() || undefined,
        cardNumber: form.cardNumber.trim() || undefined,
        note,
      };
    case "qr":
      return { type: "qr" as const, imageUrl: form.imageUrl.trim(), note };
    case "link":
      return { type: "link" as const, url: form.url.trim(), note };
    case "crypto":
      return {
        type: "crypto" as const,
        address: form.address.trim(),
        network: form.network.trim(),
        asset: form.asset.trim() || undefined,
        memo: form.memo.trim() || undefined,
        note,
      };
    case "cash":
      return { type: "cash" as const, note };
  }
};

export const isPaymentMethodFormIncomplete = (
  form: PaymentMethodFormState,
  uploading = false,
): boolean =>
  !form.label.trim() ||
  (form.type === "bank" &&
    (!form.bankName.trim() ||
      (!form.accountNumber.trim() && !form.cardNumber.trim()))) ||
  (form.type === "qr" && (!form.imageUrl.trim() || uploading)) ||
  (form.type === "link" && !form.url.trim()) ||
  (form.type === "crypto" &&
    (!form.address.trim() || !form.network.trim())) ||
  (form.type === "cash" && !form.note.trim());
