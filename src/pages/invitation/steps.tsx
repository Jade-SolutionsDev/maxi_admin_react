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
import { PasswordInput } from "@/components/ui/password-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useRef } from "react";
import { useTranslate } from "ra-core";
import type { InvitationFlow } from "./useInvitationFlow";

/**
 * Blocks already-signed-in users: an invitation must be accepted as a brand
 * new session. Instead of redirecting to "/" (which is behind requireAuth and
 * would 401 on /api/auth/me for a non-backoffice session), gate them in place
 * and let them sign out to continue — keeping the ticket in the URL.
 */
export function SignedInGate({ flow }: { flow: InvitationFlow }) {
  const translate = useTranslate();
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-[400px]">
        <CardContent className="pt-8 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-primary/10">
            <LogOut className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl mb-2">
            {translate("invitation.signed_in.title")}
          </CardTitle>
          <CardDescription className="text-sm mb-6">
            {translate("invitation.signed_in.description")}
          </CardDescription>
          <Button onClick={flow.handleSignOut} className="w-full">
            <LogOut className="h-4 w-4 mr-2" />
            {translate("invitation.signed_in.action")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/** No `__clerk_ticket` in the URL: the invitation link is unusable. */
export function InvalidTicketScreen({ flow }: { flow: InvitationFlow }) {
  const translate = useTranslate();
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-[400px]">
        <CardContent className="pt-8 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-xl mb-2">
            {translate("invitation.invalid.title")}
          </CardTitle>
          <CardDescription className="text-sm mb-6">
            {translate("invitation.invalid.description")}
          </CardDescription>
          <Button onClick={() => flow.navigate("/login")} className="w-full">
            {translate("invitation.go_to_login")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/** Success state */
export function SuccessScreen({ flow }: { flow: InvitationFlow }) {
  const translate = useTranslate();
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-[400px]">
        <CardContent className="pt-8 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-primary/10">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl mb-2">
            {translate("invitation.success.title")}
          </CardTitle>
          <CardDescription className="text-sm mb-2">
            {translate("invitation.success.description")}
          </CardDescription>
          <CardDescription className="text-sm mb-6">
            {translate("invitation.success.description_credentials")}
          </CardDescription>
          <Button onClick={() => flow.navigate("/login")} className="w-full">
            {translate("invitation.go_to_login")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/** The sign-up form that consumes the invitation ticket. */
export function SignUpForm({ flow }: { flow: InvitationFlow }) {
  const { form } = flow;
  const translate = useTranslate();
  // Local so the flow hook stays ref-free (react-compiler lint).
  const fileInputRef = useRef<HTMLInputElement>(null);
  const openFilePicker = () => fileInputRef.current?.click();
  const removeAvatar = () => {
    flow.handleRemoveAvatar();
    // Clear the input so re-selecting the same file fires onChange again.
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(flow.onSubmit)} className="space-y-4">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            {form.watch("avatar") ? (
              <div className="relative">
                <Avatar className="w-24 h-24 border-2 border-primary">
                  <AvatarImage
                    src={form.watch("avatar")!}
                    alt={translate("invitation.form.avatar_preview")}
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
                  onClick={removeAvatar}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="w-24 h-24 rounded-full flex flex-col items-center justify-center border-2 border-dashed hover:border-primary hover:bg-primary/5"
                onClick={openFilePicker}
              >
                <Camera className="h-6 w-6 mb-1 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {translate("invitation.form.avatar")}
                </span>
              </Button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={flow.handleFileChange}
              className="hidden"
            />
          </div>
          {!form.watch("avatar") && (
            <Button
              type="button"
              variant="link"
              className="mt-2 text-sm text-primary hover:text-primary/80"
              onClick={openFilePicker}
            >
              <Upload className="h-3 w-3 mr-1" />
              {translate("invitation.form.avatar_upload")}
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
                  {translate("invitation.form.first_name")}{" "}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      placeholder={translate("invitation.form.first_name_placeholder")}
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
                  {translate("invitation.form.last_name")}{" "}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      placeholder={translate("invitation.form.last_name_placeholder")}
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
              <FormLabel>{translate("invitation.form.phone")}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...field}
                    placeholder={translate("invitation.form.phone_placeholder")}
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
              <FormLabel>{translate("invitation.form.business_name")}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...field}
                    placeholder={translate("invitation.form.business_name_placeholder")}
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
                {translate("invitation.form.password")}{" "}
                <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 z-10 h-4 w-4 text-muted-foreground" />
                  <PasswordInput
                    {...field}
                    autoComplete="new-password"
                    placeholder={translate("invitation.form.password_placeholder")}
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
                {translate("invitation.form.confirm_password")}{" "}
                <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 z-10 h-4 w-4 text-muted-foreground" />
                  <PasswordInput
                    {...field}
                    autoComplete="new-password"
                    placeholder={translate("invitation.form.confirm_password_placeholder")}
                    className="pl-10"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Clerk mounts its Smart CAPTCHA widget here during signUp.create.
            Without this element it silently falls back to Invisible CAPTCHA. */}
        <div id="clerk-captcha" className="flex justify-center empty:mt-0 mt-2" />

        <Button
          type="submit"
          disabled={flow.isSubmitting}
          className="w-full mt-6"
          size="lg"
        >
          {flow.isSubmitting ? (
            <>
              <div className="h-5 w-5 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
              {translate("invitation.form.submitting")}
            </>
          ) : (
            translate("invitation.form.submit")
          )}
        </Button>
      </form>
    </Form>
  );
}
