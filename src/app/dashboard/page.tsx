'use client';

import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { Loader2, Users, UserCheck, UserX, Shield, MessageSquare, ListTodo, Activity } from 'lucide-react';

export default function DashboardPage() {
  const { metrics, isLoading, error } = useDashboardMetrics();

  // Formateador de fecha
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  return (
    <div className="flex flex-col gap-6 w-full p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Inicio</h1>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 mb-2">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">Bienvenido al Panel de Administración</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Resumen general de métricas del sistema.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="text-red-600 font-medium">No se pudieron cargar las métricas.</p>
          <p className="text-sm text-red-500 mt-1">{error}</p>
        </div>
      ) : metrics ? (
        <div className="space-y-6">
          {/* Tarjetas Superiores */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Usuarios */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 flex flex-col justify-between">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Total Usuarios</h3>
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="text-4xl font-bold">{metrics.users.total}</div>
            </div>

            {/* Usuarios Activos */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 flex flex-col justify-between">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Usuarios Activos</h3>
                <UserCheck className="h-5 w-5 text-primary" />
              </div>
              <div className="text-4xl font-bold">{metrics.users.active}</div>
            </div>

            {/* Administradores */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 flex flex-col justify-between">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Administradores</h3>
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div className="text-4xl font-bold">{metrics.users.admins}</div>
            </div>

            {/* Total Sesiones Chat */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 flex flex-col justify-between">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Sesiones de Chat</h3>
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div className="text-4xl font-bold">{metrics.chat.totalSessions}</div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Detalles Restantes (Izquierda, Ocupa 3 columnas) */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 col-span-3">
              <h3 className="text-lg font-semibold mb-4">Métricas Adicionales</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-sm text-muted-foreground flex items-center">
                    <UserX className="h-4 w-4 mr-2" /> Usuarios Inactivos
                  </span>
                  <span className="font-medium">{metrics.users.inactive}</span>
                </div>
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-sm text-muted-foreground flex items-center">
                    <UserCheck className="h-4 w-4 mr-2" /> Usuarios Verificados
                  </span>
                  <span className="font-medium">{metrics.users.verified}</span>
                </div>
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-sm text-muted-foreground flex items-center">
                    <ListTodo className="h-4 w-4 mr-2" /> Mensajes de Chat
                  </span>
                  <span className="font-medium">{metrics.chat.totalMessages}</span>
                </div>
              </div>
            </div>

            {/* Usuarios Recientes (Derecha, ocupa 4 columnas) */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 col-span-4">
              <h3 className="text-lg font-semibold mb-4">Usuarios Recientes</h3>
              {metrics.recentUsers.length > 0 ? (
                <div className="space-y-4">
                  {metrics.recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {user.nombre.charAt(0)}{user.apellido.charAt(0) || ''}
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-none">{user.nombre} {user.apellido}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-[150px] sm:max-w-[200px]">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-800">
                          {user.role}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(user.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay usuarios recientes.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border bg-card p-6 text-center text-muted-foreground">
          No hay métricas disponibles en este momento.
        </div>
      )}
    </div>
  );
}
