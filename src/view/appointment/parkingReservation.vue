<!-- 停车场管理 -->
<template>
  <div class="dept-manage">
    <!-- 头部 -->
    <div class="query-form">
      <div class="title">停车场管理</div>
      <div class="query-item">
        <el-input v-model="queryForm.title" placeholder="请输入停车场名称" />
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="handleCreate">创建停车场</el-button>
      </div>

      <el-table :data="tableData" height="calc(100vh - 255px)" style="width: 100%">
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column prop="title" label="停车场名称" min-width="180" />
        <el-table-column prop="image" label="封面图" width="130" align="center">
          <template #default="scope">
            <el-image
              v-if="scope.row.image"
              :src="imgUrl + scope.row.image"
              style="width: 100px; height: 60px"
            />
          </template>
        </el-table-column>

        <el-table-column prop="price" label="价格" width="100" align="center" />
        <el-table-column
          prop="availableCount"
          label="可预约车位"
          width="120"
          align="center"
        />
        <el-table-column prop="phone" label="联系电话" width="140" align="center" />
        <el-table-column
          prop="businessHours"
          label="营业时间"
          width="140"
          align="center"
        />
        <el-table-column prop="status" label="状态" width="160" align="center">
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
      title="创建/编辑停车场"
      width="50%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
    >
      <div class="form-box">
        <el-form :model="formData" label-width="110px">
          <el-form-item label="停车场名称" prop="title">
            <el-input v-model="formData.title" placeholder="请输入停车场名称" />
          </el-form-item>
          <el-form-item label="价格" prop="price">
            <el-input-number
              :min="0"
              :precision="2"
              v-model="formData.price"
              placeholder="请输入价格"
              style="width: 300px"
            />
          </el-form-item>
          <el-form-item label="可预约车位" prop="availableCount">
            <el-input-number
              :min="0"
              :max="99999"
              v-model="formData.availableCount"
              placeholder="请输入可预约车位"
              style="width: 300px"
            />
          </el-form-item>
          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="formData.phone" placeholder="请输入联系电话" />
          </el-form-item>
          <el-form-item label="营业时间" prop="businessHours">
            <el-input v-model="formData.businessHours" placeholder="如：08:30-22:00" />
          </el-form-item>
          <el-form-item label="位置描述" prop="locationDesc">
            <el-input v-model="formData.locationDesc" placeholder="如：北京市海淀区" />
          </el-form-item>
          <el-form-item label="位置链接" prop="locationLink">
            <el-input v-model="formData.locationLink" placeholder="请输入位置链接" />
          </el-form-item>
          <el-form-item label="标签" prop="tags">
            <div class="flex gap-2">
              <el-tag
                v-for="tag in formData.tags"
                :key="tag"
                closable
                :disable-transitions="false"
                @close="handleTagClose(tag)"
                style="margin-right: 10px"
              >
                {{ tag }}
              </el-tag>
              <el-input
                v-if="inputVisible"
                ref="InputRef"
                v-model="inputValue"
                class="w-20"
                size="small"
                @keyup.enter="handleInputConfirm"
                @blur="handleInputConfirm"
              />
              <el-button v-else size="small" @click="showInput">+ 添加标签</el-button>
            </div>
          </el-form-item>
          <el-form-item label="封面图" prop="image">
            <ImageUpload
              :limit="1"
              category="parking"
              v-model="formData.image"
            ></ImageUpload>
          </el-form-item>
          <el-form-item label="轮播图" prop="carouselImages">
            <ImageUpload
              :limit="5"
              category="parking"
              v-model="formData.carouselImages"
            ></ImageUpload>
          </el-form-item>
          <el-form-item label="详细介绍" prop="description">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="4"
              placeholder="请输入详细介绍"
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
import { ref, nextTick, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import ImageUpload from "../../components/ImageUpload/index.vue";
import Pagination from "../../components/pagination/pagination.vue";
import { imageEdit } from "../../utils/utils.js";
import { appointmentApi } from "../../api/index.js";

const imgUrl = import.meta.env.VITE_IMG_URL;

let queryForm = ref({
  title: "",
});

let dialogVisible = ref(false);

const formDataInfo = () => ({
  action: "create",
  title: "",
  price: 0,
  availableCount: 0,
  description: "",
  image: [],
  carouselImages: [],
  businessHours: "",
  tags: [],
  phone: "",
  locationDesc: "",
  locationLink: "",
  sortOrder: 0,
  status: 1,
});

let formData = ref(formDataInfo());

const inputValue = ref("");
const inputVisible = ref(false);
const InputRef = ref();

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
  queryForm.value = { title: "" };
  pagination.value.currentPage = 1;
  getList();
};

let handleCreate = () => {
  formData.value = formDataInfo();
  dialogVisible.value = true;
};

// 获取停车场列表
let getList = async () => {
  let data = {
    ...queryForm.value,
    page: pagination.value.currentPage,
    pageSize: pagination.value.pageSize,
  };
  let res = await appointmentApi.getParkingList(data);
  if (res.code == 200) {
    tableData.value = res.data.parkingList;
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

// 标签：删除、显示、确认
const handleTagClose = (tag) => {
  formData.value.tags.splice(formData.value.tags.indexOf(tag), 1);
};
const showInput = () => {
  inputVisible.value = true;
  nextTick(() => {
    InputRef.value.input.focus();
  });
};
const handleInputConfirm = () => {
  if (inputValue.value) {
    formData.value.tags.push(inputValue.value);
  }
  inputVisible.value = false;
  inputValue.value = "";
};

// 提交表单
const handleSubmit = async () => {
  if (Array.isArray(formData.value.image) && formData.value.image.length > 0) {
    formData.value.image = imageEdit(formData.value.image);
  }
  if (
    Array.isArray(formData.value.carouselImages) &&
    formData.value.carouselImages.length > 0
  ) {
    formData.value.carouselImages = imageEdit(formData.value.carouselImages);
  }

  let data = {
    ...formData.value,
    tags: formData.value.tags.join(","),
  };

  let res = await appointmentApi.parkingOperation(data);
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
      let res = await appointmentApi.parkingOperation(data);
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
  let res = await appointmentApi.parkingOperation(data);
  if (res.code != 200) {
    ElMessage.error(res.message);
  }
};

// 编辑
const handleEdit = (row) => {
  formData.value = {
    ...row,
    // tags: Array.isArray(row.tags)
    //   ? row.tags
    //   : row.tags
    //   ? String(row.tags).split(",")
    //   : [],
    // image: row.image ? [{ url: imgUrl + row.image }] : [],
    // carouselImages: row.carouselImages
    //   ? String(row.carouselImages)
    //       .split(",")
    //       .map((url) => ({ url: imgUrl + url }))
    //   : [],
    action: "update",
  };
  dialogVisible.value = true;
};

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm("此操作将永久删除该停车场, 是否继续?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      let data = { id: row.id, action: "delete" };
      let res = await appointmentApi.parkingOperation(data);
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
