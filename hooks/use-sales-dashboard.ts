import { calculateSaleDashboardAnalytics } from "@/business-logic/calculate-sale-analytics";
import { useAuth } from "./use-auth";
import { useFetch } from "./use-fetch";
import { CustomerDue, ICustomer, IProduct, Sale } from "@/types";
import { DuePayment } from "@/components/sales/due-payments";
import { server_base_url } from "@/constant/server-constants";
import { useMemo } from "react";
export const useSaleDashboard = (timeRange: 'all' | 'last30' | 'thisMonth' = 'all') => {
  const { user } = useAuth();

  const customersRes = useFetch<ICustomer[]>(`${server_base_url}/customers?branch_id=${user?.branch_id}&include_archived=true`);
  const productsRes = useFetch<IProduct[]>(`${server_base_url}/products?branch_id=${user?.branch_id}`);
  const salesRes = useFetch<Sale[]>(`${server_base_url}/sales?branch_id=${user?.branch_id}`);
  const duePaymentsRes = useFetch<DuePayment[]>(`${server_base_url}/due-payments/?branch_id=${user?.branch_id}`);
  const customerDuesRes = useFetch<CustomerDue[]>(`${server_base_url}/customer-dues?branch_id=${user?.branch_id}`);

  const analytics = useMemo(() => {
    if (customersRes.data && productsRes.data && salesRes.data && duePaymentsRes.data && customerDuesRes.data) {
      return calculateSaleDashboardAnalytics(
        customersRes.data.data,
        productsRes.data.data,
        salesRes.data.data,
        duePaymentsRes.data.data,
        customerDuesRes.data.data,
        timeRange
      );
    }
    return null;
  }, [customersRes.data, productsRes.data, salesRes.data, duePaymentsRes.data, customerDuesRes.data, timeRange]);

  return {
    analytics,
    loading: customersRes.loading || productsRes.loading || salesRes.loading || duePaymentsRes.loading || customerDuesRes.loading,
  };
};