import request from "../utils/request.js"



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