'use client';

import { 
    ClipboardList, Ban, Building2, Shield, ShieldCheck, Users, HelpCircle, Loader2
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, XAxis, Cell, PieChart, Pie } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useEffect, useState } from 'react';
import { dashboardService, DashboardMetrics } from '@/services/dashboardService';
import { NotificationBell } from '@/components/dashboard/NotificationBell';
import Link from 'next/link';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getMetrics();
      setMetrics(data);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();

    // Escuchar evento personalizado para refrescar datos desde el sidebar
    const handleRefresh = () => {
      console.log("Refrescando métricas...");
      fetchMetrics();
    };

    window.addEventListener('refresh-dashboard', handleRefresh);
    window.addEventListener('focus', handleRefresh); // También refrescar al volver a la pestaña

    return () => {
      window.removeEventListener('refresh-dashboard', handleRefresh);
      window.removeEventListener('focus', handleRefresh);
    };
  }, []);

  // Helper para calcular porcentajes de crecimiento
  const calculateGrowth = (actual: number, anterior: number) => {
      if (anterior === 0) return actual > 0 ? 100 : 0;
      return ((actual - anterior) / anterior) * 100;
  };

  const statCards = [
    {
        title: 'USUARIOS TOTALES',
        value: metrics?.users.total.toLocaleString() || '0',
        icon: Users,
        color: 'var(--admin-card-1-text)',
        bgColor: 'var(--admin-card-1-bg)',
        badge: (() => {
            if (!metrics) return '';
            const growth = calculateGrowth(metrics.analytics.comparativa.mensual.actual, metrics.analytics.comparativa.mensual.anterior);
            return `${growth >= 0 ? '+' : ''}${growth.toFixed(0)}% Mes`;
        })(),
        link: '/dashboard/usuarios'
    },
    {
        title: 'SERVIDORES PÚBLICOS',
        value: metrics?.analytics.porTipousuario.servidoresPublicos.toLocaleString() || '0',
        icon: Building2,
        color: '#10b981',
        bgColor: '#dcfce7',
        badge: 'Públicos',
        link: '/dashboard/usuarios?tipoUsuario=SERVIDOR_PUBLICO'
    },
    {
        title: 'ASESORES PRIVADOS',
        value: metrics?.analytics.porTipousuario.asesoresPrivados.toLocaleString() || '0',
        icon: Shield,
        color: '#3b82f6',
        bgColor: '#dbeafe',
        badge: 'Asesores',
        link: '/dashboard/usuarios?tipoUsuario=ASESOR_PRIVADO'
    },
    {
        title: 'USUARIOS VERIFICADOS',
        value: (metrics?.users.verified || 0).toLocaleString(),
        icon: ShieldCheck,
        color: '#059669',
        bgColor: '#ecfdf5',
        badge: 'Verificados',
        link: '/dashboard/usuarios?estadoCuenta=ACTIVO'
    },
    {
        title: 'PENDIENTES VERIFICAR',
        value: (metrics?.analytics.usuariosNoVerificados || 0).toLocaleString(),
        icon: ClipboardList,
        color: '#b45309',
        bgColor: '#fef3c7',
        badge: `${metrics?.analytics.crecimientoHoy || 0} Hoy`,
    },
    {
        title: 'SUSPENSIONES',
        value: (metrics?.analytics.suspensionesRecientes || 0).toLocaleString(),
        icon: Ban,
        color: '#be123c',
        bgColor: '#ffe4e6',
        badge: 'Recientes',
        link: '/dashboard/usuarios?estadoCuenta=SUSPENDIDO'
    },
  ];

  // Datos para el gráfico de barras (Invertido)
  const chartData = metrics?.analytics.graficoCrecimiento.slice().reverse().map((item, idx, arr) => {
      const maxVal = Math.max(...arr.map(a => a.cantidad));
      return {
          date: item.etiqueta.toUpperCase(),
          users: item.cantidad,
          isHighlight: item.cantidad === maxVal && item.cantidad > 0
      };
  }) || [];

  // Datos para el gráfico de Dona
  const donutData = [
      { name: 'Públicos', value: metrics?.analytics.porTipousuario.servidoresPublicos || 0, color: '#10b981' },
      { name: 'Asesores', value: metrics?.analytics.porTipousuario.asesoresPrivados || 0, color: '#3b82f6' }
  ];

  const chartConfig = {
    users: { label: "Usuarios", color: "var(--admin-chart-bar)" },
    publicos: { label: "Servidores Públicos", color: "#10b981" },
    asesores: { label: "Asesores Privados", color: "#3b82f6" }
  };

  const statusConfig: Record<string, { label: string, color: string, bgColor: string }> = {
    'POR_ACTIVAR': { label: 'Por Activar', color: '#b45309', bgColor: '#fef3c7' },
    'PRUEBA_GRATUITA': { label: 'Prueba Gratis', color: '#1d4ed8', bgColor: '#dbeafe' },
    'ACTIVO': { label: 'Activo', color: '#15803d', bgColor: '#dcfce7' },
    'SUSPENDIDO': { label: 'Suspendido', color: '#be123c', bgColor: '#ffe4e6' },
    'POR_PAGAR': { label: 'Por Pagar', color: '#ea580c', bgColor: '#ffedd5' },
    'POR_RENOVAR': { label: 'Por Renovar', color: '#701a75', bgColor: '#fdf4ff' },
    'SUSCRITO': { label: 'Suscrito', color: '#3730a3', bgColor: '#e0e7ff' }
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center h-[80vh]">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full pt-2">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col">
              <h1 className="text-2xl font-extrabold whitespace-nowrap" style={{ color: 'var(--admin-text-title)' }}>
                  Panel Administrativo
              </h1>
              <p className="text-muted-foreground text-xs font-medium mt-0.5">Métricas avanzadas y análisis de crecimiento.</p>
          </div>
          
          <div className="flex items-center gap-4 justify-end min-w-[140px]">
              <NotificationBell />
              <button className="p-2 text-muted-foreground hover:bg-slate-100 rounded-full transition-colors">
                  <HelpCircle className="h-5 w-5" />
              </button>
              <Avatar className="h-10 w-10 border-2 border-emerald-500 cursor-pointer">
                  <AvatarImage src="https://api.dicebear.com/7.x/notionists/svg?seed=Admin" />
                  <AvatarFallback style={{ color: 'var(--admin-avatar-text)', backgroundColor: 'var(--admin-avatar-bg)' }}>AD</AvatarFallback>
              </Avatar>
          </div>
      </div>

      <div className="space-y-6 mt-4">
        {/* KPI Cards Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6 mt-2">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon;
            const hasLink = 'link' in stat && stat.link;
            
            const cardContent = (
                  <Card className={`border-none shadow-sm transition-all rounded-2xl h-full flex flex-col ${hasLink ? 'hover:shadow-md hover:scale-[1.02] cursor-pointer' : 'cursor-default'}`}>
                  <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
                      <div className="flex items-start justify-between w-full gap-1.5">
                          <div 
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm"
                              style={{ backgroundColor: stat.bgColor, color: stat.color }}
                          >
                              <Icon className="h-4.5 w-4.5" />
                          </div>
                          {stat.badge && (
                              <span 
                                  className="px-1.5 py-0.5 text-[8px] font-black rounded-md uppercase tracking-tighter h-fit border truncate max-w-[65px]"
                                  style={{ 
                                      backgroundColor: `${stat.bgColor}80`, 
                                      color: stat.color,
                                      borderColor: `${stat.color}40`
                                  }}
                                  title={stat.badge}
                              >
                                  {stat.badge}
                              </span>
                          )}
                      </div>
                      <div className="flex flex-col mt-auto">
                          <span className="text-2xl font-black tracking-tight" style={{ color: 'var(--admin-text-title)' }}>
                              {stat.value}
                          </span>
                          <span className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase mt-1 leading-tight">
                              {stat.title}
                          </span>
                      </div>
                  </CardContent>
                  </Card>
            );

            return hasLink ? (
              <Link key={idx} href={stat.link as string} className="block h-full">
                  {cardContent}
              </Link>
            ) : (
              <div key={idx} className="block h-full">
                  {cardContent}
              </div>
            );
          })}
        </div>

        {/* Fila 3: Gráficos (70% Evolution / 30% Distribution) */}
        <div className="grid gap-6 md:grid-cols-10">
            {/* Gráfico de Barras (70%) */}
            <Card className="md:col-span-7 rounded-xl border-none shadow-sm pt-6 bg-white overflow-hidden">
                <CardHeader className="pb-8">
                    <CardTitle className="text-xl font-bold tracking-tight" style={{ color: 'var(--admin-text-title)' }}>
                        Evolución de Usuarios
                    </CardTitle>
                    <CardDescription className="text-sm font-medium text-muted-foreground">
                        Análisis comparativo semana a semana del crecimiento orgánico.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                        <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barCategoryGap="12%">
                            <CartesianGrid vertical={false} stroke="#f8fafc" />
                            <XAxis 
                                dataKey="date" 
                                tickLine={false} 
                                axisLine={false} 
                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '900' }}
                                tickMargin={10}
                            />
                            <ChartTooltip cursor={{fill: '#f1f5f9'}} content={<ChartTooltipContent hideLabel />} />
                            <Bar dataKey="users" radius={[6, 6, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.isHighlight ? 'var(--admin-chart-bar-highlight)' : 'var(--admin-chart-bar)'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* Gráfico de Dona (30%) */}
            <Card className="md:col-span-3 rounded-xl border-none shadow-sm pt-6 bg-white overflow-hidden">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold tracking-tight" style={{ color: 'var(--admin-text-title)' }}>
                        Distribución
                    </CardTitle>
                    <CardDescription className="text-xs font-medium text-muted-foreground">
                        Por tipo de usuario registrado.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                    <div className="h-[220px] w-full relative">
                        <ChartContainer config={chartConfig} className="h-full w-full">
                            <PieChart>
                                <Pie
                                    data={donutData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {donutData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <ChartTooltip content={<ChartTooltipContent />} />
                            </PieChart>
                        </ChartContainer>
                        {/* Texto central del Donut */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl font-black text-slate-800">{metrics?.users.total}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
                        </div>
                    </div>
                    {/* Leyenda personalizada */}
                    <div className="flex flex-col gap-2 w-full mt-4">
                        {donutData.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-[11px] font-bold">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-slate-500">{item.name}</span>
                                </div>
                                <span className="text-slate-800">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Tabla de Usuarios Recientes - Manteniendo lo existente */}
        <Card className="rounded-xl border-none shadow-sm pt-6 bg-white w-full">
            <CardHeader className="flex flex-row items-center justify-between pb-6">
                <CardTitle className="text-xl font-bold tracking-tight" style={{ color: 'var(--admin-text-title)' }}>
                    Usuarios Recientes
                </CardTitle>
                <Link href="/dashboard/usuarios">
                    <button className="text-sm font-bold transition-colors hover:underline" style={{ color: 'var(--admin-text-link)' }}>
                        Ver todos
                    </button>
                </Link>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow className="border-b border-gray-100 hover:bg-transparent">
                            <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase h-10 w-[350px]">Nombre</TableHead>
                            <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase h-10 w-[250px] text-center">Tipo</TableHead>
                            <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase h-10 w-[180px] text-center">Estado</TableHead>
                            <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase h-10 text-right">Fecha</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {metrics?.recentUsers.map((user) => (
                            <TableRow key={user.id} className="border-b border-gray-100 last:border-none hover:bg-gray-50/50">
                                <TableCell className="py-4">
                                    <Link href={`/dashboard/usuarios/${user.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                        <Avatar className="h-11 w-11 border border-slate-200/60 shadow-sm bg-slate-100">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.email}`} className="object-cover" />
                                            <AvatarFallback className="font-bold text-slate-800 text-xs text-center flex items-center justify-center w-full">
                                                {user.nombre?.charAt(0) || ''}{user.apellido?.charAt(0) || ''}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-800 text-sm">{user.nombre} {user.apellido}</span>
                                            <span className="text-[10px] text-muted-foreground">{user.email}</span>
                                        </div>
                                    </Link>
                                </TableCell>
                                <TableCell className="py-4">
                                    <div className="flex items-center justify-center gap-2 text-slate-600 font-medium text-sm">
                                        {user.tipoUsuario === 'SERVIDOR_PUBLICO' ? <Building2 className="h-4 w-4 text-emerald-600" /> : <Shield className="h-4 w-4 text-blue-600" />}
                                        {user.tipoUsuario === 'SERVIDOR_PUBLICO' ? 'Servidor Público' : 'Asesor Privado'}
                                    </div>
                                </TableCell>
                                <TableCell className="py-4 text-center">
                                    <Badge 
                                        className="px-3 py-1 text-[10px] font-extrabold rounded-md shadow-none hover:opacity-90 cursor-default uppercase whitespace-nowrap"
                                        style={{ 
                                            backgroundColor: statusConfig[user.estadoCuenta]?.bgColor || '#f1f5f9', 
                                            color: statusConfig[user.estadoCuenta]?.color || '#64748b' 
                                        }}
                                    >
                                        {statusConfig[user.estadoCuenta]?.label || user.estadoCuenta || 'Desconocido'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="py-4 text-slate-400 font-medium text-sm text-right">
                                    {new Date(user.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
