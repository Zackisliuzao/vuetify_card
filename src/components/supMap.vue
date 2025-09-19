<template>
    <div style="width: 100%; height: 100%;">
        <!-- <div style=" z-index: 99; top: 30px; left: 30px; margin-top: 20px;"> -->
        <v-row style="margin-top: 15px;">
            <v-col cols="1">
                <v-btn @click="startDraw('point')" :disabled="mode === 'point'">画点</v-btn>
            </v-col>
            <v-col cols="1">
                <v-btn @click="startDraw('line')" :disabled="mode === 'line'">画线</v-btn>
            </v-col>
            <v-col cols="1">
                <v-btn @click="startDraw('polygon')" :disabled="mode === 'polygon'">画面</v-btn>
            </v-col>
            <v-col cols="6">
                <span v-if="showTip" style="margin-left:12px; color:orange;">{{ tipText }}</span>
                <span v-if="showLength" style="margin-left: 24px; color:deepskyblue;">
                    长度：{{ lengthText }} km
                </span>
                <span v-if="showArea" style="margin-left: 24px; color:limegreen;">
                    面积：{{ areaText }} km²
                </span>
            </v-col>
        </v-row>
        <v-row>
            <!-- </div> -->
            <div id="cesiumContainer" style="width: 100%; height: 100%; position: relative;"></div>
        </v-row>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

let viewer: Cesium.Viewer
let handler: Cesium.ScreenSpaceEventHandler | null = null

const mode = ref<'point' | 'line' | 'polygon' | ''>('')
const tipText = ref('')
const showTip = ref(false)
const showLength = ref(false)
const lengthText = ref('')
const showArea = ref(false)
const areaText = ref('')

let activeEntities: Cesium.Entity[] = []

function clearDraw() {
    activeEntities.forEach(e => viewer.entities.remove(e))
    activeEntities = []
    showLength.value = false
    showArea.value = false
}

