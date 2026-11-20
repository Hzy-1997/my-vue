<!-- 演出管理：演出列表 + 点击行内"场次管理"在抽屉中维护该演出的场次排布（星期 × 开演时间） -->
<template>
  <div class="perf-manage">
    <!-- 头部：查询 -->
    <div class="query-form">
      <div class="title">演出管理</div>
      <div class="query-item">
        <el-input
          v-model="queryForm.title"
          placeholder="请输入演出名称"
          style="width: 200px"
        />
        <el-select
          v-model="queryForm.status"
          placeholder="状态"
          clearable
          style="width: 110px"
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
        <el-button type="primary" @click="handleCreate">新增演出</el-button>
      </div>

      <!-- 演出列表（对应 performances 表） -->
      <el-table :data="tableData" height="calc(100vh - 255px)" style="width: 100%">
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column label="封面" width="90" align="center">
          <template #default="{ row }">
            <img
              :src="coverSrc(row.coverImage)"
              class="table-img"
              v-if="row.coverImage && row.coverImage.length"
            />
            <span v-else class="no-img">暂无</span>
          </template>
        </el-table-column>
        <el-table-column label="演出名称" width="220">
          <template #default="{ row }">
            <div class="perf-name">{{ row.title }}</div>
            <div class="perf-sub">{{ row.subtitle }}</div>
          </template>
        </el-table-column>
        <el-table-column label="演出类型" min-width="110" align="center">
          <template #default="{ row }">
            <el-tag size="small" effect="plain">{{
              performanceTypeName[row.performanceTypes] || "-"
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="内容标签" min-width="100">
          <template #default="{ row }">
            <el-tag
              v-for="t in row.tags"
              :key="t"
              size="small"
              type="warning"
              effect="plain"
              class="mini-tag"
              >{{ t }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column label="可容纳人数" prop="capacity" width="100" align="center" />
        <el-table-column label="是否预约" width="90" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.isReservationRequired ? 'warning' : 'success'"
              size="small"
              effect="light"
            >
              {{ row.isReservationRequired ? "需预约" : "免预约" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="推荐指数" width="130" align="center">
          <template #default="{ row }">
            <el-rate :model-value="row.recommendIndex" disabled size="small" />
          </template>
        </el-table-column>
        <el-table-column label="场次" width="100" align="center">
          <template #default="{ row }">{{ scheduleCountOf(row.id) }}场/周</template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="2"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="排序" width="180" align="center">
          <template #default="{ row }">
            <el-input-number
              v-model="row.sort"
              :min="0"
              :max="9999"
              @change="(val, oldVal) => handleSortChange(row, oldVal)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="230" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" plain size="small" @click="openScheduleDrawer(row)"
              >场次管理</el-button
            >
            <el-button plain size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" plain size="small" @click="handleDelete(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>

    <Pagination :pagination="pagination" @handleCurrentChange="handleCurrentChange" />

    <!-- 新增/编辑演出 -->
    <el-dialog
      v-model="dialogVisible"
      :title="formData.action === 'create' ? '新增演出' : '编辑演出'"
      width="950px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div class="dialog-scroll">
        <el-form :model="formData" label-width="100px">
          <el-divider content-position="left">基本信息</el-divider>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="演出名称" required>
                <el-input v-model="formData.title" placeholder="请输入演出名称" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="副标题">
                <el-input v-model="formData.subtitle" placeholder="副标题/卖点" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="导语">
                <el-input v-model="formData.guide" placeholder="一句话导语" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="适合人群">
                <el-select
                  v-model="formData.suitableCrowd"
                  multiple
                  filterable
                  allow-create
                  default-first-option
                  placeholder="输入后回车，如：亲子家庭"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="演出类型">
                <el-select
                  v-model="formData.performanceTypes"
                  placeholder="请选择演出类型"
                  style="width: 100%"
                >
                  <el-option label="常规演出" :value="1" />
                  <el-option label="互动演出" :value="2" />
                  <el-option label="特别演出" :value="3" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="内容标签">
                <el-select
                  v-model="formData.tags"
                  multiple
                  filterable
                  allow-create
                  default-first-option
                  placeholder="输入后回车，如：亲子"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="可容纳人数">
                <el-input-number
                  v-model="formData.capacity"
                  :min="0"
                  :max="999999"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="是否预约">
                <el-switch
                  v-model="formData.isReservationRequired"
                  active-text="需预约"
                  inactive-text="免预约"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="推荐指数">
                <el-rate v-model="formData.recommendIndex" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="状态">
                <el-switch
                  v-model="formData.status"
                  :active-value="1"
                  :inactive-value="2"
                  active-text="正常"
                  inactive-text="停用"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-divider content-position="left">演出安排</el-divider>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="表演时长">
                <el-input v-model="formData.duration" placeholder="如：30分钟" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="适合年龄">
                <el-input v-model="formData.suitableAge" placeholder="如：3岁以上" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="经纬度" required>
                <el-input
                  v-model="formData.coordinates"
                  placeholder="如：113.512,23.207"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="位置描述">
                <el-input
                  v-model="formData.locationDesc"
                  placeholder="如：丛林剧场（园区东侧）"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-divider content-position="left">图文媒体</el-divider>
          <el-form-item label="封面图片">
            <ImageUpload
              :limit="1"
              category="performance"
              v-model="formData.coverImage"
            />
          </el-form-item>
          <el-form-item label="轮播图">
            <ImageUpload
              :limit="3"
              category="performance"
              v-model="formData.carouselImages"
            />
          </el-form-item>
          <el-form-item label="音频文件">
            <el-input v-model="formData.audioUrl" placeholder="音频文件路径" />
          </el-form-item>
          <el-form-item label="视频文件">
            <el-input v-model="formData.videoUrl" placeholder="视频文件路径" />
          </el-form-item>
          <el-form-item label="演艺介绍">
            <RichTextEditor
              v-model="formData.introduction"
              :uploadImageConfig="{
                customUpload: handleImageUpload,
              }"
              :mode="editMode"
              @content-change="handleContentChange"
            />
          </el-form-item>
          <el-form-item label="注意事项">
            <el-input
              v-model="formData.notice"
              type="textarea"
              :rows="3"
              placeholder="注意事项"
            />
          </el-form-item>

          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="排序权重">
                <el-input-number v-model="formData.sort" :min="0" :max="9999" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="智能推荐">
                <el-switch v-model="formData.isSmartRecommended" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="热点点位">
                <el-switch v-model="formData.isHotSpot" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 场次管理抽屉 -->
    <el-drawer
      v-model="scheduleDrawer"
      :title="`场次管理 - ${schedulePerf?.title || ''}`"
      size="75%"
      :close-on-click-modal="false"
    >
      <div v-if="schedulePerf" class="drawer-body">
        <div class="drawer-action">
          <el-button type="primary" @click="openBatchDialog">批量添加场次</el-button>
          <span class="tips"
            >每周共 {{ drawerSchedules.length }} 场；单场容量留空时使用演出总容量（{{
              schedulePerf.capacity ?? "未设置"
            }}）</span
          >
        </div>

        <!-- 按星期分组（周一 → 周日） -->
        <div class="week-grid">
          <div
            v-for="d in weekOrder"
            :key="d"
            class="day-card"
            :class="{ today: d === todayWeekDay }"
          >
            <div class="day-head">
              <span class="day-name">{{ weekName[d] }}</span>
              <el-tag
                v-if="d === todayWeekDay"
                size="small"
                type="primary"
                effect="dark"
                class="today-tag"
                >今天</el-tag
              >
              <span class="day-count">{{ (byDay[d] || []).length }}场</span>
              <el-button
                v-if="(byDay[d] || []).length"
                link
                type="danger"
                size="small"
                @click="handleClearDay(d)"
                >清空</el-button
              >
            </div>
            <div class="chip-list">
              <div
                v-for="row in byDay[d]"
                :key="row.id"
                class="chip"
                :class="{ disabled: row.status === 2 }"
                @click="openEdit(row)"
              >
                <div class="chip-time">{{ row.showTime }}</div>
                <div class="chip-info">
                  <span>{{
                    row.capacity == null ? "随主表" : "容量" + row.capacity
                  }}</span>
                  <span v-if="row.status === 2" class="chip-status">已停用</span>
                </div>
                <el-icon class="chip-del" @click.stop="handleDeleteSchedule(row)"
                  ><Close
                /></el-icon>
              </div>
              <div v-if="!(byDay[d] || []).length" class="empty-day">暂无场次</div>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>

    <!-- 批量添加场次 -->
    <el-dialog
      v-model="batchVisible"
      title="批量添加场次"
      width="640px"
      append-to-body
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form label-width="90px">
        <el-form-item label="选择星期">
          <div class="week-pick">
            <div>
              <el-button
                v-for="q in quickWeeks"
                :key="q.label"
                size="small"
                plain
                @click="batchForm.weekDays = [...q.days]"
                >{{ q.label }}</el-button
              >
            </div>
            <el-checkbox-group v-model="batchForm.weekDays">
              <el-checkbox-button v-for="d in weekOrder" :key="d" :value="d">
                {{ weekName[d] }}
              </el-checkbox-button>
            </el-checkbox-group>
          </div>
        </el-form-item>

        <el-form-item label="时间点">
          <div class="time-gen">
            <el-time-select
              v-model="batchForm.startTime"
              start="06:00"
              end="23:30"
              step="00:30"
              placeholder="开始"
              style="width: 110px"
            />
            <span class="time-sep">至</span>
            <el-time-select
              v-model="batchForm.endTime"
              start="06:00"
              end="23:30"
              step="00:30"
              placeholder="结束"
              style="width: 110px"
            />
            <el-select v-model="batchForm.interval" style="width: 110px">
              <el-option
                v-for="m in intervalOptions"
                :key="m"
                :label="m + '分钟/场'"
                :value="m"
              />
            </el-select>
            <el-button @click="handleGenTimes">生成</el-button>
            <el-time-select
              v-model="manualTime"
              start="06:00"
              end="23:30"
              step="00:15"
              placeholder="手动补一个"
              style="width: 120px"
              @change="addManualTime"
            />
          </div>
        </el-form-item>

        <el-form-item v-if="previewTimes.length" label="已选时间">
          <div class="time-tags">
            <el-tag
              v-for="t in previewTimes"
              :key="t"
              closable
              disable-transitions
              @close="removeTime(t)"
              >{{ t }}</el-tag
            >
          </div>
        </el-form-item>

        <el-form-item label="场次容量">
          <el-input-number
            v-model="batchForm.capacity"
            :min="1"
            :max="999999"
            placeholder="留空则使用演出总容量"
            style="width: 220px"
          />
          <span class="tips">留空则使用演出总容量</span>
        </el-form-item>

        <el-form-item label="预览">
          <el-text type="info">
            {{ batchForm.weekDays.length }} 天 × {{ previewTimes.length }} 个时间，将生成
            {{ batchWeekTimes.length }} 场
            <template v-if="dupCount"
              >，其中
              <el-text type="danger">{{ dupCount }} </el-text>
              场与已有重复（将自动跳过）</template
            >
          </el-text>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBatchSubmit">确定添加</el-button>
      </template>
    </el-dialog>

    <!-- 编辑单场 -->
    <el-dialog
      v-model="editVisible"
      title="编辑场次"
      width="420px"
      append-to-body
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form label-width="90px">
        <el-form-item label="星期">
          <el-input :model-value="weekName[editForm.weekDay]" disabled />
        </el-form-item>
        <el-form-item label="开演时间">
          <el-time-select
            v-model="editForm.showTime"
            start="06:00"
            end="23:30"
            step="00:15"
            placeholder="选择时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="场次容量">
          <el-input-number
            v-model="editForm.capacity"
            :min="1"
            :max="999999"
            placeholder="留空则使用演出总容量"
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="editForm.status"
            :active-value="1"
            :inactive-value="2"
            active-text="启用"
            inactive-text="停用"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="handleEditSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import ImageUpload from "../../components/ImageUpload/index.vue";
import RichTextEditor from "../../components/editor/index.vue";
import Pagination from "../../components/pagination/pagination.vue";
import { commonApi, performanceApi } from "../../api/index.js";
import { imageEdit } from "../../utils/utils.js";
// 全部场次（列表页统计"场次/周"，抽屉内按演出过滤）
const schedules = ref([]);

// ==================== 常量 ====================
const weekOrder = [1, 2, 3, 4, 5, 6, 0];
const weekName = {
  0: "周日",
  1: "周一",
  2: "周二",
  3: "周三",
  4: "周四",
  5: "周五",
  6: "周六",
};
// 演出类型 1:常规演出 2:互动演出 3:特别演出
const performanceTypeName = {
  1: "常规演出",
  2: "互动演出",
  3: "特别演出",
};
const quickWeeks = [
  { label: "每天", days: [0, 1, 2, 3, 4, 5, 6] },
  { label: "工作日", days: [1, 2, 3, 4, 5] },
  { label: "仅周末", days: [0, 6] },
];
const intervalOptions = [30, 45, 60, 90, 120];
const todayWeekDay = new Date().getDay();

// ==================== 演出列表 ====================
const queryForm = ref({ title: "", status: null });
const tableData = ref([]);
const pagination = ref({ total: 0, pageSize: 10, currentPage: 1 });

const scheduleCountOf = (perfId) =>
  schedules.value.filter((s) => s.performanceId === perfId).length;

// 获取演出列表
const getPerformanceList = async () => {
  let res = await performanceApi.getPerformanceList({
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

// 获取场次列表
const getScheduleList = async () => {
  let res = await performanceApi.getPerformanceScheduleList();
  if (res.code == 200) {
    schedules.value = res.data.rows;
  } else {
    ElMessage.error(res.message);
  }
};

onMounted(() => {
  getPerformanceList();
  getScheduleList();
});

const handleQuery = () => {
  pagination.value.currentPage = 1;
  getPerformanceList();
};
const handleReset = () => {
  queryForm.value = { title: "", status: null };
  pagination.value.currentPage = 1;
  getPerformanceList();
};

const handleCurrentChange = (val) => {
  pagination.value.currentPage = val;
  getPerformanceList();
};

// 修改状态（失败回滚开关）
const handleStatusChange = async (row) => {
  let res = await performanceApi.operatePerformance({ ...row, action: "update" });
  if (res.code == 200) {
    ElMessage.success(`已${row.status === 1 ? "启用" : "停用"}「${row.title}」`);
  } else {
    row.status = row.status === 1 ? 2 : 1;
    ElMessage.error(res.message);
  }
};

// 修改排序（失败回滚）
const handleSortChange = async (row, oldVal) => {
  let res = await performanceApi.operatePerformance({ ...row, action: "update" });
  if (res.code == 200) {
    ElMessage.success(`「${row.title}」排序已更新`);
  } else {
    row.sort = oldVal;
    ElMessage.error(res.message);
  }
};

// ---- 新增/编辑 ----
const dialogVisible = ref(false);

// 图片CDN地址（上传后的图片存相对路径，展示时需拼接）
const imgUrl = import.meta.env.VITE_IMG_URL;
const coverSrc = (path) => (path.startsWith("http") ? path : imgUrl + path);

// 编辑器模式
const editMode = ref("edit");
// 编辑器本次会话上传的图片（提交时用于清理已删除的图片）
const initialImages = ref([]);
// 编辑器当前保留的图片
const retainedImages = ref([]);

// JSON数组字段兜底转换（适合人群/内容标签）
const toArray = (v) => (Array.isArray(v) ? v : v ? String(v).split(",") : []);

const formDataInfo = () => ({
  action: "create",
  id: null,
  title: "",
  subtitle: "",
  guide: "",
  suitableCrowd: [],
  performanceTypes: 1,
  tags: [],
  capacity: null,
  isReservationRequired: false,
  recommendIndex: 3,
  duration: "",
  suitableAge: "",
  coordinates: "",
  locationDesc: "",
  coverImage: [],
  audioUrl: "",
  videoUrl: "",
  carouselImages: [],
  introduction: "",
  notice: "",
  status: 1,
  sort: 0,
  isSmartRecommended: false,
  isHotSpot: false,
});
const formData = ref(formDataInfo());

const resetEditorImages = () => {
  initialImages.value = [];
  retainedImages.value = [];
};

const handleCreate = () => {
  formData.value = formDataInfo();
  resetEditorImages();
  dialogVisible.value = true;
};
const handleEdit = (row) => {
  formData.value = {
    ...formDataInfo(),
    ...JSON.parse(JSON.stringify(row)),
    suitableCrowd: toArray(row.suitableCrowd),
    tags: toArray(row.tags),
    action: "update",
  };
  resetEditorImages();
  dialogVisible.value = true;
};

// 处理编辑器图片上传
const handleImageUpload = async (file, insertFn) => {
  const fd = new FormData();
  fd.append("file", file);
  try {
    const res = await commonApi.uploadImg(fd, "performance");
    if (res.code !== 200) {
      ElMessage.error("上传失败: " + res.message);
      return;
    }
    initialImages.value.push(res.data.file.url);
    insertFn(res.data.file.url, "");
  } catch (error) {
    ElMessage.error("上传图片失败，请重试");
  }
};

// 编辑器内容变化
const handleContentChange = (data) => {
  formData.value.introduction = data.content;
  retainedImages.value = data.editorImgList;
};

// 提交（新增/更新）
const handleSubmit = async () => {
  if (!formData.value.title) return ElMessage.warning("请输入演出名称");
  if (!formData.value.coordinates) return ElMessage.warning("请输入经纬度");

  // 清理编辑器中已删除的图片
  if (Array.isArray(initialImages.value) && initialImages.value.length > 0) {
    let deleteImageList = initialImages.value.filter(
      (item1) => !retainedImages.value.some((item2) => item1 === item2.src)
    );
    if (deleteImageList.length > 0) {
      deleteImageList = deleteImageList.map((url) => {
        const match = url.match(/\/ceshiUp\/\d+\/\d+\/\d+\/[a-f0-9]+\.[a-z0-9]+/i);
        return match ? match[0].slice(1) : "";
      });
      await commonApi.deleteImg({ deleteImageList });
    }
  }

  // 封面/轮播图数组转逗号分隔路径字符串（与票务提交格式一致）
  // coverImage 为 STRING 字段：空数组也必须转为空字符串，否则 Sequelize 报 string violation
  if (Array.isArray(formData.value.coverImage)) {
    formData.value.coverImage = imageEdit(formData.value.coverImage);
  }
  if (
    Array.isArray(formData.value.carouselImages) &&
    formData.value.carouselImages.length > 0
  ) {
    formData.value.carouselImages = imageEdit(formData.value.carouselImages);
  }

  let res = await performanceApi.operatePerformance({
    ...formData.value,
  });
  if (res.code == 200) {
    ElMessage.success(res.message);
    dialogVisible.value = false;
    getPerformanceList();
  } else {
    ElMessage.error(res.message);
  }
};

// 删除演出（后端级联删除其场次）
const handleDelete = (row) => {
  const cnt = scheduleCountOf(row.id);
  ElMessageBox.confirm(
    `此操作将永久删除「${row.title}」${cnt ? `及其 ${cnt} 个场次` : ""}, 是否继续?`,
    "提示",
    { confirmButtonText: "确定", cancelButtonText: "取消", type: "warning" }
  )
    .then(async () => {
      let res = await performanceApi.operatePerformance({
        action: "delete",
        id: row.id,
      });
      if (res.code == 200) {
        ElMessage.success(res.message);
        getPerformanceList();
        getScheduleList();
      } else {
        ElMessage.error(res.message);
      }
    })
    .catch(() => {});
};

// ==================== 场次管理（抽屉） ====================
const scheduleDrawer = ref(false);
const schedulePerf = ref(null);

const openScheduleDrawer = async (row) => {
  schedulePerf.value = row;
  scheduleDrawer.value = true;
  await getScheduleList(); // 打开时拉取最新场次
};

const drawerSchedules = computed(() =>
  schedules.value.filter((s) => s.performanceId === schedulePerf.value?.id)
);
const byDay = computed(() => {
  const map = {};
  drawerSchedules.value.forEach((row) => {
    (map[row.weekDay] = map[row.weekDay] || []).push(row);
  });
  Object.values(map).forEach((list) =>
    list.sort((a, b) => a.showTime.localeCompare(b.showTime))
  );
  return map;
});

// ---- 批量添加 ----
const batchVisible = ref(false);
const manualTime = ref("");
const batchForm = ref({
  weekDays: [],
  startTime: "09:00",
  endTime: "18:00",
  interval: 60,
  capacity: null,
});
const previewTimes = ref([]);

const batchWeekTimes = computed(() => {
  const res = [];
  batchForm.value.weekDays.forEach((d) => {
    previewTimes.value.forEach((t) => res.push({ weekDay: d, showTime: t }));
  });
  return res;
});
const dupCount = computed(() => {
  const exist = new Set(drawerSchedules.value.map((s) => `${s.weekDay}-${s.showTime}`));
  return batchWeekTimes.value.filter((x) => exist.has(`${x.weekDay}-${x.showTime}`))
    .length;
});

const openBatchDialog = () => {
  batchForm.value = {
    weekDays: [],
    startTime: "09:00",
    endTime: "18:00",
    interval: 60,
    capacity: null,
  };
  previewTimes.value = [];
  batchVisible.value = true;
};

const toMin = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const fmtMin = (min) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

const handleGenTimes = () => {
  const { startTime, endTime, interval } = batchForm.value;
  if (!startTime || !endTime) return ElMessage.warning("请先选择开始与结束时间");
  if (toMin(endTime) < toMin(startTime))
    return ElMessage.warning("结束时间不能早于开始时间");
  const times = [];
  for (let t = toMin(startTime); t <= toMin(endTime); t += interval)
    times.push(fmtMin(t));
  const apply = () => (previewTimes.value = times);
  if (previewTimes.value.length) {
    ElMessageBox.confirm("生成将覆盖已手动添加的时间点，是否继续？", "提示", {
      type: "warning",
    })
      .then(apply)
      .catch(() => {});
  } else {
    apply();
  }
};

const addManualTime = (t) => {
  if (!t) return;
  if (!previewTimes.value.includes(t)) {
    previewTimes.value = [...previewTimes.value, t].sort((a, b) => a.localeCompare(b));
  }
  manualTime.value = "";
};
const removeTime = (t) => {
  previewTimes.value = previewTimes.value.filter((x) => x !== t);
};

// 批量添加提交（后端自动跳过与已有场次重复的星期+时间）
const handleBatchSubmit = async () => {
  const { weekDays, capacity } = batchForm.value;
  if (!weekDays.length) return ElMessage.warning("请选择星期");
  if (!previewTimes.value.length) return ElMessage.warning("请生成或添加时间点");

  let res = await performanceApi.operatePerformanceSchedule({
    action: "batchCreate",
    performanceId: schedulePerf.value.id,
    schedules: batchWeekTimes.value.map((x) => ({
      weekDay: x.weekDay,
      showTime: x.showTime,
      capacity: capacity ?? null,
      status: 1,
    })),
  });
  if (res.code == 200) {
    const { added, skipped } = res.data;
    ElMessage.success(`已添加 ${added} 场${skipped ? `，跳过重复 ${skipped} 场` : ""}`);
    batchVisible.value = false;
    getScheduleList();
  } else {
    ElMessage.error(res.message);
  }
};

// ---- 编辑/删除单场 ----
const editVisible = ref(false);
const editForm = ref({});

const openEdit = (row) => {
  editForm.value = { ...row };
  editVisible.value = true;
};

const handleEditSubmit = async () => {
  const { id, weekDay, showTime, capacity, status } = editForm.value;
  const dup = drawerSchedules.value.find(
    (s) => s.id !== id && s.weekDay === weekDay && s.showTime === showTime
  );
  if (dup) return ElMessage.warning("该星期此时间已存在场次");

  let res = await performanceApi.operatePerformanceSchedule({
    action: "update",
    id,
    showTime,
    capacity: capacity ?? null,
    status,
  });
  if (res.code == 200) {
    ElMessage.success(res.message);
    editVisible.value = false;
    getScheduleList();
  } else {
    ElMessage.error(res.message);
  }
};

const handleDeleteSchedule = (row) => {
  ElMessageBox.confirm(
    `确定删除 ${weekName[row.weekDay]} ${row.showTime} 这一场吗？`,
    "提示",
    { confirmButtonText: "确定", cancelButtonText: "取消", type: "warning" }
  )
    .then(async () => {
      let res = await performanceApi.operatePerformanceSchedule({
        action: "delete",
        id: row.id,
      });
      if (res.code == 200) {
        ElMessage.success(res.message);
        getScheduleList();
      } else {
        ElMessage.error(res.message);
      }
    })
    .catch(() => {});
};

// 清空某星期的全部场次
const handleClearDay = (d) => {
  ElMessageBox.confirm(`确定清空 ${weekName[d]} 的全部场次吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      let res = await performanceApi.operatePerformanceSchedule({
        action: "clearDay",
        performanceId: schedulePerf.value.id,
        weekDay: d,
      });
      if (res.code == 200) {
        ElMessage.success(res.message);
        getScheduleList();
      } else {
        ElMessage.error(res.message);
      }
    })
    .catch(() => {});
};
</script>

<style lang="scss" scoped>
// 弹窗内容内部滚动，避免页面滚动
.dialog-scroll {
  max-height: 65vh;
  overflow-y: auto;
  overflow-x: hidden;
}

.mini-tag {
  margin-right: 4px;
  margin-bottom: 2px;
}

.perf-name {
  font-weight: bold;
}

.perf-sub {
  font-size: 12px;
  color: #999;
}

.no-img {
  color: #c0c4cc;
  font-size: 12px;
}

.drawer-body {
  padding: 0 20px 20px;

  .drawer-action {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }
}

.week-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 12px;
}

.day-card {
  border: 1px solid #ece8e8;
  border-radius: 6px;
  background: #fff;
  overflow: hidden;

  &.today {
    border-color: #409eff;
    box-shadow: 0 0 0 1px #409eff22;
  }

  .day-head {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 10px;
    background: #f8f9fb;
    border-bottom: 1px solid #ece8e8;

    .day-name {
      font-weight: bold;
    }

    .day-count {
      color: #999;
      font-size: 12px;
      margin-left: auto;
    }
  }

  .chip-list {
    padding: 8px;
    min-height: 120px;
    max-height: 380px;
    overflow-y: auto;
  }

  .empty-day {
    color: #c0c4cc;
    font-size: 12px;
    text-align: center;
    line-height: 100px;
  }
}

.chip {
  position: relative;
  border: 1px solid #b3d8ff;
  background: #ecf5ff;
  border-radius: 6px;
  padding: 6px 10px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: #409eff;
    box-shadow: 0 2px 6px rgba(64, 158, 255, 0.2);

    .chip-del {
      display: inline-flex;
    }
  }

  &.disabled {
    border-color: #e4e7ed;
    background: #f5f7fa;

    .chip-time {
      color: #c0c4cc;
    }
  }

  .chip-time {
    font-size: 15px;
    font-weight: bold;
    color: #409eff;
  }

  .chip-info {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #999;

    .chip-status {
      color: #f56c6c;
    }
  }

  .chip-del {
    display: none;
    position: absolute;
    top: -8px;
    right: -8px;
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 50%;
    padding: 2px;
    font-size: 12px;
    color: #f56c6c;
  }
}

.week-pick {
  display: flex;
  flex-direction: column;
  gap: 10px;

  .el-checkbox-group {
    flex-wrap: wrap;
  }
}

.time-gen {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  .time-sep {
    color: #999;
  }
}

.time-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
</style>
