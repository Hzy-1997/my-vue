<!-- 演出管理：演出列表 + 点击行内"场次管理"在抽屉中维护该演出的场次排布（星期 × 开演时间） -->
<template>
  <div class="perf-manage">
    <!-- 头部：查询 -->
    <div class="query-form">
      <div class="title">演出管理</div>
      <div class="query-item">
        <el-input
          v-model="queryForm.name"
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

    <el-alert
      class="demo-tip"
      title="当前为演示数据（接口暂未接入），仅用于预览页面样式与交互"
      type="info"
      show-icon
      :closable="false"
    />

    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="handleCreate">新增演出</el-button>
      </div>

      <!-- 演出列表（对应 performances 表） -->
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column label="封面" width="90" align="center">
          <template #default="{ row }">
            <img :src="row.coverImage" class="table-img" v-if="row.coverImage" />
            <span v-else class="no-img">暂无</span>
          </template>
        </el-table-column>
        <el-table-column label="演出名称" min-width="180">
          <template #default="{ row }">
            <div class="perf-name">{{ row.name }}</div>
            <div class="perf-sub">{{ row.subtitle }}</div>
          </template>
        </el-table-column>
        <el-table-column label="演出类型" min-width="120">
          <template #default="{ row }">
            <el-tag
              v-for="t in row.performanceTypes"
              :key="t"
              size="small"
              effect="plain"
              class="mini-tag"
              >{{ t }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column label="内容标签" min-width="120">
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
        <el-table-column label="场次" width="70" align="center">
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
        <el-table-column label="排序" width="110" align="center">
          <template #default="{ row }">
            <el-input-number
              v-model="row.sort"
              :min="0"
              :max="9999"
              size="small"
              @change="handleSortChange(row)"
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

    <!-- 新增/编辑演出 -->
    <el-dialog
      v-model="dialogVisible"
      :title="formData.action === 'create' ? '新增演出' : '编辑演出'"
      width="780px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form :model="formData" label-width="100px">
        <el-divider content-position="left">基本信息</el-divider>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="演出名称" required>
              <el-input v-model="formData.name" placeholder="请输入演出名称" />
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
                multiple
                filterable
                allow-create
                default-first-option
                placeholder="输入后回车，如：动物互动"
                style="width: 100%"
              />
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
              <el-input v-model="formData.coordinates" placeholder="如：113.512,23.207" />
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
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="封面图片">
              <el-input
                v-model="formData.coverImage"
                placeholder="封面图片路径（接入后换上传组件）"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="音频文件">
              <el-input v-model="formData.audioUrl" placeholder="音频文件路径" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="视频文件">
              <el-input v-model="formData.videoUrl" placeholder="视频文件路径" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="轮播图">
              <el-input
                v-model="carouselInput"
                placeholder="输入图片路径后回车添加"
                @keyup.enter="addCarousel"
              />
              <div class="carousel-tags" v-if="formData.carouselImages.length">
                <el-tag
                  v-for="(img, i) in formData.carouselImages"
                  :key="i"
                  closable
                  @close="formData.carouselImages.splice(i, 1)"
                  >图{{ i + 1 }}</el-tag
                >
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="演艺介绍">
              <el-input
                v-model="formData.introduction"
                type="textarea"
                :rows="3"
                placeholder="演艺介绍"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="注意事项">
              <el-input
                v-model="formData.notice"
                type="textarea"
                :rows="3"
                placeholder="注意事项"
              />
            </el-form-item>
          </el-col>
        </el-row>

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
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 场次管理抽屉 -->
    <el-drawer
      v-model="scheduleDrawer"
      :title="`场次管理 - ${schedulePerf?.name || ''}`"
      size="75%"
      :close-on-click-modal="false"
    >
      <div v-if="schedulePerf" class="drawer-body">
        <div class="drawer-action">
          <el-button type="primary" @click="openBatchDialog">批量添加场次</el-button>
          <span class="tips"
            >每周共 {{ drawerSchedules.length }} 场；单场容量留空时使用演出总容量（{{
              schedulePerf.capacity
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
import { ref, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

/*
 * ==================== 演示数据（接口待接入） ====================
 * TODO: 接口就绪后替换为 performanceApi.xxx
 */
const IMG = (prompt) =>
  `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt
  )}&image_size=square_hd`;

// 演出列表（对应 performances 表）
const performances = ref([
  {
    id: 1,
    name: "丛林飞鸟秀",
    subtitle: "百鸟齐飞震撼开场",
    guide: "人与自然的亲密对话",
    performanceTypes: ["动物互动"],
    tags: ["亲子", "鸟类"],
    suitableCrowd: ["亲子家庭"],
    capacity: 500,
    isReservationRequired: true,
    recommendIndex: 5,
    duration: "30分钟",
    suitableAge: "3岁以上",
    coordinates: "113.512,23.207",
    locationDesc: "丛林剧场（园区东侧）",
    coverImage: IMG(
      " Tropical jungle stage performance with colorful flying exotic birds, scenic park theater, vivid, photorealistic "
    ),
    audioUrl: "",
    videoUrl: "",
    carouselImages: [],
    introduction: "数百只珍稀鸟类与训练师联袂呈现的视听盛宴。",
    notice: "演出期间请勿使用闪光灯，请勿投喂动物。",
    status: 1,
    sort: 1,
    isSmartRecommended: true,
    isHotSpot: true,
  },
  {
    id: 2,
    name: "夜光花车巡游",
    subtitle: "夜幕下的流光溢彩",
    guide: "提灯夜游，梦幻巡礼",
    performanceTypes: ["巡游"],
    tags: ["夜游", "灯光"],
    suitableCrowd: ["全年龄"],
    capacity: 800,
    isReservationRequired: false,
    recommendIndex: 4,
    duration: "45分钟",
    suitableAge: "不限",
    coordinates: "113.508,23.210",
    locationDesc: "园区主环路",
    coverImage: IMG(
      "Nighttime illuminated parade float with glowing lanterns and lights in a scenic park, festive, photorealistic"
    ),
    audioUrl: "",
    videoUrl: "",
    carouselImages: [],
    introduction: "华灯初上，流光花车沿主环路缓缓行进。",
    notice: "巡游期间请注意脚下安全，站在警戒线外观演。",
    status: 1,
    sort: 2,
    isSmartRecommended: false,
    isHotSpot: true,
  },
  {
    id: 3,
    name: "海豚湾欢歌",
    subtitle: "海洋精灵的欢乐派对",
    guide: "与海豚共舞",
    performanceTypes: ["动物互动", "水上表演"],
    tags: ["海豚", "欢乐"],
    suitableCrowd: ["亲子家庭", "情侣"],
    capacity: 300,
    isReservationRequired: true,
    recommendIndex: 5,
    duration: "25分钟",
    suitableAge: "全年龄",
    coordinates: "113.515,23.204",
    locationDesc: "海豚湾剧场（园区北侧）",
    coverImage: IMG(
      "Dolphins jumping in a blue ocean theater pool with splashing water, scenic park, sunny day, photorealistic"
    ),
    audioUrl: "",
    videoUrl: "",
    carouselImages: [],
    introduction: "聪明伶俐的海豚明星带来跳跃、顶球等精彩表演。",
    notice: "前排观众可能被水花打湿，可自备雨衣。",
    status: 2,
    sort: 3,
    isSmartRecommended: false,
    isHotSpot: false,
  },
]);

// 场次（对应 performance_schedules 表：weekDay + showTime 一行一场）
let seedId = 0;
const make = (performanceId, weekDays, times, capacity = null, status = 1) =>
  weekDays.flatMap((d) =>
    times.map((t) => ({
      id: ++seedId,
      performanceId,
      weekDay: d,
      showTime: t,
      capacity,
      status,
    }))
  );

const schedules = ref([
  ...make(1, [1, 3, 5], ["09:00", "10:00", "11:00", "12:00"]), // 一三五上午
  ...make(2, [0, 6], ["10:00", "15:00"], 300), // 仅周末
  ...make(
    3,
    [0, 1, 2, 3, 4, 5, 6],
    [
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
    ]
  ), // 每天十场
  {
    id: ++seedId,
    performanceId: 2,
    weekDay: 0,
    showTime: "16:30",
    capacity: null,
    status: 2,
  }, // 演示停用状态
]);

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
const quickWeeks = [
  { label: "每天", days: [0, 1, 2, 3, 4, 5, 6] },
  { label: "工作日", days: [1, 2, 3, 4, 5] },
  { label: "仅周末", days: [0, 6] },
];
const intervalOptions = [30, 45, 60, 90, 120];
const todayWeekDay = new Date().getDay();

// ==================== 演出列表 ====================
const queryForm = ref({ name: "", status: null });

const tableData = computed(() =>
  performances.value.filter(
    (p) =>
      (!queryForm.value.name || p.name.includes(queryForm.value.name)) &&
      (!queryForm.value.status || p.status === queryForm.value.status)
  )
);

const handleQuery = () => {};
const handleReset = () => {
  queryForm.value = { name: "", status: null };
};

const scheduleCountOf = (perfId) =>
  schedules.value.filter((s) => s.performanceId === perfId).length;

// TODO: 接口就绪后替换为 performanceApi.updatePerformance
const handleStatusChange = (row) => {
  ElMessage.success(`已${row.status === 1 ? "启用" : "停用"}「${row.name}」（演示）`);
};
const handleSortChange = (row) => {
  ElMessage.success(`「${row.name}」排序已更新（演示）`);
};

// ---- 新增/编辑 ----
const dialogVisible = ref(false);
const carouselInput = ref("");

const formDataInfo = () => ({
  action: "create",
  id: null,
  name: "",
  subtitle: "",
  guide: "",
  suitableCrowd: [],
  performanceTypes: [],
  tags: [],
  capacity: 0,
  isReservationRequired: false,
  recommendIndex: 3,
  duration: "",
  suitableAge: "",
  coordinates: "",
  locationDesc: "",
  coverImage: "",
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

const handleCreate = () => {
  formData.value = formDataInfo();
  dialogVisible.value = true;
};
const handleEdit = (row) => {
  formData.value = {
    ...formDataInfo(),
    ...JSON.parse(JSON.stringify(row)),
    action: "update",
  };
  dialogVisible.value = true;
};

const addCarousel = () => {
  const v = carouselInput.value.trim();
  if (v) {
    formData.value.carouselImages.push(v);
    carouselInput.value = "";
  }
};

// TODO: 接口就绪后替换为 performanceApi.operatePerformance
const handleSubmit = () => {
  if (!formData.value.name) return ElMessage.warning("请输入演出名称");
  if (!formData.value.coordinates) return ElMessage.warning("请输入经纬度");
  if (formData.value.action === "create") {
    formData.value.id = ++seedId + 1000;
    performances.value.push(JSON.parse(JSON.stringify(formData.value)));
    ElMessage.success("新增成功（演示）");
  } else {
    const row = performances.value.find((p) => p.id === formData.value.id);
    Object.assign(row, formData.value);
    ElMessage.success("保存成功（演示）");
  }
  dialogVisible.value = false;
};

// TODO: 接口就绪后替换为 performanceApi.deletePerformance（后端配置了场次级联删除）
const handleDelete = (row) => {
  const cnt = scheduleCountOf(row.id);
  ElMessageBox.confirm(
    `此操作将永久删除「${row.name}」${cnt ? `及其 ${cnt} 个场次` : ""}, 是否继续?`,
    "提示",
    { confirmButtonText: "确定", cancelButtonText: "取消", type: "warning" }
  )
    .then(() => {
      performances.value = performances.value.filter((p) => p.id !== row.id);
      schedules.value = schedules.value.filter((s) => s.performanceId !== row.id);
      ElMessage.success("已删除（演示）");
    })
    .catch(() => {});
};

// ==================== 场次管理（抽屉） ====================
const scheduleDrawer = ref(false);
const schedulePerf = ref(null);

const openScheduleDrawer = (row) => {
  schedulePerf.value = row;
  scheduleDrawer.value = true;
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

// TODO: 接口就绪后替换为 performanceApi.batchCreateSchedule
const handleBatchSubmit = () => {
  const { weekDays, capacity } = batchForm.value;
  if (!weekDays.length) return ElMessage.warning("请选择星期");
  if (!previewTimes.value.length) return ElMessage.warning("请生成或添加时间点");

  const exist = new Set(drawerSchedules.value.map((s) => `${s.weekDay}-${s.showTime}`));
  let added = 0;
  weekDays.forEach((d) => {
    previewTimes.value.forEach((t) => {
      if (!exist.has(`${d}-${t}`)) {
        schedules.value.push({
          id: ++seedId + 1000,
          performanceId: schedulePerf.value.id,
          weekDay: d,
          showTime: t,
          capacity: capacity ?? null,
          status: 1,
        });
        added++;
      }
    });
  });
  const skipped = batchWeekTimes.value.length - added;
  ElMessage.success(`已添加 ${added} 场${skipped ? `，跳过重复 ${skipped} 场` : ""}`);
  batchVisible.value = false;
};

// ---- 编辑/删除单场 ----
const editVisible = ref(false);
const editForm = ref({});

const openEdit = (row) => {
  editForm.value = { ...row };
  editVisible.value = true;
};

// TODO: 接口就绪后替换为 performanceApi.updateSchedule
const handleEditSubmit = () => {
  const row = schedules.value.find((s) => s.id === editForm.value.id);
  if (!row) return;
  const dup = drawerSchedules.value.find(
    (s) =>
      s.id !== row.id &&
      s.weekDay === editForm.value.weekDay &&
      s.showTime === editForm.value.showTime
  );
  if (dup) return ElMessage.warning("该星期此时间已存在场次");
  Object.assign(row, {
    showTime: editForm.value.showTime,
    capacity: editForm.value.capacity ?? null,
    status: editForm.value.status,
  });
  ElMessage.success("已保存（演示）");
  editVisible.value = false;
};

// TODO: 接口就绪后替换为 performanceApi.deleteSchedule
const handleDeleteSchedule = (row) => {
  ElMessageBox.confirm(
    `确定删除 ${weekName[row.weekDay]} ${row.showTime} 这一场吗？`,
    "提示",
    { confirmButtonText: "确定", cancelButtonText: "取消", type: "warning" }
  )
    .then(() => {
      schedules.value = schedules.value.filter((s) => s.id !== row.id);
      ElMessage.success("已删除（演示）");
    })
    .catch(() => {});
};

// TODO: 接口就绪后替换为批量删除接口
const handleClearDay = (d) => {
  ElMessageBox.confirm(`确定清空 ${weekName[d]} 的全部场次吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      schedules.value = schedules.value.filter(
        (s) => !(s.performanceId === schedulePerf.value.id && s.weekDay === d)
      );
      ElMessage.success("已清空（演示）");
    })
    .catch(() => {});
};
</script>

<style lang="scss" scoped>
.demo-tip {
  margin: 10px 0;
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

.carousel-tags {
  margin-top: 6px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
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
