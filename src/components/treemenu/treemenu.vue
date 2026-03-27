<template>
  <div>
    <el-menu
      @open="handleOpen"
      @close="handleClose"
      active-text-color="#409eff"
      background-color="#001529"
      :default-active="activeIndex"
      text-color="#fff"
      router
      :unique-opened="true"
      path="/"
    >
      <el-menu-item index="/" style="background-color: #001529 !important">
        <el-icon><Collection /></el-icon>
        <span>主页</span>
      </el-menu-item>
      <!-- <el-sub-menu index="2">
        <template #title>
          <el-icon><Tickets /></el-icon>
          <span>审批管理</span>
        </template>
        <el-menu-item index="2-1">item one</el-menu-item>
        <el-menu-item index="2-2">item two</el-menu-item>
      </el-sub-menu> -->

      <!-- 动态渲染菜单 -->
      <el-sub-menu v-for="item in menu" :key="item.id" :index="String(item.id)">
        <template #title>
          <svg-icon
            :name="item.icon ? item.icon : '404'"
            class="icon"
            style="height: 16px; width: 16px; margin-right: 38px"
          />
          <span>{{ item.menuName }}</span>
        </template>
        <el-menu-item
          v-for="value in item.children"
          :key="value.id"
          :index="String(value.path)"
        >
          {{ value.menuName }}</el-menu-item
        >
      </el-sub-menu>
    </el-menu>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useStorage } from "../../store/storage.js";
let router = useRouter();
let route = useRoute();
let storage = useStorage();

let storedMenu = storage.comMenuList;
// let menu = ref(storedMenu.menuList);
let menu = ref();
const props = defineProps({
  menuList: {
    type: Array, //类型
    required: true, //必传
    default: () => [], //默认值
  },
});

// 正确设置activeIndex - 主页和欢迎页都高亮主页菜单
let activeIndex = ref(route.path === "/" || route.path === "/welcome" ? "/" : route.path.substring(1));

watch(
  () => props.menuList,
  (menuList) => {
    console.log("Updated menuList:打印更新后的 menuList", menuList); // 打印更新后的 menuList
    menu.value = menuList;
  }
);

// 监听路由变化，更新activeIndex
watch(
  () => route.path,
  (newPath) => {
    activeIndex.value = newPath === "/" || newPath === "/welcome" ? "/" : newPath.substring(1);
  }
);

console.log("菜单", menu.value);

const handleOpen = (key, keyPath) => {
  console.log("菜单展开:", key, keyPath);
};

const handleClose = (key, keyPath) => {
  console.log("菜单关闭:", key, keyPath);
};
</script>

<style lang="scss" scoped>
.el-menu {
  border: none;
}

.el-sub-menu .el-icon {
  margin-right: 10px;
}

.el-sub-menu__title span {
  display: block;
  display: flex !important;
  align-content: center;
  justify-content: center;
}

.el-sub-menu .el-icon[data-v-51c2651e] {
  margin-right: 30px !important;
}

.el-menu-item {
  display: flex;
  align-content: center;
  justify-content: center;
  padding: 0px !important;
}

.el-menu-item:hover {
  background: #d7d9d6 !important;
}
/* 激活的子菜单项背景色 */
.el-menu-item {
  background-color: #1f2d3d !important; /* 替换为你想要的颜色 */
}
/* 激活的子菜单项背景色 */
.el-menu-item.is-active {
  color: #409eff !important; /* 可选：修改文字颜色以确保可读性 */
}

/* 激活的子菜单标题背景色 */
// .el-sub-menu.is-active > .el-sub-menu__title {
//   background-color: #409eff !important; /* 替换为你想要的颜色 */
//   color: #409eff !important; /* 可选：修改文字颜色 */
// }
</style>
