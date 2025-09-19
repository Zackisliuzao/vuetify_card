// Utilities
import { defineStore } from 'pinia'
import { ref } from "vue";
import axios from 'axios';

interface Device {
  id: number;
  name: string;
  status: number;
  position: string;
  longitude?: number; // 可选字段
  latitude?: number;  // 可选字段
}





export const useDeviceStore = defineStore('loadDevices', () => {
  const devices = ref<Device[]>([]);
  const loading = ref(true);

  const { cities } = DevicesLocal(); // 引入 CitiesLocal store

  async function fetchDevicesFromAPI() {
    loading.value = true;
    try {
      // const response = await axios.get<Device[]>('http://127.0.0.1:8080/api/devices');
      const response = await axios.get<Device[]>('http://127.0.0.1:8080/api/devices');
      const rawDevices = response.data;

      // 补充经纬度信息
      const enrichedDevices = rawDevices.map(device => {
        const city = cities.find(c => c.position === device.position);
        if (city) {
          return {
            ...device,
            longitude: city.longitude,
            latitude: city.latitude
          };
        }
        return device; // 无匹配城市则保留原数据
      });

      devices.value = enrichedDevices;
      loading.value = false;
    } catch (error) {
      console.error('Failed to fetch devices:', error);
      loading.value = false;
    }
  }

  return { devices, loading, fetchDevicesFromAPI };
});

export const DevicesLocal = defineStore('local', () => {
  const cities = [
    { position: '杭州', id: 1, longitude: 120.1464, latitude: 30.2448 },
    { position: '上海', id: 2, longitude: 121.4737, latitude: 31.2304 },
    { position: '云南', id: 3, longitude: 102.7053, latitude: 25.0428 },
    { position: '日本', id: 4, longitude: 139.6917, latitude: 35.6895 },
    { position: '天津', id: 5, longitude: 117.3616, latitude: 39.3434 },
    { position: '新疆', id: 6, longitude: 87.6166, latitude: 43.7934 },
    { position: '纽约', id: 7, longitude: -74.0060, latitude: 40.7128 },
    { position: '青海', id: 8, longitude: 101.7778, latitude: 36.6232 },
    { position: '武汉', id: 9, longitude: 114.3057, latitude: 30.5928 },
    { position: '西安', id: 10, longitude: 108.9480, latitude: 34.3416 },
    { position: '重庆', id: 11, longitude: 106.5516, latitude: 29.5630 },
    { position: '贵阳', id: 12, longitude: 106.6302, latitude: 26.6477 },
    // 下面的还未使用
    { position: '成都', id: 13, longitude: 104.0668, latitude: 30.5728 },
    { position: '深圳', id: 14, longitude: 114.0579, latitude: 22.5431 },
    { position: '广州', id: 15, longitude: 113.2644, latitude: 23.1291 },
    { position: '南京', id: 16, longitude: 118.7969, latitude: 32.0603 },
    { position: '长沙', id: 17, longitude: 112.9388, latitude: 28.2282 },
    { position: '厦门', id: 18, longitude: 118.0894, latitude: 24.4798 },
    { position: '青岛', id: 19, longitude: 120.3826, latitude: 36.0671 },
    { position: '大连', id: 20, longitude: 121.6147, latitude: 38.9140 },
  ];

  return {
    cities
  };
})
