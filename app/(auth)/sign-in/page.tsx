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
import { Package, Warehouse, Users, BarChart3, Shield, CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { useMutation } from "@/hooks/use-mutation";

// Processing Overlay Component
function ProcessingOverlay({ userData }: { userData: any }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 25 }}
        className="w-full max-w-md mx-4"
      >
        <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-slate-200/50 dark:border-slate-700/50 shadow-2xl">
          <CardHeader className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
              className="mx-auto mb-4"
            >
              <div className="w-20 h-20 rounded-full border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 flex items-center justify-center">
                <Loader2 className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
            </motion.div>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Setting Up Your Dashboard
            </CardTitle>
            <CardDescription className="text-sm">
              Preparing your workspace...
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Progress Steps */}
            <div className="space-y-3">
              {[
                { id: 1, label: "Verifying credentials", completed: true },
                { id: 2, label: "Loading user profile", completed: true },
                { id: 3, label: "Checking permissions", completed: true },
                { id: 4, label: "Preparing dashboard", completed: false },
                { id: 5, label: "Loading resources", completed: false },
              ].map((step) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: step.id * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    step.completed 
                      ? 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800' 
                      : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="h-2 w-2 rounded-full bg-blue-500"
                      />
                    )}
                  </div>
                  <span className={`text-sm ${
                    step.completed 
                      ? 'text-green-700 dark:text-green-400' 
                      : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    {step.label}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* User Info */}
            {userData && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg border border-blue-100 dark:border-blue-800/30"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Welcome, <span className="font-bold">{userData.username}</span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Role: <span className="capitalize">{userData.role}</span>
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </motion.div>
            )}

            {/* Loading Animation */}
            <div className="pt-4">
              <div className="flex items-center justify-center gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>
            </div>
          </CardContent>

          <CardFooter className="text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              You will be redirected to your dashboard shortly
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  );
}

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [loginData, setLoginData] = useState<any>(null);

  const router = useRouter();
  const { refetch } = useAuth();
  const { user } = useAuth();

  const { error, data, loading, mutate } = useMutation(`${server_base_url}/users/login`, {
    credentials: "include",
    method: "POST",
    onSuccess: (data: any) => {
      if (data && data.data) {
        setLoginData(data.data);
        setIsProcessing(true);
        
        toast.success(`Welcome back, ${data.data.username}!`);
        refetch();
        
        // Simulate loading time for better UX
        setTimeout(() => {
          router.replace(`/${data.data.role}/dashboard`);
        }, 2000);
      }
    },
    onError: (err: any) => {
      setIsProcessing(false);
      toast.error(`Login failed: ${err.code}`, {
        description: err.message
      });
    },
  });

  const handleSignIn = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!username || !password) {
      toast.warning("Please enter both username and password");
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
        key={i}
        icon={icons[i % icons.length]}
        delay={Math.random() * 5}
        duration={15 + Math.random() * 10}
        size={24}
      />
    );
  }

  return (
    <>
      {/* Processing Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <ProcessingOverlay userData={loginData} />
        )}
      </AnimatePresence>

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
                  {/* Logo placeholder */}
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
                      disabled={loading}
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
                      disabled={loading}
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
                      disabled={loading || isProcessing}
                    >
                      <AnimatePresence mode="wait">
                        {loading ? (
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
    </>
  );
}