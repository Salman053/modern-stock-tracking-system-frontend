"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, CreditCard, User, Building } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useFetch } from "@/hooks/use-fetch";
import { server_base_url } from "@/constant/server-constants";
import { CustomerDue, IDuePayments } from "@/types";
import ReusablePopover from "../shared/ReusablePopover";
import { useModalState } from "@/hooks/use-modal-state";
import { useMutation } from "@/hooks/use-mutation";
import { useEffect, useState } from "react";
import { PaymentForm } from "../shared/payment-form";
import Overlay from "../shared/Overlay";
import { toast } from "sonner";
import { ConfirmationDialog } from "../shared/confirmation-dialog";

export interface DuePayment {
  id: number;
  description: string;
  payment_date: string;
  user_id: number;
  branch_id: number;
  due_type: string;
  due_id: number;
  amount: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  branch_name: string;
}

interface DuePaymentsTableProps {
  due_id: number;
  showHeader?: boolean;
  className?: string;
  advance_paid: string;
  dueData: CustomerDue;

  onDeleteSuccess: () => void;
}

export default function DuePaymentsTable({
  dueData,
  advance_paid,
  due_id,
  showHeader = true,
  className,
  onDeleteSuccess,
}: DuePaymentsTableProps) {
  const { data, error, loading, refetch } = useFetch<{
    success: boolean;
    message: string;
    timestamp: string;
    data: DuePayment[];
  }>(`${server_base_url}/due-payments/?due_id=${due_id}`, {
    credentials: "include",
    auto: true,
  });

  const [selectedRecord, setSelectedRecord] = useState<DuePayment | null>(null);

  // Delete mutation
  const { mutate: deletePayment } = useMutation(
    selectedRecord?.id
      ? `${server_base_url}/due-payments/${selectedRecord.id}`
      : "",
    {
      method: "DELETE",

      onSuccess: () => {
        toast.success("Payment deleted successfully");
        refetch();
        onDeleteSuccess();
        closeModal("isDeleteModalOpen");
        setSelectedRecord(null);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete payment");
      },
    }
  );

  const { closeModal, openModal, modalState } = useModalState({
    isDeleteModalOpen: false,
    isEditModelOpen: false,
  });
  const payments: any = data?.data || [];

  // Calculate total
  const totalAmount = payments.reduce((sum: Number, payment: IDuePayments) => {
    return Number(sum) + Number(payment.amount);
  }, 0);

  // Format currency
  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 2,
    }).format(numAmount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy");
    } catch {
      return dateString;
    }
  };

  // Get payment method badge
  const getPaymentMethodBadge = (method: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "outline" | "destructive"
    > = {
      cash: "default",
      card: "secondary",
      bank_transfer: "outline",
      cheque: "outline",
      online: "secondary",
    };

    return (
      <Badge variant={variants[method] || "outline"} className="capitalize">
        {method.replace("_", " ")}
      </Badge>
    );
  };

  // Handle delete confirmation
  const handleDelete = async (password?: string) => {
    if (selectedRecord) {
      await deletePayment({
        admin_password: password,
      });
    }
  };

  // Refresh data when modal closes
  useEffect(() => {
    if (!modalState.isEditModelOpen && !modalState.isDeleteModalOpen) {
      refetch();
    }
  }, [modalState.isEditModelOpen, modalState.isDeleteModalOpen, refetch]);

  if (loading) {
    return (
      <Card className={className}>
        {showHeader && (
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>Loading payment records...</CardDescription>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-destructive">
            Error Loading Payments
          </CardTitle>
          <CardDescription>
            {error.message || "Failed to load payment history"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <p className="text-muted-foreground">
              Unable to load payment records. Please try again.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (payments.length === 0) {
    return (
      <Card className={className}>
        {showHeader && (
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>No payments recorded yet</CardDescription>
          </CardHeader>
        )}
        <CardContent>
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No Payments Found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              No payment records available for this due.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        {showHeader && (
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>
              {payments.length} payment{payments.length !== 1 ? "s" : ""}{" "}
              recorded • Total: {formatCurrency(totalAmount)}
            </CardDescription>
          </CardHeader>
        )}
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Description</TableHead>
                  {Number(dueData.remaining_amount) >
                    Number(dueData.total_amount) && (
                    <TableHead>Action</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment: IDuePayments) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">#{payment.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {formatDate(payment.payment_date)}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell>
                      {getPaymentMethodBadge(payment.payment_method)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="h-3 w-3 text-muted-foreground" />
                        {payment.branch_id}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-muted-foreground" />
                        {payment.created_at}
                      </div>
                    </TableCell>
                    <TableCell
                      className="max-w-[200px] truncate"
                      title={payment.description ?? ""}
                    >
                      {payment.description}
                    </TableCell>
                    {Number(dueData.total_amount) >
                      Number(dueData.remaining_amount) && (
                      <TableCell>
                        <ReusablePopover
                          actions={[
                            // {
                            //   label: "Edit",
                            //   onClick: () => {
                            //     setSelectedRecord(payment as any);
                            //     openModal("isEditModelOpen");
                            //     toast.warning(
                            //       "Please carefully read the instruction before doing any action"
                            //     );
                            //   },
                            //   variant: "outline",
                            // },
                            {
                              label: "Delete",
                              onClick: () => {
                                setSelectedRecord(payment as any);
                                openModal("isDeleteModalOpen");
                                toast.warning(
                                  "Please carefully read the instruction before doing any action"
                                );
                              },
                              variant: "destructive",
                            },
                          ]}
                        />
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border bg-card p-4">
              <div className="text-sm font-medium text-muted-foreground">
                Total Payments
              </div>
              <div className="text-2xl font-bold">{payments.length}</div>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="text-sm font-medium text-muted-foreground">
                Total Amount
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalAmount + Number(advance_paid))}
              </div>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="text-sm font-medium text-muted-foreground">
                Average Payment
              </div>
              <div className="text-2xl font-bold">
                {formatCurrency(totalAmount / payments.length)}
              </div>
            </div>
          </div>

          {}
          <div className="mt-6">
            <h4 className="mb-3 font-medium">Payment Methods Summary</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(
                payments.reduce((acc: any, payment: IDuePayments) => {
                  acc[payment?.payment_method] =
                    (acc[payment.payment_method] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([method, count]) => (
                <Badge key={method} variant="outline" className="px-3 py-1">
                  {method.replace("_", " ")}: {count as any}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Overlay
        contentClassName="min-w-[90vw] md:min-w-[500px] max-w-[95vw]"
        isOpen={modalState.isEditModelOpen}
        onClose={() => {
          closeModal("isEditModelOpen");
          setSelectedRecord(null);
        }}
      >
        {selectedRecord && (
          <PaymentForm
            onSuccess={() => {
              setSelectedRecord(null);
              refetch();
            }}
            dueData={dueData as any}
            mode="edit"
            initialData={{
              id: selectedRecord.id.toString(),
              amount: Number(selectedRecord.amount),
              description: selectedRecord.description || "",
              payment_date: selectedRecord.payment_date,
              payment_method: selectedRecord.payment_method as any,
            }}
          />
        )}
      </Overlay>
      <ConfirmationDialog
        open={modalState.isDeleteModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeModal("isDeleteModalOpen");
            setSelectedRecord(null);
          }
        }}
        title="Delete Payment"
        description={
          <div className="space-y-2">
            <p>Are you sure you want to delete this payment?</p>
            {selectedRecord && (
              <div className="rounded-md bg-muted p-3 text-sm">
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span className="font-medium">
                    {formatDate(selectedRecord.payment_date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-medium text-destructive">
                    {formatCurrency(selectedRecord.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Method:</span>
                  <span className="font-medium capitalize">
                    {selectedRecord.payment_method.replace("_", " ")}
                  </span>
                </div>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              This action will update the due balance and cannot be undone.
            </p>
          </div>
        }
        onConfirm={handleDelete}
        requiresPassword
        passwordLabel="Enter your admin password to confirm deletion"
        variant="destructive"
        confirmText="Delete Payment"
        cancelText="Cancel"
      />
    </>
  );
}

// Compact version for smaller spaces
export function DuePaymentsCompact({ due_id }: { due_id: number }) {
  const { data, loading } = useFetch<{
    success: boolean;
    message: string;
    timestamp: string;
    data: DuePayment[];
  }>(`${server_base_url}/due-payments/?due_id=${due_id}`, {
    credentials: "include",
    auto: true,
  });

  const payments: any = data?.data || [];
  const totalAmount = payments.reduce(
    (sum: number, payment: IDuePayments) => sum + Number(payment.amount),
    0
  );

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  return (
    <div className="text-sm">
      <div className="font-medium">Payment History</div>
      <div className="text-muted-foreground">
        {Array(payments).length} payment
        {Array(payments).length !== 1 ? "s" : ""} •{" "}
        {new Intl.NumberFormat("en-PK", {
          style: "currency",
          currency: "PKR",
          minimumFractionDigits: 2,
        }).format(totalAmount)}
      </div>
    </div>
  );
}
