import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Only load env vars that start with VITE_
  const env = loadEnv(mode, process.cwd(), "VITE_");

  return {
    plugins: [react()],
    define: {
      // Keeps compatibility with code that reads process.env.*
      // but only exposes VITE_* vars
      "process.env": env,
    },
  };
});
