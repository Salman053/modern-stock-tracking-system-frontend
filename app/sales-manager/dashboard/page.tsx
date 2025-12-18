"use client";
import { useAuth } from "@/hooks/use-auth";
import React from "react";

const Dashboard = () => {
  const { user } = useAuth();
  //
  return <div>Dashboard</div>;
};

export default Dashboard;
