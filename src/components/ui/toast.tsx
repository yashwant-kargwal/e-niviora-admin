import { useEffect, useState } from "react";
import { CheckCircle2, X, XCircle } from "lucide-react";
import { toastListeners, type ToastEvent } from "./toast-store";

type Toast = {
  id: number;
  title: string;
  message?: string;
  variant: "success" | "error";
};

export function ToastViewport() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (event: ToastEvent) => {
      const id = Date.now() + Math.random();
      setToasts((current) => [...current, { ...event.toast, id }].slice(-4));

      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== id));
      }, 4500);
    };

    toastListeners.add(listener);
    return () => {
      toastListeners.delete(listener);
    };
  }, []);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex flex-col items-end gap-3 sm:left-auto sm:w-[min(420px,calc(100vw-2rem))]"
    >
      {toasts.map((item) => {
        const isSuccess = item.variant === "success";
        const Icon = isSuccess ? CheckCircle2 : XCircle;

        return (
          <div
            key={item.id}
            role="status"
            className={`pointer-events-auto flex w-full items-start gap-3 rounded-xl border bg-white p-4 shadow-lg shadow-slate-950/10 animate-in slide-in-from-top-2 fade-in duration-200 ${
              isSuccess ? "border-emerald-200" : "border-rose-200"
            }`}
          >
            <Icon
              className={`mt-0.5 size-5 shrink-0 ${
                isSuccess ? "text-emerald-600" : "text-rose-600"
              }`}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-950">
                {item.title}
              </p>
              {item.message && (
                <p className="mt-1 text-sm leading-5 text-slate-600">
                  {item.message}
                </p>
              )}
            </div>
            <button
              type="button"
              aria-label="Dismiss notification"
              className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              onClick={() =>
                setToasts((current) =>
                  current.filter((toast) => toast.id !== item.id),
                )
              }
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
