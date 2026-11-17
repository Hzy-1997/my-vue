<!-- 联系电话管理 -->
<template>
  <div class="dept-manage">
    <!-- 头部 -->
    <div class="query-form">
      <div class="title">联系电话管理</div>
      <div class="query-item">
        <el-input
          style="min-width: 180px"
          v-model="queryForm.title"
          placeholder="请输入电话名称"
        />
        <el-select
          style="min-width: 180px; margin-right: 20px"
          v-model="queryForm.type"
          placeholder="电话分类"
          clearable
        >
          <el-option label="咨询服务" :value="1" />
          <el-option label="投诉建议" :value="2" />
          <el-option label="紧急救援" :value="3" />
          <el-option label="其他" :value="4" />
        </el-select>
        <el-select
          style="min-width: 180px; margin-right: 20px"
          v-model="queryForm.status"
          placeholder="状态"
          clearable
        >
          <el-option label="正常" :value="1" />
          <el-option label="停用" :value="2" />
        </el-select>
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="handleCreate">创建联系电话</el-button>
      </div>

      <el-table :data="tableData" height="calc(100vh - 255px)" style="width: 100%">
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column prop="title" label="电话名称" min-width="130" align="center" />
        <el-table-column prop="phone" label="电话号码" min-width="130" align="center" />
        <el-table-column prop="type" label="分类" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="typeTagMap[row.type]">{{ typeTextMap[row.type] || '其他' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="area"
          label="归属区域"
          min-width="110"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="description"
          label="描述说明"
          min-width="130"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column prop="status" label="状态" width="150" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              active-text="正常"
              inactive-text="停用"
              :active-value="1"
              :inactive-value="2"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="sortOrder" label="排序" width="180" align="center">
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
      title="创建/编辑联系电话"
      width="50%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
    >
      <div class="form-box">
        <el-form :model="formData" label-width="100px">
          <el-form-item label="电话名称" required>
            <el-input v-model="formData.title" placeholder="如：景区咨询电话" />
          </el-form-item>
          <el-form-item label="电话号码" required>
            <el-input v-model="formData.phone" placeholder="如：0827-8861279" />
          </el-form-item>
          <el-form-item label="电话分类" required>
            <el-select v-model="formData.type" placeholder="请选择分类" style="width: 300px">
              <el-option label="咨询服务" :value="1" />
              <el-option label="投诉建议" :value="2" />
              <el-option label="紧急救援" :value="3" />
              <el-option label="其他" :value="4" />
            </el-select>
          </el-form-item>
          <el-form-item label="归属区域">
            <el-input v-model="formData.area" placeholder="如：光雾山景区、米仓山景区、全域" />
          </el-form-item>
          <el-form-item label="描述说明">
            <el-input
              v-model="formData.description"
              placeholder="如：服务时间 8:30-17:30"
            />
          </el-form-item>
          <el-form-item label="排序" prop="sortOrder">
            <el-input-number
              :min="0"
              :max="9999"
              v-model="formData.sortOrder"
              placeholder="请输入排序"
              style="width: 300px"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-switch
              v-model="formData.status"
              :active-value="1"
              :inactive-value="2"
              active-text="正常"
              inactive-text="停用"
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
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import Pagination from "../../components/pagination/pagination.vue";
import { contactPhoneApi } from "../../api/index.js";

// 分类文案与标签颜色
const typeTextMap = { 1: "咨询服务", 2: "投诉建议", 3: "紧急救援", 4: "其他" };
const typeTagMap = { 1: "primary", 2: "warning", 3: "danger", 4: "info" };

let queryForm = ref({
  title: "",
  type: null,
  status: null,
});

let dialogVisible = ref(false);

const formDataInfo = () => ({
  action: "create",
  title: "",
  phone: "",
  type: 1,
  area: "",
  description: "",
  sortOrder: 0,
  status: 1,
});

let formData = ref(formDataInfo());

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
  getList();
});

let handleQuery = () => {
  pagination.value.currentPage = 1;
  getList();
};

let handleReset = () => {
  queryForm.value = { title: "", type: null, status: null };
  pagination.value.currentPage = 1;
  getList();
};

let handleCreate = () => {
  formData.value = formDataInfo();
  dialogVisible.value = true;
};

// 获取联系电话列表
let getList = async () => {
  let data = {
    ...queryForm.value,
    page: pagination.value.currentPage,
    pageSize: pagination.value.pageSize,
  };
  let res = await contactPhoneApi.getContactPhoneList(data);
  if (res.code == 200) {
    tableData.value = res.data.rows;
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
  if (!formData.value.title) return ElMessage.warning("请输入电话名称");
  if (!formData.value.phone) return ElMessage.warning("请输入电话号码");
  if (!formData.value.type) return ElMessage.warning("请选择电话分类");

  let res = await contactPhoneApi.contactPhoneOperation(formData.value);
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
      let res = await contactPhoneApi.contactPhoneOperation(data);
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
  let res = await contactPhoneApi.contactPhoneOperation(data);
  if (res.code != 200) {
    ElMessage.error(res.message);
  }
  getList();
};

// 编辑
const handleEdit = (row) => {
  formData.value = {
    ...row,
    action: "update",
  };
  dialogVisible.value = true;
};

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm("此操作将永久删除该联系电话, 是否继续?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      let data = { id: row.id, action: "delete" };
      let res = await contactPhoneApi.contactPhoneOperation(data);
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
