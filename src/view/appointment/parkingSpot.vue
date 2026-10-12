<!-- 停车场车位管理 -->
<template>
  <div class="dept-manage">
    <!-- 头部 -->
    <div class="query-form">
      <div class="title">车位管理</div>
      <div class="query-item">
        <el-select
          v-model="queryForm.parkingId"
          placeholder="请选择停车场"
          filterable
          clearable
          style="width: 200px; margin-right: 20px"
        >
          <el-option
            v-for="item in parkingOptions"
            :key="item.id"
            :label="item.title"
            :value="item.id"
          />
        </el-select>
        <el-select
          v-model="queryForm.status"
          placeholder="车位状态"
          clearable
          style="width: 140px; margin-right: 30px"
        >
          <el-option label="启用" :value="1" />
          <el-option label="停用维护" :value="2" />
        </el-select>
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="handleCreate">创建车位</el-button>
        <el-button type="success" plain @click="handleBatchCreate"
          >批量创建车位</el-button
        >
      </div>

      <el-table :data="tableData" height="calc(100vh - 255px)" style="width: 100%">
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column prop="spotNumber" label="车位编号" min-width="120" />
        <el-table-column label="所属停车场" min-width="160">
          <template #default="{ row }">
            {{ parkingMap[row.parkingId] || row.parkingId }}
          </template>
        </el-table-column>
        <el-table-column prop="area" label="区域/楼层" width="110" align="center">
          <template #default="{ row }">
            {{ row.area || "-" }}
          </template>
        </el-table-column>
        <el-table-column label="车位类型" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="spotTypeTag[row.spotType]">{{
              spotTypeMap[row.spotType]
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="160" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              active-text="启用"
              inactive-text="停用"
              :active-value="1"
              :inactive-value="2"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="sortOrder" label="排序" width="160" align="center">
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
      title="创建/编辑车位"
      width="45%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
    >
      <div class="form-box">
        <el-form :model="formData" label-width="110px">
          <el-form-item label="所属停车场" prop="parkingId">
            <el-select
              v-model="formData.parkingId"
              placeholder="请选择停车场"
              filterable
              :disabled="formData.action === 'update'"
              style="width: 100%"
            >
              <el-option
                v-for="item in parkingOptions"
                :key="item.id"
                :label="item.title"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="车位编号" prop="spotNumber">
            <el-input v-model="formData.spotNumber" placeholder="如：B1-A03" />
          </el-form-item>
          <el-form-item label="区域/楼层" prop="area">
            <el-input v-model="formData.area" placeholder="如：B1、地面A区" />
          </el-form-item>
          <el-form-item label="车位类型" prop="spotType">
            <el-select v-model="formData.spotType" style="width: 100%">
              <el-option label="普通" :value="1" />
              <el-option label="充电桩" :value="2" />
              <el-option label="无障碍" :value="3" />
              <el-option label="大型车" :value="4" />
            </el-select>
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
              inactive-text="停用维护"
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

    <!-- 批量创建 -->
    <el-dialog
      v-model="batchDialogVisible"
      title="批量创建车位"
      width="45%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
    >
      <div class="form-box">
        <el-form :model="batchForm" label-width="110px">
          <el-form-item label="所属停车场" prop="parkingId">
            <el-select
              v-model="batchForm.parkingId"
              placeholder="请选择停车场"
              filterable
              style="width: 100%"
            >
              <el-option
                v-for="item in parkingOptions"
                :key="item.id"
                :label="item.title"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="编号前缀" prop="prefix">
            <el-input
              v-model="batchForm.prefix"
              placeholder="如：B1-A（将生成 B1-A01、B1-A02…）"
            />
          </el-form-item>
          <el-form-item label="起始编号" prop="start">
            <el-input-number
              :min="1"
              :max="9999"
              v-model="batchForm.start"
              style="width: 300px"
            />
          </el-form-item>
          <el-form-item label="创建数量" prop="count">
            <el-input-number
              :min="1"
              :max="500"
              v-model="batchForm.count"
              style="width: 300px"
            />
          </el-form-item>
          <el-form-item label="区域/楼层" prop="area">
            <el-input v-model="batchForm.area" placeholder="如：B1、地面A区" />
          </el-form-item>
          <el-form-item label="车位类型" prop="spotType">
            <el-select v-model="batchForm.spotType" style="width: 100%">
              <el-option label="普通" :value="1" />
              <el-option label="充电桩" :value="2" />
              <el-option label="无障碍" :value="3" />
              <el-option label="大型车" :value="4" />
            </el-select>
          </el-form-item>
          <el-form-item label="排序" prop="sortOrder">
            <el-input-number
              :min="0"
              :max="9999"
              v-model="batchForm.sortOrder"
              style="width: 300px"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleBatchSubmit">确定</el-button>
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

// 车位类型映射 1普通 2充电桩 3无障碍 4大型车
const spotTypeMap = { 1: "普通", 2: "充电桩", 3: "无障碍", 4: "大型车" };
const spotTypeTag = { 1: "info", 2: "success", 3: "warning", 4: "danger" };

let queryForm = ref({
  parkingId: "",
  status: "",
});

let dialogVisible = ref(false);
let batchDialogVisible = ref(false);

const formDataInfo = () => ({
  action: "create",
  parkingId: "",
  spotNumber: "",
  area: "",
  spotType: 1,
  sortOrder: 0,
  status: 1,
});

let formData = ref(formDataInfo());

const batchFormInfo = () => ({
  action: "batchCreate",
  parkingId: "",
  prefix: "",
  start: 1,
  count: 10,
  area: "",
  spotType: 1,
  sortOrder: 0,
});

let batchForm = ref(batchFormInfo());

// 停车场选项
let parkingOptions = ref([]);
const parkingMap = computed(() => {
  let map = {};
  parkingOptions.value.forEach((item) => {
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
  getParkingOptions();
  getList();
});

// 获取停车场选项（用于下拉选择与表格展示）
let getParkingOptions = async () => {
  let res = await appointmentApi.getParkingList({ page: 1, pageSize: 999 });
  if (res.code == 200) {
    parkingOptions.value = res.data.parkingList;
  }
};

let handleQuery = () => {
  pagination.value.currentPage = 1;
  getList();
};

let handleReset = () => {
  queryForm.value = { parkingId: "", status: "" };
  pagination.value.currentPage = 1;
  getList();
};

let handleCreate = () => {
  // 带出当前筛选的停车场
  formData.value = {
    ...formDataInfo(),
    parkingId: queryForm.value.parkingId || "",
  };
  dialogVisible.value = true;
};

let handleBatchCreate = () => {
  batchForm.value = {
    ...batchFormInfo(),
    parkingId: queryForm.value.parkingId || "",
  };
  batchDialogVisible.value = true;
};

// 车位列表
let getList = async () => {
  let data = {
    action: "list",
    ...queryForm.value,
    page: pagination.value.currentPage,
    pageSize: pagination.value.pageSize,
  };
  let res = await appointmentApi.parkingSpotOperation(data);
  if (res.code == 200) {
    tableData.value = res.data.spotList;
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

// 提交表单（创建/更新）
const handleSubmit = async () => {
  if (!formData.value.parkingId) return ElMessage.warning("请选择停车场");
  if (!formData.value.spotNumber) return ElMessage.warning("请输入车位编号");

  let res = await appointmentApi.parkingSpotOperation(formData.value);
  if (res.code == 200) {
    dialogVisible.value = false;
    ElMessage.success(res.message);
    getList();
  } else {
    ElMessage.error(res.message);
  }
};

// 提交批量创建
const handleBatchSubmit = async () => {
  if (!batchForm.value.parkingId) return ElMessage.warning("请选择停车场");
  if (!batchForm.value.prefix) return ElMessage.warning("请输入编号前缀");
  if (!batchForm.value.count) return ElMessage.warning("请输入创建数量");

  ElMessageBox.confirm(`将批量创建 ${batchForm.value.count} 个车位，是否继续?`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      let res = await appointmentApi.parkingSpotOperation(batchForm.value);
      if (res.code == 200) {
        batchDialogVisible.value = false;
        ElMessage.success(res.message);
        getList();
      } else {
        ElMessage.error(res.message);
      }
    })
    .catch(() => {});
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
      let res = await appointmentApi.parkingSpotOperation(data);
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
  let res = await appointmentApi.parkingSpotOperation(data);
  if (res.code != 200) {
    ElMessage.error(res.message);
  }
};

// 编辑
const handleEdit = (row) => {
  formData.value = {
    id: row.id,
    action: "update",
    parkingId: row.parkingId,
    spotNumber: row.spotNumber,
    area: row.area || "",
    spotType: row.spotType,
    sortOrder: row.sortOrder,
    status: row.status,
  };
  dialogVisible.value = true;
};

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`此操作将永久删除车位「${row.spotNumber}」, 是否继续?`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      let data = { id: row.id, action: "delete" };
      let res = await appointmentApi.parkingSpotOperation(data);
      if (res.code == 200) {
        ElMessage.success(res.message);
        getList();
      } else {
        // 存在关联预约记录等情况下后端会返回具体原因
        ElMessage.warning(res.message);
      }
    })
    .catch(() => {
      ElMessage.info("已取消删除");
    });
};
</script>

<style lang="scss" scoped></style>
