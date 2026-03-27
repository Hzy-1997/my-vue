/*
 * @描述: 
 * @版本: 
 * @作者: 
 * @日期: ${year}-${month}-${day}
 * @最后编辑者: sueRimn
 * @最后编辑时间: ${year}-${month}-${day} ${hour}:${minute}:${second}
 */


import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import config from '../config/index.js'
import { useStorage } from "../store/storage.js"
import router from "../router/index.js"

// 响应拦截器
// 创建实例对象
const server = axios.create({
    baseURL: config.baseApi,
    timeout: 5000,
})

// 请求拦截器
server.interceptors.request.use((req) => {
    let storage = useStorage()
    let token = storage.comToken || ''
    const headers = req.headers
    if (!headers.Authorization) {
        headers.Authorization = 'Bearer ' + token
    }
    return req
})

let hasShownTokenExpiredMessage = false;
// 响应拦截器
server.interceptors.response.use(
    (response) => {
        const { code, message } = response.data

        if (code === 200 || code === 400) {
            return response.data
        } else if (code === 501) {  // token过期 未登录F
            if (!hasShownTokenExpiredMessage) {
                ElMessage.error(message);
                ElMessageBox.confirm('你确定要重新登录吗?', '会话已过期', {
                    confirmButtonText: '重新登录',
                    cancelButtonText: '取消'
                })
                    .then(() => {
                        // 重新跳转到登录页面
                        localStorage.clear();
                        location.href = '/login';
                    })
                    .catch(() => {
                        // 用户点击取消，跳转到产品介绍页面
                        ElMessage.info('取消登录');
                        location.href = '/IdentityExpired';

                    });
                hasShownTokenExpiredMessage = true;
                return response.data;

            }


        } else {
            ElMessage.error(message);
            return Promise.reject(message);
        }
    },
    error => {
        if (error.response) {
            ElMessage.error(`服务器错误: ${error.response.status}`);
        } else if (error.request) {
            ElMessage.error('请求超时或无响应');
        } else {
            ElMessage.error(`请求发生错误: ${error.message}`);
        }
        console.error("error", error);
        return Promise.reject(error);
    }
)



// 定义一个request函数，用于发送请求
/**
 * 封装请求函数，支持字符串和对象两种形式的参数
 * @param {Object|string} options - 请求配置对象或请求URL字符串
 * @returns {Promise} - 返回一个Promise对象，用于处理请求结果
 */
function request(options) {
    if (typeof options === 'string') {
        options = {
            url: options,
            method: 'get'
        }
    }

    // 统一处理GET请求参数
    if (options.method && options.method.toLowerCase() === 'get' && options.data) {
        options.params = options.data;
        delete options.data;
    }

    if (config.env === 'development') {
        server.defaults.baseURL = config.baseApi
    } else if (config.env === 'production') {
        server.defaults.baseURL = config.mockApi ? config.mockApi : config.baseApi
    }

    return server(options)   // 返回一个Promise对象
}


export default request
