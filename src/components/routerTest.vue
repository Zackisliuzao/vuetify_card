<template>
    <v-row>
        <v-col>
            <!-- 当前路由可以通过 $route 在模板中访问 -->
            User {{ id }}
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

defineProps({
  id: String
})

// 获取当前的路由对象并指定参数类型
// const route = useRoute()
</script>

<style scoped></style>