<template>
    <v-row>
        <v-col cols="3" v-for="device in deviceStore.devices" :key="device.id">
            <MyCard :device="device" />
        </v-col>
    </v-row>
    <v-row align="center">
        <v-col cols="8">
            <MySheet />
        </v-col>
        <v-col cols="4">
            <MyForm />
        </v-col>
    </v-row>
    <v-row>
        <v-col cols="12">
            <MyChart />
        </v-col>
    </v-row>
    <div>
        <orgces />
    </div>
    <!-- <v-row cols="12" justify="end">
        <MyChat />
    </v-row> -->
</template>

<script setup lang="ts">
import MyForm from "./myForm.vue"
import orgces from "./CesiumOfferice.vue"
import { useDeviceStore } from '@/stores/useDeviceStore'
import { onMounted } from 'vue'
import MySheet from './mySheet.vue';
import MyChart from './myChart.vue';

const deviceStore = useDeviceStore()

onMounted(async () => {
  await deviceStore.fetchDevicesFromAPI()
})
</script>
<style scoped>

</style>