// --- START: 主体逻辑 ---
function startDraw(drawType: 'point' | 'line' | 'polygon') {
    mode.value = drawType
    tipText.value = drawType === 'point'
        ? '单击地图添加点'
        : (drawType === 'line'
            ? '单击添加线节点，双击结束'
            : '单击添加面节点，双击结束')
    showTip.value = true
    clearDraw()
    if (handler) handler.destroy()
    handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)

    // 点
    if (drawType === 'point') {
        handler.setInputAction(clickEvt => {
            const pos = viewer.scene.pickPosition(clickEvt.position)
            if (!pos) return
            const entity = viewer.entities.add({
                position: pos,
                point: { pixelSize: 12, color: Cesium.Color.YELLOW }
            })
            activeEntities.push(entity)
            tipText.value = '点已添加'
            setTimeout(() => { showTip.value = false; mode.value = '' }, 1200)
            handler && handler.destroy()
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
        return
    }

    // 线和面都用下面这套
    let tempPositions: Cesium.Cartesian3[] = []
    let tempLine: Cesium.Entity | null = null
    let tempPoly: Cesium.Entity | null = null

    handler.setInputAction(clickEvt => {
        const pos = viewer.scene.pickPosition(clickEvt.position)
        if (!pos) return
        tempPositions.push(pos)

        // 线：画polyline；面：画polyline预览
        if (!tempLine) {
            tempLine = viewer.entities.add({
                polyline: {
                    positions: new Cesium.CallbackProperty(() => tempPositions, false),
                    width: 3,
                    material: Cesium.Color.DEEPSKYBLUE
                }
            })
            activeEntities.push(tempLine)
        }
        if (drawType === 'line') updateLength(tempPositions)
        if (drawType === 'polygon') updateArea(tempPositions)
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    // 鼠标移动时预览
    handler.setInputAction(moveEvt => {
        if (tempPositions.length === 0) return
        const pos = viewer.scene.pickPosition(moveEvt.endPosition)
        if (!pos) return
        const tempShowPositions = [...tempPositions, pos]
        if (drawType === 'line') updateLength(tempShowPositions)
        if (drawType === 'polygon') updateArea(tempShowPositions)
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    // 双击结束：生成实体
    handler.setInputAction(() => {
        if (drawType === 'line') {
            if (tempPositions.length >= 2) {
                // 真正生成 polyline
                const entity = viewer.entities.add({
                    polyline: {
                        positions: [...tempPositions],
                        width: 3,
                        material: Cesium.Color.DEEPSKYBLUE
                    }
                })
                activeEntities.push(entity)
            }
            showLength.value = false
        }
        if (drawType === 'polygon') {
            if (tempPositions.length >= 3) {
                // 真正生成 polygon
                const entity = viewer.entities.add({
                    polygon: {
                        hierarchy: [...tempPositions],
                        material: Cesium.Color.fromCssColorString('limegreen').withAlpha(0.4),
                        outline: true,
                        outlineColor: Cesium.Color.LIME
                    }
                })
                activeEntities.push(entity)
            }
            showArea.value = false
        }
        // 清理临时polyline
        if (tempLine) viewer.entities.remove(tempLine)
        tempPositions = []
        tempLine = null
        handler && handler.destroy()
        showTip.value = false
        mode.value = ''
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
}
// --- END: 主体逻辑 ---

// --- 长度、面积 ---
function updateLength(posArr: Cesium.Cartesian3[]) {
    let len = 0
    for (let i = 1; i < posArr.length; ++i) {
        len += Cesium.Cartesian3.distance(posArr[i - 1], posArr[i])
    }
    showLength.value = posArr.length > 1
    lengthText.value = (len / 1000).toFixed(3)
}
function updateArea(posArr: Cesium.Cartesian3[]) {
    showArea.value = posArr.length > 2
    if (posArr.length < 3) { areaText.value = ''; return }
    const degArr = posArr.map(pos => Cesium.Cartographic.fromCartesian(pos))
    const coords = degArr.map(d => [Cesium.Math.toDegrees(d.longitude), Cesium.Math.toDegrees(d.latitude)])
    areaText.value = (computePolygonArea(coords) / 1e6).toFixed(3)
}
function computePolygonArea(coords: [number, number][]) {
    if (coords.length < 3) return 0
    let total = 0
    for (let i = 0; i < coords.length; i++) {
        const [lng1, lat1] = coords[i]
        const [lng2, lat2] = coords[(i + 1) % coords.length]
        total += Cesium.Math.toRadians(lng2 - lng1) * (2 + Math.sin(Cesium.Math.toRadians(lat1)) + Math.sin(Cesium.Math.toRadians(lat2)))
    }
    return Math.abs(total * 6378137.0 * 6378137.0 / 2.0)
}

// --- Cesium初始化与卸载 ---
onMounted(async () => {
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyMjFjMjAyNy1hNDBlLTRhYzEtODExNy1iZDEwNTg2NjFjMjEiLCJpZCI6MzE0MDIzLCJpYXQiOjE3NTA0MDg4Njl9.7N7L05AE24oWMzOWCjMBxxhnX6pCNicziFecuovAmRY'
    viewer = new Cesium.Viewer('cesiumContainer', {
        terrain: Cesium.Terrain.fromWorldTerrain({ requestWaterMask: true, requestVertexNormals: true }),
        scene3DOnly: true,
        selectionIndicator: false,
        baseLayerPicker: false,
    })
    viewer.scene.debugShowFramesPerSecond = true
    await Cesium.IonImageryProvider.fromAssetId(3).then(layer =>
        viewer.imageryLayers.addImageryProvider(layer)
    )
    viewer.scene.globe.depthTestAgainstTerrain = true
    viewer.scene.globe.enableLighting = true
})
onUnmounted(() => {
    if (handler) handler.destroy()
    if (viewer) viewer.destroy()
})
</script>
