'use client';

import { 
  Search, Bell, HelpCircle, 
  MapPin, Shield, Building2, 
  FilterX, ChevronLeft, ChevronRight, User, ClipboardList, Monitor, Ban, MoreHorizontal, Eye
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function UsuariosPage() {
  const statCards = [
    {
        title: 'USUARIOS TOTALES',
        value: '1,284',
        icon: User,
        color: 'var(--admin-card-1-text)',
        bgColor: 'var(--admin-card-1-bg)',
        badge: '+12%'
    },
    {
        title: 'POR ACTIVAR PAGO',
        value: '42',
        icon: ClipboardList,
        color: 'var(--admin-card-2-text)',
        bgColor: 'var(--admin-card-2-bg)',
        badge: '42 Hoy' /* Reteniendo mockup base pero ajustando titulo */
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
  ];

  const tableUsers = [
    {
      id: '#G-8921',
      name: 'Elena Rodríguez',
      avatar: 'ER',
      role: 'Asesor Privado',
      roleIcon: Shield,
      roleIconColor: 'text-blue-600',
      location: 'Monterrey',
      state: 'NUEVO LEÓN',
      date: '12 May 2023',
      status: 'Suscrito',
      badgeBg: 'var(--admin-badge-suscrito-bg)',
      badgeColor: 'var(--admin-badge-suscrito-text)',
      img: 'https://api.dicebear.com/7.x/notionists/svg?seed=Elena'
    },
    {
      id: '#G-4412',
      name: 'Carlos Mendoza',
      avatar: 'CM',
      role: 'Servidor Público',
      roleIcon: Building2,
      roleIconColor: 'text-emerald-600',
      location: 'Zapopan',
      state: 'JALISCO',
      date: '04 Oct 2023',
      status: 'Activo',
      badgeBg: 'var(--admin-badge-activo-bg)',
      badgeColor: 'var(--admin-badge-activo-text)',
      img: 'https://api.dicebear.com/7.x/notionists/svg?seed=Carlos'
    },
    {
      id: '#G-7721',
      name: 'Sofía Villalobos',
      avatar: 'SV',
      role: 'Asesor Privado',
      roleIcon: Shield,
      roleIconColor: 'text-blue-600',
      location: 'Mérida',
      state: 'YUCATÁN',
      date: '22 Jan 2024',
      status: 'Por pagar',
      badgeBg: 'var(--admin-badge-porpagar-bg)',
      badgeColor: 'var(--admin-badge-porpagar-text)',
      img: 'https://api.dicebear.com/7.x/notionists/svg?seed=Sofia'
    },
    {
      id: '#G-1029',
      name: 'Marco Antonio Paz',
      avatar: 'MP',
      role: 'Servidor Público',
      roleIcon: Building2,
      roleIconColor: 'text-emerald-600',
      location: 'Puebla',
      state: 'PUEBLA',
      date: '15 Nov 2022',
      status: 'Suspendido',
      badgeBg: 'var(--admin-badge-suspendido-bg)',
      badgeColor: 'var(--admin-badge-suspendido-text)',
      img: 'https://api.dicebear.com/7.x/notionists/svg?seed=Marco'
    }
  ];

  return (
    <div className="flex flex-col gap-6 w-full pt-2">
      {/* Top Header unificado de todo Dashboard */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col">
              <h1 className="text-2xl font-extrabold whitespace-nowrap" style={{ color: 'var(--admin-text-title)' }}>
                  Listado de Usuarios
              </h1>
              <p className="text-muted-foreground text-xs font-medium mt-0.5">Gestión integral del ecosistema de servidores y asesores.</p>
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
              <button className="relative p-2 text-muted-foreground hover:bg-slate-100 rounded-full transition-colors">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <button className="p-2 text-muted-foreground hover:bg-slate-100 rounded-full transition-colors">
                  <HelpCircle className="h-5 w-5" />
              </button>
              <Avatar className="h-10 w-10 border-2 border-emerald-500 cursor-pointer">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback style={{ color: 'var(--admin-avatar-text)', backgroundColor: 'var(--admin-avatar-bg)' }}>AD</AvatarFallback>
              </Avatar>
          </div>
      </div>

      <div className="mt-4 flex flex-col gap-6">
        
        {/* Panel de Filtros (Imagen 1) */}
        <div className="flex flex-col gap-4">
            {/* Fila superior de filtros */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Tarjeta de selects */}
                <div className="lg:col-span-2 rounded-xl p-6 flex flex-col sm:flex-row gap-6 justify-between items-center" style={{ backgroundColor: 'var(--admin-filter-bg)' }}>
                    <div className="flex flex-col w-full">
                        <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase mb-2">Estado</label>
                        <Select defaultValue="todos">
                            <SelectTrigger className="bg-white border-none rounded-lg h-11 text-slate-800 font-medium">
                                <SelectValue placeholder="Todos los Estados" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos los Estados</SelectItem>
                                <SelectItem value="nl">Nuevo León</SelectItem>
                                <SelectItem value="jal">Jalisco</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col w-full">
                        <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase mb-2">Municipio</label>
                        <Select defaultValue="seleccionar">
                            <SelectTrigger className="bg-white border-none rounded-lg h-11 font-medium text-slate-800">
                                <SelectValue placeholder="Seleccionar Municipio" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="seleccionar">Seleccionar Municipio</SelectItem>
                                <SelectItem value="monterrey">Monterrey</SelectItem>
                                <SelectItem value="zapopan">Zapopan</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                
                {/* Tarjeta de perfil */}
                <div className="lg:col-span-1 rounded-xl p-6 flex flex-col justify-center" style={{ backgroundColor: 'var(--admin-filter-bg)' }}>
                    <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase mb-2">Tipo de Perfil</label>
                    <div className="flex gap-2">
                        <Badge className="px-5 py-2 text-xs rounded-md shadow-none cursor-pointer hover:opacity-90 transition-opacity" style={{ backgroundColor: 'var(--admin-toggle-active-bg)', color: 'var(--admin-toggle-active-text)' }}>
                            Todos
                        </Badge>
                        <Badge variant="secondary" className="px-5 py-2 text-xs rounded-md bg-white hover:bg-white text-muted-foreground border-none font-semibold cursor-pointer">
                            Público
                        </Badge>
                        <Badge variant="secondary" className="px-5 py-2 text-xs rounded-md bg-white hover:bg-white text-muted-foreground border-none font-semibold cursor-pointer">
                            Asesor
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Fila inferior de estado */}
            <div className="rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-6" style={{ backgroundColor: 'var(--admin-filter-bg)' }}>
                <div className="flex flex-col w-full md:w-auto">
                    <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase mb-2">Estatus de Cuenta</label>
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="px-4 py-2 text-xs rounded-md bg-white text-muted-foreground border-none font-semibold hover:bg-white cursor-pointer">Por activar</Badge>
                        <Badge variant="secondary" className="px-4 py-2 text-xs rounded-md bg-white text-muted-foreground border-none font-semibold hover:bg-white cursor-pointer">Prueba gratuita</Badge>
                        <Badge className="px-4 py-2 text-xs rounded-md shadow-none cursor-pointer" style={{ backgroundColor: 'var(--admin-badge-suscrito-bg)', color: 'var(--admin-badge-suscrito-text)' }}>Suscrito</Badge>
                        <Badge variant="secondary" className="px-4 py-2 text-xs rounded-md bg-white text-muted-foreground border-none font-semibold hover:bg-white cursor-pointer">Suspendido</Badge>
                        <Badge variant="secondary" className="px-4 py-2 text-xs rounded-md bg-white text-muted-foreground border-none font-semibold hover:bg-white cursor-pointer">Por renovar</Badge>
                    </div>
                </div>
                
                <div className="flex items-center gap-6 mt-4 md:mt-0">
                    <button className="flex items-center gap-2 text-sm font-bold text-green-700 hover:text-green-800 transition-colors">
                        <FilterX className="h-4 w-4" /> Limpiar
                    </button>
                    <Button className="bg-[#1A1C19] hover:bg-black text-white px-8 py-5 h-11 rounded-lg font-bold text-sm">
                        Aplicar Filtros
                    </Button>
                </div>
            </div>
        </div>

        {/* Tabla Listado de Usuarios (Imagen 2) */}
        <div className="rounded-xl border-none pt-4 bg-[var(--admin-filter-bg)] w-full overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="border-b border-gray-200/60 hover:bg-transparent">
                            <TableHead className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase h-12 w-[300px] pl-6">Usuario / ID</TableHead>
                            <TableHead className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase h-12 w-[220px]">Rol de Perfil</TableHead>
                            <TableHead className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase h-12 w-[220px]">Ubicación</TableHead>
                            <TableHead className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase h-12 w-[150px]">Registro</TableHead>
                            <TableHead className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase h-12 w-[150px]">Estatus</TableHead>
                            <TableHead className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase h-12 text-center pr-6">Perfil</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tableUsers.map((user, idx) => {
                            const RoleIcon = user.roleIcon;
                            return (
                                <TableRow key={idx} className="border-b border-gray-200/60 last:border-none hover:bg-white/50 transition-colors">
                                    <TableCell className="py-5 pl-6">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-11 w-11 border border-slate-200/60 shadow-sm bg-slate-100">
                                                <AvatarImage src={user.img} className="object-cover" />
                                                <AvatarFallback className="font-bold text-slate-800 text-xs">{user.avatar}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900 text-sm">{user.name}</span>
                                                <span className="text-[11px] text-muted-foreground mt-0.5 font-medium">ID: {user.id}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <div className="flex items-center gap-2.5 text-slate-600 font-semibold text-sm">
                                            <RoleIcon className={`h-4 w-4 ${user.roleIconColor}`} />
                                            {user.role}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-800 text-sm">{user.location}</span>
                                            <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase mt-0.5">{user.state}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-5 text-slate-800 font-bold text-sm tracking-tight">{user.date}</TableCell>
                                    <TableCell className="py-5">
                                        <Badge 
                                            className="px-3 py-1 text-[11px] font-extrabold rounded-md shadow-none hover:opacity-90 cursor-default"
                                            style={{ backgroundColor: user.badgeBg, color: user.badgeColor }}
                                        >
                                            {user.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-5 pr-6 text-center">
                                        <a href={`/dashboard/usuarios/${user.id.replace('#', '')}`} className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 rounded-md transition-colors inline-flex">
                                            <Eye className="h-5 w-5" />
                                        </a>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
            
            {/* Paginación */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-5 border-t border-gray-200/60 bg-[var(--admin-filter-bg)]">
                <span className="text-xs font-semibold text-muted-foreground mb-4 sm:mb-0">Mostrando <span className="text-slate-900">1-4</span> de <span className="text-slate-900">128</span> usuarios registrados</span>
                <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-md bg-white border-gray-200 hover:bg-gray-50 shadow-sm text-muted-foreground">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="default" size="icon" className="h-8 w-8 rounded-md shadow-sm border-none font-bold text-sm" style={{ backgroundColor: 'var(--admin-toggle-active-bg)', color: 'var(--admin-toggle-active-text)' }}>
                        1
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md font-bold text-sm text-slate-600 hover:bg-white">2</Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md font-bold text-sm text-slate-600 hover:bg-white">3</Button>
                    <span className="text-sm font-bold text-slate-400 px-1">...</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md font-bold text-sm text-slate-600 hover:bg-white">32</Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-md bg-white border-gray-200 hover:bg-gray-50 shadow-sm text-muted-foreground">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>

        {/* Tarjetas Inferiores */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 pb-12">
          {statCards.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                  <Card key={idx} className="border-none shadow-sm transition-all hover:shadow-md pt-6 rounded-2xl">
                      <CardContent className="flex flex-col gap-4">
                          <div className="flex items-center justify-between">
                              <div 
                                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                                  style={{ backgroundColor: stat.bgColor, color: stat.color }}
                              >
                                  <Icon className="h-6 w-6" />
                              </div>
                              {stat.badge && (
                                  <span 
                                      className="px-3 py-1 text-xs font-bold rounded-full"
                                      style={{ backgroundColor: stat.bgColor, color: stat.color }}
                                  >
                                      {stat.badge}
                                  </span>
                              )}
                          </div>
                          <div className="flex flex-col mt-2">
                              <span className="text-4xl font-extrabold" style={{ color: 'var(--admin-text-title)' }}>
                                  {stat.value}
                              </span>
                              <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase mt-1">
                                  {stat.title}
                              </span>
                          </div>
                      </CardContent>
                  </Card>
              );
          })}
        </div>

      </div>
    </div>
  );
}
