"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BarChart3,
  Users,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  Building,
  PackageSearch,
  TrendingUp,
  Package,
  Settings,
  Bell,
  Search,
  Smartphone,
  Database,
  Lock,
  Warehouse,
  ClipboardList,
  SmartphoneCharging,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggleButton } from "@/components/shared/theme-toggle-button";
import { request } from "http";
import { server_base_url } from "@/constant/server-constants";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
const {user} = useAuth()
console.log(user)
  useEffect(() => {
   
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Building className="h-8 w-8" />,
      title: "Multi-Branch Management",
      description:
        "Centralized control over all your business locations with individual stock tracking for each branch.",
    },
    {
      icon: <PackageSearch className="h-8 w-8" />,
      title: "Real-time Stock Tracking",
      description:
        "Monitor inventory levels across all branches with live updates and accurate stock counts.",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Role-based Access Control",
      description:
        "Assign different permissions to branch managers, staff, and administrators with secure login.",
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Advanced Reporting",
      description:
        "Generate comprehensive reports for sales, stock movements, and branch performance analytics.",
    },
  ];

  const benefits = [
    "Reduce stock discrepancies by up to 95%",
    "Eliminate manual data entry errors",
    "Real-time visibility across all branches",
    "Automated low stock alerts",
    "Secure multi-user access control",
    "Mobile app for on-the-go management",
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Setup Your Branches",
      description:
        "Add all your business locations and configure inventory settings for each branch.",
      icon: <Settings className="h-6 w-6" />,
    },
    {
      step: "02",
      title: "Add Your Team",
      description:
        "Invite branch managers and staff with appropriate access levels and permissions.",
      icon: <Users className="h-6 w-6" />,
    },
    {
      step: "03",
      title: "Track & Manage",
      description:
        "Start tracking stock movements, sales, and transfers between branches in real-time.",
      icon: <TrendingUp className="h-6 w-6" />,
    },
  ];

  return (
    <div className="min-h-screen max-h-screen overflow-y-auto  bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-50 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                StockMaster
              </span>
            </motion.div>

            <div className="hidden md:flex items-center gap-8">
              {["Features", "How It Works", "Benefits", "Contact"].map(
                (item) => (
                  <motion.a
                    key={item}
                    href={`#${item.toLowerCase().replace(" ", "-")}`}
                    whileHover={{ scale: 1.05 }}
                    className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                  >
                    {item}
                  </motion.a>
                )
              )}
            </div>
            <div className="flex items-center justify-center gap-3.5">
              <ThemeToggleButton />
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Link href={"/sign-in"}>Sign in </Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                🏢 Perfect for Multi-Branch Businesses
              </Badge>

              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                Unified Stock Control for Your{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Multiple Branches
                </span>
              </h1>

              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                Take complete control of your inventory across all business
                locations. Streamline operations, reduce errors, and make
                informed decisions with real-time stock visibility and
                centralized management.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6"
                  >
                    <Link href={"/sign-in"}>Sign in </Link>
                  </Button>
                </motion.div>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6"
                >
                  View Features
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Multi-branch Support
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Real-time Tracking
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Role-based Access
                  </span>
                </div>
                {/* <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Mobile App</span>
                </div> */}
              </div>
            </motion.div>

            {/* Hero Image/Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-200 dark:border-slate-700">
                <div className="space-y-6">
                  {/* Branch Overview */}
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Branch Overview
                    </h3>
                    <Badge variant="outline">Live</Badge>
                  </div>

                  {/* Branches Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      "Main Branch",
                      "North Branch",
                      "South Branch",
                      "East Branch",
                    ].map((branch, index) => (
                      <motion.div
                        key={branch}
                        whileHover={{ scale: 1.05 }}
                        className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Warehouse className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-slate-900 dark:text-white">
                            {branch}
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                          {[1247, 893, 645, 432][index]}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Items in stock
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                    <div className="text-center">
                      <div className="text-lg font-bold text-slate-900 dark:text-white">
                        4
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Branches
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-slate-900 dark:text-white">
                        3,217
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Total Items
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">
                        98%
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Accuracy
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white dark:bg-slate-900">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="px-4 py-2 text-sm mb-4">
              Powerful Features
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Everything You Need to Manage Multiple Branches
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Designed specifically for businesses with multiple locations, our
              system provides complete inventory control and visibility.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="h-full border dark:bg-slate-700/50 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-lg text-slate-600 dark:text-slate-400">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section
        id="benefits"
        className="py-20 px-6 bg-slate-50 dark:bg-slate-800/50"
      >
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge variant="outline" className="px-4 py-2 text-sm mb-4">
                Key Benefits
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Transform Your Multi-Branch Operations
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                Experience unprecedented control and efficiency across all your
                business locations with our comprehensive stock management
                solution.
              </p>

              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-slate-700 dark:text-slate-300">
                      {benefit}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-200 dark:border-slate-700">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Centralized Dashboard
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Monitor all branches from a single, intuitive dashboard with
                    real-time updates.
                  </p>

                  <div className="space-y-4">
                    {[
                      "Main Branch",
                      "North Branch",
                      "South Branch",
                      "East Branch",
                    ].map((branch) => (
                      <div
                        key={branch}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Warehouse className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-slate-900 dark:text-white">
                            {branch}
                          </span>
                        </div>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="px-4 py-2 text-sm mb-4">
              Simple Implementation
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Get Started in 3 Easy Steps
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Our implementation process is designed to get your multi-branch
              system up and running quickly and smoothly.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center"
              >
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                    {step.step}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to Transform Your Stock Management?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Schedule a personalized demo and see how our multi-branch stock
              management system can work for your business.
            </p>
            {/* <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100 text-lg px-8 py-6">
                  Request Demo <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-6">
                Contact Sales
              </Button>
            </div> */}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-slate-900 text-slate-400">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Package className="h-4 w-4 text-white" />
                </div>
                <span className="text-xl font-bold text-white">
                  StockMaster
                </span>
              </div>
              <p className="text-sm">
                Comprehensive stock management solution for multi-branch
                businesses.
              </p>
            </div>

            {["Product", "Company", "Support", "Legal"].map((category) => (
              <div key={category}>
                <h4 className="font-semibold text-white mb-4">{category}</h4>
                <ul className="space-y-2 text-sm">
                  {["Features", "How It Works", "Pricing", "Demo"].map(
                    (item) => (
                      <li key={item}>
                        <a
                          href="#"
                          className="hover:text-white transition-colors"
                        >
                          {item}
                        </a>
                      </li>
                    )
                  )}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 StockMaster. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
