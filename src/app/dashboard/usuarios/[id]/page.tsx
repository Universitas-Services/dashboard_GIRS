'use client';

import { 
  ArrowLeft, Shield, Mail, Building, 
  CheckCircle2, Send, Clock, ShieldCheck, Hourglass, Ban
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { NotificationBell } from '@/components/dashboard/NotificationBell';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { adminService } from '@/services/adminService';
import { User } from '@/types/user';
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

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

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
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-6">
                <div className="relative">
                    <Avatar className="h-24 w-24 rounded-3xl bg-slate-900 shadow-md">
                        <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.nombre}`} alt={user.nombre} className="p-2" />
                        <AvatarFallback className="text-2xl font-black text-white bg-slate-800">
                            {user.nombre[0]}{user.apellido?.[0] || ''}
                        </AvatarFallback>
                    </Avatar>
                    {(user.estadoCuenta === 'ACTIVO' || user.estadoCuenta === 'SUSCRITO') && <div className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white bg-green-500"></div>}
                </div>
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{user.nombre} {user.apellido || ''}</h2>
                        <Badge 
                            className="px-3 py-0.5 text-[10px] font-extrabold rounded-md shadow-none cursor-default uppercase"
                            style={{ 
                                backgroundColor: statusConfig[user.estadoCuenta]?.bgColor || '#f1f5f9', 
                                color: statusConfig[user.estadoCuenta]?.color || '#64748b' 
                            }}
                        >
                            {statusConfig[user.estadoCuenta]?.label || user.estadoCuenta}
                        </Badge>
                    </div>
                    <div className="flex items-center text-muted-foreground text-sm font-medium">
                        <Mail className="h-4 w-4 mr-1.5 opacity-70" />
                        {user.email}
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4 w-full max-w-[280px]">
                <div 
                    className="rounded-2xl p-5 flex flex-col gap-4 shadow-xl border border-white/20 transition-all"
                    style={{ 
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)'
                    }}
                >
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                            <ShieldCheck className="h-5 w-5 text-emerald-600" />
                        </div>
                        <span className="text-sm font-bold text-slate-800 tracking-tight">Gestión de Acceso</span>
                    </div>

                    <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-100 shadow-inner">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {user.tipoUsuario === 'SERVIDOR_PUBLICO' ? 'ENVIÓ' : 'REGISTRAR'}
                            </span>
                            <span className="text-sm font-black text-slate-700">
                                {user.tipoUsuario === 'SERVIDOR_PUBLICO' ? 'Normativa' : 'Pago $20'}
                            </span>
                        </div>
                        <Switch 
                            disabled={isUpdating}
                            checked={user.tipoUsuario === 'SERVIDOR_PUBLICO' ? user.estadoCuenta === 'ACTIVO' : user.estadoCuenta === 'SUSCRITO'}
                            onCheckedChange={handleStatusToggle}
                            className="data-[state=checked]:bg-emerald-500"
                        />
                    </div>
                    
                    {isUpdating && (
                        <p className="text-[10px] text-center font-bold text-emerald-600 animate-pulse uppercase tracking-widest">
                            Actualizando...
                        </p>
                    )}
                </div>
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

                <div className="grid grid-cols-2 gap-y-8 gap-x-4">
                    <div className="col-span-1">
                        <label className="text-[10px] font-extrabold tracking-wider text-green-800/80 uppercase">Nombre Completo</label>
                        <p className="font-semibold text-slate-900 mt-1.5 text-base leading-snug">{user.nombre} {user.apellido || ''}</p>
                    </div>
                    <div className="col-span-1 flex justify-end items-start">
                        <div className="rounded-lg px-4 py-2 flex flex-col items-center shadow-sm w-[120px]" style={{ backgroundColor: 'var(--admin-id-badge-bg)', color: 'var(--admin-id-badge-text)' }}>
                            <span className="text-[10px] font-extrabold mb-1">ID:</span>
                            <span className="text-[11px] font-black leading-tight text-center break-all">
                                {user.id.substring(0, 12)}<br/>
                                {user.id.substring(12, 24)}<br/>
                                {user.id.substring(24)}
                            </span>
                        </div>
                    </div>

                    <div className="col-span-1">
                        <label className="text-[10px] font-extrabold tracking-wider text-green-800/80 uppercase">Teléfono</label>
                        <p className="font-semibold text-slate-900 mt-1.5">{user.telefono || 'No registrado'}</p>
                    </div>
                    <div className="col-span-1">
                        <label className="text-[10px] font-extrabold tracking-wider text-green-800/80 uppercase">Ubicación</label>
                        <p className="font-semibold text-slate-900 mt-1.5">{user.estado || '---'}<br/>{user.municipio || '---'}</p>
                    </div>

                    <div className="col-span-1">
                        <label className="text-[10px] font-extrabold tracking-wider text-green-800/80 uppercase">Institución</label>
                        <p className="font-semibold text-slate-900 mt-1.5">{user.profile?.nombreEnte || '---'}</p>
                    </div>
                    <div className="col-span-1">
                        <label className="text-[10px] font-extrabold tracking-wider text-green-800/80 uppercase">Cargo</label>
                        <p className="font-semibold text-slate-900 mt-1.5">{user.profile?.cargo || '---'}</p>
                    </div>
                </div>

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
                        <div className="flex flex-col gap-3 mt-2">
                            <label className="text-[10px] font-extrabold tracking-wider text-green-800/80 uppercase">Estatus Normativo GIRS</label>
                            <div className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                                <div className={`h-10 w-10 flex items-center justify-center rounded-full ${config.bgColor} ${config.color}`}>
                                    <StatusIcon className={`h-6 w-6 ${currentStatus === 'VIGENTE' ? 'fill-green-500 text-white' : ''}`} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-900">{config.label}</span>
                                    <span className="text-xs text-muted-foreground font-medium mt-0.5">Última actualización: {format(new Date(user.updatedAt), 'dd MMM yyyy', { locale: es })}</span>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                <div className="flex gap-2 p-1.5 bg-white/50 rounded-xl">
                    <Button variant="ghost" className={`flex-1 ${user.tipoUsuario === 'SERVIDOR_PUBLICO' ? 'bg-white shadow-sm font-bold text-slate-800' : 'font-bold text-slate-400'} rounded-lg h-10 border border-gray-100`}>
                        <Building className="h-4 w-4 mr-2 text-slate-500" />
                        Servidor Público
                    </Button>
                    <Button variant="ghost" className={`flex-1 ${user.tipoUsuario === 'ASESOR_PRIVADO' ? 'bg-white shadow-sm font-bold text-slate-800' : 'font-bold text-slate-400'} rounded-lg h-10 hover:text-slate-600`}>
                        <Shield className="h-4 w-4 mr-2" />
                        Asesor Privado
                    </Button>
                </div>

                <div className="rounded-3xl p-6 flex items-center justify-between text-white overflow-hidden relative shadow-md mt-2" 
                     style={{ background: 'linear-gradient(135deg, var(--admin-card-blue-bg), #1e40af)' }}>
                    <div className="flex flex-col z-10">
                        <span className="text-[10px] font-bold tracking-wider text-white/80 uppercase">Días de Acceso Restantes</span>
                        <span className="text-6xl font-black mt-1">24</span>
                    </div>
                    <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md z-10 border border-white/20">
                        <Hourglass className="h-8 w-8 text-white" />
                    </div>
                    {/* Decorative abstract shape */}
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                </div>
            </div>

            {/* Right Column: Gestión Operativa */}
            <div className="rounded-3xl p-8 flex flex-col gap-6 shadow-sm border border-gray-100 bg-white">
                <div className="flex items-center gap-3">
                    <div className="h-1.5 w-8 bg-orange-500 rounded-full"></div>
                    <h3 className="text-xl font-bold text-slate-900">Gestión Operativa</h3>
                </div>

                <div className="flex flex-col gap-4">
                    <label className="text-[10px] font-extrabold tracking-wider text-slate-500 uppercase">Notas Internas (CRM)</label>
                    <div className="relative">
                        <textarea 
                            className="w-full bg-[var(--admin-filter-bg)] border-none rounded-2xl p-5 min-h-[120px] text-sm font-medium resize-none text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
                            placeholder="Añadir una nota sobre este usuario..."
                        ></textarea>
                        <Button size="icon" className="absolute bottom-4 right-4 bg-white hover:bg-gray-50 text-slate-900 rounded-xl shadow-sm border border-gray-100 h-10 w-10">
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col gap-6 mt-4">
                    {/* Log Item 1 */}
                    <div className="flex gap-4">
                        <Avatar className="h-10 w-10 border border-slate-200 shadow-sm mt-1">
                            <AvatarImage src="https://api.dicebear.com/7.x/notionists/svg?seed=Maria" />
                            <AvatarFallback>AM</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col flex-1 pb-4 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 text-sm">Admin María</span>
                                <span className="text-xs text-muted-foreground font-medium">Hace 2 horas</span>
                            </div>
                            <p className="text-sm text-slate-600 mt-1 font-medium leading-relaxed">Ya lo contacté. Me comenta que enviará los comprobantes de la Secretaría mañana por la tarde.</p>
                        </div>
                    </div>

                    {/* Log Item 2 (System) */}
                    <div className="flex gap-4 p-4 rounded-2xl" style={{ backgroundColor: 'var(--admin-log-gold-bg)' }}>
                        <Avatar className="h-10 w-10 border border-yellow-200 shadow-sm">
                            <AvatarFallback className="bg-yellow-100 text-yellow-700 font-bold text-xs">SYS</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col flex-1">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-sm tracking-wide" style={{ color: 'var(--admin-log-gold-text)' }}>SISTEMA</span>
                                <span className="text-xs font-medium" style={{ color: 'var(--admin-log-gold-text)' }}>15 Oct 2023</span>
                            </div>
                            <p className="text-sm mt-1 font-bold italic mix-blend-multiply" style={{ color: 'var(--admin-log-gold-text)' }}>Pendiente de pago - El usuario inició proceso de extensión de 30 días.</p>
                        </div>
                    </div>

                    {/* Log Item 3 */}
                    <div className="flex gap-4">
                        <Avatar className="h-10 w-10 border border-slate-200 shadow-sm mt-1">
                            <AvatarFallback className="bg-slate-100 text-slate-600 font-bold text-xs">AG</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col flex-1 pb-4 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 text-sm">Admin GIRS</span>
                                <span className="text-xs text-muted-foreground font-medium">10 Oct 2023</span>
                            </div>
                            <p className="text-sm text-slate-600 mt-1 font-medium leading-relaxed">Perfil creado exitosamente. Verificación de identidad completada vía correo institucional.</p>
                        </div>
                    </div>

                    {/* Log Item 4 */}
                    <div className="flex gap-4 opacity-50">
                        <Avatar className="h-10 w-10 border border-slate-200 shadow-sm mt-1">
                            <AvatarImage src="https://api.dicebear.com/7.x/notionists/svg?seed=Maria" />
                            <AvatarFallback>AM</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col flex-1">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 text-sm">Admin María</span>
                                <span className="text-xs text-muted-foreground font-medium">Hace 2 horas</span>
                            </div>
                            <p className="text-sm text-slate-600 mt-1 font-medium leading-relaxed">Solicitud de cambio de cargo procesada.</p>
                        </div>
                    </div>

                </div>
            </div>

        </div>
      </div>
    </div>
  );
}
