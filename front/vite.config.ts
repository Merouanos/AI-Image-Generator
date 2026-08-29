import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      usePolling: true,
    },
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://backend:3000",
        changeOrigin: true,
      },
      "/images": {
        target: "http://backend:3000",
        changeOrigin: true,
      },
  }
}});