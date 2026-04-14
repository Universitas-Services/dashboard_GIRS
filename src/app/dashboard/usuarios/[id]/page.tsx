'use client';

import { 
  ArrowLeft, Shield, Mail, Building, 
  CheckCircle2, Send, Clock, ShieldCheck, Hourglass, Ban,
  Trash2, Edit2, Check, X, ChevronLeft, ChevronRight,
  User as UserIcon, Phone, MapPin, Landmark, Briefcase, Fingerprint, Plus, Minus
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { NotificationBell } from '@/components/dashboard/NotificationBell';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { adminService } from '@/services/adminService';
import { User, CRMNotesResponse, CRMNote } from '@/types/user';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function UserDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const statusConfig: Record<string, { label: string, color: string, bgColor: string }> = {
    'POR_ACTIVAR': { label: 'Por Activar', color: '#b45309', bgColor: '#fef3c7' },
    'PRUEBA_GRATUITA': { label: 'Prueba Gratis', color: '#1d4ed8', bgColor: '#dbeafe' },
    'ACTIVO': { label: 'Activo', color: '#15803d', bgColor: '#dcfce7' },
    'SUSPENDIDO': { label: 'Suspendido', color: '#be123c', bgColor: '#ffe4e6' },
    'POR_PAGAR': { label: 'Por Pagar', color: '#ea580c', bgColor: '#ffedd5' },
    'POR_RENOVAR': { label: 'Por Renovar', color: '#701a75', bgColor: '#fdf4ff' },
    'SUSCRITO': { label: 'Suscrito', color: '#3730a3', bgColor: '#e0e7ff' }
  };

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // --- CRM NOTES STATE ---
  const [crmData, setCrmData] = useState<CRMNotesResponse | null>(null);
  const [isCrmLoading, setIsCrmLoading] = useState<boolean>(false);
  const [isFetchingNotes, setIsFetchingNotes] = useState<boolean>(true);
  const [nuevoMensaje, setNuevoMensaje] = useState<string>("");
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState<string>("");
  
  const [editandoNotaId, setEditandoNotaId] = useState<string | null>(null);
  const [editMensaje, setEditMensaje] = useState("");
  const [editEtiqueta, setEditEtiqueta] = useState<string>("");
  
  // Paginación CRM
  const [crmPage, setCrmPage] = useState(1);
  const crmLimit = 5;
  
  // Popover de Eliminar Nota
  const [popoverId, setPopoverId] = useState<string | null>(null);

  // Popover de Convertir a Privado
  const [popoverConvertirOpen, setPopoverConvertirOpen] = useState(false);
  const [popoverPublicoOpen, setPopoverPublicoOpen] = useState(false);
  const [popoverActiveOpen, setPopoverActiveOpen] = useState(false);
  const [pendingActiveState, setPendingActiveState] = useState<boolean | null>(null);
  const [isUpdatingDays, setIsUpdatingDays] = useState(false);
  const [popoverAddDaysOpen, setPopoverAddDaysOpen] = useState(false);
  const [popoverSubtractDaysOpen, setPopoverSubtractDaysOpen] = useState(false);

  const fetchUser = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const userData = await adminService.getUserById(id);
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchNotes = useCallback(async () => {
    if (!id) return;
    setIsFetchingNotes(true);
    try {
      const data = await adminService.getCrmNotes(id, crmPage, crmLimit);
      setCrmData(data);
    } catch (error: unknown) {
      console.error('Error fetching CRM notes:', error);
      // Fallback a array vacío para evitar "Cargando" infinito por error 404 o Adblockers
      const fetchError = error as { response?: { status?: number } };
      setCrmData({ data: [], meta: { totalItems: 0, itemCount: 0, itemsPerPage: crmLimit, totalPages: 1, currentPage: 1 }, usuario: { id: id as string, nombre: '', apellido: null, email: '', tipoUsuario: '' } });
      if (fetchError?.response?.status !== 404) {
         toast.error("Error cargando notas. O desactiva tu Adblocker temporalmente si falla.");
      }
    } finally {
      setIsFetchingNotes(false);
    }
  }, [id, crmPage, crmLimit]);

  useEffect(() => {
    fetchUser();
    fetchNotes();
  }, [fetchUser, fetchNotes]);

  // --- CRM HANDLERS ---
  const handleAddNote = async () => {
    if (!nuevoMensaje.trim() || !id) return;
    setIsCrmLoading(true);
    try {
      await adminService.createCrmNote(id, {
        content: nuevoMensaje.trim(),
        etiqueta: nuevaEtiqueta || null
      });
      toast.success("Nota agregada al CRM");
      setNuevoMensaje("");
      setNuevaEtiqueta("");
      setCrmPage(1); // Volver a la pagina 1 para ver la nota nueva
      fetchNotes(); // refrescar
    } catch (error) {
      console.error(error);
      toast.error("Error al agregar la nota");
    } finally {
      setIsCrmLoading(false);
    }
  };

  const ejecutarEliminar = async (noteIdToDel: string) => {
    try {
      await adminService.deleteCrmNote(noteIdToDel);
      toast.success("Nota eliminada");
      fetchNotes();
      setPopoverId(null);
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar la nota");
    }
  };

  const startEditing = (note: CRMNote) => {
    setEditandoNotaId(note.id);
    setEditMensaje(note.content);
    setEditEtiqueta(note.etiqueta || "");
  };

  const cancelEditing = () => {
    setEditandoNotaId(null);
    setEditMensaje("");
    setEditEtiqueta("");
  };

  const saveEdit = async () => {
    if (!editandoNotaId) return;
    try {
      await adminService.updateCrmNote(editandoNotaId, {
        content: editMensaje.trim(),
        etiqueta: editEtiqueta || null
      });
      toast.success("Nota actualizada");
      setEditandoNotaId(null);
      fetchNotes();
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar la nota");
    }
  };

  const getEtiqOptions = () => {
    if (user?.tipoUsuario === 'SERVIDOR_PUBLICO') {
      return [
        { value: 'POR_CONTACTAR', label: 'Por contactar', bg: 'var(--crm-label-por-contactar-bg)', text: 'var(--crm-label-por-contactar-text)' },
        { value: 'POR_ENVIAR_DOC', label: 'Por enviar', bg: 'var(--crm-label-por-enviar-doc-bg)', text: 'var(--crm-label-por-enviar-doc-text)' },
        { value: 'ENVIO_DOC', label: 'Envio doc', bg: 'var(--crm-label-envio-doc-bg)', text: 'var(--crm-label-envio-doc-text)' },
        { value: 'NO_TIENE_DOC', label: 'No tiene', bg: 'var(--crm-label-no-tiene-doc-bg)', text: 'var(--crm-label-no-tiene-doc-text)' },
        { value: 'NO_ENVIO_DOC_PLANIFICAR', label: 'No envio', bg: 'var(--crm-label-no-envio-doc-planificar-bg)', text: 'var(--crm-label-no-envio-doc-planificar-text)' },
      ];
    }
    return [
      { value: 'POR_CONTACTAR', label: 'Por contactar', bg: 'var(--crm-label-por-contactar-bg)', text: 'var(--crm-label-por-contactar-text)' },
      { value: 'CONTACTADO', label: 'Contactado', bg: 'var(--crm-label-contactado-bg)', text: 'var(--crm-label-contactado-text)' },
      { value: 'PAGO_REALIZADO', label: 'Pagó', bg: 'var(--crm-label-pago-realizado-bg)', text: 'var(--crm-label-pago-realizado-text)' },
    ];
  };

  const getEtiqConfig = (value: string | null) => {
    return getEtiqOptions().find(opt => opt.value === value);
  };

  const handleStatusToggle = async (checked: boolean) => {
    if (!user || !id) return;
    
    setIsUpdating(true);
    
    // Determinamos el nuevo estado según tipo de usuario y el valor del switch
    let nuevoEstado = '';
    if (user.tipoUsuario === 'SERVIDOR_PUBLICO') {
        nuevoEstado = checked ? 'ACTIVO' : 'SUSPENDIDO';
    } else {
        nuevoEstado = checked ? 'SUSCRITO' : 'POR_PAGAR';
    }

    try {
        await adminService.updateAccountStatus(id, { estadoCuenta: nuevoEstado });
        toast.success(`Estado actualizado a ${nuevoEstado.replace('_', ' ')}`);
        // Actualizamos el estado local
        setUser(prev => prev ? { ...prev, estadoCuenta: nuevoEstado } : null);
    } catch (error) {
        console.error('Error updating status:', error);
        toast.error('No se pudo actualizar el estado de cuenta');
    } finally {
        setIsUpdating(false);
    }
  };

  const handleConvertToPrivateTrial = async () => {
    if (!user || !id || user.tipoUsuario !== 'SERVIDOR_PUBLICO') return;
    
    setIsUpdating(true);
    setPopoverConvertirOpen(false);
    try {
        const result = await adminService.convertToPrivateTrial(id);
        toast.success(result.message || "Usuario convertido a Asesor Privado exitosamente.");
        fetchUser(); // Refrescar los datos para obtener el nuevo tipo de usuario y estado
    } catch (error) {
        console.error('Error converting user:', error);
        toast.error('No se pudo convertir al usuario. Verifica que sea Servidor Público válido.');
    } finally {
        setIsUpdating(false);
    }
  };

  const handleConvertToPublic = async () => {
    if (!user || !id || user.tipoUsuario !== 'ASESOR_PRIVADO') return;
    
    setIsUpdating(true);
    setPopoverPublicoOpen(false);
    try {
        const result = await adminService.convertToPublic(id);
        toast.success(result.message || "Usuario convertido a Servidor Público exitosamente.");
        fetchUser(); // Refrescar los datos
    } catch (error) {
        console.error('Error converting user:', error);
        toast.error('No se pudo convertir al usuario. Verifica que sea Asesor Privado válido.');
    } finally {
        setIsUpdating(false);
    }
  };

  const handleToggleActive = async () => {
    if (!id || pendingActiveState === null) return;
    setIsUpdating(true);
    setPopoverActiveOpen(false);
    try {
      await adminService.toggleUserActive(id as string);
      toast.success(pendingActiveState ? "Usuario activado exitosamente." : "Usuario desactivado exitosamente.");
      setUser(prev => prev ? { ...prev, isActive: pendingActiveState } : prev);
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar el estado del usuario.");
    } finally {
      setIsUpdating(false);
      setPendingActiveState(null);
    }
  };

  const handleAddDays = async () => {
    if (!id || isUpdatingDays) return;
    setIsUpdatingDays(true);
    setPopoverAddDaysOpen(false);
    try {
      const response = await adminService.addSubscriptionDays(id as string);
      toast.success(response.message || "Suscripción extendida por 30 días.");
      setUser(prev => prev ? { ...prev, diasRestantes: response.diasRestantes, estadoCuenta: response.user?.estadoCuenta || prev.estadoCuenta } : prev);
    } catch (error) {
      console.error(error);
      toast.error("Error al añadir días.");
    } finally {
      setIsUpdatingDays(false);
    }
  };

  const handleSubtractDays = async () => {
    if (!id || isUpdatingDays) return;
    setIsUpdatingDays(true);
    setPopoverSubtractDaysOpen(false);
    try {
      const response = await adminService.subtractSubscriptionDays(id as string);
      toast.success(response.message || "Suscripción reducida por 30 días.");
      setUser(prev => prev ? { ...prev, diasRestantes: response.diasRestantes, estadoCuenta: response.user?.estadoCuenta || prev.estadoCuenta } : prev);
    } catch (error) {
      console.error(error);
      toast.error("Error al quitar días.");
    } finally {
      setIsUpdatingDays(false);
    }
  };

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-emerald-500"></div>
            <p className="text-slate-500 font-medium animate-pulse">Cargando detalles del usuario...</p>
        </div>
    );
  }

  if (!user) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <p className="text-slate-500 font-medium">No se encontró el usuario.</p>
            <Button onClick={() => router.back()}>Volver atrás</Button>
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full pt-2">
      {/* Top Header unificado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 text-slate-500 hover:text-slate-800">
                  <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-extrabold whitespace-nowrap" style={{ color: 'var(--admin-text-title)' }}>
                  Detalle de Usuario
              </h1>
          </div>
          
          <div className="flex-1 flex justify-center w-full max-w-md mx-auto">
              {/* Buscador removido de la vista de detalle */}
          </div>

          <div className="flex items-center gap-4 justify-end min-w-[140px]">
              <NotificationBell />
              <Avatar className="h-10 w-10 border-2 border-emerald-500 cursor-pointer">
                  <AvatarImage src="https://api.dicebear.com/7.x/notionists/svg?seed=Admin" />
                  <AvatarFallback style={{ color: 'var(--admin-avatar-text)', backgroundColor: 'var(--admin-avatar-bg)' }}>AD</AvatarFallback>
              </Avatar>
          </div>
      </div>

      <div className="flex flex-col gap-8 mt-2">
        {/* User Profile Header */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full">
            {/* Info de Perfil */}
            <div className="lg:col-span-3 bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="relative shrink-0">
                    <Avatar className="h-24 w-24 rounded-3xl bg-slate-900 shadow-md">
                        <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.nombre}`} alt={user.nombre} className="p-2" />
                        <AvatarFallback className="text-2xl font-black text-white bg-slate-800">
                            {user.nombre[0]}{user.apellido?.[0] || ''}
                        </AvatarFallback>
                    </Avatar>
                    {(user.estadoCuenta === 'ACTIVO' || user.estadoCuenta === 'SUSCRITO') && <div className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white bg-green-500 shadow-sm"></div>}
                </div>
                <div className="flex flex-col gap-2 items-center sm:items-start text-center sm:text-left mt-2 sm:mt-0">
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{user.nombre} {user.apellido || ''}</h2>
                        <Badge 
                            className="px-3 py-1 text-[10px] font-extrabold rounded-md shadow-none cursor-default uppercase"
                            style={{ 
                                backgroundColor: statusConfig[user.estadoCuenta]?.bgColor || '#f1f5f9', 
                                color: statusConfig[user.estadoCuenta]?.color || '#64748b' 
                            }}
                        >
                            {statusConfig[user.estadoCuenta]?.label || user.estadoCuenta}
                        </Badge>
                    </div>
                    <div className="flex items-center text-slate-500 text-sm font-medium">
                        <Mail className="h-4 w-4 mr-2 opacity-70" />
                        {user.email}
                    </div>
                </div>
            </div>

            {/* Gestión de Acceso */}
            <div className="lg:col-span-1 bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-slate-100 flex flex-col justify-center gap-6 relative overflow-hidden">
                <div className="absolute -top-6 -right-6 p-8 opacity-[0.03] pointer-events-none">
                    <ShieldCheck className="w-40 h-40 text-emerald-900" />
                </div>
                
                <div className="flex items-center gap-3 relative z-10">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100/50">
                        <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    </div>
                    <span className="text-lg font-bold text-slate-900 tracking-tight leading-tight">Gestión de Acceso</span>
                </div>

                <div className="flex flex-col gap-3 relative z-10 w-full">
                    {/* Toggle Normativa/Pago */}
                    <div className="flex items-center justify-between bg-emerald-50 hover:bg-emerald-100/60 transition-colors py-2.5 px-4 rounded-xl border border-emerald-100">
                        <div className="flex flex-col gap-0.5 mr-4">
                            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest leading-none">
                                {user.tipoUsuario === 'SERVIDOR_PUBLICO' ? 'ENVIÓ' : 'REGISTRAR'}
                            </span>
                            <span className="text-xs font-black text-emerald-950 leading-none mt-1">
                                {user.tipoUsuario === 'SERVIDOR_PUBLICO' ? 'Normativa' : 'Pago $20'}
                            </span>
                        </div>
                        <Switch 
                            disabled={isUpdating}
                            checked={user.tipoUsuario === 'SERVIDOR_PUBLICO' ? user.estadoCuenta === 'ACTIVO' : user.estadoCuenta === 'SUSCRITO'}
                            onCheckedChange={handleStatusToggle}
                            className="data-[state=checked]:bg-emerald-500 shrink-0 scale-75 origin-right"
                        />
                    </div>

                    {/* Toggle Activo/Inactivo universal */}
                    <div className={`flex items-center justify-between ${user.isActive ? 'bg-indigo-50 hover:bg-indigo-100/60 border-indigo-100' : 'bg-slate-50 hover:bg-slate-100/60 border-slate-100'} transition-colors py-2.5 px-4 rounded-xl border`}>
                        <div className="flex flex-col gap-0.5 mr-4">
                            <span className={`text-[9px] font-bold uppercase tracking-widest leading-none ${user.isActive ? 'text-indigo-600' : 'text-slate-500'}`}>
                                ESTADO
                            </span>
                            <span className={`text-xs font-black leading-none mt-1 ${user.isActive ? 'text-indigo-950' : 'text-slate-700'}`}>
                                {user.isActive ? 'Cuenta Activa' : 'Cuenta Inactiva'}
                            </span>
                        </div>
                        <Popover open={popoverActiveOpen} onOpenChange={(open) => { setPopoverActiveOpen(open); if(!open) setPendingActiveState(null); }}>
                            <PopoverTrigger asChild>
                                <button disabled={isUpdating} onClick={() => setPendingActiveState(!user.isActive)} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${user.isActive ? 'bg-indigo-500' : 'bg-slate-200'} scale-75 origin-right`}>
                                    <span className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${user.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-72 p-4 rounded-xl shadow-xl border-slate-100" align="end" sideOffset={5}>
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-start gap-3">
                                        <div className={`h-8 w-8 rounded-full ${pendingActiveState ? 'bg-indigo-100' : 'bg-slate-100'} flex items-center justify-center shrink-0`}>
                                            <ShieldCheck className={`h-4 w-4 ${pendingActiveState ? 'text-indigo-600' : 'text-slate-600'}`} />
                                        </div>
                                        <div className="flex flex-col">
                                            <h4 className="font-bold text-slate-900 text-sm">{pendingActiveState ? 'Activar Cuenta' : 'Desactivar Cuenta'}</h4>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                {pendingActiveState ? 'El usuario recuperará el acceso al sistema inmediatamente.' : 'El usuario perderá el acceso al sistema hasta que se reactive.'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 mt-2">
                                        <Button size="sm" variant="outline" className="h-7 text-xs px-4 shadow-none text-slate-600 font-bold" onClick={() => { setPopoverActiveOpen(false); setPendingActiveState(null); }}>
                                            Cancelar
                                        </Button>
                                        <Button size="sm" className={`h-7 text-xs px-4 shadow-none text-white font-bold ${pendingActiveState ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-800 hover:bg-slate-900'}`} onClick={handleToggleActive}>
                                            Confirmar
                                        </Button>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                
                {isUpdating && (
                    <p className="text-[10px] text-center font-bold text-emerald-600 animate-pulse uppercase tracking-widest relative z-10">
                        Actualizando...
                    </p>
                )}
            </div>
        </div>

        {/* Content Grids */}
        <div className="grid lg:grid-cols-2 gap-6 pb-12">
            
            {/* Left Column: Información General */}
            <div className="rounded-3xl p-8 flex flex-col gap-8 shadow-sm" style={{ backgroundColor: 'var(--admin-panel-bg)' }}>
                <div className="flex items-center gap-3">
                    <div className="h-1.5 w-8 bg-green-700 rounded-full"></div>
                    <h3 className="text-xl font-bold text-slate-900">Información General</h3>
                </div>

                <div className="bg-white rounded-3xl p-2 sm:p-4 shadow-sm border border-slate-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        
                        {/* Nombre Completo */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                            <div className="h-10 w-10 shrink-0 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                                <UserIcon className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase mb-0.5">Nombre Completo</label>
                                <p className="font-bold text-slate-800 text-sm leading-snug">{user.nombre} {user.apellido || ''}</p>
                            </div>
                        </div>

                        {/* ID del Sistema */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                            <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <Fingerprint className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase mb-0.5">ID del Sistema</label>
                                <p className="font-bold text-slate-800 text-xs leading-snug opacity-80 break-all">{user.id}</p>
                            </div>
                        </div>

                        {/* Teléfono */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                            <div className="h-10 w-10 shrink-0 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                                <Phone className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase mb-0.5">Teléfono</label>
                                <p className="font-bold text-slate-800 text-sm leading-snug">{user.telefono || 'No registrado'}</p>
                            </div>
                        </div>

                        {/* Ubicación */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                            <div className="h-10 w-10 shrink-0 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <MapPin className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase mb-0.5">Ubicación</label>
                                <p className="font-bold text-slate-800 text-sm leading-snug">
                                    {user.estado ? `${user.estado}, ` : '---'}
                                    <span className="text-slate-500 font-medium">{user.municipio || '---'}</span>
                                </p>
                            </div>
                        </div>

                        {/* Institución */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                            <div className="h-10 w-10 shrink-0 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                <Landmark className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase mb-0.5">Institución</label>
                                <p className="font-bold text-slate-800 text-sm leading-snug">{user.profile?.nombreEnte || '---'}</p>
                            </div>
                        </div>

                        {/* Cargo */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                            <div className="h-10 w-10 shrink-0 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <Briefcase className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase mb-0.5">Cargo</label>
                                <p className="font-bold text-slate-800 text-sm leading-snug">{user.profile?.cargo || '---'}</p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Agrupando tarjetas inferiores */}
                <div className="flex flex-col gap-4 mt-2">
                {user.tipoUsuario === 'SERVIDOR_PUBLICO' && (() => {
                    const statusMap: Record<string, { label: string, icon: React.ElementType, color: string, bgColor: string }> = {
                        'VIGENTE': { 
                            label: 'Vigente', 
                            icon: CheckCircle2, 
                            color: 'text-green-600', 
                            bgColor: 'bg-green-100' 
                        },
                        'EN_MORA': { 
                            label: 'En mora', 
                            icon: Ban, 
                            color: 'text-red-600', 
                            bgColor: 'bg-red-100' 
                        },
                        'EN_REVISION_TECNICA': { 
                            label: 'En revisión técnica', 
                            icon: Clock, 
                            color: 'text-orange-600', 
                            bgColor: 'bg-orange-100' 
                        }
                    };

                    const currentStatus = user.profile?.estatusNormativaGirs || 'Pies de proceso';
                    const config = statusMap[currentStatus] || { 
                        label: currentStatus, 
                        icon: Clock, 
                        color: 'text-slate-600', 
                        bgColor: 'bg-slate-100' 
                    };
                    const StatusIcon = config.icon;

                    return (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <div className="h-1.5 w-8 bg-teal-500 rounded-full"></div>
                                <h3 className="text-xl font-bold text-slate-900">Estatus Normativo GIRS</h3>
                            </div>
                            <div className="bg-white rounded-3xl p-5 flex items-center gap-4 shadow-sm border border-slate-100">
                                <div className={`h-12 w-12 shrink-0 flex items-center justify-center rounded-2xl ${config.bgColor} ${config.color}`}>
                                    <StatusIcon className={`h-6 w-6 ${currentStatus === 'VIGENTE' ? 'fill-green-500 text-white' : ''}`} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-900">{config.label}</span>
                                    <span className="text-xs text-slate-500 font-medium mt-0.5">Última actualización: {format(new Date(user.updatedAt), 'dd MMM yyyy', { locale: es })}</span>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                <div className="flex gap-2 p-1.5 bg-white shadow-sm rounded-2xl border border-slate-100 mt-2">
                    {user.tipoUsuario === 'ASESOR_PRIVADO' && !isUpdating ? (
                        <Popover open={popoverPublicoOpen} onOpenChange={setPopoverPublicoOpen}>
                            <PopoverTrigger asChild>
                                <button className="flex-1 flex items-center justify-center p-3 rounded-xl transition-all bg-transparent text-slate-400 font-medium hover:bg-slate-50 cursor-pointer">
                                    <Building className="h-4 w-4 mr-2 text-slate-400" />
                                    Servidor Público
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-4 rounded-xl shadow-xl border-slate-100" align="start" sideOffset={5}>
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-start gap-3">
                                        <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                                            <Building className="h-4 w-4 text-orange-600" />
                                        </div>
                                        <div className="flex flex-col">
                                            <h4 className="font-bold text-slate-900 text-sm">Convertir a Servidor Público</h4>
                                            <p className="text-xs text-slate-500 mt-0.5">La cuenta volverá a estar activa indefinidamente. Esta acción transformará inmediatamente el rol de la cuenta.</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 mt-2">
                                        <Button size="sm" variant="outline" className="h-7 text-xs px-4 shadow-none text-slate-600 font-bold" onClick={() => setPopoverPublicoOpen(false)}>
                                            Cancelar
                                        </Button>
                                        <Button size="sm" className="h-7 text-xs px-4 shadow-none bg-orange-600 hover:bg-orange-700 text-white font-bold" onClick={handleConvertToPublic}>
                                            Convertir
                                        </Button>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    ) : (
                        <div className={`flex-1 flex items-center justify-center p-3 rounded-xl transition-all cursor-default ${user.tipoUsuario === 'SERVIDOR_PUBLICO' ? 'bg-orange-100 text-orange-700 shadow-sm font-extrabold border border-orange-200' : 'bg-transparent text-slate-400 font-medium opacity-50 cursor-wait'}`}>
                            <Building className={`h-4 w-4 mr-2 ${user.tipoUsuario === 'SERVIDOR_PUBLICO' ? 'text-orange-700' : 'text-slate-400'}`} />
                            Servidor Público
                        </div>
                    )}
                    
                    {user.tipoUsuario === 'SERVIDOR_PUBLICO' && !isUpdating ? (
                        <Popover open={popoverConvertirOpen} onOpenChange={setPopoverConvertirOpen}>
                            <PopoverTrigger asChild>
                                <button className="flex-1 flex items-center justify-center p-3 rounded-xl transition-all bg-transparent text-slate-400 font-medium hover:bg-slate-50 cursor-pointer">
                                    <Shield className="h-4 w-4 mr-2 text-slate-400" />
                                    Asesor Privado
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-4 rounded-xl shadow-xl border-slate-100" align="end" sideOffset={5}>
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-start gap-3">
                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                            <Shield className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div className="flex flex-col">
                                            <h4 className="font-bold text-slate-900 text-sm">Convertir a Asesor Privado</h4>
                                            <p className="text-xs text-slate-500 mt-0.5">Se asignarán 7 días de prueba gratis. Esta acción transformará inmediatamente el rol de la cuenta.</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 mt-2">
                                        <Button size="sm" variant="outline" className="h-7 text-xs px-4 shadow-none text-slate-600 font-bold" onClick={() => setPopoverConvertirOpen(false)}>
                                            Cancelar
                                        </Button>
                                        <Button size="sm" className="h-7 text-xs px-4 shadow-none bg-blue-600 hover:bg-blue-700 text-white font-bold" onClick={handleConvertToPrivateTrial}>
                                            Convertir
                                        </Button>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    ) : (
                        <div className={`flex-1 flex items-center justify-center p-3 rounded-xl transition-all ${user.tipoUsuario === 'ASESOR_PRIVADO' ? 'bg-blue-100 text-blue-700 shadow-sm font-extrabold border border-blue-200 cursor-default' : 'bg-transparent text-slate-400 font-medium opacity-50 cursor-wait'}`}>
                            <Shield className={`h-4 w-4 mr-2 ${user.tipoUsuario === 'ASESOR_PRIVADO' ? 'text-blue-700' : 'text-slate-400'}`} />
                            Asesor Privado
                        </div>
                    )}
                </div>

                <div className="rounded-3xl p-6 flex flex-col gap-4 overflow-hidden relative shadow-sm border border-purple-100 mt-2 bg-purple-50">
                    <div className="flex items-start justify-between z-10 w-full">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-extrabold tracking-wider text-purple-600/80 uppercase">Días de Acceso Restantes</span>
                            <span className={`text-6xl font-black mt-1 ${user.tipoUsuario === 'SERVIDOR_PUBLICO' ? 'text-purple-700' : user.isExpired ? 'text-red-500' : 'text-slate-900'}`}>
                                {user.tipoUsuario === 'SERVIDOR_PUBLICO' ? '∞' : (user.diasRestantes ?? 0)}
                            </span>
                        </div>
                        <div className="h-16 w-16 shrink-0 bg-white text-purple-600 shadow-sm rounded-2xl flex items-center justify-center border border-purple-100/50">
                            <Hourglass className="h-8 w-8 text-purple-500" />
                        </div>
                    </div>

                    {user.tipoUsuario === 'ASESOR_PRIVADO' && (
                        <div className="flex items-center gap-2 mt-2 z-10 w-full">
                            <Popover open={popoverAddDaysOpen} onOpenChange={setPopoverAddDaysOpen}>
                                <PopoverTrigger asChild>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        disabled={isUpdatingDays}
                                        className="flex-1 h-12 bg-white hover:bg-white border-transparent shadow-sm hover:shadow-md transition-all rounded-xl border-b-2 border-b-slate-200"
                                    >
                                        <Plus className="h-5 w-5 mr-1 text-purple-600" />
                                        <span className="tracking-tight text-[11px] font-extrabold text-slate-900">AÑADIR 30 DÍAS</span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-4 rounded-xl shadow-xl border-slate-100" align="start" sideOffset={5}>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-start gap-3">
                                            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                                                <Plus className="h-4 w-4 text-purple-600" />
                                            </div>
                                            <div className="flex flex-col">
                                                <h4 className="font-bold text-slate-900 text-sm">¿Añadir 30 Días?</h4>
                                                <p className="text-xs text-slate-500 mt-0.5">Se extenderá el acceso por 30 días adicionales de suscripción.</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2 mt-2">
                                            <Button size="sm" variant="outline" className="h-7 text-xs px-4 shadow-none text-slate-600 font-bold" onClick={() => setPopoverAddDaysOpen(false)}>
                                                Cancelar
                                            </Button>
                                            <Button size="sm" className="h-7 text-xs px-4 shadow-none bg-purple-600 hover:bg-purple-700 text-white font-bold" onClick={handleAddDays}>
                                                Confirmar
                                            </Button>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>

                            <Popover open={popoverSubtractDaysOpen} onOpenChange={setPopoverSubtractDaysOpen}>
                                <PopoverTrigger asChild>
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        disabled={isUpdatingDays}
                                        className="flex-1 h-12 bg-white hover:bg-white border-transparent shadow-sm hover:shadow-md transition-all rounded-xl border-b-2 border-b-slate-200"
                                    >
                                        <Minus className="h-5 w-5 mr-1 text-purple-600" />
                                        <span className="tracking-tight text-[11px] font-extrabold text-slate-900">QUITAR 30 DÍAS</span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-4 rounded-xl shadow-xl border-slate-100" align="end" sideOffset={5}>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-start gap-3">
                                            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                                <Minus className="h-4 w-4 text-red-600" />
                                            </div>
                                            <div className="flex flex-col">
                                                <h4 className="font-bold text-slate-900 text-sm">¿Quitar 30 Días?</h4>
                                                <p className="text-xs text-slate-500 mt-0.5">Se restarán 30 días al periodo actual. Si llega a 0, la suscripción se dará por finalizada.</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2 mt-2">
                                            <Button size="sm" variant="outline" className="h-7 text-xs px-4 shadow-none text-slate-600 font-bold" onClick={() => setPopoverSubtractDaysOpen(false)}>
                                                Cancelar
                                            </Button>
                                            <Button size="sm" className="h-7 text-xs px-4 shadow-none bg-red-600 hover:bg-red-700 text-white font-bold" onClick={handleSubtractDays}>
                                                Confirmar
                                            </Button>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}
                    
                    {/* Decorative abstract shape */}
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-200/40 rounded-full blur-xl pointer-events-none"></div>
                </div>
             </div>
            </div>

            {/* Right Column: Gestión Operativa */}
            <div className="rounded-3xl p-8 flex flex-col gap-6 shadow-sm border border-gray-100 bg-white">
                <div className="flex items-center gap-3">
                    <div className="h-1.5 w-8 bg-orange-500 rounded-full"></div>
                    <h3 className="text-xl font-bold text-slate-900">Gestión Operativa</h3>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-extrabold tracking-wider text-slate-500 uppercase">Notas Internas (CRM)</label>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                           {crmData?.meta?.totalItems || 0} notas
                        </span>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-wrap gap-2">
                           {getEtiqOptions().map(opt => (
                               <button 
                                  key={opt.value}
                                  onClick={() => setNuevaEtiqueta(opt.value === nuevaEtiqueta ? "" : opt.value)}
                                  className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${nuevaEtiqueta === opt.value ? 'border-gray-300 ring-2 ring-offset-1 ring-gray-200' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                  style={{ backgroundColor: opt.bg, color: opt.text }}
                               >
                                  {opt.label}
                               </button>
                           ))}
                        </div>
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
                                disabled={isCrmLoading}
                                className="w-full bg-[var(--admin-filter-bg)] border-none rounded-2xl p-5 min-h-[120px] text-sm font-medium resize-none text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
                                placeholder={`Añadir una nota sobre este usuario${nuevaEtiqueta ? ' con la etiqueta seleccionada' : ''}... (Presiona Enter para enviar)`}
                            ></textarea>
                            <Button disabled={isCrmLoading || !nuevoMensaje.trim()} onClick={handleAddNote} size="icon" className="absolute bottom-4 right-4 bg-white hover:bg-gray-50 text-slate-900 rounded-xl shadow-sm border border-gray-100 h-10 w-10">
                                {isCrmLoading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900"></div> : <Send className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-6 mt-4">
                    {isFetchingNotes ? (
                        <div className="text-center py-8 text-sm text-slate-400">Cargando notas...</div>
                    ) : !crmData?.data || crmData.data.length === 0 ? (
                        <div className="text-center py-8 text-sm text-slate-400">No hay notas registradas para este usuario.</div>
                    ) : (
                        <>
                            {crmData.data.map((note) => {
                                const isEdited = note.updatedAt !== note.createdAt;
                                const isEditingThis = editandoNotaId === note.id;
                                const etiqConfig = getEtiqConfig(note.etiqueta);
                                
                                return (
                                    <div 
                                        key={note.id} 
                                        className="group flex gap-4 transition-all pr-2 p-4 rounded-2xl mb-2"
                                        style={{ backgroundColor: etiqConfig ? etiqConfig.bg : 'white', border: etiqConfig ? 'none' : '1px solid #f1f5f9' }}
                                    >
                                        <Avatar className="h-10 w-10 border border-slate-200 shadow-sm mt-1">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${note.adminNombre || 'Admin'}`} />
                                            <AvatarFallback className="bg-slate-100 text-slate-700 font-bold text-xs">{note.adminNombre?.substring(0, 2).toUpperCase() || 'AD'}</AvatarFallback>
                                        </Avatar>
                                        
                                        <div className="flex flex-col flex-1 pb-1">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-900 text-sm">{note.adminNombre || 'Admin'}</span>
                                                    {etiqConfig && (
                                                        <span className="text-[10px] px-2 py-0.5 rounded-md font-bold" 
                                                              style={{ backgroundColor: 'white', color: etiqConfig.text, border: `1px solid ${etiqConfig.text}40` }}>
                                                            {etiqConfig.label}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {!isEditingThis && (
                                                            <>
                                                                <button onClick={() => startEditing(note)} className="p-1 text-slate-400 hover:text-blue-600 rounded">
                                                                    <Edit2 className="h-3.5 w-3.5" />
                                                                </button>
                                                                <Popover open={popoverId === note.id} onOpenChange={(open: boolean) => setPopoverId(open ? note.id : null)}>
                                                                    <PopoverTrigger asChild>
                                                                        <button className="p-1 text-slate-400 hover:text-red-600 rounded">
                                                                            <Trash2 className="h-3.5 w-3.5" />
                                                                        </button>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent className="w-64 p-4 rounded-xl shadow-xl border-slate-100" align="end" sideOffset={5}>
                                                                        <div className="flex flex-col gap-3">
                                                                            <div className="flex items-start gap-3">
                                                                                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                                                </div>
                                                                                <div className="flex flex-col">
                                                                                    <h4 className="font-bold text-slate-900 text-sm">Eliminar Nota</h4>
                                                                                    <p className="text-xs text-slate-500 mt-0.5">¿Seguro? Esta acción es irreversible.</p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex justify-end gap-2 mt-1">
                                                                                <Button size="sm" variant="outline" className="h-7 text-xs px-3 shadow-none text-slate-600 font-bold" onClick={() => setPopoverId(null)}>
                                                                                    Cancelar
                                                                                </Button>
                                                                                <Button size="sm" className="h-7 text-xs px-3 shadow-none bg-red-600 hover:bg-red-700 text-white font-bold" onClick={() => ejecutarEliminar(note.id)}>
                                                                                    Eliminar
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    </PopoverContent>
                                                                </Popover>
                                                            </>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                                                        {format(new Date(isEdited ? note.updatedAt : note.createdAt), "dd MMM yyyy, HH:mm", { locale: es })}
                                                        {isEdited && <span className="italic ml-1 font-bold text-[10px] bg-slate-100 px-1.5 py-0.5 rounded-full">Editado</span>}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {isEditingThis ? (
                                                <div className="mt-3 flex flex-col gap-2">
                                                    <div className="flex flex-wrap gap-1.5 mb-1">
                                                        <button 
                                                            onClick={() => setEditEtiqueta("")}
                                                            className={`px-2 py-0.5 text-[10px] font-bold rounded border ${!editEtiqueta ? 'bg-slate-200 text-slate-700 border-slate-300' : 'bg-transparent text-slate-400 border-transparent hover:bg-slate-100'}`}
                                                        >
                                                            Ninguna
                                                        </button>
                                                        {getEtiqOptions().map(opt => (
                                                            <button 
                                                                key={opt.value}
                                                                onClick={() => setEditEtiqueta(opt.value)}
                                                                className={`px-2 py-0.5 text-[10px] font-bold rounded border transition-all ${editEtiqueta === opt.value ? 'border-gray-400 ring-1 ring-gray-300 shadow-sm' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                                                style={{ backgroundColor: opt.bg, color: opt.text }}
                                                            >
                                                                {opt.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <textarea 
                                                        value={editMensaje}
                                                        onChange={e => setEditMensaje(e.target.value)}
                                                        className="w-full bg-slate-50 border border-emerald-200 focus:border-emerald-500 rounded-xl p-3 min-h-[80px] text-sm text-slate-700 outline-none transition-colors"
                                                    />
                                                    <div className="flex justify-end gap-2 mt-1">
                                                        <Button variant="ghost" size="sm" onClick={cancelEditing} className="h-7 text-xs text-slate-500 hover:bg-slate-100">
                                                            <X className="h-3 w-3 mr-1" /> Cancelar
                                                        </Button>
                                                        <Button size="sm" onClick={saveEdit} disabled={!editMensaje.trim()} className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">
                                                            <Check className="h-3 w-3 mr-1" /> Guardar
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-slate-600 mt-2 font-medium leading-relaxed whitespace-pre-wrap">{note.content}</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {/* Paginación de Notas */}
                            {crmData.meta && crmData.meta.totalPages > 1 && (
                                <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
                                    <span className="text-xs text-slate-500 font-medium">
                                        Mostrando notas {(crmData.meta.currentPage - 1) * crmData.meta.itemsPerPage + 1} - {Math.min(crmData.meta.currentPage * crmData.meta.itemsPerPage, crmData.meta.totalItems)} de {crmData.meta.totalItems}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 rounded-lg shadow-none"
                                            disabled={crmData.meta.currentPage === 1}
                                            onClick={() => setCrmPage(p => Math.max(1, p - 1))}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <span className="text-xs font-bold text-slate-700 px-2">
                                            {crmData.meta.currentPage} / {crmData.meta.totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 rounded-lg shadow-none"
                                            disabled={crmData.meta.currentPage === crmData.meta.totalPages}
                                            onClick={() => setCrmPage(p => Math.min(crmData.meta.totalPages, p + 1))}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}
