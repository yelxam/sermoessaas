import axios from 'axios';
import { config as appConfig } from '../config';

const api = axios.create({
    baseURL: appConfig.apiUrl.endsWith('/') ? appConfig.apiUrl.slice(0, -1) : appConfig.apiUrl,
});

// Interceptor to add token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['x-auth-token'] = token;
    }
    return config;
});

// Interceptor to handle responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 403 && error.response?.data?.inactive) {
            // Account deactivated - Clear session and send to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/#/login?error=inactive';
        }
        return Promise.reject(error);
    }
);

export default api;
