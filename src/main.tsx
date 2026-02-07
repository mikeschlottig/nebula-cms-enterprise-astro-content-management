import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import { Dashboard } from '@/pages/Dashboard';
import { ContentStudio } from '@/pages/ContentStudio';
import { AIAssistant } from '@/pages/AIAssistant';
import { CollectionDetail } from '@/pages/CollectionDetail';
import { EntryEditor } from '@/pages/EntryEditor';
import { VectorRAG } from '@/pages/VectorRAG';
import { SearchEngine } from '@/pages/SearchEngine';
import { Settings } from '@/pages/Settings';
import { MediaLibrary } from '@/pages/MediaLibrary';
import { DeployedApps } from '@/pages/DeployedApps';
import { WorkersManager } from '@/pages/WorkersManager';
import { D1Explorer } from '@/pages/D1Explorer';
import { R2Browser } from '@/pages/R2Browser';
import { Calendar } from '@/pages/Calendar';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    }
  }
});
const router = createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/content",
    element: <ContentStudio />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/content/:collectionId",
    element: <CollectionDetail />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/content/:collectionId/entry",
    element: <EntryEditor />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/content/:collectionId/entry/:entryId",
    element: <EntryEditor />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/calendar",
    element: <Calendar />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/media",
    element: <MediaLibrary />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/apps",
    element: <DeployedApps />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/workers",
    element: <WorkersManager />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/d1",
    element: <D1Explorer />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/r2",
    element: <R2Browser />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/rag",
    element: <VectorRAG />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/search",
    element: <SearchEngine />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/ai",
    element: <AIAssistant />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/settings",
    element: <Settings />,
    errorElement: <RouteErrorBoundary />,
  }
]);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </QueryClientProvider>
  </StrictMode>,
)