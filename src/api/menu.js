/*
 * @描述: 
 * @版本: 
 * @作者: 
 * @日期: ${year}-${month}-${day}
 * @最后编辑者: sueRimn
 * @最后编辑时间: ${year}-${month}-${day} ${hour}:${minute}:${second}
 */
/*
 * @描述: 
 * @版本: 
 * @作者: 
 * @日期: ${year}-${month}-${day}
 * @最后编辑者: sueRimn
 * @最后编辑时间: ${year}-${month}-${day} ${hour}:${minute}:${second}
 */


import request from "../utils/request.js"

// 操作菜单
/**
 * 菜单操作函数
 * @param {Object} params - 菜单操作参数对象
 * @returns {Promise} - 返回一个Promise对象，包含请求结果
 */
export const menuOperate = (params) => {
    // 使用request函数发送HTTP POST请求到菜单操作接口
    return request({
        url: "/menu/operate",    // 请求的API端点
        method: "post",          // 请求方法为POST
        data: params
    })
}

// 获取菜单列表
/**
 * 获取菜单列表的函数
 * @param {Object} params - 请求参数对象
 * @returns {Promise} - 返回一个Promise对象，包含菜单列表的请求结果
 */
export const menuList = (params) => {
    return request({
        url: "/menu/list",
        method: "get",
        params: params
    })
}


// 菜单权限
export const menuAuth = (params) => {
    return request({
        url: "/menu/permissionOperate",
        method: "post",
        data: params
    })
}

