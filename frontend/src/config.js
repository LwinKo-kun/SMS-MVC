// API Configuration for different environments

const config = {
  // Development environment (Linux PHP server) - localhost
  development: {
    apiBaseUrl: 'http://localhost:8000/api'
  },
  
  // Network development environment (for other devices)
  network: {
    apiBaseUrl: 'http://192.168.26.138:8000/api'
  },
  
  // XAMPP/Apache environment
  production: {
    apiBaseUrl: '/api'
  },
  
  // Current environment detection
  get current() {
    // Check if we're accessing from network (not localhost)
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    // If accessing from network (IP address), use network config
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return this.network;
    }
    
    // Use development mode if running on localhost:3000 (React dev server)
    if (hostname === 'localhost' && port === '3000') {
      return this.development;
    }
    
    // Otherwise use production (XAMPP/Apache)
    return this.production;
  }
};

export default config;