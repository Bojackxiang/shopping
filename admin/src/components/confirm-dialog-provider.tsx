'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { ConfirmDialog } from './confirm-dialog';

interface ConfirmOptions {
  title?: string;
  description?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

interface ConfirmDialogContextType {
  confirm: (
    onConfirm: () => Promise<void> | void,
    options?: ConfirmOptions
  ) => void;
}

const ConfirmDialogContext = createContext<
  ConfirmDialogContextType | undefined
>(undefined);

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    (() => Promise<void> | void) | null
  >(null);
  const [options, setOptions] = useState<ConfirmOptions>({});

  const confirm = (
    onConfirm: () => Promise<void> | void,
    opts: ConfirmOptions = {}
  ) => {
    setConfirmAction(() => onConfirm);
    setOptions(opts);
    setOpen(true);
  };

  const handleConfirm = async () => {
    if (confirmAction) {
      await confirmAction();
    }
  };

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={options.title}
        description={options.description}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        variant={options.variant}
        onConfirm={handleConfirm}
      />
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirmDialog() {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error(
      'useConfirmDialog must be used within ConfirmDialogProvider'
    );
  }
  return context;
}
