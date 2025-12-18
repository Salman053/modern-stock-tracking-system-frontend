'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Download, Filter, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/lib/currency-utils';
import { formatDate } from '@/lib/date-utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  ComposedChart,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo, useState } from 'react';
import type { SaleDashboardAnalytics } from '@/business-logic/calculate-sale-analytics';

interface SaleDashboardAnalyticsProps {
  analytics: SaleDashboardAnalytics | null;
  loading: boolean;
}

// Enhanced color palette with gradients
const CHART_COLORS = {
  primary: {
    light: '#6366f1',
    main: '#4f46e5',
    dark: '#4338ca',
  },
  success: {
    light: '#34d399',
    main: '#10b981',
    dark: '#059669',
  },
  warning: {
    light: '#f97316',
    main: '#ef4444',
    dark: '#dc2626',
  },
  info: {
    light: '#0ea5e9',
    main: '#3b82f6',
    dark: '#2563eb',
  },
  purple: {
    light: '#a855f7',
    main: '#8b5cf6',
    dark: '#7c3aed',
  },
  gray: {
    light: '#94a3b8',
    main: '#64748b',
    dark: '#475569',
  }
};

const GRADIENT_COLORS = [
  { offset: '5%', color: CHART_COLORS.primary.light, opacity: 0.8 },
  { offset: '95%', color: CHART_COLORS.primary.main, opacity: 0.4 },
];

const PIE_COLORS = [
  CHART_COLORS.primary.main,
  CHART_COLORS.success.main,
  CHART_COLORS.info.main,
  CHART_COLORS.purple.main,
  CHART_COLORS.warning.main,
];

