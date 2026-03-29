import request from "../utils/request.js"

// 获取操作日志列表
export function getOperationLogList(params) {
  return request({
    url: '/log/list',
    method: 'get',
    params
  })
}

// 获取操作日志详情
export function getOperationLogDetail(params) {
  return request({
    url: '/log/detail',
    method: 'get',
    params
  })
}
