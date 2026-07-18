import axios from 'axios';

// Create an Axios instance
const axiosInstance = axios.create({
    baseURL: 'http://localhost:3001', // Replace with your backend base URL
    timeout: 10000, // Timeout in milliseconds (10 seconds)
    headers: {
        'Content-Type': 'application/json' // Default headers (adjust as needed)
    }
});

// Add a request interceptor (Optional, e.g., for adding auth tokens)
axiosInstance.interceptors.request.use(
    (config) => {
        // Example: Add authorization token if needed
        const token = localStorage.getItem('authToken'); // Replace with your token logic
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        // Handle request error
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add a response interceptor for error logging
axiosInstance.interceptors.response.use(
    (response) => {
        // Return response data directly
        return response;
    },
    (error) => {
        // Handle response errors and log them
        if (error.response) {
            // Server responded with a status other than 2xx
            console.error('Response error:', {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers
            });
        } else if (error.request) {
            // No response received
            console.error('No response received:', error.request);
        } else {
            // Something else happened during setup
            console.error('Axios error:', error.message);
        }

        // Optionally, display a user-friendly error message
        alert('An error occurred. Please try again.');

        return Promise.reject(error);
    }
);

export default axiosInstance;
