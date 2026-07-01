import { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    User,
    Phone,
    Building2,
    Camera,
    AlertCircle,
    CheckCircle2,
    Upload,
    X,
    Lock,
    LogOut,
} from "lucide-react";
import { useAuth, useSignUp } from "@clerk/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Form validation schema
const formSchema = z
  .object({
    // email: z.string().email("Email inválido"),
    firstName: z.string().min(1, "El nombre es requerido"),
    lastName: z.string().min(1, "El apellido es requerido"),
    phone: z.string().optional(),
    businessName: z.string().optional(),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
    avatar: z.string().nullable().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof formSchema>;

/** Best-effort extraction of a human-readable message from a Clerk error. */
function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "message" in err) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }
  return fallback;
}

export default function Invitation() {
  const { isLoaded: isAuthLoaded, isSignedIn, signOut } = useAuth();
  const { signUp } = useSignUp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  // Get the ticket from the query params
  const ticket = searchParams.get("__clerk_ticket");

  // Initialize form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // email: "",
      firstName: "",
      lastName: "",
      phone: "",
      businessName: "",
      password: "",
      confirmPassword: "",
      avatar: null,
    },
  });

  // Block already-signed-in users: an invitation must be accepted as a brand
  // new session. Instead of redirecting to "/" (which is behind requireAuth and
  // would 401 on /api/auth/me for a non-backoffice session), gate them in place
  // and let them sign out to continue — keeping the ticket in the URL.
  if (isAuthLoaded && isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-[400px]">
          <CardContent className="pt-8 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-primary/10">
              <LogOut className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl mb-2">
              Ya tienes una sesión activa
            </CardTitle>
            <CardDescription className="text-sm mb-6">
              Para aceptar esta invitación necesitas cerrar la sesión actual y
              continuar como nuevo usuario.
            </CardDescription>
            <Button
              onClick={() =>
                void signOut({
                  redirectUrl: `${window.location.pathname}${window.location.search}`,
                })
              }
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar sesión y continuar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-[400px]">
          <CardContent className="pt-8 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-xl mb-2">Invitación Inválida</CardTitle>
            <CardDescription className="text-sm mb-6">
              No se encontró ticket de invitación. Contacta al administrador.
            </CardDescription>
            <Button onClick={() => navigate("/login")} className="w-full">
              Ir al Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
      const { error: ticketError } = await signUp.create({
        strategy: "ticket",
        ticket,
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
          getErrorMessage(ticketError, "No se pudo validar la invitación."),
        );
        return;
      }

      if (signUp.status !== "complete") {
        // The backoffice Clerk instance needs more than the ticket (e.g. a
        // password). Surface it instead of silently doing nothing.
        const missing = signUp.missingFields.join(", ");
        setError(
          missing
            ? `Faltan datos para completar el registro: ${missing}.`
            : `No se pudo completar el registro (estado: ${signUp.status}).`,
        );
        return;
      }

      // Activate the new session, then leave the invite page.
      await signUp.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            // Pending session tasks (e.g. org selection) are out of scope here.
            return;
          }
          navigate(decorateUrl("/"), { replace: true });
        },
      });

      setIsSuccess(true);
    } catch (err) {
      setError(
        getErrorMessage(err, "Error al activar la cuenta. Intenta nuevamente."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-[400px]">
          <CardContent className="pt-8 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-primary/10">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl mb-2">¡Cuenta Creada!</CardTitle>
            <CardDescription className="text-sm mb-2">
              Tu cuenta ha sido activada exitosamente.
            </CardDescription>
            <CardDescription className="text-sm mb-6">
              Recibirás tus credenciales de acceso por correo electrónico en
              breve.
            </CardDescription>
            <Button onClick={() => navigate("/login")} className="w-full">
              Ir al Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Form state
  return (
    <div className="min-h-screen flex items-start justify-center p-4 py-10 bg-background relative">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10 bg-primary" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10 bg-primary/70" />
      </div>

      <Card className="w-full max-w-[480px] relative z-10">
        <CardHeader className="text-center">
          {/* Logo */}
          <div className="flex flex-col items-center mb-4">
            <div className="flex items-center gap-0 mb-1">
              <span className="text-2xl font-extrabold tracking-tight text-foreground">
                maxi
              </span>
              <span className="text-2xl font-normal tracking-tight text-primary">
                Habana
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Panel de Proveedores
            </p>
          </div>

          <CardTitle className="text-xl">Aceptar Invitación</CardTitle>
          <CardDescription>
            Completa tus datos para activar tu cuenta
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-5 text-sm bg-destructive/10 text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  {form.watch("avatar") ? (
                    <div className="relative">
                      <Avatar className="w-24 h-24 border-2 border-primary">
                        <AvatarImage
                          src={form.watch("avatar")!}
                          alt="Avatar preview"
                        />
                        <AvatarFallback>
                          {form.watch("firstName")?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-1 -right-1 w-7 h-7 rounded-full"
                        onClick={handleRemoveAvatar}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-24 h-24 rounded-full flex flex-col items-center justify-center border-2 border-dashed hover:border-primary hover:bg-primary/5"
                      onClick={handleAvatarClick}
                    >
                      <Camera className="h-6 w-6 mb-1 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Foto
                      </span>
                    </Button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                {!form.watch("avatar") && (
                  <Button
                    type="button"
                    variant="link"
                    className="mt-2 text-sm text-primary hover:text-primary/80"
                    onClick={handleAvatarClick}
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    Subir foto de perfil (opcional)
                  </Button>
                )}
              </div>

              {/* Email - Read only */}
              {/* <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Correo electrónico{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          type="email"
                          readOnly
                          className="pl-10 bg-muted/50 cursor-not-allowed opacity-70"
                          disabled
                        />
                      </div>
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">
                      Este correo fue asignado en la invitación
                    </p>
                  </FormItem>
                )}
              /> */}

              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Nombre <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            placeholder="Juan"
                            className="pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Apellido <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            placeholder="Pérez"
                            className="pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          placeholder="+53 5 1234567"
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Business Name */}
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Negocio</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          placeholder="Mi Empresa S.A."
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Contraseña <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          type="password"
                          autoComplete="new-password"
                          placeholder="Mínimo 8 caracteres"
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm Password */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Confirmar contraseña{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          type="password"
                          autoComplete="new-password"
                          placeholder="Repite tu contraseña"
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-6"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-5 w-5 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                    Procesando...
                  </>
                ) : (
                  "Activar Cuenta"
                )}
              </Button>
            </form>
          </Form>

          {/* Footer */}
          <div className="mt-6 pt-5 text-center text-sm border-t text-muted-foreground">
            <p>
              ¿Ya tienes cuenta?{" "}
              <Button
                variant="link"
                className="p-0 h-auto font-medium text-primary hover:text-primary/80"
                onClick={() => navigate("/login")}
              >
                Inicia sesión
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
