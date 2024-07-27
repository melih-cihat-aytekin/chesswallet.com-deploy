import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

dotenv.config(); // .env dosyasını yükle

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': process.env
  },  
  server: {
    port: parseInt(process.env.VITE_PORT) || 3000 // process.env.PORT yerine direkt olarak kullanabilirsiniz
  },
});