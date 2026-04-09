'use client';

import { 
  Search, HelpCircle, 
  MapPin, Shield, Building2, 
  FilterX, ChevronLeft, ChevronRight, User, ClipboardList, Monitor, Ban, MoreHorizontal, Eye
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/dashboard/NotificationBell';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { sdk } from '@/lib/universitas';
import { adminService, GetUsersParams } from '@/services/adminService';
import { User as UserType, PaginationMeta } from '@/types/user';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Estado {
  id: number;
  nombre: string;
}

interface Municipio {
  id: number;
  estado_id: number;
  nombre: string;
}

export default function UsuariosPage() {
  // --- ESTADO ---
  const [users, setUsers] = useState<UserType[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  
  // SDK Data
  const [estados, setEstados] = useState<Estado[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [loadingTerritorio, setLoadingTerritorio] = useState(false);

  // Filtros
  const [filters, setFilters] = useState<GetUsersParams>({
    page: 1,
    limit: 10,
    search: '',
    isActive: undefined,
    estado: undefined,
    municipio: undefined,
    tipoUsuario: undefined,
  });

  const [tempSearch, setTempSearch] = useState('');

  // --- FETCHING ---

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllUsers(filters);
      setUsers(response.data);
      setMeta(response.meta);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchEstados = useCallback(async () => {
    try {
      const response = await sdk.territorio.getEstados();
      setEstados(response.data);
    } catch (error) {
      console.error('Error fetching estados:', error);
    }
  }, []);

  const fetchMunicipios = useCallback(async (estadoId: number) => {
    setLoadingTerritorio(true);
    try {
      const response = await sdk.territorio.getMunicipios(estadoId);
      setMunicipios(response.data);
    } catch (error) {
      console.error('Error fetching municipios:', error);
    } finally {
      setLoadingTerritorio(false);
    }
  }, []);

  // --- EFFECTS ---

  useEffect(() => {
    fetchEstados();
  }, [fetchEstados]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // --- HANDLERS ---

  const handleEstadoChange = (estadoNombre: string) => {
    const estado = estados.find(e => e.nombre === estadoNombre);
    if (estado) {
      setFilters(prev => ({ ...prev, estado: estadoNombre, municipio: undefined, page: 1 }));
      fetchMunicipios(estado.id);
    } else {
      setFilters(prev => ({ ...prev, estado: undefined, municipio: undefined, page: 1 }));
      setMunicipios([]);
    }
  };

  const handleMunicipioChange = (municipioNombre: string) => {
    setFilters(prev => ({ ...prev, municipio: municipioNombre === 'todos' ? undefined : municipioNombre, page: 1 }));
  };

  const handleTipoUsuarioChange = (tipo: string) => {
    setFilters(prev => ({ ...prev, tipoUsuario: tipo === 'todos' ? undefined : tipo, page: 1 }));
  };

  const handleStatusChange = (status: string) => {
    let isActiveValue: string | undefined = undefined;
    if (status === 'activo') isActiveValue = 'true';
    if (status === 'inactivo') isActiveValue = 'false';
    
    setFilters(prev => ({ ...prev, isActive: isActiveValue, page: 1 }));
  };

  const applySearch = () => {
    setFilters(prev => ({ ...prev, search: tempSearch, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      search: '',
      isActive: undefined,
      estado: undefined,
      municipio: undefined,
      tipoUsuario: undefined,
    });
    setTempSearch('');
    setMunicipios([]);
  };

  const statCards = [
    {
        title: 'USUARIOS TOTALES',
        value: meta?.totalItems.toString() || '...',
        icon: User,
        color: 'var(--admin-card-1-text)',
        bgColor: 'var(--admin-card-1-bg)',
        badge: ''
    },
    {
        title: 'POR ACTIVAR PAGO',
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
                      placeholder="Buscar por correo electrónico..." 
                      className="w-full pl-9 border-none rounded-full h-10 shadow-sm"
                      style={{ backgroundColor: 'var(--admin-search-bg)' }}
                      value={tempSearch}
                      onChange={(e) => setTempSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && applySearch()}
                  />
              </div>
          </div>

          <div className="flex items-center gap-4 justify-end min-w-[140px]">
              <NotificationBell />
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
                        <Select 
                            value={filters.estado || "todos"} 
                            onValueChange={handleEstadoChange}
                        >
                            <SelectTrigger className="bg-white border-none rounded-lg h-11 text-slate-800 font-medium">
                                <SelectValue placeholder="Todos los Estados" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos los Estados</SelectItem>
                                {estados.map((e) => (
                                    <SelectItem key={e.id} value={e.nombre}>{e.nombre}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col w-full">
                        <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase mb-2">Municipio</label>
                        <Select 
                            value={filters.municipio || "seleccionar"} 
                            onValueChange={handleMunicipioChange}
                            disabled={!filters.estado || loadingTerritorio}
                        >
                            <SelectTrigger className="bg-white border-none rounded-lg h-11 font-medium text-slate-800">
                                <SelectValue placeholder={loadingTerritorio ? "Cargando..." : "Seleccionar Municipio"} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="seleccionar" disabled>Seleccionar Municipio</SelectItem>
                                <SelectItem value="todos">Todos los Municipios</SelectItem>
                                {municipios.map((m) => (
                                    <SelectItem key={m.id} value={m.nombre}>{m.nombre}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                
                {/* Tarjeta de perfil */}
                <div className="lg:col-span-1 rounded-xl p-6 flex flex-col justify-center" style={{ backgroundColor: 'var(--admin-filter-bg)' }}>
                    <label className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase mb-2">Tipo de Perfil</label>
                    <div className="flex gap-2">
                        <Badge 
                            className={`px-5 py-2 text-xs rounded-md shadow-none cursor-pointer transition-opacity ${!filters.tipoUsuario ? '' : 'bg-white text-muted-foreground hover:bg-white hover:opacity-100'}`}
                            style={!filters.tipoUsuario ? { backgroundColor: 'var(--admin-toggle-active-bg)', color: 'var(--admin-toggle-active-text)' } : {}}
                            onClick={() => handleTipoUsuarioChange('todos')}
                        >
                            Todos
                        </Badge>
                        <Badge 
                            variant="secondary" 
                            className={`px-5 py-2 text-xs rounded-md border-none font-semibold cursor-pointer ${filters.tipoUsuario === 'SERVIDOR_PUBLICO' ? '' : 'bg-white text-muted-foreground hover:bg-white'}`}
                            style={filters.tipoUsuario === 'SERVIDOR_PUBLICO' ? { backgroundColor: 'var(--admin-toggle-active-bg)', color: 'var(--admin-toggle-active-text)' } : {}}
                            onClick={() => handleTipoUsuarioChange('SERVIDOR_PUBLICO')}
                        >
                            Público
                        </Badge>
                        <Badge 
                            variant="secondary" 
                            className={`px-5 py-2 text-xs rounded-md border-none font-semibold cursor-pointer ${filters.tipoUsuario === 'ASESOR_PRIVADO' ? '' : 'bg-white text-muted-foreground hover:bg-white'}`}
                            style={filters.tipoUsuario === 'ASESOR_PRIVADO' ? { backgroundColor: 'var(--admin-toggle-active-bg)', color: 'var(--admin-toggle-active-text)' } : {}}
                            onClick={() => handleTipoUsuarioChange('ASESOR_PRIVADO')}
                        >
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
                        <Badge 
                            variant="secondary" 
                            className={`px-4 py-2 text-xs rounded-md border-none font-semibold cursor-pointer ${!filters.isActive ? 'shadow-sm active-badge' : 'bg-white text-muted-foreground hover:bg-white'}`}
                            style={!filters.isActive ? { backgroundColor: 'var(--admin-toggle-active-bg)', color: 'var(--admin-toggle-active-text)' } : {}}
                            onClick={() => handleStatusChange('todos')}
                        >
                            Todos
                        </Badge>
                        <Badge 
                            variant="secondary" 
                            className={`px-4 py-2 text-xs rounded-md border-none font-semibold cursor-pointer ${filters.isActive === 'true' ? '' : 'bg-white text-muted-foreground hover:bg-white'}`}
                            style={filters.isActive === 'true' ? { backgroundColor: 'var(--admin-badge-activo-bg)', color: 'var(--admin-badge-activo-text)' } : {}}
                            onClick={() => handleStatusChange('activo')}
                        >
                            Activos
                        </Badge>
                        <Badge 
                            variant="secondary" 
                            className={`px-4 py-2 text-xs rounded-md border-none font-semibold cursor-pointer ${filters.isActive === 'false' ? '' : 'bg-white text-muted-foreground hover:bg-white'}`}
                            style={filters.isActive === 'false' ? { backgroundColor: 'var(--admin-badge-suspendido-bg)', color: 'var(--admin-badge-suspendido-text)' } : {}}
                            onClick={() => handleStatusChange('inactivo')}
                        >
                            Inactivos
                        </Badge>
                    </div>
                </div>
                
                <div className="flex items-center gap-6 mt-4 md:mt-0">
                    <button 
                        onClick={clearFilters}
                        className="flex items-center gap-2 text-sm font-bold text-green-700 hover:text-green-800 transition-colors"
                    >
                        <FilterX className="h-4 w-4" /> Limpiar
                    </button>
                    <Button 
                        onClick={applySearch}
                        className="bg-[#1A1C19] hover:bg-black text-white px-8 py-5 h-11 rounded-lg font-bold text-sm"
                    >
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
                        {loading ? (
                             <TableRow>
                                <TableCell colSpan={6} className="h-40 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-emerald-500"></div>
                                        <span className="text-sm font-medium text-muted-foreground">Cargando usuarios...</span>
                                    </div>
                                </TableCell>
                             </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-40 text-center text-muted-foreground font-medium">
                                    No se encontraron usuarios con los filtros aplicados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user, idx) => {
                                return (
                                    <TableRow key={user.id} className="border-b border-gray-200/60 last:border-none hover:bg-white/50 transition-colors">
                                        <TableCell className="py-5 pl-6">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-11 w-11 border border-slate-200/60 shadow-sm bg-slate-100">
                                                    <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.nombre}`} className="object-cover" />
                                                    <AvatarFallback className="font-bold text-slate-800 text-xs">{user.nombre[0]}{user.apellido ? user.apellido[0] : ''}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900 text-sm">{user.nombre} {user.apellido}</span>
                                                    <span className="text-[11px] text-muted-foreground mt-0.5 font-medium">{user.email}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-5">
                                            <div className="flex items-center gap-2.5 text-slate-600 font-semibold text-sm">
                                                {user.tipoUsuario === 'SERVIDOR_PUBLICO' ? <Building2 className="h-4 w-4 text-emerald-600" /> : <Shield className="h-4 w-4 text-blue-600" />}
                                                {user.tipoUsuario === 'SERVIDOR_PUBLICO' ? 'Servidor Público' : 'Asesor Privado'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-5">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800 text-sm">{user.municipio || '---'}</span>
                                                <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase mt-0.5">{user.estado || '---'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-5 text-slate-800 font-bold text-sm tracking-tight">
                                            {format(new Date(user.createdAt), 'dd MMM yyyy', { locale: es })}
                                        </TableCell>
                                        <TableCell className="py-5">
                                            <Badge 
                                                className="px-3 py-1 text-[11px] font-extrabold rounded-md shadow-none hover:opacity-90 cursor-default"
                                                style={{ 
                                                    backgroundColor: user.isActive ? 'var(--admin-badge-activo-bg)' : 'var(--admin-badge-suspendido-bg)', 
                                                    color: user.isActive ? 'var(--admin-badge-activo-text)' : 'var(--admin-badge-suspendido-text)' 
                                                }}
                                            >
                                                {user.isActive ? 'Activo' : 'Inactivo'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-5 pr-6 text-center">
                                            <a href={`/dashboard/usuarios/${user.id}`} className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 rounded-md transition-colors inline-flex">
                                                <Eye className="h-5 w-5" />
                                            </a>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
            
            {/* Paginación */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-5 border-t border-gray-200/60 bg-[var(--admin-filter-bg)]">
                <span className="text-xs font-semibold text-muted-foreground mb-4 sm:mb-0">
                    Mostrando <span className="text-slate-900">{meta ? ((meta.currentPage - 1) * meta.itemsPerPage) + 1 : 0}-{meta ? Math.min(meta.currentPage * meta.itemsPerPage, meta.totalItems) : 0}</span> de <span className="text-slate-900">{meta?.totalItems || 0}</span> usuarios registrados
                </span>
                <div className="flex items-center gap-1.5">
                    <Button 
                        variant="outline" size="icon" className="h-8 w-8 rounded-md bg-white border-gray-200 hover:bg-gray-50 shadow-sm text-muted-foreground"
                        disabled={filters.page === 1}
                        onClick={() => setFilters(prev => ({ ...prev, page: prev.page! - 1 }))}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {meta && Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                            <Button 
                                key={pageNum}
                                variant={filters.page === pageNum ? "default" : "ghost"} 
                                size="icon" 
                                className={`h-8 w-8 rounded-md font-bold text-sm ${filters.page === pageNum ? 'shadow-sm border-none' : 'text-slate-600 hover:bg-white'}`}
                                style={filters.page === pageNum ? { backgroundColor: 'var(--admin-toggle-active-bg)', color: 'var(--admin-toggle-active-text)' } : {}}
                                onClick={() => setFilters(prev => ({ ...prev, page: pageNum }))}
                            >
                                {pageNum}
                            </Button>
                        );
                    })}
                    
                    {meta && meta.totalPages > 5 && <span className="text-sm font-bold text-slate-400 px-1">...</span>}
                    
                    <Button 
                        variant="outline" size="icon" className="h-8 w-8 rounded-md bg-white border-gray-200 hover:bg-gray-50 shadow-sm text-muted-foreground"
                        disabled={!meta || filters.page === meta.totalPages}
                        onClick={() => setFilters(prev => ({ ...prev, page: prev.page! + 1 }))}
                    >
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
