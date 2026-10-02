import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // 部署在 https://scs.hrbszygs.cn/labor/ 子路径下，资源引用需带此前缀
  base: '/labor/',
  plugins: [vue()],
  build: {
    outDir: 'labor',
  },
})
