'use client';

import Link from 'next/link'; // <--- IMPORTANTE
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ShieldAlert, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { FaEye } from 'react-icons/fa'; // Icono del ojo

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { adminService } from '@/services/adminService';
import { User } from '@/types/user';

// NOTA: Ya no importamos UserDetailSheet porque no lo usaremos aquí.

// --- COMPONENTE INTERNO PARA LA CELDA DE ACCIONES ---
const ActionCell = ({ user }: { user: User }) => {
  return (
    <div className="flex items-center gap-1">
      {/* 1. Botón de Ver Detalles (Redirección a Nueva Página) */}
      <Link href={`/dashboard/usuarios/${user.id}`} passHref>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0 text-foreground hover:bg-muted"
          title="Ver detalles del usuario"
        >
          <FaEye className="h-4 w-4" />
          <span className="sr-only">Ver detalles</span>
        </Button>
      </Link>

      {/* 2. Dropdown Menu (Se mantiene igual) */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => {
              navigator.clipboard.writeText(user.id);
              toast.success('ID copiado al portapapeles');
            }}
          >
            Copiar ID de usuario
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            Ver actividad (Próximamente)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

// --- DEFINICIÓN DE COLUMNAS (Se mantiene igual, solo exportamos la corrección de ActionCell) ---
export const columns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todos"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Seleccionar fila"
      />
    ),
  },
  {
    accessorKey: 'email',
    header: 'Usuario',
    cell: ({ row }) => (
      <div>
        <div className="font-medium text-gray-900">
          {row.original.nombre} {row.original.apellido || ''}
        </div>
        <div className="text-sm text-gray-500">{row.getValue('email')}</div>
      </div>
    ),
  },
  {
    accessorKey: 'role',
    header: 'Rol',
    cell: ({ row }) => {
      const role = row.getValue('role') as string;
      const variant =
        role === 'ADMIN'
          ? 'destructive'
          : role === 'PAID_USER'
            ? 'default'
            : 'secondary';
      return <Badge variant={variant}>{role}</Badge>;
    },
  },
  {
    accessorKey: 'isActive',
    header: 'Estado',
    cell: ({ row }) => {
      const isActive = row.getValue('isActive') as boolean;
      return (
        <Badge
          variant={isActive ? 'outline' : 'destructive'}
          className={isActive ? 'text-green-600 border-green-600' : ''}
        >
          {isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Fecha Registro',
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'));
      return (
        <div className="text-sm text-gray-500">{date.toLocaleDateString()}</div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <ActionCell user={row.original} />,
  },
];
