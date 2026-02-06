import axios from 'axios';

const api = axios.create({
    baseURL: '/api', // Relative path since we are serving from same origin
});

// Auth removed

export default api;
