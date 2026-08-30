/** Vendor seller flow — registration, profile, products, dashboard */
export type { VendorProfile, BusinessDetails } from '@/features/vendor';
export { MOCK_VENDOR_PROFILE } from '@/features/vendor';
export { VendorProfilePageClient } from '@/features/vendor/VendorProfilePageClient';
export { VendorDashboardPageClient } from '@/features/vendor-dashboard';
export { VendorProductsPageClient } from '@/features/products/VendorProductsPageClient';
export {
  PendingApprovalBanner,
  VendorApprovalGate,
  useVendorApproval,
} from '@/components/vendor';
