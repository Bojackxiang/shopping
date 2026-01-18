import { Package, ShoppingBag, Heart } from "lucide-react";
import Link from "next/link";
import { linkToProductDetail } from "@/utils";
import { useOverview } from "../hook";
import { useCustomer } from "@/hooks";

interface User {
  name: string;
  email: string;
  phone: string;
  homeAddress: string;
  avatar: string;
  memberSince: string;
  totalOrders: number;
  totalSpent: number;
}

interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  items: number;
  canConfirm: boolean;
  image: string;
}

interface Favorite {
  id: number;
  name: string;
  price: string;
  image: string;
  inStock: boolean;
}

interface OverviewContentProps {
  user: User;
  recentOrders: Order[];
  favoritesCount: number;
}

export default function OverviewContent({
  user,
  recentOrders,
  favoritesCount,
}: OverviewContentProps) {
  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
  } = useOverview();
  const {
    data: customerData,
    isLoading: customerLoading,
    error: customerError,
  } = useCustomer();

  // Format the member since date
  const memberSince = customerData?.createdAt
    ? new Date(customerData.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      })
    : user.memberSince;

  // Display name
  const displayName = customerData
    ? `${customerData.firstName || ""} ${customerData.lastName || ""}`.trim() ||
      customerData.username ||
      "User"
    : user.name;

  // Email
  const email = customerData?.email || user.email;

  // Avatar
  const avatar = customerData?.imageUrl || user.avatar;

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-r from-accent/10 via-accent/5 to-transparent border border-accent/20 rounded-2xl p-6">
        {customerLoading ? (
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-secondary animate-pulse" />
            <div className="space-y-2">
              <div className="h-6 w-32 bg-secondary animate-pulse rounded" />
              <div className="h-4 w-48 bg-secondary animate-pulse rounded" />
              <div className="h-3 w-40 bg-secondary animate-pulse rounded" />
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-secondary">
              <img
                src={avatar}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-2xl font-light text-foreground">
                {displayName}
              </h2>
              <p className="text-muted-foreground">{email}</p>
              <p className="text-sm text-muted-foreground">
                Member since: {memberSince}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <Package className="w-8 h-8 text-accent mx-auto mb-3" />
          <div className="text-2xl font-medium text-foreground">
            {ordersLoading ? (
              <div className="h-8 w-12 bg-secondary animate-pulse rounded mx-auto" />
            ) : (
              ordersData?.length || 0
            )}
          </div>
          <div className="text-sm text-muted-foreground">Total Orders</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <ShoppingBag className="w-8 h-8 text-accent mx-auto mb-3" />
          <div className="text-2xl font-medium text-foreground">
            {ordersLoading ? (
              <div className="h-8 w-16 bg-secondary animate-pulse rounded mx-auto" />
            ) : (
              `$${
                ordersData
                  ?.reduce((sum, order) => sum + order.total, 0)
                  .toFixed(2) || "0.00"
              }`
            )}
          </div>
          <div className="text-sm text-muted-foreground">Total Spent</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <Heart className="w-8 h-8 text-accent mx-auto mb-3" />
          <div className="text-2xl font-medium text-foreground">
            {favoritesCount}
          </div>
          <div className="text-sm text-muted-foreground">Favorite Items</div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-light text-foreground mb-4">
          Recent Orders
        </h3>
        {ordersLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-secondary animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-secondary animate-pulse rounded" />
                    <div className="h-3 w-32 bg-secondary animate-pulse rounded" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-16 bg-secondary animate-pulse rounded ml-auto" />
                  <div className="h-3 w-20 bg-secondary animate-pulse rounded ml-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : ordersData && ordersData.length > 0 ? (
          <div className="space-y-4">
            {ordersData.slice(0, 3).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary">
                    {order.order_items[0]?.productImage && (
                      <img
                        src={order.order_items[0].productImage}
                        alt="Product"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">
                      {order.orderNumber}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-foreground">
                    ${order.total.toFixed(2)}
                  </div>
                  <div className="text-sm text-accent">{order.status}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No orders yet
          </div>
        )}
      </div>
    </div>
  );
}
