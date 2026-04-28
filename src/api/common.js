
import { request } from "../utils/request.js";


// 图片上传
export const uploadImg = (data) => {
    return request({
        url: "/ticket/uploadImg",
        method: "post",
        data,
    })
}


// 图片删除
export const deleteImg = (data) => {
    return request({
        url: "/ticket/deleteImg",
        method: "post",
        data,
    })
}
