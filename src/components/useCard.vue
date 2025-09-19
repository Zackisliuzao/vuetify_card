<template>
    <v-row>
        <v-col cols="3" v-for="device in deviceStore.devices" :key="device.id">
            <MyCard :device="device" />
        </v-col>
    </v-row>
</template>

<script setup lang="ts">

import { useDeviceStore } from '@/stores/useDeviceStore'


const deviceStore = useDeviceStore()

onMounted(async () => {
    await deviceStore.fetchDevicesFromAPI()
})
</script>
<style scoped></style>