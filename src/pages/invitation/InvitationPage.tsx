import { AlertCircle } from "lucide-react";
import { useTranslate } from "ra-core";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useInvitationFlow } from "./useInvitationFlow";
import {
  InvalidTicketScreen,
  SignedInGate,
  SignUpForm,
  SuccessScreen,
} from "./steps";

/**
 * Standalone invitation-acceptance page, rendered OUTSIDE <Admin> (see
 * App.tsx) so it stays reachable without authentication. All flow logic lives
 * in useInvitationFlow; the gate/status screens and sign-up form in steps.tsx.
 */
export default function InvitationPage() {
  const flow = useInvitationFlow();
  const translate = useTranslate();

  // Block already-signed-in users: an invitation must be accepted as a brand
  // new session. Instead of redirecting to "/" (which is behind requireAuth and
  // would 401 on /api/auth/me for a non-backoffice session), gate them in place
  // and let them sign out to continue — keeping the ticket in the URL.
  // Suppressed while submitting: onSubmit briefly activates the session to mint
  // a mirror token, and we must not flash this gate during that window.
  if (flow.isAuthLoaded && flow.isSignedIn && !flow.isSubmitting) {
    return <SignedInGate flow={flow} />;
  }

  if (!flow.ticket) {
    return <InvalidTicketScreen flow={flow} />;
  }

  // Success state
  if (flow.isSuccess) {
    return <SuccessScreen flow={flow} />;
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
              {translate("invitation.brand_tagline")}
            </p>
          </div>

          <CardTitle className="text-xl">
            {translate("invitation.title")}
          </CardTitle>
          <CardDescription>{translate("invitation.subtitle")}</CardDescription>
        </CardHeader>

        <CardContent>
          {/* Error */}
          {flow.error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-5 text-sm bg-destructive/10 text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {flow.error}
            </div>
          )}

          <SignUpForm flow={flow} />

          {/* Footer */}
          <div className="mt-6 pt-5 text-center text-sm border-t text-muted-foreground">
            <p>
              {translate("invitation.footer.have_account")}{" "}
              <Button
                variant="link"
                className="p-0 h-auto font-medium text-primary hover:text-primary/80"
                onClick={() => flow.navigate("/login")}
              >
                {translate("invitation.footer.sign_in")}
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
