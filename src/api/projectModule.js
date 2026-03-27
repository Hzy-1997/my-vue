
import request from "../utils/request.js"

// 策略功能操作
export const strategyOperate = (data) => {
    return request({
        url: "/strategy/strategyOperate",
        method: "post",
        data
    })
}
export const strategyList = (data) => {
    return request({
        url: "/strategy/strategyList",
        method: "get",
        params: data
    })
}