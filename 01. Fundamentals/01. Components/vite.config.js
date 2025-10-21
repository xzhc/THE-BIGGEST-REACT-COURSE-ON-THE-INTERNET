//vite.config.js

//从vite包导入defineConfig函数
//作用：提供类型提示和配置验证
import { defineConfig } from "vite";

//从Vite的React插件导入react函数
//作用：让Vite支持React JSX和Fast Refresh
import react from "@vitejs/plugin-react";

//导出配置对象
export default defineConfig({
  //插件数组：启用React支持
  plugins: [react()],
  //开发服务器配置
  server: {
    port: 3000, //端口号（默认5173）
    open: true, //启动时自动打开浏览器
  },
});
