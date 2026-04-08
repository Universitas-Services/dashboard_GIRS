'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaEye } from 'react-icons/fa';
import { toast } from 'sonner';
import { adminService } from '@/services/adminService';
import { User } from '@/types/user';
import { AxiosError } from 'axios'; // Import necesario para tipar el error

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Loader2, Trash2 } from 'lucide-react';

interface UserDetailSheetProps {
  userId: string;
}

export function UserDetailSheet({ userId }: UserDetailSheetProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (open && userId) {
      setLoading(true);
      adminService
        .getUserById(userId)
        .then((data) => setUser(data))
        .catch((err) => {
          console.error(err);
          toast.error('Error al cargar detalles del usuario');
        })
        .finally(() => setLoading(false));
    }
  }, [open, userId]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await adminService.deleteUser(userId);

      toast.success('Usuario eliminado correctamente');
      setOpen(false);
      window.location.reload();
    } catch (error: unknown) {
      // CORRECCIÓN 1: Usamos 'unknown' en lugar de 'any'
      console.error('Error eliminando usuario:', error);
      let msg = 'No se pudo eliminar el usuario.';

      // Tipado seguro del error
      if (error instanceof AxiosError && error.response?.data?.message) {
        const serverMsg = error.response.data.message;
        msg = Array.isArray(serverMsg) ? serverMsg[0] : serverMsg;
      }

      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // CORRECCIÓN 2: Ya no marca error porque agregamos 'profile' a la interfaz User
  const profile = user?.profile;

  // CORRECCIÓN 3: Construimos el nombre completo
  const nombreCompleto = user
    ? `${user.nombre} ${user.apellido || ''}`.trim()
    : '';

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" title="Ver detalles">
          <FaEye className="h-4 w-4 text-gray-500" />
        </Button>
      </SheetTrigger>

      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Detalles del Usuario</SheetTitle>
          <SheetDescription>
            Información completa y acciones para el usuario seleccionado.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : user ? (
            <>
              {/* Sección 1: Información Personal */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Información Personal
                </h3>
                <div className="grid gap-4">
                  <div className="space-y-1">
                    <Label>Nombre Completo</Label>
                    {/* CORRECCIÓN 3: Usamos la variable construida */}
                    <Input
                      value={nombreCompleto}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Email</Label>
                    <Input
                      value={user.email || ''}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Rol</Label>
                    <Input
                      value={user.role || ''}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Sección 2: Perfil Profesional */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Perfil Profesional
                </h3>
                <div className="grid gap-4">
                  <div className="space-y-1">
                    <Label>Institución</Label>
                    <Input
                      value={profile?.nombreEnte || 'N/A'}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Cargo</Label>
                    <Input
                      value={profile?.cargo || 'N/A'}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Sección 3: ZONA DE PELIGRO */}
              <div className="rounded-md border border-red-200 bg-red-50 p-4 dark:bg-red-900/10">
                <h3 className="mb-2 text-sm font-bold text-red-800 dark:text-red-400 flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Zona de Peligro
                </h3>
                <p className="mb-4 text-xs text-red-600/80 dark:text-red-400/80">
                  La eliminación de un usuario es una acción permanente y no se
                  puede deshacer.
                </p>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      Eliminar Usuario
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        ¿Está absolutamente seguro?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción eliminará permanentemente al usuario{' '}
                        <strong>{user.email}</strong> y todos sus datos
                        asociados. Esta acción no se puede deshacer.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isDeleting}>
                        Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={(e) => {
                          e.preventDefault();
                          handleDelete();
                        }}
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Eliminando...
                          </>
                        ) : (
                          'Sí, eliminar usuario'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No se encontró información del usuario.
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
