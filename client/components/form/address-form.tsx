"use client";

import { useSaveAddress } from "@/hooks/use-address";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AddressBasicInfo } from "@/repo/address.repo";
import { toast } from "sonner";

// Zod validation schema
const addressFormSchema = z.object({
  fullName: z.string().min(1, "Full name is required").trim(),
  phone: z.string().min(1, "Phone number is required").trim(),
  addressLine1: z.string().min(1, "Address is required").trim(),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required").trim(),
  state: z.string().optional(),
  postalCode: z.string().min(1, "Postal code is required").trim(),
  country: z.string().min(1, "Country is required").trim(),
  isDefault: z.boolean().default(false),
});

type AddressFormData = z.infer<typeof addressFormSchema>;

interface AddressFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address?: AddressBasicInfo | null;
  onSuccess?: () => void;
}

const AddressForm = ({
  open,
  onOpenChange,
  address,
  onSuccess,
}: AddressFormProps) => {
  const { saveAddress, isLoading } = useSaveAddress();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "China",
      isDefault: false,
    },
  });

  // Reset form when dialog opens or address changes
  useEffect(() => {
    if (open) {
      if (address) {
        reset({
          fullName: address.fullName,
          phone: address.phone,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2 || "",
          city: address.city,
          state: address.state || "",
          postalCode: address.postalCode,
          country: address.country,
          isDefault: address.isDefault,
        });
      } else {
        reset({
          fullName: "",
          phone: "",
          addressLine1: "",
          addressLine2: "",
          city: "",
          state: "",
          postalCode: "",
          country: "China",
          isDefault: false,
        });
      }
    }
  }, [address, open, reset]);

  const onSubmit = async (data: AddressFormData) => {
    try {
      await saveAddress({
        ...data,
        id: address?.id, // Include ID if editing
      });

      toast.success(
        address ? "Address updated successfully" : "Address added successfully",
      );
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to save address");
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {address ? "Edit Address" : "Add New Address"}
          </DialogTitle>
          <DialogDescription>
            {address
              ? "Update your address information below."
              : "Fill in the form to add a new address."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4">
            {/* Full Name */}
            <div className="space-y-2">
              <label
                htmlFor="fullName"
                className="text-sm font-medium text-foreground"
              >
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="fullName"
                {...register("fullName")}
                placeholder="Enter your full name"
                aria-invalid={errors.fullName ? "true" : "false"}
              />
              {errors.fullName && (
                <p className="text-sm text-red-500">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="text-sm font-medium text-foreground"
              >
                Phone Number <span className="text-red-500">*</span>
              </label>
              <Input
                id="phone"
                type="tel"
                {...register("phone")}
                placeholder="Enter your phone number"
                aria-invalid={errors.phone ? "true" : "false"}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            {/* Address Line 1 */}
            <div className="space-y-2">
              <label
                htmlFor="addressLine1"
                className="text-sm font-medium text-foreground"
              >
                Address Line 1 <span className="text-red-500">*</span>
              </label>
              <Input
                id="addressLine1"
                {...register("addressLine1")}
                placeholder="Street address, P.O. box"
                aria-invalid={errors.addressLine1 ? "true" : "false"}
              />
              {errors.addressLine1 && (
                <p className="text-sm text-red-500">
                  {errors.addressLine1.message}
                </p>
              )}
            </div>

            {/* Address Line 2 */}
            <div className="space-y-2">
              <label
                htmlFor="addressLine2"
                className="text-sm font-medium text-foreground"
              >
                Address Line 2
              </label>
              <Input
                id="addressLine2"
                {...register("addressLine2")}
                placeholder="Apartment, suite, unit, building, floor, etc."
              />
            </div>

            {/* City, State, Postal Code */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="city"
                  className="text-sm font-medium text-foreground"
                >
                  City <span className="text-red-500">*</span>
                </label>
                <Input
                  id="city"
                  {...register("city")}
                  placeholder="City"
                  aria-invalid={errors.city ? "true" : "false"}
                />
                {errors.city && (
                  <p className="text-sm text-red-500">{errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="state"
                  className="text-sm font-medium text-foreground"
                >
                  State/Province
                </label>
                <Input id="state" {...register("state")} placeholder="State" />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="postalCode"
                  className="text-sm font-medium text-foreground"
                >
                  Postal Code <span className="text-red-500">*</span>
                </label>
                <Input
                  id="postalCode"
                  {...register("postalCode")}
                  placeholder="Postal code"
                  aria-invalid={errors.postalCode ? "true" : "false"}
                />
                {errors.postalCode && (
                  <p className="text-sm text-red-500">
                    {errors.postalCode.message}
                  </p>
                )}
              </div>
            </div>

            {/* Country */}
            <div className="space-y-2">
              <label
                htmlFor="country"
                className="text-sm font-medium text-foreground"
              >
                Country <span className="text-red-500">*</span>
              </label>
              <Input
                id="country"
                {...register("country")}
                placeholder="Country"
                aria-invalid={errors.country ? "true" : "false"}
              />
              {errors.country && (
                <p className="text-sm text-red-500">{errors.country.message}</p>
              )}
            </div>

            {/* Set as Default */}
            <div className="flex items-center space-x-2">
              <input
                id="isDefault"
                type="checkbox"
                {...register("isDefault")}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label
                htmlFor="isDefault"
                className="text-sm font-medium text-foreground"
              >
                Set as default address
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="bg-muted hover:bg-muted/80"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-accent text-primary hover:bg-accent/90"
            >
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddressForm;

export const useAddressForm = () => {
  const [open, setOpen] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<AddressBasicInfo | null>(
    null,
  );

  const openDialog = (address?: AddressBasicInfo) => {
    setCurrentAddress(address || null);
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setCurrentAddress(null);
  };

  return {
    open,
    currentAddress,
    openDialog,
    closeDialog,
    setOpen,
  };
};

export { type AddressFormProps };
