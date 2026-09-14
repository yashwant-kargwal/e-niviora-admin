import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  Filter,
  Loader2,
  MapPin,
  PackageCheck,
  RefreshCcw,
  Search,
  Truck,
  X,
  XCircle,
} from "lucide-react";

import { useMemo, useState } from "react";

import {
  useApproveReturn,
  useRejectReturn,
  useReturns,
  useUpdateReturn,
} from "@/hooks/useReturns";

import type { ReturnRequest, ReturnStatus } from "@/services/return.service";

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

const formatReason = (reason: string) =>
  reason
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const statusConfig: Record<
  ReturnStatus,
  {
    label: string;
    className: string;
    icon: React.ElementType;
  }
> = {
  PENDING: {
    label: "Pending",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    icon: Clock3,
  },

  APPROVED: {
    label: "Approved",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: CheckCircle2,
  },

  REJECTED: {
    label: "Rejected",
    className: "border-red-200 bg-red-50 text-red-700",
    icon: XCircle,
  },

  PICKUP_SCHEDULED: {
    label: "Pickup Scheduled",
    className: "border-blue-200 bg-blue-50 text-blue-700",
    icon: Truck,
  },

  PICKED_UP: {
    label: "Picked Up",
    className: "border-cyan-200 bg-cyan-50 text-cyan-700",
    icon: PackageCheck,
  },

  IN_TRANSIT: {
    label: "In Transit",
    className: "border-indigo-200 bg-indigo-50 text-indigo-700",
    icon: Truck,
  },

  RECEIVED: {
    label: "Received",
    className: "border-violet-200 bg-violet-50 text-violet-700",
    icon: PackageCheck,
  },

  COMPLETED: {
    label: "Completed",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: CheckCircle2,
  },

  CANCELLED: {
    label: "Cancelled",
    className: "border-slate-200 bg-slate-100 text-slate-600",
    icon: XCircle,
  },
};

