import api from '@/lib/axios';

export interface DashboardMetrics {
    users: {
        total: number;
        active: number;
        inactive: number;
        verified: number;
        admins: number;
        byRole: { role: string; count: number }[];
    };
    chat: {
        totalMessages: number;
        totalSessions: number;
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
        createdAt: string;
    }[];
}
export const dashboardService = {
    getMetrics: async (): Promise<DashboardMetrics> => {
        const response = await api.get<DashboardMetrics>('/admin/metrics/dashboard');
        return response.data;
    },
};
