<template>
  <div style="width: 100%; height: 100%; position: relative;">
    <div id="cesiumContainer" style="width: 100%; height: 100%; position: relative;"></div>
    <!-- 新增弹窗容器 -->
    <v-expand-transition>
      <div v-if="selectedDeviceId && selectedEntityPosition" :style="{
        position: 'absolute',
        top: `${popupPosition.y + 20}px`,
        left: `${popupPosition.x + 50}px`,
        zIndex: 1000,
        transition: 'top 0.1s, left 0.1s' // 添加平滑过渡效果
      }">

        <my-card :deviceId="selectedDeviceId" :key="selectedDeviceId" />

      </div>
    </v-expand-transition>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, onUnmounted } from 'vue'
import { useDeviceStore } from '@/stores/useDeviceStore'
import MyCard from './myCard.vue' // 引入组件
import mitt from "../utils/mitt";
// import * as Cesium from 'cesium' 

console.log("Cesium", Cesium)

const deviceStore = useDeviceStore()
const selectedDeviceId = ref<number | null>(null) // 跟踪选中设备ID
const popupPosition = ref({ x: 0, y: 0 }) // 弹窗位置
const selectedEntityPosition = ref<Cesium.Cartesian3 | null>(null) // 当前选中实体的位置


let viewer: Cesium.Viewer
let postRenderEventListener: () => void
// declare const Cesium: any

onMounted(async () => {
  Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyMjFjMjAyNy1hNDBlLTRhYzEtODExNy1iZDEwNTg2NjFjMjEiLCJpZCI6MzE0MDIzLCJpYXQiOjE3NTA0MDg4Njl9.7N7L05AE24oWMzOWCjMBxxhnX6pCNicziFecuovAmRY'

  // 创建Cesium Viewer
  viewer = new Cesium.Viewer('cesiumContainer', {
    terrain: Cesium.Terrain.fromWorldTerrain({
      requestWaterMask: true,
      requestVertexNormals: true
    }),
    // 直接设置 terrain 实例
    scene3DOnly: true,
    selectionIndicator: false,
    baseLayerPicker: false,
  })

  // 监听 mitt 事件
  mitt.on('fly-to-device', (data: any) => {
    console.log('接收到 fly-to-device 事件:', data);
    const { longitude, latitude } = data;
    if (longitude !== undefined && latitude !== undefined) {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, 500000), // 飞到指定经纬度，高度500km
        orientation: {
          heading: Cesium.Math.toRadians(0.0),
          pitch: Cesium.Math.toRadians(-90.0),
          roll: 0.0
        },
        duration: 3 // 飞行时间3秒
      });
    }
  })

  // 显示FPS
  viewer.scene.debugShowFramesPerSecond = true;

  // 增加图层
  const layer = viewer.imageryLayers.addImageryProvider(
    await Cesium.IonImageryProvider.fromAssetId(3),
  );

  // ✅ 启用深度测试和光照
  viewer.scene.globe.depthTestAgainstTerrain = true;
  viewer.scene.globe.enableLighting = true;
  console.log(deviceStore.devices)

