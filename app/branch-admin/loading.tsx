import { Package, TrendingUp, Shield, Clock } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Logo/Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Package className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -top-1 -right-1">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <TrendingUp className="h-3 w-3 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        </div>

        {/* Application Information */}
        <div className="space-y-4 mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            StockFlow Manager
          </h1>
          <p className="text-gray-600 text-sm">
            Loading your inventory dashboard...
          </p>
        </div>

        {/* Features List */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Real-time Inventory Tracking</span>
            <Shield className="h-4 w-4 text-green-500" />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Smart Stock Analytics</span>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Secure & Reliable</span>
            <Clock className="h-4 w-4 text-purple-500" />
          </div>
        </div>

        {/* Loading Text */}
        <div className="mt-6">
          <p className="text-xs text-gray-500">
            Preparing your stock management environment...
          </p>
        </div>
      </div>
    </div>
  );
};
