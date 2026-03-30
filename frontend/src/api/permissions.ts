import api from './auth';

export interface Permission {
  id: string;
  code: string;
  name: string;
  type: 'MENU' | 'BUTTON' | 'API';
  menuPath?: string;
  sortOrder?: number;
}

export const permissionsApi = {
  list: async (): Promise<Permission[]> => {
    const response = await api.get<Permission[]>('/permissions');
    return response.data;
  },
};
