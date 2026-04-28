/*
 * @描述: 
 * @版本: 
 * @作者: 
 * @日期: ${year}-${month}-${day}
 * @最后编辑者: sueRimn
 * @最后编辑时间: ${year}-${month}-${day} ${hour}:${minute}:${second}
 */
import { request } from "../utils/request.js";

// 部门操作接口
export const deptOperate = (data) => {
    return request({
        url: "/dept/deptOperate",
        method: "post",
        data
    })
}


// 获取部门列表
export const getDeptList = (params) => {
    return request({
        url: "/dept/deptList",
        method: "get",
        params
    })
}