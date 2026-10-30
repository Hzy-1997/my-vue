<!-- 游客服务管理 -->
<template>
  <div class="dept-manage">
    <!-- 头部 -->
    <div class="query-form">
      <div class="title">游客服务管理</div>
      <div class="query-item">
        <el-input v-model="queryForm.title" placeholder="请输入服务标题" />
        <el-select v-model="queryForm.status" placeholder="服务状态" clearable>
          <el-option label="正常" :value="1" />
          <el-option label="下架" :value="2" />
        </el-select>
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="handleCreate">创建服务点位</el-button>
      </div>

      <el-table :data="tableData" height="calc(100vh - 255px)" style="width: 100%">
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column prop="title" label="服务标题" min-width="130" align="center" />
        <el-table-column
          prop="shortDesc"
          label="简短描述"
          min-width="130"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column label="服务图片" width="110" align="center">
          <template #default="{ row }">
            <el-image
              v-if="row.picture"
              :src="imgUrl + row.picture"
              :preview-src-list="[imgUrl + row.picture]"
              preview-teleported
              style="width: 80px; height: 60px"
              fit="cover"
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="address"
          label="服务地址"
          min-width="130"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="location"
          label="位置"
          min-width="110"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column prop="status" label="状态" width="150" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              active-text="正常"
              inactive-text="下架"
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
      title="创建/编辑游客服务"
      width="50%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
    >
      <div class="form-box">
        <el-form :model="formData" label-width="100px">
          <el-form-item label="服务标题" required>
            <el-input v-model="formData.title" placeholder="如：游客服务处" />
          </el-form-item>
          <el-form-item label="简短描述">
            <el-input v-model="formData.shortDesc" placeholder="如：游园咨询一站式" />
          </el-form-item>
          <el-form-item label="服务图片" required>
            <ImageUpload
              :limit="1"
              category="service"
              v-model="formData.picture"
            ></ImageUpload>
          </el-form-item>
          <el-form-item label="服务地址" required>
            <el-input v-model="formData.address" placeholder="请输入服务地址" />
          </el-form-item>
          <el-form-item label="位置" required>
            <el-input v-model="formData.location" placeholder="请输入位置" />
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
              inactive-text="下架"
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
import ImageUpload from "../../components/ImageUpload/index.vue";
import Pagination from "../../components/pagination/pagination.vue";
import { imageEdit } from "../../utils/utils.js";
import { serviceSuggestionsApi } from "../../api/index.js";

const imgUrl = import.meta.env.VITE_IMG_URL;

let queryForm = ref({
  title: "",
  status: null,
});

let dialogVisible = ref(false);

const formDataInfo = () => ({
  action: "create",
  title: "",
  shortDesc: "",
  picture: [],
  address: "",
  location: "",
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
  queryForm.value = { title: "", status: null };
  pagination.value.currentPage = 1;
  getList();
};

let handleCreate = () => {
  formData.value = formDataInfo();
  dialogVisible.value = true;
};

// 获取游客服务列表
let getList = async () => {
  let data = {
    ...queryForm.value,
    page: pagination.value.currentPage,
    pageSize: pagination.value.pageSize,
  };
  let res = await serviceSuggestionsApi.getTouristServicesList(data);
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
  if (!formData.value.title) return ElMessage.warning("请输入服务标题");
  if (!formData.value.address) return ElMessage.warning("请输入服务地址");
  if (!formData.value.location) return ElMessage.warning("请输入位置");
  if (
    !formData.value.picture ||
    (Array.isArray(formData.value.picture) && formData.value.picture.length === 0)
  ) {
    return ElMessage.warning("请上传服务图片");
  }

  if (Array.isArray(formData.value.picture) && formData.value.picture.length > 0) {
    formData.value.picture = imageEdit(formData.value.picture);
  }

  let res = await serviceSuggestionsApi.touristServicesOperation(formData.value);
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
      let res = await serviceSuggestionsApi.touristServicesOperation(data);
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
  let res = await serviceSuggestionsApi.touristServicesOperation(data);
  if (res.code != 200) {
    ElMessage.error(res.message);
  }
  getList();
};

// 编辑
const handleEdit = (row) => {
  formData.value = {
    ...row,
    picture: row.picture ? [{ url: imgUrl + row.picture }] : [],
    action: "update",
  };
  dialogVisible.value = true;
};

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm("此操作将永久删除该游客服务, 是否继续?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      let data = { id: row.id, action: "delete" };
      let res = await serviceSuggestionsApi.touristServicesOperation(data);
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
