<template>
  <v-form ref="form" v-model="valid" style="width: 100%">
    <v-container>
      <v-row>
        <v-col cols="4">
          <v-text-field v-model="name" :rules="[v => !!v || '必填']" label="设备名称" required></v-text-field>
        </v-col>

        <v-col cols="4">
          <v-select 
            v-model="status" 
            :items="[
              { text: '正常', value: 0 },
              { text: '预警', value: 1 },
              { text: '危险', value: 2 }
            ]"
            item-title="text"
            item-value="value"
            :rules="[v => v !== null || '必填']" 
            label="状态"
            required
          ></v-select>
        </v-col>

        <v-col cols="4">
          <v-text-field v-model="position" :rules="[v => !!v || '必填']" label="位置" required></v-text-field>
        </v-col>
      </v-row>
      <v-row justify="center">
        <!-- 提交按钮 -->
        <!-- <v-row justify="center"> -->
        <v-col cols="4">
          <v-btn class="mt-2" color="success" @click="validate" block>验证</v-btn>
        </v-col>
        <v-col cols="4">
          <v-btn class="mt-2" @click="submitForm" block>提交</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import { useDeviceStore } from '@/stores/useDeviceStore'

// 表单状态
const valid = ref(false)
const form = ref()
const name = ref('')
const status = ref<number | null>(null)
const position = ref('')
const deviceStore = useDeviceStore()

async function validate() {
  const { valid } = await form.value.validate()
}

async function submitForm() {
  const { valid } = await form.value.validate()

  if (valid) {
    try {
      await axios.post('http://127.0.0.1:8080/api/create-device', {
        name: name.value,
        status: status.value,
        position: position.value
      })
      alert('创建成功')
      deviceStore.fetchDevicesFromAPI()
    } catch (error) {
      console.error('创建设备失败:', error)
      alert('创建失败，请检查输入或联系管理员')
    }
  } else {
    alert('请完成所有必填项')
  }
}
</script>