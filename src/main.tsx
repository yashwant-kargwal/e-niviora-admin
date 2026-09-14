import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import { AuthProvider } from "@/context/AuthContext";
import { ToastViewport } from "@/components/ui/toast";
import { getMutationErrorMessage, toast } from "@/components/ui/toast-store";

import { router } from "@/routes";

import "./index.css";

const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: () => {
      toast.success(
        "Action completed",
        "Your changes have been saved successfully.",
      );
    },
    onError: (error) => {
      toast.error("Action failed", getMutationErrorMessage(error));
    },
  }),
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ToastViewport />
      </QueryClientProvider>
    </AuthProvider>
  </StrictMode>,
);
