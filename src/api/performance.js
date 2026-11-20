
/*
 * @描述: 演出管理相关接口
 * @版本:
 * @作者:
 * @日期: ${year}-${month}-${day}
 * @最后编辑者: sueRimn
 * @最后编辑时间: ${year}-${month}-${day} ${hour}:${minute}:${second}
 */

import { request } from "../utils/request.js";

// 演出操作（创建/更新/删除）
export const operatePerformance = (data) => {
  return request({
    url: "/performance/performanceOperation",
    method: "post",
    data,
  });
};

// 演出列表
export const getPerformanceList = (params) => {
  return request({
    url: "/performance/performanceList",
    method: "get",
    params,
  });
};

// 演出场次操作（创建/批量创建/更新/删除/清空某天）
export const operatePerformanceSchedule = (data) => {
  return request({
    url: "/performance/performanceScheduleOperation",
    method: "post",
    data,
  });
};

// 演出场次列表
export const getPerformanceScheduleList = (params) => {
  return request({
    url: "/performance/performanceScheduleList",
    method: "get",
    params,
  });
};
