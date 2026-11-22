/*
 * @描述: 字典管理相关接口
 * @版本:
 * @作者: sueRimn
 * @日期: 2026-10-30
 * @最后编辑者: sueRimn
 * @最后编辑时间: 2026-10-30
 */

import { request } from "../utils/request.js";

// 字典类型操作（create/update/delete）
export const dictTypeOperate = (data) => {
    return request({
        url: '/dict/dictTypeOperate',
        method: 'post',
        data
    })
}

// 获取字典类型列表
export const getDictTypeList = (params) => {
    return request({
        url: '/dict/getDictTypeList',
        method: 'get',
        params
    })
}

// 字典数据操作（create/update/delete）
export const dictDataOperate = (data) => {
    return request({
        url: '/dict/dictDataOperate',
        method: 'post',
        data
    })
}

// 获取字典数据列表
export const getDictDataList = (params) => {
    return request({
        url: '/dict/getDictDataList',
        method: 'get',
        params
    })
}

// 按字典类型获取启用的字典数据（下拉选项等）
export const getDictDataByType = (params) => {
    return request({
        url: '/dict/getDictDataByType',
        method: 'get',
        params
    })
}
