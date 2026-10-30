
/*
 * @描述: 游客服务与意见建议相关接口
 * @版本:
 * @作者:
 * @日期: ${year}-${month}-${day}
 * @最后编辑者: sueRimn
 * @最后编辑时间: ${year}-${month}-${day} ${hour}:${minute}:${second}
 */

import { request } from "../utils/request.js";

// ==================== 游客服务 ====================

// 游客服务操作（创建/更新/删除）
export const touristServicesOperation = (data) => {
  return request({
    url: "/serviceSuggestions/touristServicesOperation",
    method: "post",
    data,
  });
};

// 游客服务列表
export const getTouristServicesList = (params) => {
  return request({
    url: "/serviceSuggestions/touristServicesList",
    method: "get",
    params,
  });
};

// ==================== 意见建议 ====================

// 意见反馈操作（更新/删除）
export const opinionsFeedbackOperation = (data) => {
  return request({
    url: "/serviceSuggestions/opinionsFeedbackOperation",
    method: "post",
    data,
  });
};

// 意见反馈列表
export const getOpinionsFeedbackList = (params) => {
  return request({
    url: "/serviceSuggestions/opinionsFeedbackList",
    method: "get",
    params,
  });
};
