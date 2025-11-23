"use client";

import { BranchCard } from "@/components/shared/branch-card";
import { InfoPopover } from "@/components/shared/info-popover";
import { server_base_url } from "@/constant/server-constants";
import { useFetch } from "@/hooks/use-fetch";
import { IBranch, IUser } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ManageAllBranchesUsers = () => {
  const { push } = useRouter();
  const [branches, setBranches] = useState<IBranch[]>([]);
  const { data, error, loading, refetch } = useFetch<{ data: IBranch[] }>(
    `${server_base_url}/branches/?include_archived=true`
  );

  useEffect(() => {
    if (data?.data && Array.isArray(data.data)) {
      setBranches(data.data);
    } else {
      setBranches([]);
    }
  }, [data]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg">Loading branches...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 space-y-4">
        <div className="text-red-500 text-lg">Failed to load branches</div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="mb-8">
          <h2 className="page-heading">Manage All Users</h2>
          <p className="page-description">
            Monitor and manage all the system users of all branches
          </p>
        </div>
        <InfoPopover
          variant="secondary"
          content="The branch card with light green color indicates the main branch"
        />
      </div>

      {branches.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No branches found</p>
        </div>
      ) : (
        <div className="grid  grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-4">
          {branches.map((branch, index) => (
            <BranchCard
              onView={() =>
                push(`/super-admin/manage-users/${branch.id}/?branch_name=${branch.name}`)
              }
              key={branch.id || index}
              branch={branch as any}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageAllBranchesUsers;
