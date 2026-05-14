'use client';

import {
  ArrowLeft,
  Mail,
  Building,
  Phone,
  Fingerprint,
  Clock,
  Send,
  Shield,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { NotificationBell } from '@/components/dashboard/NotificationBell';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { adminService } from '@/services/adminService';
import { AbandonedRegistration } from '@/types/user';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AbandonedRegistrationDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [user, setUser] = useState<AbandonedRegistration | null>(null);
  const [loading, setLoading] = useState(true);

  // --- CRM NOTES STATE ---
  const [nuevoMensaje, setNuevoMensaje] = useState<string>('');
  const [isCrmLoading, setIsCrmLoading] = useState<boolean>(false);

  const fetchUser = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const userData = await adminService.getAbandonedRegistrationById(id);
      setUser(userData);
    } catch (error) {
      console.error('Error fetching abandoned user:', error);
      toast.error('No se pudo cargar el registro abandonado.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUser();
  }, [fetchUser]);

  // --- CRM HANDLERS ---
  const handleAddNote = async () => {
    if (!nuevoMensaje.trim() || !id) return;
    setIsCrmLoading(true);
    try {
      await adminService.addAbandonedRegistrationNote(id, {
        content: nuevoMensaje.trim(),
      });
      toast.success('Nota agregada exitosamente');
      setNuevoMensaje('');
      fetchUser(); // refrescar para ver la nueva nota
    } catch (error) {
      console.error(error);
      toast.error('Error al agregar la nota');
    } finally {
      setIsCrmLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-emerald-500"></div>
        <p className="text-slate-500 font-medium animate-pulse">
          Cargando detalles del registro...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-slate-500 font-medium">
          No se encontró el registro abandonado.
        </p>
        <Button onClick={() => router.back()}>Volver atrás</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full pt-2">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8 text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1
            className="text-2xl font-extrabold whitespace-nowrap"
            style={{ color: 'var(--admin-text-title)' }}
          >
            Detalle de Registro Abandonado
          </h1>
        </div>

        <div className="flex items-center gap-4 justify-end min-w-[140px]">
          <NotificationBell />
          <Avatar className="h-10 w-10 border-2 border-emerald-500 cursor-pointer">
            <AvatarImage src="https://api.dicebear.com/7.x/notionists/svg?seed=Admin" />
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

      <div className="flex flex-col gap-8 mt-2">
        {/* User Profile Header */}
        <div className="w-full bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative shrink-0">
            <Avatar className="h-24 w-24 rounded-3xl bg-slate-900 shadow-md">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.nombre}`}
                alt={user.nombre}
                className="p-2"
              />
              <AvatarFallback className="text-2xl font-black text-white bg-slate-800">
                {user.nombre[0]}
                {user.apellido?.[0] || ''}
              </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white bg-red-500 shadow-sm"></div>
          </div>
          <div className="flex flex-col gap-2 items-center sm:items-start text-center sm:text-left mt-2 sm:mt-0">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {user.nombre} {user.apellido || ''}
              </h2>
              <Badge className="px-3 py-1 text-[10px] font-extrabold rounded-md shadow-none cursor-default uppercase bg-red-100 text-red-700">
                NO CONCRETADO
              </Badge>
            </div>
            <div className="flex items-center text-slate-500 text-sm font-medium">
              <Mail className="h-4 w-4 mr-2 opacity-70" />
              {user.email}
            </div>
          </div>
        </div>

        {/* Content Grids */}
        <div className="grid lg:grid-cols-2 gap-6 pb-12">
          {/* Left Column: Información General */}
          <div
            className="rounded-3xl p-8 flex flex-col gap-8 shadow-sm"
            style={{ backgroundColor: 'var(--admin-panel-bg)' }}
          >
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-8 bg-green-700 rounded-full"></div>
              <h3 className="text-xl font-bold text-slate-900">
                Información General
              </h3>
            </div>

            <div className="bg-white rounded-3xl p-2 sm:p-4 shadow-sm border border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* ID del Sistema */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Fingerprint className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <label className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase mb-0.5">
                      ID de Registro
                    </label>
                    <p className="font-bold text-slate-800 text-xs leading-snug opacity-80 truncate">
                      {user.id}
                    </p>
                  </div>
                </div>

                {/* Teléfono */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase mb-0.5">
                      Teléfono
                    </label>
                    <p className="font-bold text-slate-800 text-sm leading-snug">
                      {user.telefono || 'No registrado'}
                    </p>
                  </div>
                </div>

                {/* Perfil Seleccionado */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                    {user.tipoUsuario === 'SERVIDOR_PUBLICO' ? (
                      <Building className="h-5 w-5" />
                    ) : (
                      <Shield className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase mb-0.5">
                      Perfil Seleccionado
                    </label>
                    <p className="font-bold text-slate-800 text-sm leading-snug">
                      {user.tipoUsuario === 'SERVIDOR_PUBLICO'
                        ? 'Servidor Público'
                        : user.tipoUsuario === 'ASESOR_PRIVADO'
                          ? 'Asesor Privado'
                          : 'No seleccionado'}
                    </p>
                  </div>
                </div>

                {/* Fecha Registro */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase mb-0.5">
                      Inició Registro
                    </label>
                    <p className="font-bold text-slate-800 text-sm leading-snug">
                      {format(
                        new Date(user.registeredAt),
                        'dd MMM yyyy HH:mm',
                        { locale: es }
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Gestión Operativa (CRM) */}
          <div className="rounded-3xl p-8 flex flex-col gap-6 shadow-sm border border-gray-100 bg-white">
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-8 bg-orange-500 rounded-full"></div>
              <h3 className="text-xl font-bold text-slate-900">Seguimiento</h3>
            </div>

            <div className="flex flex-col gap-4 h-full">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-extrabold tracking-wider text-slate-500 uppercase">
                  Notas de Seguimiento
                </label>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                  {user.notes?.length || 0} notas
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <div className="relative">
                  <textarea
                    value={nuevoMensaje}
                    onChange={(e) => setNuevoMensaje(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (nuevoMensaje.trim() && !isCrmLoading) {
                          handleAddNote();
                        }
                      }
                    }}
                    placeholder="Escribe el resultado del contacto o el motivo del abandono..."
                    className="w-full h-24 p-4 text-sm bg-slate-50 border border-slate-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all shadow-inner"
                  />
                  <Button
                    size="icon"
                    disabled={isCrmLoading || !nuevoMensaje.trim()}
                    onClick={handleAddNote}
                    className="absolute bottom-3 right-3 h-8 w-8 rounded-xl bg-orange-500 hover:bg-orange-600 shadow-md text-white disabled:opacity-50"
                  >
                    {isCrmLoading ? (
                      <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Timeline de notas */}
              <div className="flex flex-col mt-4 bg-slate-50/50 rounded-2xl border border-slate-100 p-2 overflow-hidden flex-1 h-[300px] overflow-y-auto custom-scrollbar">
                {!user.notes || user.notes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-center px-4">
                    <p className="text-sm font-bold text-slate-400">
                      Sin seguimiento previo
                    </p>
                    <p className="text-xs text-slate-400/80 mt-1">
                      No hay registro de contacto para este usuario. Añade una
                      nota para comenzar el seguimiento.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 p-2">
                    {user.notes.map((note) => (
                      <div
                        key={note.id}
                        className="group relative bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all hover:-translate-y-0.5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 mt-0.5">
                              <span className="text-[10px] font-black text-slate-500">
                                {note.adminNombre.substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-900">
                                  {note.adminNombre}
                                </span>
                                <span className="text-[10px] font-medium text-slate-400">
                                  •{' '}
                                  {format(
                                    new Date(note.createdAt),
                                    'dd MMM yyyy, HH:mm',
                                    { locale: es }
                                  )}
                                </span>
                              </div>
                              <p className="text-sm text-slate-700 mt-1.5 leading-relaxed whitespace-pre-wrap">
                                {note.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
