<!-- 票档管理 -->
<template>
  <div class="dept-manage">
    <!-- 头部 -->
    <div class="query-form">
      <div class="title">票档管理</div>
      <div class="query-item">
        <el-select
          v-model="queryForm.campId"
          placeholder="请选择夏令营"
          filterable
          clearable
          style="width: 180px; margin-right: 20px"
        >
          <el-option
            v-for="item in campOptions"
            :key="item.id"
            :label="item.title"
            :value="item.id"
          />
        </el-select>
        <el-select
          v-model="queryForm.sessionId"
          placeholder="请选择营期"
          filterable
          clearable
          style="width: 160px; margin-right: 20px"
        >
          <el-option
            v-for="item in querySessionOptions"
            :key="item.id"
            :label="item.sessionName"
            :value="item.id"
          />
        </el-select>

        <el-input
          v-model="queryForm.ticketName"
          placeholder="请输入票档名称"
          style="width: 180px"
        />
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="handleCreate">创建票档</el-button>
      </div>

      <el-table :data="tableData" height="calc(100vh - 255px)" style="width: 100%">
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column prop="ticketName" label="票档名称" min-width="140" />
        <el-table-column label="价格（元/单）" align="center">
          <template #default="{ row }"> ¥{{ Number(row.price).toFixed(2) }} </template>
        </el-table-column>
        <el-table-column label="所属夏令营" align="center">
          <template #default="{ row }">
            {{ campMap[row.campId] || row.campId }}
          </template>
        </el-table-column>
        <el-table-column label="适用营期" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.session" type="success" size="small">
              {{ row.session.sessionName }}
            </el-tag>
            <el-tag v-else type="info" size="small">全营期通用</el-tag>
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
      title="创建/编辑票档"
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
              @change="handleCampChange"
            >
              <el-option
                v-for="item in campOptions"
                :key="item.id"
                :label="item.title"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="适用营期" prop="sessionId">
            <el-select
              v-model="formData.sessionId"
              placeholder="不选则全营期通用"
              filterable
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="item in formSessionOptions"
                :key="item.id"
                :label="`${item.sessionName}（${item.startDate} ~ ${item.endDate}）`"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="票档名称" prop="ticketName">
            <el-input
              v-model="formData.ticketName"
              placeholder="如：标准套餐 / VIP套餐"
            />
          </el-form-item>
          <el-form-item label="价格" prop="price">
            <el-input-number
              :min="0"
              :precision="2"
              v-model="formData.price"
              placeholder="请输入一单总价"
              style="width: 300px"
            />
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
  campId: "",
  sessionId: "",
  ticketName: "",
});

let dialogVisible = ref(false);

const formDataInfo = () => ({
  action: "create",
  campId: "",
  sessionId: "",
  ticketName: "",
  price: 0,
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

// 营期选项（接口不支持按营地过滤，拉全量后前端过滤）
let allSessions = ref([]);

// 查询区营期选项：选了夏令营则只显示该营地营期
const querySessionOptions = computed(() => {
  if (!queryForm.value.campId) return allSessions.value;
  return allSessions.value.filter((item) => item.campId == queryForm.value.campId);
});

// 表单区营期选项：跟随表单所选夏令营
const formSessionOptions = computed(() => {
  if (!formData.value.campId) return allSessions.value;
  return allSessions.value.filter((item) => item.campId == formData.value.campId);
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
  getSessionOptions();
  getList();
});

// 获取夏令营选项（用于下拉选择与表格展示）
let getCampOptions = async () => {
  let res = await appointmentApi.getCampsiteList({ page: 1, pageSize: 999 });
  if (res.code == 200) {
    campOptions.value = res.data.campsiteList;
  }
};

// 获取营期选项
let getSessionOptions = async () => {
  let res = await appointmentApi.getCampsiteSessionList({
    page: 1,
    pageSize: 999,
  });
  if (res.code == 200) {
    allSessions.value = res.data.campsiteSessionList;
  }
};

// 表单中切换夏令营时清空营期，避免脏数据
const handleCampChange = () => {
  formData.value.sessionId = "";
};

let handleQuery = () => {
  pagination.value.currentPage = 1;
  getList();
};

let handleReset = () => {
  queryForm.value = { campId: "", sessionId: "", ticketName: "" };
  pagination.value.currentPage = 1;
  getList();
};

let handleCreate = () => {
  formData.value = formDataInfo();
  dialogVisible.value = true;
};

// 票档列表
let getList = async () => {
  let data = {
    ...queryForm.value,
    page: pagination.value.currentPage,
    pageSize: pagination.value.pageSize,
  };
  let res = await appointmentApi.getCampsiteTicketList(data);
  if (res.code == 200) {
    tableData.value = res.data.campsiteTicketList;
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
  if (!formData.value.ticketName) return ElMessage.warning("请输入票档名称");
  if (formData.value.price === undefined || formData.value.price === null)
    return ElMessage.warning("请输入价格");

  let data = {
    action: formData.value.action,
    id: formData.value.id,
    campId: formData.value.campId,
    sessionId: formData.value.sessionId || null,
    ticketName: formData.value.ticketName,
    price: formData.value.price,
    sortOrder: formData.value.sortOrder,
    status: formData.value.status,
  };

  let res = await appointmentApi.campsiteTicketOperation(data);
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
      let res = await appointmentApi.campsiteTicketOperation(data);
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
  let res = await appointmentApi.campsiteTicketOperation(data);
  if (res.code != 200) {
    ElMessage.error(res.message);
  }
  getList();
};

// 编辑
const handleEdit = (row) => {
  formData.value = { ...row, sessionId: row.sessionId || "", action: "update" };
  dialogVisible.value = true;
};

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm("此操作将永久删除该票档, 是否继续?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      let data = { id: row.id, action: "delete" };
      let res = await appointmentApi.campsiteTicketOperation(data);
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
