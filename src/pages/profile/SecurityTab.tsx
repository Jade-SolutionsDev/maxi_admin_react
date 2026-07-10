import { useState } from "react";
import { useNotify, useTranslate } from "ra-core";
import { useUser } from "@clerk/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { clerkErrorMessage } from "./clerkError";

const MIN_LENGTH = 8;

export function SecurityTab() {
  const translate = useTranslate();
  const notify = useNotify();
  const { user, isLoaded } = useUser();

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  if (!isLoaded || !user) return null;

  // Clerk requires the current password only when the account already has one.
  const requiresCurrent = user.passwordEnabled;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next.length < MIN_LENGTH) {
      notify("profile.security.too_short", {
        type: "warning",
        messageArgs: { _: `Password must be at least ${MIN_LENGTH} characters` },
      });
      return;
    }
    if (next !== confirm) {
      notify("profile.security.mismatch", {
        type: "warning",
        messageArgs: { _: "Passwords do not match" },
      });
      return;
    }

    setSaving(true);
    try {
      await user.updatePassword({
        newPassword: next,
        currentPassword: requiresCurrent ? current : undefined,
        signOutOfOtherSessions: true,
      });
      setCurrent("");
      setNext("");
      setConfirm("");
      notify("profile.security.success", {
        type: "success",
        messageArgs: { _: "Password updated" },
      });
    } catch (error) {
      notify(clerkErrorMessage(error, "Could not update your password"), {
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {translate("profile.security.title", { _: "Security" })}
        </CardTitle>
        <CardDescription>
          {translate("profile.security.subtitle", {
            _: "Change your password. You will stay signed in on this device.",
          })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="max-w-sm space-y-4">
          {requiresCurrent && (
            <div className="space-y-1.5">
              <Label htmlFor="current-password">
                {translate("profile.security.current", { _: "Current password" })}
              </Label>
              <PasswordInput
                id="current-password"
                autoComplete="current-password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                required
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="new-password">
              {translate("profile.security.new", { _: "New password" })}
            </Label>
            <PasswordInput
              id="new-password"
              autoComplete="new-password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              minLength={MIN_LENGTH}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">
              {translate("profile.security.confirm", { _: "Confirm password" })}
            </Label>
            <PasswordInput
              id="confirm-password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              minLength={MIN_LENGTH}
              required
            />
          </div>
          <Button type="submit" disabled={saving}>
            {saving
              ? translate("profile.saving", { _: "Saving…" })
              : translate("profile.security.submit", { _: "Update password" })}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
