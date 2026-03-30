<template>
  <div class="user-manage">
    <!-- 头部查询 -->
    <div class="query-form">
      <div class="title">用户管理</div>
      <div class="query-item">
        <el-input v-model="queryForm.username" placeholder="请输入用户姓名" />
        <el-input v-model="queryForm.phone" placeholder="请输入用户手机号" />
        <el-button link @click="handleSearch"
          ><el-icon><Search /></el-icon> 查询</el-button
        >
        <el-button link @click="handleReset"
          ><el-icon><RefreshLeft /></el-icon> 重置</el-button
        >
      </div>
    </div>
    <!-- 操作及表格 -->
    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="createUser" v-has="'user-create'"
          >创建用户</el-button
        >
        <el-button type="danger" @click="handleBatchDelete" v-has="'user-delete'"
          >批量删除</el-button
        >
      </div>

      <el-table
        :data="tableData"
        style="width: 100%"
        height="calc(100vh - 300px)"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="50" align="center" />
        <el-table-column prop="username" label="用户名" width="100" align="center" />
        <el-table-column prop="avatar" label="头像" width="120" align="center" />
        <el-table-column prop="account" label="账号" width="150" align="center" />
        <el-table-column prop="email" label="邮箱" width="200" align="center" />
        <el-table-column prop="phone" label="手机号" width="120" align="center" />
        <el-table-column prop="job" label="岗位" width="120" align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag
              :type="
                scope.row.status == 0
                  ? 'success'
                  : scope.row.status == 2
                  ? 'warning'
                  : 'danger'
              "
            >
              {{
                scope.row.status == 0 ? "在职" : scope.row.status == 2 ? "试用期" : "离职"
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="200" align="center" />
        <el-table-column prop="accountStatus" label="账户状态" width="200" align="center">
          <template #default="scope">
            <el-switch
              v-model="scope.row.accountStatus"
              active-text="启用"
              inactive-text="禁用"
              :active-value="1"
              :inactive-value="2"
              @change="handleAccountStatus(scope.row)"
            />
          </template>
        </el-table-column>

        <el-table-column
          prop="createTime"
          fixed="right"
          label="操作"
          min-width="120"
          align="center"
        >
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="editUser(scope.row)"
              v-has="'user-update'"
              >编辑</el-button
            >
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(scope.row)"
              v-has="'user-delete'"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 表单填写 -->
    <el-dialog
      title="创建用户"
      v-model="dialogVisible"
      width="50%"
      :showClose="false"
      :closeOnClickModal="false"
      :closeOnPressEscape="false"
      :closeOnHashChange="false"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form :model="formData" ref="ruleFormRef" :rules="rules" label-width="80px">
        <!-- 姓名 -->
        <el-form-item label="用户姓名" prop="username">
          <el-input v-model="formData.username" placeholder="请输入用户姓名" />
        </el-form-item>

        <!-- 用户名 -->
        <el-form-item label="账号" prop="account">
          <el-input v-model="formData.account" placeholder="请输入用户账号" />
        </el-form-item>

        <!-- 密码 -->
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="formData.password"
            type="password"
            show-password
            placeholder="请输入密码"
          />
        </el-form-item>

        <!-- 邮箱 -->
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>

        <!-- 手机号 -->
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" />
        </el-form-item>

        <!-- 岗位 -->
        <el-form-item label="岗位" prop="job">
          <el-input v-model="formData.job" placeholder="请输入岗位" />
        </el-form-item>

        <!-- 状态 -->
        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status">
            <el-option :value="0" label="在职"></el-option>
            <el-option :value="1" label="离职"></el-option>
            <el-option :value="2" label="试用期"></el-option>
          </el-select>
        </el-form-item>

        <!-- 头像 -->
        <el-form-item label="头像" prop="avatar">
          <el-input v-model="formData.avatar" placeholder="请输入头像URL" />
        </el-form-item>

        <!-- 性别 -->
        <el-form-item label="性别" prop="sex">
          <el-select v-model="formData.sex" placeholder="选择用户性别">
            <el-option :value="0" label="男"></el-option>
            <el-option :value="1" label="女"></el-option>
            <el-option :value="2" label="未知"></el-option>
          </el-select>
        </el-form-item>

        <!-- 系统角色 -->
        <el-form-item label="角色" prop="roleIds">
          <el-select
            v-model="formData.roleIds"
            placeholder="选择你的角色"
            multiple
            filterable
            allow-create
            default-first-option
            :reserve-keyword="false"
            style="width: 100%"
          >
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.label"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <!-- 系统部门 -->
        <el-form-item label="所属部门" prop="deptId">
          <el-cascader
            v-model="formData.deptId"
            placeholder="选择所属于部门"
            :options="deptList"
            style="width: 100%"
            :show-all-levels="true"
            :props="{
              value: 'id',
              label: 'deptName',
              checkStrictly: true, // 开启严格模式
              children: 'Children', // 与后端返回的数据结构匹配
            }"
            clearable
            @change="handleDept"
          />
        </el-form-item>

        <!-- 账户状态 -->
        <el-form-item label="账户状态" prop="accountStatus">
          <el-radio-group v-model="formData.accountStatus">
            <el-radio :value="1" size="large">正常</el-radio>
            <el-radio :value="2" size="large">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
    <div class="table-pagination">
      <Pagination
        :pagination="pagination"
        @handleSizeChange="handleSizeChange"
        @handleCurrentChange="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import Pagination from "../../components/pagination/pagination.vue";

import { userApi, deptApi, roleApi } from "../../api/index.js";
const queryForm = ref({
  username: "",
  phone: "",
});

const dialogVisible = ref(false);
let ruleFormRef = ref(null); // 表单实例
// 初始表单数据
const getInitialFormData = () => ({
  action: "create",
  username: "何昭宇",
  email: "1051179618@qq.com",
  account: "hzy123456",
  password: "Hzy=1997+97",
  phone: "18782111202",
  job: "前端开发",
  status: 2,
  accountStatus: 1,
  avatar: "",
  sex: 2,
  roleIds: [],
  deptId: "",
});

// 表单数据
const formData = ref(getInitialFormData());

// 角色列表
const roleList = ref([]);
// 部门列表
let deptList = ref([]);

// 验证
const rules = reactive({
  username: [
    { required: true, message: "请输入姓名", trigger: "blur" },
    { min: 2, max: 5, message: "长度在 2 到 5 个字符", trigger: "blur" },
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
  account: [
    { required: true, message: "请输入账号", trigger: "blur" },
    {
      min: 5,
      max: 15,
      message: "账号长度在 5 到 15 个字符之间",
      trigger: "blur",
    },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
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
  phone: [
    { required: true, message: "请输入手机号", trigger: "blur" },
    // 手机号格式：以 1 开头，后面是 3-9 的数字，后面跟 8 个数字
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入有效的手机号",
      trigger: "blur",
    },
  ],
  job: [
    { required: true, message: "请输入职位", trigger: "blur" },
    {
      min: 2,
      max: 10,
      message: "职位名称长度在 2 到 10 个字符之间",
      trigger: "blur",
    },
  ],
  status: [{ required: true, message: "请选择状态", trigger: "change" }],
  // avatar: [{ required: true, message: "请选择头像", trigger: "blur" }],
  sex: [{ required: true, message: "请选择性别", trigger: "change" }],
  roleIds: [{ required: true, message: "请选择角色", trigger: "change" }],
  deptId: [{ required: true, message: "请选择部门", trigger: "change" }],
});

let tableData = ref([]);

let handleBatchArray = ref([]);

// 分页
let pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});
// -----------------------------         ----------------- 函数----------------------------

