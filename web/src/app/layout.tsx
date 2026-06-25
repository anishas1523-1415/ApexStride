import type { Metadata } from 'next';
import { AuthProvider } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import './globals.css';

export const metadata: Metadata = {
  title: 'AuraKinematics - Motion Analysis Platform',
  description: 'Advanced biomechanical analysis for sports using smartphone videos',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-stadium-black text-white">
        <AuthProvider>
          <Layout>{children}</Layout>
        </AuthProvider>
      </body>
    </html>
  );
}