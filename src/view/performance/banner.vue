<!-- 轮播图管理：维护各页面位置的轮播图（位置编码 × 生效时间 × 跳转配置），图片点击可放大预览 -->
<template>
  <div class="banner-manage">
    <!-- 头部：查询 + 新增按钮 -->
    <div class="query-form">
      <div class="title">轮播图管理</div>
      <div class="query-item">
        <el-input
          v-model="queryForm.title"
          placeholder="请输入标题"
          style="width: 200px"
        />
        <el-input
          v-model="queryForm.positionCode"
          placeholder="位置编码"
          style="width: 160px"
        />
        <el-select
          v-model="queryForm.status"
          placeholder="状态"
          clearable
          style="width: 110px"
        >
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="handleCreate">新增轮播图</el-button>
      </div>

      <!-- 轮播图列表（对应 banners 表） -->
      <el-table :data="tableData" height="calc(100vh - 255px)" style="width: 100%">
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column label="图片" width="90" align="center">
          <template #default="{ row }">
            <el-image
              v-if="row.imageUrl"
              :src="coverSrc(row.imageUrl)"
              :preview-src-list="[coverSrc(row.imageUrl)]"
              preview-teleported
              fit="cover"
              class="table-img"
            />
            <span v-else class="no-img">暂无</span>
          </template>
        </el-table-column>
        <el-table-column label="位置编码" width="170" align="center">
          <template #default="{ row }">
            <el-tag size="small" effect="plain">{{ row.positionCode }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="标题" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">{{ row.title || "-" }}</template>
        </el-table-column>
        <el-table-column label="跳转类型" width="110" align="center">
          <template #default="{ row }">
            <el-tag
              :type="jumpTagType(row.jumpType)"
              size="small"
              effect="light"
              >{{ jumpTypeName[row.jumpType] || "-" }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column label="跳转链接" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.jumpType === 1" class="no-img">-</span>
            <span v-else class="jump-url">{{ row.jumpUrl || "-" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="生效时间" width="330">
          <template #default="{ row }">
            <div class="time-cell">
              <span class="time-text">{{ timeRange(row) }}</span>
              <el-tag :type="timeState(row).type" size="small" effect="light">{{
                timeState(row).text
              }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="排序" width="150" align="center">
          <template #default="{ row }">
            <el-input-number
              v-model="row.sort"
              :min="0"
              :max="9999"
              @change="(val, oldVal) => handleSortChange(row, oldVal)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button plain size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" plain size="small" @click="handleDelete(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>

    <Pagination :pagination="pagination" @handleCurrentChange="handleCurrentChange" />

    <!-- 新增/编辑轮播图 -->
    <el-dialog
      v-model="dialogVisible"
      :title="formData.action === 'create' ? '新增轮播图' : '编辑轮播图'"
      width="620px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form :model="formData" label-width="90px">
        <el-form-item label="位置编码" required>
          <el-select
            v-model="formData.positionCode"
            filterable
            allow-create
            default-first-option
            placeholder="选择或输入位置编码"
            style="width: 100%"
          >
            <el-option
              v-for="p in positionOptions"
              :key="p.value"
              :label="p.label"
              :value="p.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="formData.title" placeholder="标题/备注（方便后台识别）" />
        </el-form-item>
        <el-form-item label="轮播图片" required>
          <ImageUpload
            :limit="1"
            category="banner"
            v-model="formData.imageUrl"
          />
        </el-form-item>
        <el-form-item label="跳转类型">
          <el-select v-model="formData.jumpType" style="width: 100%">
            <el-option
              v-for="(label, value) in jumpTypeName"
              :key="value"
              :label="label"
              :value="Number(value)"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="formData.jumpType !== 1" label="跳转链接" required>
          <el-input
            v-model="formData.jumpUrl"
            :placeholder="
              formData.jumpType === 3
                ? '外部H5链接，如 https://example.com'
                : '小程序页面路径，如 /pages/performance/index'
            "
          />
        </el-form-item>
        <el-form-item label="生效时间">
          <div class="time-pick">
            <el-date-picker
              v-model="formData.startTime"
              type="datetime"
              placeholder="开始时间（可空）"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 200px"
            />
            <span class="time-sep">至</span>
            <el-date-picker
              v-model="formData.endTime"
              type="datetime"
              placeholder="结束时间（可空）"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 200px"
            />
          </div>
          <div class="field-tips">均留空表示长期有效</div>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="formData.sort" :min="0" :max="9999" />
          <span class="field-tips">数字越大越靠前</span>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="formData.status"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import ImageUpload from "../../components/ImageUpload/index.vue";
import Pagination from "../../components/pagination/pagination.vue";
import { scenicSpotsApi } from "../../api/index.js";
import { imageEdit } from "../../utils/utils.js";

// ==================== 常量 ====================
// 跳转类型 1:无跳转 2:小程序页面 3:外部H5 4:特定业务ID
const jumpTypeName = {
  1: "无跳转",
  2: "小程序页面",
  3: "外部H5",
  4: "特定业务ID",
};
const jumpTagType = (t) =>
  ({ 1: "info", 2: "success", 3: "warning", 4: "danger" }[t] || "info");
// 常用位置编码（可输入新值）
const positionOptions = [
  { value: "HOME_BANNER", label: "HOME_BANNER（首页轮播）" },
  { value: "PERFORMANCE_BANNER", label: "PERFORMANCE_BANNER（演出页轮播）" },
];

// 图片CDN地址（上传后的图片存相对路径，展示时需拼接）
const imgUrl = import.meta.env.VITE_IMG_URL;
const coverSrc = (path) => (path.startsWith("http") ? path : imgUrl + path);

// ==================== 列表 ====================
const queryForm = ref({ title: "", positionCode: "", status: null });
const tableData = ref([]);
const pagination = ref({ total: 0, pageSize: 10, currentPage: 1 });

// 获取轮播图列表
const getBannerList = async () => {
  let res = await scenicSpotsApi.getBannerList({
    ...queryForm.value,
    page: pagination.value.currentPage,
    pageSize: pagination.value.pageSize,
  });
  if (res.code == 200) {
    tableData.value = res.data.rows;
    pagination.value.total = res.data.count;
  } else {
    ElMessage.error(res.message);
  }
};

onMounted(() => {
  getBannerList();
});

const handleQuery = () => {
  pagination.value.currentPage = 1;
  getBannerList();
};
const handleReset = () => {
  queryForm.value = { title: "", positionCode: "", status: null };
  pagination.value.currentPage = 1;
  getBannerList();
};

const handleCurrentChange = (val) => {
  pagination.value.currentPage = val;
  getBannerList();
};

// 修改状态（失败回滚开关）
const handleStatusChange = async (row) => {
  let res = await scenicSpotsApi.operateBanner({ ...row, action: "update" });
  if (res.code == 200) {
    ElMessage.success(`已${row.status === 1 ? "启用" : "禁用"}「${row.title || row.positionCode}」`);
  } else {
    row.status = row.status === 1 ? 0 : 1;
    ElMessage.error(res.message);
  }
};

// 修改排序（失败回滚）
const handleSortChange = async (row, oldVal) => {
  let res = await scenicSpotsApi.operateBanner({ ...row, action: "update" });
  if (res.code == 200) {
    ElMessage.success(`「${row.title || row.positionCode}」排序已更新`);
  } else {
    row.sort = oldVal;
    ElMessage.error(res.message);
  }
};

// ==================== 新增/编辑 ====================
const dialogVisible = ref(false);

const formDataInfo = () => ({
  action: "create",
  id: null,
  positionCode: "HOME_BANNER",
  title: "",
  imageUrl: [],
  jumpType: 1,
  jumpUrl: "",
  sort: 0,
  status: 1,
  startTime: null,
  endTime: null,
});
const formData = ref(formDataInfo());

const handleCreate = () => {
  formData.value = formDataInfo();
  dialogVisible.value = true;
};

const handleEdit = (row) => {
  formData.value = formDataInfo();
  for (let key in formData.value) {
    if (row[key] !== undefined && row[key] !== null) formData.value[key] = row[key];
  }
  // imageUrl 允许为空字符串，占位用空数组展示
  if (!formData.value.imageUrl) formData.value.imageUrl = [];
  formData.value.action = "update";
  dialogVisible.value = true;
};

// 生效时间展示与状态判断
const timeRange = (row) => {
  const start = row.startTime || "";
  const end = row.endTime || "";
  if (!start && !end) return "长期有效";
  return `${start || "不限"} ~ ${end || "不限"}`;
};
const timeState = (row) => {
  const now = new Date();
  const start = row.startTime ? new Date(row.startTime) : null;
  const end = row.endTime ? new Date(row.endTime) : null;
  if (start && now < start) return { text: "未开始", type: "warning" };
  if (end && now > end) return { text: "已结束", type: "danger" };
  return { text: "生效中", type: "success" };
};

// 提交（新增/更新）
const handleSubmit = async () => {
  if (!formData.value.positionCode)
    return ElMessage.warning("请选择或输入位置编码");
  if (
    !formData.value.imageUrl ||
    (Array.isArray(formData.value.imageUrl) && !formData.value.imageUrl.length)
  )
    return ElMessage.warning("请上传轮播图片");
  if (formData.value.jumpType !== 1 && !formData.value.jumpUrl)
    return ElMessage.warning("请填写跳转链接");
  if (
    formData.value.startTime &&
    formData.value.endTime &&
    formData.value.endTime <= formData.value.startTime
  )
    return ElMessage.warning("结束时间需晚于开始时间");

  // 图片数组转逗号分隔路径字符串（单图也走统一转换）
  if (Array.isArray(formData.value.imageUrl)) {
    formData.value.imageUrl = imageEdit(formData.value.imageUrl);
  }

  let res = await scenicSpotsApi.operateBanner({
    ...formData.value,
  });
  if (res.code == 200) {
    ElMessage.success(res.message);
    dialogVisible.value = false;
    getBannerList();
  } else {
    ElMessage.error(res.message);
  }
};

// 删除轮播图
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `此操作将永久删除「${row.title || row.positionCode}」轮播图, 是否继续?`,
    "提示",
    { confirmButtonText: "确定", cancelButtonText: "取消", type: "warning" }
  )
    .then(async () => {
      let res = await scenicSpotsApi.operateBanner({
        action: "delete",
        id: row.id,
      });
      if (res.code == 200) {
        ElMessage.success(res.message);
        getBannerList();
      } else {
        ElMessage.error(res.message);
      }
    })
    .catch(() => {});
};
</script>

<style lang="scss" scoped>
.table-img {
  width: 56px;
  height: 56px;
  border-radius: 6px;
  display: block;
  cursor: zoom-in;
}

.no-img {
  color: #c0c4cc;
  font-size: 12px;
}

.jump-url {
  color: #67c23a;
  font-size: 12px;
}

.time-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  .time-text {
    font-size: 12px;
    color: #666;
  }
}

.time-pick {
  display: flex;
  align-items: center;
  gap: 8px;

  .time-sep {
    color: #999;
  }
}

.field-tips {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}
</style>
