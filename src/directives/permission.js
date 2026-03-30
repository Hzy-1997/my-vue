/*
 * @描述: 
 * @版本: 
 * @作者: 
 * @日期: ${year}-${month}-${day}
 * @最后编辑者: sueRimn
 * @最后编辑时间: ${year}-${month}-${day} ${hour}:${minute}:${second}
 */
import { useStorage } from '../store/storage.js'

/**
 * 检查权限的函数
 * @param {string} permission - 权限标识
 * @param {Array} menuList - 菜单列表
 * @param {Array} actionList - 权限列表
 * @returns {boolean} - 是否有权限
 */
export function checkPermission(permission, menuList, actionList) {

    // 检查actionList中的权限
    if (actionList && actionList.includes(permission)) {
        console.log("有没有权限")
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

/**
 * 权限指令 v-has
 * 用法: v-has="'user:add'"
 */
export const permissionDirective = {
    mounted(el, binding) {
        console.log("指令绑定的值", binding.value)
        console.log("指令元素", el)
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
}

export default permissionDirective
