import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { UnauthorizedBehavior } from "./types";
import { QueryFunction } from "@tanstack/react-query";

// Utility for merging Tailwind CSS classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility for throwing error on bad response
export async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const error = await res.json().catch(() => ({
      message: "An unexpected error occurred",
    }));
    throw new Error(error.message);
  }
}

// Query function for data fetching with error handling
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

// Helper for formatting dates
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date));
}

// Helper for currency formatting
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

// Helper for handling API errors
export async function handleApiError(error: unknown) {
  if (error instanceof Error) {
    return {
      error: true,
      message: error.message
    };
  }
  return {
    error: true,
    message: 'An unexpected error occurred'
  };
}
