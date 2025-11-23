"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { IUser } from "@/types";


interface User extends IUser{
  branch_name:string
}
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/session", {
        cache: "no-store",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Unauthorized");

      const data = await res.json();
      setUser(data.user);
    } catch {
      setUser(null);
      router.push("/sign-in");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [pathname]);

  return { user, loading, refetch: fetchUser };
}
