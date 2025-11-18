"use client"
import { server_base_url } from "@/constant/server-constants";
import { useFetch } from "@/hooks/use-fetch";
import { IUser } from "@/types";
import React, { useEffect, useState } from "react";

const ManageUser = () => {
  const { data } = useFetch(`${server_base_url}/users/all`, {
    auto: true,
    pollInterval: 10000,
    method: "GET",
  });
  const [users, setUsers] = useState<IUser[] | []>([]);
  useEffect(() => {
    console.log(data);
  }, [data?.data]);
  return <div>ManageUser</div>;
};

export default ManageUser;
