'use client';

import { 
  HelpCircle, 
  Shield, Building2, 
  FilterX, ChevronLeft, ChevronRight, User, ClipboardList, Ban, ShieldCheck, Search
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NotificationBell } from '@/components/dashboard/NotificationBell';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { UniversitasAPI } from 'sdk-global-universitas';
import { adminService, GetUsersParams } from '@/services/adminService';
import { DashboardMetrics, dashboardService } from '@/services/dashboardService';
import { PaginationMeta, User as UserType } from '@/types/user';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Initialize the SDK directly
const sdk = new (UniversitasAPI as any)();

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
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Dashboard Summary Data
  const [dashboardData, setDashboardData] = useState<DashboardMetrics | null>(null);
  
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
    estadoCuenta: undefined,
  });

  const [tempSearch, setTempSearch] = useState('');

  // --- FETCHING ---

  const fetchSummary = useCallback(async () => {
    try {
      const data = await dashboardService.getMetrics();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  }, []);

  const fetchUsers = useCallback(async (currentFilters: GetUsersParams, signal?: AbortSignal) => {
    setLoading(true);
    try {
      const response = await adminService.getAllUsers(currentFilters);
      if (signal?.aborted) return;
      setUsers(response.data);
      setMeta(response.meta);
    } catch (error) {
      if (signal?.aborted) return;
      console.error('Error fetching users:', error);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

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
    fetchSummary();
  }, [fetchEstados, fetchSummary]);

  useEffect(() => {
    const abortController = new AbortController();
    fetchUsers(filters, abortController.signal);
    return () => abortController.abort();
  }, [filters, fetchUsers]);

  // Manejar filtros iniciales y sincronizar con URL
  useEffect(() => {
    if (isInitialLoad) {
      const page = searchParams.get('page');
      const limit = searchParams.get('limit');
      const tipo = searchParams.get('tipoUsuario');
      const estadoC = searchParams.get('estadoCuenta');
      const search = searchParams.get('search');
      const estado = searchParams.get('estado');
      const municipio = searchParams.get('municipio');
      
      setFilters(prev => ({
        ...prev,
        page: page ? parseInt(page) : prev.page,
        limit: limit ? parseInt(limit) : prev.limit,
        tipoUsuario: tipo || prev.tipoUsuario,
        estadoCuenta: estadoC || prev.estadoCuenta,
        search: search || prev.search,
        estado: estado || prev.estado,
        municipio: municipio || prev.municipio,
      }));
      
      if (search) setTempSearch(search);
      setIsInitialLoad(false);
    } else {
      const params = new URLSearchParams(searchParams.toString());
      
      if (filters.page && filters.page > 1) { params.set('page', filters.page.toString()); } else { params.delete('page'); }
      if (filters.limit && filters.limit !== 10) { params.set('limit', filters.limit.toString()); } else { params.delete('limit'); }
      if (filters.search) { params.set('search', filters.search); } else { params.delete('search'); }
      if (filters.tipoUsuario) { params.set('tipoUsuario', filters.tipoUsuario); } else { params.delete('tipoUsuario'); }
      if (filters.estadoCuenta) { params.set('estadoCuenta', filters.estadoCuenta); } else { params.delete('estadoCuenta'); }
      if (filters.estado) { params.set('estado', filters.estado); } else { params.delete('estado'); }
      if (filters.municipio) { params.set('municipio', filters.municipio); } else { params.delete('municipio'); }

      const newQueryString = params.toString();
      const currentQueryString = searchParams.toString();
      
      if (newQueryString !== currentQueryString) {
        router.replace(`${pathname}?${newQueryString}`, { scroll: false });
      }
    }
  }, [filters, searchParams, pathname, router, isInitialLoad]);

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
    setFilters(prev => ({ 
      ...prev, 
      estadoCuenta: status === 'todos' ? undefined : status, 
      page: 1 
    }));
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

  const handleLimitChange = (value: string) => {
    setFilters(prev => ({ ...prev, limit: parseInt(value), page: 1 }));
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUserIds(users.map(u => u.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const toggleSelectUser = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
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
      estadoCuenta: undefined,
    });
    setTempSearch('');
    setMunicipios([]);
  };

  const statCards = [
    {
        title: 'USUARIOS TOTALES',
        value: dashboardData?.users.total.toLocaleString() || meta?.totalItems.toString() || '...',
        icon: User,
        color: 'var(--admin-card-1-text)',
        bgColor: 'var(--admin-card-1-bg)',
        badge: '',
        filter: { type: 'reset' }
    },
    {
        title: 'SERVIDORES PÚBLICOS',
        value: dashboardData?.analytics.porTipousuario.servidoresPublicos.toLocaleString() || '...',
        icon: Building2,
        color: '#10b981',
        bgColor: '#dcfce7',
        badge: 'Públicos',
        filter: { type: 'tipo', value: 'SERVIDOR_PUBLICO' }
    },
    {
        title: 'ASESORES PRIVADOS',
        value: dashboardData?.analytics.porTipousuario.asesoresPrivados.toLocaleString() || '...',
        icon: Shield,
        color: '#3b82f6',
        bgColor: '#dbeafe',
        badge: 'Asesores',
        filter: { type: 'tipo', value: 'ASESOR_PRIVADO' }
    },
    {
        title: 'USUARIOS VERIFICADOS',
        value: dashboardData?.users.verified.toLocaleString() || '...',
        icon: ShieldCheck,
        color: '#059669',
        bgColor: '#ecfdf5',
        badge: 'Verificados',
        filter: { type: 'estadoCuenta', value: 'ACTIVO' } // O el que corresponda a verificado
    },
    {
        title: 'PENDIENTES VERIFICAR',
        value: dashboardData?.analytics.usuariosNoVerificados.toLocaleString() || '...',
        icon: ClipboardList,
        color: '#b45309',
        bgColor: '#fef3c7',
        badge: 'Pendientes',
        filter: { type: 'estadoCuenta', value: 'POR_ACTIVAR' }
    },
    {
        title: 'SUSPENSIONES',
        value: dashboardData?.analytics.suspensionesRecientes.toLocaleString() || '...',
        icon: Ban,
        color: '#be123c',
        bgColor: '#ffe4e6',
        badge: 'Recientes',
        filter: { type: 'estadoCuenta', value: 'SUSPENDIDO' }
    },
  ];

  const handleCardClick = (cardFilter: { type: string, value?: string }) => {
    if (cardFilter.type === 'reset') {
        clearFilters();
    } else if (cardFilter.type === 'tipo') {
        handleTipoUsuarioChange(cardFilter.value || '');
    } else if (cardFilter.type === 'estadoCuenta') {
        handleStatusChange(cardFilter.value || '');
    }
  };

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
                            className={`px-4 py-2 text-xs rounded-md border-none font-semibold cursor-pointer ${!filters.estadoCuenta ? 'shadow-sm active-badge' : 'bg-white text-muted-foreground hover:bg-white'}`}
                            style={!filters.estadoCuenta ? { backgroundColor: 'var(--admin-toggle-active-bg)', color: 'var(--admin-toggle-active-text)' } : {}}
                            onClick={() => handleStatusChange('todos')}
                        >
                            Todos
                        </Badge>
                        {Object.entries(statusConfig).map(([key, config]) => (
                            <Badge 
                                key={key}
                                variant="secondary" 
                                className={`px-4 py-2 text-xs rounded-md border-none font-semibold cursor-pointer ${filters.estadoCuenta === key ? '' : 'bg-white text-muted-foreground hover:bg-white'}`}
                                style={filters.estadoCuenta === key ? { backgroundColor: config.bgColor, color: config.color, border: `1px solid ${config.color}20` } : {}}
                                onClick={() => handleStatusChange(key)}
                            >
                                {config.label}
                            </Badge>
                        ))}
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
                            <TableHead className="w-[50px] pl-6 h-12">
                                <Checkbox 
                                    checked={users.length > 0 && selectedUserIds.length === users.length}
                                    onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                                />
                            </TableHead>
                            <TableHead className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase h-12 w-[250px]">Usuario / ID</TableHead>
                            <TableHead className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase h-12 w-[200px]">Rol de Perfil</TableHead>
                            <TableHead className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase h-12 w-[180px]">Ubicación</TableHead>
                            <TableHead className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase h-12 w-[130px]">Registro</TableHead>
                            <TableHead className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase h-12 w-[130px] pr-6">Estatus</TableHead>
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
                            users.map((user) => {
                                return (
                                    <TableRow 
                                        key={user.id} 
                                        className="border-b border-gray-200/60 last:border-none hover:bg-white/50 transition-colors group cursor-pointer"
                                        onClick={() => router.push(`/dashboard/usuarios/${user.id}`)}
                                    >
                                        <TableCell className="py-5 pl-6" onClick={(e) => e.stopPropagation()}>
                                            <Checkbox 
                                                checked={selectedUserIds.includes(user.id)}
                                                onCheckedChange={() => toggleSelectUser(user.id)}
                                            />
                                        </TableCell>
                                        <TableCell className="py-5">
                                            <Link href={`/dashboard/usuarios/${user.id}`} className="flex items-center gap-4 hover:opacity-80 transition-opacity w-fit" onClick={(e) => e.stopPropagation()}>
                                                <Avatar className="h-11 w-11 border border-slate-200/60 shadow-sm bg-slate-100">
                                                    <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.nombre}`} className="object-cover" />
                                                    <AvatarFallback className="font-bold text-slate-800 text-xs">{user.nombre[0]}{user.apellido ? user.apellido[0] : ''}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900 text-sm hover:underline">{user.nombre} {user.apellido}</span>
                                                    <span className="text-[11px] text-muted-foreground mt-0.5 font-medium">{user.email}</span>
                                                </div>
                                            </Link>
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
                                        <TableCell className="py-5 pr-6">
                                            {(() => {
                                                const config = statusConfig[user.estadoCuenta] || { label: user.estadoCuenta || 'Sin Estado', color: '#64748b', bgColor: '#f1f5f9' };
                                                return (
                                                    <Badge 
                                                        className="px-3 py-1 text-[10px] font-extrabold rounded-md shadow-none cursor-default border-none"
                                                        style={{ 
                                                            backgroundColor: config.bgColor, 
                                                            color: config.color,
                                                        }}
                                                    >
                                                        {config.label.toUpperCase()}
                                                    </Badge>
                                                );
                                            })()}
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
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                    <span className="text-xs font-semibold text-muted-foreground">
                        Mostrar
                    </span>
                    <Select
                        value={filters.limit?.toString() || "10"}
                        onValueChange={handleLimitChange}
                    >
                        <SelectTrigger className="w-[70px] bg-white border-gray-200 h-8 text-xs font-bold">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                    <span className="text-xs font-semibold text-muted-foreground">
                        filas
                    </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <span className="text-xs font-semibold text-muted-foreground">
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
        </div>

        {/* Tarjetas Inferiores */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-6 pb-12">
          {statCards.map((stat, idx) => {
              const Icon = stat.icon;
              const isActive = (stat.filter.type === 'tipo' && filters.tipoUsuario === stat.filter.value) || 
                               (stat.filter.type === 'estadoCuenta' && filters.estadoCuenta === stat.filter.value) ||
                               (stat.filter.type === 'reset' && !filters.tipoUsuario && !filters.estadoCuenta);

              return (
                  <Card 
                    key={idx} 
                    className={`border-2 transition-all hover:shadow-md rounded-2xl cursor-pointer flex flex-col h-full ${isActive ? 'shadow-md scale-[1.02]' : 'border-transparent shadow-sm'}`}
                    style={isActive ? { borderColor: stat.color, backgroundColor: 'white' } : {}}
                    onClick={() => handleCardClick(stat.filter)}
                  >
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
                                  >
                                      {stat.badge}
                                  </span>
                              )}
                          </div>
                          <div className="flex flex-col mt-auto">
                              <span className="text-2xl font-black tracking-tight" style={{ color: 'var(--admin-text-title)' }}>
                                  {stat.value}
                              </span>
                              <span className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase mt-1">
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
