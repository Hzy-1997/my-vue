/*
 * @描述: 
 * @版本: 
 * @作者: 
 * @日期: ${year}-${month}-${day}
 * @最后编辑者: sueRimn
 * @最后编辑时间: ${year}-${month}-${day} ${hour}:${minute}:${second}
 */
import { request } from "../utils/request.js";

// 票务操作
export const ticketOperate = (data) => {
    return request({
        url: '/ticket/operate',
        method: 'post',
        data
    })
}

// 票务列表
export const ticketList = (data) => {
    return request({
        url: '/ticket/list',
        method: 'get',
        data
    })
}

// 座位管理
export const seatManage = (data) => {
    return request({
        url: '/ticket/seatManage',
        method: 'post',
        data
    })
}

// 查询座位列表
export const getSeatList = (data) => {
    return request({
        url: '/ticket/getSeatList',
        method: 'get',
        data
    })
}

// 票务价格配置
export const operatePrice = (data) => {
    return request({
        url: '/ticket/operatePrice',
        method: 'post',
        data
    })
}

// 获取票务日期价格（日历预览）
export const getTicketDatePrices = (data) => {
    return request({
        url: '/ticket/getTicketDatePrices',
        method: 'get',
        data
    })
}
