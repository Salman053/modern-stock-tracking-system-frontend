"use client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { UserProfileForm } from "@/components/shared/user-profile-form";
import { useAuth } from "@/hooks/use-auth";
import SecurityTips from "@/components/shared/security-tips";

export default function ProfilePage() {
  const router = useRouter();

  const { loading, refetch, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-lg text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
      <div className=" flex-wrap mx-auto  items-start flex gap-5">
        {user && <UserProfileForm userData={user} />}
        <SecurityTips userId={user?.id as any} username={user?.username} />
      </div>
  );
}
