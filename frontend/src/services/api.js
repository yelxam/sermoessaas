import axios from 'axios';
import { config as appConfig } from '../config';

const api = axios.create({
    baseURL: appConfig.apiUrl,
});

// Interceptor to add token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['x-auth-token'] = token;
    }
    return config;
});

export default api;
