import Image from 'next/image'; // 1. Importamos el componente optimizado
import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="rounded-lg border bg-white p-8 shadow-sm">
      {/* Contenedor del Logo: Centrado y con margen inferior */}
      <div className="mb-8 flex justify-center">
        {/* 2. Implementación del Logo SVG */}
        <Image
          src="/logo-azul.svg" // Busca automáticamente en la carpeta /public
          alt="Logo Universitas"
          width={250} // Referencia del ancho original del archivo
          height={80} // Referencia de altura para el cálculo de aspecto
          className="h-20 w-auto" // Tailwind: Altura fija (80px), ancho automático
          priority // Carga prioritaria (mejora la métrica LCP)
        />
      </div>

      <LoginForm />
    </div>
  );
}
