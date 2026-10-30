/*
 * @描述: 
 * @版本: 
 * @作者: 
 * @日期: ${year}-${month}-${day}
 * @最后编辑者: sueRimn
 * @最后编辑时间: ${year}-${month}-${day} ${hour}:${minute}:${second}
 */

import { request } from "../utils/request.js";


// 图片上传
export const uploadImg = (data) => {
    return request({
        url: "/public/uploadImg",
        method: "post",
        params: category ? { category } : {},
        data,
    })
}


// 图片删除
export const deleteImg = (data) => {
    return request({
        url: "/public/deleteImg",
        method: "post",
        data,
    })
}
