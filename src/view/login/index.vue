<template>
  <div class="login-wrapper">
    <div class="model">
      <el-form ref="loginForm" :model="loginData" status-icon :rules="rules">
        <div class="title">小小管理</div>
        <el-form-item prop="account">
          <el-input v-model="loginData.account" placeholder="请输入用户名">
            <template #prefix>
              <el-icon><Avatar /></el-icon> </template
          ></el-input>
        </el-form-item>
        <el-form-item prop="userPwd">
          <el-input
            type="password"
            v-model="loginData.userPwd"
            placeholder="请输入密码"
            @keydown.enter="login"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="code">
          <div style="display: flex">
            <el-input
              v-model="loginData.code"
              placeholder="请输入验证码"
              @keydown.enter="login"
            >
              <template #prefix>
                <el-icon><Open /></el-icon>
              </template>
            </el-input>
            <el-image
              v-if="showCode"
              :src="imgCode"
              @click="getImgCode"
              style="cursor: pointer; height: 40px"
            ></el-image>
            <div v-else class="loading">
              <div class="loading-img">
                <img class="rotate-img" src="../../assets/image/load.png" />
              </div>
              <span>获取中...</span>
            </div>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" class="btn-login" @click="login">登录</el-button>
        </el-form-item>
        <!-- <el-form-item>
          <el-button link class="btn-register" type="primary" @click="register"
            >注册账号</el-button
          >
        </el-form-item> -->
      </el-form>
    </div>

    <div class="layer1"></div>
    <div class="layer2"></div>
    <div class="layer3"></div>
    <div class="layer4"></div>
    <div class="layer5"></div>
    <div class="layer6"></div>
    <div class="layer7"></div>
    <div class="layer8"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";

import { useRouter, useRoute } from "vue-router";
import { loginApi, userApi } from "../../api/index.js";
import { cryptoUtil, executionStatus } from "../../utils/utils.js";
import { useStorage } from "../../store/storage.js";

// import { getCurrentInstance } from "vue";
const router = useRouter();
const storage = useStorage();

// const { proxy } = getCurrentInstance();

// defineProps({
//   msg: String,
// });
const loginData = ref({
  account: "admin",
  userPwd: "Hzy=1997+97",
  uuid: "",
  code: "",
  // account: "",
  // userPwd: "",
});

const rules = ref({
  account: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  userPwd: [{ required: true, message: "请输入密码", trigger: "blur" }],
  code: [{ required: true, message: "请输入验证码", trigger: "blur" }],
});

// 用 ref 获取 el-form 实例
const loginForm = ref(null); // 登录表单实例

const imgCode = ref(""); // 图像验证码 - 使用ref使其成为响应式

let timer = null; // 定时器
let showCode = ref(true); // 是否显示验证码
let count = 0; // 计数器

//  ---------------------------------------        函数

onMounted(() => {
  getImgCode();
});

// 获取图像验证码
const getImgCode = async () => {
  try {
    if (resetCount()) return; // 如果超过次数限制，则返回
    const res = await loginApi.vberifyCode();
    if (res.code === 200) {
      // 由于后端返回的是JSON格式，我们需要将SVG数据包装在data:image/svg+xml格式中
      imgCode.value =
        "data:image/svg+xml;charset=utf-8," + encodeURIComponent(res.data.img);
      loginData.value.uuid = res.data.uuid;
    }
  } catch (error) {
    ElMessage({
      message: "网络错误，请稍后重试",
      type: "error",
    });
  }
};

// 限制获取验证码次数的函数
const resetCount = () => {
  if (count > 5) {
    ElMessage({
      message: "获取验证码次数过多，请稍5分钟后重试",
      type: "error",
    });
    showCode.value = false;
    // 3分钟后重置计数
    setTimeout(() => {
      getImgCode();
      count = 0;
      showCode.value = true;
    }, 5 * 60 * 1000);
    return true;
  }
  count += 1;
  return false;
};

// 登录
const login = async () => {
  loginForm.value.validate(async (valid) => {
    if (valid) {
      let data = {
        account: loginData.value.account,
        userPwd: cryptoUtil.encrypt(loginData.value.userPwd),
        uuid: loginData.value.uuid, // 验证码唯一标识
        code: loginData.value.code, // 验证码
      };
      const res = await loginApi.login(data);
      if (res.code == 200) {
        ElMessage({
          message: "登录成功",
          type: "success",
        });
        let params = {
          id: res.data.userInfo.id,
        };
        storage.setToken(res.data.token);
        storage.setUserInfo(res.data.userInfo);
        let asyncRoutes = await userApi.getUserPermissions(params);
        storage.setMenuList(asyncRoutes.data);

        setTimeout(() => {
          router.push("/"); // 跳转路由
        }, 1000);
      } else if (res.code == 400) {
        ElMessage({
          message: res.message,
          type: "error",
        });
        getImgCode();
      } else {
        ElMessage({
          message: res.message,
          type: "error",
        });
      }
    } else {
      return false;
    }
  });
};
</script>

<style lang="scss" scoped>
@use "sass:math";
@use "sass:string";
@use "sass:list";

.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  // background: #f9f9f9;
  background: #000000;
  width: 100vw;
  height: 100vh;
  .model {
    width: 500px;
    padding: 50px;
    background: #ffff;
    // background-clip: #ffff;
    border-radius: 4px;
    box-shadow: 0 7px 25px rgba(0, 0, 0, 0.08);
    z-index: 1;
    .title {
      margin-bottom: 30px;
      text-align: center;
      font-size: 30px;
      line-height: 1.5;
    }
    .form-item {
      margin-bottom: 20px;
    }
    .label {
      display: block;
      margin-bottom: 5px;
    }
    .input {
      width: 100%;
      height: 40px;
      padding: 20px;
    }
    .btn-login {
      width: 100%;
    }
  }
  .el-input__wrapper {
    height: 30px !important;
  }
}

.loading {
  display: flex;
  width: 200px;
  align-items: center;
  justify-content: center;
  color: gray;
  .loading-img {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 5px;
    .rotate-img {
      width: 20px;
      height: 20px;
      animation: rotateAnimation 5s infinite linear;
    }
  }
}

/* 定义旋转动画 */
@keyframes rotateAnimation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@function getShadows($sn) {
  $shadows: ();
  @for $i from 1 through $sn {
    $x: #{math.random() * 100}vw;
    $y: #{math.random() * 200 - 100}vh;
    $shadows: list.append($shadows, $x $y 0 1px #fff, comma);
  }
  @return $shadows;
}
$duration: 500s;
$count: 1000;
@for $i from 1 through 8 {
  $duration: math.div($duration, 2);
  $count: math.floor(math.div($count, 2));
  .layer#{$i} {
    $size: #{$i}px;
    position: fixed;
    width: $size;
    height: $size;
    border-radius: 50%;
    left: 0;
    top: 100vh;
    box-shadow: getShadows($count);
    background-color: transparent;
    animation: moveUp $duration linear infinite;
  }
}

@keyframes moveUp {
  to {
    transform: translateY(-200vh);
  }
}
</style>