// 监听设备数据变化
watch(
  () => deviceStore.devices,
  (newDevices) => {
    // 清除现有实体
    viewer.entities.removeAll();
    
    // 重新添加所有设备实体
    newDevices.forEach(city => {
      viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(
          city.longitude !== undefined ? city.longitude : 0, 
          city.latitude !== undefined ? city.latitude : 0, 
          50000
        ),
        point: {
          pixelSize: 20,
          color: Cesium.Color.RED.withAlpha(0.8),
          outlineColor: Cesium.Color.YELLOW,
          outlineWidth: 4,
        },
        label: {
          text: city.position,
          font: '16px sans-serif',
          horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(15, 0),
        },
        _cityData: city.id
      });
    });
  },
  { deep: true }
)

  // 修改标记创建逻辑
  deviceStore.devices.forEach(city => {
    const entity = viewer.entities.add({

      position: Cesium.Cartesian3.fromDegrees(city.longitude !== undefined ? city.longitude : 0, city.latitude !== undefined ? city.latitude : 0, 50000),
      point: {
        pixelSize: 20,
        color: Cesium.Color.RED.withAlpha(0.8),
        outlineColor: Cesium.Color.YELLOW,
        outlineWidth: 4,
      },
      label: {
        text: city.position,
        font: '16px sans-serif',
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(15, 0),
      },
      _cityData: city.id
    });
  });

  function isPositionInViewport(position: any) {
    // 获取当前视口范围
    let viewport = viewer.camera.computeViewRectangle();
    // 2D模式下拾取不到坐标，viewport返回undefined
    if (typeof viewport === 'undefined') {
      // 获取画布对象
      let canvas = viewer.scene.canvas;
      // 定义画布左上角的2D坐标
      let upperLeft = new Cesium.Cartesian2(0, 0);
      // 定义画布右下角的2D坐标
      let lowerRight = new Cesium.Cartesian2(canvas.clientWidth, canvas.clientHeight);

      // 获取地球椭球体对象
      let ellipsoid = viewer.scene.globe.ellipsoid;
      // 将左上角2D坐标转换为3D世界坐标
      let upperLeft3 = viewer.camera.pickEllipsoid(upperLeft, ellipsoid);
      // 将右下角2D坐标转换为3D世界坐标
      let lowerRight3 = viewer.camera.pickEllipsoid(lowerRight, ellipsoid);

      // 将左上角3D世界坐标转换为弧度坐标
      let upperLeftCartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(upperLeft3);
      // 将右下角3D世界坐标转换为弧度坐标
      let lowerRightCartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(lowerRight3);

      // 获取左上角的经度（弧度）
      let minx = upperLeftCartographic.longitude;
      // 获取右下角的经度（弧度）
      let maxx = lowerRightCartographic.longitude;
      // 获取右下角的纬度（弧度）
      let miny = lowerRightCartographic.latitude;
      // 获取左上角的纬度（弧度）
      let maxy = upperLeftCartographic.latitude;

      // 构建一个表示视口范围的矩形对象
      viewport = new Cesium.Rectangle(minx - 50000, miny - 50000, maxx - 50000, maxy - 50000);
    }

    // 将传入的Cartesian坐标转换为Cartographic坐标
    let cartographic = Cesium.Cartographic.fromCartesian(position);
    // let cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(position);

    // 检查位置是否在视口范围内
    let isVisible = Cesium.Rectangle.contains(viewport, cartographic);
    // 返回结果：true表示在范围内，false表示不在范围内
    return isVisible;
  }



  // 点击事件监听
  viewer.screenSpaceEventHandler.setInputAction((click: any) => {
    // 当用户点击三维场景时触发
    const pickedObject = viewer.scene.pick(click.position)
    // 检查点击对象是否包含实体数据
    if (Cesium.defined(pickedObject) && pickedObject.id) {
      const entity = pickedObject.id
      console.log('点击的实体数据：', entity)
      // 获取点击实体的世界坐标(笛卡尔坐标)
      const entityPosition = entity.position.getValue(viewer.clock.currentTime);
      const screenPosition = viewer.scene.cartesianToCanvasCoordinates(
        entityPosition
      );
      console.log("屏幕坐标:", screenPosition)
      if (entityPosition) {
        popupPosition.value = {
          x: screenPosition.x,
          y: screenPosition.y
        };

        // 判断是否已选择相同实体
        if (selectedDeviceId.value === entity._cityData) {
          selectedDeviceId.value = null; // 再次点击关闭卡片
          selectedEntityPosition.value = null;
          // mitt.emit('highlight-device', null); // 取消高亮
        } else {
          selectedDeviceId.value = entity._cityData; // 更新为新实体的 ID
          selectedEntityPosition.value = entityPosition;
          mitt.emit('highlight-device', entity._cityData); // 发送高亮事件
        }
      }
    } else {
      selectedDeviceId.value = null // 点击空白区域关闭卡片
      selectedEntityPosition.value = null
      mitt.emit('highlight-device', null); // 取消高亮
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

  // 使用 postRender 事件实现实时坐标更新
  postRenderEventListener = viewer.scene.postRender.addEventListener(() => {
    if (selectedEntityPosition.value && selectedDeviceId.value) {
      try {
        // 将世界坐标转换为屏幕坐标
        const screenPosition = viewer.scene.cartesianToCanvasCoordinates(
          selectedEntityPosition.value
        );
        console.log("是否可见:", isPositionInViewport(selectedEntityPosition.value))
        if (screenPosition && isPositionInViewport(selectedEntityPosition.value)) {
          popupPosition.value = {
            x: screenPosition.x,
            y: screenPosition.y
          };
        } else {
          // 如果实体不在视野内，则隐藏卡片
          selectedDeviceId.value = null;
          selectedEntityPosition.value = null;
          mitt.emit('highlight-device', null); // 取消高亮
        }
      }
      catch (error) {
        console.error('坐标转换错误:', error);
      }
    }
  });
})

// 组件卸载时移除监听器
onUnmounted(() => {
  if (viewer && viewer.scene && postRenderEventListener) {
    viewer.scene.postRender.removeEventListener(postRenderEventListener);
  }
  mitt.off('fly-to-device'); // 移除 mitt 事件监听
})
</script>

<style scoped></style>
