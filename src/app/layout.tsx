import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
// 1. Importamos el inicializador
import { AuthInitializer } from '@/components/AuthInitializer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Panel administrativo de Universitas Services',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {/* 2. Lo colocamos aquí para que arranque la lógica de Auth */}
        <AuthInitializer>{children}</AuthInitializer>
      </body>
    </html>
  );
}
