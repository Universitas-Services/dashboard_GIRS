'use client';

import { 
  Search, Bell, HelpCircle, 
  ArrowLeft, Lock, Shield, Mail, Phone, MapPin, Building, Briefcase, 
  CheckCircle2, Send, Clock, UserIcon, ShieldCheck, Banknote, Hourglass
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function UserDetailsPage() {
  const router = useRouter();

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
              <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                      placeholder="Buscar por nombre o ID de usuario..." 
                      className="w-full pl-9 border-none rounded-full h-10 shadow-sm"
                      style={{ backgroundColor: 'var(--admin-search-bg)' }}
                  />
              </div>
          </div>

          <div className="flex items-center gap-4 justify-end min-w-[140px]">
              <button className="relative p-2 text-muted-foreground hover:bg-slate-100 rounded-full transition-colors">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
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
                    <div className="h-24 w-24 rounded-3xl bg-[#0a0a0a] flex items-center justify-center overflow-hidden shadow-md">
                        <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Ricardo" alt="Ricardo Sánchez" className="h-full w-full object-cover p-2" />
                    </div>
                    <div className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white bg-green-500"></div>
                </div>
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Ricardo Sánchez</h2>
                        <Badge 
                            className="px-3 py-0.5 text-[10px] font-extrabold rounded-md shadow-none cursor-default"
                            style={{ backgroundColor: 'var(--admin-badge-suscrito-bg)', color: 'var(--admin-badge-suscrito-text)' }}
                        >
                            SUSCRITO
                        </Badge>
                    </div>
                    <div className="flex items-center text-muted-foreground text-sm font-medium">
                        <Mail className="h-4 w-4 mr-1.5 opacity-70" />
                        ricardo.sanchez@gob.mx
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-[280px]">
                <Button className="font-black rounded-xl shadow-[0_8px_16px_-4px_rgba(0,234,0,0.4)] px-6 h-12 w-full border-none hover:opacity-95" style={{ backgroundColor: 'var(--admin-toggle-active-bg)', color: '#053b00' }}>
                    <ShieldCheck className="h-5 w-5 mr-2 text-[#053b00]" />
                    Gestionar Acceso
                </Button>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white border border-gray-100 rounded-xl h-14 flex flex-col items-center justify-center shadow-sm cursor-pointer hover:bg-gray-50 transition-colors">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Envió</span>
                        <span className="text-xs font-bold text-slate-700">Normativa</span>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-xl h-14 flex flex-col items-center justify-center shadow-sm cursor-pointer hover:bg-gray-50 transition-colors">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Registrar Pago</span>
                        <span className="text-xs font-bold text-green-600 tracking-wide">$20</span>
                    </div>
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
                        <p className="font-semibold text-slate-900 mt-1.5 text-base leading-snug">Ricardo Alberto Sánchez<br/>Ruiz</p>
                    </div>
                    <div className="col-span-1 flex justify-end items-start">
                        <div className="rounded-lg px-4 py-2 flex flex-col items-center shadow-sm" style={{ backgroundColor: 'var(--admin-id-badge-bg)', color: 'var(--admin-id-badge-text)' }}>
                            <span className="text-[10px] font-extrabold">ID:</span>
                            <span className="text-sm font-black">48821</span>
                        </div>
                    </div>

                    <div className="col-span-1">
                        <label className="text-[10px] font-extrabold tracking-wider text-green-800/80 uppercase">Teléfono</label>
                        <p className="font-semibold text-slate-900 mt-1.5">+58 55555555</p>
                    </div>
                    <div className="col-span-1">
                        <label className="text-[10px] font-extrabold tracking-wider text-green-800/80 uppercase">Ubicación</label>
                        <p className="font-semibold text-slate-900 mt-1.5">Lara<br/>Iribarren</p>
                    </div>

                    <div className="col-span-1">
                        <label className="text-[10px] font-extrabold tracking-wider text-green-800/80 uppercase">Institución</label>
                        <p className="font-semibold text-slate-900 mt-1.5">Secretaría de<br/>Medio Ambiente</p>
                    </div>
                    <div className="col-span-1">
                        <label className="text-[10px] font-extrabold tracking-wider text-green-800/80 uppercase">Cargo</label>
                        <p className="font-semibold text-slate-900 mt-1.5">Director de<br/>Normatividad</p>
                    </div>
                </div>

                <div className="flex flex-col gap-3 mt-2">
                    <label className="text-[10px] font-extrabold tracking-wider text-green-800/80 uppercase">Estatus Normativo GIRS</label>
                    <div className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-green-100 text-green-600">
                            <CheckCircle2 className="h-6 w-6 fill-green-500 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-slate-900">Cumplimiento Total</span>
                            <span className="text-xs text-muted-foreground font-medium mt-0.5">Última validación: 12 Oct 2023</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 p-1.5 bg-white/50 rounded-xl">
                    <Button variant="ghost" className="flex-1 bg-white shadow-sm font-bold text-slate-800 rounded-lg h-10 border border-gray-100">
                        <Building className="h-4 w-4 mr-2 text-slate-500" />
                        Servidor Público
                    </Button>
                    <Button variant="ghost" className="flex-1 font-bold text-slate-400 rounded-lg h-10 hover:text-slate-600">
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
                        <div className="mt-1 h-10 w-10 shrink-0 bg-[var(--admin-filter-bg)] text-slate-600 rounded-full flex items-center justify-center">
                            <UserIcon className="h-5 w-5" />
                        </div>
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
                        <div className="h-10 w-10 shrink-0 bg-yellow-100/50 text-yellow-700 rounded-full flex items-center justify-center">
                            <Banknote className="h-5 w-5" />
                        </div>
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
                        <div className="mt-1 h-10 w-10 shrink-0 bg-[var(--admin-filter-bg)] text-slate-600 rounded-full flex items-center justify-center">
                            <Clock className="h-5 w-5" />
                        </div>
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
                        <div className="mt-1 h-10 w-10 shrink-0 bg-[var(--admin-filter-bg)] text-slate-600 rounded-full flex items-center justify-center">
                            <UserIcon className="h-5 w-5" />
                        </div>
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
