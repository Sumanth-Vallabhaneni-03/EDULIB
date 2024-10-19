import axios from 'axios';

export const axiosInstance = axios.create({
    baseURL: 'https://edulib-backend.vercel.app', // Set the base URL for the API
    headers: {
        authorization: `Bearer ${localStorage.getItem('token')}`
    },
});