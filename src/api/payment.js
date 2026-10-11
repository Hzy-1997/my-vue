/*
 * @描述: 
 * @版本: 
 * @作者: 
 * @日期: ${year}-${month}-${day}
 * @最后编辑者: sueRimn
 * @最后编辑时间: ${year}-${month}-${day} ${hour}:${minute}:${second}
 */
/*
 * @描述: 
 * @版本: 
 * @作者: 
 * @日期: ${year}-${month}-${day}
 * @最后编辑者: sueRimn
 * @最后编辑时间: ${year}-${month}-${day} ${hour}:${minute}:${second}
 */
/*
 * @描述: 
 * @版本: 
 * @作者: 
 * @日期: ${year}-${month}-${day}
 * @最后编辑者: sueRimn
 * @最后编辑时间: ${year}-${month}-${day} ${hour}:${minute}:${second}
 */
import { request, downloadFile } from "../utils/request.js";


// 获取订单号
export const getOrderNo = (params) => {
    return request({
        url: "/alipay/createOrder",
        method: "post",
        data: params
    })
}



// 支付（已迁移到 /public 前缀，所有业务共用）
export const payment = (params) => {
    return request({
        url: "/public/payment",
        method: "post",
        data: params
    })
}

// 获取订单列表
export const getOrderList = (params) => {
    return request({
        url: "/alipay/queryOrderList",
        method: "get",
        params: params
    })
}


// 退款（已迁移到 /public 前缀，统一处理票务/套餐/酒店等所有业务退款）
export const refund = (params) => {
    return request({
        url: "/public/refund",
        method: "post",
        data: params
    })
}

//退款列表
export const refundList = (params) => {
    return request({
        url: "/alipay/refundList",
        method: "get",
        params: params
    })
}

// 导出订单EXCEL
export const exportOrder = (params, fileName) => {
    return downloadFile({
        url: "/alipay/exportOrder",
        method: "post",
        data: params,
    }, fileName)
}
