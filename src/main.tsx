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
import { Settings } from '@/pages/Settings';
import { MediaLibrary } from '@/pages/MediaLibrary';
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
    path: "/media",
    element: <MediaLibrary />,
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