"use client";

import {
  fetchUserAddressesAction,
  removeUserAddressAction,
} from "@/app/actions";
import type { AddressBasicInfo } from "@/repo/address.repo";
import { useConfirmDialog } from "./use-confirm-dialog";
import { toast } from "sonner";
import useSWR from "swr";

export const useAddress = () => {
  const { data, error, isLoading, mutate } = useSWR<AddressBasicInfo[]>(
    "user-addresses",
    async () => {
      const result = await fetchUserAddressesAction();

      if (result.error) {
        throw new Error(result.error);
      }

      return result.data ?? [];
    },
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
};

export const useRemoveAddress = () => {
  const { confirmDanger } = useConfirmDialog();
  const { mutate } = useAddress();

  const removeAddress = (addressId: string) => {
    confirmDanger(
      "Delete Address",
      `Are you sure you want to delete this address? This action cannot be undone.`,
      async () => {
        const result = await removeUserAddressAction(addressId);

        if (result.error) {
          toast.error("Failed to delete address", {
            description: result.error,
          });
          throw new Error(result.error);
        }

        toast.success("Address deleted successfully");

        // Refresh the addresses list
        mutate();
      },
    );
  };

  return {
    removeAddress,
  };
};
