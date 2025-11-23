// app/profile/page.tsx
"use client";

import { server_base_url } from "@/constant/server-constants";
import { useFetch } from "@/hooks/use-fetch";
import { IUser } from "@/types";
import { ArrowLeft, Loader2, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserProfileForm } from "@/components/shared/user-profile-form";
import { useAuth } from "@/hooks/use-auth";

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

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <Card className="w-full max-w-md">
//           <CardHeader>
//             <div className="flex justify-center mb-4">
//               <ShieldAlert className="h-12 w-12 text-red-500" />
//             </div>
//             <CardTitle className="text-center text-red-600">
//               Access Denied
//             </CardTitle>
//             <CardDescription className="text-center">
//               Unable to load your profile information
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <p className="text-sm text-gray-600 text-center">
//               Please make sure you are logged in and have permission to access
//               this page.
//             </p>
//             <Button onClick={() => router.push("/")} className="w-full">
//               Return to Dashboard
//             </Button>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

  return (
    <div className=" ">
      <div className=" mx-auto px-4 items-start flex gap-5">
      

        {/* Profile Form */}
        {user && <UserProfileForm userData={user} />}

        {/* Security Tips */}
        <Card className=" max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
              Security Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0" />
                <span>
                  Use a strong, unique password that you don't use elsewhere
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0" />
                <span>
                  Keep your email address updated for account recovery
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0" />
                <span>Never share your password with anyone</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0" />
                <span>Log out from shared computers after use</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
