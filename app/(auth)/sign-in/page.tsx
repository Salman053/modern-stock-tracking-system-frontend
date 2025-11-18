"use client";
import { ThemeToggleButton } from "@/components/shared/theme-toggle-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { server_base_url } from "@/constant/server-constants";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Warehouse, Users, BarChart3, Shield } from "lucide-react";
import { useMutation } from "@/hooks/use-mutation";
import { error } from "console";

// Floating background elements
const FloatingIcon = ({
  icon,
  delay,
  duration = 20,
  size = 24,
}: {
  icon: any;
  delay: any;
  duration: any;
  size: any;
}) => {
  return (
    <motion.div
      className="absolute text-slate-300 dark:text-slate-700 opacity-20"
      initial={{
        y: "100vh",
        x: Math.random() * 100,
        rotate: 0,
      }}
      animate={{
        y: "-100vh",
        x: Math.random() * 100,
        rotate: 360,
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
      style={{
        left: `${Math.random() * 100}%`,
      }}
    >
      {icon}
    </motion.div>
  );
};

export default function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { refetch } = useAuth();
const {user} = useAuth();
console.log(user)
  const { error,data,loading, mutate } = useMutation(`${server_base_url}/users/login`, {
    credentials: "include",
    method: "POST",
    onSuccess: (data: any) => {
      setIsLoading(false);
      console.log(data)
      if (data) {
        toast.success(`Welcome back, ${data.data.username}!`);
        refetch();
        // console.log(data)
        router.replace(`/${data.data.role}/dashboard`);
      }
    },
    onError: (err:any) => {
      setIsLoading(false);
      console.log(err)
      toast.error(`Login failed: ${err.code}`,{
        description:err.message
      });
    },
  });

  const handleSignIn = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (!username || !password) {
      toast.warning("Please enter both username and password");
      setIsLoading(false);
      return;
    }

    mutate({
      username,
      password,
    });
  };

  // Generate floating icons
  const floatingIcons = [];
  const icons = [
    <Package key="package" size={24} />,
    <Warehouse key="warehouse" size={24} />,
    <Users key="users" size={24} />,
    <BarChart3 key="chart" size={24} />,
    <Shield key="shield" size={24} />,
  ];

  for (let i = 0; i < 15; i++) {
    floatingIcons.push(
      <FloatingIcon
      size={200}
        key={i}
        icon={icons[i % icons.length]}
        delay={Math.random() * 5}
        duration={15 + Math.random() * 10}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {floatingIcons}

        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-1/4 -left-10 w-72 h-72 bg-purple-200 dark:bg-purple-900 rounded-full blur-3xl opacity-30"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-10 w-96 h-96 bg-blue-200 dark:bg-blue-900 rounded-full blur-3xl opacity-20"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <ThemeToggleButton />
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-200/50 dark:border-slate-700/50 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.3,
                }}
                className="mx-auto mb-4"
              >
               
              </motion.div>

              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                StockFlow Pro
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Multi-Branch Stock Management System
              </CardDescription>
            </CardHeader>

            <CardContent>
              <motion.form
                onSubmit={handleSignIn}
                className="space-y-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.div
                  className="space-y-3"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <Label htmlFor="username" className="text-sm font-medium">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 focus:border-blue-500 transition-colors"
                  />
                </motion.div>

                <motion.div
                  className="space-y-3"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 focus:border-blue-500 transition-colors"
                  />
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2.5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                    disabled={loading || isLoading}
                  >
                    <AnimatePresence mode="wait">
                      {loading || isLoading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                          Signing In...
                        </motion.div>
                      ) : (
                        <motion.span
                          key="signin"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          Sign In to Dashboard
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              </motion.form>

              {/* Feature Highlights */}
              <motion.div
                className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {[
                    { icon: <Warehouse size={14} />, text: "Multi-Branch" },
                    { icon: <BarChart3 size={14} />, text: "Real-time Data" },
                    { icon: <Users size={14} />, text: "Role Access" },
                    { icon: <Shield size={14} />, text: "Secure" },
                  ].map((feature, index) => (
                    <motion.div
                      key={feature.text}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1 + index * 0.1 }}
                      className="flex items-center gap-2 text-slate-600 dark:text-slate-400"
                    >
                      {feature.icon}
                      <span>{feature.text}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-2 text-center">
              <motion.p
                className="text-xs text-slate-500 dark:text-slate-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                Secure access to your business management portal
              </motion.p>
              <motion.p
                className="text-xs text-slate-400 dark:text-slate-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
              >
                &copy; {new Date().getFullYear()} StockFlow Pro. All rights
                reserved.
              </motion.p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.1)_50%,transparent_75%,transparent_100%)] bg-[length:10px_10px] opacity-20"></div>
    </div>
  );
}
