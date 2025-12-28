import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'UNKNOWN';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const variants = {
    PENDING: 'bg-warning/10 text-warning border-warning/20',
    PROCESSING: 'bg-info/10 text-info border-info/20',
    SHIPPED: 'bg-primary/10 text-primary border-primary/20',
    DELIVERED: 'bg-success/10 text-success border-success/20',
    CANCELLED: 'bg-muted text-muted-foreground border-border',
    REFUNDED: 'bg-destructive/10 text-destructive border-destructive/20',
    UNKNOWN: 'bg-secondary/10 text-secondary border-secondary/20'
  };

  return (
    <Badge variant='outline' className={cn(variants[status], className)}>
      {status}
    </Badge>
  );
}
