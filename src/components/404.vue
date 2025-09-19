<template>
  <v-container class="fill-height text-center" fluid>
    <v-row class="align-center justify-center">
      <v-col cols="12">
        <div class="text-h2 font-weight-bold mb-8">404</div>
        <div class="text-h5 mb-6">抱歉，您访问的页面不存在</div>
        <div class="text-body-1 mb-8">请检查您输入的网址是否正确，或返回首页继续浏览</div>
        <v-btn 
          color="primary" 
          size="large" 
          prepend-icon="mdi-home"
          @click="$router.push('/')"
        >
          返回首页
        </v-btn>
      </v-col>
      
      <!-- 可视化元素 -->
      <!-- <v-col cols="12" class="mt-12">
        <v-sheet 
          elevation="0" 
          rounded 
          class="pa-6 d-inline-block"
          style="background-color: rgba($color: #6c757d, $alpha: 0.1)"
        >
          <v-icon icon="mdi-alert-octagon" size="64" color="secondary"></v-icon>
        </v-sheet>
      </v-col> -->
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<style scoped>
/* 添加一些自定义样式 */
.text-h2 {
  font-size: 8rem !important;
}

.v-sheet {
  transition: all 0.3s ease-in-out;
}

.v-sheet:hover {
  transform: scale(1.05);
}
</style>