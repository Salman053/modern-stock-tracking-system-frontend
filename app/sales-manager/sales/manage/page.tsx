"use client";;
import { useState } from "react";
import { toast } from "sonner";
import { Eye, Calendar, User, DollarSign, XCircle } from "lucide-react";

import { useFetch } from "@/hooks/use-fetch";
import { useModalState } from "@/hooks/use-modal-state";
import { useMutation } from "@/hooks/use-mutation";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import DataTable from "@/components/shared/DataTable";
import Overlay from "@/components/shared/Overlay";
import ReusablePopover from "@/components/shared/ReusablePopover";
import { server_base_url } from "@/constant/server-constants";
import { Sale } from "@/types";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const Sales = () => {
  const { toggleModal, modalState } = useModalState({
    isAddEditSaleModalOpen: false,
    isViewSaleModalOpen: false,
    isCancelSaleModalOpen: false,
  });

  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  // const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  const { data, error, loading, refetch } = useFetch(
    `${server_base_url}/sales`,
    {
      credentials: "include",
      auto: true,
    }
  );

  const { mutate: cancelSale, loading: cancelLoading } = useMutation(
    `${server_base_url}/sales/${selectedSale?.id}`,
    {
      credentials: "include",
      method: "DELETE",
      onError: (error: any) => {
        toast.error("Cancel Failed", {
          description:
            error?.message || "Failed to cancel sale. Please try again.",
        });
      },
      onSuccess: () => {
        toast.success("Sale Cancelled Successfully", {
          description: `Sale #${selectedSale?.id} has been cancelled and stock restored.`,
        });
        toggleModal("isCancelSaleModalOpen");
        setSelectedSale(null);
        refetch();
      },
    }
  );

  const sales: Sale[] = data?.data || [];


  const filteredSales = sales.filter(sale => {

    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      sale.id.toString().includes(searchLower) ||
      sale?.customer_name?.toLowerCase().includes(searchLower) as any ||
      sale?.created_by?.toLowerCase().includes(searchLower) as any ||
      sale.note?.toLowerCase().includes(searchLower);


    const matchesStatus = statusFilter === "all" || sale.status === statusFilter;


    const matchesDate = dateFilter === "all" || true;

    return matchesSearch && matchesStatus && matchesDate;
  });


  // const summaryStats = {
  //   totalSales: filteredSales.length,
  //   totalRevenue: filteredSales.reduce((sum, sale) => sum + sale.total_amount, 0),
  //   totalProfit: filteredSales.reduce((sum, sale) => sum + sale.profit, 0),
  //   pendingSales: filteredSales.filter(s => s.status === 'pending').length,
  //   completedSales: filteredSales.filter(s => s.status === 'completed').length,
  // };

  const options = [
    {
      label: "View Details",
      icon: <Eye size={12} />,
      onClick: (sale: Sale) => {
        setViewingSale(sale);
        toggleModal("isViewSaleModalOpen");
      },
    },
    // {
    //   label: "Edit Sale",
    //   icon: <FileText size={12} />,
    //   onClick: (sale: Sale) => {
    //     setEditingSale(sale);
    //     toggleModal("isAddEditSaleModalOpen");
    //   },
    // },
    // {
    //   label: "Print Invoice",
    //   icon: <Printer size={12} />,
    //   onClick: (sale: Sale) => {
    //     toast.info("Invoice printing feature coming soon");

    //   },
    // },
    // {
    //   label: "Export Details",
    //   icon: <Download size={12} />,
    //   onClick: (sale: Sale) => {
    //     toast.info("Export feature coming soon");

    //   },
    // },
  ];

  const cancelOptions = [
    {
      label: "Cancel Sale",
      icon: <XCircle size={12} />,
      onClick: (sale: Sale) => {
        setSelectedSale(sale);
        toggleModal("isCancelSaleModalOpen");
        toast.warning(
          "Please carefully read the instructions before cancelling a sale"
        );
      },
    },
  ];


  const handleViewClose = () => {
    toggleModal("isViewSaleModalOpen");
    setViewingSale(null);
  };

  const handleCancelConfirm = async (password: string) => {
    if (!selectedSale || !password) return;

    try {
      await cancelSale({
        admin_password: password,
      });
    } catch (error: any) {
      toast.error("Cancellation Failed", {
        description:
          error?.message || "Failed to cancel sale. Please try again.",
      });
    }
  };

  const columns = [
    {
      label: "Sale ID",
      key: "id",
      sortable: true,
      render: (value: number) => (
        <span className="font-mono font-medium">#{value}</span>
      ),
    },
    {
      label: "Date",
      key: "sale_date",
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          <span>{format(new Date(value), "dd MMM yyyy")}</span>
        </div>
      ),
    },
    {
      label: "Customer",
      key: "customer_name",
      sortable: true,
      render: (value: string, row: Sale) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <User className="h-3 w-3 text-muted-foreground" />
            <span className="font-medium">{value || "Walk-in Customer"}</span>
          </div>
          {row?.customer_phone && (
            <p className="text-xs text-muted-foreground">{row?.customer_phone}</p>
          )}
        </div>
      ),
    },
    {
      label: "Amount",
      key: "total_amount",
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center gap-2">
          <DollarSign className="h-3 w-3 text-muted-foreground" />
          <span className="font-bold">Rs. {value.toLocaleString()}</span>
        </div>
      ),
    },
    {
      label: "Paid/Total",
      key: "paid_amount",
      sortable: true,


    },
    {
      label: "Profit",
      key: "profit",
      sortable: true,
      render: (value: number) => {
        const color = value >= 0 ? "text-green-600" : "text-red-600";
        return (
          <span className={`font-medium ${color}`}>
            Rs. {value.toLocaleString()}
          </span>
        );
      },
    },
    {
      label: "Status",
      key: "status",
      sortable: true,
      
    },
    {
      label: "Created By",
      key: "created_by",
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <span className="text-sm">{value}</span>
        </div>
      ),
    },
    {
      label: "Created At",
      key: "created_at",
      sortable: true,
      render: (value: string) => (
        <div className="text-xs text-muted-foreground">
          {format(new Date(value), "dd MMM yyyy, HH:mm")}
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 space-y-4">
        <div className="text-red-500 text-lg">Failed to load sales</div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="page-heading">Sales Records</h2>
          <p className="page-description">
            Manage and track all sales transactions in your branch
            {filteredSales.length > 0 &&
              ` - ${filteredSales.length} sale${filteredSales.length !== 1 ? "s" : ""
              } found`}
          </p>
        </div>
      
      </div>

      {/* Summary Cards */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                <Package className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">{summaryStats.totalSales}</p>
              <div className="flex items-center gap-2">
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div className="bg-blue-500 h-1 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">
                Rs. {summaryStats.totalRevenue.toLocaleString()}
              </p>
              <div className="flex items-center gap-2">
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div className="bg-green-500 h-1 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Total Profit</p>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">
                Rs. {summaryStats.totalProfit.toLocaleString()}
              </p>
              <div className="flex items-center gap-2">
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div className="bg-emerald-500 h-1 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Active Status</p>
                <div className="flex items-center gap-1">
                  <Badge variant="secondary" className="text-xs">
                    {summaryStats.pendingSales} Pending
                  </Badge>
                  <Badge variant="default" className="text-xs">
                    {summaryStats.completedSales} Completed
                  </Badge>
                </div>
              </div>
              <p className="text-lg font-semibold">
                {((summaryStats.completedSales / summaryStats.totalSales) * 100 || 0).toFixed(1)}% Completed
              </p>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div
                  className="bg-blue-500 h-1 rounded-full"
                  style={{
                    width: `${(summaryStats.completedSales / summaryStats.totalSales) * 100 || 0}%`
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* Filters */}
      {/* <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by ID, customer name, or note..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[140px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => refetch()}>
                    Refresh Data
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setDateFilter("all");
                  }}>
                    Clear Filters
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card> */}

      {/* Data Table */}
      <DataTable
        selectable={false}
        defaultItemsPerPage={10}
        pagination={true}
        columns={columns as any}
        rows={filteredSales as any}
        loading={loading}
        actions={(row: any) => (
          <div className="flex gap-2 justify-center">
            <ReusablePopover actions={options as any} rowData={row} />
            {/* {row.status !== 'cancelled' && (
              <ReusablePopover actions={cancelOptions as any} rowData={row} />
            )} */}
          </div>
        )}

      />




      {/* View Sale Modal */}
      <Overlay
        contentClassName="min-w-[80vw] max-w-[80vw]"
        isOpen={modalState.isViewSaleModalOpen}
        onClose={handleViewClose}
      >
        {viewingSale && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Sale Details #{viewingSale.id}</h2>
                <p className="text-muted-foreground">
                  Created on {format(new Date(viewingSale.created_at), "PPP")}
                </p>
              </div>
              <Badge
                variant={
                  viewingSale.status === 'completed' ? 'default' :
                    viewingSale.status === 'pending' ? 'secondary' : 'destructive'
                }
              >
                {viewingSale.status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Customer Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Customer Name</p>
                      <p className="font-medium">{viewingSale?.customer_name || "Walk-in Customer"}</p>
                    </div>
                    {viewingSale?.customer_phone && (
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{viewingSale?.customer_phone}</p>
                      </div>
                    )}
                    {viewingSale?.created_by && (
                      <div>
                        <p className="text-sm text-muted-foreground">Created By</p>
                        <p className="font-medium">{viewingSale?.created_by}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Payment Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Amount</span>
                      <span className="font-bold">Rs. {viewingSale.total_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount Paid</span>
                      <span className="font-medium text-green-600">
                        Rs. {viewingSale.paid_amount.toLocaleString()}
                      </span>
                    </div>
                    {viewingSale.discount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Discount</span>
                        <span className="font-medium text-red-600">
                          - Rs. {viewingSale.discount.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-muted-foreground">Remaining Balance</span>
                      <span className={`font-bold ${viewingSale.total_amount - viewingSale.paid_amount > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                        Rs. {(viewingSale.total_amount - viewingSale.paid_amount).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Payment Status</span>
                      <Badge variant={viewingSale?.is_fully_paid ? 'default' : 'secondary'}>
                        {viewingSale?.is_fully_paid ? 'Fully Paid' : 'Partial Payment'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Profit Summary</h3>
                  <Badge variant={viewingSale.profit >= 0 ? 'default' : 'destructive'}>
                    {viewingSale.profit >= 0 ? 'Profit' : 'Loss'}: Rs. {Math.abs(viewingSale.profit).toLocaleString()}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Profit Margin</span>
                    <span className="font-medium">
                      {((viewingSale.profit / viewingSale.total_amount) * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sale Date</span>
                    <span>{format(new Date(viewingSale.sale_date), "PPP")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Branch</span>
                    <span>{viewingSale?.branch_name}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {viewingSale.note && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="text-muted-foreground">{viewingSale.note}</p>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleViewClose}>
                Close
              </Button>
              <Button onClick={() => {
                setEditingSale(viewingSale);
                toggleModal("isViewSaleModalOpen");
                toggleModal("isAddEditSaleModalOpen");
              }}>
                Edit Sale
              </Button>
            </div>
          </div>
        )}
      </Overlay>

      {/* Cancel Sale Confirmation Dialog */}
      <ConfirmationDialog
        requiresPassword
        variant="destructive"
        open={modalState.isCancelSaleModalOpen}
        onOpenChange={() => {
          toggleModal("isCancelSaleModalOpen");
          setSelectedSale(null);
        }}
        onConfirm={(password: any) => handleCancelConfirm(password)}
        title="Cancel Sale"
        description={
          selectedSale ? (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <XCircle className="h-8 w-8 text-red-600" />
                  <div>
                    <h4 className="font-semibold text-red-800">
                      Cancel Sale #{selectedSale.id}
                    </h4>
                    <p className="text-sm text-red-700">
                      Customer: {selectedSale?.customer_name}
                    </p>
                    <p className="text-sm text-red-600 mt-1">
                      Amount: Rs. {selectedSale.total_amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="font-medium">This action will:</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Mark the sale as cancelled in the system</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Restore all product quantities to inventory</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Update financial records and reports</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Send cancellation notification if configured</span>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                  <p className="text-sm text-amber-800 font-medium">Important:</p>
                  <p className="text-sm text-amber-700">
                    This action cannot be undone. All product quantities will be restored to inventory immediately.
                    Please ensure this is the correct sale to cancel.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div>Loading sale information...</div>
          )
        }
        confirmText={cancelLoading ? "Cancelling..." : "Cancel Sale"}
        cancelText="Keep Sale Active"
        passwordLabel="Enter your password to confirm cancellation"
      />
    </div>
  );
};

export default Sales;