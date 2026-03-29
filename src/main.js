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

// 权限指令
import { useStorage } from './store/storage.js'

app.directive('has', {
    mounted(el, binding) {
        const storage = useStorage()
        const menuList = storage.menuList
        const actionList = menuList.actionList


        // 获取指令绑定的值（权限标识）
        const permission = binding.value


        // 检查用户是否有权限
        const hasPermission = checkPermission(permission, menuList, actionList)

        if (!hasPermission) {
            // 没有权限，隐藏元素
            el.style.display = 'none'
        }
    },
    // 当指令绑定的值变化时触发
    updated(el, binding) {
        const storage = useStorage()
        const menuList = storage.menuList
        const actionList = menuList.actionList

        const permission = binding.value
        const hasPermission = checkPermission(permission, menuList, actionList)

        if (!hasPermission) {
            console.log("没有权限，隐藏元素")
            el.style.display = 'none'
        } else {
            console.log("有权限，显示元素")
            el.style.display = ''
        }
    }
})

// 检查权限的函数
function checkPermission(permission, menuList, actionList) {

    console.log("菜单列表", menuList)
    console.log("权限列表", actionList)
    console.log("权限标识", permission)

    // 检查actionList中的权限
    if (actionList && actionList.includes(permission)) {
        console.log("有没有权限",)
        return true
    }

    // 检查menuList中的权限
    if (!menuList || !Array.isArray(menuList)) {
        return false
    }

    // 递归检查菜单和权限
    function checkMenu(menus) {
        for (const menu of menus) {
            // 检查当前菜单的权限
            if (menu.permissionFlag === permission || menu.perms === permission) {
                return true
            }
            // 检查子菜单
            if (menu.children && menu.children.length > 0) {
                if (checkMenu(menu.children)) {
                    return true
                }
            }
        }
        return false
    }

    return checkMenu(menuList)
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
