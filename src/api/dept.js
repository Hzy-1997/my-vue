
import request from "../utils/request.js"

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