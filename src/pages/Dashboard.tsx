import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Package,
  RefreshCcw,
  ShoppingCart,
  Users,
} from "lucide-react";
import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useMemo, useState } from "react";

import { useDashboard } from "@/hooks/useDashboard";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-IN").format(value);

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatChartDate = (date: string) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });

const formatStatus = (status: string) =>
  status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
  PROCESSING: "bg-violet-50 text-violet-700 border-violet-200",
  SHIPPED: "bg-indigo-50 text-indigo-700 border-indigo-200",
  OUT_FOR_DELIVERY: "bg-cyan-50 text-cyan-700 border-cyan-200",
  DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",

  SUCCESS: "bg-emerald-50 text-emerald-700 border-emerald-200",
  FAILED: "bg-red-50 text-red-700 border-red-200",
  REFUNDED: "bg-orange-50 text-orange-700 border-orange-200",
  PARTIALLY_REFUNDED: "bg-orange-50 text-orange-700 border-orange-200",
};

const chartColors = [
  "#6366f1",
  "#06b6d4",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
];

const paymentColors = ["#10b981", "#f59e0b", "#ef4444", "#6366f1", "#8b5cf6"];

function GrowthBadge({
  percentage,
  direction,
}: {
  percentage: number;
  direction: "up" | "down" | "neutral";
}) {
  if (direction === "neutral") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">
        <Activity className="h-3 w-3" />
        0%
      </span>
    );
  }

  const up = direction === "up";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
        up ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
      }`}
    >
      {up ? (
        <ArrowUpRight className="h-3.5 w-3.5" />
      ) : (
        <ArrowDownRight className="h-3.5 w-3.5" />
      )}
      {percentage}%
    </span>
  );
}

function MetricCard({
  title,
  value,
  previous,
  growth,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  title: string;
  value: string;
  previous: string;
  growth: {
    percentage: number;
    direction: "up" | "down" | "neutral";
  };
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div
        className={`absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-50 blur-2xl ${iconBg}`}
      />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>

            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {value}
            </p>
          </div>

          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg} ${iconColor} transition-transform duration-300 group-hover:scale-110`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GrowthBadge
              percentage={growth.percentage}
              direction={growth.direction}
            />

            <span className="text-xs text-slate-400">vs previous</span>
          </div>

          <span className="text-xs font-medium text-slate-400">
            Prev: {previous}
          </span>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  description,
  right,
}: {
  title: string;
  description?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <div>
        <h2 className="text-base font-bold text-slate-900">{title}</h2>

        {description && (
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        )}
      </div>

      {right}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[250px] flex-col items-center justify-center text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
        <Icon className="h-5 w-5 text-slate-400" />
      </div>

      <p className="mt-4 text-sm font-semibold text-slate-700">{title}</p>

      <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
        {description}
      </p>
    </div>
  );
}

function CustomChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl">
      <p className="mb-2 text-xs font-medium text-slate-400">{label}</p>

      {payload.map((item: any) => (
        <div key={item.dataKey} className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{
              backgroundColor: item.color,
            }}
          />

          <span className="text-xs font-medium text-slate-600">
            {item.name}
          </span>

          <span className="ml-3 text-sm font-bold text-slate-900">
            {formatCurrency(Number(item.value))}
          </span>
        </div>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0];

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl">
      <p className="text-xs font-medium text-slate-400">
        {formatStatus(item.name)}
      </p>

      <p className="mt-1 text-lg font-bold text-slate-900">
        {formatNumber(Number(item.value))}
      </p>

      <p className="text-xs text-slate-400">
        {item.payload?.percentage ?? 0}% of total
      </p>
    </div>
  );
}

