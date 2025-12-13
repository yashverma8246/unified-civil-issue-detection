import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from './layout';
import { Landing } from '@/pages/Landing';
import { ReportIssue } from '@/pages/ReportIssue';

import { Dashboard } from '@/pages/Dashboard';
import { AuthPage } from '@/pages/Auth';
import ClientDashboard from '@/components/dashboards/ClientDashboard';
import WorkerDashboard from '@/components/dashboards/WorkerDashboard';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import { Contact } from '@/pages/Static/Contact';
import { Privacy } from '@/pages/Static/Privacy';
import { Terms } from '@/pages/Static/Terms';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Landing />,
      },
      {
        path: 'report',
        element: <ReportIssue />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'client',
        element: <ClientDashboard />,
      },
      {
        path: 'worker',
        element: <WorkerDashboard />,
      },
      {
        path: 'admin',
        element: <AdminDashboard />,
      },
      {
        path: 'auth',
        element: <AuthPage />,
      },
      {
        path: 'contact',
        element: <Contact />,
      },
      {
        path: 'privacy',
        element: <Privacy />,
      },
      {
        path: 'terms',
        element: <Terms />,
      },
    ],
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
