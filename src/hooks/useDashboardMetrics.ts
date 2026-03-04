import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { dashboardService, DashboardMetrics } from '@/services/dashboardService';

export function useDashboardMetrics() {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMetrics = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await dashboardService.getMetrics();
            setMetrics(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al cargar métricas';
            setError(errorMessage);
            toast.error('Error al cargar métricas', {
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMetrics();
    }, [fetchMetrics]);

    return { metrics, isLoading, error, refetch: fetchMetrics };
}
