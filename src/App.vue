<template>
  <v-layout class="rounded rounded-md border">
    <v-app-bar title="设备监控"></v-app-bar>
    <MyNav />
    <v-main height="flex-grow-1">
      <v-container>
        <!-- <v-row>
          <v-col cols="2" v-for="device in deviceStore.devices" :key="device.id">
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
        </div> -->
        <v-row cols="12" justify="end">
          <MyChat />
        </v-row>
        <router-view></router-view>
      </v-container>
    </v-main>
    <StagewiseToolbar :config="{ plugins: [VuePlugin] }" />
  </v-layout>
</template>

<script setup lang="ts">
import MyNav from './components/myNav.vue';
import MyForm from "./components/myForm.vue"
import MyChat from "./components/myChat.vue";
import orgces from "./components/CesiumOfferice.vue"
import { useDeviceStore } from '@/stores/useDeviceStore'
import { onMounted } from 'vue'
import MySheet from './components/mySheet.vue';
import MyChart from './components/myChart.vue';
import { StagewiseToolbar } from '@stagewise/toolbar-vue'
import VuePlugin from '@stagewise-plugins/vue'
// import VuCesium from 'vue-cesium'

// const deviceStore = useDeviceStore()

// const viewer = new Cesium.Viewer("cesiumContainer", {
//   baseLayer: Cesium.ImageryLayer.fromWorldImagery({
//     style: Cesium.IonWorldImageryStyle.AERIAL_WITH_LABELS,
//   }),
//   baseLayerPicker: false,
// });

// onMounted(async () => {
//   await deviceStore.fetchDevicesFromAPI()
// })
</script>

<style scoped></style>