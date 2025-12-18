import { CustomerDue, ICustomer, IProduct, Sale } from "@/types";
import { DuePayment } from "../components/sales/due-payments";
export interface SaleDashboardAnalytics {
  // Product Analytics
  totalProducts: number;
  totalInventoryValue: number;
  mostSellingProduct: {
    id: number;
    name: string;
    totalMetersSold: number;
    totalRevenue: number;
    totalProfit: number;
  } | null;
  productSalesBreakdown: {
    productId: number;
    productName: string;
    totalMetersSold: number;
    totalRevenue: number;
    totalProfit: number;
  }[];

  // Customer & Due Analytics
  totalCustomers: number;
  totalActiveCustomers: number;
  totalCustomerDues: number;
  totalCustomerPayments: number;
  totalRemainingCustomerDues: number;
  customerDueSummary: {
    customerId: number;
    customerName: string;
    totalDueAmount: number;
    totalPaidAmount: number;
    netBalance: number; // due - paid = outstanding
    totalRemainingDuesAmount: number;
  }[];

  // Sales & Payment Analytics
  totalSalesCount: number;
  totalSalesAmount: number;
  totalPaidAmount: number;
  totalDiscountGiven: number;
  totalProfit: number;
  fullyPaidSalesCount: number;
  partiallyPaidSalesCount: number;

  // Due Payment Types
  duePaymentsByType: {
    customer: number;
    supplier: number;
    branch: number;
  };

  // Recent Activity
  latestDuePaymentDate: string | null;
  latestSaleDate: string | null;
}

// Add this helper
const getLastNDays = (n: number) => {
  const today = new Date();
  const date = new Date(today);
  date.setDate(today.getDate() - n);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
};

// Add to your return type (already have it)
export interface SaleDashboardAnalytics {
  // ... existing fields ...
  productStockData: { name: string; quantity: number }[];
  monthlyDuePayments: { month: string; amount: number }[];
}

export const calculateSaleDashboardAnalytics = (
  customers: ICustomer[] = [],
  products: IProduct[] = [],
  sales: Sale[] = [],
  duePayments: DuePayment[] = [],
  customerDues: CustomerDue[] = [],
  timeRange: 'all' | 'last30' | 'thisMonth' = 'all'
): SaleDashboardAnalytics => {
  // --- Filter data by time range ---
  const today = new Date();
  const startOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const thirtyDaysAgo = getLastNDays(30);

  const filterByDate = (date: string) => {
    if (timeRange === 'all') return true;
    if (timeRange === 'thisMonth') return date >= startOfThisMonth;
    if (timeRange === 'last30') return date >= thirtyDaysAgo;
    return true;
  };

  const filteredDuePayments = duePayments.filter(dp => filterByDate(dp.payment_date));
  const filteredSales = sales.filter(s => filterByDate(s.sale_date));

  // ====== Product Stock ======
  const productStockData = products.map(p => ({
    name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
    quantity: p.quantity,
  }));

  // ====== Monthly Due Payments (last 6 months) ======
  const monthlyMap = new Map<string, number>();
  const monthNames = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthlyMap.set(key, 0);
    monthNames.push(key);
  }

  filteredDuePayments.forEach(dp => {
    const month = dp.payment_date.substring(0, 7); // "2025-12"
    if (monthlyMap.has(month)) {
      monthlyMap.set(month, monthlyMap.get(month)! + parseFloat(dp.amount));
    }
  });

  console.log(filteredDuePayments)
  const monthlyDuePayments = monthNames.map(month => ({
    month,
    amount: monthlyMap.get(month) || 0,
  }));

  // ====== Rest of your logic (use filtered data where relevant) ======
  const totalProducts = products.length;
  const totalInventoryValue = products.reduce(
    (sum, p) => sum + p.quantity * parseFloat(p.sales_price_per_meter.toString()),
    0
  );

  // --- Customer Summary (use ALL sales for balance, but filtered for recent activity) ---
  const customerSalesMap = new Map<number, Sale[]>();
  sales.forEach(sale => {
    if (!customerSalesMap.has(sale.customer_id)) {
      customerSalesMap.set(sale.customer_id, []);
    }
    customerSalesMap.get(sale.customer_id)!.push(sale);
  });

  const customerDueSummary = customers.map(customer => {
    // Step 1: Get all sales for this customer
    const customerSales = customerSalesMap.get(Number(customer.id)) || [];

    // Step 2: Extract sale IDs from those sales
    const saleIds = new Set(customerSales.map(sale => sale.id));

    // Step 3: Find all dues linked to these sales
    const duesForThisCustomer = customerDues.filter(due =>
      saleIds.has(due.sales_id) && due.status !== 'paid'
    );

    // Step 4: Calculate amounts
    const totalDueAmount = customerSales.reduce((sum, s) => sum + Number(s.total_amount), 0);
    const totalPaidAmount = customerSales.reduce((sum, s) => sum + Number(s.paid_amount), 0) ;
    const totalRemainingDuesAmount = duesForThisCustomer.reduce((sum, d) => sum + Number(d.remaining_amount), 0);

    return {
      customerId: Number(customer.id),
      customerName: customer.name,
      totalDueAmount,
      totalPaidAmount,
      netBalance: totalDueAmount - totalPaidAmount,
      totalRemainingDuesAmount,
    };
  });

  const totalCustomerDues = customerDueSummary.reduce((sum, c) => sum + c.totalDueAmount, 0);
  const totalRemainingCustomerDues = customerDueSummary.reduce((sum, c) => sum + c.totalRemainingDuesAmount, 0);
  const totalCustomerPayments = customerDueSummary.reduce((sum, c) => sum + c.totalPaidAmount, 0);

  const totalSalesCount = filteredSales.length;
  const totalSalesAmount = filteredSales.reduce((sum, s) => sum + Number(s.total_amount), 0);
  const totalPaidAmount = filteredSales.reduce((sum, s) => sum + Number(s.paid_amount), 0);
  const totalDiscount = filteredSales.reduce((sum, s) => sum + Number(s.discount), 0);
  const totalProfit = filteredSales.reduce((sum, s) => sum + Number(s.profit), 0);
  const fullyPaidSalesCount = filteredSales.filter(s => s.is_fully_paid === 1).length;
  const partiallyPaidSalesCount = filteredSales.length - fullyPaidSalesCount;

  const duePaymentsByType = {
    customer: filteredDuePayments.filter(d => ['customer', 'sale'].includes(d.due_type)).length,
    supplier: filteredDuePayments.filter(d => d.due_type === 'supplier').length,
    branch: filteredDuePayments.filter(d => d.due_type === 'branch').length,
  };

  const latestDuePaymentDate = filteredDuePayments.length
    ? filteredDuePayments.map(d => d.payment_date).sort().reverse()[0]
    : null;
  const latestSaleDate = filteredSales.length
    ? filteredDuePayments.map(d => d.payment_date).sort().reverse()[0]
    : null;

  return {
    totalProducts,
    totalInventoryValue,
    mostSellingProduct: null,
    productSalesBreakdown: [],
    productStockData,
    monthlyDuePayments,

    totalCustomers: customers.length,
    totalActiveCustomers: customers.filter(c => c.status === 'active').length,
    totalCustomerDues,
    totalCustomerPayments,
    totalRemainingCustomerDues,
    customerDueSummary,

    totalSalesCount,
    totalSalesAmount,
    totalPaidAmount,
    totalDiscountGiven: totalDiscount,
    totalProfit,
    fullyPaidSalesCount,
    partiallyPaidSalesCount,

    duePaymentsByType,
    latestDuePaymentDate,
    latestSaleDate,
  };
};