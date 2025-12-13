import { useAuth } from '@/context/AuthContext';
import DeptAdminDashboard from './DeptAdminDashboard';
import SuperAdminDashboard from './SuperAdminDashboard';

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
     // Optional: Redirect to auth if protected route wrapper doesn't handle it
     return <div className="p-8 text-center">Unauthenticated. Please <a href="/auth" className="text-blue-600 underline">login</a>.</div>;
  }

  // Explicit check for Super Admin
  if (user?.role === 'SUPER_ADMIN') {
    return <SuperAdminDashboard />;
  }

  // Explicit check for Dept Admin (fall through or explicit)
  if (user?.role === 'DEPT_ADMIN') {
    return <DeptAdminDashboard />;
  }

  // Fallback for non-admins reaching this route?
  return <div className="p-8 text-center">Access Denied: You do not have admin privileges.</div>;
}
