import * as React from "react";
import { v4 as uuid } from 'uuid';
import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

interface State {
  toasts: Array<ToasterToast & {
    id: string;
    progress?: number;
  }>;
}

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  duration?: number;
  priority?: "low" | "normal" | "high";
};

const memoryState: State = {
  toasts: [],
};

const listeners: ((state: State) => void)[] = [];

function dispatch(action: {
  type: "ADD_TOAST" | "UPDATE_TOAST" | "DISMISS_TOAST";
  toast?: Partial<ToasterToast>;
  toastId?: string;
}) {
  memoryState.toasts = [...memoryState.toasts];

  if (action.type === "ADD_TOAST") {
    memoryState.toasts.push(action.toast as ToasterToast);
  } else if (action.type === "UPDATE_TOAST") {
    const { id, ...rest } = action.toast as ToasterToast;
    memoryState.toasts = memoryState.toasts.map((t) =>
      t.id === id ? { ...t, ...rest } : t
    );
  } else if (action.type === "DISMISS_TOAST") {
    memoryState.toasts = memoryState.toasts.filter((t) => t.id !== action.toastId);
  }

  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  const toast = React.useCallback((props: Omit<ToasterToast, "id">) => {
    const id = uuid();
    const duration = props.duration || 5000;

    dispatch({
      type: "ADD_TOAST",
      toast: {
        ...props,
        id,
        duration,
        progress: 100,
        priority: props.priority || "normal",
      },
    });

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.max(0, 100 - (elapsed / duration) * 100);
      
      dispatch({
        type: "UPDATE_TOAST",
        toast: { id, progress },
      });

      if (progress <= 0) {
        clearInterval(interval);
        dispatch({ type: "DISMISS_TOAST", toastId: id });
      }
    }, 100);

    return id;
  }, []);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

export { useToast, type ToasterToast };
