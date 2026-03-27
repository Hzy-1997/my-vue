/*
 * @描述: 
 * @版本: 
 * @作者: 
 * @日期: ${year}-${month}-${day}
 * @最后编辑者: sueRimn
 * @最后编辑时间: ${year}-${month}-${day} ${hour}:${minute}:${second}
 */


const env = import.meta.env.MODE || "prod"    // 环境变量 /** * 环境配置文件 * 用于管理不同环境下的API地址和其他配置 */// 获取当前运行环境，默认为生产环境

const EnvConfig = { /** * 环境配置文件 * 包含开发、测试和生产环境的API配置 */
    development: {
        baseApi: "/", //  开发环境基础API路径
        mockApi: "http://127.0.0.1:3000/api",    // 本地mock接口 地址
    },
    test: {
        baseApi: "http://127.0.0.1:3000/api",    // 测试环境 API地址
        mockApi: "http://127.0.0.1:3000/api", //  测试环境mock接口地址
    },
    production: {
        baseApi: "/api",    // 生产环境使用相对路径，配合Nginx反向代理
        mockApi: "/api", //  生产环境mock接口地址
    }
}

export default { /** * 默认导出配置对象 * 包含当前环境配置、是否启用mock、API地址和存储键名 */
    env: env, //  当前环境标识
    mock: false, //  是否启用mock数据
    baseApi: EnvConfig[env].mockApi, //  根据当前环境获取对应的API地址
    storageKey: "admin", //  本地存储的键名
}