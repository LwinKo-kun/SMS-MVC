// API Configuration for different environments

const config = {
  // Development environment (Linux PHP server) - localhost
  development: {
    apiBaseUrl: 'http://localhost:8000/api'
  },
  
  // Network development environment (for other devices)
  get network() {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return {
      apiBaseUrl: `${protocol}//${hostname}:8000/api`
    };
  },
  
  // XAMPP/Apache environment
  production: {
    apiBaseUrl: '/api'
  },
  
  // Current environment detection
  get current() {
    const hostname = window.location.hostname;
    const port = window.location.port;

    if (port === '3000') {
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return this.development;
      }
      return this.network;
    }

    return this.production;
  }
};

export default config;