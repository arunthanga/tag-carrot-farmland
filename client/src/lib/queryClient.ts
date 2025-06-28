import { QueryClient } from "@tanstack/react-query";
import { getQueryFn } from "./utils";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      cacheTime: 30 * 60 * 1000, // 30 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});
