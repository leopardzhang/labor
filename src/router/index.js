import { createRouter, createWebHashHistory } from 'vue-router'
import AdminLayout from '../layout/AdminLayout.vue'

const routes = [
  {
    path: '/',
    component: AdminLayout,
    redirect: '/sites',
    children: [
      {
        path: 'sites',
        name: 'sites',
        component: () => import('../views/SiteManage.vue'),
        meta: { title: '工地管理' },
      },
      {
        path: 'records',
        name: 'records',
        component: () => import('../views/RecordList.vue'),
        meta: { title: '打卡记录' },
      },
    ],
  },
  // 未定义路径统一重定向到工地管理（放在路由表末尾）
  { path: '/:pathMatch(.*)*', redirect: '/sites' },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
})
