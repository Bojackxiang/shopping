import { useCallback } from "react";
import { useConfirmDialogContext } from "@/provider/confirm-dialog-provider";
import { ConfirmDialogType } from "@/components/confirm-dialog";

interface UseConfirmDialogOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmDialogType;
  onCancel?: () => void;
}

export function useConfirmDialog() {
  const { showConfirmDialog, hideConfirmDialog } = useConfirmDialogContext();

  /**
   * Show a confirmation dialog and wait for user action
   * @param options - Configuration for the confirmation dialog
   * @param onConfirm - Async function to execute when user confirms
   * @returns A function to trigger the confirmation dialog
   */
  const confirm = useCallback(
    (
      options: UseConfirmDialogOptions,
      onConfirm: () => void | Promise<void>,
    ) => {
      showConfirmDialog({
        ...options,
        onConfirm,
      });
    },
    [showConfirmDialog],
  );

  /**
   * Helper method for info-type confirmations
   */
  const confirmInfo = useCallback(
    (
      title: string,
      description: string,
      onConfirm: () => void | Promise<void>,
    ) => {
      confirm({ title, description, type: "info" }, onConfirm);
    },
    [confirm],
  );

  /**
   * Helper method for warning-type confirmations
   */
  const confirmWarning = useCallback(
    (
      title: string,
      description: string,
      onConfirm: () => void | Promise<void>,
    ) => {
      confirm({ title, description, type: "warning" }, onConfirm);
    },
    [confirm],
  );

  /**
   * Helper method for danger/destructive confirmations
   */
  const confirmDanger = useCallback(
    (
      title: string,
      description: string,
      onConfirm: () => void | Promise<void>,
    ) => {
      confirm(
        {
          title,
          description,
          type: "danger",
          confirmText: "Delete",
        },
        onConfirm,
      );
    },
    [confirm],
  );

  /**
   * Helper method for success-type confirmations
   */
  const confirmSuccess = useCallback(
    (
      title: string,
      description: string,
      onConfirm: () => void | Promise<void>,
    ) => {
      confirm({ title, description, type: "success" }, onConfirm);
    },
    [confirm],
  );

  return {
    confirm,
    confirmInfo,
    confirmWarning,
    confirmDanger,
    confirmSuccess,
    hide: hideConfirmDialog,
  };
}
