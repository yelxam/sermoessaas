export const config = {
    // Uses environment variable or falls back to localhost
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000'
};
