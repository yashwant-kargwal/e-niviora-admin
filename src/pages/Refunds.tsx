import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  Filter,
  Loader2,
  RefreshCcw,
  Search,
  XCircle,
  WalletCards,
  X,
} from "lucide-react";

import { useMemo, useState } from "react";

import {
  useApproveRefund,
  useRejectRefund,
  useRefunds,
} from "@/hooks/useRefunds";

import type { Refund, RefundStatus } from "@/services/refund.service";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);

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

const statusConfig: Record<
  RefundStatus,
  {
    label: string;
    className: string;
    dot: string;
    icon: React.ElementType;
  }
> = {
  PENDING: {
    label: "Pending",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
    icon: Clock3,
  },

  PROCESSING: {
    label: "Processing",
    className: "border-blue-200 bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
    icon: RefreshCcw,
  },

  SUCCESS: {
    label: "Successful",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },

  FAILED: {
    label: "Failed",
    className: "border-red-200 bg-red-50 text-red-700",
    dot: "bg-red-500",
    icon: AlertCircle,
  },

  CANCELLED: {
    label: "Cancelled",
    className: "border-slate-200 bg-slate-100 text-slate-600",
    dot: "bg-slate-400",
    icon: XCircle,
  },
};

function StatusBadge({ status }: { status: RefundStatus }) {
  const config = statusConfig[status];

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${config.className}`}
    >
      <Icon className="h-3.5 w-3.5" />

      {config.label}
    </span>
  );
}

function StatCard({
  title,
  value,
  amount,
  icon: Icon,
  className,
}: {
  title: string;
  value: number;
  amount?: number;
  icon: React.ElementType;
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

          {amount !== undefined && (
            <p className="mt-1 text-xs font-medium text-slate-400">
              {formatCurrency(amount)}
            </p>
          )}
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

export default function Refunds() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<RefundStatus | "">("");

  const [page, setPage] = useState(1);

  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);

  const [rejectingRefund, setRejectingRefund] = useState<Refund | null>(null);

  const [rejectReason, setRejectReason] = useState("");

  const limit = 10;

  const { data, isLoading, isFetching, isError, refetch } = useRefunds({
    page,
    limit,
    status: status || undefined,
  });

  const approveMutation = useApproveRefund();

  const rejectMutation = useRejectRefund();

  const refunds = data?.data ?? [];

  const filteredRefunds = useMemo(() => {
    if (!search.trim()) {
      return refunds;
    }

    const query = search.toLowerCase().trim();

    return refunds.filter((refund) => {
      const orderNumber = refund.payment?.order?.orderNumber ?? "";

      const customerName = refund.payment?.user?.name ?? "";

      const customerEmail = refund.payment?.user?.email ?? "";

      return (
        refund.id.toLowerCase().includes(query) ||
        orderNumber.toLowerCase().includes(query) ||
        customerName.toLowerCase().includes(query) ||
        customerEmail.toLowerCase().includes(query)
      );
    });
  }, [refunds, search]);

  const stats = useMemo(() => {
    const total = refunds.length;

    const pending = refunds.filter((item) => item.status === "PENDING").length;

    const success = refunds.filter((item) => item.status === "SUCCESS");

    const failed = refunds.filter((item) => item.status === "FAILED");

    return {
      total,

      pending,

      success: success.length,

      failed: failed.length,

      successAmount: success.reduce(
        (sum, item) => sum + Number(item.amount),
        0,
      ),

      failedAmount: failed.reduce((sum, item) => sum + Number(item.amount), 0),
    };
  }, [refunds]);

  const handleApprove = async (refund: Refund) => {
    const confirmed = window.confirm(
      `Approve refund of ${formatCurrency(Number(refund.amount))}?`,
    );

    if (!confirmed) return;

    await approveMutation.mutateAsync(refund.id);

    setSelectedRefund(null);
  };

  const handleReject = async () => {
    if (!rejectingRefund) return;

    await rejectMutation.mutateAsync({
      id: rejectingRefund.id,
      reason: rejectReason.trim() || undefined,
    });

    setRejectingRefund(null);
    setRejectReason("");
    setSelectedRefund(null);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value as RefundStatus | "");

    setPage(1);
  };

  if (isLoading) {
    return <RefundsSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex min-h-[600px] items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>

          <h2 className="mt-4 text-lg font-bold text-slate-900">
            Failed to load refunds
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Something went wrong while fetching refund requests.
          </p>

          <button
            onClick={() => refetch()}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-orange-500" />

              <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                Payments
              </span>
            </div>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Refunds
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Review and manage customer refund requests.
            </p>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCcw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Refunds"
            value={stats.total}
            icon={WalletCards}
            className="bg-blue-50 text-blue-600"
          />

          <StatCard
            title="Pending"
            value={stats.pending}
            icon={Clock3}
            className="bg-amber-50 text-amber-600"
          />

          <StatCard
            title="Successful"
            value={stats.success}
            amount={stats.successAmount}
            icon={CheckCircle2}
            className="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            title="Failed"
            value={stats.failed}
            amount={stats.failedAmount}
            icon={AlertCircle}
            className="bg-red-50 text-red-600"
          />
        </div>

        {/* FILTERS */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search refund ID, order, customer..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </div>

            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="h-11 min-w-[190px] appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-9 text-sm font-medium text-slate-700 outline-none focus:border-slate-400"
              >
                <option value="">All statuses</option>

                <option value="PENDING">Pending</option>

                <option value="PROCESSING">Processing</option>

                <option value="SUCCESS">Successful</option>

                <option value="FAILED">Failed</option>

                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {(search || status) && (
              <button
                onClick={() => {
                  setSearch("");
                  setStatus("");
                  setPage(1);
                }}
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 md:px-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Refund Requests
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                {data?.total ?? 0} total refund requests
              </p>
            </div>

            {isFetching && (
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            )}
          </div>

          {filteredRefunds.length === 0 ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center px-5 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <WalletCards className="h-6 w-6 text-slate-400" />
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-700">
                No refunds found
              </h3>

              <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
                Refund requests matching your current filters will appear here.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Refund
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
                    {filteredRefunds.map((refund) => (
                      <tr
                        key={refund.id}
                        className="group transition hover:bg-slate-50"
                      >
                        {/* REFUND */}
                        <td className="px-5 py-4">
                          <div>
                            <p className="max-w-[150px] truncate text-xs font-bold text-slate-800">
                              {refund.id}
                            </p>

                            <p className="mt-1 text-[10px] text-slate-400">
                              Payment: {refund.paymentId.slice(0, 12)}
                              ...
                            </p>
                          </div>
                        </td>

                        {/* CUSTOMER */}
                        <td className="px-5 py-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {refund.payment?.user?.name ?? "Unknown customer"}
                            </p>

                            <p className="mt-0.5 text-[11px] text-slate-400">
                              {refund.payment?.user?.email ?? "—"}
                            </p>
                          </div>
                        </td>

                        {/* ORDER */}
                        <td className="px-5 py-4">
                          {refund.payment?.order?.orderNumber ? (
                            <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700">
                              #{refund.payment.order.orderNumber}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>

                        {/* AMOUNT */}
                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-slate-900">
                            {formatCurrency(Number(refund.amount))}
                          </p>

                          {refund.reason && (
                            <p className="mt-1 max-w-[160px] truncate text-[10px] text-slate-400">
                              {refund.reason}
                            </p>
                          )}
                        </td>

                        {/* STATUS */}
                        <td className="px-5 py-4">
                          <StatusBadge status={refund.status} />
                        </td>

                        {/* DATE */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Clock3 className="h-3.5 w-3.5 text-slate-400" />

                            {formatDate(refund.createdAt)}
                          </div>
                        </td>

                        {/* ACTION */}
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => setSelectedRefund(refund)}
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

              {/* PAGINATION */}
              <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
                <p className="text-xs text-slate-500">
                  Page{" "}
                  <span className="font-semibold text-slate-700">
                    {data?.page ?? page}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-700">
                    {data?.totalPages ?? 1}
                  </span>
                </p>

                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1 || isFetching}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <button
                    disabled={page >= (data?.totalPages ?? 1) || isFetching}
                    onClick={() => setPage((prev) => prev + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedRefund && (
        <RefundDetailModal
          refund={selectedRefund}
          onClose={() => setSelectedRefund(null)}
          onApprove={() => handleApprove(selectedRefund)}
          onReject={() => {
            setRejectingRefund(selectedRefund);
          }}
          approving={approveMutation.isPending}
        />
      )}

      {/* REJECT MODAL */}
      {rejectingRefund && (
        <RejectRefundModal
          reason={rejectReason}
          setReason={setRejectReason}
          loading={rejectMutation.isPending}
          onClose={() => {
            setRejectingRefund(null);
            setRejectReason("");
          }}
          onSubmit={handleReject}
        />
      )}
    </div>
  );
}

function RefundDetailModal({
  refund,
  onClose,
  onApprove,
  onReject,
  approving,
}: {
  refund: Refund;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  approving: boolean;
}) {
  const canTakeAction = refund.status === "PENDING";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* HEADER */}
        <div className="flex items-start justify-between border-b border-slate-100 p-5 md:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-orange-600">
              Refund Details
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Refund Request
            </h2>

            <p className="mt-1 text-xs text-slate-400">{refund.id}</p>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="space-y-5 p-5 md:p-6">
          {/* AMOUNT */}
          <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 p-5">
            <p className="text-xs font-medium text-orange-600">Refund Amount</p>

            <p className="mt-1 text-3xl font-bold text-slate-900">
              {formatCurrency(Number(refund.amount))}
            </p>

            <div className="mt-3">
              <StatusBadge status={refund.status} />
            </div>
          </div>

          {/* CUSTOMER + ORDER */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoBox
              label="Customer"
              value={refund.payment?.user?.name ?? "—"}
              secondary={refund.payment?.user?.email}
            />

            <InfoBox
              label="Order"
              value={
                refund.payment?.order?.orderNumber
                  ? `#${refund.payment.order.orderNumber}`
                  : "—"
              }
              secondary={`Payment ID: ${refund.paymentId}`}
            />

            <InfoBox
              label="Requested On"
              value={formatDateTime(refund.createdAt)}
            />

            <InfoBox
              label="Processed On"
              value={formatDateTime(refund.processedAt)}
            />
          </div>

          {/* REASON */}
          {refund.reason && (
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold text-slate-500">
                Refund Reason
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-700">
                {refund.reason}
              </p>
            </div>
          )}

          {/* GATEWAY */}
          {refund.gatewayRefundId && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">
                Gateway Refund ID
              </p>

              <p className="mt-1 break-all font-mono text-xs text-slate-700">
                {refund.gatewayRefundId}
              </p>
            </div>
          )}

          {/* ITEMS */}
          {refund.items && refund.items.length > 0 && (
            <div>
              <p className="mb-3 text-sm font-bold text-slate-900">
                Refund Items
              </p>

              <div className="space-y-2">
                {refund.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-700">
                        Order Item
                      </p>

                      <p className="mt-1 text-[10px] text-slate-400">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    <p className="text-sm font-bold text-slate-900">
                      {formatCurrency(Number(item.amount))}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 p-5 sm:flex-row sm:justify-end md:p-6">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>

          {canTakeAction && (
            <>
              <button
                onClick={onReject}
                disabled={approving}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </button>

              <button
                onClick={onApprove}
                disabled={approving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {approving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Approve Refund
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoBox({
  label,
  value,
  secondary,
}: {
  label: string;
  value: string;
  secondary?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1.5 text-sm font-semibold text-slate-800">{value}</p>

      {secondary && (
        <p className="mt-1 truncate text-[10px] text-slate-400">{secondary}</p>
      )}
    </div>
  );
}

function RejectRefundModal({
  reason,
  setReason,
  loading,
  onClose,
  onSubmit,
}: {
  reason: string;
  setReason: (value: string) => void;
  loading: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Reject Refund</h2>

            <p className="mt-1 text-xs text-slate-400">
              Optionally provide a reason for rejection.
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5">
          <label className="text-xs font-semibold text-slate-600">Reason</label>

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="Enter rejection reason..."
            className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 outline-none focus:border-slate-400 focus:bg-white"
          />
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 p-5">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            onClick={onSubmit}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Reject Refund
          </button>
        </div>
      </div>
    </div>
  );
}

function RefundsSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <div className="h-20 animate-pulse rounded-2xl bg-slate-200" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-2xl bg-slate-200"
            />
          ))}
        </div>

        <div className="h-20 animate-pulse rounded-2xl bg-slate-200" />

        <div className="h-[600px] animate-pulse rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}
