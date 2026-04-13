import Image from 'next/image'; // 1. Importamos el componente optimizado
import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="rounded-lg border bg-white p-8 shadow-sm">
      {/* Contenedor del Logo: Centrado y con margen inferior */}
      <div className="mb-8 flex justify-center">
        {/* 2. Implementación del Logo SVG */}
        <Image
          src="/logo-azul.svg"
          alt="Logo Universitas"
          width={250}
          height={80}
          className="h-20 w-auto" // Aumentado a h-20 (80px)
          style={{ width: 'auto' }}
          priority
        />
      </div>

      <LoginForm />
    </div>
  );
}
