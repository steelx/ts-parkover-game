import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [],
  assetsInclude: ["**/*.fbx", "**/*.glb", "src/shaders/*.fx"],
  server: {
    port: 8080,
  },
})
