"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  User,
  Phone,
  MapPin,
  Store,
  Package,
  Printer,
  ArrowLeft,
  XCircle,
  CreditCard,
  Clock,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useFetch } from "@/hooks/use-fetch";
import { Sale, SaleItem, CustomerDue } from "@/types";
import { server_base_url } from "@/constant/server-constants";
import SaleSummary from "@/components/sales/sales-summary";
import PaymentStatusBadge from "@/components/shared/payment-status-badge";
import SalesItemsTable from "@/components/sales/sales-items-table";
import { useModalState } from "@/hooks/use-modal-state";
import Overlay from "@/components/shared/Overlay";
import { PaymentForm } from "@/components/shared/payment-form";
import DuePaymentsTable from "@/components/sales/due-payments";

export default function SaleDetailsPage() {
  const params = useParams();
  const saleId = params.id;

  const { closeModal, openModal, modalState } = useModalState({
    isCustomerPaymentModalOpen: false,
  });

  const {
    data: dueResponse,
    error: dueError,
    loading: dueLoading,
    refetch: refetchDue,
  } = useFetch<{
    success: boolean;
    message: string;
    timestamp: string;
    data: CustomerDue;
  }>(`${server_base_url}/customer-dues?sale_id=${saleId}`, {
    credentials: "include",
    auto: true,
  });

  const {
    data: saleResponse,
    error: saleError,
    loading: saleLoading,
    refetch: refetchSale,
  } = useFetch<{
    success: boolean;
    message: string;
    timestamp: string;
    data: Sale;
  }>(`${server_base_url}/sales/${saleId}`, {
    credentials: "include",
    auto: true,
  });

  const {
    data: itemsResponse,
    error: itemsError,
    loading: itemsLoading,
    refetch: refetchItems,
  } = useFetch<{
    success: boolean;
    message: string;
    timestamp: string;
    data: SaleItem[];
  }>(`${server_base_url}/sales/items/${saleId}`, {
    credentials: "include",
    auto: true,
    cache: true,
  });

  const handlePrint = () => {
    window.print();
  };

  const handleRefetch = () => {
    refetchSale();
    refetchItems();
    refetchDue();
  };

  const handlePaymentSuccess = () => {
    closeModal("isCustomerPaymentModalOpen");
    handleRefetch();
  };

  const loading = saleLoading || itemsLoading || dueLoading;
  const error = saleError || itemsError || dueError;
  const saleData: any = saleResponse?.data;
  const saleItems = itemsResponse?.data || [];
  const customerDue: any = dueResponse?.data;

  // Format currency helper
  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 2,
    }).format(numAmount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-16 w-full max-w-md" />
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-64" />
                <Skeleton className="h-96" />
              </div>
              <Skeleton className="h-[600px]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !saleData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
        <Card className="border-destructive max-w-lg w-full">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Error Loading Sale
            </CardTitle>
            <CardDescription>
              {saleError?.message ||
                itemsError?.message ||
                dueError?.message ||
                "An error occurred"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Failed to load sale data. Please try again.</p>
            <div className="flex gap-3">
              <Button onClick={handleRefetch}>Retry</Button>
              <Button variant="outline" onClick={() => window.history.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOverdue =
    customerDue &&
    new Date(customerDue.due_date) < new Date() &&
    parseFloat(customerDue.remaining_amount) > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.history.back()}
                  className="rounded-full"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
                    Sale #{saleData?.id}
                  </h1>
                  <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{saleData?.sale_date}</span>
                    </div>
                    <Separator orientation="vertical" className="h-4" />
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Created {saleData?.created_at}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {customerDue && parseFloat(customerDue.remaining_amount) > 0 && (
                <Button
                  onClick={() => openModal("isCustomerPaymentModalOpen")}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Receive Payment
                </Button>
              )}
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            </div>
          </div>

          {/* Status Banner */}
          {isOverdue && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3"
            >
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-semibold text-destructive">
                  Payment Overdue
                </p>
                <p className="text-sm text-destructive/80">
                  This payment was due on{" "}
                  {new Date(customerDue.due_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sale Summary with enhanced design */}
            <SaleSummary saleData={saleData as any} />

            {/* Customer Due Overview Card */}
            {customerDue && (
              <Card className="border-2 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Payment Overview
                  </CardTitle>
                  <CardDescription>
                    Financial summary for this transaction
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid gap-6 sm:grid-cols-3">
                    {/* Total Amount */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Total Amount
                      </p>
                      <p className="text-3xl font-bold text-blue-600">
                        {formatCurrency(customerDue.total_amount)}
                      </p>
                    </div>

                    {/* Paid Amount */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Paid
                      </p>
                      <p className="text-3xl font-bold text-green-600">
                        {formatCurrency(customerDue.paid_amount)}
                      </p>
                    </div>

                    {/* Remaining Amount */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Remaining
                      </p>
                      <p
                        className={`text-3xl font-bold ${
                          parseFloat(customerDue.remaining_amount) > 0
                            ? "text-destructive"
                            : "text-green-600"
                        }`}
                      >
                        {formatCurrency(customerDue.remaining_amount)}
                      </p>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {/* Additional Due Details */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Due Date
                        </p>
                        <p className="font-semibold">
                          {new Date(customerDue.due_date).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                      <Store className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <Badge
                          variant={
                            customerDue.status === "paid"
                              ? "default"
                              : customerDue.status === "partial"
                              ? "secondary"
                              : "destructive"
                          }
                          className="mt-1"
                        >
                          {customerDue.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {customerDue.description && (
                    <>
                      <Separator className="my-4" />
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium mb-1">Description</p>
                        <p>{customerDue.description}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Sale Items */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Sale Items
                </CardTitle>
                <CardDescription>
                  {Array(saleItems)?.length} item
                  {Array(saleItems)?.length !== 1 ? "s" : ""} in this sale
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SalesItemsTable items={saleItems as any} />
              </CardContent>
            </Card>

            {/* Notes */}
            {saleData?.note && (
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Additional Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {saleData?.note}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Customer & Status */}
          <div className="space-y-6">
            {/* Customer Information */}
            <Card className="shadow-lg border-2">
              <CardHeader className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-600" />
                  Customer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Full Name
                  </p>
                  <p className="text-lg font-bold">{saleData?.customer_name}</p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Phone className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="font-semibold">
                        {saleData?.customer_phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Address</p>
                      <p className="text-sm font-medium whitespace-pre-wrap mt-1">
                        {saleData?.customer_address}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sale Status */}
            <Card className="shadow-lg border-2">
              <CardHeader className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-orange-600" />
                  Transaction Info
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                  <span className="text-sm font-medium">Sale Status</span>
                  <Badge
                    variant={
                      saleData?.status === "active"
                        ? "default"
                        : saleData?.status === "completed"
                        ? "secondary"
                        : "destructive"
                    }
                    className="text-xs"
                  >
                    {saleData?.status?.toUpperCase()}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                  <span className="text-sm font-medium">Payment</span>
                  <PaymentStatusBadge
                    isFullyPaid={saleData?.is_fully_paid}
                    paidAmount={saleData?.paid_amount}
                    totalAmount={saleData?.total_amount}
                  />
                </div>

                <Separator />

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Branch</span>
                    <span className="font-semibold">
                      {saleData?.branch_name}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Created By</span>
                    <span className="font-semibold">
                      {saleData?.created_by}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Sale Date</span>
                    <span className="font-semibold">{saleData?.sale_date}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Payment History - Full Width */}
        {customerDue && (
          <div className="mt-8">
            <DuePaymentsTable
              onDeleteSuccess={() => refetchDue()}
              dueData={customerDue}
              advance_paid={saleData?.paid_amount}
              due_id={customerDue?.id}
            />
          </div>
        )}

        {/* Payment Modal */}
        <Overlay
          isOpen={modalState.isCustomerPaymentModalOpen}
          onClose={() => closeModal("isCustomerPaymentModalOpen")}
          className="min-w-[90vw]"
        >
          {customerDue && (
            <PaymentForm
              dueData={{
                ...customerDue,
                due_type: "customer",
              }}
              mode="create"
              onSuccess={handlePaymentSuccess}
            />
          )}
        </Overlay>
      </motion.div>
    </div>
  );
}
