<template>
  <div class="user-info-container">
    <!-- 左侧个人信息卡片 -->
    <div class="info-card">
      <h3 class="card-title">个人信息</h3>
      <div class="avatar">
        <img src="https://via.placeholder.com/100" alt="用户头像" class="avatar-img" />
      </div>
      <ul class="info-list">
        <li class="info-item">
          <span class="info-label">用户名称:</span>
          <span class="info-value">{{ form.account }}</span>
        </li>
        <li class="info-item">
          <span class="info-label">手机号码:</span>
          <span class="info-value">{{ form.phone }}</span>
        </li>
        <li class="info-item">
          <span class="info-label">用户邮箱:</span>
          <span class="info-value">{{ form.email }}</span>
        </li>
        <li class="info-item">
          <span class="info-label">所属角色:</span>
          <span class="info-value">{{
            roleList.map((item) => item.label).join("、")
          }}</span>
        </li>
        <li class="info-item">
          <span class="info-label">创建日期:</span>
          <span class="info-value">{{ form.createdAt }}</span>
        </li>
      </ul>
    </div>

    <!-- 右侧基本资料表单 -->
    <div class="form-card">
      <h3 class="card-title">基本资料</h3>
      <el-tabs v-model="activeTab" class="tab-container">
        <el-tab-pane label="基本资料" name="basic">
          <el-form :model="form" class="base-form" label-width="auto" :rules="rules">
            <el-form-item label="用户昵称" prop="username" required>
              <el-input v-model="form.username" placeholder="请输入用户昵称" />
            </el-form-item>
            <el-form-item label="手机号码" prop="phone" required>
              <el-input v-model="form.phone" placeholder="请输入手机号码" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email" required>
              <el-input v-model="form.email" placeholder="请输入邮箱" />
            </el-form-item>
            <el-form-item label="性别" prop="sex">
              <el-radio-group v-model="form.sex">
                <el-radio :value="0">男</el-radio>
                <el-radio :value="1">女</el-radio>
                <el-radio :value="2">未知</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item class="form-btn-group">
              <el-button type="primary" @click="submit(1)">保存</el-button>
              <el-button type="danger" @click="Close">关闭</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="修改密码" name="password">
          <!-- 密码修改表单可根据需求补充 -->
          <div class="password-placeholder">
            <el-form
              :model="form"
              class="password-form"
              label-width="auto"
              :rules="rules"
            >
              <el-form-item label="旧密码" prop="oldPassword">
                <el-input
                  v-model="form.oldPassword"
                  show-password
                  placeholder="请输入旧密码"
                  type="password"
                />
              </el-form-item>
              <el-form-item label="新密码" prop="password">
                <el-input
                  v-model="form.password"
                  show-password
                  placeholder="请输入新密码"
                  type="password"
                />
              </el-form-item>
              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input
                  v-model="form.confirmPassword"
                  show-password
                  placeholder="请确认新密码"
                  type="password"
                />
              </el-form-item>
              <el-button type="primary" @click="submit(2)">保存</el-button>
              <el-button type="danger" @click="Close">关闭</el-button>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { userApi, deptApi, roleApi } from "../../api/index.js";
import { cryptoUtil } from "../../utils/utils.js";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
const router = useRouter();

import { useStorage } from "../../store/storage.js";
const storage = useStorage(); // 使用 store

const activeTab = ref("basic");

