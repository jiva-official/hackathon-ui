interface Config {
  API_URL: string;
  REQUEST_TIMEOUT: number;
  RETRY_COUNT: number;
}

const config: Config = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  REQUEST_TIMEOUT: 30000, // 30 seconds
  RETRY_COUNT: 3,
};

export default config;