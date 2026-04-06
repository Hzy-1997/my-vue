/*
 * @描述: 
 * @版本: 
 * @作者: 
 * @日期: ${year}-${month}-${day}
 * @最后编辑者: sueRimn
 * @最后编辑时间: ${year}-${month}-${day} ${hour}:${minute}:${second}
 */

/**
 * 导入用户相关的API模块 
*/
import * as userApi from './user';
import * as commonApi from './common';
import * as deptApi from './dept';
import * as menuApi from './menu';
import * as roleApi from './role';
import * as loginApi from './login';
import * as ticketingApi from './ticketing';
import * as projectApi from './projectModule';
import * as hotelApi from './hotel';
import * as paymentApi from './payment';
import * as logApi from './log';
import * as writeOffApi from './WriteOff';



/** 
* 导出多个API模块 * 包括用户API、公共API * 这些模块可以被其他文件引入使用 
*/
export {
    userApi,
    commonApi,
    deptApi,
    menuApi,
    roleApi,
    loginApi,
    ticketingApi,
    projectApi,
    hotelApi,
    paymentApi,
    logApi,
    writeOffApi
};