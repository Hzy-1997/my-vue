<template>
  <div class="basic-layout">
    <!-- 左侧导航栏 -->
    <div class="nav-side scroll">
      <div class="logo">
        <span>@#￥</span>
        <span>系统操作</span>
      </div>
      <Treemenu :menuList="menuList"></Treemenu>
    </div>
    <!--  -->
    <div class="content-right">
      <div class="nav-top">
        <div class="nav-left">
          <div class="menu-fold" @click="toggle">
            <i class="el-icon-s-fold"></i>
          </div>
          <div class="bread">
            <Breadcrumb :menuList="menuList" />
          </div>
        </div>

        <!-- right: 4px;
      top: 15px -->
        <el-dropdown placement="top-end">
          <div class="user-info" offset="10">
            <div>
              <el-badge is-dot class="item">
                <el-icon style="font-size: 28px"><Bell /></el-icon
              ></el-badge>
            </div>
            <div style="margin-right: 10px; size: 20px; font-weight: 600">你好!</div>
            <div class="avatar">
              <el-avatar :size="40" src="" />
            </div>
            <div>{{ userInfo?.username || "用户" }}</div>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="personalCenter">修改个人信息</el-dropdown-item>
              <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <div class="wrapper">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import { Bell } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";

import Treemenu from "../../components/treemenu/treemenu.vue";
import Breadcrumb from "../../components/Breadcrumb/index.vue";
import { useStorage } from "../../store/storage.js";
import { useRouter } from "vue-router";
const router = useRouter();
const storage = useStorage(); // 使用 store

let menuList = ref(); // 菜单列表
let userInfo = ref(); // 用户信息

onMounted(() => {
  getHomePageData();
});

const getHomePageData = () => {
  // console.log("存储", storage.comMenuList);
  menuList.value = storage.comMenuList.menuList; // 获取菜单列表
  userInfo.value = storage.comUserInfo; // 获取用户信息
  console.log("用户信息", userInfo.value);
};

// 退出登录
const logout = () => {
  ElMessageBox.confirm(" 确定注销并退出系统吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      localStorage.clear();
      location.href = "/login";
      console.log("退出成功");
    })
    .catch(() => {});
};

// 个人中心
const personalCenter = () => {
  router.push("/personalCenter");
};
</script>

<style lang="scss" scoped>
.basic-layout {
  position: relative;
  width: 100%;
  height: 100%;
  //   display: flex;
  .nav-side {
    position: fixed;
    width: 200px;
    height: 100vh;
    background-color: #001529;
    color: white;
    overflow-y: auto;
    transition: width 0.5s ease;
    .logo {
      height: 50px;
      text-align: center;
      line-height: 50px;
    }
  }
  .content-right {
    margin-left: 200px;
    border: 1px solid #ccc;
    .nav-top {
      height: 50px;
      line-height: 50px;
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #ccc;
      padding: 0 20px;
      .nav-left {
        display: flex;
        align-items: center;
        .menu-fold {
          margin-right: 15px;
          font-size: 18px;
        }
      }
    }
    .wrapper {
      background-color: #eef0f3;
      padding: 20px 10px 5px 10px;
      height: calc(100vh - 95px);
      // height: 100vh;
      .main-page {
        background: #fff;
        height: 100%;
      }
    }
  }
}

.nickname {
  margin-left: 10px !important;
}
.el-dropdown-link {
  font-size: 20px !important;
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.user-info {
  width: 250px;
  display: flex;
  align-items: center;

  .elIcon {
    padding-right: 20px;
  }

  .item {
    display: flex;
    align-items: center;
    // margin-top: 10px;
    margin-right: 20px;
    // border: 1px solid #ccc;
    width: 28px;
    height: 40px;
  }

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #ccc;
    margin-right: 10px;
    margin-left: 10px;
  }
}
</style>
