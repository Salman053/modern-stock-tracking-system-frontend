import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { ShieldAlert } from "lucide-react";
import { Button } from "../ui/button";
import Overlay from "./Overlay";
import { PasswordUpdateForm } from "./password-update";

const SecurityTips = ({
  userId,
  username,
}: {
  userId?: string;
  username?: string;
}) => {
  const [modal, setModal] = useState<boolean>(false);
  return (
    <>
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
              <span>Keep your email address updated for account recovery</span>
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
        <CardDescription className="flex items-center justify-center">
          <Button
            onClick={() => setModal(true)}
            variant={"destructive"}
            className=""
          >
            Safely Change your password
          </Button>
        </CardDescription>
      </Card>
      <Overlay isOpen={modal} onClose={() => setModal(false)}>
        <PasswordUpdateForm  userId={userId} userName={username} />
      </Overlay>
    </>
  );
};

export default SecurityTips;
