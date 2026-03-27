/*
 * @描述:
 * @版本:
 * @作者:
 * @日期: ${year}-${month}-${day}
 * @最后编辑者: sueRimn
 * @最后编辑时间: ${year}-${month}-${day} ${hour}:${minute}:${second}
 */
/*
 * @描述:
 * @版本:
 * @作者:
 * @日期: ${year}-${month}-${day}
 * @最后编辑者: sueRimn
 * @最后编辑时间: ${year}-${month}-${day} ${hour}:${minute}:${second}
 */
const staticRoutes = [
  {
    name: "Home",
    path: "/",
    meta: {
      title: "主页",
      requireLogin: true, //是否需要登录
    },
    component: () => import("../view/home/index.vue"), //路由懒加载
    redirect: "/welcome",
    children: [
      {
        name: "welcome",
        path: "/welcome",
        meta: {
          title: "欢迎页",
          requireLogin: true, //是否需要登录
        },
        component: () => import("../view/Welcome/index.vue"),
      },

      {
        name: "personalCenter",
        path: "/personalCenter",
        meta: {
          title: "个人信息",
          requireLogin: true, //是否需要登录
        },
        component: () => import("../view/home/personalCenter.vue"),
      },
    ],
  },
  {
    name: "login",
    path: "/login",
    meta: { title: "登录" },
    component: () => import("../view/login/index.vue"),
  },
  {
    name: "IdentityExpired",
    path: "/IdentityExpired",
    meta: { title: "登录过期" },
    component: () => import("../view/notFound/IdentityExpired.vue"),
  },
  {
    name: "NotFound",
    path: "/:pathMatch(.*)*",
    component: () => import("../view/notFound/index.vue"),
    meta: { title: "页面不存在" },
  },
];

export default staticRoutes;
