import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/fakepedia/", // <-- Change this to whatever your GitHub repo name is
});
