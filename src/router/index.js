
// 导入必要的依赖
import { createRouter, createWebHistory } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import staticRoutes from './staticRoutes';
import { useStorage } from '../store/storage.js';
import { userApi } from '../api/index.js';

// 预加载所有视图组件（解决Vite警告）
const viewsModules = import.meta.glob("../view/**/*.vue");

// 创建路由实例
const router = createRouter({
    history: createWebHistory(),

    routes: staticRoutes
});

// 动态路由加载标志，防止重复加载
let isDynamicRoutesLoaded = false;

/**
 * 加载动态路由
 * @returns {Promise<boolean>} 是否成功加载
 */
async function loadAsyncRoutes() {
    try {
        if (isDynamicRoutesLoaded) {
            return true;
        }
        const storage = useStorage();
        let userInfo = storage.comUserInfo
        let params = {
            //   id:userInfo.id
            id: 31,
        };
        let asyncRoutes = await userApi.getUserPermissions(params);
        // 如果是会话状态过期就什么都不做
        if (asyncRoutes.code == 501) return false;
        storage.setMenuList(asyncRoutes.data)
        if (!asyncRoutes || !asyncRoutes.data.menuList) {
            console.error('获取动态路由数据失败：数据格式不正确');
            return false;
        }

        // 处理路由数据
        let menuList = processRoutes(asyncRoutes.data.menuList);
        console.log("菜单数据", menuList);
        const homeRoute = router.getRoutes().find(route => route.name === 'Home');
        if (!homeRoute) {
            console.error('Home路由不存在,无法添加子路由');
            return false;
        }

        // 清除现有的动态路由，避免重复添加
        const existingRoutes = router.getRoutes();
        existingRoutes.forEach(route => {
            // 只清除不是静态路由的子路由
            if (route.parent && route.parent.name === 'Home' && !staticRoutes[0].children.find(c => c.path === route.path)) {
                try {
                    router.removeRoute(route.name);
                } catch (e) {
                    // 忽略移除失败的情况
                }
            }
        });

        // 添加动态路由
        menuList.forEach(item => {
            try {
                const componentPath = `../view/${item.component}.vue`;
                if (!viewsModules[componentPath]) {
                    console.error(`路由组件不存在: ${componentPath}`);
                    return;
                }
                const routeToAdd = {
                    ...item,
                    path: item.path.replace(/^\/*(.*?)\/*$/, '/$1'),
                    component: viewsModules[`../view/${item.component}.vue`],
                    children: item.children ? processRoutes(item.children) : [],
                };
                router.addRoute('Home', routeToAdd);
            } catch (error) {
                console.error(`添加动态路由失败: ${item.name}`, error);
            }
        });

        // 标记路由已加载
        isDynamicRoutesLoaded = true;
        return true;
    } catch (error) {
        console.error('加载动态路由时发生错误:', error);
        return false;
    }
}

/**
 * 重置动态路由加载状态（用于登出等场景）
 */
function resetDynamicRoutes() {
    isDynamicRoutesLoaded = false;
    // 如果需要，可以在这里清除已添加的动态路由
}

/**
 * 递归处理路由数据
 */
function processRoutes(routes) {
    const processedRoutes = [];

    if (!Array.isArray(routes)) {
        return processedRoutes;
    }
    routes.forEach(item => {
        // 递归处理子路由
        if (item.children && item.children.length > 0) {
            processedRoutes.push(...processRoutes(item.children));
        }
        // 处理当前路由项
        if (item.component && item.menuName) {
            processedRoutes.push({
                name: item.path,
                path: item.path,
                meta: {
                    title: item.menuName,
                    requireLogin: true
                },
                component: item.component
            });
        }
    });
    return processedRoutes;
}

// 封装检查 token + 加载动态路由 + 路由存在性
async function checkTokenAndLoadRoutes(to) {
    const storage = useStorage();
    const token = storage.comToken;

    if (!token) return { token, routeExists: false };

    // 尝试加载动态路由
    await loadAsyncRoutes();

    // 检查路由是否存在
    const routeExists = router.getRoutes().some(route => route.path === to.path);
    return { token, routeExists };
}

router.beforeEach(async (to, from, next) => {
    try {
        // 对于404路由
        if (to.name === 'NotFound') {
            const { token, routeExists } = await checkTokenAndLoadRoutes(to); // 检查token和路由是否存在
            if (token && routeExists) {
                next({ path: to.path, query: to.query, replace: true });
                return;
            }
            // 没有token或路由不存在，执行404
            next();
            return;
        }

        // 需要登录的路由
        if (to.meta.requireLogin) {
            const { token, routeExists } = await checkTokenAndLoadRoutes(to);
            if (!token) {
                next(false);
                ElMessageBox.alert('你的身份信息出错了，请重新登录', {
                    confirmButtonText: '确定',
                    callback: () => router.push({ path: '/login', replace: true }),
                });
                localStorage.clear(); // 清空本地存储
                return;
            }

            if (to.meta.title) {
                document.title = `${to.meta.title} - 小小何系统`;
            }

            if (routeExists) {
                next();
            } else {
                console.warn(`尝试访问不存在的路由: ${to.path}，已重定向到欢迎页`);
                next('/welcome');
            }

            return;
        }

        // 不需要登录的路由直接放行
        next();
    } catch (error) {
        console.error('路由拦截器发生错误:', error);
        ElMessage.error('系统错误，请稍后重试');
        localStorage.clear(); // 清空本地存储
        next('/login'); // 出现错误，重定向到登录页
    }
});

// 导出router和辅助函数
export default router;
export { resetDynamicRoutes };