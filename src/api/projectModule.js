/*
 * @描述: 
 * @版本: 
 * @作者: 
 * @日期: ${year}-${month}-${day}
 * @最后编辑者: sueRimn
 * @最后编辑时间: ${year}-${month}-${day} ${hour}:${minute}:${second}
 */

import { request } from "../utils/request.js";

// 攻略功能操作
export const strategyOperate = (data) => {
    return request({
        url: "/service/strategyOperate",
        method: "post",
        data
    })
}
// 攻略列表
export const strategyList = (data) => {
    return request({
        url: "/service/strategyList",
        method: "get",
        params: data
    })
}

// 运动功能操作
export const sportsOperate = (data) => {
    return request({
        url: "/service/sportsOperate",
        method: "post",
        data
    })
}
// 运动列表
export const sportsList = (data) => {
    return request({
        url: "/service/sportsList",
        method: "get",
        params: data
    })
}

// 休闲功能操作
export const leisureOperate = (data) => {
    return request({
        url: "/service/leisureOperate",
        method: "post",
        data
    })
}
// 休闲列表
export const leisureList = (data) => {
    return request({
        url: "/service/leisureList",
        method: "get",
        params: data
    })
}

// 餐饮功能操作
export const cateringOperate = (data) => {
    return request({
        url: "/service/cateringOperate",
        method: "post",
        data
    })
}
// 餐饮列表
export const cateringList = (data) => {
    return request({
        url: "/service/cateringList",
        method: "get",
        params: data
    })
}

// 购物功能操作
export const shoppingOperate = (data) => {
    return request({
        url: "/service/shoppingOperate",
        method: "post",
        data
    })
}
// 购物列表
export const shoppingList = (data) => {
    return request({
        url: "/service/shoppingList",
        method: "get",
        params: data
    })
}