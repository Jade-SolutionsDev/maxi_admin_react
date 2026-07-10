import { useContext } from "react";
import { Translate, UserMenuContext } from "ra-core";
import { useNavigate } from "react-router-dom";
import { UserCog } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

/**
 * Top-bar user-menu entry that opens the in-app profile page. Rendered as a
 * child of the admin-kit `<UserMenu>`, so it appears between the identity header
 * and the logout action.
 */
export function ProfileMenuItem() {
  const navigate = useNavigate();
  const userMenu = useContext(UserMenuContext);

  return (
    <DropdownMenuItem
      className="cursor-pointer"
      onClick={() => {
        userMenu?.onClose?.();
        navigate("/perfil");
      }}
    >
      <UserCog />
      <Translate i18nKey="app.user.profile" />
    </DropdownMenuItem>
  );
}
