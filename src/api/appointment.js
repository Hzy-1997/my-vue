
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

// ==================== 景区公交 ====================

// 景区公交商品操作（创建/更新/删除）
export const scenicBusOperation = (data) => {
  return request({
    url: "/appointment/scenicBusOperation",
    method: "post",
    data,
  });
};

// 景区公交商品列表
export const getScenicBusList = (params) => {
  return request({
    url: "/appointment/scenicBusList",
    method: "get",
    params,
  });
};

// 景区公交商品详情
export const getScenicBusDetail = (params) => {
  return request({
    url: "/appointment/scenicBusDetail",
    method: "get",
    params,
  });
};

// 景区公交购票下单（一单多票、一票一码）
export const scenicBusAppointment = (data) => {
  return request({
    url: "/appointment/scenicBusAppointment",
    method: "post",
    data,
  });
};

// 景区公交订单支付（占位，待接入支付渠道）
export const scenicBusPay = (data) => {
  return request({
    url: "/appointment/scenicBusPay",
    method: "post",
    data,
  });
};

// 景区公交订单列表
export const getScenicBusOrderList = (params) => {
  return request({
    url: "/appointment/scenicBusOrderList",
    method: "get",
    params,
  });
};

// 景区公交订单详情（含车票明细）
export const getScenicBusOrderDetail = (params) => {
  return request({
    url: "/appointment/scenicBusOrderDetail",
    method: "get",
    params,
  });
};

// 车票核销（一票一码，单张核销）
export const scenicBusVerify = (data) => {
  return request({
    url: "/appointment/scenicBusVerify",
    method: "post",
    data,
  });
};

// 单张车票退票
export const scenicBusRefund = (data) => {
  return request({
    url: "/appointment/scenicBusRefund",
    method: "post",
    data,
  });
};
