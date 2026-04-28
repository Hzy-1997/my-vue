/*
 * @描述: 
 * @版本: 
 * @作者: 
 * @日期: ${year}-${month}-${day}
 * @最后编辑者: sueRimn
 * @最后编辑时间: ${year}-${month}-${day} ${hour}:${minute}:${second}
 */
import { request } from "../utils/request.js";

// 酒店操作接口
export const hotelOperation = (data) => {
    return request({
        url: '/hotel/hotelOperation',
        method: 'post',
        data
    })
}

// 获取酒店列表
export const getHotelList = (data) => {
    return request({
        url: '/hotel/getHotelList',
        method: 'get',
        data
    })
}

// 房型操作接口
export const roomOperation = (data) => {
    return request({
        url: '/hotel/roomOperation',
        method: 'post',
        data
    })
}

// 获取房型列表
export const getRoomTypeList = (data) => {
    return request({
        url: '/hotel/roomTypeList',
        method: 'get',
        data
    })
}

// 套餐操作接口
export const packageOperation = (data) => {
    return request({
        url: '/hotel/packageOperation',
        method: 'post',
        data
    })
}


// 获取套餐列表
export const getRoomPackageList = (data) => {
    return request({
        url: '/hotel/packageList',
        method: 'get',
        data
    })
}

// 套餐价格日期规则配置
export const packagePriceDate = (data) => {
    return request({
        url: '/hotel/priceOperation',
        method: 'post',
        data
    })
}

// 获取套餐价格日期规则信息
export const getPackagePriceDateRule = (data) => {
    return request({
        url: '/hotel/getPriceRule',
        method: 'get',
        data
    })
}

// 获取套餐价格日期
export const getPackagePriceDate = (data) => {
    return request({
        url: '/hotel/getDatePrice',
        method: 'get',
        data
    })
}

// 修改单个日期
export const changeDatePrice = (data) => {
    return request({
        url: '/hotel/updateDatePrice',
        method: 'post',
        data
    })
}