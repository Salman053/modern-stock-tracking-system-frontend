"use client"
import { SaleDashboardAnalytics } from "@/components/sales/sale-dashboard-analytics";
import { useSaleDashboard } from "@/hooks/use-sales-dashboard";
import { useState } from "react";

const Dashboard = () => {
  const { analytics, loading } = useSaleDashboard();

  return (
    <div className="">
      {/* <h1 className="text-2xl font-bold">Sales Dashboard</h1> */}
      <SaleDashboardAnalytics analytics={analytics}
        loading={loading}
      />
    </div>
  );
};

export default Dashboard;
