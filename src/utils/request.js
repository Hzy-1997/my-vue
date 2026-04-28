/*
 * @描述:
 * @版本:
 * @作者:
 * @日期: ${year}-${month}-${day}
 * @最后编辑者: sueRimn
 * @最后编辑时间: ${year}-${month}-${day} ${hour}:${minute}:${second}
 */

import axios from "axios";
import { ElMessage, ElMessageBox, ElLoading } from "element-plus";
import config from "../config/index.js";
import { useStorage } from "../store/storage.js";
import router from "../router/index.js";
import { saveAs } from "file-saver";

// 创建实例对象
const server = axios.create({
    baseURL: config.baseApi,
    timeout: 30000,  // 3分钟超时
});

/**
 * 检查是否为重复请求
 * @param {Object} config - 请求配置
 * @returns {boolean|Promise} - 返回false表示不是重复请求，返回Promise.reject表示是重复请求
 */
function checkRepeatSubmit(config) {
    // 是否需要防止数据重复提交（默认需要，可通过 headers.repeatSubmit = false 跳过）
    const isRepeatSubmit = (config.headers || {}).repeatSubmit === false;

    if (isRepeatSubmit) {
        return false;
    }

    if (config.method !== 'post' && config.method !== 'put') {
        return false;
    }

    const requestObj = {
        url: config.url,
        data: typeof config.data === 'object' ? JSON.stringify(config.data) : String(config.data || ''),
        time: new Date().getTime()
    };


    const sessionObj = JSON.parse(sessionStorage.getItem('sessionObj') || 'null');
    const interval = 1000; // 间隔时间(ms)

    if (!sessionObj) {
        sessionStorage.setItem('sessionObj', JSON.stringify(requestObj));
        return false;
    }

    const s_url = sessionObj.url;      // 请求地址
    const s_data = sessionObj.data;    // 请求数据
    const s_time = sessionObj.time;    // 请求时间

    if (s_data === requestObj.data && requestObj.time - s_time < interval && s_url === requestObj.url) {
        const message = '数据正在处理，请勿重复提交';
        console.warn(`[${s_url}]: ` + message);
        ElMessage.warning(message);
        return Promise.reject(new Error(message));
    } else {
        sessionStorage.setItem('sessionObj', JSON.stringify(requestObj));
        return false;
    }
}

// 请求拦截器
server.interceptors.request.use((req) => {
    const headers = req.headers || {};

    // 是否需要设置 token
    const isToken = headers.isToken === false;
    if (!isToken) {
        let storage = useStorage();
        let token = storage.comToken || "";
        if (!headers.Authorization) {
            headers.Authorization = "Bearer " + token;
        }
    }

    // 下载请求不做限流
    if (req.responseType === 'blob') {
        return req;
    }

    // 检查重复提交
    const repeatResult = checkRepeatSubmit(req);
    if (repeatResult) {
        return repeatResult; // 返回 Promise.reject
    }

    return req;
}, error => {
    console.log(error);
    return Promise.reject(error);
});


// 响应拦截器
let hasShownTokenExpiredMessage = false;
server.interceptors.response.use(
    (response) => {
        if (response.config.responseType === 'blob') {
            return response;  // 直接返回，不进行JSON解析
        }
        const { code, message } = response.data;

        if (code === 200 || code === 400) {
            return response.data;
        } else if (code === 501) {
            // token过期 未登录F
            if (!hasShownTokenExpiredMessage) {
                ElMessage.error(message);
                ElMessageBox.confirm("你确定要重新登录吗?", "会话已过期", {
                    confirmButtonText: "重新登录",
                    cancelButtonText: "取消",
                })
                    .then(() => {
                        // 重新跳转到登录页面
                        localStorage.clear();
                        location.href = "/login";
                    })
                    .catch(() => {
                        // 用户点击取消，跳转到产品介绍页面
                        ElMessage.info("取消登录");
                        location.href = "/IdentityExpired";
                    });
                hasShownTokenExpiredMessage = true;
                return response.data;
            }
        } else {
            ElMessage.error(message);
            return Promise.reject(message);
        }
    },
    (error) => {
        if (error.response) {
            ElMessage.error(`服务器错误: ${error.response.status}`);
        } else if (error.request) {
            ElMessage.error("请求超时或无响应");
        } else {
            ElMessage.error(`请求发生错误: ${error.message}`);
        }
        console.error("error", error);
        return Promise.reject(error);
    }
);



