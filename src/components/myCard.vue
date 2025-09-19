<template>
  <v-card class="mx-auto" max-width="400">
    <!-- loading加载 -->
    <!-- <div v-if="deviceStore.loading" class="d-flex justify-center align-center" style="min-height: 270px;">
      <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
    </div> -->

    
    <!-- 骨架屏 -->
    <div v-if="deviceStore.loading" class="d-flex justify-center align-center" style="min-height: 270px;">
     <v-skeleton-loader :loading="deviceStore.loading" type="list-item-two-line"></v-skeleton-loader>
    </div>


    <!-- 数据内容 -->
    <div v-else>
      <v-card-text v-if="device">
        <div>ID: {{ device.id }}</div>
        <p class="text-h5 font-weight-bold">设备: {{ device.name }}</p>
        <v-chip class="mt-2" :color="statusColor" text-color="white">
          {{ statusText }}
        </v-chip>
        <!-- <p>状态: {{ device.status }}</p> -->
        <p class="mt-2">位置: {{ device.position }}</p>
      </v-card-text>
    </div>
    <v-card-actions>
      <v-btn @click="changeStatus" color="deep-purple-accent-4" text="修改状态" variant="text"></v-btn>
    </v-card-actions>

    <v-snackbar v-model="showDangerSnackbar" timeout="3000" color="error" location="bottom center">
      ⚠ 状态已变为【危险】，请注意！
    </v-snackbar>
  </v-card>
</template>

<script setup lang="ts">
// 保持原有逻辑不变，优化设备数据获取
import { useDeviceStore } from '@/stores/useDeviceStore'
import { ref, watch, computed } from 'vue'
import axios from 'axios'
import debounce from 'lodash.debounce'

const props = defineProps<{
  deviceId?: number
  device?: any
}>()

const deviceStore = useDeviceStore()
const device = ref()
const showDangerSnackbar = ref(false)


watch(() => props.device, (newDevice) => {
  if (newDevice) {
    device.value = newDevice
  } else if (props.deviceId) {
    // 从store获取设备信息
    device.value = deviceStore.devices.find(d => d.id === props.deviceId)
  }
}, { immediate: true })

const deviceStatusTextMap: Record<number, string> = {
  0: '正常',
  1: '预警',
  2: '危险'
}

const deviceStatusColorMap: Record<number, string> = {
  0: 'success',
  1: 'warning',
  2: 'error'
}

const changeStatus = debounce(async () => {
  if (!device.value) return

  // 状态循环：0 → 1 → 2 → 0
  const nextStatus = (device.value.status + 1) % 3

  try {
    // 发送 POST 请求，传递设备 id 和新状态
    const response = await axios.post('http://127.0.0.1:8080/api/update-device-status', {
      id: device.value.id,
      status: nextStatus
    })

    // 假设接口返回的数据中包含更新后的状态
    const updatedStatus = response.data.device.status

    // 更新本地状态
    device.value.status = updatedStatus

    // 如果状态为“危险”，显示 Snackbar
    if (updatedStatus === 2) {
      showDangerSnackbar.value = true
    }
  } catch (error) {
    console.error('更新设备状态失败:', error)
    // 可选：提示用户网络错误或服务不可用
  }
}, 300) // 300ms 的防抖延迟

const statusText = computed(() => {
  const status = device.value?.status
  return deviceStatusTextMap[status] ?? '未知'
})

const statusColor = computed(() => {
  const status = device.value?.status
  return deviceStatusColorMap[status] ?? 'gray'
})
</script>