/*
 * @描述: 轮播图/弹窗管理相关接口
 * @版本:
 * @作者:
 * @日期: ${year}-${month}-${day}
 * @最后编辑者: sueRimn
 * @最后编辑时间: ${year}-${month}-${day} ${hour}:${minute}:${second}
 */

import { request } from "../utils/request.js";

// 轮播图操作（创建/更新/删除）
export const operateBanner = (data) => {
  return request({
    url: "/performance/bannerOperation",
    method: "post",
    data,
  });
};

// 轮播图列表
export const getBannerList = (params) => {
  return request({
    url: "/performance/bannerList",
    method: "get",
    params,
  });
};

// 弹窗操作（创建/更新/删除）
export const operatePopup = (data) => {
  return request({
    url: "/performance/popupOperation",
    method: "post",
    data,
  });
};

// 弹窗列表
export const getPopupList = (params) => {
  return request({
    url: "/performance/popupList",
    method: "get",
    params,
  });
};