function StatusBadge({ status }: { status: ReturnStatus }) {
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
  description,
  icon: Icon,
  className,
}: {
  title: string;
  value: number;
  description: string;
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

export default function Returns() {
  const [search, setSearch] = useState("");

  const [status, setStatus] = useState<ReturnStatus | "">("");

  const [page, setPage] = useState(1);

  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(
    null,
  );

  const [rejectingReturn, setRejectingReturn] = useState<ReturnRequest | null>(
    null,
  );

  const [rejectReason, setRejectReason] = useState("");

  const limit = 10;

  const { data, isLoading, isFetching, isError, refetch } = useReturns({
    page,
    limit,
    status: status || undefined,
  });

  const approveMutation = useApproveReturn();

  const rejectMutation = useRejectReturn();

  const updateMutation = useUpdateReturn();

  const returns = data?.data ?? [];

  const filteredReturns = useMemo(() => {
    if (!search.trim()) {
      return returns;
    }

    const query = search.toLowerCase().trim();

    return returns.filter((item) => {
      const returnId = item.id.toLowerCase();

      const orderNumber = item.order?.orderNumber?.toLowerCase() ?? "";

      const customerName = item.user?.name?.toLowerCase() ?? "";

      const customerEmail = item.user?.email?.toLowerCase() ?? "";

      return (
        returnId.includes(query) ||
        orderNumber.includes(query) ||
        customerName.includes(query) ||
        customerEmail.includes(query)
      );
    });
  }, [returns, search]);

  const stats = useMemo(() => {
    return {
      total: returns.length,

      pending: returns.filter((item) => item.status === "PENDING").length,

      approved: returns.filter((item) => item.status === "APPROVED").length,

      inProgress: returns.filter((item) =>
        ["PICKUP_SCHEDULED", "PICKED_UP", "IN_TRANSIT", "RECEIVED"].includes(
          item.status,
        ),
      ).length,

      completed: returns.filter((item) => item.status === "COMPLETED").length,
    };
  }, [returns]);

  const handleApprove = async () => {
    if (!selectedReturn) return;

    const confirmed = window.confirm(
      "Are you sure you want to approve this return request?",
    );

    if (!confirmed) return;

    await approveMutation.mutateAsync(selectedReturn.id);

    setSelectedReturn(null);
  };

  const handleReject = async () => {
    if (!rejectingReturn) return;

    await rejectMutation.mutateAsync({
      id: rejectingReturn.id,

      description: rejectReason.trim() || undefined,
    });

    setRejectingReturn(null);
    setRejectReason("");
    setSelectedReturn(null);
  };

  const handleStatusUpdate = async (newStatus: ReturnStatus) => {
    if (!selectedReturn) return;

    await updateMutation.mutateAsync({
      id: selectedReturn.id,

      payload: {
        status: newStatus,

        shiprocketReturnOrderId:
          selectedReturn.shiprocketReturnOrderId ?? undefined,

        shiprocketReturnShipmentId:
          selectedReturn.shiprocketReturnShipmentId ?? undefined,

        returnAwbCode: selectedReturn.returnAwbCode ?? undefined,
      },
    });

    setSelectedReturn(null);
  };

  const handleStatusFilter = (value: string) => {
    setStatus(value as ReturnStatus | "");

    setPage(1);
  };

  if (isLoading) {
    return <ReturnsSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex min-h-[600px] items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>

          <h2 className="mt-4 text-lg font-bold text-slate-900">
            Failed to load returns
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Something went wrong while fetching return requests.
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
              <span className="h-2 w-2 rounded-full bg-cyan-500" />

              <span className="text-xs font-bold uppercase tracking-wider text-cyan-600">
                Orders
              </span>
            </div>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Returns
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Review and manage customer return requests.
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            title="Total Returns"
            value={stats.total}
            description="All requests"
            icon={RefreshCcw}
            className="bg-blue-50 text-blue-600"
          />

          <StatCard
            title="Pending"
            value={stats.pending}
            description="Need review"
            icon={Clock3}
            className="bg-amber-50 text-amber-600"
          />

          <StatCard
            title="Approved"
            value={stats.approved}
            description="Approved requests"
            icon={CheckCircle2}
            className="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            title="In Progress"
            value={stats.inProgress}
            description="Pickup / transit"
            icon={Truck}
            className="bg-violet-50 text-violet-600"
          />

          <StatCard
            title="Completed"
            value={stats.completed}
            description="Finished returns"
            icon={PackageCheck}
            className="bg-cyan-50 text-cyan-600"
          />
        </div>

        {/* FILTER */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search return ID, order, customer..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </div>

            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <select
                value={status}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="h-11 min-w-[200px] appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-8 text-sm font-medium text-slate-700 outline-none focus:border-slate-400"
              >
                <option value="">All statuses</option>

                <option value="PENDING">Pending</option>

                <option value="APPROVED">Approved</option>

                <option value="REJECTED">Rejected</option>

                <option value="PICKUP_SCHEDULED">Pickup Scheduled</option>

                <option value="PICKED_UP">Picked Up</option>

                <option value="IN_TRANSIT">In Transit</option>

                <option value="RECEIVED">Received</option>

                <option value="COMPLETED">Completed</option>

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
                Return Requests
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                {data?.total ?? 0} total return requests
              </p>
            </div>

            {isFetching && (
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            )}
          </div>

          {filteredReturns.length === 0 ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center px-5 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <RefreshCcw className="h-6 w-6 text-slate-400" />
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-700">
                No returns found
              </h3>

              <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
                Return requests matching your filters will appear here.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Return
                      </th>

                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Customer
                      </th>

                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Order
                      </th>

                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Reason
                      </th>

                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Items
                      </th>

                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Status
                      </th>

                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Requested
                      </th>

                      <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredReturns.map((item) => (
                      <tr
                        key={item.id}
                        className="group transition hover:bg-slate-50"
                      >
                        {/* RETURN */}
                        <td className="px-5 py-4">
                          <p className="max-w-[150px] truncate text-xs font-bold text-slate-800">
                            {item.id}
                          </p>

                          <p className="mt-1 text-[10px] text-slate-400">
                            {formatDate(item.createdAt)}
                          </p>
                        </td>

                        {/* CUSTOMER */}
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-slate-800">
                            {item.user?.name ?? "Unknown customer"}
                          </p>

                          <p className="mt-0.5 text-[11px] text-slate-400">
                            {item.user?.email ?? "—"}
                          </p>
                        </td>

                        {/* ORDER */}
                        <td className="px-5 py-4">
                          {item.order?.orderNumber ? (
                            <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700">
                              #{item.order.orderNumber}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>

                        {/* REASON */}
                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-lg bg-orange-50 px-2.5 py-1.5 text-xs font-semibold text-orange-700">
                            {formatReason(item.reason)}
                          </span>
                        </td>

                        {/* ITEMS */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                            <PackageCheck className="h-4 w-4 text-slate-400" />

                            {item.items?.length ?? 0}
                          </div>
                        </td>

                        {/* STATUS */}
                        <td className="px-5 py-4">
                          <StatusBadge status={item.status} />
                        </td>

                        {/* DATE */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Clock3 className="h-3.5 w-3.5 text-slate-400" />

                            {formatDate(item.requestedAt)}
                          </div>
                        </td>

                        {/* ACTION */}
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => setSelectedReturn(item)}
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
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <button
                    disabled={page >= (data?.totalPages ?? 1) || isFetching}
                    onClick={() => setPage((prev) => prev + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
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
      {selectedReturn && (
        <ReturnDetailModal
          returnRequest={selectedReturn}
          onClose={() => setSelectedReturn(null)}
          onApprove={handleApprove}
          onReject={() => setRejectingReturn(selectedReturn)}
          onStatusUpdate={handleStatusUpdate}
          approving={approveMutation.isPending}
          updating={updateMutation.isPending}
        />
      )}

      {/* REJECT MODAL */}
      {rejectingReturn && (
        <RejectReturnModal
          reason={rejectReason}
          setReason={setRejectReason}
          loading={rejectMutation.isPending}
          onClose={() => {
            setRejectingReturn(null);
            setRejectReason("");
          }}
          onSubmit={handleReject}
        />
      )}
    </div>
  );
}

function ReturnDetailModal({
  returnRequest,
  onClose,
  onApprove,
  onReject,
  onStatusUpdate,
  approving,
  updating,
}: {
  returnRequest: ReturnRequest;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onStatusUpdate: (status: ReturnStatus) => void;
  approving: boolean;
  updating: boolean;
}) {
  const canApprove = returnRequest.status === "PENDING";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* HEADER */}
        <div className="flex items-start justify-between border-b border-slate-100 p-5 md:p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-cyan-600">
              Return Request
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Return Details
            </h2>

            <p className="mt-1 max-w-[300px] truncate text-xs text-slate-400">
              {returnRequest.id}
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-5 md:p-6">
          {/* STATUS BANNER */}
          <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-br from-cyan-50 via-blue-50 to-white p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">
                Current Status
              </p>

              <div className="mt-2">
                <StatusBadge status={returnRequest.status} />
              </div>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-xs text-slate-400">Requested</p>

              <p className="mt-1 text-sm font-bold text-slate-800">
                {formatDateTime(returnRequest.requestedAt)}
              </p>
            </div>
          </div>

          {/* CUSTOMER + ORDER */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoBox
              label="Customer"
              value={returnRequest.user?.name ?? "—"}
              secondary={returnRequest.user?.email}
            />

            <InfoBox
              label="Order"
              value={
                returnRequest.order?.orderNumber
                  ? `#${returnRequest.order.orderNumber}`
                  : "—"
              }
              secondary={
                returnRequest.order
                  ? `Order total: ${formatCurrency(
                      Number(returnRequest.order.totalAmount),
                    )}`
                  : undefined
              }
            />

            <InfoBox
              label="Return Reason"
              value={formatReason(returnRequest.reason)}
            />

            <InfoBox
              label="Approved On"
              value={formatDateTime(returnRequest.approvedAt)}
            />
          </div>

          {/* DESCRIPTION */}
          {returnRequest.description && (
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-500">
                Customer Description
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-700">
                {returnRequest.description}
              </p>
            </div>
          )}

          {/* RETURN ITEMS */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Return Items</h3>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                {returnRequest.items?.length ?? 0} items
              </span>
            </div>

            {returnRequest.items?.length ? (
              <div className="space-y-2">
                {returnRequest.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800">
                        {item.orderItem?.productName ?? "Product"}
                      </p>

                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-400">
                        <span>
                          Variant: {item.orderItem?.variantName ?? "—"}
                        </span>

                        <span>SKU: {item.orderItem?.productSku ?? "—"}</span>

                        <span>Qty: {item.quantity}</span>
                      </div>

                      {item.reason && (
                        <p className="mt-2 text-xs text-slate-500">
                          Reason: {item.reason}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 text-left sm:text-right">
                      <p className="text-sm font-bold text-slate-900">
                        {item.orderItem?.productPrice
                          ? formatCurrency(
                              Number(item.orderItem.productPrice) *
                                item.quantity,
                            )
                          : "—"}
                      </p>

                      <p className="mt-1 text-[10px] text-slate-400">
                        Return quantity
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl bg-slate-50 p-5 text-center text-xs text-slate-400">
                No return items available.
              </div>
            )}
          </div>

          {/* SHIPROCKET */}
          {(returnRequest.shiprocketReturnOrderId ||
            returnRequest.shiprocketReturnShipmentId ||
            returnRequest.returnAwbCode) && (
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-indigo-600" />

                <h3 className="text-sm font-bold text-indigo-900">
                  Return Shipment
                </h3>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <InfoBox
                  label="Return Order ID"
                  value={returnRequest.shiprocketReturnOrderId ?? "—"}
                />

                <InfoBox
                  label="Shipment ID"
                  value={returnRequest.shiprocketReturnShipmentId ?? "—"}
                />

                <InfoBox
                  label="Return AWB"
                  value={returnRequest.returnAwbCode ?? "—"}
                />
              </div>
            </div>
          )}

          {/* STATUS UPDATE */}
          {!["REJECTED", "CANCELLED", "COMPLETED"].includes(
            returnRequest.status,
          ) && (
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-500" />

                <p className="text-sm font-bold text-slate-800">
                  Update Return Status
                </p>
              </div>

              <div className="mt-3">
                <select
                  value={returnRequest.status}
                  disabled={updating}
                  onChange={(e) =>
                    onStatusUpdate(e.target.value as ReturnStatus)
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-slate-400"
                >
                  <option value="PENDING">Pending</option>

                  <option value="APPROVED">Approved</option>

                  <option value="PICKUP_SCHEDULED">Pickup Scheduled</option>

                  <option value="PICKED_UP">Picked Up</option>

                  <option value="IN_TRANSIT">In Transit</option>

                  <option value="RECEIVED">Received</option>

                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              {updating && (
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Updating status...
                </div>
              )}
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

          {canApprove && (
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
                Approve Return
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

      <p className="mt-1.5 break-words text-sm font-semibold text-slate-800">
        {value}
      </p>

      {secondary && (
        <p className="mt-1 truncate text-[10px] text-slate-400">{secondary}</p>
      )}
    </div>
  );
}

function RejectReturnModal({
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
            <h2 className="text-lg font-bold text-slate-900">Reject Return</h2>

            <p className="mt-1 text-xs text-slate-400">
              Provide a reason so the customer knows why the return was
              rejected.
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
          <label className="text-xs font-semibold text-slate-600">
            Rejection Reason
          </label>

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="Enter reason..."
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
            Reject Return
          </button>
        </div>
      </div>
    </div>
  );
}

function ReturnsSkeleton() {
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

        <div className="h-20 animate-pulse rounded-2xl bg-slate-200" />

        <div className="h-[600px] animate-pulse rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}

export const formatCurrency = (
  value: number | string | null | undefined,
): string => {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);
};