onMounted(() => {
  getUserList();
  getDepartmentList();
  getRoleList();
});

// 查询
let handleSearch = () => {
  getUserList();
};

// 重置
let handleReset = () => {
  queryForm.value.username = "";
  queryForm.value.phone = "";
  getUserList();
};

// 获取用户列表
let getUserList = async () => {
  try {
    // 合并查询参数和分页参数
    const params = {
      ...queryForm.value,
      pageNum: pagination.value.currentPage,
      pageSize: pagination.value.pageSize,
    };

    let res = await userApi.userList(params);
    console.log("用户列表", res);
    if (res.code != 200) return ElMessage.error(res.msg);
    tableData.value = res.data.list;
    // 设置总数
    pagination.value.total = res.data.total || 0;
  } catch (error) {
    console.log(error);
  }
};

// 获取部门列表
let getDepartmentList = async () => {
  let res = await deptApi.getDeptList();
  deptList.value = res.data;
  console.log("部门列表", res);
};

// 获取角色列表
let getRoleList = async () => {
  let res = await roleApi.getRoleList();
  // roleList.value = res.data;
  res.data.list.forEach((item) => {
    roleList.value.push({
      label: item.roleName,
      id: item.id,
    });
  });
  console.log("角色列表", roleList.value);
};

// 新增
let createUser = () => {
  console.log("新增");
  dialogVisible.value = true;

  nextTick(() => {
    // 完全重置formData到初始状态
    formData.value = getInitialFormData();
  });
};

