"use client";
import { ProductForm } from "@/components/branch/add-product-form";
import DataTable from "@/components/shared/DataTable";
import Overlay from "@/components/shared/Overlay";
import ReusablePopover from "@/components/shared/ReusablePopover";
import { Button } from "@/components/ui/button";
import { manage_branches_table_columns } from "@/constant/admin-constants";
import { useModalState } from "@/hooks/use-modal-state";
import React from "react";

const Products = () => {
  const { toggleModal, modalState } = useModalState({
    isAddProductModalOpen: false,
  });

  // const options = [
  //   {label:""}
  // ]
  return (
    <div>
      <div className="flex justify-between mb-4">
        <div className="">
          <h2 className="page-heading">Project in Your Branch</h2>
          <p className="page-description">
            Monitor and manage all the products in your branch
          </p>
        </div>
        <Button onClick={() => toggleModal("isAddProductModalOpen")}>
          Add Product
        </Button>
      </div>

      <DataTable
        rows={[]}
        selectable={false}
        defaultItemsPerPage={10}
        pagination={false}
        columns={manage_branches_table_columns}
        // rows={users}
        // actions={(row: any) => (
        //   <div className="flex gap-2 justify-center">
        //     <ReusablePopover actions={options as any} rowData={row} />
        //   </div>
        // )}
      />
      <Overlay
      contentClassName="min-w-[80vw]"
        isOpen={modalState.isAddProductModalOpen}
        onClose={() => toggleModal("isAddProductModalOpen")}
      >
        <ProductForm />
      </Overlay>
    </div>
  );
};

export default Products;
