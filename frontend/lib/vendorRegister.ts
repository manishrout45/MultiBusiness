export const VENDOR_REGISTER_DRAFT_KEY = 'vendor_register_draft';

export interface VendorRegisterDraft {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

export function saveVendorRegisterDraft(draft: VendorRegisterDraft): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(VENDOR_REGISTER_DRAFT_KEY, JSON.stringify(draft));
}

export function consumeVendorRegisterDraft(): VendorRegisterDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(VENDOR_REGISTER_DRAFT_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(VENDOR_REGISTER_DRAFT_KEY);
    return JSON.parse(raw) as VendorRegisterDraft;
  } catch {
    sessionStorage.removeItem(VENDOR_REGISTER_DRAFT_KEY);
    return null;
  }
}
