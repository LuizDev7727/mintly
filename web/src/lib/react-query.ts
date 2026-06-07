import { QueryClient } from "@tanstack/react-query";

let showNetworkFailureError = false;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry(failureCount) {
        if (failureCount >= 3) {
          if (showNetworkFailureError === false) {
            showNetworkFailureError = true;

            // Show toast error message
          }

          return false;
        }

        return true;
      },
    },
  },
});
