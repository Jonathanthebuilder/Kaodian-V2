import { defineConfig } from "vite";

// 使用相对路径，便于同时兼容：
// - https://<user>.github.io/<repo>/
// - 自定义域名根路径（如 https://kaodian.example.com/）
export default defineConfig({
  base: "./",
  publicDir: "public",
});
