<template>
  <el-breadcrumb :separator-icon="ArrowRight">
    <el-breadcrumb-item
      v-for="(crumb, index) in breadcrumbs"
      :key="index"
      :to="index === 0 ? { path: crumb.path } : undefined"
      :replace="index === 0"
    >
      {{ crumb.meta.title }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { ArrowRight } from "@element-plus/icons-vue";
import { useStorage } from "../../store/storage.js";

const route = useRoute();
const storage = useStorage();

let menuList = ref(storage.comMenuList.menuList);

// 计算当前路由的面包屑
const breadcrumbs = computed(() => {
  // console.log("我的路由", route);
  // console.log("我的菜单", menuList.value);
  const matched = route.matched;
  const breadcrumbList = [];

  // 过滤掉首页路由，只保留子路由
  // console.log("我的路由3", matched);
  matched.forEach((item) => {
    // console.log("我的路由2", item);
    if (item.meta.title) {
      breadcrumbList.push(item);
    }
  });
  // console.log("我的路由4", breadcrumbList);

  menuList.value.forEach((item) => {
    item.children.forEach((subItem) => {
      if (breadcrumbList[breadcrumbList.length - 1].meta.title === subItem.menuName) {
        // console.log("菜单对上了：", subItem.menuName);
        // console.log("上级菜单", item);
        breadcrumbList.splice(1, 0, {
          meta: {
            title: item.menuName,
          },
          path: item.path,
        });
      }
    });
  });
  console.log("我的路由5", breadcrumbList);
  return breadcrumbList;
});
</script>

<style scoped>
.el-breadcrumb {
  font-size: 14px;
}

.el-breadcrumb__inner {
  color: #606266;
}

.el-breadcrumb__inner.is-link:hover {
  color: #409eff;
}
</style>