/**
 * 封装请求函数，支持字符串和对象两种形式的参数
 * @param {Object|string} options - 请求配置对象或请求URL字符串
 * @returns {Promise} - 返回一个Promise对象，用于处理请求结果
 */
function request(options) {
    if (typeof options === "string") {
        options = {
            url: options,
            method: "get",
        };
    }

    // 统一处理GET请求参数
    if (options.method && options.method.toLowerCase() === "get" && options.data) {
        options.params = options.data;
        delete options.data;
    }

    if (config.env === "development") {
        server.defaults.baseURL = config.baseApi;
    } else if (config.env === "production") {
        server.defaults.baseURL = config.mockApi ? config.mockApi : config.baseApi;
    }

    return server(options); // 返回一个Promise对象
}



/**
 * 验证是否为 Blob 对象
 * @param {any} data - 响应数据
 * @returns {boolean}
 */
function blobValidate(data) {
    return data instanceof Blob || Object.prototype.toString.call(data) === "[object Blob]";
}

/**
 * 通用文件下载函数（自动兼容 GET 和 POST）
 * @param {Object|string} options - 请求配置对象或请求URL字符串
 * @param {string} fileName - 下载文件名（可选）
 * @returns {Promise}
 */

let downloadLoadingInstance = null;

function downloadFile(options, fileName = "") {
    downloadLoadingInstance = ElLoading.service({
        text: "正在下载数据，请稍候",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
    });

    // 处理字符串URL的情况
    if (typeof options === "string") {
        options = {
            url: options,
            method: "get",
        };
    }

    // 自动判断请求方法
    if (!options.method) {
        options.method = options.data ? "post" : "get";
    }

    // 统一处理GET请求参数（将data转换为params）
    if (options.method && options.method.toLowerCase() === "get" && options.data) {
        options.params = options.data;
        delete options.data;
    }

    // 设置响应类型为blob
    options.responseType = "blob";

    // 设置基础URL
    if (config.env === "development") {
        options.baseURL = config.baseApi;
    } else if (config.env === "production") {
        options.baseURL = config.mockApi ? config.mockApi : config.baseApi;
    }

    return server(options)
        .then(async (response) => {
            // 注意：request.js 返回的是 response.data
            const data = response.data || response;

            const isBlob = blobValidate(data);
            if (isBlob) {
                // 确定文件类型（从响应头获取）
                const contentType = response.headers?.["content-type"] ||
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

                const blob = new Blob([data], { type: contentType });

                // 确定文件名
                let downloadFileName = fileName;

                console.log("downloadFileName", downloadFileName)
                // 使用 file-saver 保存文件
                saveAs(blob, downloadFileName);

                return { success: true, fileName: downloadFileName };
            } else {
                // 如果返回的不是Blob，说明是错误信息
                const resText = await data.text();
                const rspObj = JSON.parse(resText);
                const errMsg = rspObj.msg || rspObj.message || "下载失败";
                ElMessage.error(errMsg);
                return Promise.reject(new Error(errMsg));
            }
        })
        .catch((error) => {
            console.error("下载文件出现错误:", error);
            ElMessage.error("下载文件出现错误，请联系管理员！");
            return Promise.reject(error);
        })
        .finally(() => {
            if (downloadLoadingInstance) {
                downloadLoadingInstance.close();
                downloadLoadingInstance = null;
            }
        });
}

export {
    request,
    downloadFile
};
