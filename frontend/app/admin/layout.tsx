import { Outlet } from 'react-router-dom';
import { RequireAuth, RequireRole } from '@/features/auth/RequireRole';

export default function AdminLayout() {
  return (
    <RequireAuth fallbackHref="/login">
      <RequireRole roles={['super_admin', 'business_manager']} fallbackHref="/">
        <Outlet />
      </RequireRole>
    </RequireAuth>
  );
}
