<!-- 意见建议管理 -->
<template>
  <div class="dept-manage">
    <!-- 头部 -->
    <div class="query-form">
      <div class="title">意见建议管理</div>
      <div class="query-item">
        <el-select
          style="width: 180px; margin-right: 15px"
          v-model="queryForm.type"
          placeholder="反馈类型"
          clearable
        >
          <el-option
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-select
          style="width: 180px; margin-right: 15px"
          v-model="queryForm.isHandle"
          placeholder="处理状态"
          clearable
        >
          <el-option label="未处理" :value="1" />
          <el-option label="已处理" :value="2" />
        </el-select>
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <div class="base-table">
      <div class="action"></div>

      <el-table :data="tableData" height="calc(100vh - 255px)" style="width: 100%">
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column prop="userNmae" label="用户名" width="110" align="center" />
        <el-table-column prop="userPhone" label="手机号" width="130" align="center" />
        <el-table-column label="反馈类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="typeTagMap[row.type] || 'info'">{{
              typeTextMap[row.type] || row.type
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="content"
          label="反馈内容"
          min-width="180"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column label="反馈图片" width="100" align="center">
          <template #default="{ row }">
            <el-image
              v-if="row.iamges && row.iamges.length"
              :src="resolveImg(row.iamges[0])"
              :preview-src-list="row.iamges.map(resolveImg)"
              preview-teleported
              style="width: 60px; height: 60px"
              fit="cover"
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="处理状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isHandle == 1 ? 'warning' : 'success'">{{
              row.isHandle == 1 ? "未处理" : "已处理"
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="查看状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isView == 1 ? 'info' : 'primary'" effect="plain">{{
              row.isView == 1 ? "未查看" : "已查看"
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="提交时间" width="170" align="center" />
        <el-table-column label="操作" width="250" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" plain size="small" @click="handleDetail(row)"
              >详情</el-button
            >
            <el-button
              v-if="row.isHandle == 1"
              type="success"
              plain
              size="small"
              @click="handleMarkHandle(row)"
              >标记已处理</el-button
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

    <!-- 反馈详情 -->
    <el-dialog
      v-model="detailVisible"
      title="意见建议详情"
      width="60%"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div class="form-box">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="用户ID">{{
            detailRow.openld
          }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{
            detailRow.userNmae || "-"
          }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{
            detailRow.userPhone || "-"
          }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{
            detailRow.userEmail || "-"
          }}</el-descriptions-item>
          <el-descriptions-item label="反馈类型">
            <el-tag :type="typeTagMap[detailRow.type] || 'info'">{{
              typeTextMap[detailRow.type] || detailRow.type
            }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="提交时间">{{
            detailRow.createdAt || "-"
          }}</el-descriptions-item>
          <el-descriptions-item label="处理状态">
            <el-tag :type="detailRow.isHandle == 1 ? 'warning' : 'success'">{{
              detailRow.isHandle == 1 ? "未处理" : "已处理"
            }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="查看状态">
            {{ detailRow.isView == 1 ? "未查看" : "已查看" }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">{{
            detailRow.updatedAt || "-"
          }}</el-descriptions-item>
          <el-descriptions-item label="反馈内容" :span="3">{{
            detailRow.content
          }}</el-descriptions-item>
          <el-descriptions-item label="反馈图片" :span="3">
            <div v-if="detailRow.iamges && detailRow.iamges.length" class="img-box">
              <el-image
                v-for="(img, index) in detailRow.iamges"
                :key="index"
                :src="resolveImg(img)"
                :preview-src-list="detailRow.iamges.map(resolveImg)"
                :initial-index="index"
                preview-teleported
                style="width: 90px; height: 90px; margin-right: 10px"
                fit="cover"
              />
            </div>
            <span v-else>暂无图片</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button
            v-if="detailRow.isHandle == 1"
            type="success"
            @click="handleMarkHandle(detailRow)"
            >标记已处理</el-button
          >
          <el-button @click="detailVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import Pagination from "../../components/pagination/pagination.vue";
import { serviceSuggestionsApi } from "../../api/index.js";

const imgUrl = import.meta.env.VITE_IMG_URL;

// 反馈类型（与模型定义一致：1功能异常 2优化建议 3体验反馈 4景区问题 5其他问题）
const typeOptions = [
  { value: 1, label: "功能异常" },
  { value: 2, label: "优化建议" },
  { value: 3, label: "体验反馈" },
  { value: 4, label: "景区问题" },
  { value: 5, label: "其他问题" },
];

const typeTextMap = {
  1: "功能异常",
  2: "优化建议",
  3: "体验反馈",
  4: "景区问题",
  5: "其他问题",
};

const typeTagMap = {
  1: "danger",
  2: "primary",
  3: "success",
  4: "warning",
  5: "info",
};

// 处理图片地址（兼容完整链接与相对路径）
const resolveImg = (url) => {
  if (!url) return "";
  if (
    typeof url === "string" &&
    (url.startsWith("http://") || url.startsWith("https://"))
  ) {
    return url;
  }
  return imgUrl + url;
};

let queryForm = ref({
  content: "",
  openld: "",
  type: null,
  isHandle: null,
});

// 分页参数
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

// 数据列表
let tableData = ref([]);

// 详情
let detailVisible = ref(false);
let detailRow = ref({});

// ------------------------函数方法----------------------

onMounted(() => {
  getList();
});

let handleQuery = () => {
  pagination.value.currentPage = 1;
  getList();
};

let handleReset = () => {
  queryForm.value = { content: "", openld: "", type: null, isHandle: null };
  pagination.value.currentPage = 1;
  getList();
};

// 获取意见反馈列表
let getList = async () => {
  let data = {
    ...queryForm.value,
    page: pagination.value.currentPage,
    pageSize: pagination.value.pageSize,
  };
  let res = await serviceSuggestionsApi.getOpinionsFeedbackList(data);
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

// 查看详情（首次查看自动标记为已查看）
const handleDetail = (row) => {
  detailRow.value = { ...row };
  detailVisible.value = true;

  if (row.isView == 1) {
    markViewed(row);
  }
};

// 标记为已查看
const markViewed = async (row) => {
  try {
    let data = { action: "update", id: row.id, isView: 2 };
    let res = await serviceSuggestionsApi.opinionsFeedbackOperation(data);
    if (res.code == 200) {
      row.isView = 2;
      detailRow.value.isView = 2;
    }
  } catch (error) {
    console.log(error);
  }
};

// 标记已处理
const handleMarkHandle = (row) => {
  ElMessageBox.confirm("确定将该反馈标记为已处理吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      let data = { action: "update", id: row.id, isHandle: 2 };
      let res = await serviceSuggestionsApi.opinionsFeedbackOperation(data);
      if (res.code == 200) {
        ElMessage.success(res.message);
        detailVisible.value = false;
        getList();
      } else {
        ElMessage.error(res.message);
      }
    })
    .catch(() => {
      ElMessage.info("已取消");
    });
};

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm("此操作将永久删除该意见反馈, 是否继续?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      let data = { id: row.id, action: "delete" };
      let res = await serviceSuggestionsApi.opinionsFeedbackOperation(data);
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

<style lang="scss" scoped>
.img-box {
  display: flex;
  flex-wrap: wrap;
}
</style>
