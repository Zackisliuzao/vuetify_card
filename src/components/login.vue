<template>
  <v-container class="text-center">
    <h2>当前认证状态：{{ authStatus }}</h2>

    <!-- <v-btn color="success" @click="setAuth(true)" class="ma-2">开启 Auth</v-btn>
    <v-btn color="error" @click="setAuth(false)" class="ma-2">关闭 Auth</v-btn> -->
    <v-btn color="primary" @click="toggleAuth" class="ma-2">切换 Auth</v-btn>
  </v-container>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/userAuthor'

const store = useAuthStore()
const router = useRouter()
const route = useRoute()

const authStatus = computed(() => (store.Auth ? '已认证' : '未认证'))

function setAuth(value: boolean) {
  store.setAuth(value)
}

function toggleAuth() {
  store.toggleAuth()
  const redirect = (route.query.redirect as string) 
  router.push(redirect)
}
</script>