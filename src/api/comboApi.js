/*
 * @描述: 
 * @版本: 
 * @作者: 
 * @日期: ${year}-${month}-${day}
 * @最后编辑者: sueRimn
 * @最后编辑时间: ${year}-${month}-${day} ${hour}:${minute}:${second}
 */
import { request } from "../utils/request.js";



// 操作套餐分类
export const operateCombo = (data) => {
    return request({
        url: "/package/comboOperation",
        method: "post",
        data
    });
};

// 获取主套餐列表
export const getPrimaryComboList = (data) => {
    return request({
        url: "/package/comboList",
        method: "get",
        params: data
    });
};


// 操作套餐商品
export const operateComboItem = (data) => {
    return request({
        url: "/package/productOperation",
        method: "post",
        data
    });
};

// 获取套餐商品列表
export const getComboItemList = (data) => {
    return request({
        url: "/package/productList",
        method: "get",
        params: data
    });
};

// 配置价格规则表
export const configurePriceRule = (data) => {
    return request({
        url: "/package/createTicketPriceRule",
        method: "post",
        data
    });
};


