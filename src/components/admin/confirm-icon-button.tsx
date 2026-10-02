import { useState } from "react";
import { useTranslate } from "ra-core";
import { AlertTriangle } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export const IconButton = ({
  onClick,
  label,
  className,
  children,
  disabled,
}: {
  onClick: () => void;
  label: string;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", className)}
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);


/**
 * Icon button that asks for confirmation before running its action — the
 * button-shaped counterpart to ConfirmToggleField. Destructive actions get the
 * warning glyph and a destructive CTA.
 */
export const ConfirmIconButton = ({
  icon,
  label,
  title,
  description,
  confirmLabel,
  onConfirm,
  destructive,
  disabled,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void | Promise<void>;
  destructive?: boolean;
  disabled?: boolean;
  className?: string;
}) => {
  const translate = useTranslate();
  const [open, setOpen] = useState(false);

  const handleConfirm = async () => {
    setOpen(false);
    await onConfirm();
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <IconButton
        label={label}
        className={className}
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        {icon}
      </IconButton>

      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader className="space-y-3">
          {destructive && (
            <div className="mx-auto sm:mx-0 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
          )}
          <AlertDialogTitle className="text-center sm:text-left text-lg">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center sm:text-left">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-end">
          <AlertDialogCancel disabled={disabled}>
            {translate("shared.actions.cancel", { _: "Cancel" })}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={disabled}
            className={cn(
              destructive && buttonVariants({ variant: "destructive" }),
            )}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
