<!--
 * @描述: 
 * @版本: 
 * @作者: 
 * @日期: ${year}-${month}-${day}
 * @最后编辑者: sueRimn
 * @最后编辑时间: ${year}-${month}-${day} ${hour}:${minute}:${second}
-->
<template>
  <div class="menu-container">
    <div class="query-form">
      <div class="title">菜单管理</div>
      <div class="query-item">
        <el-input placeholder="请输入菜单名称" v-model="queryForm.menuName"></el-input>
        <el-button type="primary" @click="handleQuery">
          <el-icon><Search /></el-icon>查询</el-button
        >
        <el-button @click="handleReset">
          <el-icon><RefreshLeft /></el-icon>重置</el-button
        >
      </div>
    </div>
    <div class="base-table">
      <!-- 操作  -->
      <div class="action">
        <el-button type="primary" @click="handleCreate">创建菜单</el-button>
      </div>

      <el-table
        :data="tableData"
        :tree-props="{ children: 'children' }"
        row-key="id"
        height="calc(100vh - 255px)"
        style="width: 100%"
      >
        <el-table-column prop="menuName" label="菜单名称" width="180" align="center">
        </el-table-column>
        <el-table-column prop="icon" label="菜单图标" width="120" align="center">
          <template #default="scope">
            <svg-icon
              v-if="scope.row.icon"
              :name="scope.row.icon"
              class="icon"
              style="height: 25px; width: 16px"
            ></svg-icon>
            <span v-else style="color: #909399">无图标</span>
          </template>
        </el-table-column>
        <el-table-column prop="menuLevel" label="菜单类型" width="120" align="center">
          <template #default="scope">
            <el-tag
              :type="
                scope.row.menuLevel === 1
                  ? 'success'
                  : scope.row.menuLevel === 2
                  ? 'primary'
                  : 'warning'
              "
            >
              {{
                scope.row.menuLevel === 1
                  ? "目录"
                  : scope.row.menuLevel === 2
                  ? "菜单"
                  : "按钮"
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序展示" width="80" align="center">
        </el-table-column>
        <el-table-column
          prop="permissionFlag"
          label="权限标识"
          width="250"
          align="center"
        >
        </el-table-column>
        <el-table-column prop="path" label="路由地址" width="180" align="center">
        </el-table-column>
        <el-table-column prop="component" label="组件路径" width="180" align="center">
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">{{
              scope.row.status === 1 ? "启用" : "禁用"
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" align="center">
        </el-table-column>
        <el-table-column
          fixed="right"
          min-width="230"
          prop=""
          label="操作"
          align="center"
        >
          <template #default="scope">
            <span v-if="scope.row.menuLevel != 3">
              <el-button type="primary" size="small" @click="handleAdd(scope.row)"
                >新增</el-button
              ></span
            >
            <el-button type="" size="small" @click="handleEdit(scope.row)"
              >编辑</el-button
            >
            <el-button type="danger" size="small" @click="handleDelete(scope.row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 创建菜单 -->
    <el-dialog
      title="菜单管理"
      v-model="dialogVisible"
      label-width="90px"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form :model="menuForm" :rules="rules" ref="ruleFormRef" label-width="120px">
        <el-form-item label="父菜单" prop="parentId">
          <el-cascader
            v-model="menuForm.parentId"
            placeholder="选择上级菜单"
            style="width: 100%"
            :options="superiorList"
            :show-all-levels="true"
            :props="{
              value: 'id',
              label: 'menuName',
              children: 'children',
              checkStrictly: true, // 开启严格模式
            }"
            clearable
            @change="handleMenu"
          />
        </el-form-item>
        <el-form-item label="菜单类型" prop="menuLevel">
          <el-radio-group v-model="menuForm.menuLevel">
            <el-radio :value="1" size="large">目录</el-radio>
            <el-radio :value="2" size="large">菜单</el-radio>
            <el-radio :value="3" size="large">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单图标" prop="icon" v-show="menuForm.menuLevel == 1">
          <el-input v-model="menuForm.icon" readonly>
            <template #prefix>
              <svg-icon
                :name="menuForm.icon"
                class="icon"
                style="height: 25px; width: 16px; cursor: pointer"
              ></svg-icon>
            </template>
          </el-input>
          <IconSelect @selected="handleIconSelected"></IconSelect>
        </el-form-item>

        <el-form-item label="菜单名称" prop="menuName" v-show="menuForm.menuLevel != 3">
          <el-input v-model="menuForm.menuName"></el-input>
        </el-form-item>

        <el-form-item label="路由地址" prop="path" v-show="menuForm.menuLevel != 3">
          <el-input v-model="menuForm.path"></el-input>
        </el-form-item>
        <el-form-item label="组件地址" prop="component" v-show="menuForm.menuLevel === 2">
          <el-input v-model="menuForm.component"></el-input>
        </el-form-item>
        <el-form-item label="显示顺序" prop="sort" v-show="menuForm.menuLevel != 3">
          <el-input-number
            v-model="menuForm.sort"
            :min="0"
            :max="100"
            style="width: 50%"
          />
        </el-form-item>

        <!-- 权限 -->
        <el-form-item label="权限名称" prop="menuName" v-show="menuForm.menuLevel === 3">
          <el-input v-model="menuForm.menuName"></el-input>
        </el-form-item>
        <el-form-item prop="permissionFlag" v-show="menuForm.menuLevel === 3">
          <template #label>
            <div style="display: flex; align-items: center">
              <el-popover
                class="box-item"
                title="提示"
                :content="content"
                placement="top-start"
              >
                <template #reference>
                  <el-icon
                    style="
                      margin-right: 5px;
                      display: inline-block;
                      vertical-align: middle;
                    "
                    ><QuestionFilled
                  /></el-icon>
                </template>
              </el-popover>
              <span style="display: inline-block; vertical-align: middle">权限标识</span>
            </div>
          </template>
          <el-input v-model="menuForm.permissionFlag"></el-input>
        </el-form-item>
        <el-form-item label="菜单状态" prop="status">
          <el-radio-group v-model="menuForm.status">
            <el-radio :value="1" size="large">启用</el-radio>
            <el-radio :value="2" size="large">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="" @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import Pagination from "../../components/pagination/pagination.vue";
import IconSelect from "../../components/IconSelect/index.vue";
import { menuApi } from "../../api/index.js";
import { executionStatus } from "../../utils/utils.js";

let queryForm = ref({
  menuName: "",
});

let dialogVisible = ref(false);

let ruleFormRef = ref(null);

let menuForm = ref({
  action: "create",
  menuName: "",
  menuLevel: 1,
  type: "",
  permissionFlag: "",
  path: "",
  icon: "",
  component: "",
  description: "",
  status: 1,
  sort: 1,
  parentId: "",
});

let content =
  "权限标识用于控制按钮级别的权限访问(如下拉框、按钮等),请以菜单路由横线开头,如菜单路由为:menu,则权限标识为:menu-create,menu-delete,menu-update)";

let menuInfo = ref({});

let tableData = ref([]);

let superiorList = ref([]);

// 校验
let rules = ref({
  menuName: [{ required: true, message: "请输入菜单名称", trigger: ["blur", "input"] }],
});

//      -----------------   函数  ---------------------------

onMounted(() => {
  handleMenuList();
});

// 查询
let handleQuery = () => {
  console.log("查询");

  handleMenuList();
};

// 重置
let handleReset = () => {
  console.log("重置");
  queryForm.value.menuName = "";
  handleMenuList();
};

// 菜单列表
let handleMenuList = async () => {
  try {
    let res = await menuApi.menuList(queryForm.value);
    console.log("菜单列表", res);

    function processItem(item) {
      if (item.children && item.children.length > 0) {
        item.children.forEach((child) => {
          if (!child.children || child.children.length === 0) {
            child.children = child.permissions || [];
          }
          // 递归处理子项
          processItem(child);
        });
      }
    }
    res.data.forEach(processItem);
    tableData.value = res.data;
    superiorList.value = res.data;
    console.log("菜单列表", res.data);
  } catch (error) {}
};

// 新增
let handleCreate = () => {
  dialogVisible.value = true;
  nextTick(() => {
    ruleFormRef.value.resetFields();
  });
  menuForm.value.action = "create";
};

let handleMenu = (value) => {
  console.log("菜单", value);
  menuForm.value.parentId = value[value.length - 1];
  if (menuForm.value.menuLevel == 3) {
    console.log(superiorList.value);
    menuInfo.value = {};
    let res = handleQueryMenuInfo(value[value.length - 1]);
    if (res) {
      menuInfo.value = res;
    }
  }
  console.log(menuInfo.value);
};

// 查询菜单信息
let handleQueryMenuInfo = (id) => {
  let foundItem = null;
  superiorList.value.forEach((item) => {
    if (item.children && item.children.length) {
      item.children.forEach((child) => {
        if (child.id == id) {
          foundItem = child;
        }
      });
    }
  });
  return foundItem;
};

// 处理图标选择
let handleIconSelected = (iconName) => {
  menuForm.value.icon = iconName;
};

// 提交
let handleSubmit = () => {
  if (menuForm.value.menuLevel == 3) {
    menuForm.value.permissionFlag = menuForm.value.permissionFlag;
  }
  ruleFormRef.value.validate(async (valid) => {
    console.log("valid", valid);
    let res = "";
    if (valid) {
      Object.assign(menuForm.value, { type: menuForm.value.menuLevel });
      res = await menuApi.menuOperate(menuForm.value);
      executionStatus(res);
      dialogVisible.value = false;
      handleMenuList();
    }
  });
};

// 新增
let handleAdd = () => {
  console.log("新增");
  dialogVisible.value = true;
  nextTick(() => {
    ruleFormRef.value.resetFields();
  });
  menuForm.value.action = "create";
  menuForm.value.menuLevel = 2;
};

// 编辑
let handleEdit = (row) => {
  console.log(row);
  dialogVisible.value = true;
  nextTick(() => {
    menuForm.value = {
      ...row,
    };
    menuForm.value.action = "update";
  });
};

// 删除
let handleDelete = (row) => {
  row.action = "delete";

  ElMessageBox.confirm("确定删除该菜单吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      let res = await menuApi.menuOperate(row);
      executionStatus(res);
      handleMenuList();
    })
    .catch(() => {});
};

// const handleCheckAllChange = (val) => {
//   console.log("全选", val);
//   checkedCities.value = val ? cities : [];
//   isIndeterminate.value = false;
// };
// const handleCheckedCitiesChange = (value) => {
//   console.log("选择项目", value);
//   return;
//   const checkedCount = value.length;
//   checkAll.value = checkedCount === cities.length;
//   isIndeterminate.value = checkedCount > 0 && checkedCount < cities.length;
// };
</script>

<style lang="scss" scoped></style>
