import { axiosInstance } from '../axios';

const API_URL = '/user';

export const userApi = {
    getProfile: async () => {
        const response = await axiosInstance.get(`${API_URL}/`);
        return response.data;
    },

    updateSetting: async (key: string, setting: any) => {
        const response = await axiosInstance.post(`${API_URL}/update`, { key, setting });
        return response.data;
    },

    addSetting: async (key: string, setting: any) => {
        const response = await axiosInstance.post(`${API_URL}/add`, { key, setting });
        return response.data;
    },

    removeSetting: async (key: string, setting: any) => {
        const response = await axiosInstance.post(`${API_URL}/remove`, { key, setting });
        return response.data;
    },
};
