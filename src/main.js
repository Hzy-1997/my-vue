/*
 * @Descripttion: 
 * @version: 
 * @Author: sueRimn
 * @Date: 2025-07-22 16:21:32
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-02-05 14:18:43
 */
import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'

// 引入图标字体
import './assets/iconfont/iconfont.css'

// 引入element-plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 引入pinia 状态管理
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { createPinia } from 'pinia'
const pinia = createPinia()

// // 引入组件全局注册
import SvgIcon from "./components/IconSelect/svgIcon.vue"
// // 导入 SVG 图标注册器，这是 vite-plugin-svg-icons 插件所需要的
// import 'virtual:svg-icons-register'



const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}




// 创建 Pinia 实例，并使用持久化插件
pinia.use(piniaPluginPersistedstate);
app.use(pinia)
app.use(router)
app.use(ElementPlus, {
    locale: zhCn,
});

app.component('svg-icon', SvgIcon);
















app.mount('#app')
