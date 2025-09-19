<template>
  <v-container>
    <v-row>
      <v-col>
        <v-btn class="mt-4" @click="sendRequest" color="primary">发送请求</v-btn>

        <v-snackbar v-model="snackbar.show" :timeout="3000" color="red" multi-line>
          {{ snackbar.message }}
        </v-snackbar>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import axios from "axios";
import { ref } from "vue";
// import { testRequest } from "@/api/testApi";

const snackbar = ref({
  show: false,
  message: "",
});

const sendRequest = async () => {
  try {
    const res = await axios.get('http://127.0.0.1:8080/api/devices');
    console.log("请求成功:", res.data);
    snackbar.value.message = "操作成功！";
    snackbar.value.show = true;
  } catch (err: any) {
    // 这里接收统一处理过的错误
    snackbar.value.message = err.message || "请求失败";
    snackbar.value.show = true;
  }
};
</script>
