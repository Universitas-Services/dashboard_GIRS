import api from '@/lib/axios';

export interface DashboardMetrics {
    users: {
        total: number;
        active: number;
        inactive: number;
        verified: number;
        admins: number;
        byRole: { role: string; count: number }[];
        byEstadoCuenta: { estado: string; count: number }[];
    };
    chat: {
        totalMessages: number;
        totalSessions: number;
    };
    analytics: {
        porTipousuario: {
            servidoresPublicos: number;
            asesoresPrivados: number;
        };
        cuentasSuscritasActivas: number;
        suspensionesRecientes: number;
        crecimientoHoy: number;
        usuariosNoVerificados: number;
        comparativa: {
            semanal: { actual: number; anterior: number };
            mensual: { actual: number; anterior: number };
        };
        graficoCrecimiento: { etiqueta: string; cantidad: number }[];
    };
    alertas: {
        proximosAVencer: {
            id: string;
            email: string;
            nombre: string;
            apellido: string;
            tipoUsuario: string;
            createdAt: string;
        }[];
        cantidadVencimientos: number;
    };
    recentUsers: {
        id: string;
        email: string;
        nombre: string;
        apellido: string;
        tipoUsuario: string;
        estadoCuenta: string;
        createdAt: string;
    }[];
}
export const dashboardService = {
    getMetrics: async (): Promise<DashboardMetrics> => {
        const response = await api.get<DashboardMetrics>(`/admin/metrics/dashboard?t=${Date.now()}`);
        return response.data;
    },
};
