import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Contenedor principal: Centrado absoluto y fondo global
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      {/* Wrapper del contenido con ancho máximo para mantener la forma de tarjeta */}
      <div className="w-full max-w-sm">

        {/* Aquí se renderizará tu page.tsx (el formulario de login) */}
        {children}

        {/* Footer común para todas las vistas de autenticación */}
        <div className="mt-6 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Universitas Services.
        </div>
      </div>
    </div>
  );
}