// 账户状态
let handleAccountStatus = (row) => {
  console.log("账户状态", row);
  ElMessageBox.confirm("确定要修改账户状态吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      let data = {
        ...row,
        action: "update",
      };
      let res = await userApi.register(data);
      console.log("修改账户状态", res);
      if (res.code == 200) {
        ElMessage({
          message: res.message,
          type: "success",
        });
      } else {
        ElMessage({
          message: res.message,
          type: "error",
        });
      }
    })
    .catch(() => {
      if (row.accountStatus == 1) {
        row.accountStatus = 2;
      } else {
        row.accountStatus = 1;
      }
    });
};

let handleDept = (row) => {
  if (row) {
    console.log("部门", row);
    formData.value.deptId = row[row.length - 1];
  }
};

// 提交
let handleSubmit = async () => {
  try {
    console.log("提交", formData.value);
    let res = [];
    res = await userApi.register(formData.value);
    if (res.code == 200) {
      ElMessage({
        message: res.message,
        type: "success",
      });
    } else {
      ElMessage({
        message: res.message,
        type: "error",
      });
    }
    dialogVisible.value = false;
    getUserList();
  } catch (error) {
    console.log("error", error);
  }
};

// 编辑用户
let editUser = async (row) => {
  console.log("编辑用户", row);
  // 确保部门数据已加载
  if (deptList.value.length === 0) {
    await getDepartmentList();
  }
  dialogVisible.value = true;
  // 使用 nextTick 确保 DOM 更新后再设置值
  nextTick(() => {
    formData.value = {
      ...row,
      action: "update",
      // roleIds: row.Roles.join(","),
    };
  });
};

// 删除
let handleDelete = async (row) => {
  ElMessageBox.confirm("确定删除该用户吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    try {
      let data = {
        ...row,
        action: "delete",
      };

      let res = await userApi.register(data);
      if (res.code == 200) {
        ElMessage({
          message: res.message,
          type: "success",
        });
      } else {
        ElMessage({
          message: res.message,
          type: "error",
        });
      }
      getUserList();
    } catch (error) {
      console.log("error", error);
    }
  });
};
// 批量删除
let handleSelectionChange = (val) => {
  handleBatchArray.value = [];
  val.forEach((element) => {
    handleBatchArray.value.push(element.id);
  });
};
let handleBatchDelete = async () => {
  ElMessageBox.confirm(
    `确定删除选中的${handleBatchArray.value.length}个用户吗？`,
    "提示",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  ).then(async () => {
    try {
      let data = {
        id: handleBatchArray.value,
      };
      let res = await userApi.batchDelete(data);
      if (res.code == 200) {
        ElMessage({
          message: res.message,
          type: "success",
        });
      } else {
        ElMessage({
          message: res.message,
          type: "error",
        });
      }
      getUserList();
    } catch (error) {
      console.log("error", error);
    }
  });
};

// 处理页码变化
let handleCurrentChange = (val) => {
  console.log("页码变化为:", val);
  pagination.value.currentPage = val;
  getUserList();
};

// 处理每页条数变化
let handleSizeChange = (val) => {
  console.log("每页条数变化为:", val);
  pagination.value.pageSize = val;
  // 重置为第一页
  pagination.value.currentPage = 1;
  getUserList();
};
</script>

<style lang="scss" scoped></style>
