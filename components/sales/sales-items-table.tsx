import { SaleItem } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface SalesItemsTableProps {
  items: SaleItem[];
}

export default function SalesItemsTable({ items }: SalesItemsTableProps) {
  const totalItems = items.reduce((sum, item) => sum + Number(item.quantity), 0);
  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-sm text-muted-foreground">
                      ID: {item.product_id}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary">{item.quantity}</Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  Rs. {item.unit_price.toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-bold">
                  Rs. {item.total.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={item.available_stock > 100 ? "outline" : "destructive"}
                  >
                    {item.available_stock.toLocaleString()}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center text-sm">
        <div className="text-muted-foreground">
          Total Items: <span className="font-semibold">{totalItems}</span>
        </div>
        <div className="font-bold">
          Subtotal: ${totalAmount.toLocaleString()}
        </div>
      </div>
    </div>
  );
}