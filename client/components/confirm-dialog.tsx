"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

export type ConfirmDialogType = "info" | "warning" | "danger" | "success";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmDialogType;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

const typeConfig = {
  info: {
    icon: Info,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    confirmVariant: "default" as const,
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-accent",
    iconBg: "bg-accent/10",
    confirmVariant: "default" as const,
  },
  danger: {
    icon: AlertCircle,
    iconColor: "text-destructive",
    iconBg: "bg-destructive/10",
    confirmVariant: "destructive" as const,
  },
  success: {
    icon: CheckCircle,
    iconColor: "text-accent",
    iconBg: "bg-accent/10",
    confirmVariant: "default" as const,
  },
};

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "info",
  onConfirm,
  onCancel,
  loading: externalLoading,
}: ConfirmDialogProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const loading = externalLoading ?? internalLoading;

  const config = typeConfig[type];
  const Icon = config.icon;

  // Reset internal loading when dialog closes
  useEffect(() => {
    if (!open) {
      setInternalLoading(false);
    }
  }, [open]);

  const handleConfirm = async () => {
    try {
      setInternalLoading(true);
      const result = onConfirm();

      // If the result is a Promise, wait for it
      if (result instanceof Promise) {
        await result;
      }

      // Close the dialog after successful confirmation
      onOpenChange(false);
    } catch (error) {
      console.error("Confirm action failed:", error);
      // Keep dialog open on error
    } finally {
      setInternalLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <div className="flex items-start gap-4 mb-2">
            <div
              className={`w-12 h-12 rounded-full ${config.iconBg} flex items-center justify-center shrink-0`}
            >
              <Icon className={`w-6 h-6 ${config.iconColor}`} />
            </div>
            <div className="flex-1 pt-1">
              <DialogTitle className="text-xl mb-2">{title}</DialogTitle>
              <DialogDescription className="text-base leading-relaxed">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="mt-6 gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
            className="sm:mr-2"
          >
            {cancelText}
          </Button>
          <Button
            // variant={config.confirmVariant || "default"}
            variant={"default"}
            onClick={handleConfirm}
            disabled={loading}
            className="min-w-[100px]"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
