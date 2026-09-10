import { Outlet } from 'react-router-dom';
import { RequireAuth, RequireRole } from '@/features/auth/RequireRole';
import { RequireAadhaar } from '@/features/auth/RequireAadhaar';

export default function AdminLayout() {
  return (
    <RequireAuth fallbackHref="/login">
      <RequireRole roles={['super_admin', 'business_manager']} fallbackHref="/">
        <RequireAadhaar>
          <Outlet />
        </RequireAadhaar>
      </RequireRole>
    </RequireAuth>
  );
}
