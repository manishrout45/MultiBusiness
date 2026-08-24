import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Geist_Mono } from 'next/font/google';
import { Footer } from '@/components/Footer';
import { MarketplaceNavbar, MobileBottomNav } from '@/components/navbar';
import { ToastProvider } from '@/components/ui/toast';
import { AuthProvider } from '@/features/auth';
import { CartProvider } from '@/features/cart';
import { APP_NAME } from '@/lib/constants';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — Everything Local, One Marketplace`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    'Discover trusted businesses, products and services near you. Premium local marketplace for shopping and selling.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} ${geistMono.variable} min-h-screen font-sans antialiased`}>
        <AuthProvider>
          <ToastProvider>
            <CartProvider>
              <MarketplaceNavbar />
              <main className="pb-16 md:pb-0">{children}</main>
              <Footer />
              <MobileBottomNav />
            </CartProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
