<template>
  <div class="dict-manage">
    <div class="query-form">
      <div class="title">字典管理</div>
      <div class="query-item">
        <el-input
          placeholder="请输入字典名称"
          v-model="typeQuery.dictName"
          clearable
        ></el-input>
        <el-button type="primary" @click="handleTypeQuery">查询</el-button>
        <el-button @click="handleTypeReset">重置</el-button>
      </div>
    </div>

    <div class="base-table">
      <!-- 操作 -->
      <div class="action">
        <el-button type="primary" @click="handleTypeCreate">新增类型</el-button>
      </div>

      <!-- 列表 -->
      <el-table :data="typeData" style="width: 100%" height="calc(100vh - 255px)">
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column prop="dictName" label="字典名称" min-width="150" align="center" show-overflow-tooltip />
        <el-table-column prop="dictType" label="字典类型" min-width="150" align="center" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="230" align="center">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              active-text="启用"
              inactive-text="禁用"
              :active-value="1"
              :inactive-value="2"
              @change="handleTypeStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="130" align="center" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="创建时间" width="170" align="center" />
        <el-table-column label="操作" width="230" align="center" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleGoData(scope.row)">字典数据</el-button>
            <el-button type="primary" size="small" @click="handleTypeEdit(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleTypeDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 字典类型弹窗 -->
    <el-dialog
      :title="typeForm.action === 'create' ? '新增字典类型' : '编辑字典类型'"
      v-model="typeDialogVisible"
      width="40%"
      :close-on-click-modal="false"
    >
      <el-form :model="typeForm" :rules="typeRules" ref="typeFormRef" label-width="90px">
        <el-form-item label="字典名称" prop="dictName">
          <el-input v-model="typeForm.dictName" placeholder="如：用户性别"></el-input>
        </el-form-item>
        <el-form-item label="字典类型" prop="dictType">
          <el-input
            v-model="typeForm.dictType"
            placeholder="如：sys_user_sex"
            :disabled="typeForm.action === 'update'"
          ></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="typeForm.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="2">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            type="textarea"
            v-model="typeForm.remark"
            :autosize="{ minRows: 2, maxRows: 2 }"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="typeDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleTypeSubmit">提交</el-button>
        </span>
      </template>
    </el-dialog>

    <div class="table-pagination">
      <Pagination
        :pagination="typePagination"
        @handleCurrentChange="handleTypePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import Pagination from "../../components/pagination/pagination.vue";

import { ref, nextTick, onMounted } from "vue";
import { useRouter } from "vue-router";
import { dictApi } from "../../api/index.js";
import { ElMessage, ElMessageBox } from "element-plus";

const router = useRouter();

let typeQuery = ref({
  dictName: "",
});
let typeData = ref([]);
let typePagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});
let typeDialogVisible = ref(false);
let typeFormRef = ref(null);
let typeForm = ref({});
let typeRules = {
  dictName: [{ required: true, message: "请输入字典名称", trigger: "blur" }],
  dictType: [{ required: true, message: "请输入字典类型", trigger: "blur" }],
};

//         ---------    函数方法     ------------------            函数方法     ---------------------

onMounted(() => {
  handleTypeList();
});

// 获取字典类型列表
let handleTypeList = async () => {
  try {
    let res = await dictApi.getDictTypeList({
      ...typeQuery.value,
      page: typePagination.value.currentPage,
      pageSize: typePagination.value.pageSize,
    });
    if (res.code === 200) {
      typeData.value = res.data.rows;
      typePagination.value.total = res.data.count;
    }
  } catch (error) {
    console.log(error);
  }
};

// 查询/重置
let handleTypeQuery = () => {
  typePagination.value.currentPage = 1;
  handleTypeList();
};

let handleTypeReset = () => {
  typeQuery.value.dictName = "";
  handleTypeQuery();
};

// 分页
let handleTypePageChange = (val) => {
  typePagination.value.currentPage = val;
  handleTypeList();
};

// 跳转字典数据页（若依式：query 携带类型信息）
let handleGoData = (row) => {
  router.push({
    path: "/system/dictData",
    query: {
      dictType: row.dictType,
      dictName: row.dictName,
    },
  });
};

// 新增类型
let handleTypeCreate = () => {
  typeForm.value = {
    action: "create",
    dictName: "",
    dictType: "",
    status: 1,
    remark: "",
  };
  typeDialogVisible.value = true;
  nextTick(() => typeFormRef.value?.clearValidate());
};

// 编辑类型（dictType 为业务编码，编辑时不允许修改）
let handleTypeEdit = (row) => {
  typeForm.value = { ...row, action: "update" };
  typeDialogVisible.value = true;
  nextTick(() => typeFormRef.value?.clearValidate());
};

// 提交类型表单
let handleTypeSubmit = () => {
  typeFormRef.value.validate(async (valid) => {
    if (!valid) return;
    let res = await dictApi.dictTypeOperate(typeForm.value);
    if (res.code === 200) {
      ElMessage.success("操作成功");
      typeDialogVisible.value = false;
      handleTypeList();
    } else {
      ElMessage.error(res.message || "操作失败");
    }
  });
};

// 状态切换
let handleTypeStatusChange = (row) => {
  ElMessageBox.confirm(
    `确定要${row.status === 1 ? "启用" : "禁用"}字典类型 ${row.dictName} 吗？`,
    "提示",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  )
    .then(async () => {
      let res = await dictApi.dictTypeOperate({ ...row, action: "update" });
      if (res.code === 200) {
        ElMessage.success("状态已修改");
        handleTypeList();
      }
    })
    .catch(() => {
      row.status = row.status === 1 ? 2 : 1;
      ElMessage.info("已取消修改状态");
    });
};

// 删除类型
let handleTypeDelete = (row) => {
  ElMessageBox.confirm(`确定要删除字典类型 ${row.dictName} 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      let res = await dictApi.dictTypeOperate({ ...row, action: "delete" });
      if (res.code === 200) {
        ElMessage.success("删除成功");
        handleTypeList();
      } else {
        ElMessage.error(res.message || "删除失败");
      }
    })
    .catch(() => {
      ElMessage.info("已取消删除");
    });
};
</script>

<style lang="scss" scoped></style>
