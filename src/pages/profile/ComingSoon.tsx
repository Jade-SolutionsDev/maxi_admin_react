import type { LucideIcon } from "lucide-react";
import { useTranslate } from "ra-core";
import { Card, CardContent } from "@/components/ui/card";

export function ComingSoon({
  icon: Icon,
  titleKey,
  titleFallback,
  descriptionKey,
  descriptionFallback,
}: {
  icon: LucideIcon;
  titleKey: string;
  titleFallback: string;
  descriptionKey: string;
  descriptionFallback: string;
}) {
  const translate = useTranslate();
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon size={22} />
        </div>
        <div>
          <p className="font-medium text-foreground">
            {translate(titleKey, { _: titleFallback })}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {translate(descriptionKey, { _: descriptionFallback })}
          </p>
        </div>
        <span className="mt-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {translate("profile.coming_soon", { _: "Coming soon" })}
        </span>
      </CardContent>
    </Card>
  );
}
