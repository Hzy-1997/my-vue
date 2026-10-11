
/*
 * @描述: 预约模块相关接口
 * @版本:
 * @作者:
 * @日期: ${year}-${month}-${day}
 * @最后编辑者: sueRimn
 * @最后编辑时间: ${year}-${month}-${day} ${hour}:${minute}:${second}
 */

import { request } from "../utils/request.js";

// 夏令营操作（创建/更新/删除）
export const campsiteOperation = (data) => {
  return request({
    url: "/appointment/campsiteOperation",
    method: "post",
    data,
  });
};

// 夏令营列表
export const getCampsiteList = (params) => {
  return request({
    url: "/appointment/campsiteList",
    method: "get",
    params,
  });
};

// 营期操作（创建/更新/删除）
export const campsiteOperate = (data) => {
  return request({
    url: "/appointment/campsiteOperate",
    method: "post",
    data,
  });
};

// 营期列表
export const getCampsiteSessionList = (params) => {
  return request({
    url: "/appointment/campsiteSessionList",
    method: "post",
    params,
  });
};

// 票档操作（创建/更新/删除）
export const campsiteTicketOperation = (data) => {
  return request({
    url: "/appointment/campsiteTicketOperation",
    method: "post",
    data,
  });
};

// 票档列表
export const getCampsiteTicketList = (params) => {
  return request({
    url: "/appointment/campsiteTicketList",
    method: "post",
    params,
  });
};

// 停车场操作（创建/更新/删除）
export const parkingOperation = (data) => {
  return request({
    url: "/appointment/parkingOperation",
    method: "post",
    data,
  });
};

// 停车场列表
export const getParkingList = (params) => {
  return request({
    url: "/appointment/parkingList",
    method: "get",
    params,
  });
};

// 停车场车位操作（创建/批量创建/更新/删除/列表）
export const parkingSpotOperation = (data) => {
  return request({
    url: "/appointment/parkingSpotOperation",
    method: "post",
    data,
  });
};
