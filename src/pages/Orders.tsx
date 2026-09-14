import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  Loader2,
  MapPin,
  Package,
  RefreshCcw,
  Search,
  ShoppingBag,
  Truck,
  User,
  WalletCards,
  X,
  XCircle,
} from "lucide-react";

import { useMemo, useState, type ElementType } from "react";

import {
  useCreateShiprocketOrder,
  useOrder,
  useOrders,
  useUpdateOrder,
} from "@/hooks/useOrders";

import type {
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/services/order.service";

import { formatCurrency } from "@/lib/utils";

/* =========================================================
   CONSTANTS
========================================================= */

const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

const PAYMENT_STATUSES: PaymentStatus[] = [
  "PENDING",
  "PROCESSING",
  "SUCCESS",
  "FAILED",
  "PARTIALLY_REFUNDED",
  "REFUNDED",
];

const PAYMENT_METHODS: PaymentMethod[] = ["COD", "ONLINE"];

/* =========================================================
   HELPERS
========================================================= */

const formatDate = (date?: string | null) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (date?: string | null) => {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatStatus = (value?: string | null) => {
  if (!value) return "—";

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

/* =========================================================
   STATUS CONFIG
========================================================= */

const orderStatusConfig: Record<
  OrderStatus,
  {
    className: string;
    icon: ElementType;
  }
> = {
  PENDING: {
    className: "border-amber-200 bg-amber-50 text-amber-700",
    icon: Clock3,
  },

  CONFIRMED: {
    className: "border-blue-200 bg-blue-50 text-blue-700",
    icon: CheckCircle2,
  },

  PROCESSING: {
    className: "border-violet-200 bg-violet-50 text-violet-700",
    icon: Package,
  },

  SHIPPED: {
    className: "border-indigo-200 bg-indigo-50 text-indigo-700",
    icon: Truck,
  },

  OUT_FOR_DELIVERY: {
    className: "border-cyan-200 bg-cyan-50 text-cyan-700",
    icon: Truck,
  },

  DELIVERED: {
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: CheckCircle2,
  },

  CANCELLED: {
    className: "border-red-200 bg-red-50 text-red-700",
    icon: XCircle,
  },
};

const paymentStatusConfig: Record<PaymentStatus, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  PROCESSING: "border-blue-200 bg-blue-50 text-blue-700",
  SUCCESS: "border-emerald-200 bg-emerald-50 text-emerald-700",
  FAILED: "border-red-200 bg-red-50 text-red-700",
  PARTIALLY_REFUNDED: "border-orange-200 bg-orange-50 text-orange-700",
  REFUNDED: "border-violet-200 bg-violet-50 text-violet-700",
};

/* =========================================================
   BADGES
========================================================= */

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = orderStatusConfig[status];

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${config.className}`}
    >
      <Icon className="h-3.5 w-3.5" />

      {formatStatus(status)}
    </span>
  );
}

function PaymentBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={`inline-flex rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold ${paymentStatusConfig[status]}`}
    >
      {formatStatus(status)}
    </span>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  className,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: ElementType;
  className: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div
        className={`absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-30 blur-2xl ${className}`}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>

          <p className="mt-1 text-xs text-slate-400">{description}</p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${className}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SELECT FILTER
========================================================= */

function SelectFilter({
  icon: Icon,
  value,
  onChange,
  placeholder,
  options,
}: {
  icon: ElementType;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: readonly string[];
}) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-8 text-xs font-medium text-slate-600 outline-none transition focus:border-slate-400 focus:bg-white"
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {formatStatus(option)}
          </option>
        ))}
      </select>
    </div>
  );
}

/* =========================================================
   INFO BOX
========================================================= */

function InfoBox({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-all text-xs font-semibold text-slate-700">
        {value ?? "—"}
      </p>
    </div>
  );
}

/* =========================================================
   PRICE ROW
========================================================= */

function PriceRow({
  label,
  value,
  negative = false,
  bold = false,
}: {
  label: string;
  value?: number | string | null;
  negative?: boolean;
  bold?: boolean;
}) {
  const amount = Number(value ?? 0);

  return (
    <div className="flex items-center justify-between gap-4">
      <span className={bold ? "font-bold text-slate-900" : "text-slate-500"}>
        {label}
      </span>

      <span
        className={
          bold
            ? "text-base font-bold text-slate-900"
            : negative
              ? "font-medium text-emerald-600"
              : "font-medium text-slate-700"
        }
      >
        {negative ? "- " : ""}
        {formatCurrency(Number.isFinite(amount) ? amount : 0)}
      </span>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function Orders() {
  const [search, setSearch] = useState("");

  const [status, setStatus] = useState<OrderStatus | "">("");

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | "">("");

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");

  const [dateFrom, setDateFrom] = useState("");

  const [dateTo, setDateTo] = useState("");

  const [page, setPage] = useState(1);

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const limit = 10;

  /* =======================================================
     LIST QUERY
  ======================================================= */

  const { data, isLoading, isFetching, isError, refetch } = useOrders({
    page,
    limit,
    orderNumber: search.trim() || undefined,
    status: status || undefined,
    paymentStatus: paymentStatus || undefined,
    paymentMethod: paymentMethod || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  /* =======================================================
     DETAIL QUERY
  ======================================================= */

  const {
    data: selectedOrder,
    isLoading: isOrderLoading,
    isError: isOrderError,
    refetch: refetchSelectedOrder,
  } = useOrder(selectedOrderId ?? undefined);

  /* =======================================================
     MUTATIONS
  ======================================================= */

  const updateMutation = useUpdateOrder();

  const shiprocketMutation = useCreateShiprocketOrder();

  const orders = data?.data ?? [];

  /* =======================================================
     STATS
  ======================================================= */

  const stats = useMemo(() => {
    const revenue = orders.reduce(
      (sum, order) => sum + Number(order.totalAmount ?? 0),
      0,
    );

    return {
      total: data?.total ?? 0,
      pending: orders.filter((order) => order.status === "PENDING").length,
      processing: orders.filter(
        (order) =>
          order.status === "CONFIRMED" || order.status === "PROCESSING",
      ).length,
      shipped: orders.filter(
        (order) =>
          order.status === "SHIPPED" || order.status === "OUT_FOR_DELIVERY",
      ).length,
      delivered: orders.filter((order) => order.status === "DELIVERED").length,
      cancelled: orders.filter((order) => order.status === "CANCELLED").length,
      revenue,
    };
  }, [orders, data?.total]);

  /* =======================================================
     FILTERS
  ======================================================= */

  const hasFilters = Boolean(
    search || status || paymentStatus || paymentMethod || dateFrom || dateTo,
  );

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setPaymentStatus("");
    setPaymentMethod("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  /* =======================================================
     UPDATE ORDER STATUS
  ======================================================= */

  const handleUpdateStatus = async (order: Order, newStatus: OrderStatus) => {
    try {
      await updateMutation.mutateAsync({
        id: order.id,
        payload: {
          status: newStatus,
        },
      });

      await Promise.all([refetch(), refetchSelectedOrder()]);
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  /* =======================================================
     UPDATE PAYMENT STATUS
  ======================================================= */

  const handleUpdatePaymentStatus = async (
    order: Order,
    newStatus: PaymentStatus,
  ) => {
    try {
      await updateMutation.mutateAsync({
        id: order.id,
        payload: {
          paymentStatus: newStatus,
        },
      });

      await Promise.all([refetch(), refetchSelectedOrder()]);
    } catch (error) {
      console.error("Failed to update payment status:", error);
    }
  };

  /* =======================================================
     SHIPROCKET
  ======================================================= */

  const handleShiprocket = async (order: Order) => {
    const confirmed = window.confirm(
      `Create/retry Shiprocket shipment for #${order.orderNumber}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await shiprocketMutation.mutateAsync(order.id);

      await Promise.all([refetch(), refetchSelectedOrder()]);
    } catch (error) {
      console.error("Shiprocket failed:", error);
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (isLoading) {
    return <OrdersSkeleton />;
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (isError) {
    return (
      <div className="flex min-h-[600px] items-center justify-center bg-slate-50">
        <div className="px-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>

          <h2 className="mt-4 text-lg font-bold text-slate-900">
            Failed to load orders
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Something went wrong while fetching orders.
          </p>

          <button
            onClick={() => refetch()}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <RefreshCcw className="h-4 w-4" />
            Try again
          </button>
        </div>
      </div>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="mx-auto max-w-[1600px] space-y-6 p-4 md:p-6 lg:p-8">
        {/* HEADER */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500" />

              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Sales
              </span>
            </div>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Orders
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage orders, payments and shipments.
            </p>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCcw
              className={isFetching ? "h-4 w-4 animate-spin" : "h-4 w-4"}
            />
            Refresh
          </button>
        </div>

        {/* STATS */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            title="Total Orders"
            value={stats.total}
            description="All orders"
            icon={ShoppingBag}
            className="bg-blue-50 text-blue-600"
          />

          <StatCard
            title="Pending"
            value={stats.pending}
            description="Awaiting confirmation"
            icon={Clock3}
            className="bg-amber-50 text-amber-600"
          />

          <StatCard
            title="Processing"
            value={stats.processing}
            description="Being prepared"
            icon={Package}
            className="bg-violet-50 text-violet-600"
          />

          <StatCard
            title="Shipped"
            value={stats.shipped}
            description="On the way"
            icon={Truck}
            className="bg-cyan-50 text-cyan-600"
          />

          <StatCard
            title="Delivered"
            value={stats.delivered}
            description="Successfully delivered"
            icon={CheckCircle2}
            className="bg-emerald-50 text-emerald-600"
          />
        </div>

        {/* SECONDARY STATS */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <WalletCards className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400">
                  Current Page Revenue
                </p>

                <p className="text-xl font-bold text-slate-900">
                  {formatCurrency(stats.revenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <XCircle className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400">Cancelled</p>

                <p className="text-xl font-bold text-slate-900">
                  {stats.cancelled}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Truck className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400">
                  Active Shipments
                </p>

                <p className="text-xl font-bold text-slate-900">
                  {stats.shipped}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FILTERS */}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-6">
            <div className="relative xl:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search order number..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </div>

            <SelectFilter
              icon={Package}
              value={status}
              onChange={(value) => {
                setStatus(value as OrderStatus | "");
                setPage(1);
              }}
              placeholder="Order status"
              options={ORDER_STATUSES}
            />

            <SelectFilter
              icon={WalletCards}
              value={paymentStatus}
              onChange={(value) => {
                setPaymentStatus(value as PaymentStatus | "");

                setPage(1);
              }}
              placeholder="Payment status"
              options={PAYMENT_STATUSES}
            />

            <SelectFilter
              icon={WalletCards}
              value={paymentMethod}
              onChange={(value) => {
                setPaymentMethod(value as PaymentMethod | "");

                setPage(1);
              }}
              placeholder="Payment method"
              options={PAYMENT_METHODS}
            />

            <div className="flex gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
                className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-600 outline-none focus:border-slate-400 focus:bg-white"
              />

              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                }}
                className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-600 outline-none focus:border-slate-400 focus:bg-white"
              />
            </div>
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-900"
            >
              <X className="h-3.5 w-3.5" />
              Clear filters
            </button>
          )}
        </div>

        {/* TABLE */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 md:px-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Order List</h2>

              <p className="mt-1 text-xs text-slate-400">
                {data?.total ?? 0} total orders
              </p>
            </div>

            {isFetching && (
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            )}
          </div>

          {orders.length === 0 ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center px-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <ShoppingBag className="h-6 w-6 text-slate-400" />
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-700">
                No orders found
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Try changing your filters.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1250px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Order
                      </th>

                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Customer
                      </th>

                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Items
                      </th>

                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Amount
                      </th>

                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Payment
                      </th>

                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Status
                      </th>

                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Date
                      </th>

                      <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        className="group transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700">
                            #{order.orderNumber}
                          </span>

                          <p className="mt-1 text-[10px] text-slate-400">
                            {order.id.slice(0, 12)}...
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-slate-800">
                            {order.user?.name ?? order.shippingName}
                          </p>

                          <p className="mt-0.5 text-[11px] text-slate-400">
                            {order.user?.email ?? order.shippingPhone}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-slate-400" />

                            <span className="text-sm font-semibold text-slate-700">
                              {order.items?.length ?? 0}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-slate-900">
                            {formatCurrency(Number(order.totalAmount ?? 0))}
                          </p>

                          <p className="mt-1 text-[10px] text-slate-400">
                            {order.paymentMethod}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <PaymentBadge status={order.paymentStatus} />
                        </td>

                        <td className="px-5 py-4">
                          <OrderStatusBadge status={order.status} />
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Clock3 className="h-3.5 w-3.5 text-slate-400" />

                            {formatDate(order.createdAt)}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => setSelectedOrderId(order.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 md:px-6">
                <p className="text-xs text-slate-500">
                  Page <b>{data?.page ?? page}</b> of{" "}
                  <b>{data?.totalPages ?? 1}</b>
                </p>

                <div className="flex gap-2">
                  <button
                    disabled={page <= 1 || isFetching}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <button
                    disabled={page >= (data?.totalPages ?? 1) || isFetching}
                    onClick={() => setPage((p) => p + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ===================================================
          DETAIL MODAL
      =================================================== */}

      {selectedOrderId && (
        <>
          {isOrderLoading ? (
            <OrderDetailModalSkeleton
              onClose={() => setSelectedOrderId(null)}
            />
          ) : isOrderError || !selectedOrder ? (
            <OrderDetailError
              onClose={() => setSelectedOrderId(null)}
              onRetry={() => refetchSelectedOrder()}
            />
          ) : (
            <OrderDetailModal
              order={selectedOrder}
              onClose={() => setSelectedOrderId(null)}
              onStatusChange={handleUpdateStatus}
              onPaymentStatusChange={handleUpdatePaymentStatus}
              onCreateShiprocket={() => handleShiprocket(selectedOrder)}
              updating={updateMutation.isPending}
              creatingShipment={shiprocketMutation.isPending}
            />
          )}
        </>
      )}
    </div>
  );
}

/* =========================================================
   ORDER DETAIL MODAL
========================================================= */

function OrderDetailModal({
  order,
  onClose,
  onStatusChange,
  onPaymentStatusChange,
  onCreateShiprocket,
  updating,
  creatingShipment,
}: {
  order: Order;
  onClose: () => void;
  onStatusChange: (order: Order, status: OrderStatus) => void;
  onPaymentStatusChange: (order: Order, status: PaymentStatus) => void;
  onCreateShiprocket: () => void;
  updating: boolean;
  creatingShipment: boolean;
}) {
  const payment = Array.isArray(order.payment)
    ? order.payment[0]
    : order.payment;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* HEADER */}

        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white p-5 md:p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Order Details
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              #{order.orderNumber}
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {formatDateTime(order.createdAt)}
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-5 md:p-6">
          {/* SUMMARY */}

          <div className="rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-white p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-slate-500">Order Status</p>

                <div className="mt-2">
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>

              <div className="sm:text-right">
                <p className="text-xs text-slate-400">Total Amount</p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {formatCurrency(Number(order.totalAmount ?? 0))}
                </p>
              </div>
            </div>
          </div>

          {/* CUSTOMER + ADDRESS */}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-slate-500" />

                <h3 className="text-sm font-bold text-slate-900">Customer</h3>
              </div>

              <div className="mt-4 space-y-1">
                <p className="text-sm font-semibold text-slate-800">
                  {order.user?.name ?? order.shippingName}
                </p>

                <p className="text-xs text-slate-400">
                  {order.user?.email ?? "—"}
                </p>

                <p className="text-xs text-slate-400">
                  {order.user?.phone ?? order.shippingPhone}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-500" />

                <h3 className="text-sm font-bold text-slate-900">
                  Delivery Address
                </h3>
              </div>

              <div className="mt-4 text-sm leading-6 text-slate-600">
                <p className="font-semibold text-slate-800">
                  {order.shippingName}
                </p>

                <p>{order.shippingAddressLine1}</p>

                {order.shippingAddressLine2 && (
                  <p>{order.shippingAddressLine2}</p>
                )}

                <p>
                  {order.shippingCity}, {order.shippingState}
                </p>

                <p>
                  {order.shippingPincode}, {order.shippingCountry}
                </p>

                <p className="mt-1 font-medium">Phone: {order.shippingPhone}</p>
              </div>
            </div>
          </div>

          {/* ITEMS */}

          <div className="rounded-2xl border border-slate-200 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Order Items</h3>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                {order.items?.length ?? 0} items
              </span>
            </div>

            {order.items?.length ? (
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800">
                        {item.productName}
                      </p>

                      <div className="mt-1 flex flex-wrap gap-3 text-[11px] text-slate-400">
                        <span>Variant: {item.variantName}</span>

                        <span>SKU: {item.productSku}</span>

                        <span>Qty: {item.quantity}</span>
                      </div>

                      {(item.returnedQuantity > 0 ||
                        item.refundedQuantity > 0) && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {item.returnedQuantity > 0 && (
                            <span className="rounded-md bg-orange-50 px-2 py-1 text-[10px] font-semibold text-orange-600">
                              Returned: {item.returnedQuantity}
                            </span>
                          )}

                          {item.refundedQuantity > 0 && (
                            <span className="rounded-md bg-violet-50 px-2 py-1 text-[10px] font-semibold text-violet-600">
                              Refunded: {item.refundedQuantity}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 text-left sm:text-right">
                      <p className="text-sm font-bold text-slate-900">
                        {formatCurrency(Number(item.totalAmount ?? 0))}
                      </p>

                      <p className="mt-1 text-[10px] text-slate-400">
                        {formatCurrency(Number(item.productPrice ?? 0))} ×{" "}
                        {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl bg-slate-50 p-6 text-center text-xs text-slate-400">
                No order items found.
              </div>
            )}
          </div>

          {/* PRICE + PAYMENT */}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-5">
              <h3 className="text-sm font-bold text-slate-900">
                Price Breakdown
              </h3>

              <div className="mt-4 space-y-3">
                <PriceRow label="Subtotal" value={order.subtotal} />

                <PriceRow label="Shipping" value={order.shippingAmount} />

                <PriceRow label="Tax" value={order.taxAmount} />

                <PriceRow
                  label="Discount"
                  value={order.discountAmount}
                  negative
                />

                <div className="border-t border-slate-100 pt-3">
                  <PriceRow label="Total" value={order.totalAmount} bold />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5">
              <h3 className="text-sm font-bold text-slate-900">Payment</h3>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-slate-400">Method</span>

                  <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700">
                    {order.paymentMethod}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-slate-400">Status</span>

                  <PaymentBadge status={order.paymentStatus} />
                </div>

                {payment?.amount != null && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-slate-400">
                      Payment Amount
                    </span>

                    <span className="text-sm font-bold text-slate-800">
                      {formatCurrency(Number(payment.amount ?? 0))}
                    </span>
                  </div>
                )}

                {payment?.gateway && (
                  <InfoBox label="Gateway" value={payment.gateway} />
                )}

                {payment?.gatewayOrderId && (
                  <InfoBox
                    label="Gateway Order ID"
                    value={payment.gatewayOrderId}
                  />
                )}

                {payment?.gatewayPaymentId && (
                  <InfoBox
                    label="Gateway Payment ID"
                    value={payment.gatewayPaymentId}
                  />
                )}

                {payment?.paidAt && (
                  <div>
                    <p className="text-xs text-slate-400">Paid At</p>

                    <p className="mt-1 text-xs font-semibold text-slate-700">
                      {formatDateTime(payment.paidAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SHIPMENT */}

          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-indigo-600" />

                <h3 className="text-sm font-bold text-indigo-900">Shipment</h3>
              </div>

              {!order.shiprocketOrderId && (
                <button
                  onClick={onCreateShiprocket}
                  disabled={creatingShipment}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creatingShipment ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Truck className="h-3.5 w-3.5" />
                  )}

                  {creatingShipment ? "Creating..." : "Create Shipment"}
                </button>
              )}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <InfoBox
                label="Shiprocket Order"
                value={order.shiprocketOrderId ?? "Not created"}
              />

              <InfoBox label="Shipment ID" value={order.shiprocketShipmentId} />

              <InfoBox label="AWB" value={order.awbCode} />

              <InfoBox label="Courier" value={order.courierName} />

              <InfoBox
                label="Delivered"
                value={formatDateTime(order.deliveredAt)}
              />

              <InfoBox
                label="Cancelled"
                value={formatDateTime(order.cancelledAt)}
              />
            </div>
          </div>

          {/* UPDATE */}

          <div className="rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center gap-2">
              <RefreshCcw className="h-4 w-4 text-slate-500" />

              <h3 className="text-sm font-bold text-slate-900">Update Order</h3>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-slate-500">
                  Order Status
                </label>

                <select
                  value={order.status}
                  disabled={updating}
                  onChange={(e) =>
                    onStatusChange(order, e.target.value as OrderStatus)
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400 disabled:opacity-60"
                >
                  {ORDER_STATUSES.map((item) => (
                    <option key={item} value={item}>
                      {formatStatus(item)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-slate-500">
                  Payment Status
                </label>

                <select
                  value={order.paymentStatus}
                  disabled={updating}
                  onChange={(e) =>
                    onPaymentStatusChange(
                      order,
                      e.target.value as PaymentStatus,
                    )
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400 disabled:opacity-60"
                >
                  {PAYMENT_STATUSES.map((item) => (
                    <option key={item} value={item}>
                      {formatStatus(item)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {updating && (
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Updating order...
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}

        <div className="sticky bottom-0 flex justify-end border-t border-slate-100 bg-white p-5 md:p-6">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DETAIL LOADING
========================================================= */

function OrderDetailModalSkeleton({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />

            <div className="mt-2 h-6 w-40 animate-pulse rounded bg-slate-200" />

            <div className="mt-2 h-3 w-32 animate-pulse rounded bg-slate-100" />
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-5 md:p-6">
          <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="h-36 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-36 animate-pulse rounded-2xl bg-slate-100" />
          </div>

          <div className="h-56 animate-pulse rounded-2xl bg-slate-100" />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="h-56 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-56 animate-pulse rounded-2xl bg-slate-100" />
          </div>

          <div className="h-44 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DETAIL ERROR
========================================================= */

function OrderDetailError({
  onClose,
  onRetry,
}: {
  onClose: () => void;
  onRetry: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
          <AlertCircle className="h-6 w-6 text-red-500" />
        </div>

        <h3 className="mt-4 text-lg font-bold text-slate-900">
          Failed to load order
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          We couldn't load the complete order details.
        </p>

        <div className="mt-5 flex justify-center gap-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>

          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <RefreshCcw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PAGE SKELETON
========================================================= */

function OrdersSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <div className="h-20 animate-pulse rounded-2xl bg-slate-200" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-2xl bg-slate-200"
            />
          ))}
        </div>

        <div className="h-28 animate-pulse rounded-2xl bg-slate-200" />

        <div className="h-20 animate-pulse rounded-2xl bg-slate-200" />

        <div className="h-[650px] animate-pulse rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}
