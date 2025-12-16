import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface PaymentStatusBadgeProps {
  isFullyPaid: number;
  paidAmount: number;
  totalAmount: number;
}

export default function PaymentStatusBadge({ 
  isFullyPaid, 
  paidAmount, 
  totalAmount 
}: PaymentStatusBadgeProps) {
  const percentagePaid = (paidAmount / totalAmount) * 100;
  const remainingAmount = totalAmount - paidAmount;

  if (isFullyPaid === 1) {
    return (
      <Badge variant="default" className="gap-1">
        <CheckCircle className="h-3 w-3" />
        Paid
      </Badge>
    );
  }

  if (paidAmount === 0) {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertCircle className="h-3 w-3" />
        Unpaid
      </Badge>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Badge variant="secondary" className="gap-1">
        <Clock className="h-3 w-3" />
        Partial ({percentagePaid.toFixed(0)}%)
      </Badge>
      <span className="text-xs text-muted-foreground">
        Due: RS. {remainingAmount.toLocaleString()}
      </span>
    </div>
  );
}