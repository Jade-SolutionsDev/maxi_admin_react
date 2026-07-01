import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReactNode } from "react";

interface EntityFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function EntityFormModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className = "sm:max-w-xl p-0 gap-0 overflow-hidden",
}: EntityFormModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={className}>
        <DialogHeader className="px-6 py-4 border-b">
          <div className="space-y-1">
            <DialogTitle className="text-xl">{title}</DialogTitle>
            {description && (
              <DialogDescription className="text-sm text-muted-foreground">
                {description}
              </DialogDescription>
            )}
          </div>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
