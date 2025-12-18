// components/receipt-print-modal.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Printer,
  Download,
  FileText,
  CheckCircle,
  Smartphone,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

interface ReceiptPrintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saleData: any;
}

export function ReceiptPrintModal({
  open,
  onOpenChange,
  saleData,
}: ReceiptPrintModalProps) {
  const handlePrint = (type: "browser" | "pdf" | "download") => {
    // Call your print function with the specified type
    if (typeof window !== "undefined") {
      // Dynamically import the print function
      import("../../business-logic/create-sale-print").then((module) => {
        module.printSaleReceipt(saleData, type);
      });
    }
    // onOpenChange(false);
  };

  if (!saleData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Sale Created Successfully!
          </DialogTitle>
          <DialogDescription>
            Receipt #{saleData.id} has been created. Choose how you'd like to
            print or download the receipt.
          </DialogDescription>
        </DialogHeader>

        {/* Sale Summary */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Sale #{saleData.id}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(saleData.sale_date), "PPP p")}
              </p>
            </div>
            <Badge variant={saleData.is_fully_paid ? "default" : "secondary"}>
              {saleData.is_fully_paid ? "Paid" : "Partial"}
            </Badge>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Customer</p>
              <p className="font-medium">{saleData.customer_id || "Walk-in"}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Total</p>
              <p className="font-medium text-lg">
                Rs. {saleData.total_amount?.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Items</span>
            <span>{saleData.items?.length || 0} items</span>
          </div>
        </Card>

        {/* Print Options */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-auto py-6 flex-col gap-2"
            onClick={() => handlePrint("browser")}
          >
            <Printer className="h-8 w-8 mb-1" />
            <span className="font-medium">Print Now</span>
            <span className="text-xs text-muted-foreground">
              Browser print dialog
            </span>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-6 flex-col gap-2"
            onClick={() => handlePrint("download")}
          >
            <Download className="h-8 w-8 mb-1" />
            <span className="font-medium">Download PDF</span>
            <span className="text-xs text-muted-foreground">
              Save as PDF file
            </span>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-6 flex-col gap-2 col-span-2"
            onClick={() => handlePrint("pdf")}
          >
            <FileText className="h-8 w-8 mb-1" />
            <span className="font-medium">View PDF</span>
            <span className="text-xs text-muted-foreground">
              Open in new tab
            </span>
          </Button>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground"
          >
            Skip for now
          </Button>
          <div className="flex gap-2">
            <Button
              variant="default"
              onClick={() => handlePrint("browser")}
              className="gap-2"
            >
              <Printer className="h-4 w-4" />
              Print Receipt
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
