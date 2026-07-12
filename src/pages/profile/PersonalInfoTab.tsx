import { useState } from "react";
import { useGetIdentity, useNotify, useTranslate } from "ra-core";
import { useUser } from "@clerk/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clerkErrorMessage } from "./clerkError";

export function PersonalInfoTab() {
  const translate = useTranslate();
  const notify = useNotify();
  const { data: identity } = useGetIdentity();
  const { user, isLoaded } = useUser();

  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!isLoaded || !user) return null;

  // null local state = "unedited", fall back to the Clerk value.
  const first = firstName ?? user.firstName ?? "";
  const last = lastName ?? user.lastName ?? "";
  const email = user.primaryEmailAddress?.emailAddress ?? identity?.email ?? "";
  const role = identity?.role;
  const initials = `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  const dirty =
    first !== (user.firstName ?? "") || last !== (user.lastName ?? "");

  const handleSave = async () => {
    setSaving(true);
    try {
      await user.update({ firstName: first, lastName: last });
      notify("profile.personal.saved", {
        type: "success",
        messageArgs: { _: "Profile updated" },
      });
    } catch (error) {
      notify(clerkErrorMessage(error, "Could not update your profile"), {
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
          {translate("profile.personal.title", { _: "Personal information" })}
        </CardTitle>
        <CardDescription>
          {translate("profile.personal.subtitle", {
            _: "Update your name and review your account details.",
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.imageUrl} alt={initials || "Avatar"} />
            <AvatarFallback className="bg-muted text-muted-foreground text-lg font-medium">
              {initials || <span>·</span>}
            </AvatarFallback>
          </Avatar>
          {role && (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {translate(`users.roles.${role}`, { _: role })}
            </span>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="profile-firstName">
              {translate("profile.personal.firstName", { _: "First name" })}
            </Label>
            <Input
              id="profile-firstName"
              value={first}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profile-lastName">
              {translate("profile.personal.lastName", { _: "Last name" })}
            </Label>
            <Input
              id="profile-lastName"
              value={last}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="profile-email">
            {translate("profile.personal.email", { _: "Email" })}
          </Label>
          <Input id="profile-email" value={email} disabled readOnly />
          <p className="text-xs text-muted-foreground">
            {translate("profile.personal.email_hint", {
              _: "Contact an administrator to change your email.",
            })}
          </p>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={!dirty || saving}>
            {saving
              ? translate("profile.saving", { _: "Saving…" })
              : translate("profile.save", { _: "Save changes" })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
