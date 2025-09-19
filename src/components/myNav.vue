<template>
  <v-navigation-drawer>
    <v-list nav>
      <v-list-item class="bg-purple-darken-2 text-center text-large" title="菜单栏" link></v-list-item>

      <!-- 子目录 -->
      <v-list-group v-model="groupActive">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" title="菜单1"></v-list-item>
        </template>

        <v-list-item v-for="(item, i) in items" :key="i" :title="item.title" :to="item.to" link></v-list-item>
      </v-list-group>
      <v-list-group v-model="groupActive">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" title="菜单2"></v-list-item>
        </template>

        <v-list-item v-for="(item, i) in items2" :key="i" :title="item.title" :to="item.to" link></v-list-item>
      </v-list-group>
      <v-row justify="center">
        <v-col cols="auto">
          <v-btn class="mt-4" :style="{ borderRadius: '25px' }" @click="jumpRouter">跳转可编程路由</v-btn>

          <!-- 不用vuetify用style -->
          <!-- <v-btn style="margin-left: 64px" @click="jumpRouter">跳转可编程路由</v-btn> -->
           
           <!-- 用的是v-bind的style -->
          <!-- <v-btn :style="{ 'margin-left': '64px' }" @click="jumpRouter">跳转可编程路由</v-btn> -->
        </v-col>
      </v-row>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
// import router from '@/router';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const groupActive = ref(true);
const items = [
  { title: '主页', to: '/' },
  { title: '登录', to: "/login" },
  { title: '设备卡片', to: '/card' },
  { title: '设备图表', to: '/chart' },
  { title: '地球视图', to: '/earth' },
  { title: '设备提交', to: '/form' },
  { title: '设备列表', to: '/sheet' },
  { title: '设备列表ws', to: '/ws' },
  { title: '动态表单', to: '/dynamicForm' },
];

const items2 = [
  { title: '超图测试', to: '/superMap' },
  { title: '错误处理', to: '/error' },
  { title: '路由测试', to: '/router/1' },
  { title: '测试页面', to: '/test' }
];

const jumpRouter = () => {
  router.push({ name: 'routerTest', params: { id: 10 } });
};

</script>

<style scoped>
/* 添加一些样式以更好地显示子目录 */
</style>