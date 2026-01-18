import { ChevronRight, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { linkToProductDetail } from "@/utils";
import { useCustomerOrder } from "@/hooks";
import Pagination from "./pagination";
import { OrderStatus } from "@prisma/client";

interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  items: number;
  canConfirm: boolean;
  image: string;
}

interface OrdersContentProps {
  orders: Order[];
  onConfirmDelivery: (orderId: string) => void;
}

export default function OrdersContent({
  orders,
  onConfirmDelivery,
}: OrdersContentProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const {
    orders: newOrders,
    pagination,
    isLoading,
  } = useCustomerOrder({
    page: currentPage,
    limit: 10,
  });

  console.log(newOrders);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-light text-foreground">My Orders</h2>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading orders...</div>
        </div>
      ) : newOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg text-muted-foreground">No orders found</p>
          <p className="text-sm text-muted-foreground mt-2">
            Start shopping to see your orders here
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {newOrders.map((order) => (
              <div
                key={order.id}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-foreground">
                        Order #{order.id.slice(0, 8)}
                      </div>
                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        className="text-sm text-accent hover:text-accent/80 transition-colors flex items-center font-medium"
                      >
                        View Details{" "}
                        <ChevronRight className="w-4 h-4 inline ml-1" />
                      </Link>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center space-x-4 mt-1">
                      <span>
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span>Items: {order.order_items.length}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  {/* Product Images Preview */}
                  <div className="flex items-center -space-x-2">
                    {order.order_items.slice(0, 3).map((item, index) => (
                      <div
                        key={item.id}
                        className="relative w-14 h-14 rounded-lg overflow-hidden bg-secondary border-2 border-card shadow-sm transition-transform hover:scale-110 hover:z-10"
                        style={{ zIndex: 3 - index }}
                      >
                        {item.productImage ? (
                          <img
                            src={item.productImage}
                            alt={item.productName || "Product"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                            No Image
                          </div>
                        )}
                      </div>
                    ))}
                    {order.order_items.length > 3 && (
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-accent/10 border-2 border-card flex items-center justify-center">
                        <span className="text-xs font-medium text-accent">
                          +{order.order_items.length - 3}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground mb-1">
                        Total
                      </div>
                      <div className="font-semibold text-lg text-foreground">
                        ${order.total.toFixed(2)}
                      </div>
                    </div>
                    <div
                      className={`text-sm px-3 py-1.5 rounded-full text-center ${
                        order.status === OrderStatus.DELIVERED
                          ? "bg-accent/10 text-accent"
                          : order.status === OrderStatus.SHIPPED
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </div>
                    {/* {order.status === OrderStatus.SHIPPED && (
                      <Button
                        onClick={() => onConfirmDelivery(order.id)}
                        size="sm"
                        className="bg-accent text-accent-foreground hover:bg-accent/90"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Confirm
                      </Button>
                    )} */}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <Pagination
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}
