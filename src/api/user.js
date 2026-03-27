/*
 * @描述: 
 * @版本: 
 * @作者: 
 * @日期: ${year}-${month}-${day}
 * @最后编辑者: sueRimn
 * @最后编辑时间: ${year}-${month}-${day} ${hour}:${minute}:${second}
 */


import request from "../utils/request.js"


/**
 * 用户注册接口函数
 * @param {Object} params - 注册所需的参数对象
 * @returns {Promise} - 返回一个Promise对象，包含请求的结果
 */
export const register = (params) => {
    return request({    // 发起HTTP请求
        url: '/user/userOperate',
        method: 'post',
        data: params,
    });
};


/**
 * 获取用户列表的API请求函数
 * @param {Object} params - 请求参数对象
 * @returns {Promise} 返回一个Promise对象，包含服务器响应的数据
 */
export const userList = (params) => {

    return request({
        url: '/user/list',
        method: 'get',
        params: params,
    });
};

/**
 * 批量删除用户接口函数
 * @param {Object} params - 包含要删除的用户ID列表的参数对象
 * @returns {Promise} - 返回一个Promise对象，包含请求的结果
 */
export const batchDelete = (params) => {
    return request({
        url: '/user/batchDelete',
        method: 'post',
        data: params,
    });
};


/**
 * 获取用户权限信息的API请求函数
 * @param {Object} params - 请求参数对象
 * @returns {Promise} - 返回一个Promise对象，包含服务器响应的数据
 */
export const getUserPermissions = (params) => {
    return request({  // 使用request函数发送HTTP请求
        url: '/user/getUserPermissions',  // 请求的API端点
        method: 'get',
        params: params,
    });
}



