import { apiService } from '../../../utils/api';
import type { ApiResponse } from '../../../utils/api';

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface UserActivity {
  id: string;
  action: string;
  timestamp: string;
  details?: string;
  ipAddress?: string;
}

export interface SystemEvent {
  id: string;
  type: string;
  timestamp: string;
  details?: string;
  metadata?: any;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AuditLogsResponse {
  logs: AuditLog[];
  pagination: PaginationData;
}

export interface UserActivitiesResponse {
  activities: UserActivity[];
  pagination: PaginationData;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface SystemEventsResponse {
  events: SystemEvent[];
  pagination: PaginationData;
}

export interface AuditFilters {
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
  action?: string;
  page?: number;
  limit?: number;
}

class AuditoriaApiService {
  // Obtener logs de auditoría (solo admin)
  async getAuditLogs(filters?: AuditFilters): Promise<AuditLogsResponse> {
    const params = new URLSearchParams();

    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.action) params.append('action', filters.action);

    try {
      const response: ApiResponse<AuditLogsResponse> = await apiService.get(
        `/audit/logs?${params.toString()}`
      );

      if (!response.success || !response.data) {
        return { logs: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
      }

      return response.data as AuditLogsResponse;
    } catch {
      return { logs: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
    }
  }

  // Obtener actividad de un usuario específico (solo admin)
  async getUserActivity(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<UserActivitiesResponse> {
    try {
      const response: ApiResponse<UserActivitiesResponse> = await apiService.get(
        `/audit/user-activity/${userId}?page=${page}&limit=${limit}`
      );
      if (!response.success || !response.data) {
        return { activities: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
      }
      return response.data as UserActivitiesResponse;
    } catch {
      return { activities: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
    }
  }

  // Obtener mi propia actividad
  async getMyActivity(
    page: number = 1,
    limit: number = 10
  ): Promise<UserActivitiesResponse> {
    try {
      const response: ApiResponse<UserActivitiesResponse> = await apiService.get(
        `/audit/my-activity?page=${page}&limit=${limit}`
      );
      if (!response.success || !response.data) {
        return { activities: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
      }
      return response.data as UserActivitiesResponse;
    } catch {
      return { activities: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
    }
  }

  // Obtener eventos del sistema (solo admin)
  async getSystemEvents(
    page: number = 1,
    limit: number = 10
  ): Promise<SystemEventsResponse> {
    try {
      const response: ApiResponse<SystemEventsResponse> = await apiService.get(
        `/audit/system-events?page=${page}&limit=${limit}`
      );
      if (!response.success || !response.data) {
        return { events: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
      }
      return response.data as SystemEventsResponse;
    } catch {
      return { events: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
    }
  }

  // Exportar logs a CSV
  exportLogsToCSV(logs: AuditLog[]): void {
    const headers = [
      'Fecha/Hora',
      'Usuario',
      'Acción',
      'Detalles',
      'IP',
      'User Agent',
    ];

    const csvContent = [
      headers.join(','),
      ...logs.map((log) =>
        [
          log.timestamp,
          log.user,
          log.action,
          `"${log.details || ''}"`,
          log.ipAddress || '',
          `"${log.userAgent || ''}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `auditoria_logs_${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Exportar actividades a CSV
  exportActivitiesToCSV(activities: UserActivity[]): void {
    const headers = ['Fecha/Hora', 'Acción', 'Detalles', 'IP'];

    const csvContent = [
      headers.join(','),
      ...activities.map((activity) =>
        [
          activity.timestamp,
          activity.action,
          `"${activity.details || ''}"`,
          activity.ipAddress || '',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `actividad_usuario_${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const auditoriaApi = new AuditoriaApiService();
