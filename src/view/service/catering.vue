<!-- 餐饮 -->
<template>
  <div>
    <!-- 头部搜索 -->
    <div class="query-form">
      <div class="title">餐饮管理</div>
      <div class="query-item">
        <el-input placeholder="请输入餐厅名称" v-model="queryForm.title"></el-input>
        <el-button type="primary" @click="handleQuery">
          <el-icon><Search /></el-icon>查询</el-button
        >
        <el-button @click="handleReset">
          <el-icon><RefreshLeft /></el-icon>重置</el-button
        >
      </div>
    </div>
    <!-- 创建 展示 -->
    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="handleCreate" v-has="'catering-create'"
          >创建餐饮</el-button
        >
      </div>

      <!-- 表格展示 -->
      <el-table :data="tableData" height="calc(100vh - 255px)" style="width: 100%">
        <el-table-column prop="id" label="id" width="60"></el-table-column>
        <el-table-column prop="title" label="餐厅名称" min-width="120"></el-table-column>
        <el-table-column label="类型" width="80" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.subtitle === 1 ? 'success' : 'info'">
              {{ scope.row.subtitle === 1 ? "自营" : "非自营" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="图片" align="center" width="120">
          <template #default="scope">
            <el-image
              v-if="scope.row.carouselImages && scope.row.carouselImages.length"
              :src="imgUrl + scope.row.carouselImages[0]"
              style="width: 110px; height: 80px"
              fit="cover"
            />
          </template>
        </el-table-column>
        <el-table-column prop="tags" label="标签" width="160" align="center">
          <template #default="scope">
            <el-tag
              v-for="(item, index) in scope.row.tags || []"
              :key="index"
              size="small"
              style="margin-right: 4px"
              >{{ item }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column
          prop="businessHours"
          label="营业时间"
          width="130"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="phone"
          label="联系电话"
          width="130"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="locationDesc"
          label="位置描述"
          min-width="100"
          show-overflow-tooltip
          align="center"
        ></el-table-column>
        <el-table-column prop="status" label="状态" width="150" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              active-text="上架"
              inactive-text="下架"
              :active-value="1"
              :inactive-value="2"
              @change="handleTicketingStatus(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="sortOrder" label="排序" width="180" align="center">
          <template #default="{ row }">
            <el-input-number
              v-model="row.sortOrder"
              :min="0"
              :max="99999"
              @change="handleTicketingSort(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="handleEdit(scope.row)"
              v-has="'catering-update'"
              >编辑</el-button
            >
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(scope.row)"
              v-has="'catering-delete'"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>

    <Pagination
      :pagination="pagination"
      @handleSizeChange="handleSizeChange"
      @handleCurrentChange="handleCurrentChange"
    />

    <!-- 创建/编辑 弹窗 -->
    <el-dialog
      :title="formData.action === 'create' ? '创建餐饮' : '编辑餐饮'"
      v-model="dialogVisible"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="50%"
    >
      <div class="form-box my-scrollable-div">
        <el-form :model="formData" ref="formRef" label-width="100px">
          <el-form-item label="餐厅名称" prop="title" required>
            <el-input v-model="formData.title" placeholder="请输入餐厅名称"></el-input>
          </el-form-item>
          <el-form-item label="类型" prop="subtitle">
            <el-radio-group v-model="formData.subtitle">
              <el-radio :value="1">自营</el-radio>
              <el-radio :value="2">非自营</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="简短描述" prop="shortDesc">
            <el-input
              v-model="formData.shortDesc"
              placeholder="请输入简短描述"
            ></el-input>
          </el-form-item>
          <el-form-item label="标签" prop="tags">
            <div class="flex gap-2">
              <el-tag
                v-for="(tag, index) in formData.tags"
                :key="index"
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
              <el-button v-else class="button-new-tag" size="small" @click="showInput">
                + 标签
              </el-button>
            </div>
          </el-form-item>

          <el-form-item label="人均消费" prop="avgPrice">
            <el-input
              v-model="formData.avgPrice"
              placeholder="示例：(档口零点 | 人均75元)  描述和消费用束线隔开"
            ></el-input>
          </el-form-item>

          <el-form-item label="轮播图" prop="carouselImages">
            <ImageUpload
              :limit="5"
              category="food"
              v-model="formData.carouselImages" />
          </el-form-item>
          <el-form-item label="营业时间" prop="businessHours">
            <el-input
              v-model="formData.businessHours"
              placeholder="如：早7:00-10:00 / 午12:00-14:00 / 晚17:30-21:00"
            ></el-input>
          </el-form-item>
          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="formData.phone" placeholder="请输入联系电话"></el-input>
          </el-form-item>
          <el-form-item label="位置描述" prop="locationDesc">
            <el-input
              v-model="formData.locationDesc"
              placeholder="如：北京市海淀区"
            ></el-input>
          </el-form-item>
          <el-form-item label="位置链接" prop="locationLink">
            <el-input
              v-model="formData.locationLink"
              placeholder="请输入位置链接"
            ></el-input>
          </el-form-item>
          <el-form-item label="详细介绍" prop="description">
            <Editor
              v-model="formData.description"
              :uploadImageConfig="{
                customUpload: handleImageUpload,
              }"
              :mode="editMode"
              @content-change="handleContentChange"
            />
          </el-form-item>
          <el-form-item label="排序" prop="sortOrder">
            <el-input-number v-model="formData.sortOrder" :min="0"></el-input-number>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="formData.status">
              <el-radio :value="1">上架</el-radio>
              <el-radio :value="2">下架</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import ImageUpload from "../../components/ImageUpload/index.vue";
import Pagination from "../../components/pagination/pagination.vue";
import { ElMessage, ElMessageBox } from "element-plus";
import Editor from "../../components//editor/index.vue";
import { projectApi, commonApi } from "../../api/index.js";

const imgUrl = import.meta.env.VITE_IMG_URL;

// 搜索
const queryForm = ref({
  title: "",
});

const tableData = ref([]);
const formRef = ref(null);

// 编辑器模式
const editMode = ref("edit");
// 初始图片列表
const initialImages = ref([]);
// 保留的图片列表
const retainedImages = ref([]);

// 标签输入
const inputValue = ref("");
const inputVisible = ref(false);
const InputRef = ref(null);

let dataInfo = () => ({
  id: undefined,
  action: "create",
  title: "",
  subtitle: 1,
  shortDesc: "",
  avgPrice: "",
  tags: [],
  carouselImages: [],
  businessHours: "",
  phone: "",
  locationDesc: "",
  locationLink: "",
  description: "",
  sortOrder: 0,
  status: 1,
});
// 表单
const formData = ref(dataInfo());

// 分页
let pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

const dialogVisible = ref(false);

// ---------------------------   函   数  --------------------

onMounted(() => {
  getList();
});

// 获取列表数据
const getList = async () => {
  try {
    let res = await projectApi.cateringList({
      title: queryForm.value.title,
      page: pagination.value.currentPage,
      pageSize: pagination.value.pageSize,
    });
    if (res.code === 200) {
      tableData.value = res.data.list;
      pagination.value.total = res.data.total;
    }
  } catch (error) {
    console.log(error);
  }
};

// 查询
const handleQuery = () => {
  pagination.value.currentPage = 1;
  getList();
};

// 重置
const handleReset = () => {
  queryForm.value.title = "";
  pagination.value.currentPage = 1;
  getList();
};

// 创建
const handleCreate = () => {
  formData.value = dataInfo();
  formData.value.action = "create";
  dialogVisible.value = true;
};

// 处理编辑器图片上传
const handleImageUpload = async (file, insertFn) => {
  const fd = new FormData();
  fd.append("file", file);
  try {
    let res = await commonApi.uploadImg(fd, "food");
    if (res.code !== 200) {
      ElMessage.error("上传失败: " + res.message);
      return;
    }
    const imgUrl = res.data.file.url;
    initialImages.value.push(imgUrl);
    insertFn(imgUrl, "");
  } catch (error) {
    ElMessage.error("上传图片失败，请重试");
  }
};

// 编辑器内容变化
const handleContentChange = (data) => {
  formData.value.description = data.content;
  retainedImages.value = data.editorImgList;
};

// 标签操作
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
  if (!formData.value.title) {
    ElMessage.warning("请输入餐厅名称");
    return;
  }
  try {
    let data = { ...formData.value };
    // 处理轮播图：转换为路径数组
    if (Array.isArray(data.carouselImages) && data.carouselImages.length > 0) {
      data.carouselImages = data.carouselImages.map((item) => {
        const url = typeof item === "string" ? item : item.url;
        return url.split("aliyuncs.com")[1] || url;
      });
    } else {
      data.carouselImages = [];
    }
    let res = await projectApi.cateringOperate(data);
    if (res.code === 200) {
      dialogVisible.value = false;
      ElMessage.success("操作成功");
      getList();
    } else {
      ElMessage.error(res.message || "操作失败");
    }
  } catch (error) {
    ElMessage.error("操作失败");
  }
};

// 状态切换
const handleTicketingStatus = (row) => {
  ElMessageBox.confirm("确定要修改状态吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      let res = await projectApi.cateringOperate({
        id: row.id,
        status: row.status,
        action: "update",
      });
      if (res.code === 200) {
        ElMessage.success("修改成功");
        getList();
      } else {
        ElMessage.error(res.message || "修改失败");
      }
    })
    .catch(() => {
      row.status = row.status === 1 ? 2 : 1;
    });
};

// 排序修改
const handleTicketingSort = async (row) => {
  let res = await projectApi.cateringOperate({
    id: row.id,
    sortOrder: row.sortOrder,
    action: "update",
  });
  if (res.code === 200) {
    getList();
  } else {
    ElMessage.error(res.message || "修改失败");
  }
};

// 编辑
const handleEdit = async (row) => {
  formData.value = dataInfo();
  formData.value.action = "update";

  for (let key in row) {
    if (key in formData.value) {
      formData.value[key] = row[key];
    }
  }
  formData.value.id = row.id;
  formData.value.carouselImages = row.carouselImages ? [...row.carouselImages] : [];
  formData.value.tags = row.tags ? [...row.tags] : [];

  await nextTick();
  dialogVisible.value = true;
};

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm("确定要删除该餐饮项目吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
    let res = await projectApi.cateringOperate({
      id: row.id,
      action: "delete",
    });
    if (res.code === 200) {
      ElMessage.success("删除成功");
      getList();
    } else {
      ElMessage.error(res.message || "删除失败");
    }
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("删除失败");
    }
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
</script>

<style lang="scss" scoped></style>
