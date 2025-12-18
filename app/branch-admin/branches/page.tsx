"use client";

import { Branch, BranchCard } from "@/components/shared/branch-card";
import Overlay from "@/components/shared/Overlay";
import { PaymentForm } from "@/components/shared/payment-form";
import { Button } from "@/components/ui/button";
import { server_base_url } from "@/constant/server-constants";
import { useAuth } from "@/hooks/use-auth";
import { useFetch } from "@/hooks/use-fetch";
import { useModalState } from "@/hooks/use-modal-state";
import { useMutation } from "@/hooks/use-mutation";
import { CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Branches = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const { toggleModal, modalState } = useModalState({
    isPaymentModalOpen: false,
  });

  const { data, error, loading, refetch } = useFetch(
    `${server_base_url}/branches`,
    {
      credentials: "include",
      auto: true,
    }
  );

  // const { mutate: deleteSupplierDue, loading: deleteLoading } = useMutation(
  //   `${server_base_url}/supplier-dues/${selectedSupplierDue?.id}`,
  //   {
  //     credentials: "include",
  //     method: "DELETE",
  //     onError: (error: any) => {
  //       toast.error("Delete Failed", {
  //         description:
  //           error?.message ||
  //           "Failed to delete supplier due. Please try again.",
  //       });
  //     },
  //     onSuccess: () => {
  //       toast.success("Supplier Due Deleted Successfully", {
  //         description: `Supplier due has been permanently deleted.`,
  //       });
  //       toggleModal("isDeleteSupplierDueModalOpen");
  //       setSelectedSupplierDue(null);
  //       refetch();
  //     },
  //   }
  // );

  const branches: Branch[] = data?.data || [];

  const options = [
    {
      label: "Make Payment",
      icon: <CreditCard size={12} />,
      onClick: (item: Branch) => {
        setSelectedBranch(item);
        toggleModal("isPaymentModalOpen");
      },
    },
  ];

  return (
    <div>
      <div className="flex justify-between mb-6">
        <div className="">
          <h2 className="page-heading">Branches</h2>
          <p className="page-description">Monitor your dues on the branches</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches
          .filter((b) => Number(b.id) !== user?.branch_id)
          .map((b) => (
            <BranchCard
              branch={b}
              key={b.id}
              onView={() =>
                router.push(`/branch-admin/branches/dues?id=${b.id}`)
              }
              onPayment={(branch: Branch) => {
                setSelectedBranch(branch);
                toggleModal("isPaymentModalOpen");
              }}
            />
          ))}
      </div>
      <Overlay
        contentClassName="min-w-[60vw]"
        isOpen={modalState.isPaymentModalOpen}
        onClose={() => {
          toggleModal("isPaymentModalOpen");
          setSelectedBranch(null);
        }}
      >
        {selectedBranch && (
          <PaymentForm
            onSuccess={() => {
              refetch();
              toggleModal("isPaymentModalOpen");
              setSelectedBranch(null);
            }}
            dueData={selectedBranch as any}
          />
        )}
      </Overlay>
    </div>
  );
};

export default Branches;
