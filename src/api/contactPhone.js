
/*
 * @描述: 联系电话管理相关接口
 * @版本:
 * @作者:
 * @日期: ${year}-${month}-${day}
 * @最后编辑者: sueRimn
 * @最后编辑时间: ${year}-${month}-${day} ${hour}:${minute}:${second}
 */

import { request } from "../utils/request.js";

// 联系电话操作（创建/更新/删除）
export const contactPhoneOperation = (data) => {
  return request({
    url: "/contactPhone/contactPhoneOperation",
    method: "post",
    data,
  });
};

// 联系电话列表
export const getContactPhoneList = (params) => {
  return request({
    url: "/contactPhone/contactPhoneList",
    method: "get",
    params,
  });
};
