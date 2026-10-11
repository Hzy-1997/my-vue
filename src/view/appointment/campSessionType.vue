<!-- 营地期数配置 -->
<template>
  <div class="dept-manage">
    <!-- 头部 -->
    <div class="query-form">
      <div class="title">营期管理</div>
      <div class="query-item">
        <el-input v-model="queryForm.sessionName" placeholder="请输入期数名称" />
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="handleCreate">创建营期</el-button>
      </div>

      <el-table :data="tableData" height="calc(100vh - 255px)" style="width: 100%">
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column prop="sessionName" label="期数名称" align="center" width="100" />
        <el-table-column label="所属夏令营" align="center" width="210">
          <template #default="{ row }">
            {{ campMap[row.campId] || row.campId }}
          </template>
        </el-table-column>
        <el-table-column prop="startDate" label="开始日期" align="center" width="120" />
        <el-table-column prop="endDate" label="结束日期" align="center" width="120" />
        <el-table-column label="总容量" align="center" width="100">
          <template #default="{ row }">
            {{ row.totalInventory == 0 ? "不限" : row.totalInventory }}
          </template>
        </el-table-column>
        <el-table-column prop="soldCount" label="已售人数" align="center" width="100" />
        <el-table-column label="剩余名额" align="center" width="100">
          <template #default="{ row }">
            <span v-if="row.totalInventory == 0">不限</span>
            <span
              v-else
              :style="{
                color: row.totalInventory - row.soldCount <= 0 ? '#f56c6c' : '',
              }"
            >
              {{ row.totalInventory - row.soldCount }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              active-text="启用"
              inactive-text="禁用"
              :active-value="1"
              :inactive-value="2"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="sortOrder" label="排序" align="center">
          <template #default="{ row }">
            <el-input-number
              v-model="row.sortOrder"
              :min="0"
              :max="99999"
              @change="handleSortChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" align="center" />
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" plain size="small" @click="handleEdit(row)"
              >编辑</el-button
            >
            <el-button type="danger" plain size="small" @click="handleDelete(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <Pagination
      :pagination="pagination"
      @handleSizeChange="handleSizeChange"
      @handleCurrentChange="handleCurrentChange"
    />

    <!-- 创建/编辑 -->
    <el-dialog
      v-model="dialogVisible"
      title="创建/编辑营期"
      width="45%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
    >
      <div class="form-box">
        <el-form :model="formData" label-width="110px">
          <el-form-item label="所属夏令营" prop="campId">
            <el-select
              v-model="formData.campId"
              placeholder="请选择夏令营"
              filterable
              style="width: 100%"
            >
              <el-option
                v-for="item in campOptions"
                :key="item.id"
                :label="item.title"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="期数名称" prop="sessionName">
            <el-input v-model="formData.sessionName" placeholder="如：第七期" />
          </el-form-item>
          <el-form-item label="开始日期" prop="startDate">
            <el-date-picker
              v-model="formData.startDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="请选择开始日期"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="结束日期" prop="endDate">
            <el-date-picker
              v-model="formData.endDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="请选择结束日期"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="总容量" prop="totalInventory">
            <el-input-number
              :min="0"
              :max="999999"
              v-model="formData.totalInventory"
              placeholder="0表示不限"
              style="width: 300px"
            />
            <span style="margin-left: 10px; color: #999; font-size: 12px">
              该期可参加人数，0表示不限
            </span>
          </el-form-item>
          <el-form-item label="排序" prop="sortOrder">
            <el-input-number
              :min="0"
              :max="9999"
              v-model="formData.sortOrder"
              placeholder="数值越小越靠前"
              style="width: 300px"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-switch
              v-model="formData.status"
              :active-value="1"
              :inactive-value="2"
              active-text="启用"
              inactive-text="禁用"
              active-color="#13ce66"
              inactive-color="#ddd"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import Pagination from "../../components/pagination/pagination.vue";
import { appointmentApi } from "../../api/index.js";

let queryForm = ref({
  sessionName: "",
});

let dialogVisible = ref(false);

const formDataInfo = () => ({
  action: "create",
  campId: "",
  sessionName: "",
  startDate: "",
  endDate: "",
  totalInventory: 0,
  sortOrder: 0,
  status: 1,
});

let formData = ref(formDataInfo());

// 夏令营选项
let campOptions = ref([]);
const campMap = computed(() => {
  let map = {};
  campOptions.value.forEach((item) => {
    map[item.id] = item.title;
  });
  return map;
});

// 分页参数
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

// 数据列表
let tableData = ref([]);

// ------------------------函数方法----------------------

onMounted(() => {
  getCampOptions();
  getList();
});

// 获取夏令营选项（用于下拉选择与表格展示）
let getCampOptions = async () => {
  let res = await appointmentApi.getCampsiteList({ page: 1, pageSize: 999 });
  if (res.code == 200) {
    campOptions.value = res.data.campsiteList;
  }
};

let handleQuery = () => {
  pagination.value.currentPage = 1;
  getList();
};

let handleReset = () => {
  queryForm.value = { sessionName: "" };
  pagination.value.currentPage = 1;
  getList();
};

let handleCreate = () => {
  formData.value = formDataInfo();
  dialogVisible.value = true;
};

// 营期列表
let getList = async () => {
  let data = {
    ...queryForm.value,
    page: pagination.value.currentPage,
    pageSize: pagination.value.pageSize,
  };
  let res = await appointmentApi.getCampsiteSessionList(data);
  if (res.code == 200) {
    tableData.value = res.data.campsiteSessionList;
    pagination.value.total = res.data.count;
  } else {
    ElMessage.error(res.message);
  }
};

// 分页
const handleSizeChange = (val) => {
  pagination.value.pageSize = val;
  getList();
};
const handleCurrentChange = (val) => {
  pagination.value.currentPage = val;
  getList();
};

// 提交表单
const handleSubmit = async () => {
  if (!formData.value.campId) return ElMessage.warning("请选择夏令营");
  if (!formData.value.sessionName) return ElMessage.warning("请输入期数名称");
  if (!formData.value.startDate || !formData.value.endDate)
    return ElMessage.warning("请选择起止日期");
  if (
    formData.value.totalInventory != 0 &&
    formData.value.soldCount !== undefined &&
    formData.value.totalInventory < formData.value.soldCount
  )
    return ElMessage.warning("总容量不能小于已售人数");

  let res = await appointmentApi.campsiteOperate(formData.value);
  if (res.code == 200) {
    dialogVisible.value = false;
    ElMessage.success(res.message);
    getList();
  } else {
    ElMessage.error(res.message);
  }
};

// 修改状态
const handleStatusChange = (row) => {
  ElMessageBox.confirm("确定要修改状态吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      let data = { id: row.id, status: row.status, action: "update" };
      let res = await appointmentApi.campsiteOperate(data);
      if (res.code == 200) {
        ElMessage.success(res.message);
        getList();
      } else {
        ElMessage.error(res.message);
      }
    })
    .catch(() => {
      row.status = row.status === 1 ? 2 : 1;
    });
};

// 修改排序
const handleSortChange = async (row) => {
  let data = { id: row.id, sortOrder: row.sortOrder, action: "update" };
  let res = await appointmentApi.campsiteOperate(data);
  if (res.code != 200) {
    ElMessage.error(res.message);
  }
  getList();
};

// 编辑
const handleEdit = (row) => {
  formData.value = { ...row, action: "update" };
  dialogVisible.value = true;
};

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm("此操作将永久删除该营期, 是否继续?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      let data = { id: row.id, action: "delete" };
      let res = await appointmentApi.campsiteOperate(data);
      if (res.code == 200) {
        ElMessage.success(res.message);
        getList();
      } else {
        ElMessage.error(res.message);
      }
    })
    .catch(() => {
      ElMessage.info("已取消删除");
    });
};
</script>

<style lang="scss" scoped></style>
