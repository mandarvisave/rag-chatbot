import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const DEFAULT_BACKEND_URL = 'https://rag-chatbot-psx6.onrender.com';

function backendOrigin(value) {
  const url = new URL(value || DEFAULT_BACKEND_URL);
  return url.origin;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: backendOrigin(env.VITE_API_URL),
          changeOrigin: true,
        },
      },
    },
  };
});