export default function Dashboard() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [appliedDates, setAppliedDates] = useState<{
    startDate?: string;
    endDate?: string;
  }>({});

  const { data, isLoading, isFetching, isError, refetch } =
    useDashboard(appliedDates);

  const salesData = useMemo(() => {
    if (!data) return [];

    return data.salesChart.map((item) => ({
      ...item,
      displayDate: formatChartDate(item.date),
    }));
  }, [data]);

  const orderPieData = useMemo(() => {
    if (!data) return [];

    const total = data.orderStatus.reduce((sum, item) => sum + item.count, 0);

    return data.orderStatus.map((item) => ({
      name: item.status,
      value: item.count,
      percentage: total > 0 ? ((item.count / total) * 100).toFixed(1) : 0,
    }));
  }, [data]);

  const paymentPieData = useMemo(() => {
    if (!data) return [];

    const total = data.paymentStatus.reduce((sum, item) => sum + item.count, 0);

    return data.paymentStatus.map((item) => ({
      name: item.status,
      value: item.count,
      amount: item.amount,
      percentage: total > 0 ? ((item.count / total) * 100).toFixed(1) : 0,
    }));
  }, [data]);

  const applyFilter = () => {
    setAppliedDates({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  const resetFilter = () => {
    setStartDate("");
    setEndDate("");
    setAppliedDates({});
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-[600px] items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>

          <h2 className="mt-4 text-lg font-bold text-slate-900">
            Unable to load dashboard
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Something went wrong while loading your data.
          </p>

          <button
            onClick={() => refetch()}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <RefreshCcw className="h-4 w-4" />
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="mx-auto max-w-[1600px] space-y-6 p-4 md:p-6 lg:p-8">
        {/* HEADER */}
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />

              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                Store Overview
              </span>
            </div>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Track your store performance, sales and customers.
            </p>
          </div>

          {/* DATE FILTER */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
              <CalendarDays className="h-4 w-4 text-slate-400" />

              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-[125px] bg-transparent text-sm text-slate-700 outline-none"
              />

              <span className="text-slate-300">→</span>

              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-[125px] bg-transparent text-sm text-slate-700 outline-none"
              />
            </div>

            <button
              onClick={applyFilter}
              disabled={isFetching}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
            >
              {isFetching ? (
                <RefreshCcw className="h-4 w-4 animate-spin" />
              ) : (
                <Activity className="h-4 w-4" />
              )}
              Apply
            </button>

            {(startDate || endDate) && (
              <button
                onClick={resetFilter}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* PERIOD */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-lg bg-white px-3 py-1.5 font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">
            {formatDate(data.period.startDate)}
          </span>

          <span className="text-slate-400">→</span>

          <span className="rounded-lg bg-white px-3 py-1.5 font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">
            {formatDate(data.period.endDate)}
          </span>

          <span className="ml-2 text-slate-400">Compared with</span>

          <span className="font-medium text-slate-500">
            {formatDate(data.comparisonPeriod.startDate)} →{" "}
            {formatDate(data.comparisonPeriod.endDate)}
          </span>
        </div>

        {/* METRIC CARDS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Revenue"
            value={formatCurrency(data.overview.revenue.current)}
            previous={formatCurrency(data.overview.revenue.previous)}
            growth={data.overview.revenue}
            icon={CircleDollarSign}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          />

          <MetricCard
            title="Orders"
            value={formatNumber(data.overview.orders.current)}
            previous={formatNumber(data.overview.orders.previous)}
            growth={data.overview.orders}
            icon={ShoppingCart}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />

          <MetricCard
            title="New Customers"
            value={formatNumber(data.overview.customers.current)}
            previous={formatNumber(data.overview.customers.previous)}
            growth={data.overview.customers}
            icon={Users}
            iconBg="bg-violet-50"
            iconColor="text-violet-600"
          />

          <MetricCard
            title="Average Order Value"
            value={formatCurrency(data.overview.averageOrderValue.current)}
            previous={formatCurrency(data.overview.averageOrderValue.previous)}
            growth={data.overview.averageOrderValue}
            icon={Activity}
            iconBg="bg-orange-50"
            iconColor="text-orange-600"
          />
        </div>

        {/* SALES CHART */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <SectionHeader
            title="Sales Overview"
            description="Revenue generated throughout the selected period."
            right={
              <div className="hidden items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 sm:flex">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />

                <span className="text-xs font-semibold text-slate-600">
                  Revenue
                </span>
              </div>
            }
          />

          {salesData.length === 0 ? (
            <EmptyState
              icon={CircleDollarSign}
              title="No sales data"
              description="Sales activity will appear here once payments are recorded."
            />
          ) : (
            <div className="h-[340px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={salesData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 10,
                    bottom: 5,
                  }}
                >
                  <defs>
                    <linearGradient
                      id="salesGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#6366f1"
                        stopOpacity={0.28}
                      />

                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid vertical={false} stroke="#f1f5f9" />

                  <XAxis
                    dataKey="displayDate"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#94a3b8",
                      fontSize: 11,
                    }}
                    minTickGap={25}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#94a3b8",
                      fontSize: 11,
                    }}
                    tickFormatter={(value) => `₹${Number(value) / 1000}k`}
                  />

                  <Tooltip
                    cursor={{
                      stroke: "#c7d2fe",
                      strokeWidth: 1,
                      strokeDasharray: "4 4",
                    }}
                    content={<CustomChartTooltip />}
                  />

                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{
                      r: 3,
                      fill: "#6366f1",
                      strokeWidth: 0,
                    }}
                    activeDot={{
                      r: 6,
                      fill: "#6366f1",
                      stroke: "#fff",
                      strokeWidth: 3,
                    }}
                    fill="url(#salesGradient)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* ORDER + PAYMENT */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* ORDER STATUS */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <SectionHeader
              title="Order Status"
              description="How orders are distributed across their current status."
            />

            {orderPieData.length === 0 ? (
              <EmptyState
                icon={ShoppingCart}
                title="No orders yet"
                description="Order status data will appear once your store receives orders."
              />
            ) : (
              <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[1fr_220px]">
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orderPieData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={72}
                        outerRadius={105}
                        paddingAngle={3}
                        strokeWidth={0}
                      >
                        {orderPieData.map((_, index) => (
                          <Cell
                            key={index}
                            fill={chartColors[index % chartColors.length]}
                          />
                        ))}
                      </Pie>

                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-3">
                  {orderPieData.map((item, index) => (
                    <div
                      key={item.name}
                      className="group flex cursor-default items-center justify-between rounded-xl border border-transparent p-2.5 transition hover:border-slate-200 hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              chartColors[index % chartColors.length],
                          }}
                        />

                        <span className="text-xs font-medium text-slate-600">
                          {formatStatus(item.name)}
                        </span>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">
                          {item.value}
                        </p>

                        <p className="text-[10px] text-slate-400">
                          {item.percentage}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* PAYMENT STATUS */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <SectionHeader
              title="Payment Status"
              description="Payment count and value for the selected period."
            />

            {paymentPieData.length === 0 ? (
              <EmptyState
                icon={CircleDollarSign}
                title="No payment data"
                description="Payment records will appear here after transactions."
              />
            ) : (
              <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[1fr_220px]">
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentPieData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={72}
                        outerRadius={105}
                        paddingAngle={3}
                        strokeWidth={0}
                      >
                        {paymentPieData.map((_, index) => (
                          <Cell
                            key={index}
                            fill={paymentColors[index % paymentColors.length]}
                          />
                        ))}
                      </Pie>

                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-3">
                  {paymentPieData.map((item, index) => (
                    <div
                      key={item.name}
                      className="group rounded-xl border border-transparent p-3 transition hover:border-slate-200 hover:bg-slate-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{
                              backgroundColor:
                                paymentColors[index % paymentColors.length],
                            }}
                          />

                          <span className="text-xs font-semibold text-slate-600">
                            {formatStatus(item.name)}
                          </span>
                        </div>

                        <span className="text-sm font-bold text-slate-900">
                          {item.value}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">
                          {item.percentage}% of payments
                        </span>

                        <span className="text-xs font-semibold text-slate-700">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* TOP PRODUCTS + INVENTORY */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* TOP PRODUCTS */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2 md:p-6">
            <SectionHeader
              title="Top Products"
              description="Best selling products during this period."
            />

            {data.topProducts.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No product sales"
                description="Your best-selling products will appear here once orders are placed."
              />
            ) : (
              <div className="space-y-2">
                {data.topProducts.map((product, index) => (
                  <div
                    key={product.productName}
                    className="group flex items-center gap-4 rounded-xl border border-transparent p-3 transition hover:border-slate-200 hover:bg-slate-50"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                        index === 0
                          ? "bg-amber-100 text-amber-700"
                          : index === 1
                            ? "bg-slate-200 text-slate-700"
                            : index === 2
                              ? "bg-orange-100 text-orange-700"
                              : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      #{index + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {product.productName}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {formatNumber(product.quantity)} units sold
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">
                        {formatCurrency(product.revenue)}
                      </p>

                      <p className="mt-1 text-[10px] text-slate-400">Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* INVENTORY */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <SectionHeader
              title="Inventory"
              description="Current stock overview."
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-blue-50 p-4">
                <Package className="h-5 w-5 text-blue-600" />

                <p className="mt-3 text-xs font-medium text-blue-600">
                  Products
                </p>

                <p className="mt-1 text-2xl font-bold text-blue-950">
                  {formatNumber(data.inventory.totalProducts)}
                </p>
              </div>

              <div className="rounded-xl bg-violet-50 p-4">
                <Boxes className="h-5 w-5 text-violet-600" />

                <p className="mt-3 text-xs font-medium text-violet-600">
                  Variants
                </p>

                <p className="mt-1 text-2xl font-bold text-violet-950">
                  {formatNumber(data.inventory.totalVariants)}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">Low Stock</h3>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                    data.inventory.lowStock.length
                      ? "bg-red-50 text-red-600"
                      : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  {data.inventory.lowStock.length}
                </span>
              </div>

              {data.inventory.lowStock.length === 0 ? (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />

                    <p className="text-xs font-semibold text-emerald-700">
                      Inventory looks healthy
                    </p>
                  </div>

                  <p className="mt-1 text-[11px] text-emerald-600/70">
                    No variants are currently low on stock.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {data.inventory.lowStock.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50/50 p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-slate-800">
                          {item.product.name}
                        </p>

                        <p className="mt-0.5 text-[10px] text-slate-400">
                          {item.sku}
                        </p>
                      </div>

                      <span className="ml-3 shrink-0 rounded-lg bg-red-100 px-2 py-1 text-[10px] font-bold text-red-600">
                        {item.stock} left
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="group rounded-2xl border border-slate-200 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                <Users className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">
                  New Customers
                </p>

                <p className="text-xl font-bold text-slate-900">
                  {formatNumber(data.customers.newCustomers)}
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-400">
              Customers registered during selected period.
            </p>
          </div>

          <div className="group rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Users className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Active Customers
                </p>

                <p className="text-xl font-bold text-slate-900">
                  {formatNumber(data.customers.activeCustomers)}
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-400">
              Currently active customer accounts.
            </p>
          </div>

          <div className="group rounded-2xl border border-slate-200 bg-gradient-to-br from-orange-50 to-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                <RefreshCcw className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Pending Returns
                </p>

                <p className="text-xl font-bold text-slate-900">
                  {formatNumber(data.returns.pending)}
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-400">
              Returns waiting for admin attention.
            </p>
          </div>
        </div>

        {/* RECENT ORDERS */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <SectionHeader
            title="Recent Orders"
            description="Latest orders from your customers."
          />

          {data.recentOrders.length === 0 ? (
            <EmptyState
              icon={ShoppingCart}
              title="No recent orders"
              description="New orders will appear here automatically."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-slate-100 text-left">
                    <th className="pb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Order
                    </th>

                    <th className="pb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Customer
                    </th>

                    <th className="pb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Items
                    </th>

                    <th className="pb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Amount
                    </th>

                    <th className="pb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Status
                    </th>

                    <th className="pb-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {data.recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="group transition hover:bg-slate-50"
                    >
                      <td className="py-4">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700">
                          #{order.orderNumber}
                        </span>
                      </td>

                      <td className="py-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {order.customer.name}
                          </p>

                          <p className="mt-0.5 text-[11px] text-slate-400">
                            {order.customer.email}
                          </p>
                        </div>
                      </td>

                      <td className="py-4 text-sm text-slate-500">
                        {order.itemsCount}
                      </td>

                      <td className="py-4 text-sm font-bold text-slate-900">
                        {formatCurrency(order.totalAmount)}
                      </td>

                      <td className="py-4">
                        <span
                          className={`inline-flex rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${
                            statusStyles[order.status] ??
                            "border-slate-200 bg-slate-50 text-slate-600"
                          }`}
                        >
                          {formatStatus(order.status)}
                        </span>
                      </td>

                      <td className="py-4 text-right">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock3 className="h-3.5 w-3.5" />

                          {formatDate(order.createdAt)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <div className="h-20 animate-pulse rounded-2xl bg-slate-200" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-2xl bg-slate-200"
            />
          ))}
        </div>

        <div className="h-[410px] animate-pulse rounded-2xl bg-slate-200" />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="h-[390px] animate-pulse rounded-2xl bg-slate-200" />
          <div className="h-[390px] animate-pulse rounded-2xl bg-slate-200" />
        </div>

        <div className="h-[350px] animate-pulse rounded-2xl bg-slate-200" />

        <div className="h-[400px] animate-pulse rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}
