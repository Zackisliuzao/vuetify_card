<template>
    <v-row>
        <h2>设备实时监控面板</h2>
    </v-row>

    <v-row class="status-indicator">
        连接状态：
        <span :class="statusClass">{{ connectionStatus }}</span>
    </v-row>

    <v-row v-if="deviceDataList.length" dense no-gutters>
        <v-col v-for="device in deviceDataList" :key="device.deviceId" cols="12" sm="8" md="6" lg="4" xl="2"
            class="pa-2">
            <v-card outlined class="fill-height d-flex flex-column">
                <v-card-text>
                    <p><strong>设备ID：</strong>{{ device.deviceId }}</p>
                    <p><strong>状态：</strong>{{ device.status }}</p>
                    <p><strong>温度：</strong>{{ device.temperature.toFixed(1) }} ℃</p>
                </v-card-text>
                <v-card-actions class="mt-auto">
                    <v-btn color="primary" @click="decreaseTemperature(device.deviceId)" :disabled="!isConnected" block>
                        降低温度
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-col>
    </v-row>

    <v-row v-else justify="center" class="ma-4">
        <v-col cols="12" align="center">
            <p>暂无设备数据</p>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface DeviceData {
    deviceId: string
    status: string
    temperature: number
}

const connectionStatus = ref<'已连接' | '已断开'>('已断开')
const deviceDataList = ref<DeviceData[]>([])

let socket: WebSocket | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null

function connectWebSocket() {
    socket = new WebSocket('ws://127.0.0.1:8090/ws')

    socket.onopen = () => {
        connectionStatus.value = '已连接'
    }

    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data) as DeviceData[]
            deviceDataList.value = data
        } catch (error) {
            console.error('数据解析错误:', error)
        }
    }

    socket.onclose = () => {
        connectionStatus.value = '已断开'
        attemptReconnect()
    }

    socket.onerror = (error) => {
        console.error('WebSocket错误', error)
        socket?.close()
    }
}

function attemptReconnect() {
    if (reconnectTimer) return

    reconnectTimer = setTimeout(() => {
        console.log('尝试重连...')
        connectWebSocket()
        reconnectTimer = null
    }, 3000)
}

// 修改：每个设备独立发送降低温度命令
function decreaseTemperature(deviceId: string) {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        console.warn('WebSocket未连接，无法发送数据')
        return
    }

    const payload = {
        type: 'decrease_temperature',
        data: {
            deviceId,
            amount: 5 // 默认减少5度
        }
    }

    socket.send(JSON.stringify(payload))
    console.log('温度减少指令已发送:', payload)
}

onMounted(() => {
    connectWebSocket()
})

onUnmounted(() => {
    if (socket) {
        socket.close()
    }
    if (reconnectTimer) {
        clearTimeout(reconnectTimer)
    }
})

const statusClass = computed(() =>
    connectionStatus.value === '已连接' ? 'connected' : 'disconnected'
)

const isConnected = computed(() => connectionStatus.value === '已连接')
</script>

<style scoped>
.status-indicator {
    margin: 10px 0;
}

.connected {
    color: green;
}

.disconnected {
    color: red;
}
</style>
