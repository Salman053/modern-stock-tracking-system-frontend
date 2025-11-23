"use client";

import { Breadcrumb } from "@/components/shared/breadcrumb";
import Header from "@/components/shared/header";
import ProfessionalSidebar from "@/components/shared/professional-sidebar";
import { adminNav } from "@/constant/admin-constants";
import { server_base_url } from "@/constant/server-constants";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@/hooks/use-mutation";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const {
    mutate,
    loading: logoutLoading,
    error,
  } = useMutation(`${server_base_url}/users`, {
    credentials: "include",
  });

  return (
    <div className="min-h-screen overflow-hidden max-h-screen flex max-w-[100vw] bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <ProfessionalSidebar nav={adminNav} />

      {/* Main Content Area */}
      <div className="flex-1  overflow-hidden flex flex-col min-w-0 ">
        {/* Header - Fixed at top */}
        <Header
          onLogout={() => {
            mutate({ action: "logout" })
              .then(() => {
                toast.success("Successfully logged out");
                window.location.replace("/sign-in");
              })
              .catch((e) => {
                toast.error(e.message || "Logout failed");
                window.location.replace("/sign-in");
              });
          }}
        />

        {/* Scrollable Content */}
        <main className="flex-1 px-5  overflow-hidden overflow-y-auto w-full bg-gray-50 dark:bg-gray-950">
          <Breadcrumb />
          {children}
        </main>
      </div>
    </div>
  );
}
