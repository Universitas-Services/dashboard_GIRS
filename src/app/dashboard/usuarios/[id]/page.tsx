'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Trash2, ArrowLeft, Lock } from 'lucide-react';

import { adminService } from '@/services/adminService';
import { User } from '@/types/user';



// Componentes UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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

interface UserProfile {
  institucion?: string;
  cargo?: string;
}

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const userId = typeof params?.id === 'string' ? params.id : '';
  const currentTab = searchParams.get('tab') || 'perfil';

  // --- ESTADOS: USUARIO ---
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);


  // 1. Fetch Usuario (Carga Inicial)
  useEffect(() => {
    if (userId) {
      setLoadingUser(true);
      adminService
        .getUserById(userId)
        .then((data) => setUser(data))
        .catch((err) => {
          console.error(err);
          toast.error('Error al cargar usuario');
          router.push('/dashboard/usuarios');
        })
        .finally(() => setLoadingUser(false));
    }
  }, [userId, router]);


  const handleTabChange = (value: string) => {
    // Actualizamos URL para mantener el estado al recargar
    router.replace(`/dashboard/usuarios/${userId}?tab=${value}`);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await adminService.deleteUser(userId);
      toast.success('Usuario eliminado correctamente');
      router.push('/dashboard/usuarios');
    } catch (error) {
      console.error(error);
      toast.error('Error al eliminar usuario');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const profile = (user as User & { profile?: UserProfile })?.profile || {};

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Encabezado */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
          title="Regresar"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Detalles del Usuario
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Lock className="h-3 w-3" />
            <p>
              Modo visualización: {user.nombre} {user.apellido}
            </p>
          </div>
        </div>
      </div>

      <Separator />

      <Tabs
        value={currentTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="perfil">Perfil de usuario</TabsTrigger>

          <TabsTrigger
            value="eliminar"
            className="text-red-600 data-[state=active]:text-red-600"
          >
            Eliminar cuenta
          </TabsTrigger>
        </TabsList>

        {/* --- TAB: PERFIL --- */}
        <TabsContent value="perfil" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal e Institucional</CardTitle>
              <CardDescription>
                Los datos mostrados a continuación son inmutables.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">
                    Nombre Completo
                  </Label>
                  <Input
                    value={`${user.nombre} ${user.apellido || ''}`.trim()}
                    disabled
                    className="cursor-not-allowed bg-muted/50 font-medium text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">
                    Correo Electrónico
                  </Label>
                  <Input
                    value={user.email}
                    disabled
                    className="cursor-not-allowed bg-muted/50 font-medium text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Teléfono</Label>
                  <Input
                    value={user.telefono || 'No registrado'}
                    disabled
                    className="cursor-not-allowed bg-muted/50 font-medium text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">
                    Rol del Sistema
                  </Label>
                  <Input
                    value={user.role}
                    disabled
                    className="cursor-not-allowed bg-muted/50 font-medium text-foreground"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>


        {/* --- TAB: ELIMINAR --- */}
        <TabsContent value="eliminar" className="mt-6">
          <Card className="border-red-200">
            <CardHeader className="bg-red-50/50">
              <CardTitle className="text-red-600">Zona de Peligro</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-4">
                Esta acción es irreversible y eliminará permanentemente al
                usuario y sus datos asociados.
              </p>
              <div className="flex justify-end">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" /> Eliminar Cuenta
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        ¿Está absolutamente seguro?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Se eliminará el usuario <strong>{user.email}</strong>{' '}
                        permanentemente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 text-white"
                        disabled={isDeleting}
                      >
                        {isDeleting ? 'Eliminando...' : 'Sí, eliminar cuenta'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
