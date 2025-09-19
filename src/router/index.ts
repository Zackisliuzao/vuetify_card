/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

import { setupLayouts } from 'virtual:generated-layouts'
// Composables
import { createRouter, createWebHistory } from 'vue-router/auto'
// import { routes } from 'vue-router/auto-routes'
import type { RouteRecordRaw } from 'vue-router'
import MyEarth from '@/components/CesiumOfferice.vue';
import MyForm from '@/components/myForm.vue';
import MySheet from '@/components/mySheet.vue';
import Myhome from '@/components/myhome.vue';
import MyChart from '@/components/myChart.vue';
import UseCard from '@/components/useCard.vue';
import NotFound from '@/components/404.vue';
import type { RouteLocationRaw } from 'vue-router';
import Login from '@/components/login.vue';
import Ws from '@/components/SheetWebsocket.vue';
import { useAuthStore } from '@/stores/userAuthor'
import DyForm from '@/components/DynamicDeviceConfigForm.vue'
import supMap from '@/components/supMap.vue'
import error from '@/components/Error.vue'
import routerTest from '@/components/routerTest.vue'
import MyTest from '@/components/myTest.vue'



const routes: RouteRecordRaw[] = [
  { path: '/', name: 'Home', component: Myhome },
  { path: '/card', name: 'Card', component: UseCard },
  { path: '/chart', name: 'Chart', component: MyChart },
  { path: '/earth', name: 'Earth', component: MyEarth, meta: { requiresAuth: true } },
  { path: '/form', name: 'Form', component: MyForm },
  { path: '/sheet', name: 'Sheet', component: MySheet },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
  { path: '/login', name: 'Login', component: Login },
  { path: '/ws', name: 'Websocket', component: Ws },
  { path: '/dynamicForm', name: 'dyForm', component: DyForm },
  { path: '/superMap', name: 'supMap', component: supMap },
  { path: "/error", name: "error", component: error },
  { path: "/router/:id", name: "routerTest", component: routerTest, props: true },
  { path: '/test', name: 'Test', component: MyTest },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // routes: setupLayouts(routes),
  routes
})


router.beforeEach((to, from): RouteLocationRaw | undefined => {
  // 鉴权
  const Authstore = useAuthStore()

  // 类型安全地获取路由名称
  const toName = to.name as string | undefined;
  const fromName = from.name as string | undefined;

  // 路由保护逻辑
  if (!Authstore.Auth && toName == 'Earth') {
    // 将用户重定向到登录页面
    // return { name: 'Login' as typeof to.name }
    return {
      path: '/login',
      // 保存我们所在的位置，以便以后再来
      query: { redirect: to.fullPath },
    }
  }

  // 允许导航
  return undefined
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (localStorage.getItem('vuetify:dynamic-reload')) {
      console.error('Dynamic import error, reloading page did not fix it', err)
    } else {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
