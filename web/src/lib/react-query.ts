import { QueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";

let showNetworkFailureError = false;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry(failureCount) {
        if (failureCount >= 3) {
          if (showNetworkFailureError === false) {
            showNetworkFailureError = true;

            // Show toast error message
            toast(
              "A aplicação está demorando mais que o esperado para carregar, tente novamente em alguns minutos.",
              {
                onDismiss: () => {
                  showNetworkFailureError = false;
                },
              },
            );
          }

          return false;
        }

        return true;
      },
    },
    mutations: {
      onError(error) {
        if (isAxiosError(error)) {
          const message =
            error.response?.data?.message ?? "Something went wrong";
          toast(message);
        }
      },
    },
  },
});