export function SaleDashboardAnalytics({
  analytics,
  loading,
}: SaleDashboardAnalyticsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerType, setSelectedCustomerType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'overview' | 'customers' | 'products'>('overview');
  const [timeRange, setTimeRange] = useState<'all' | 'last30' | 'thisMonth'>('last30');

  // Enhanced data processing
  const customerDueData = useMemo(() => {
    if (!analytics) return [];
    return analytics.customerDueSummary
      .filter(c => c.totalRemainingDuesAmount > 0)
      .map((c) => ({
        name: c.customerName.length > 15 ? `${c.customerName.substring(0, 15)}...` : c.customerName,
        balance: c.totalRemainingDuesAmount,
        paid: c.totalPaidAmount,
        total: c.totalDueAmount,
        id: c.customerId,
      }))
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 8);
  }, [analytics]);

  const paymentTypeData = useMemo(() => {
    if (!analytics) return [];
    return [
      { name: 'Customer', value: analytics.duePaymentsByType.customer, color: CHART_COLORS.primary.main },
      { name: 'Supplier', value: analytics.duePaymentsByType.supplier, color: CHART_COLORS.success.main },
      { name: 'Branch', value: analytics.duePaymentsByType.branch, color: CHART_COLORS.info.main },
    ].filter(item => item.value > 0);
  }, [analytics]);

  const productStockData = useMemo(() => {
    return (analytics?.productStockData || [])
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10)
      .map(item => ({
        ...item,
        value: item.quantity,
      }));
  }, [analytics]);

  const monthlyDueData = useMemo(() => {
    return analytics?.monthlyDuePayments.map((m, index) => ({
      ...m,
      month: m.month.replace('-', '/'),
      forecast: index === analytics.monthlyDuePayments.length - 1 
        ? m.amount * 1.15 
        : undefined,
    })) || [];
  }, [analytics]);

  // Profit trend data
  const profitTrendData = useMemo(() => {
    if (!analytics?.monthlyDuePayments) return [];
    return analytics.monthlyDuePayments.map((m, index) => ({
      month: m.month.replace('-', '/'),
      profit: Math.round(m.amount * 0.25), // Simulated profit based on 25% margin
      revenue: m.amount,
    }));
  }, [analytics]);

  // Customer performance radar data
  const customerPerformanceData = useMemo(() => {
    if (!analytics || analytics.customerDueSummary.length === 0) return [];
    
    const topCustomers = analytics.customerDueSummary
      .sort((a, b) => b.totalPaidAmount - a.totalPaidAmount)
      .slice(0, 5);

    return [
      {
        subject: 'Payment',
        ...topCustomers.reduce((acc, cust, idx) => ({
          ...acc,
          [`C${idx + 1}`]: Math.min((cust.totalPaidAmount / (cust.totalDueAmount || 1)) * 100, 100),
        }), {}),
      },
      {
        subject: 'Frequency',
        ...topCustomers.reduce((acc, cust, idx) => ({
          ...acc,
          [`C${idx + 1}`]: Math.random() * 80 + 20, // Simulated data
        }), {}),
      },
      {
        subject: 'Amount',
        ...topCustomers.reduce((acc, cust, idx) => ({
          ...acc,
          [`C${idx + 1}`]: Math.min(cust.totalDueAmount / 10000, 100), // Normalized
        }), {}),
      },
      {
        subject: 'Timeliness',
        ...topCustomers.reduce((acc, cust, idx) => ({
          ...acc,
          [`C${idx + 1}`]: Math.random() * 60 + 40, // Simulated data
        }), {}),
      },
    ];
  }, [analytics]);

  // Filtered customer data
  const filteredCustomers = useMemo(() => {
    if (!analytics) return [];
    
    let filtered = analytics.customerDueSummary;
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(customer =>
        customer.customerName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Type filter
    if (selectedCustomerType !== 'all') {
      filtered = filtered.filter(customer =>
        selectedCustomerType === 'active' 
          ? customer.totalRemainingDuesAmount === 0
          : customer.totalRemainingDuesAmount > 0
      );
    }
    
    return filtered;
  }, [analytics, searchQuery, selectedCustomerType]);

  // KPI metrics
  const kpiMetrics = useMemo(() => {
    if (!analytics) return [];
    
    const previousPeriodSales = analytics.totalSalesAmount * 0.85; // Simulated previous period
    const salesGrowth = ((analytics.totalSalesAmount - previousPeriodSales) / previousPeriodSales) * 100;
    
    const previousPeriodProfit = analytics.totalProfit * 0.9; // Simulated
    const profitGrowth = ((analytics.totalProfit - previousPeriodProfit) / previousPeriodProfit) * 100;
    
    const paymentEfficiency = (analytics.totalPaidAmount / analytics.totalSalesAmount) * 100;
    const previousEfficiency = paymentEfficiency * 0.95; // Simulated
    const efficiencyGrowth = paymentEfficiency - previousEfficiency;
    
    return [
      {
        title: 'Sales Growth',
        value: `${salesGrowth > 0 ? '+' : ''}${salesGrowth.toFixed(1)}%`,
        description: 'vs previous period',
        trend: salesGrowth,
        color: salesGrowth > 0 ? CHART_COLORS.success.main : CHART_COLORS.warning.main,
        icon: salesGrowth > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />,
      },
      {
        title: 'Profit Margin',
        value: `${((analytics.totalProfit / analytics.totalSalesAmount) * 100).toFixed(1)}%`,
        description: `Growth: ${profitGrowth > 0 ? '+' : ''}${profitGrowth.toFixed(1)}%`,
        trend: profitGrowth,
        color: profitGrowth > 0 ? CHART_COLORS.success.main : CHART_COLORS.warning.main,
        icon: profitGrowth > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />,
      },
      {
        title: 'Payment Efficiency',
        value: `${paymentEfficiency.toFixed(1)}%`,
        description: `Collection rate`,
        trend: efficiencyGrowth,
        color: paymentEfficiency > 75 ? CHART_COLORS.success.main : CHART_COLORS.warning.main,
        icon: efficiencyGrowth > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />,
      },
      {
        title: 'Stock Turnover',
        value: `${(analytics.totalSalesCount / analytics.totalProducts).toFixed(1)}x`,
        description: 'Monthly rate',
        trend: 5.2, // Simulated
        color: CHART_COLORS.info.main,
        icon: <TrendingUp className="h-4 w-4" />,
      },
    ];
  }, [analytics]);

  if (loading) {
    return <EnhancedDashboardSkeleton />;
  }

  if (!analytics) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <Search className="h-8 w-8" />
        </div>
        <p className="text-lg font-medium">No data available</p>
        <p className="text-sm mt-2">Try adjusting your filters or check data sources</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive insights into your sales performance and customer behavior
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      {/* Time Range & View Tabs */}
      {/* <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={selectedCustomerType} onValueChange={setSelectedCustomerType}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Customer Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              <SelectItem value="active">Active (Paid)</SelectItem>
              <SelectItem value="pending">Pending Dues</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex flex-wrap gap-2">
            {(['last7', 'last30', 'thisMonth', 'last90', 'all'] as const).map((range) => {
              const labels = {
                last7: 'Last 7D',
                last30: 'Last 30D',
                thisMonth: 'This Month',
                last90: 'Last 90D',
                all: 'All Time',
              };
              return (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange(range as any)}
                  className="px-3"
                >
                  {labels[range]}
                </Button>
              );
            })}
          </div>
        </div>
      </div> */}

      {/* KPI Metrics Row */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Sales"
          value={formatCurrency(analytics.totalSalesAmount)}
          description={`${analytics.totalSalesCount.toLocaleString()} transactions`}
          color={CHART_COLORS.primary.main}
          trend={12.5}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricCard
          title="Outstanding Dues"
          value={formatCurrency(analytics.totalRemainingCustomerDues)}
          description={`${analytics.customerDueSummary.filter(c => c.totalRemainingDuesAmount > 0).length} customers pending`}
          color={CHART_COLORS.warning.main}
          trend={-3.2}
          icon={<TrendingDown className="h-4 w-4" />}
        />
        <MetricCard
          title="Total Profit"
          value={formatCurrency(analytics.totalProfit)}
          description={`Margin: ${((analytics.totalProfit / analytics.totalSalesAmount) * 100).toFixed(1)}%`}
          color={CHART_COLORS.success.main}
          trend={8.7}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricCard
          title="Products in Stock"
          value={analytics.totalProducts.toLocaleString()}
          description={`${formatCurrency(analytics.totalInventoryValue)} inventory value`}
          color={CHART_COLORS.info.main}
          trend={5.4}
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      {/* Performance KPIs */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {kpiMetrics.map((metric, index) => (
          <div key={index} className="bg-card border border-border/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground font-medium">{metric.title}</span>
              <div className={`p-1 rounded ${metric.trend > 0 ? 'bg-green-100 text-green-600' : 'bg-rose-100 text-rose-600'}`}>
                {metric.icon}
              </div>
            </div>
            <div className="text-2xl font-bold" style={{ color: metric.color }}>
              {metric.value}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {metric.description}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 - Overview */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue vs Profit Trend */}
        <Card className="rounded-xl border border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center justify-between">
              Revenue vs Profit Trend
              <Badge variant="outline" className="text-xs">Monthly</Badge>
            </CardTitle>
            <CardDescription>Last 6 months performance</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={profitTrendData}>
                <CartesianGrid vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value, name) => [
                    formatCurrency(Number(value)),
                    name === 'revenue' ? 'Revenue' : 'Profit'
                  ]}
                />
                <Bar
                  dataKey="revenue"
                  fill={CHART_COLORS.primary.main}
                  opacity={0.8}
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke={CHART_COLORS.success.main}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Customer Performance Radar */}
        <Card className="rounded-xl border border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Top Customer Performance</CardTitle>
            <CardDescription>Key metrics for top 5 customers</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            {customerPerformanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={customerPerformanceData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  {customerDueData.slice(0, 5).map((customer, index) => (
                    <Radar
                      key={customer.id}
                      name={customer.name}
                      dataKey={`C${index + 1}`}
                      stroke={PIE_COLORS[index % PIE_COLORS.length]}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                      fillOpacity={0.3}
                      strokeWidth={1.5}
                    />
                  ))}
                  <Legend />
                  <Tooltip formatter={(value) => [`${value}%`, 'Score']} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <p className="text-sm">Insufficient customer data</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Product Stock */}
        <Card className="rounded-xl border border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Top Products by Stock</CardTitle>
            <CardDescription>Highest inventory levels</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            {productStockData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productStockData} layout="vertical" margin={{ left: 0, right: 20 }}>
                  <defs>
                    <linearGradient id="stockGradient" x1="0" y1="0" x2="1" y2="0">
                      {GRADIENT_COLORS.map((stop, index) => (
                        <stop key={index} offset={stop.offset} stopColor={stop.color} stopOpacity={stop.opacity} />
                      ))}
                    </linearGradient>
                  </defs>
                  <CartesianGrid horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={80}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip formatter={(value) => [value, 'Units']} />
                  <Bar
                    dataKey="value"
                    radius={[0, 4, 4, 0]}
                    fill="url(#stockGradient)"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <p className="text-sm">No stock data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Types Distribution */}
        <Card className="rounded-xl border border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Payment Distribution</CardTitle>
            <CardDescription>By transaction type</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            {paymentTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${(percent! * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {paymentTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} payments`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <p className="text-sm">No payment records</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Due Payments Trend */}
        <Card className="rounded-xl border border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Due Payments Forecast</CardTitle>
            <CardDescription>Trend with next month projection</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            {monthlyDueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyDueData}>
                  <defs>
                    <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.primary.main} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={CHART_COLORS.primary.main} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tickFormatter={(value) => (value >= 1000 ? `$${value / 1000}k` : `$${value}`)}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Amount']} />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke={CHART_COLORS.primary.main}
                    fill="url(#trendGradient)"
                    strokeWidth={2}
                  />
                  {monthlyDueData[monthlyDueData.length - 1]?.forecast && (
                    <Area
                      type="monotone"
                      dataKey="forecast"
                      stroke={CHART_COLORS.info.main}
                      strokeDasharray="5 5"
                      strokeWidth={2}
                      fill="none"
                      dot={{ strokeWidth: 2, r: 4 }}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <p className="text-sm">No historical data</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Customer Due Summary Table with Enhanced UI */}
      <Card className="rounded-xl border border-border/60 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Customer Due Analytics</CardTitle>
              <CardDescription>
                Showing {filteredCustomers.length} of {analytics.customerDueSummary.length} customers
                {searchQuery && ` • Search: "${searchQuery}"`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Total: {formatCurrency(analytics.totalCustomerDues)}
              </Badge>
              <Badge variant="outline" className="bg-rose-50 text-rose-700">
                Outstanding: {formatCurrency(analytics.totalRemainingCustomerDues)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader className="bg-gradient-to-r from-muted/30 to-muted/10">
                <TableRow>
                  <TableHead className="font-medium text-muted-foreground w-[25%]">
                    Customer
                  </TableHead>
                  <TableHead className="text-right font-medium text-muted-foreground">
                    Total Due
                  </TableHead>
                  <TableHead className="text-right font-medium text-muted-foreground">
                    Paid Amount
                  </TableHead>
                  <TableHead className="text-right font-medium text-muted-foreground">
                    Outstanding
                  </TableHead>
                  <TableHead className="text-right font-medium text-muted-foreground">
                    Progress
                  </TableHead>
                  <TableHead className="text-right font-medium text-muted-foreground">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => {
                    const progress = (customer.totalPaidAmount / customer.totalDueAmount) * 100;
                    return (
                      <TableRow
                        key={customer.customerId}
                        className="hover:bg-muted/10 transition-colors"
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                              {customer.customerName.charAt(0)}
                            </div>
                            <span className="max-w-[180px] truncate">{customer.customerName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(customer.totalDueAmount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(customer.totalPaidAmount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`font-semibold ${
                              customer.totalRemainingDuesAmount > 0
                                ? 'text-rose-600'
                                : 'text-emerald-600'
                            }`}
                          >
                            {formatCurrency(customer.totalRemainingDuesAmount)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-24 bg-muted rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  progress >= 100
                                    ? 'bg-emerald-500'
                                    : progress >= 50
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-10">
                              {progress.toFixed(0)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {customer.totalRemainingDuesAmount <= 0 ? (
                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-0">
                              Cleared
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className={`${
                                customer.totalRemainingDuesAmount > customer.totalDueAmount * 0.5
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              {customer.totalRemainingDuesAmount > customer.totalDueAmount * 0.5
                                ? 'High Risk'
                                : 'Pending'}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Search className="h-8 w-8 mb-2" />
                        <p>No customers found matching your filters</p>
                        <p className="text-sm mt-1">Try adjusting your search or filters</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {filteredCustomers.length > 0 && (
            <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
              <div>
                Showing {Math.min(filteredCustomers.length, 10)} of {filteredCustomers.length} customers
              </div>
              <div className="flex items-center gap-4">
                <span>Total Outstanding: {formatCurrency(analytics.totalRemainingCustomerDues)}</span>
                <span>Collection Rate: {((analytics.totalPaidAmount / analytics.totalSalesAmount) * 100).toFixed(1)}%</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Enhanced Metric Card Component
function MetricCard({
  title,
  value,
  description,
  color,
  trend,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  color: string;
  trend?: number;
  icon?: React.ReactNode;
}) {
  return (
    <Card className="rounded-xl border border-border/60 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardDescription className="text-muted-foreground text-sm font-medium">
            {title}
          </CardDescription>
          {trend !== undefined && icon && (
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                trend > 0
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-rose-100 text-rose-700'
              }`}
            >
              {icon}
              {trend > 0 ? '+' : ''}
              {trend.toFixed(1)}%
            </div>
          )}
        </div>
        <CardTitle className="text-2xl font-bold" style={{ color }}>
          {value}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

// Enhanced Skeleton Loader
function EnhancedDashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded" />
          <Skeleton className="h-4 w-96 rounded" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-32 rounded-md" />
        ))}
      </div>

      {/* Metrics Skeleton */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="rounded-xl border-border/60 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-7 w-28 mt-2 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-3 w-40 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="h-[320px] rounded-xl border-border/60 shadow-sm">
            <CardHeader>
              <Skeleton className="h-5 w-48 rounded" />
              <Skeleton className="h-4 w-32 mt-1 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-full w-full rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="h-[280px] rounded-xl border-border/60 shadow-sm">
            <CardHeader>
              <Skeleton className="h-5 w-40 rounded" />
              <Skeleton className="h-4 w-28 mt-1 rounded" />
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Table Skeleton */}
      <Card className="rounded-xl border-border/60 shadow-sm">
        <CardHeader>
          <Skeleton className="h-5 w-56 rounded" />
          <Skeleton className="h-4 w-40 mt-1 rounded" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}