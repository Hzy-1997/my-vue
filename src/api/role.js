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


// 操作角色列表
export const roleOperate = (params) => {
    return request({
        url: '/role/roleOperate',
        method: 'post',
        data: params
    })
}

// 获取角色列表
export const getRoleList = (params) => {
    return request({
        url: '/role/roleList',
        method: 'get',
        params
    })
}