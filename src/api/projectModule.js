
import request from "../utils/request.js"

// 攻略功能操作
export const strategyOperate = (data) => {
    return request({
        url: "/strategy/strategyOperate",
        method: "post",
        data
    })
}
// 攻略列表
export const strategyList = (data) => {
    return request({
        url: "/strategy/strategyList",
        method: "get",
        params: data
    })
}