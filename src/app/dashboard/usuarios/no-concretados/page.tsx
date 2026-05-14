'use client';

import {
  Shield,
  Building2,
  ChevronLeft,
  ChevronRight,
  User,
  Search,
  Trash2,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NotificationBell } from '@/components/dashboard/NotificationBell';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

import { adminService } from '@/services/adminService';
import { PaginationMeta, AbandonedRegistration } from '@/types/user';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AbandonedRegistrationsPage() {
  const [users, setUsers] = useState<AbandonedRegistration[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [popoverId, setPopoverId] = useState<string | null>(null);

  // Filtros
  const [filters, setFilters] = useState<{
    page: number;
    limit: number;
    search: string;
    tipoUsuario?: string;
  }>({
    page: 1,
    limit: 10,
    search: '',
    tipoUsuario: undefined,
  });

  const [tempSearch, setTempSearch] = useState('');

  // --- FETCHING ---

  const ejecutarEliminar = async (id: string) => {
    try {
      await adminService.deleteAbandonedRegistration(id);
      toast.success('Registro eliminado exitosamente.');
      setPopoverId(null);
      fetchUsers(filters);
    } catch (error) {
      console.error(error);
      toast.error('Error al eliminar el registro.');
    }
  };

  const fetchUsers = useCallback(
    async (currentFilters: typeof filters, signal?: AbortSignal) => {
      setLoading(true);
      try {
        const response =
          await adminService.getAbandonedRegistrations(currentFilters);
        if (signal?.aborted) return;
        setUsers(response.data);
        setMeta(response.meta);
      } catch (error) {
        if (signal?.aborted) return;
        console.error('Error fetching users:', error);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    []
  );

  // --- EFFECTS ---

  useEffect(() => {
    const controller = new AbortController();
    fetchUsers(filters, controller.signal);
    return () => controller.abort();
  }, [filters, fetchUsers]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (tempSearch !== filters.search) {
        setFilters((prev) => ({ ...prev, search: tempSearch, page: 1 }));
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [tempSearch, filters.search]);

  // --- HANDLERS ---

  const handleLimitChange = (value: string) => {
    setFilters((prev) => ({ ...prev, limit: Number(value), page: 1 }));
  };

  const userAdmin = {
    name: 'Admin',
    avatar: '',
  };

  return (
    <div className="flex flex-col gap-6 w-full pt-2">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col">
          <h1
            className="text-2xl font-extrabold whitespace-nowrap"
            style={{ color: 'var(--admin-text-title)' }}
          >
            Usuarios No Concretados
          </h1>
          <p className="text-muted-foreground text-xs font-medium mt-0.5">
            Gestión de registros abandonados antes de confirmar email.
          </p>
        </div>

        <div className="flex-1 flex justify-center w-full max-w-md mx-auto">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por correo electrónico o nombre..."
              className="w-full pl-9 border-none rounded-full h-10 shadow-sm"
              style={{ backgroundColor: 'var(--admin-filter-bg)' }}
              value={tempSearch}
              onChange={(e) => setTempSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 justify-end min-w-[140px]">
          <NotificationBell />
          <Avatar className="h-10 w-10 border-2 border-emerald-500 cursor-pointer">
            <AvatarImage src={userAdmin.avatar} />
            <AvatarFallback
              style={{
                color: 'var(--admin-avatar-text)',
                backgroundColor: 'var(--admin-avatar-bg)',
              }}
            >
              AD
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col mt-2">
        {/* Filtros Bar */}
        <div
          className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-100"
          style={{ backgroundColor: 'var(--admin-filter-bg)' }}
        >
          <Select
            value={filters.tipoUsuario || 'ALL'}
            onValueChange={(v) =>
              setFilters((prev) => ({
                ...prev,
                tipoUsuario: v === 'ALL' ? undefined : v,
                page: 1,
              }))
            }
          >
            <SelectTrigger className="w-[180px] bg-white border-none h-10 shadow-sm font-semibold text-xs">
              <SelectValue placeholder="Tipo de Usuario" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los tipos</SelectItem>
              <SelectItem value="SERVIDOR_PUBLICO">Servidor Público</SelectItem>
              <SelectItem value="ASESOR_PRIVADO">Asesor Privado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto min-h-[400px]">
          <Table>
            <TableHeader>
              <TableRow className="border-b-gray-100 bg-gray-50/50 hover:bg-gray-50/50">
                <TableHead className="py-4 pl-6 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Usuario / Email
                </TableHead>
                <TableHead className="py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Teléfono
                </TableHead>
                <TableHead className="py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Tipo de Perfil
                </TableHead>
                <TableHead className="py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Fecha de Registro
                </TableHead>
                <TableHead className="py-4 pr-6 text-right font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-[300px] text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-4"></div>
                      <p className="text-sm font-semibold tracking-wide">
                        Cargando registros...
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-[300px] text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <User className="h-12 w-12 text-slate-300 mb-4 opacity-50" />
                      <h3 className="text-lg font-bold text-slate-900 mb-1">
                        No hay registros
                      </h3>
                      <p className="text-sm">
                        No se encontraron usuarios abandonados con los filtros
                        actuales.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow
                    key={user.id}
                    className="group border-b-gray-100/60 hover:bg-slate-50/80 transition-colors"
                  >
                    <TableCell className="py-5 pl-6">
                      <div className="flex items-center gap-4">
                        <Link
                          href={`/dashboard/usuarios/no-concretados/${user.id}`}
                          className="flex flex-col min-w-0 hover:opacity-80"
                        >
                          <span className="font-bold text-slate-900 text-sm hover:underline truncate">
                            {user.nombre} {user.apellido}
                          </span>
                          <span className="text-[11px] text-muted-foreground mt-0.5 font-medium truncate">
                            {user.email}
                          </span>
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      <span className="font-bold text-slate-800 text-sm">
                        {user.telefono || 'No indicado'}
                      </span>
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="flex items-center gap-2.5 text-slate-600 font-semibold text-sm">
                        {user.tipoUsuario === 'SERVIDOR_PUBLICO' ? (
                          <Building2 className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Shield className="h-4 w-4 text-blue-600" />
                        )}
                        {user.tipoUsuario === 'SERVIDOR_PUBLICO'
                          ? 'Servidor Público'
                          : user.tipoUsuario === 'ASESOR_PRIVADO'
                            ? 'Asesor Privado'
                            : '---'}
                      </div>
                    </TableCell>
                    <TableCell className="py-5 text-slate-800 font-bold text-sm tracking-tight">
                      {format(new Date(user.registeredAt), 'dd MMM yyyy', {
                        locale: es,
                      })}
                    </TableCell>
                    <TableCell className="py-5 pr-6 text-right">
                      <Popover
                        open={popoverId === user.id}
                        onOpenChange={(open: boolean) =>
                          setPopoverId(open ? user.id : null)
                        }
                      >
                        <PopoverTrigger asChild>
                          <button className="p-2 bg-red-50 border border-red-100 shadow-sm text-red-500 hover:text-red-700 hover:border-red-300 hover:bg-red-100 rounded-lg transition-all group/trash">
                            <Trash2 className="h-4 w-4 transition-transform group-hover/trash:scale-110" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-64 p-4 rounded-xl shadow-xl border-slate-100"
                          align="end"
                          sideOffset={5}
                        >
                          <div className="flex flex-col gap-3 cursor-default">
                            <div className="flex items-start gap-3">
                              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </div>
                              <div className="flex flex-col">
                                <h4 className="font-bold text-slate-900 text-sm">
                                  Eliminar Registro
                                </h4>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  ¿Seguro? Esta acción es irreversible.
                                </p>
                              </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs px-3 shadow-none text-slate-600 font-bold"
                                onClick={() => setPopoverId(null)}
                              >
                                Cancelar
                              </Button>
                              <Button
                                size="sm"
                                className="h-7 text-xs px-3 shadow-none bg-red-600 hover:bg-red-700 text-white font-bold"
                                onClick={() => ejecutarEliminar(user.id)}
                              >
                                Eliminar
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                  </TableRow>
                ))
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
              value={filters.limit.toString()}
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
              Mostrando{' '}
              <span className="text-slate-900">
                {meta ? (meta.currentPage - 1) * meta.itemsPerPage + 1 : 0}-
                {meta
                  ? Math.min(
                      meta.currentPage * meta.itemsPerPage,
                      meta.totalItems
                    )
                  : 0}
              </span>{' '}
              de <span className="text-slate-900">{meta?.totalItems || 0}</span>{' '}
              registros
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-md bg-white border-gray-200 hover:bg-gray-50 shadow-sm text-muted-foreground"
                disabled={filters.page === 1}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, page: prev.page! - 1 }))
                }
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {meta &&
                Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={filters.page === pageNum ? 'default' : 'ghost'}
                      size="icon"
                      className={`h-8 w-8 rounded-md font-bold text-sm ${filters.page === pageNum ? 'shadow-sm border-none bg-emerald-600 text-white' : 'text-slate-600 hover:bg-white'}`}
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, page: pageNum }))
                      }
                    >
                      {pageNum}
                    </Button>
                  );
                })}

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-md bg-white border-gray-200 hover:bg-gray-50 shadow-sm text-muted-foreground"
                disabled={!meta || filters.page === meta.totalPages}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, page: prev.page! + 1 }))
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
