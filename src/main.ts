// Composables
import { createApp } from 'vue'

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

// Styles
import 'unfonts.css'


import VueCesium from 'vue-cesium'
import 'vue-cesium/dist/index.css'

// 创建应用实例
const app = createApp(App)

// 使用VueCesium插件（通过应用实例注册）
app.use(VueCesium, {
  cesiumPath: 'https://unpkg.com/cesium@latest/Build/Cesium/Cesium.js',
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyMjFjMjAyNy1hNDBlLTRhYzEtODExNy1iZDEwNTg2NjFjMjEiLCJpZCI6MzE0MDIzLCJpYXQiOjE3NTA0MDg4Njl9.7N7L05AE24oWMzOWCjMBxxhnX6pCNicziFecuovAmRY'
})


registerPlugins(app)

app.mount('#app')