<template>
  <div class="dict-data-manage">
    <div class="query-form">
      <div class="title">【{{ dictInfo.dictName }}】的字典数据</div>
      <div class="query-item">
        <el-input
          placeholder="请输入字典标签"
          v-model="dataQuery.dictLabel"
          clearable
        ></el-input>
        <el-button type="primary" @click="handleDataQuery">查询</el-button>
        <el-button @click="handleDataReset">重置</el-button>
        <el-button type="warning" plain @click="handleBack">返回</el-button>
      </div>
    </div>

    <div class="base-table">
      <!-- 操作 -->
      <div class="action">
        <el-button type="primary" @click="handleDataCreate">新增数据</el-button>
      </div>

      <!-- 列表 -->
      <el-table :data="dataData" style="width: 100%" height="calc(100vh - 255px)">
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column prop="dictSort" label="排序" width="80" align="center" />
        <el-table-column prop="dictLabel" label="字典标签" min-width="140" align="center" show-overflow-tooltip />
        <el-table-column prop="dictValue" label="字典值" min-width="140" align="center" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="230" align="center">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              active-text="启用"
              inactive-text="禁用"
              :active-value="1"
              :inactive-value="2"
              @change="handleDataStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" align="center" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="创建时间" width="170" align="center" />
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleDataEdit(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDataDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 字典数据弹窗 -->
    <el-dialog
      :title="dataForm.action === 'create' ? '新增字典数据' : '编辑字典数据'"
      v-model="dataDialogVisible"
      width="40%"
      :close-on-click-modal="false"
    >
      <el-form :model="dataForm" :rules="dataRules" ref="dataFormRef" label-width="90px">
        <el-form-item label="所属类型" prop="dictType">
          <el-input v-model="dataForm.dictType" disabled></el-input>
        </el-form-item>
        <el-form-item label="字典标签" prop="dictLabel">
          <el-input v-model="dataForm.dictLabel" placeholder="如：男"></el-input>
        </el-form-item>
        <el-form-item label="字典值" prop="dictValue">
          <el-input v-model="dataForm.dictValue" placeholder="如：0"></el-input>
        </el-form-item>
        <el-form-item label="字典排序" prop="dictSort">
          <el-input type="number" v-model="dataForm.dictSort"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="dataForm.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="2">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            type="textarea"
            v-model="dataForm.remark"
            :autosize="{ minRows: 2, maxRows: 2 }"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dataDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleDataSubmit">提交</el-button>
        </span>
      </template>
    </el-dialog>

    <div class="table-pagination">
      <Pagination
        :pagination="dataPagination"
        @handleCurrentChange="handleDataPageChange"
      />
    </div>
  </div>
</template>

<script setup>
import Pagination from "../../components/pagination/pagination.vue";

import { ref, nextTick, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { dictApi } from "../../api/index.js";
import { ElMessage, ElMessageBox } from "element-plus";

const router = useRouter();
const route = useRoute();

// 路由参数携带的字典类型信息
let dictInfo = ref({
  dictType: "",
  dictName: "",
});

let dataQuery = ref({
  dictLabel: "",
});
let dataData = ref([]);
let dataPagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});
let dataDialogVisible = ref(false);
let dataFormRef = ref(null);
let dataForm = ref({});
let dataRules = {
  dictLabel: [{ required: true, message: "请输入字典标签", trigger: "blur" }],
  dictValue: [{ required: true, message: "请输入字典值", trigger: "blur" }],
};

//         ---------    函数方法     ------------------            函数方法     ---------------------

onMounted(() => {
  let { dictType, dictName } = route.query;
  if (!dictType) {
    ElMessage.warning("缺少字典类型参数");
    router.back();
    return;
  }
  dictInfo.value = { dictType, dictName: dictName || dictType };
  handleDataList();
});

// 返回字典类型页
let handleBack = () => {
  router.back();
};

// 获取字典数据列表
let handleDataList = async () => {
  try {
    let res = await dictApi.getDictDataList({
      dictType: dictInfo.value.dictType,
      dictLabel: dataQuery.value.dictLabel,
      page: dataPagination.value.currentPage,
      pageSize: dataPagination.value.pageSize,
    });
    if (res.code === 200) {
      dataData.value = res.data.rows;
      dataPagination.value.total = res.data.count;
    }
  } catch (error) {
    console.log(error);
  }
};

// 查询/重置
let handleDataQuery = () => {
  dataPagination.value.currentPage = 1;
  handleDataList();
};

let handleDataReset = () => {
  dataQuery.value.dictLabel = "";
  handleDataQuery();
};

// 分页
let handleDataPageChange = (val) => {
  dataPagination.value.currentPage = val;
  handleDataList();
};

// 新增数据
let handleDataCreate = () => {
  dataForm.value = {
    action: "create",
    dictType: dictInfo.value.dictType,
    dictLabel: "",
    dictValue: "",
    dictSort: 0,
    status: 1,
    remark: "",
  };
  dataDialogVisible.value = true;
  nextTick(() => dataFormRef.value?.clearValidate());
};

// 编辑数据
let handleDataEdit = (row) => {
  dataForm.value = { ...row, action: "update" };
  dataDialogVisible.value = true;
  nextTick(() => dataFormRef.value?.clearValidate());
};

// 提交数据表单
let handleDataSubmit = () => {
  dataFormRef.value.validate(async (valid) => {
    if (!valid) return;
    let res = await dictApi.dictDataOperate(dataForm.value);
    if (res.code === 200) {
      ElMessage.success("操作成功");
      dataDialogVisible.value = false;
      handleDataList();
    } else {
      ElMessage.error(res.message || "操作失败");
    }
  });
};

// 状态切换
let handleDataStatusChange = (row) => {
  ElMessageBox.confirm(
    `确定要${row.status === 1 ? "启用" : "禁用"}字典数据 ${row.dictLabel} 吗？`,
    "提示",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  )
    .then(async () => {
      let res = await dictApi.dictDataOperate({ ...row, action: "update" });
      if (res.code === 200) {
        ElMessage.success("状态已修改");
        handleDataList();
      }
    })
    .catch(() => {
      row.status = row.status === 1 ? 2 : 1;
      ElMessage.info("已取消修改状态");
    });
};

// 删除数据
let handleDataDelete = (row) => {
  ElMessageBox.confirm(`确定要删除字典数据 ${row.dictLabel} 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      let res = await dictApi.dictDataOperate({ ...row, action: "delete" });
      if (res.code === 200) {
        ElMessage.success("删除成功");
        handleDataList();
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
