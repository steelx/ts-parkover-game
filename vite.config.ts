import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [],
  assetsInclude: ["**/*.obj", "**/*.glb", "src/shaders/*.fx"],
  server: {
    port: 8080,
  },
  optimizeDeps: {
    exclude: ['@babylonjs/havok'],
  }
})