const rules = reactive({
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" },
  ],
  phone: [
    { required: true, message: "请输入手机号", trigger: "blur" },
    // 手机号格式：以 1 开头，后面是 3-9 的数字，后面跟 8 个数字
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入有效的手机号",
      trigger: "blur",
    },
  ],
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱地址", trigger: "blur" },

    {
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: "请输入有效的邮箱地址",
      trigger: "blur",
    },
  ],
  gender: [{ required: true, message: "请选择性别", trigger: "blur" }],
  oldPassword: [
    { required: true, message: "请输入旧密码", trigger: "blur" },
    {
      min: 6,
      max: 20,
      message: "密码长度在 6 到 20 个字符之间",
      trigger: "blur",
    },
    // 密码必须包含字母、数字和特殊字符
    {
      pattern: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&=+])[A-Za-z\d@$!%*?&=+]{6,20}$/,
      message: "密码必须包含字母、数字和特殊字符",
      trigger: "blur",
    },
  ],
  password: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    {
      min: 6,
      max: 20,
      message: "密码长度在 6 到 20 个字符之间",
      trigger: "blur",
    },
    // 密码必须包含字母、数字和特殊字符
    {
      pattern: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&=+])[A-Za-z\d@$!%*?&=+]{6,20}$/,
      message: "密码必须包含字母、数字和特殊字符",
      trigger: "blur",
    },
  ],
  confirmPassword: [
    { required: true, message: "请确认新密码", trigger: "blur" },
    {
      min: 6,
      max: 20,
      message: "密码长度在 6 到 20 个字符之间",
      trigger: "blur",
    },
    // 密码必须包含字母、数字和特殊字符
    {
      pattern: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&=+])[A-Za-z\d@$!%*?&=+]{6,20}$/,
      message: "密码必须包含字母、数字和特殊字符",
      trigger: "blur",
    },
    // 自定义校验规则，确保新密码和确认密码一致
    {
      validator: (rule, value, callback) => {
        if (value !== form.value.password) {
          callback(new Error("两次输入的密码不一致"));
        } else {
          callback();
        }
      },
      trigger: ["blur", "change"],
    },
  ],
});

const form = ref({
  username: "",
  phone: "",
  email: "",
  gender: "",
  roleNames: [],
  createdAt: "",
  oldPassword: "",
  password: "",
  confirmPassword: "",
});

let roleList = ref([]);
//            ------------------------------- 方 法 ------------------
onMounted(() => {
  getUserInfo();
  getRoleList();
});
// 获取用户信息
const getUserInfo = () => {
  const userInfo = storage.comUserInfo;
  if (userInfo) {
    form.value = { ...form.value, ...userInfo };
  }
};
// 获取角色列表
let getRoleList = async () => {
  let res = await roleApi.getRoleList();
  res.data.list.forEach((item) => {
    roleList.value.push({
      label: item.roleName,
      id: item.id,
    });
  });
  console.log("角色列表", roleList.value);
};

// 提交表单
const submit = async (num) => {
  console.log(form.value);
  let data = {
    ...form.value,
    oldPassword: num === 1 ? "" : cryptoUtil.encrypt(form.value.oldPassword),
    password: num === 1 ? "" : cryptoUtil.encrypt(form.value.password),
    confirmPassword: num === 1 ? "" : cryptoUtil.encrypt(form.value.confirmPassword),
    action: "update",
  };

  let res = await userApi.register(data);
  console.log(res);
  if (res.code === 200) {
    ElMessage.success("修改成功,请重新登录");
    setTimeout(() => {
      localStorage.clear();
      location.href = "/login";
    }, 500);
  } else {
    ElMessage.error(res.msg);
  }
};

// 关闭
const Close = () => {
  router.push("/");
};
</script>

<style lang="scss" scoped>
.user-info-container {
  display: flex;
  gap: 20px;
  padding: 20px;
  box-sizing: border-box;

  .info-card,
  .form-card {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    padding: 20px;
    box-sizing: border-box;
  }

  .info-card {
    width: 380px;

    .card-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
    }

    .avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      overflow: hidden;
      margin: 0 auto 20px;

      .avatar-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .info-list {
      list-style: none;
      padding: 0;
      margin: 0;

      .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        font-size: 14px;
        padding-bottom: 8px;
        border-bottom: 1px solid #eee;

        .info-label {
          color: #606266;
          min-width: 60px;
          display: inline-block;
        }

        .info-value {
          color: #303133;
          width: 260px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }

  .form-card {
    flex: 1;

    .card-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
    }

    .tab-container {
      .el-tabs__header {
        margin-bottom: 20px;
      }
    }

    .base-form {
      .el-form-item {
        margin-bottom: 20px;

        &:last-child {
          margin-bottom: 0;
        }
      }

      .form-btn-group {
        display: flex;
        gap: 10px;
      }
    }

    .password-placeholder {
      padding: 20px;
      color: #909399;
    }
  }
}
</style>
