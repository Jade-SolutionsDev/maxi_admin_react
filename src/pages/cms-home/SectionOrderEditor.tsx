import { useTranslate } from "ra-core";
import { useNavigate } from "react-router-dom";
import { ArrowDown, ArrowUp, ExternalLink, Rows3 } from "lucide-react";

import { FormSection } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  moveItem,
  toggleSectionVisibility,
  type HomeSection,
} from "./home-layout";

interface SectionOrderEditorProps {
  sections: HomeSection[];
  onChange: (sections: HomeSection[]) => void;
  disabled: boolean;
}

export function SectionOrderEditor({
  sections,
  onChange,
  disabled,
}: SectionOrderEditorProps) {
  const translate = useTranslate();
  const navigate = useNavigate();

  return (
    <FormSection
      icon={<Rows3 />}
      title={translate("cms-home.sections.title")}
      subtitle={translate("cms-home.sections.hint")}
    >
      <ol className="flex flex-col gap-2">
        {sections.map((section, index) => {
          const name = translate(`cms-home.sections.names.${section.key}`);
          const switchId = `home-section-${section.key}`;
          return (
            <li
              key={section.key}
              className={cn(
                "flex flex-wrap items-center gap-3 rounded-lg border border-border px-3 py-2",
                !section.isVisible && "bg-muted/40",
              )}
            >
              <span className="w-6 text-center text-sm tabular-nums text-muted-foreground">
                {index + 1}
              </span>
              <span
                className={cn(
                  "min-w-0 flex-1 truncate text-sm font-medium",
                  !section.isVisible && "text-muted-foreground line-through",
                )}
              >
                {name}
              </span>
              {section.key === "hero" && (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto px-0"
                  onClick={() => navigate("/cms-banners")}
                >
                  {translate("cms-home.sections.banners_link")}
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              )}
              <label
                htmlFor={switchId}
                className="flex items-center gap-2 text-xs text-muted-foreground"
              >
                <Switch
                  id={switchId}
                  checked={section.isVisible}
                  disabled={disabled}
                  onCheckedChange={() =>
                    onChange(toggleSectionVisibility(sections, section.key))
                  }
                />
                {translate("cms-home.sections.visible")}
              </label>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={disabled || index === 0}
                  aria-label={translate("cms-home.actions.move_up", { name })}
                  onClick={() => onChange(moveItem(sections, index, -1))}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={disabled || index === sections.length - 1}
                  aria-label={translate("cms-home.actions.move_down", { name })}
                  onClick={() => onChange(moveItem(sections, index, 1))}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
            </li>
          );
        })}
      </ol>
    </FormSection>
  );
}
