import { ShieldX } from "lucide-react";
import { Translate } from "ra-core";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

/**
 * Shown when the current user lacks permission for a resource — wired as the
 * `<Admin accessDenied>` page (Resource routes) and via <RequireAccess> for the
 * custom routes.
 */
export default function AccessDenied() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-[50vh] flex-1 flex-col items-center justify-center gap-2 text-center">
      <ShieldX className="h-16 w-16 text-muted-foreground" />
      <h1 className="text-2xl font-semibold">
        <Translate i18nKey="accessDenied.title" />
      </h1>
      <p className="max-w-xl text-muted-foreground">
        <Translate i18nKey="accessDenied.message" />
      </p>
      <Button className="mt-3 cursor-pointer" onClick={() => navigate("/")}>
        <Translate i18nKey="accessDenied.back" />
      </Button>
    </div>
  );
}
