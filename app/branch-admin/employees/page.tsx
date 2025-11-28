"use client";
import { EmployeeForm } from "@/components/branch/add-employee-form";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import DataTable from "@/components/shared/DataTable";
import Overlay from "@/components/shared/Overlay";
import ReusablePopover from "@/components/shared/ReusablePopover";
import { SalaryConfirmationModal } from "@/components/shared/salary-confirmation";
import { Button } from "@/components/ui/button";
import { employees_table_column_branch_admin } from "@/constant/branch-admin-contants";
import { server_base_url } from "@/constant/server-constants";
import { useAuth } from "@/hooks/use-auth";
import { useFetch } from "@/hooks/use-fetch";
import { useModalState } from "@/hooks/use-modal-state";
import { useMutation } from "@/hooks/use-mutation";
import { IEmployee } from "@/types";
import {
  CreditCard,
  FilePenLine,
  History,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const Employees = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { toggleModal, modalState } = useModalState({
    isAddEditEmployeeModalOpen: false,
    isDeleteEmployeeModalOpen: false,
    isSalaryPaymentModalOpen: false,
  });

  const [selectedEmployee, setSelectedEmployee] = useState<IEmployee | null>(
    null
  );
  const [editingEmployee, setEditingEmployee] = useState<IEmployee | null>(
    null
  );

  const { data, error, loading, refetch } = useFetch(
    `${server_base_url}/employees?branch_id=${user?.branch_id}&include_archived=true`,
    {
      credentials: "include",
      auto: true,
    }
  );

  const { mutate: deleteEmployee, loading: deleteLoading } = useMutation(
    `${server_base_url}/employees/${selectedEmployee?.id}`,
    {
      credentials: "include",
      method: "DELETE",
      onError: (error: any) => {
        toast.error("Delete Failed", {
          description:
            error?.message || "Failed to delete employee. Please try again.",
        });
      },
      onSuccess: () => {
        toast.success("Employee Deleted Successfully", {
          description: `${selectedEmployee?.name} has been permanently deleted.`,
        });
        toggleModal("isDeleteEmployeeModalOpen");
        setSelectedEmployee(null);
        refetch();
      },
    }
  );

  const employees: IEmployee[] = data?.data || [];

  const options = [
    {
      label: "Make Salary Payment",
      icon: <CreditCard size={12} />,
      onClick: (item: IEmployee) => {
        setSelectedEmployee(item);
        toggleModal("isSalaryPaymentModalOpen");
      },
    },
    {
      label: "Salary history",
      icon: <History size={12} />,
      onClick: (item: IEmployee) => {
        router.push(`/branch-admin/employees/${item.id}`);
      },
    },
    {
      label: "Edit",
      icon: <FilePenLine size={12} />,
      onClick: (item: IEmployee) => {
        setEditingEmployee(item);
        toggleModal("isAddEditEmployeeModalOpen");
      },
    },
    {
      label: "Delete",
      onClick: (item: IEmployee) => {
        setSelectedEmployee(item);
        toggleModal("isDeleteEmployeeModalOpen");
        toast.warning(
          "Please carefully read the instructions before doing action"
        );
      },
      icon: <Trash2 size={16} />,
    },
  ];

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    toggleModal("isAddEditEmployeeModalOpen");
  };

  const handleFormSuccess = () => {
    toggleModal("isAddEditEmployeeModalOpen");
    setEditingEmployee(null);
    refetch();
  };

  const handleDeleteConfirm = async (password: string) => {
    if (!selectedEmployee || !password) return;

    try {
      await deleteEmployee({
        admin_password: password,
        employee_id: selectedEmployee.id,
      });
    } catch (error: any) {
      toast.error("Delete Failed", {
        description:
          error?.message || "Failed to delete employee. Please try again.",
      });
    }
  };

  const handleCloseEditModal = () => {
    toggleModal("isAddEditEmployeeModalOpen");
    setEditingEmployee(null);
  };

  const handleSalaryPaymentSuccess = () => {
    refetch();
    toggleModal("isSalaryPaymentModalOpen");
    setSelectedEmployee(null);
  };

  const handleSalaryPaymentClose = () => {
    toggleModal("isSalaryPaymentModalOpen");
    setSelectedEmployee(null);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 space-y-4">
        <div className="text-red-500 text-lg">Failed to load employees</div>
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
    <div>
      <div className="flex justify-between mb-6">
        <div className="">
          <h2 className="page-heading">Employees in Your Branch</h2>
          <p className="page-description">
            Monitor and manage all the employees in your branch
            {employees.length > 0 &&
              ` - ${employees.length} employee${
                employees.length !== 1 ? "s" : ""
              } found`}
          </p>
        </div>
        <Button onClick={handleAddEmployee} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>

      <DataTable
        selectable={false}
        defaultItemsPerPage={10}
        pagination={true}
        columns={employees_table_column_branch_admin as any}
        rows={employees as any}
        loading={loading}
        actions={(row: any) => (
          <div className="flex gap-2 justify-center">
            <ReusablePopover actions={options as any} rowData={row} />
          </div>
        )}
      />

      {/* Add/Edit Employee Modal */}
      <Overlay
        contentClassName="min-w-[80vw]"
        isOpen={modalState.isAddEditEmployeeModalOpen}
        onClose={handleCloseEditModal}
      >
        <EmployeeForm
          mode={editingEmployee ? "edit" : "create"}
          initialData={
            editingEmployee ||
            ({
              name: "",
              address: "",
              phone: "",
              email: "",
              designation: "",
              cnic: "",
              is_permanent: true,
              salary: "",
              status: "active",
            } as any)
          }
          onSuccess={handleFormSuccess}
        />
      </Overlay>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        requiresPassword
        variant="destructive"
        open={modalState.isDeleteEmployeeModalOpen}
        onOpenChange={() => {
          toggleModal("isDeleteEmployeeModalOpen");
          setSelectedEmployee(null);
        }}
        onConfirm={(password: any) => handleDeleteConfirm(password)}
        title="Delete Employee"
        description={
          selectedEmployee ? (
            <div className="space-y-3">
              <p className="font-medium text-gray-900">
                You are about to remove the employee:
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <UserPlus className="h-8 w-8 text-amber-600" />
                  <div>
                    <p className="font-semibold text-amber-800">
                      {selectedEmployee.name}
                    </p>
                    <p className="text-sm text-amber-700">
                      {selectedEmployee.designation}
                    </p>
                    <p className="text-sm text-amber-600 mt-1">
                      CNIC: {selectedEmployee.cnic}
                    </p>
                    <p className="text-sm text-amber-600">
                      Salary: Rs. {selectedEmployee.salary?.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Employee record will be permanently deleted</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>All associated data and history will be removed</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>This action cannot be undone</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Employee will lose all system access immediately</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800 font-medium">Note:</p>
                <p className="text-sm text-blue-700">
                  Consider changing status to inactive instead if you want to
                  preserve historical data.
                </p>
              </div>
            </div>
          ) : (
            <div>Loading employee information...</div>
          )
        }
        confirmText={deleteLoading ? "Deleting..." : "Delete Employee"}
        cancelText="Cancel"
        passwordLabel="Enter your password to confirm deletion"
      />

      <SalaryConfirmationModal
        employee={selectedEmployee as IEmployee}
        isOpen={modalState.isSalaryPaymentModalOpen}
        onClose={handleSalaryPaymentClose}
        onSuccess={handleSalaryPaymentSuccess}
      />
    </div>
  );
};

export default Employees;
