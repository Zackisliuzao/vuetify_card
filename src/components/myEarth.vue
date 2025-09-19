<template>
  <el-row ref="viewerContainer" class="demo-viewer">
  <vc-viewer
    v-if="show"
    ref="vcViewer"
    :animation="animation"
    :base-layer="false"
    :base-layer-picker="baseLayerPicker"
    :timeline="timeline"
    :fullscreen-button="fullscreenButton"
    :fullscreen-element="fullscreenElement"
    :info-box="infoBox"
    :skyAtmosphere="false"
    :skyBox="false"
    :scene-mode-picker="true"
    :show-credit="showCredit"
    @cesium-ready="onCesiumReady"
    @ready="onViewerReady"
    @left-click="onLeftClick"
    @touch-end="onTouchEnd"
    @destroyed="onDestroyed"
  >
    <vc-navigation :offset="offset" @compass-evt="onNavigationEvt" :other-opts="otherOpts" @zoom-evt="onNavigationEvt"></vc-navigation>
    <vc-entity @click="onEntityClick" :position="{lng: 108, lat: 32}" :point="point" :label="label">
      <vc-graphics-billboard image="https://zouyaoji.top/vue-cesium/favicon.png" :scale="0.5"></vc-graphics-billboard>
      <vc-graphics-rectangle :coordinates="[130, 20, 80, 25]" material="green"></vc-graphics-rectangle>
    </vc-entity>
    <vc-layer-imagery>
      <vc-imagery-provider-tianditu map-style="img_c" token="436ce7e50d27eede2f2929307e6b33c0"></vc-imagery-provider-tianditu>
    </vc-layer-imagery>
    <vc-layer-imagery ref="layerText">
      <vc-imagery-provider-tianditu map-style="cia_c" token="436ce7e50d27eede2f2929307e6b33c0"></vc-imagery-provider-tianditu>
    </vc-layer-imagery>
  </vc-viewer>
  <el-row class="demo-toolbar">
    <el-row>
      <el-button type="danger" round @click="unload">销毁</el-button>
      <el-button type="danger" round @click="load">加载</el-button>
      <el-button type="danger" round @click="reload">重载</el-button>
    </el-row>
    <el-row v-if="!loading">
      <el-switch v-model="animation" active-color="#13ce66" inactive-text="动画"> </el-switch>
      <el-switch v-model="timeline" active-color="#13ce66" inactive-text="时间轴"> </el-switch>
      <el-switch v-model="baseLayerPicker" active-color="#13ce66" inactive-text="基础图层"> </el-switch>
      <el-switch v-model="fullscreenButton" active-color="#13ce66" inactive-text="全屏按钮"> </el-switch>
      <el-switch v-model="infoBox" active-color="#13ce66" inactive-text="信息提示框"> </el-switch>
      <el-switch v-model="showCredit" active-color="#13ce66" inactive-text="版权信息"> </el-switch>
    </el-row>
  </el-row>
</el-row>
</template>

<script>
  import { watch, ref, onMounted } from 'vue'
  export default {
    setup() {
      const loading = ref(false)
      const animation = ref(true)
      const timeline = ref(true)
      const baseLayerPicker = ref(false)
      const fullscreenButton = ref(true)
      const infoBox = ref(true)
      const showCredit = ref(true)
      const fullscreenElement = document.body
      const vcViewer = ref(null)
      const point = ref({
        pixelSize: 28,
        color: 'red'
      })
      const label = ref({
        text: 'Hello World',
        pixelOffset: [0, 150]
      })
      const billboard = ref({})
      const offset = ref([50, 25])
      const otherOpts = ref({
        offset: [0, 32],
        position: 'bottom-right'
      })
      const show = ref(true)

      watch(timeline, val => {
        otherOpts.value.offset = val ? [0, 30] : fullscreenButton.value ? [30, 5] : [0, 5]
      })

      watch(fullscreenButton, val => {
        if (!timeline.value && !val) {
          otherOpts.value.offset = [0, 5]
        } else if (!timeline.value && val) {
          otherOpts.value.offset = [30, 5]
        }
      })

      const onViewerReady = ({ Cesium, viewer, vm }) => {
        console.log('viewer is loaded.', vm)
        vm.vcMitt.on('destroyed', e => {
          console.log('viewer is destroyed', e)
        })
        loading.value = false
        viewer.scene.globe.enableLighting = true
      }
      const onCesiumReady = e => {
        console.log(e)
      }
      const onNavigationEvt = e => {
        console.log(e)
      }
      const onEntityClick = e => {
        console.log(e)
      }
      const onLeftClick = e => {
        console.log(e)
      }
      const onTouchEnd = e => {
        console.log(e)
      }
      const onDestroyed = e => {
        console.log('onDestroyed', e)
      }
      const load = () => {
        // vcViewer.value.load().then(e => {
        //   console.log(e)
        //   loading.value = false
        // })
        show.value = true
      }
      const unload = () => {
        // this.$refs.vcViewer.unload().then(e => {
        //   console.log(e)
        //   this.loading = true
        // })
        show.value = false
      }
      const reload = () => {
        loading.value = true
        vcViewer.value.reload().then(e => {
          console.log(e)
          loading.value = false
        })
      }

      return {
        loading,
        animation,
        timeline,
        baseLayerPicker,
        fullscreenButton,
        infoBox,
        showCredit,
        fullscreenElement,
        vcViewer,
        point,
        label,
        billboard,
        offset,
        otherOpts,
        show,
        onViewerReady,
        onCesiumReady,
        onNavigationEvt,
        onEntityClick,
        onLeftClick,
        onTouchEnd,
        onDestroyed,
        load,
        unload,
        reload
      }
    }
  }
</script>