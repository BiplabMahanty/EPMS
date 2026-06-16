import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  const HOST = process.env.VITE_HOST || 'localhost';
  const PORT = Number(process.env.VITE_PORT) || 5173;
  const BACKEND_URL = process.env.VITE_BACKEND_URL || 'http://localhost:5000';

  return defineConfig({
    plugins: [react()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    server: {
      host: HOST,
      port: PORT,

      proxy: {
        '/api': {
          target: BACKEND_URL,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },

    preview: {
      host: HOST,
      port: PORT,
    },
  });
};