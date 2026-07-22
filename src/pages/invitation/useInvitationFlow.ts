import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth, useSignUp } from "@clerk/react";
import { useTranslate } from "ra-core";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Form validation schema. Built per-locale so zod messages come from the
// translation catalogs (es is the default locale).
const makeFormSchema = (translate: (key: string) => string) =>
  z
    .object({
      // email: z.string().email("Email inválido"),
      firstName: z
        .string()
        .min(1, translate("invitation.validation.first_name_required")),
      lastName: z
        .string()
        .min(1, translate("invitation.validation.last_name_required")),
      phone: z.string().optional(),
      businessName: z.string().optional(),
      password: z.string().min(8, translate("invitation.validation.password_min")),
      confirmPassword: z
        .string()
        .min(1, translate("invitation.validation.confirm_password_required")),
      avatar: z.string().nullable().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: translate("invitation.validation.passwords_mismatch"),
      path: ["confirmPassword"],
    });

type FormData = z.infer<ReturnType<typeof makeFormSchema>>;

/**
 * Best-effort extraction of a human-readable message from a Clerk error.
 *
 * Deliberately NOT pages/login/clerkErrors.getErrorMessage: that version adds
 * network-failure detection and Clerk `errors[]` unwrapping, which would
 * change the messages this page shows today.
 */
function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "message" in err) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }
  return fallback;
}

/**
 * All state and Clerk logic for the invitation-acceptance flow:
 * signed-in gate → ticket check → sign-up form → success. The screens in
 * steps.tsx are purely presentational.
 */
export function useInvitationFlow() {
  const { isLoaded: isAuthLoaded, isSignedIn, signOut } = useAuth();
  const { signUp } = useSignUp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const translate = useTranslate();
  const formSchema = useMemo(() => makeFormSchema(translate), [translate]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  // Get the ticket and any prefilled profile data from the query params.
  // The backend appends firstName/lastName (set by the admin) to the Clerk
  // invitation redirect URL so the user sees them pre-filled and can edit them.
  const ticket = searchParams.get("__clerk_ticket");
  const prefilledFirstName = searchParams.get("firstName") ?? "";
  const prefilledLastName = searchParams.get("lastName") ?? "";

  // Initialize form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // email: "",
      firstName: prefilledFirstName,
      lastName: prefilledLastName,
      phone: "",
      businessName: "",
      password: "",
      confirmPassword: "",
      avatar: null,
    },
  });

  // Sign out while keeping the ticket in the URL (see SignedInGate).
  const handleSignOut = () =>
    void signOut({
      redirectUrl: `${window.location.pathname}${window.location.search}`,
    });

  // The file <input> and its ref live in SignUpForm: returning a ref from the
  // hook makes the react-compiler lint treat every `flow.*` read as a ref read.
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue("avatar", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    form.setValue("avatar", null);
  };

  const onSubmit = async (data: FormData) => {
    setError("");
    setIsSubmitting(true);

    try {
      // Consume the Clerk invitation ticket and create the account in one call:
      // - password sets the user's credentials (the instance requires it);
      // - firstName/lastName are read by the backoffice `user.created` webhook;
      // - phone/businessName ride along in unsafeMetadata, which Clerk copies
      //   onto the user and the webhook persists to the local User record.
      // The form (and thus onSubmit) only renders when a ticket is present —
      // InvitationPage shows InvalidTicketScreen otherwise.
      const { error: ticketError } = await signUp.create({
        strategy: "ticket",
        ticket: ticket!,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        unsafeMetadata: {
          phone: data.phone ?? "",
          businessName: data.businessName ?? "",
        },
      });

      if (ticketError) {
        setError(
          getErrorMessage(ticketError, translate("invitation.errors.ticket_invalid")),
        );
        return;
      }

      if (signUp.status !== "complete") {
        // The backoffice Clerk instance needs more than the ticket (e.g. a
        // password). Surface it instead of silently doing nothing.
        const missing = signUp.missingFields.join(", ");
        setError(
          missing
            ? translate("invitation.errors.missing_fields", { fields: missing })
            : translate("invitation.errors.incomplete_status", {
                status: signUp.status,
              }),
        );
        return;
      }

      // Account created — the backoffice webhook provisions a DISABLED local
      // user, pending admin approval. Do NOT activate a session: signing the
      // new user in would immediately bounce off the auth wall (/api/auth/me →
      // 401 → logout). Show the pending-approval screen instead; the user signs
      // in normally once an admin approves them.
      setIsSuccess(true);
    } catch (err) {
      setError(
        getErrorMessage(err, translate("invitation.errors.generic")),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isAuthLoaded,
    isSignedIn,
    ticket,
    navigate,
    form,
    isSubmitting,
    isSuccess,
    error,
    handleSignOut,
    handleFileChange,
    handleRemoveAvatar,
    onSubmit,
  };
}

export type InvitationFlow = ReturnType<typeof useInvitationFlow>;
