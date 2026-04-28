/*
 * @描述: 
 * @版本: 
 * @作者: 
 * @日期: ${year}-${month}-${day}
 * @最后编辑者: sueRimn
 * @最后编辑时间: ${year}-${month}-${day} ${hour}:${minute}:${second}
 */
import { request } from "../utils/request.js";



// 核销员操作
export const writeOffOperate = (params) => {
    return request({
        url: '/ticket/writeOffOperate',
        method: 'post',
        data: params
    })
}

// 获取核销员列表
export const getWriteOffList = (params) => {
    return request({
        url: '/ticket/writeOffList',
        method: 'get',
        params
    })
}