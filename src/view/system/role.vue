<template>
  <div class="dept-manage">
    <div class="query-form">
      <div class="title">角色管理</div>
      <div class="query-item">
        <el-input placeholder="请输入角色名称" v-model="queryForm.roleName"></el-input>
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>
    <div class="base-table">
      <!-- 操作  -->
      <div class="action">
        <el-button type="primary" @click="handleCreateRole">创建角色</el-button>
        <el-button type="danger" @click="handleBatchDelete">批量删除</el-button>
      </div>

      <!-- 列表 -->
      <el-table
        :data="tableData"
        style="width: 100%"
        height="calc(100vh - 300px)"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="50" align="center" />

        <el-table-column prop="roleName" label="角色名称" width="200" align="center" />
        <el-table-column prop="menuList" label="权限列表">
          <template #default="scope">
            <el-breadcrumb>
              <el-breadcrumb-item
                v-for="(item, index) in filterMenuList(scope.row.menuList)"
                :key="index"
                >{{ item }}</el-breadcrumb-item
              >
            </el-breadcrumb>
          </template>
        </el-table-column>
        <!-- <el-table-column prop="roleKey" label="角色标识" width="200" align="center" /> -->
        <el-table-column prop="sort" label="角色排序" width="200" align="center" />
        <el-table-column prop="status" label="角色状态" width="200" align="center">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              active-text="启用"
              inactive-text="禁用"
              :active-value="1"
              :inactive-value="2"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="200" align="center" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEditRole(scope.row)"
              >编辑</el-button
            >
            <el-button type="danger" size="small" @click="handleDeleteRole(scope.row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 角色创建 -->
    <el-dialog
      title="角色创建"
      v-model="dialogVisible"
      width="50%"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div style="max-height: 600px; overflow: auto">
        <el-form :model="roleForm" ref="roleFormRef" label-width="100px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="roleForm.roleName"></el-input>
          </el-form-item>

          <el-form-item label="角色排序" prop="sort">
            <el-input type="number" v-model="roleForm.sort"></el-input>
          </el-form-item>

          <el-form-item label="角色状态" prop="status">
            <el-radio-group v-model="roleForm.status">
              <el-radio :value="1">启用</el-radio>
              <el-radio :value="2">停用</el-radio>
            </el-radio-group>
          </el-form-item>

          <!--      :default-checked-keys="roleForm.permissions" -->
          <el-form-item label="菜单权限" prop="remark">
            <div style="border: 1px solid #ccc; width: 100%; min-height: 350px">
              <el-tree
                ref="treeRef"
                style="max-width: 600px"
                :data="menuList"
                show-checkbox
                node-key="id"
                :props="{
                  value: 'id',
                  label: 'menuName',
                  children: 'children',
                }"
                @check-change="handleCheckChange"
                default-expand-all
              />
            </div>
          </el-form-item>

          <el-form-item label="角色备注" prop="remark">
            <el-input
              type="textarea"
              v-model="roleForm.remark"
              :autosize="{ minRows: 2, maxRows: 2 }"
            ></el-input>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">提交</el-button>
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
import Pagination from "../../components/pagination/pagination.vue";

import { reactive, ref, nextTick, computed, onMounted } from "vue";
import { roleApi, menuApi } from "../../api/index.js";
import { ElMessage, ElMessageBox } from "element-plus";

let queryForm = ref({
  roleName: "",
});

let tableData = ref([]);

let dialogVisible = ref(false);

let roleForm = ref({
  action: "create",
  roleName: "",
  permissions: [], // 权限标识
  remark: "",
  status: 1,
  sort: 0,
});
let roleFormRef = ref(null);
let treeRef = ref(null);
// 获取菜单列表
let menuList = ref([]);
// 分页
let pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});
// 删除的id数组
let deleteIds = ref([]);

//         ---------    函数方法     ------------------            函数方法     ---------------------

onMounted(() => {
  handleMenuList();
  handleRoleList();
});

// 菜单列表
let handleMenuList = async () => {
  try {
    let res = await menuApi.menuList();
    if (res.code === 200) {
      menuList.value = res.data;
    }
  } catch (error) {
    console.log(error);
  }
};

// 获取角色列表
let handleRoleList = async () => {
  try {
    let data = {
      ...queryForm.value,
      pageNum: pagination.value.currentPage,
      pageSize: pagination.value.pageSize,
    };
    let res = await roleApi.getRoleList(data);
    if (res.code === 200) {
      console.log(res);

      pagination.value.total = res.data.totalItems;

      tableData.value = res.data.list;
    }
  } catch (error) {
    console.log(error);
  }
};

// 处理权限数据
let filterMenuList = (menuList) => {
  // 添加空值检查
  if (!menuList || !Array.isArray(menuList)) {
    return [];
  }
  let pathArray = [];
  // 遍历 menuList
  menuList.forEach((department) => {
    if (department.menuLevel < 3) {
      pathArray.push(department.menuName);
    }
    if (department.children && department.children.length > 0) {
      pathArray = pathArray.concat(filterMenuList(department.children));
    }
  });
  return pathArray;
};

