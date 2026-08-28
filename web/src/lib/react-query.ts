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
              "The application is taking longer than expected to load, please try again in a few minutes.",
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
