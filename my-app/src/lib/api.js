import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
    (config) => {
        // Check both localStorage (client) and cookies (if implemented)
        // For now, simpler localStorage approach for React/Next Client Components
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor to handle 401 (Unauthorized)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Logic to redirect to login or clear token
            if (typeof window !== 'undefined') {
                // localized logout logic or just clear token
                // localStorage.removeItem('token');
                // window.location.href = '/login'; 
            }
        }
        return Promise.reject(error);
    }
);

export default api;
