export type ToastVariant = "success" | "error";

type Toast = {
  title: string;
  message?: string;
  variant: ToastVariant;
};

export type ToastEvent = {
  type: "show";
  toast: Toast;
};

export const toastListeners = new Set<(event: ToastEvent) => void>();

export const toast = {
  success: (title: string, message?: string) => {
    emitToast({ variant: "success", title, message });
  },
  error: (title: string, message?: string) => {
    emitToast({ variant: "error", title, message });
  },
};

function emitToast(nextToast: Toast) {
  const event = { type: "show" as const, toast: nextToast };
  toastListeners.forEach((listener) => listener(event));
}

export function getMutationErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const responseMessage = (
      error as { response?: { data?: { message?: unknown } } }
    ).response?.data?.message;

    if (typeof responseMessage === "string") return responseMessage;

    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }

  return "Something went wrong. Please try again.";
}
