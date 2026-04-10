'use client';

import { User, ClipboardList, Monitor, Ban, Search, HelpCircle, Clock, Loader2, Building2, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, XAxis, Cell } from 'recharts';
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

  useEffect(() => {
    const fetchMetrics = async () => {
        try {
            const data = await dashboardService.getMetrics();
            setMetrics(data);
        } catch (error) {
            console.error("Error fetching dashboard metrics:", error);
        } finally {
            setLoading(false);
        }
    };
    fetchMetrics();
  }, []);

  const statCards = [
    {
        title: 'USUARIOS TOTALES',
        value: metrics?.users.total.toLocaleString() || '0',
        icon: User,
        color: 'var(--admin-card-1-text)',
        bgColor: 'var(--admin-card-1-bg)',
        badge: '+12%'
    },
    {
        title: 'PENDIENTES POR ACTIVAR',
        value: '42',
        icon: ClipboardList,
        color: 'var(--admin-card-2-text)',
        bgColor: 'var(--admin-card-2-bg)',
        badge: '42 Hoy'
    },
    {
        title: 'CUENTAS SUSCRITAS',
        value: '912',
        icon: Monitor,
        color: 'var(--admin-card-3-text)',
        bgColor: 'var(--admin-card-3-bg)',
        badge: '71%'
    },
    {
        title: 'SUSPENSIONES RECIENTES',
        value: '8',
        icon: Ban,
        color: 'var(--admin-card-4-text)',
        bgColor: 'var(--admin-card-4-bg)',
        badge: '-2%'
    },
    {
        title: 'VENCIMIENTOS PRÓXIMOS',
        value: metrics?.alertas.cantidadVencimientos.toString() || '0',
        icon: Clock,
        color: 'var(--admin-card-5-text)',
        bgColor: 'var(--admin-card-5-bg)',
        badge: 'Próx. 48h'
    },
  ];

  // Datos mockeados para el gráfico de barras
  const chartData = [
    { date: "01 MAY", users: 150 },
    { date: "04 MAY", users: 200 },
    { date: "08 MAY", users: 180 },
    { date: "11 MAY", users: 250 },
    { date: "15 MAY", users: 310 },
    { date: "18 MAY", users: 280 },
    { date: "22 MAY", users: 380, isHighlight: true },
    { date: "26 MAY", users: 310 },
    { date: "30 MAY", users: 240 },
  ];

  const chartConfig = {
    users: {
        label: "Usuarios",
        color: "var(--admin-chart-bar)",
    }
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
                  Panel de Control
              </h1>
              <p className="text-muted-foreground text-xs font-medium mt-0.5">Métricas clave y estado general del sistema.</p>
          </div>
          
          <div className="flex-1 flex justify-center w-full max-w-md mx-auto">
              <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                      placeholder="Buscar por nombre o ID de usuario..." 
                      className="w-full pl-9 border-none rounded-full h-10 shadow-sm"
                      style={{ backgroundColor: 'var(--admin-search-bg)' }}
                  />
              </div>
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
        {/* Tarjetas Superiores estilo refactorizado (Dinámicas) */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          {statCards.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                  <Card key={idx} className="border-none shadow-sm transition-all hover:shadow-md pt-6 rounded-xl">
                      <CardContent className="flex flex-col gap-4">
                          <div className="flex items-center justify-between">
                              <div 
                                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                                  style={{ backgroundColor: stat.bgColor, color: stat.color }}
                              >
                                  <Icon className="h-5 w-5" />
                              </div>
                              {stat.badge && (
                                  <span 
                                      className="px-3 py-1 text-[10px] font-extrabold rounded-md shadow-sm"
                                      style={{ backgroundColor: stat.bgColor, color: stat.color }}
                                  >
                                      {stat.badge}
                                  </span>
                              )}
                          </div>
                          <div className="flex flex-col gap-1 mt-2">
                              <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                                  {stat.title}
                              </span>
                              <span className="text-3xl font-extrabold" style={{ color: 'var(--admin-text-title)' }}>
                                  {stat.value}
                              </span>
                          </div>
                      </CardContent>
                  </Card>
              );
          })}
        </div>

        {/* Gráfico de Barras de Crecimiento (Mockeado) */}
        <Card className="rounded-xl border-none shadow-sm pt-6 bg-white w-full">
            <CardHeader className="flex flex-row items-center justify-between pb-8">
                <div>
                    <CardTitle className="text-xl font-bold tracking-tight" style={{ color: 'var(--admin-text-title)' }}>
                        Crecimiento de Usuarios
                    </CardTitle>
                    <CardDescription className="text-sm font-medium text-muted-foreground mt-1">
                        Análisis comparativo de los últimos 30 días
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center p-1.5 rounded-full" style={{ backgroundColor: 'var(--admin-toggle-bg)' }}>
                        <Badge 
                            className="px-5 py-1.5 text-xs font-bold rounded-full border-none shadow-none hover:opacity-90 cursor-pointer"
                            style={{ backgroundColor: 'var(--admin-toggle-active-bg)', color: 'var(--admin-toggle-active-text)' }}
                        >
                            Mes
                        </Badge>
                        <Badge 
                            variant="secondary"
                            className="px-5 py-1.5 text-xs font-bold rounded-full bg-transparent border-none shadow-none text-muted-foreground hover:bg-transparent hover:text-foreground cursor-pointer"
                        >
                            Semana
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[350px] w-full">
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barCategoryGap="8%">
                        <CartesianGrid vertical={false} stroke="#f0f0f0" />
                        <XAxis 
                            dataKey="date" 
                            tickLine={false} 
                            axisLine={false} 
                            tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 600 }}
                            tickMargin={10}
                            tickFormatter={(value) => ['01 MAY', '08 MAY', '15 MAY', '22 MAY', '30 MAY'].includes(value) ? value : ''}
                        />
                        <ChartTooltip cursor={{fill: 'transparent'}} content={<ChartTooltipContent hideLabel />} />
                        <Bar dataKey="users" radius={[6, 6, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.isHighlight ? 'var(--admin-chart-bar-highlight)' : 'var(--admin-chart-bar)'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>

        {/* Tabla de Usuarios Recientes */}
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
                            <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase h-10 w-[300px]">Nombre</TableHead>
                            <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase h-10 w-[200px]">Rol</TableHead>
                            <TableHead className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase h-10 w-[150px]">Estado</TableHead>
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
                                    <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
                                        {user.tipoUsuario === 'SERVIDOR_PUBLICO' ? <Building2 className="h-4 w-4 text-emerald-600" /> : <Shield className="h-4 w-4 text-blue-600" />}
                                        {user.tipoUsuario === 'SERVIDOR_PUBLICO' ? 'Servidor Público' : 
                                         user.tipoUsuario === 'ASESOR_PRIVADO' ? 'Asesor Privado' : 
                                         (user.tipoUsuario || 'Usuario')}
                                    </div>
                                </TableCell>
                                <TableCell className="py-4">
                                    <Badge 
                                        className="px-3 py-1 text-[10px] font-extrabold rounded-md shadow-none hover:opacity-90 cursor-default"
                                        style={{ backgroundColor: 'var(--admin-badge-activo-bg)', color: 'var(--admin-badge-activo-text)' }}
                                    >
                                        ACTIVO
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
