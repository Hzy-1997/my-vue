<template>
  <div class="dept-manage">
    <!-- 头部区域 -->
    <div class="query-form">
      <div class="title">部门管理</div>
      <div class="query-item">
        <el-input placeholder="请输入部门名称" v-model="queryForm.deptName"></el-input>
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>
    <!-- 操作区域 -->
    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="handleCreate" v-has="'dept-create'"
          >创建部门</el-button
        >
      </div>
      <!-- 列表部门展示 -->
      <el-table
        :data="tableData"
        style="width: 100%"
        row-key="id"
        stripe
        height="calc(100vh - 255px)"
        :tree-props="{ children: 'Children' }"
      >
        <!-- <el-table-column prop="id" label="标识" width="80" align="center" /> -->
        <el-table-column prop="deptName" label="部门名称" width="240" />
        <el-table-column
          prop="leader.username"
          label="负责人"
          width="80"
          align="center"
        />
        <el-table-column prop="leader.phone" label="负责人电话" align="center" />
        <el-table-column
          prop="leader.email"
          label="负责人邮箱"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="createdAt"
          label="创建时间"
          align="center"
        ></el-table-column>

        <el-table-column prop="status" label="状态" align="center" />

        <el-table-column fixed="right" label="操作" min-width="120" align="center">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="handleEdit(scope.row)"
              v-has="'dept-update'"
              >编辑</el-button
            >
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(scope.row)"
              v-has="'dept-delete'"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 创建部门 -->
    <el-dialog
      title="创建部门"
      v-model="dialogVisible"
      width="50%"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form :model="deptForm" label-width="100px" ref="deptFormRef" :rules="rules">
        <el-form-item label="上级部门" prop="parentIds">
          <el-cascader
            style="width: 60%"
            v-model="deptForm.parentIds"
            :options="deptData"
            placeholder="请选择上级部门"
            :props="{
              value: 'id',
              label: 'deptName',
              checkStrictly: true,
              children: 'Children',
            }"
            :show-all-levels="true"
            clearable
            @change="handleDept"
          ></el-cascader>
          <span style="margin-left: 20px">不选择默认顶级部门</span>
        </el-form-item>
        <el-form-item label="部门名称" prop="deptName">
          <el-input placeholder="请输入部门名称" v-model="deptForm.deptName"></el-input>
        </el-form-item>
        <el-form-item label="负责人" prop="username">
          <el-select
            placeholder="请选择部门负责人"
            v-model="deptForm.username"
            clearable
            @change="handleUser"
          >
            <el-option
              v-for="item in userList"
              :key="item.id"
              :label="item.username"
              :value="`${item.id}/${item.username}/${item.phone}/${item.email}`"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="负责人邮箱" prop="email">
          <el-input
            placeholder="请输输入负责人邮箱"
            v-model="deptForm.email"
            disabled
          ></el-input>
        </el-form-item>

        <el-form-item label="负责人电话" prop="phone">
          <el-input
            placeholder="请输输入负责人电话"
            v-model="deptForm.phone"
            disabled
          ></el-input>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="deptForm.status">
            <el-radio :value="1" size="large">启用</el-radio>
            <el-radio :value="2" size="large">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleAddDept">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, nextTick, reactive, onMounted } from "vue";
import { deptApi, userApi } from "../../api/index.js";
import { ElMessage, ElMessageBox } from "element-plus";

let queryForm = ref({
  deptName: "",
});

let tableData = ref([]); // 列表数据
let userList = ref([]); // 用户列表
let dialogVisible = ref(false); // 弹窗
let deptFormRef = ref(null); // 表单引用

let deptForm = ref({
  action: "create",
  deptName: "",
  parentIds: "",
  username: "",
  email: "",
  leaderId: "",
  phone: "",
  status: 1, // 1:正常 2:禁用
});

let deptData = ref([]);
// 表单验证规则
const rules = ref({
  deptName: [
    { required: true, message: "请输入部门名称", trigger: "blur" },
    { min: 2, max: 10, message: "长度在 2 到 10 个字符", trigger: "blur" },
  ],
  userName: [{ required: true, message: "请选择部门负责人", trigger: "blur" }],
});

//         ---------   函数方法       ------------------            函数方法     ---------------------

onMounted(() => {
  getDeptList();
  getUserList();
});

