/*
 * @描述: 
 * @版本: 
 * @作者: 
 * @日期: ${year}-${month}-${day}
 * @最后编辑者: sueRimn
 * @最后编辑时间: ${year}-${month}-${day} ${hour}:${minute}:${second}
 */


import { defineStore } from 'pinia';

export const useStorage = defineStore("informationBucket", {
    //存储数据（初始数据）
    state: () => ({
        token: '',
        userInfo: "",
        menuList: ""
    }),

    //派生数据（计算或格式化数据），用于读取和计算数据。
    getters: {
        comToken: (state) => state.token,
        comUserInfo: (state) => state.userInfo,
        comMenuList: (state) => state.menuList,
    },

    //修改数据或执行异步操作（可以修改 state）
    actions: {
        setToken(token) {
            this.token = token;
        },
        setUserInfo(userInfo) {
            this.userInfo = userInfo;
        },
        setMenuList(menuList) {
            this.menuList = menuList;
        }
    },
    persist: true, // 开启持久化
    // persist: {
    //     strategies: [ //  持久化策略配置数组
    //         {
    //             storage: localStorage, //  使用localStorage作为存储方式
    //             paths: ['token', 'userInfo', 'menuList'] //  只持久化指定的状态路径
    //         }
    //     ]
    // }
})

