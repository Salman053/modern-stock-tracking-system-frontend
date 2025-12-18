"use client";;
import DataTable, { TableColumn } from "@/components/shared/DataTable";
import ReusablePopover from "@/components/shared/ReusablePopover";
import { server_base_url } from "@/constant/server-constants";
import { useFetch } from "@/hooks/use-fetch";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  CreditCard,
  AlertCircle,
  Calendar,
  User,
  Phone,
  Receipt,
  Wallet,
} from "lucide-react";
import { PaymentForm } from "@/components/shared/payment-form";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomerDue } from "@/types";
import { useRouter } from "next/navigation"
import Overlay from "@/components/shared/Overlay";
import { formatCurrency } from "@/lib/currency-utils";
interface CustomerDueItem {
  id: number;
  branch_id: number;
  sales_id: number;
  due_date: string;
  total_amount: string;
  paid_amount: string;
  remaining_amount: string;
  status: "pending" | "partial" | "paid" | "overdue";
  due_type: string;
  description: string;
  created_at: string;
  updated_at: string;
  sale_date: string;
  sale_total_amount: number;
  customer_id: number;
  customer_name: string;
  customer_phone: string;
}

interface CustomerDuesResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: CustomerDueItem[];
}

const CustomerDues = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedDue, setSelectedDue] = useState<CustomerDueItem | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const router = useRouter();
  const {
    data: dueResponse,
    error: dueError,
    loading: dueLoading,
    refetch: refetchDue,
  } = useFetch<CustomerDuesResponse>(
    `${server_base_url}/customer-dues?customer_id=${id}`,
    {
      credentials: "include",
      auto: true,
    }
  );

  const dues: any = dueResponse?.data || [];
  const customerInfo = dues[0];


  const totalDueAmount = dues.reduce(
    (sum: number, due: CustomerDue) => sum + parseFloat(due.total_amount),
    0
  );
  const totalPaidAmount = dues.reduce(
    (sum: number, due: CustomerDue) => sum + parseFloat(due.paid_amount),
    0
  );
  const totalRemainingAmount = dues.reduce(
    (sum: number, due: CustomerDue) => sum + parseFloat(due.remaining_amount),
    0
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: {
        label: "Paid",
        className: "bg-green-100 text-green-800 border-green-200",
      },
      partial: {
        label: "Partial",
        className: "bg-blue-100 text-blue-800 border-blue-200",
      },
      pending: {
        label: "Pending",
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      },
      overdue: {
        label: "Overdue",
        className: "bg-red-100 text-red-800 border-red-200",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const columns: TableColumn[] = [
    {
      label: "Due ID",
      key: "id",
      sortable: true,
      render: (value) => <span className="font-semibold">#{value}</span>,
    },
    {
      label: "Sale ID",
      key: "sales_id",
      sortable: true,
      render: (value) => <span className="text-blue-600">Sale #{value}</span>,
    },
    {
      label: "Sale Date",
      key: "sale_date",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          {new Date(value).toLocaleDateString()}
        </div>
      ),
    },
    {
      label: "Due Date",
      key: "due_date",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-orange-500" />
          {new Date(value).toLocaleDateString()}
        </div>
      ),
    },
    {
      label: "Total Amount",
      key: "total_amount",
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-gray-900">
          Rs. {parseFloat(value).toFixed(2)}
        </span>
      ),
    },
    {
      label: "Paid Amount",
      key: "paid_amount",
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-green-600">
          Rs. {parseFloat(value).toFixed(2)}
        </span>
      ),
    },
    {
      label: "Remaining",
      key: "remaining_amount",
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-red-600">
          Rs. {parseFloat(value).toFixed(2)}
        </span>
      ),
    },
    {
      label: "Status",
      key: "status",
      sortable: true,
      render: (value) => getStatusBadge(value),
    },
  ];

  const handleAddPayment = (due: CustomerDueItem) => {
    setSelectedDue(due);
    setShowPaymentDialog(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentDialog(false);
    setSelectedDue(null);
    refetchDue();
  };


  const transformDueForPayment = (due: CustomerDueItem | null) => {
    if (!due) return undefined;
    return {
      id: due.id.toString(),
      supplier_id: due.customer_id,
      branch_id: due.branch_id,
      stock_movement_id: due.sales_id,
      due_date: due.due_date,
      total_amount: parseFloat(due.total_amount),
      supplier_name: due.customer_name,
      branch_name: "",
      paid_amount: parseFloat(due.paid_amount),
      remaining_amount: parseFloat(due.remaining_amount),
      status: due.status as
        | "pending"
        | "partial"
        | "paid"
        | "overdue"
        | "cancelled",
      due_type: "customer",
      description: due.description,
      created_at: due.created_at,
      updated_at: due.updated_at,
    };
  };

  if (dueLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  // console.log(dueError)
  if (dueError) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-yellow-800">
              <AlertCircle  className="h-6 w-6" />
              <div>
                <p className="text-sm">
                  {dueError.message || "Failed to load customer dues"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className=" mx-auto  space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Dues</h1>
          <p className="text-gray-500 mt-1">
            Manage and track customer payment dues
          </p>
        </div>

        {/* Customer Information Card */}
        {customerInfo && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="px-5">
              <div className="flex items-center gap-6">
                <div className="p-3 bg-blue-100 rounded-full">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">
                    {customerInfo.customer_name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{customerInfo.customer_phone}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Customer ID</p>
                  <p className="text-lg font-semibold text-gray-900">
                    #{customerInfo.customer_id}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Total Due Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">
              {formatCurrency(totalDueAmount)}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              {dues.length} due record{dues.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Total Paid Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">
              {formatCurrency(totalPaidAmount)}

            </div>
            <p className="text-xs text-green-600 mt-1">

              {((totalPaidAmount / totalDueAmount) * 100 || 0).toFixed(1)}% paid
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100">
          <CardHeader className="">
            <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Remaining
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-900">
            
              {formatCurrency(totalRemainingAmount)}

            </div>
            <p className="text-xs text-red-600 mt-1">
              {((totalRemainingAmount / totalDueAmount) * 100 || 0).toFixed(1)}%
              remaining
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dues Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Due Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={dues}
            loading={dueLoading}
            pagination={true}
            selectable={false}
            actions={(row: any) => {
              return (
                <ReusablePopover
                  actions={[
                    {
                      label: "Add Payment",
                      onClick: () => handleAddPayment(row),
                      variant: "default",
                      disabled: row.status === "paid",
                    },
                    {
                      label: "View Details",
                      onClick: () => {
                        router.push(`/sales-manager/sales/manage/${row.sales_id}`);
                      },
                      variant: "outline",
                    },
                  ]}
                />
              );
            }}
          />
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      {selectedDue && (
        <Overlay isOpen={showPaymentDialog} onClose={() => setShowPaymentDialog(false)} contentClassName="min-w-[90vw]">


          <PaymentForm
            mode="create"
            // initialData={}
            dueData={transformDueForPayment(selectedDue)}
            onSuccess={handlePaymentSuccess}
          />


        </Overlay>
      )}
    </div >
  );
};

export default CustomerDues;
