import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Expose env variables to the client
  // Variables prefixed with VITE_ are exposed to the client
  envPrefix: "VITE_",
});
