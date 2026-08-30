import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ['VITE_', 'NEXT_PUBLIC_']);
  const apiUrl =
    env.NEXT_PUBLIC_API_URL || env.VITE_API_URL || 'http://localhost:5000/api';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        'next/link': path.resolve(__dirname, 'src/shims/next-link.tsx'),
        'next/image': path.resolve(__dirname, 'src/shims/next-image.tsx'),
        'next/navigation': path.resolve(__dirname, 'src/shims/next-navigation.ts'),
        'next/font/google': path.resolve(__dirname, 'src/shims/next-font.ts'),
      },
    },
    define: {
      'process.env.NEXT_PUBLIC_API_URL': JSON.stringify(apiUrl),
      'process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID': JSON.stringify(
        env.NEXT_PUBLIC_RAZORPAY_KEY_ID || env.VITE_RAZORPAY_KEY_ID || ''
      ),
      'process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY': JSON.stringify(
        env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || env.VITE_STRIPE_PUBLISHABLE_KEY || ''
      ),
    },
    server: {
      port: 5173,
    },
    preview: {
      port: 5173,
    },
  };
});
