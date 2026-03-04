'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/adminService';
import { User } from '@/types/user';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import {
  Search,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Ban,
  UserCheck,
} from 'lucide-react';
import { RowSelectionState } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';

// Importamos los módulos nuevos
import { DataTable } from '@/components/data-table';
import { columns } from '@/components/columns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type PlanFilter = 'TODOS' | 'GRATIS' | 'PAGO';
export type StatusFilter = 'TODOS' | 'true' | 'false';

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoPlan, setTipoPlan] = useState<PlanFilter>('TODOS');
  const [isActive, setIsActive] = useState<StatusFilter>('TODOS');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Estados para acciones masivas
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [loadingBulk, setLoadingBulk] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await adminService.getAllUsers({
          page,
          limit,
          search: searchTerm || undefined,
          tipoPlan: tipoPlan !== 'TODOS' ? tipoPlan : undefined,
          isActive: isActive !== 'TODOS' ? isActive === 'true' : undefined,
        });
        setUsers(response.data);
        setTotalPages(
          response.meta?.totalPages ||
          (response.meta?.totalItems
            ? Math.ceil(response.meta.totalItems / limit)
            : response.data.length === limit
              ? page + 1
              : page)
        );
        setTotalUsers(response.meta?.totalItems || 0);
      } catch (error) {
        console.error(error);
        toast.error('Error al cargar usuarios');
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [page, limit, searchTerm, tipoPlan, isActive, refreshTrigger]);

  const selectedIds = Object.keys(rowSelection);
  const selectedCount = selectedIds.length;

  const handleBulkAction = async (
    actionType: 'SUSPENDER' | 'ACTIVAR'
  ) => {
    if (selectedCount === 0) return;

    setLoadingBulk(true);
    const toastId = toast.loading(`Procesando ${selectedCount} usuarios...`);

    try {
      const promises = selectedIds.map((id) => {
        if (actionType === 'SUSPENDER') {
          return adminService.deleteUser(id);
        } else if (actionType === 'ACTIVAR') {
          return adminService.toggleUserActive(id);
        }
      });

      const results = await Promise.allSettled(promises);
      const fulfilled = results.filter((r) => r.status === 'fulfilled').length;
      const rejected = results.filter((r) => r.status === 'rejected').length;

      toast.dismiss(toastId);

      if (rejected === 0) {
        toast.success(
          `Acción masiva completada: ${fulfilled} usuarios actualizados.`
        );
      } else {
        toast.warning(
          `Completado con errores: ${fulfilled} exitosos, ${rejected} fallidos.`
        );
      }

      setRowSelection({});
      setRefreshTrigger((prev) => prev + 1);
    } catch (_error) {
      console.error('Error processing bulk action:', _error);
      toast.dismiss(toastId);
      toast.error('Ocurrió un error inesperado al procesar acciones masivas.');
    } finally {
      setLoadingBulk(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Gestión de Usuarios
          </h2>
          <p className="text-muted-foreground">
            Administra los roles y accesos de los {totalUsers} usuarios
            registrados.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por correo..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <Select
          value={tipoPlan}
          onValueChange={(value: PlanFilter) => {
            setTipoPlan(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tipo de plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos los planes</SelectItem>
            <SelectItem value="GRATIS">Gratis</SelectItem>
            <SelectItem value="PAGO">Pago</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={isActive}
          onValueChange={(value: StatusFilter) => {
            setIsActive(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado de cuenta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos los estados</SelectItem>
            <SelectItem value="true">Activos</SelectItem>
            <SelectItem value="false">Inactivos/Suspendidos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Panel de Acciones Masivas */}
      {selectedCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border rounded-md bg-muted/50">
          <span className="text-sm font-medium">
            {selectedCount} usuario(s) seleccionado(s)
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-green-600 border-green-600 hover:bg-green-50"
              onClick={() => handleBulkAction('ACTIVAR')}
              disabled={loadingBulk}
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Activar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleBulkAction('SUSPENDER')}
              disabled={loadingBulk}
            >
              <Ban className="mr-2 h-4 w-4" />
              Suspender
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex h-24 items-center justify-center rounded-md border bg-card">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <span>Cargando datos...</span>
        </div>
      ) : (
        /* AQUI USAMOS EL COMPONENTE MODULARIZADO */
        <div className="rounded-md border bg-card shadow-sm overflow-hidden">
          <DataTable
            columns={columns}
            data={users}
            pageSize={limit}
            onPageSizeChange={(newSize) => {
              setLimit(newSize);
              setPage(1);
            }}
            pageCount={totalPages}
            currentPage={page}
            onPageChange={setPage}
            isLoading={loading}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
          />
        </div>
      )}
    </div>
  );
}
