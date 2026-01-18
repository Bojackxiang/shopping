"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import ConfirmDialog, { ConfirmDialogType } from "@/components/confirm-dialog";

interface ConfirmDialogOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmDialogType;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ConfirmDialogContextType {
  showConfirmDialog: (options: ConfirmDialogOptions) => void;
  hideConfirmDialog: () => void;
}

const ConfirmDialogContext = createContext<
  ConfirmDialogContextType | undefined
>(undefined);

interface ConfirmDialogProviderProps {
  children: ReactNode;
}

export function ConfirmDialogProvider({
  children,
}: ConfirmDialogProviderProps) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmDialogOptions | null>(null);

  const showConfirmDialog = useCallback((options: ConfirmDialogOptions) => {
    setOptions(options);
    setOpen(true);
  }, []);

  const hideConfirmDialog = useCallback(() => {
    setOpen(false);
  }, []);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Clear options after animation completes
      setTimeout(() => {
        setOptions(null);
      }, 200);
    }
  };

  return (
    <ConfirmDialogContext.Provider
      value={{ showConfirmDialog, hideConfirmDialog }}
    >
      {children}
      {options && (
        <ConfirmDialog
          open={open}
          onOpenChange={handleOpenChange}
          title={options.title}
          description={options.description}
          confirmText={options.confirmText}
          cancelText={options.cancelText}
          type={options.type}
          onConfirm={options.onConfirm}
          onCancel={options.onCancel}
        />
      )}
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirmDialogContext() {
  const context = useContext(ConfirmDialogContext);
  if (context === undefined) {
    throw new Error(
      "useConfirmDialogContext must be used within a ConfirmDialogProvider",
    );
  }
  return context;
}
