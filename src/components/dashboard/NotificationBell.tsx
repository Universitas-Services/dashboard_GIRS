'use client';

import { Bell, Clock } from 'lucide-react';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState, useEffect, useCallback } from 'react';
import { dashboardService, DashboardMetrics } from '@/services/dashboardService';

export function NotificationBell() {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

    const fetchMetrics = useCallback(async () => {
        try {
            const data = await dashboardService.getMetrics();
            setMetrics(data);
        } catch (error) {
            console.error('Error fetching metrics for notifications:', error);
        }
    }, []);

    // Fetch inicial al montar
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchMetrics();
    }, [fetchMetrics]);

    return (
        <DropdownMenu onOpenChange={(open) => open && fetchMetrics()}>
            <DropdownMenuTrigger asChild>
                <button className="relative p-2 text-muted-foreground hover:bg-slate-100 rounded-full transition-all hover:scale-105 active:scale-95">
                    <Bell className="h-5 w-5" />
                    {metrics && metrics.alertas.cantidadVencimientos > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-4 min-w-[16px] px-1 bg-red-500 rounded-full border-2 border-white text-[9px] font-bold text-white flex items-center justify-center">
                            {metrics.alertas.cantidadVencimientos}
                        </span>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 rounded-2xl border-none shadow-2xl overflow-hidden mt-2">
                <DropdownMenuLabel className="p-4 bg-slate-900 text-white flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-sm font-bold">Notificaciones</span>
                        <span className="text-[10px] text-slate-400 font-medium">Alertas de vencimiento</span>
                    </div>
                    {metrics && metrics.alertas.cantidadVencimientos > 0 && (
                        <span className="bg-red-500 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {metrics.alertas.cantidadVencimientos} Hoy
                        </span>
                    )}
                </DropdownMenuLabel>
                
                <div className="max-h-[350px] overflow-y-auto">
                    {!metrics || metrics.alertas.proximosAVencer.length === 0 ? (
                        <div className="p-8 text-center flex flex-col items-center gap-3">
                            <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                <Bell className="h-6 w-6" />
                            </div>
                            <p className="text-xs text-slate-400 font-medium">No hay alertas de vencimiento pendientes</p>
                        </div>
                    ) : (
                        metrics.alertas.proximosAVencer.map((user) => (
                            <DropdownMenuItem key={user.id} className="p-4 cursor-pointer hover:bg-slate-50 focus:bg-slate-50 border-b border-slate-50 last:border-none">
                                <div className="flex items-center gap-3 w-full">
                                    <Avatar className="h-10 w-10 border border-slate-200/60 shadow-sm bg-slate-100">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.email}`} className="object-cover" />
                                        <AvatarFallback className="font-bold text-slate-800 text-xs text-center flex items-center justify-center w-full">
                                            {user.nombre?.charAt(0) || ''}{user.apellido?.charAt(0) || ''}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col gap-0.5 min-w-0">
                                        <p className="text-sm font-bold text-slate-800 truncate">
                                            {user.nombre} {user.apellido}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                        <p className="text-[10px] font-bold text-amber-600 mt-1 flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> Vence pronto
                                        </p>
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>

                <div className="p-3 bg-slate-50 border-t border-slate-100">
                    <button className="w-full py-2 text-[10px] font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-widest">
                        Ver todo el historial
                    </button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
