import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"), // Alias for src
            "components": path.resolve(__dirname, "src/components"),
            "utils": path.resolve(__dirname, "src/utils"),
            "assets": path.resolve(__dirname, "src/assets")
        },
    },
});