// 获取部门列表
const getDeptList = async () => {
  let data = {
    deptName: queryForm.value.deptName,
  };
  let res = await deptApi.getDeptList(data);
  console.log("部门列表数据", res);
  tableData.value = res.data;
  deptData.value = res.data;
};

// 获取用户列表
const getUserList = async () => {
  let res = await userApi.userList();
  userList.value = res.data.list;
};

// 查询
const handleQuery = () => {
  console.log(queryForm.value);
  getDeptList();
};

// 重置
const handleReset = () => {
  queryForm.value = {
    deptName: "",
  };
  getDeptList();
};

// 创建部门
const handleCreate = () => {
  deptForm.value.action = "create";
  dialogVisible.value = true;
  nextTick(() => {
    if (deptFormRef.value) {
      deptFormRef.value.resetFields();
    }
  });
};

// 选择部门
const handleDept = (value) => {
  console.log("选择部门", value);
  deptForm.value.parentIds = value[value.length - 1];
};

// 选择负责人
const handleUser = (value) => {
  console.log("选择负责人", value);
  const [userId, userName, phone, userEmail] = value.split("/"); // 拆分字符串
  Object.assign(deptForm.value, { leaderId: userId, userName, phone, userEmail }); // 将拆分后的值赋值给deptForm
};

// 提交
const handleAddDept = () => {
  deptFormRef.value.validate(async (value) => {
    if (value) {
      try {
        // console.log(deptForm.value);

        let data = {
          ...deptForm.value,
          leaderId: Number(deptForm.value.leaderId),
          // 对于更新操作，只传递直接父部门ID（数组的最后一个元素）
          // parentIds: deptForm.value.action == "update" && Array.isArray(deptForm.value.parentIds)
          //   ? deptForm.value.parentIds[deptForm.value.parentIds.length - 1]
          //   : deptForm.value.parentIds
        };
        console.log("提交", data);
        // return;
        let res = await deptApi.deptOperate(data);
        console.log("创建部门", res);
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
        getDeptList();
        dialogVisible.value = false;
      } catch (error) {
        console.log(error);
      }
    }
  });
};

// 编辑部门
const handleEdit = async (row) => {
  console.log("编辑部门", row);
  deptForm.value.action = "update";
  dialogVisible.value = true;
  nextTick(() => {
    if (deptFormRef.value) {
      // 基础数据赋值
      deptForm.value = {
        ...row,
        leaderId: row.leader.id || "",
        email: row.leader.email || "",
        phone: row.leader.phone || "",
        username: row.leader.username || "",
        action: "update",
      };
      console.log("编辑部门", deptForm.value);
      // 处理级联选择器的父部门路径
      if (row.Parents && row.Parents.length > 0) {
        // 获取直接父部门ID
        const directParentId = row.Parents[0].id;
        // 从部门树结构中构建完整的部门路径
        const fullPath = findFullDepartmentPath(deptData.value, directParentId);
        // 设置级联选择器需要的完整路径数组
        deptForm.value.parentIds = fullPath;
        console.log("完整父部门路径", deptForm.value.parentIds);
      } else {
        // 如果没有父部门，设置为空
        deptForm.value.parentIds = "";
      }
    }
  });

  // 从部门树结构中查找完整的部门路径
  const findFullDepartmentPath = (deptTree, targetId, currentPath = []) => {
    if (!deptTree || !Array.isArray(deptTree)) {
      return null;
    }
    for (const dept of deptTree) {
      // 创建当前路径的副本
      const newPath = [...currentPath, dept.id];
      // 如果找到目标部门，返回完整路径
      if (dept.id === targetId) {
        return newPath;
      }
      // 如果当前部门有子部门，递归查找
      if (dept.Children && dept.Children.length > 0) {
        const result = findFullDepartmentPath(dept.Children, targetId, newPath);
        if (result) {
          return result;
        }
      }
    }

    return null;
  };
};

// 删除部门
const handleDelete = async (row) => {
  try {
    // 显示确认对话框，告知用户将级联删除所有子部门
    await ElMessageBox.confirm(
      `确定要删除部门 "${row.deptName}" 吗？此操作将同时删除该部门的所有子部门！`,
      "删除确认",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    let res = await deptApi.deptOperate({ action: "delete", ...row });
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
    // 重新获取部门列表
    getDeptList();
  } catch (error) {
    // 用户取消操作时不显示错误提示
    if (error !== "cancel") {
      console.log(error);
    }
  }
};
</script>

<style lang="scss" scoped></style>
