import request from "../utils/request.js"


export const login = (data) => {
    return request({
        url: '/login/login',
        method: 'post',
        data: data
    })
}

export const vberifyCode = () => {
    return request({
        url: '/login/verifyCode',
        method: 'get',
    })
}