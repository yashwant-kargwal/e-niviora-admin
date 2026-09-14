import {
  AlertCircle,
  Banknote,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  Eye,
  Filter,
  Loader2,
  RefreshCcw,
  Search,
  ShieldCheck,
  User,
  WalletCards,
  X,
  XCircle,
  RotateCcw,
} from "lucide-react";

import { useMemo, useState, type ElementType } from "react";

import { usePayment, usePayments } from "@/hooks/usePayments";

import type {
  Payment,
  PaymentGateway,
  PaymentMethod,
  PaymentStatus,
} from "@/services/payment.service";
import { formatCurrency } from "@/lib/utils";

/* =========================================================
   CONSTANTS
========================================================= */

const PAYMENT_STATUSES: PaymentStatus[] = [
  "PENDING",
  "PROCESSING",
  "SUCCESS",
  "FAILED",
  "PARTIALLY_REFUNDED",
  "REFUNDED",
];

const PAYMENT_METHODS: PaymentMethod[] = ["COD", "ONLINE"];

const PAYMENT_GATEWAYS: PaymentGateway[] = ["RAZORPAY"];

/* =========================================================
   HELPERS
========================================================= */

const formatStatus = (value?: string | null) => {
  if (!value) return "—";

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatDate = (value?: string | null) => {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* =========================================================
   STATUS CONFIG
========================================================= */

const paymentStatusConfig: Record<
  PaymentStatus,
  {
    className: string;
    icon: ElementType;
  }
> = {
  PENDING: {
    className: "border-amber-200 bg-amber-50 text-amber-700",
    icon: Clock3,
  },

  PROCESSING: {
    className: "border-blue-200 bg-blue-50 text-blue-700",
    icon: Loader2,
  },

  SUCCESS: {
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: CheckCircle2,
  },

  FAILED: {
    className: "border-red-200 bg-red-50 text-red-700",
    icon: XCircle,
  },

  PARTIALLY_REFUNDED: {
    className: "border-orange-200 bg-orange-50 text-orange-700",
    icon: RotateCcw,
  },

  REFUNDED: {
    className: "border-violet-200 bg-violet-50 text-violet-700",
    icon: RotateCcw,
  },
};

/* =========================================================
   PAYMENT BADGE
========================================================= */

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const config = paymentStatusConfig[status];

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
   SELECT
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
  mono = false,
}: {
  label: string;

  value: string;

  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 break-all text-xs font-semibold text-slate-700 ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function Payments() {
  /* =======================================================
     FILTER STATE
  ======================================================= */

  const [orderId, setOrderId] = useState("");

  const [status, setStatus] = useState<PaymentStatus | "">("");

  const [method, setMethod] = useState<PaymentMethod | "">("");

  const [gateway, setGateway] = useState<PaymentGateway | "">("");

  const [dateFrom, setDateFrom] = useState("");

  const [dateTo, setDateTo] = useState("");

  const [page, setPage] = useState(1);

  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(
    null,
  );

  const limit = 10;

  /* =======================================================
     PAYMENT LIST
  ======================================================= */

  const { data, isLoading, isFetching, isError, refetch } = usePayments({
    page,

    limit,

    orderId: orderId.trim() || undefined,

    status: status || undefined,

    method: method || undefined,

    gateway: gateway || undefined,

    dateFrom: dateFrom || undefined,

    dateTo: dateTo || undefined,
  });

  const payments = data?.data ?? [];

  /* =======================================================
     PAYMENT DETAIL
  ======================================================= */

  const {
    data: selectedPayment,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = usePayment(selectedPaymentId ?? "");

  /* =======================================================
     PAGE STATS
  ======================================================= */

  const stats = useMemo(() => {
    const totalAmount = payments.reduce(
      (total, payment) => total + Number(payment.amount),
      0,
    );

    const successfulAmount = payments
      .filter((payment) => payment.status === "SUCCESS")
      .reduce((total, payment) => total + Number(payment.amount), 0);

    const refundedAmount = payments
      .filter(
        (payment) =>
          payment.status === "REFUNDED" ||
          payment.status === "PARTIALLY_REFUNDED",
      )
      .reduce((total, payment) => total + Number(payment.amount), 0);

    return {
      total: data?.total ?? 0,

      totalAmount,

      successfulAmount,

      refundedAmount,

      successfulCount: payments.filter(
        (payment) => payment.status === "SUCCESS",
      ).length,

      pendingCount: payments.filter(
        (payment) =>
          payment.status === "PENDING" || payment.status === "PROCESSING",
      ).length,

      failedCount: payments.filter((payment) => payment.status === "FAILED")
        .length,
    };
  }, [payments, data?.total]);

  /* =======================================================
     FILTER STATE
  ======================================================= */

  const hasFilters = Boolean(
    orderId || status || method || gateway || dateFrom || dateTo,
  );

  const clearFilters = () => {
    setOrderId("");
    setStatus("");
    setMethod("");
    setGateway("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (isLoading) {
    return <PaymentsSkeleton />;
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
            Failed to load payments
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Something went wrong while fetching payments.
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
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Finance
              </span>
            </div>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Payments
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Track payment transactions, gateways and payment status.
            </p>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCcw
              className={isFetching ? "h-4 w-4 animate-spin" : "h-4 w-4"}
            />
            Refresh
          </button>
        </div>

        {/* =================================================
            STATS
        ================================================= */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Payments"
            value={stats.total}
            description="Payments in current result"
            icon={CreditCard}
            className="bg-blue-50 text-blue-600"
          />

          <StatCard
            title="Successful"
            value={stats.successfulCount}
            description="Successfully completed"
            icon={CheckCircle2}
            className="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            title="Pending"
            value={stats.pendingCount}
            description="Pending or processing"
            icon={Clock3}
            className="bg-amber-50 text-amber-600"
          />

          <StatCard
            title="Failed"
            value={stats.failedCount}
            description="Failed transactions"
            icon={XCircle}
            className="bg-red-50 text-red-600"
          />
        </div>

        {/* =================================================
            MONEY SUMMARY
        ================================================= */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <WalletCards className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400">
                  Page Payment Value
                </p>

                <p className="text-xl font-bold text-slate-900">
                  {formatCurrency(stats.totalAmount)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Banknote className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400">
                  Successful Value
                </p>

                <p className="text-xl font-bold text-slate-900">
                  {formatCurrency(stats.successfulAmount)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <RotateCcw className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400">
                  Refunded Payment Value
                </p>

                <p className="text-xl font-bold text-slate-900">
                  {formatCurrency(stats.refundedAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            FILTERS
        ================================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Filter className="h-4 w-4" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-900">Filters</h2>

              <p className="text-[11px] text-slate-400">
                Narrow down payment transactions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-6">
            {/* ORDER ID */}

            <div className="relative xl:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={orderId}
                onChange={(e) => {
                  setOrderId(e.target.value);

                  setPage(1);
                }}
                placeholder="Search by Order ID..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </div>

            {/* STATUS */}

            <SelectFilter
              icon={CreditCard}
              value={status}
              onChange={(value) => {
                setStatus(value as PaymentStatus | "");

                setPage(1);
              }}
              placeholder="Payment status"
              options={PAYMENT_STATUSES}
            />

            {/* METHOD */}

            <SelectFilter
              icon={WalletCards}
              value={method}
              onChange={(value) => {
                setMethod(value as PaymentMethod | "");

                setPage(1);
              }}
              placeholder="Payment method"
              options={PAYMENT_METHODS}
            />

            {/* GATEWAY */}

            <SelectFilter
              icon={ShieldCheck}
              value={gateway}
              onChange={(value) => {
                setGateway(value as PaymentGateway | "");

                setPage(1);
              }}
              placeholder="Gateway"
              options={PAYMENT_GATEWAYS}
            />

            {/* DATES */}

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

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 md:px-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Payment Transactions
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                {data?.total ?? 0} total payments
              </p>
            </div>

            {isFetching && (
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            )}
          </div>

          {/* EMPTY */}

          {payments.length === 0 ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center px-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <CreditCard className="h-6 w-6 text-slate-400" />
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-700">
                No payments found
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
                        Payment
                      </th>

                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Customer
                      </th>

                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Order
                      </th>

                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Amount
                      </th>

                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Method
                      </th>

                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Gateway
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
                    {payments.map((payment) => (
                      <tr
                        key={payment.id}
                        className="group transition hover:bg-slate-50"
                      >
                        {/* PAYMENT */}

                        <td className="px-5 py-4">
                          <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700">
                            {payment.id.slice(0, 10)}
                            ...
                          </span>

                          {payment.gatewayPaymentId && (
                            <p className="mt-1 max-w-[160px] truncate font-mono text-[10px] text-slate-400">
                              {payment.gatewayPaymentId}
                            </p>
                          )}
                        </td>

                        {/* USER */}

                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-slate-800">
                            {payment.user?.name ?? "Unknown"}
                          </p>

                          <p className="mt-0.5 text-[11px] text-slate-400">
                            {payment.user?.email ?? "—"}
                          </p>
                        </td>

                        {/* ORDER */}

                        <td className="px-5 py-4">
                          <span className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700">
                            #
                            {payment.order?.orderNumber ??
                              payment.orderId.slice(0, 10)}
                          </span>
                        </td>

                        {/* AMOUNT */}

                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-slate-900">
                            {formatCurrency(payment.amount)}
                          </p>
                        </td>

                        {/* METHOD */}

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
                              payment.method === "ONLINE"
                                ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                                : "border-orange-200 bg-orange-50 text-orange-700"
                            }`}
                          >
                            {payment.method === "ONLINE" ? (
                              <CreditCard className="h-3.5 w-3.5" />
                            ) : (
                              <Banknote className="h-3.5 w-3.5" />
                            )}

                            {payment.method}
                          </span>
                        </td>

                        {/* GATEWAY */}

                        <td className="px-5 py-4">
                          {payment.gateway ? (
                            <span className="inline-flex rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1.5 text-xs font-semibold text-violet-700">
                              {payment.gateway}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">
                          <PaymentStatusBadge status={payment.status} />
                        </td>

                        {/* DATE */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Clock3 className="h-3.5 w-3.5 text-slate-400" />

                            {formatDate(payment.createdAt)}
                          </div>
                        </td>

                        {/* ACTION */}

                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => setSelectedPaymentId(payment.id)}
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

              {/* =================================================
                  PAGINATION
              ================================================= */}

              <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 md:px-6">
                <p className="text-xs text-slate-500">
                  Page <b>{data?.page ?? page}</b> of{" "}
                  <b>{data?.totalPages ?? 1}</b>
                </p>

                <div className="flex gap-2">
                  <button
                    disabled={page <= 1 || isFetching}
                    onClick={() =>
                      setPage((current) => Math.max(1, current - 1))
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <button
                    disabled={page >= (data?.totalPages ?? 1) || isFetching}
                    onClick={() => setPage((current) => current + 1)}
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

      {selectedPaymentId && (
        <PaymentDetailModal
          payment={selectedPayment}
          loading={isDetailLoading}
          error={isDetailError}
          onClose={() => setSelectedPaymentId(null)}
        />
      )}
    </div>
  );
}

/* =========================================================
   PAYMENT DETAIL MODAL
========================================================= */

function PaymentDetailModal({
  payment,
  loading,
  error,
  onClose,
}: {
  payment?: Payment | null;

  loading: boolean;

  error: boolean;

  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white p-5 md:p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Payment Details
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Transaction
            </h2>

            {payment && (
              <p className="mt-1 font-mono text-[11px] text-slate-400">
                {payment.id}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="flex min-h-[500px] items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto h-7 w-7 animate-spin text-slate-400" />

              <p className="mt-3 text-sm text-slate-500">Loading payment...</p>
            </div>
          </div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {!loading && error && (
          <div className="flex min-h-[500px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>

              <p className="mt-4 text-sm font-bold text-slate-800">
                Failed to load payment
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Please close and try again.
              </p>
            </div>
          </div>
        )}

        {/* =================================================
            CONTENT
        ================================================= */}

        {!loading && !error && payment && (
          <div className="space-y-5 p-5 md:p-6">
            {/* ===========================================
                  SUMMARY
              =========================================== */}

            <div className="rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-white p-5">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs text-slate-500">Payment Amount</p>

                  <p className="mt-1 text-3xl font-bold text-slate-900">
                    {formatCurrency(payment.amount)}
                  </p>

                  <div className="mt-3">
                    <PaymentStatusBadge status={payment.status} />
                  </div>
                </div>

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
                  {payment.status === "SUCCESS" ? (
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  ) : payment.status === "FAILED" ? (
                    <XCircle className="h-8 w-8 text-red-500" />
                  ) : (
                    <CreditCard className="h-8 w-8 text-slate-500" />
                  )}
                </div>
              </div>
            </div>

            {/* ===========================================
                  CUSTOMER + ORDER
              =========================================== */}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* CUSTOMER */}

              <div className="rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-500" />

                  <h3 className="text-sm font-bold text-slate-900">Customer</h3>
                </div>

                <div className="mt-4 space-y-1">
                  <p className="text-sm font-semibold text-slate-800">
                    {payment.user?.name ?? "Unknown"}
                  </p>

                  <p className="text-xs text-slate-400">
                    {payment.user?.email ?? "—"}
                  </p>

                  <p className="text-xs text-slate-400">
                    {payment.user?.phone ?? "—"}
                  </p>
                </div>
              </div>

              {/* ORDER */}

              <div className="rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-slate-500" />

                  <h3 className="text-sm font-bold text-slate-900">Order</h3>
                </div>

                <div className="mt-4 space-y-3">
                  <InfoBox
                    label="Order Number"
                    value={payment.order?.orderNumber ?? payment.orderId}
                  />

                  {payment.order?.totalAmount != null && (
                    <InfoBox
                      label="Order Total"
                      value={formatCurrency(payment.order.totalAmount)}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* ===========================================
                  PAYMENT INFORMATION
              =========================================== */}

            <div className="rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-slate-500" />

                <h3 className="text-sm font-bold text-slate-900">
                  Payment Information
                </h3>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <InfoBox label="Payment Method" value={payment.method} />

                <InfoBox label="Status" value={formatStatus(payment.status)} />

                <InfoBox label="Gateway" value={payment.gateway ?? "—"} />

                <InfoBox
                  label="Amount"
                  value={formatCurrency(payment.amount)}
                />

                <InfoBox
                  label="Created At"
                  value={formatDateTime(payment.createdAt)}
                />

                <InfoBox
                  label="Paid At"
                  value={formatDateTime(payment.paidAt)}
                />
              </div>
            </div>

            {/* ===========================================
                  GATEWAY
              =========================================== */}

            <div className="rounded-2xl border border-violet-100 bg-violet-50/40 p-5">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-violet-600" />

                <h3 className="text-sm font-bold text-violet-900">
                  Gateway Information
                </h3>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                <InfoBox label="Gateway" value={payment.gateway ?? "—"} />

                <InfoBox
                  label="Gateway Order ID"
                  value={payment.gatewayOrderId ?? "—"}
                  mono
                />

                <InfoBox
                  label="Gateway Payment ID"
                  value={payment.gatewayPaymentId ?? "—"}
                  mono
                />

                <InfoBox
                  label="Gateway Signature"
                  value={
                    payment.gatewaySignature
                      ? `${payment.gatewaySignature.slice(0, 18)}...`
                      : "—"
                  }
                  mono
                />
              </div>
            </div>

            {/* ===========================================
                  REFUNDS
              =========================================== */}

            <div className="rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-slate-500" />

                  <h3 className="text-sm font-bold text-slate-900">Refunds</h3>
                </div>

                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                  {payment.refunds?.length ?? 0}
                </span>
              </div>

              {payment.refunds?.length ? (
                <div className="mt-4 space-y-2">
                  {payment.refunds.map((refund) => (
                    <div
                      key={refund.id}
                      className="flex flex-col gap-3 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {formatCurrency(refund.amount)}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {refund.reason ?? "No reason provided"}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                          {formatDateTime(refund.createdAt)}
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="inline-flex rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1.5 text-xs font-semibold text-violet-700">
                          {formatStatus(refund.status)}
                        </span>

                        {refund.gatewayRefundId && (
                          <p className="mt-1 font-mono text-[10px] text-slate-400">
                            {refund.gatewayRefundId}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-xl bg-slate-50 p-5 text-center">
                  <RotateCcw className="mx-auto h-5 w-5 text-slate-300" />

                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    No refunds
                  </p>

                  <p className="mt-1 text-[11px] text-slate-400">
                    This payment has no refund transactions.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =================================================
            FOOTER
        ================================================= */}

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
   SKELETON
========================================================= */

function PaymentsSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <div className="h-20 animate-pulse rounded-2xl bg-slate-200" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({
            length: 4,
          }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-2xl bg-slate-200"
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({
            length: 3,
          }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-2xl bg-slate-200"
            />
          ))}
        </div>

        <div className="h-36 animate-pulse rounded-2xl bg-slate-200" />

        <div className="h-[650px] animate-pulse rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}