// 查询
const handleQuery = () => {
  console.log("查询");
  handleRoleList();
};

// 重置
const handleReset = () => {
  queryForm.value.roleName = "";
  handleRoleList();
};

// 创建
const handleCreateRole = () => {
  dialogVisible.value = true;
  nextTick(() => {
    roleFormRef.value.resetFields();
    setTimeout(() => {
      treeRef.value.setCheckedKeys([]);
    });
  });
};

// 处理树节点选中变化
let handleCheckChange = (data, checked, indeterminate) => {
  if (treeRef.value) {
    const checkedKeys = treeRef.value.getCheckedKeys();
    const halfCheckedKeys = treeRef.value.getHalfCheckedKeys();
    // 合并选中和半选中的节点ID，并去重
    const allSelectedIds = [...new Set([...checkedKeys, ...halfCheckedKeys])];

    // 将选中的ID保存到roleForm的permissions中
    roleForm.value.permissions = allSelectedIds;
  }
};

// 提交
const handleSubmit = () => {
  roleFormRef.value.validate(async (valid) => {
    if (valid) {
      let res = await roleApi.roleOperate(roleForm.value);
      if (res.code === 200) {
        ElMessage.success("操作成功");
        // 刷新角色列表
        handleRoleList();
        dialogVisible.value = false;
      } else {
        ElMessage.error("操作失败,联系管理员");
      }
    }
  });
};

// 修改状态
const handleStatusChange = async (row) => {
  ElMessageBox.confirm(
    `确定要${row.status === 1 ? "启用" : "禁用"}角色 ${row.roleName} 吗？`,
    "提示",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  )
    .then(async () => {
      row.action = "update";
      let res = await roleApi.roleOperate(row);
      if (res.code === 200) {
        ElMessage.success(`角色${row.roleName}状态已修改`);
        // 刷新角色列表
        handleRoleList();
      }
    })
    .catch(() => {
      if (row.status === 1) {
        row.status = 2;
      } else {
        row.status = 1;
      }
      ElMessage.info("已取消修改状态");
    });
};

// 编辑
const handleEditRole = (row) => {
  dialogVisible.value = true;
  nextTick(() => {
    roleFormRef.value.resetFields();
    roleForm.value = {
      ...row,
      action: "update",
    };
    row.permissions = permissionIds(row.menuList);
    setTimeout(() => {
      treeRef.value.setCheckedKeys(row.menuIds);
    });
  });
};
// 处理权限列表展示
function permissionIds(data) {
  const leafNodes = [];
  data.forEach((item) => {
    if (item.children && item.children.length > 0) {
      leafNodes.push(...permissionIds(item.children));
    } else {
      leafNodes.push(item.id);
    }
  });
  return leafNodes;
}

// 删除
const handleDeleteRole = async (row) => {
  ElMessageBox.confirm(`确定要删除角色 ${row.roleName} 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      // 确认删除
      row.action = "delete";
      let res = await roleApi.roleOperate(row);

      if (res.code === 200) {
        ElMessage.success(`角色${row.roleName}已删除`);
        // 刷新角色列表
        handleRoleList();
      }
    })
    .catch(() => {
      ElMessage.info("已取消删除");
    });
};

// 批量删除
const handleBatchDelete = async () => {
  if (deleteIds.value.length === 0) {
    ElMessage.warning("请选择要删除的角色");
    return;
  }
  ElMessageBox.confirm(`确定要删除选中的${deleteIds.value.length}个角色吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      try {
        // 构造删除请求参数
        const deleteData = {
          action: "delete",
          id: deleteIds.value, // 将选中的ID数组传递给后端
        };

        // 发送删除请求
        let res = await roleApi.roleOperate(deleteData);

        if (res.code === 200) {
          ElMessage.success(res.msg || "删除成功");
          // 清空选中项
          deleteIds.value = [];
          // 刷新角色列表
          handleRoleList();
        } else {
          ElMessage.error(res.msg || "删除失败");
        }
      } catch (error) {
        console.error("删除角色失败:", error);
        ElMessage.error("删除操作出错");
      }
    })
    .catch(() => {
      ElMessage.info("已取消删除");
    });
};

// 获取角色列表ID
const handleSelectionChange = (val) => {
  console.log("选中的数据", val);
  let ids = [];
  val.forEach((item) => {
    ids.push(item.id);
  });
  deleteIds.value = ids;
};

// 分页管理
const handleSizeChange = (val) => {
  console.log("什么东西1", val);
};

const handleCurrentChange = (val) => {
  console.log("什么东西2", val);
  pagination.value.currentPage = val; // 当前页
  handleRoleList();
};
</script>

<style lang="scss" scoped></style>
