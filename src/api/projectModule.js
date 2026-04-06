
import request from "../utils/request.js"

// 攻略功能操作
export const strategyOperate = (data) => {
    return request({
        url: "/strategy/strategyOperate",
        method: "post",
        data
    })
}
// 票务核销员列表
export const writeOffList = (data) => {
    return request({
        url: "/strategy/strategyList",
        method: "get",
        params: data
    })
}