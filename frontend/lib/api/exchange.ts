import { axiosInstance } from '../axios';

const API_URL = '/exchange';

export const exchangeApi = {
    getRates: async () => {
        const response = await axiosInstance.get(API_URL);
        return response.data;
    },

    getCurrencies: async () => {
        const response = await axiosInstance.get(`${API_URL}/currencies`);
        return response.data;
    },
};
