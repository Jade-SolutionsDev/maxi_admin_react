import { useContext } from "react";
import { Translate, UserMenuContext } from "ra-core";
import { useClerk } from "@clerk/react";
import { UserCog } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

/**
 * Top-bar user-menu entry that opens Clerk's user profile (account settings)
 * modal. Rendered as a child of the admin-kit `<UserMenu>`, so it appears
 * between the identity header and the logout action.
 */
export function ProfileMenuItem() {
  const { openUserProfile } = useClerk();
  const userMenu = useContext(UserMenuContext);

  return (
    <DropdownMenuItem
      className="cursor-pointer"
      onClick={() => {
        userMenu?.onClose?.();
        openUserProfile();
      }}
    >
      <UserCog />
      <Translate i18nKey="app.user.profile" />
    </DropdownMenuItem>
  );
}
