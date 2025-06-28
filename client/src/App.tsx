import { Suspense, lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "./components/language-provider";

// Lazy load components
const Home = lazy(() => import('@/pages/home'));
const ProjectDetail = lazy(() => import('@/pages/project-detail'));
const Blog = lazy(() => import('@/pages/blog'));
const NotFound = lazy(() => import('@/pages/not-found'));

const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded">
    <h2 className="text-red-800 font-bold">Something went wrong</h2>
    <pre className="mt-2 text-sm text-red-600">{error.message}</pre>
    <button 
      onClick={resetErrorBoundary}
      className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
    >
      Try again
    </button>
  </div>
);

function Router() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/projects/:slug" component={ProjectDetail} />
        <Route path="/blog" component={Blog} />
        <Route path="/blog/:slug" component={Blog} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
