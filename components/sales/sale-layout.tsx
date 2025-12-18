"use client"

import { server_base_url } from '@/constant/server-constants';
import { useMutation } from '@/hooks/use-mutation';
import React from 'react'
import ProfessionalSidebar from '../shared/professional-sidebar';
import { SalesAdminNav } from '@/constant/sales-admin-constants';
import Header from '../shared/header';
import { toast } from 'sonner';
import { Breadcrumb } from '../shared/breadcrumb';
import { ReactNode } from "react"
import { useAuth } from '@/hooks/use-auth';
const SaleLayout = ({ children }: { children: ReactNode }) => {
    const {
        mutate,
        loading: logoutLoading,
    } = useMutation(`${server_base_url}/users`, {
        credentials: "include",
    });

    const { user } = useAuth()
    if (logoutLoading) {
        return <div>Logout is Process</div>;
    }

    return (
        <div className="min-h-screen overflow-hidden max-h-screen flex max-w-[100vw] bg-gray-50 dark:bg-gray-950">
            {/* Sidebar */}
            <ProfessionalSidebar user={user as any} nav={SalesAdminNav} />

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
                <main className="flex-1 px-5  pb-10 overflow-hidden overflow-y-auto w-full bg-gray-50 dark:bg-gray-950">
                    <Breadcrumb />
                    {children}
                </main>
            </div>
        </div>
    );
}

export default SaleLayout