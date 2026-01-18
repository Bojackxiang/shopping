import { MapPin, Edit3, Trash2, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAddress, useRemoveAddress } from "@/hooks";

export default function ShippingAddressView() {
  const { data, error, isLoading } = useAddress();
  const { removeAddress } = useRemoveAddress();

  // Helper function to format full address
  const formatAddress = (address: NonNullable<typeof data>[0]) => {
    const parts = [
      address.addressLine1,
      address.addressLine2,
      address.city,
      address.state,
      address.postalCode,
    ].filter(Boolean);
    return parts.join(", ");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Shipping Addresses
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your delivery addresses
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5 bg-accent text-foreground hover:bg-accent/90 "
        >
          <Plus className="w-4 h-4" />
          Add New
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
          <p className="text-sm text-destructive">
            Failed to load addresses. Please try again.
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && (!data || data.length === 0) && (
        <div className="bg-muted/30 rounded-lg p-12 text-center">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No addresses yet
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Add your first shipping address to get started
          </p>
          <Button size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            Add Address
          </Button>
        </div>
      )}

      {/* Address Grid */}
      {!isLoading && !error && data && data.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data.map((address) => (
            <div
              key={address.id}
              className="group relative bg-card border border-border rounded-lg p-6 hover:border-foreground/20 transition-colors"
            >
              {/* Default Badge */}
              {address.isDefault && (
                <div className="absolute top-4 right-4 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
                  Default
                </div>
              )}

              {/* Address Content */}
              <div className="space-y-4">
                {/* Name & Icon */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-foreground/70" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-foreground">
                      {address.fullName}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {address.phone}
                    </p>
                  </div>
                </div>

                {/* Full Address */}
                <div className="pl-13">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {formatAddress(address)}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    {address.country}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pl-13 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAddress(address)}
                    className="h-8 text-xs gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </Button>
                  {!address.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs ml-auto"
                    >
                      Set as Default
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
