<template>
    <v-data-table-server v-model:items-per-page="itemsPerPage" :headers="headers" :items="serverItems"
        :items-length="totalItems" :loading="loading" :search="search" item-value="id" @update:options="loadItems"
        @click:row="handleRowClick" :row-props="rowProps">

        <template #item.status="{ item }">
            <v-chip :color="statusColorMap[item.status as string]">
                {{ statusTextMap[item.status as string] }}
            </v-chip>
        </template>
        <template v-slot:tfoot>
            <tr>
                <td>
                    <v-text-field v-model="name" class="ma-2" density="compact" placeholder="搜索设备名..."
                        hide-details></v-text-field>
                </td>
                <td>
                    <v-text-field v-model="position" class="ma-2" density="compact" placeholder="搜索位置..."
                        hide-details></v-text-field>
                </td>
            </tr>
        </template>
    </v-data-table-server>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import { useDeviceStore } from '@/stores/useDeviceStore'
import mitt from '@/utils/mitt'

// 定义设备项类型
type DeviceItem = {
    id: number
    name: string
    status: string
    position: string
    longitude: number
    latitude: number
}

const search = ref('')
const serverItems = ref<DeviceItem[]>([])
const loading = ref(true)
const totalItems = ref(0)
const itemsPerPage = ref(5)
const currentPage = ref(1) // 新增：记录当前页码
const highlightedRowId = ref<number | null>(null); // 新增：高亮行ID

// 定义表头类型
type HeaderType = {
    title: string
    align: 'center' | 'end' | 'start'
    key: string
    sortable?: boolean
    width?: string
}

const headers = ref<HeaderType[]>([
    {
        title: '设备ID',
        align: 'start',
        key: 'id',
        sortable: false,
        width: '100px',
    },
    { title: '设备名', key: 'name', align: 'center', sortable: false, width: '300px', },
    { title: '状态', key: 'status', align: 'center', sortable: false, width: '300px', },
    { title: '位置', key: 'position', align: 'start', sortable: false, width: '100px', },
])

const flyToDevice = (item: DeviceItem) => {
    console.log('点击了行:', item);
    const fullDevice = deviceStore.devices.find(d => d.id === item.id);
    if (fullDevice && fullDevice.longitude !== undefined && fullDevice.latitude !== undefined) {
        mitt.emit('fly-to-device', { longitude: fullDevice.longitude, latitude: fullDevice.latitude });
    } else {
        console.warn('未找到设备的经纬度信息或信息不完整:', item);
    }
}

const handleRowClick = (event: Event, { item }: { item: DeviceItem }) => {
    flyToDevice(item);
    highlightedRowId.value = item.id;
};

watch(() => highlightedRowId.value, (newId) => {
    highlightedRowId.value = newId;
});

const rowProps = ({ item }: { item: DeviceItem }) => {
    return {
        class: item.id === highlightedRowId.value ? 'highlighted-row' : '',
    };
};

// 状态映射表
const statusTextMap: Record<string, string> = {
    '0': '正常',
    '1': '预警',
    '2': '危险'
}

const statusColorMap: Record<string, string> = {
    '0': 'success',
    '1': 'warning',
    '2': 'error'
}

// 定义API返回的数据类型
type ApiDeviceItem = {
    id: number
    name: string
    status: string | number
    position: string
}

// 获取 Pinia 的 deviceStore
const deviceStore = useDeviceStore()

function clearDeviceCache() {
  // 清除所有 deviceCache_xxx 的缓存
  Object.keys(localStorage)
    .filter(key => key.startsWith('deviceCache_'))
    .forEach(key => localStorage.removeItem(key));
}

// 监听 devices 的变化
watch(
    () => deviceStore.devices,
    (newDevices) => {
        console.log('设备列表发生变化，正在刷新表格...')
        clearDeviceCache();
        // 保留当前页码并重新加载数据
        loadItems({
            page: currentPage.value,
            itemsPerPage: itemsPerPage.value
        })
    },
    { deep: true }
)



const name = ref('')
const position = ref('')

watch([name, position], () => {
  loadItems({
    page: currentPage.value,
    itemsPerPage: itemsPerPage.value
  })
})

// 缓存操作函数
function setCache(key: string, data: { items: DeviceItem[], total: number }) {
    const cacheData = {
        timestamp: Date.now(),
        data
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
}

function getCache(key: string): { items: DeviceItem[], total: number } | null {
    const cachedStr = localStorage.getItem(key);
    if (!cachedStr) return null;

    const cached = JSON.parse(cachedStr);
    const isExpired = (Date.now() - cached.timestamp) > 24 * 60 * 60 * 1000; // 24小时

    if (isExpired) {
        localStorage.removeItem(key);
        return null;
    }

    return cached.data;
}
// 修改 loadItems 函数
async function loadItems({
    page,
    itemsPerPage
}: {
    page: number;
    itemsPerPage: number;
}) {
    currentPage.value = page;
    loading.value = true;

    const cacheKey = `deviceCache_${page}_${itemsPerPage}_${name.value || ''}_${position.value || ''}`;
    const cached = getCache(cacheKey);

    if (cached) {
        serverItems.value = cached.items;
        totalItems.value = cached.total;
        loading.value = false;
        return;
    }

    try {
        const response = await axios.get('http://127.0.0.1:8080/api/pagination', {
            params: {
                page: page,
                pageSize: itemsPerPage,
                name: name.value,
                position: position.value
            }
        });

        const items = response.data.data.map((item: ApiDeviceItem) => ({
            ...item,
            status: Number(item.status)
        }));

        serverItems.value = items;
        totalItems.value = response.data.total;

        // 写入缓存
        setCache(cacheKey, {
            items,
            total: totalItems.value
        });
    } catch (error) {
        console.error('API 请求失败:', error);
    } finally {
        loading.value = false;
    }
}

// 监听 mitt 事件，用于从 CesiumOfferice.vue 接收高亮请求
onMounted(() => {
    mitt.on('highlight-device', (deviceId: unknown) => {
        const id = typeof deviceId === 'number' ? deviceId : parseInt(deviceId as string, 10);
        if (!isNaN(id)) {
            highlightedRowId.value = id;
            console.log('高亮设备 ID:', id);
        } else {
            highlightedRowId.value = null;
            console.warn('无效的设备ID:', deviceId);
        }
    });
});

onUnmounted(() => {
    mitt.off('highlight-device');
});

</script>

<style scoped>
:deep(.highlighted-row) {
  background: linear-gradient(120deg, #404e8a, #635d5d); /* 渐变红色增强层次 */
  color: white; /* 提升文字对比度 */
  font-weight: bold;
  border-radius: 6px; /* 圆角设计，视觉更柔和 */
  padding-left: 12px; /* 避免文字贴边 */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); /* 添加轻微阴影提升立体感 */
  transition: all 0.3s ease-in-out; /* 平滑过渡动画 */
}
</style>