<template>
    <div id="chart-container"></div>
</template>

<script setup lang="ts">
import { onMounted, computed, watch } from 'vue';
import * as echarts from 'echarts';
import { useDeviceStore } from '@/stores/useDeviceStore';

const deviceStore = useDeviceStore();

const chartData = computed(() => {
    const statusCounts: { [key: number]: number } = {};
    deviceStore.devices.forEach(device => {
        statusCounts[device.status] = (statusCounts[device.status] || 0) + 1;
    });

    const statusMap: { [key: number]: string } = {
        0: '正常',
        1: '预警',
        2: '危险'
    };

    return Object.keys(statusCounts).map(status => ({
        value: statusCounts[Number(status)],
        name: statusMap[Number(status)] || `未知状态 ${status}`
    }));
});

let myChart: echarts.ECharts | null = null;

onMounted(() => {
    const chartDom = document.getElementById('chart-container') as HTMLElement;
    myChart = echarts.init(chartDom);
    updateChart();
});

watch(chartData, () => {
    updateChart();
});

const updateChart = () => {
    if (!myChart) {
        const chartDom = document.getElementById('chart-container') as HTMLElement;
        myChart = echarts.init(chartDom);
    }

    const option = {
        title: {
            text: '设备状态分布',
            left: 'center',
            top: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c}个 (占比{d}%)' // 显示名称、数量、百分比
        },
        series: [
            {
                type: 'pie',
                data: chartData.value,
                radius: ['40%', '70%'],
                label: {
                    show: true,
                    formatter: '{b}: {d}%' // 在饼图上显示名称和百分比
                }
            }
        ],
        legend: {
            orient: 'vertical',
            right: 10,
            // top: 'center',
            bottom: 100,
            formatter: (name: string) => {
                const item = chartData.value.find(d => d.name === name);
                return `${name} (${item?.value}个)`; // 图例显示名称 + 数量
            }
        },
        color: [
            '#cdebd0',
            '#f7d8b3',
            '#dfb6bb',
        ]
    };

    myChart.setOption(option);
};
</script>

<style scoped>
#chart-container {
    width: 600px;
    height: 400px;
}
</style>