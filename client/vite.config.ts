import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || "/",
  publicDir: "../Assets",
  server: {
    proxy: {
      "/api": "http://localhost:3000",
      "/Assets": "http://localhost:3000",
    },
  },
});
