'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  // Obtenemos solo lo necesario del store para evitar re-renders innecesarios
  const checkAuthOnLoad = useAuthStore((state) => state.checkAuthOnLoad);
  const status = useAuthStore((state) => state.status);

  // Estado local para controlar si ya intentamos la verificación inicial
  // Esto evita parpadeos o renders prematuros
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      await checkAuthOnLoad();
      setIsChecked(true);
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dependencia vacía para que solo corra UNA vez al montar

  // MIENTRAS VERIFICA:
  // Mostramos nada (null) o podrías poner un componente <LoadingSpinner />
  // Esto previene que la app intente cargar datos privados con un token vencido
  // antes de que el refresh haya terminado.
  if (status === 'loading' || !isChecked) {
    return null;
    // Opción visual:
    // return <div className="flex h-screen w-full items-center justify-center">Cargando...</div>;
  }

  // UNA VEZ VERIFICADO:
  // Renderizamos la aplicación normal.
  // Si el token no era válido, el store ya habrá hecho logout y redirigido,
  // o el Middleware/ProtectedRoute se encargará de proteger las rutas.
  return <>{children}</>;
}
