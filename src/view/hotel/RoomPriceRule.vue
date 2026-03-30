<template>
  <div class="dept-manage">
    <!-- 查询 -->
    <div class="query-form">
      <div class="title">房型套餐配置</div>
      <div class="query-item">
        <el-input
          placeholder="请输入房型套餐名称"
          v-model="queryForm.name"
          style="width: 200px"
        ></el-input>
        <el-select placeholder="选择酒店" v-model="queryForm.type" style="width: 200px">
          <el-option
            v-for="item in category"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>

        <el-button type="primary" @click="handleQuery" style="margin-left: 20px"
          >查询</el-button
        >
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>
    <!-- 操作 -->
    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="handleCreate" v-has="'RoomPriceRule-create'"
          >创建房型套餐</el-button
        >
      </div>
    </div>

    <!-- 表格展示 -->
    <el-table v-loading="loading" :data="ticketList" style="width: 100%">
      <el-table-column type="index" label="排序" width="100" align="center" />
      <!-- <el-table-column prop="id" label="ID" width="80px"></el-table-column> -->
      <el-table-column prop="name" label="房型套餐名称" align="center"></el-table-column>
      <el-table-column prop="type" label="酒店名称" align="center">
        <template #default="scope">
          <span>{{ scope.row.roomType.hotel.title }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="price" label="价格" align="center"></el-table-column>
      <el-table-column
        prop="startDate"
        label="套餐开始日期"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="endDate"
        label="套餐结束日期"
        align="center"
      ></el-table-column>
      <el-table-column prop="createdAt" label="创建时间" align="center"></el-table-column>

      <el-table-column fixed="right" prop="" label="操作" min-width="120" align="center">
        <template #default="scope">
          <el-button
            type="primary"
            size="small"
            @click="handleConfigPrice(scope.row)"
            v-has="'RoomPriceRule-config'"
            >配置价格规则</el-button
          >
          <el-button
            type="primary"
            size="small"
            @click="handleEdit(scope.row)"
            v-has="'RoomPriceRule-update'"
            >编辑</el-button
          >
          <el-button
            type="danger"
            size="small"
            @click="handleDelete(scope.row)"
            v-has="'RoomPriceRule-delete'"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 创建房型套餐 -->
    <el-dialog
      :title="action === 'create' ? '创建房型套餐' : '更新房型套餐'"
      v-model="dialogVisible"
      width="50%"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="form-box">
        <el-form :model="createForm" ref="createFormRef" label-width="120px">
          <el-form-item label="套餐房型" prop="roomTypeId">
            <el-select v-model="createForm.roomTypeId" placeholder="请选择房型">
              <el-option
                v-for="item in roomTypeList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="房型套餐名称" prop="name">
            <el-input v-model="createForm.name"></el-input>
          </el-form-item>
          <el-form-item label="套餐价格" prop="price">
            <el-input v-model="createForm.price"></el-input>
          </el-form-item>
          <el-form-item label="选择套餐日期" prop="date">
            <div class="block">
              <el-date-picker
                v-model="timeInterval"
                type="daterange"
                range-separator="至"
                start-placeholder="套餐开始日期"
                end-placeholder="套餐结束日期"
                size="default"
              />
            </div>
          </el-form-item>
          <el-form-item label="套餐简介" prop="includes">
            <el-input
              v-model="createForm.includes"
              type="textarea"
              placeholder="请用英文逗号分隔"
            ></el-input>
          </el-form-item>
          <el-form-item label="退票规则" prop="exitRule">
            <el-input v-model="createForm.exitRule"></el-input>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="createForm.status">
              <el-radio :value="1">启用</el-radio>
              <el-radio :value="2">禁用</el-radio>
            </el-radio-group>
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

    <!-- 创建价格规则 -->
    <el-dialog
      title="配置日期价格"
      v-model="priceDialogVisible"
      width="60%"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="form-box">
        <el-form>
          <el-form-item label="工作日规则" prop="price">
            <el-radio-group v-model="ruleForm.weekday.priceType">
              <el-radio :value="1" size="large">固定价格</el-radio>
              <el-radio :value="2" size="large">百分比上涨</el-radio>
              <el-radio :value="3" size="large">百分比下降</el-radio>
            </el-radio-group>
            <el-input v-model="ruleForm.weekday.priceValue"></el-input>
          </el-form-item>
          <el-form-item label="休息日规则" prop="price">
            <el-radio-group v-model="ruleForm.weekend.priceType">
              <el-radio :value="1" size="large">固定价格</el-radio>
              <el-radio :value="2" size="large">百分比上涨</el-radio>
              <el-radio :value="3" size="large">百分比下降</el-radio>
            </el-radio-group>
            <el-input v-model="ruleForm.weekend.priceValue"></el-input>
          </el-form-item>
          <el-form-item label="节假日规则" prop="price">
            <el-radio-group v-model="ruleForm.holiday.priceType">
              <el-radio :value="1" size="large">固定价格</el-radio>
              <el-radio :value="2" size="large">百分比上涨</el-radio>
              <el-radio :value="3" size="large">百分比下降</el-radio>
            </el-radio-group>
            <el-input v-model="ruleForm.holiday.priceValue"></el-input>
          </el-form-item>
        </el-form>
        <div class="createPriceDate">
          <el-button @click="generatePriceDate" type="primary">生成价格日期</el-button>
        </div>

        <div v-if="dateMagic">
          <el-calendar v-model="dateValue">
            <template #date-cell="{ data }">
              <el-popconfirm
                width="250"
                :icon="InfoFilled"
                icon-color="#626AEF"
                title="修改单个日期价格"
                @cancel="onCancel"
              >
                <template #reference>
                  <div class="calendar-cell" @click="handleDateClick(data)">
                    <!-- 显示日期 -->
                    <div class="date">
                      {{ data.day.slice(5) }}
                      <span v-if="data.isSelected" class="selected-indicator">
                        <el-icon><SuccessFilled /></el-icon>
                      </span>
                    </div>

                    <!-- 查找对应日期的数据 -->
                    <div v-if="getDateData(data.day)" class="price-info">
                      <div class="price">
                        ¥{{ getDateData(data.day)?.price || data.price }}
                      </div>
                      <div class="stock">
                        <span
                          >总库存: {{ getDateData(data.day)?.stock || data.stock }}</span
                        >
                        <span style="margin-left: 8px"
                          >剩余库存:
                          {{ getDateData(data.day)?.stock || data.stock }}</span
                        >
                      </div>
                    </div>
                  </div>
                </template>
                <template #actions="{ confirm: popconfirmConfirm, cancel }">
                  <div class="ceshi">
                    <el-form
                      style="max-width: 600px"
                      :model="datePriceForm"
                      label-width="auto"
                    >
                      <el-form-item label="当日价格：" prop="price">
                        <el-input v-model="datePriceForm.price" />
                      </el-form-item>

                      <!-- <el-form-item label="当日库存：" prop="stock">
                        <el-input v-model="datePriceForm.stock" />
                      </el-form-item> -->
                    </el-form>
                  </div>

                  <el-button size="small" @click="cancel">取消</el-button>
                  <el-button
                    type="danger"
                    size="small"
                    @click="handleFormConfirm(data, popconfirmConfirm)"
                  >
                    确认
                  </el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-calendar>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="priceDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="ruleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { hotelApi, commonApi } from "../../api/index.js";
import { InfoFilled } from "@element-plus/icons-vue";

// -------------------------数据-------------------------

const queryForm = ref({
  name: "",
  type: "",
});

const category = ref([]);
let ticketList = ref([]);
let roomTypeList = ref([]);

const dialogVisible = ref(false);
const priceDialogVisible = ref(false);

// 日期
const timeInterval = ref([]);

const action = ref("create");

const loading = ref(true);

let form = () => ({
  name: "普通套餐",
  roomTypeId: "",
  price: "399",
  includes: "没啥简介",
  exitRule: "入住前5天可免费取消",
  startDate: "",
  endDate: "",
  status: 1,
});

const createForm = ref(form());

const dateValue = ref(new Date());

const ruleConfig = () => ({
  weekday: { priceType: 1, priceValue: "" },
  weekend: { priceType: 1, priceValue: "" },
  holiday: { priceType: 1, priceValue: "" },
});

const ruleForm = ref(ruleConfig());

const roomPackageId = ref("");
const dateMagic = ref(false);
const datePriceList = ref([]);

const datePriceForm = ref({
  id: "",
  price: "",
  priceType: 2,
  // stock: "",
  availableStock: "",
});

const clicked = ref(false);

// ---------------------  函数方法  ------------------------

onMounted(() => {
  getList();
  getRoomTypeList();
});

//获取房型列表
const getRoomTypeList = async () => {
  let res = await hotelApi.getRoomTypeList();
  if (res.code === 200) {
    roomTypeList.value = res.data.list;
  }
};

// 获取列表数据
const getList = async () => {
  let res = await hotelApi.getRoomPackageList();
  console.log("什么情况", res);
  if (res.code === 200) {
    ticketList.value = res.data.list;
    ticketList.value.forEach((item) => {
      item.startDate = formatDate(item.startDate);
      item.endDate = formatDate(item.endDate);
    });
    loading.value = false;
  }
};

// 查询数据
const handleQuery = () => {
  console.log("查询数据");
};

// 重置查询表单
const handleReset = () => {
  queryForm.value = {
    name: "",
    type: "",
  };
  getList();
};

// 创建房型套餐
const handleCreate = () => {
  console.log("创建房型套餐");
  dialogVisible.value = true;

  nextTick(() => {
    action.value = "create";
    timeInterval.value = [];
    createForm.value = form();
  });
};

/**
 * 日期格式化函数 - 增强版
 * 支持 Date 对象、ISO字符串、时间戳
 */
const formatDate = (date) => {
  if (!date) return "";

  let dateObj;

  // 判断输入类型并转换为Date对象
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === "string" && date.includes("T")) {
    // ISO字符串格式，如 "2026-02-04T00:00:00.000Z"
    dateObj = new Date(date);
  } else if (typeof date === "number" || !isNaN(date)) {
    // 时间戳
    dateObj = new Date(Number(date));
  } else if (typeof date === "string") {
    // 尝试解析其他日期字符串
    dateObj = new Date(date);
  } else {
    return "";
  }

  // 验证Date对象是否有效
  if (isNaN(dateObj.getTime())) {
    return "";
  }

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  // 格式化为YYYY-MM-DD
  return `${year}-${month}-${day}`;
};

// 提交数据
const handleSubmit = async () => {
  // 将格式化后的日期赋值给 createForm
  createForm.value.startDate = formatDate(timeInterval.value[0]);
  createForm.value.endDate = formatDate(timeInterval.value[1]);

  let data = {
    ...createForm.value,
    action: action.value,
  };
  let res = await hotelApi.packageOperation(data);
  if (res.code == 200) {
    ElMessage.success("操作成功");
    dialogVisible.value = false;
    getList();
  }
};

// 编辑
const handleEdit = (row) => {
  console.log("数据", row);

  nextTick(() => {
    action.value = "update";

    for (let key in createForm.value) {
      createForm.value[key] = row[key];
    }
    createForm.value.id = row.id;
    timeInterval.value = [row.startDate, row.endDate];
  });
  console.log(createForm.value);

  dialogVisible.value = true;
};

// 配置价格规则
const handleConfigPrice = async (row) => {
  roomPackageId.value = row.id;
  getDatePriceList();

  ruleForm.value = ruleConfig();
  dateMagic.value = false;
  let res = await hotelApi.getPackagePriceDateRule({ id: roomPackageId.value });
  console.log("规则信息", res);
  if (res.code === 200 && res.data != "") {
    for (let key in ruleForm.value) {
      console.log(key);
      ruleForm.value[key].priceType = res.data.ruleConfig[key].priceType;
      ruleForm.value[key].priceValue = res.data.ruleConfig[key].priceValue;
      dateMagic.value = true;
    }
  }
  priceDialogVisible.value = true;
};

// 生成价格日期
const generatePriceDate = async () => {
  let data = {
    action: "create",
    roomPackageId: roomPackageId.value,
    ruleConfig: ruleForm.value,
  };

  let res = await hotelApi.packagePriceDate(data);
  console.log("返回信息", res);
  if (res.code === 200) {
    ElMessage.success(res.message);
    dateMagic.value = true;
    getDatePriceList();
  }
};

// 获取价格日期列表
const getDatePriceList = async () => {
  let res = await hotelApi.getPackagePriceDate({ id: roomPackageId.value });
  if (res.code === 200) {
    datePriceList.value = res.data;
  }
};

// 查找日期对应的数据
const getDateData = (dateStr) => {
  let res = datePriceList.value.find((item) => item.date === dateStr);
  return res;
};

// 单个日期修改
const handleDateClick = (date) => {
  let dateData = getDateData(date.day);
  console.log("日期对应的数据:", dateData);

  // 将当前日期的数据填充到表单中
  if (dateData) {
    datePriceForm.value = {
      ...datePriceForm.value,
      id: dateData.id || "",
      price: dateData.price || "",
      // stock: dateData.stock || "",
      availableStock: dateData.availableStock || "",
    };
  } else {
    // 如果没有数据，重置表单
    datePriceForm.value = {
      id: "",
      price: "",
      priceType: 2,
      // stock: "",
      availableStock: "",
    };
  }
};
// 处理表单确认
const handleFormConfirm = async (date, popconfirmConfirm) => {
  console.log("表单数据:", datePriceForm.value);

  datePriceForm.value.availableStock = datePriceForm.value.stock;

  // 调用API保存数据
  let res = await hotelApi.changeDatePrice(datePriceForm.value);

  if (res.code == 200) {
    ElMessage.success(res.message);
    datePriceForm.value = {
      id: "",
      price: "",
      priceType: 2,
      // stock: "",
      availableStock: "",
    };
    getDatePriceList();
    popconfirmConfirm();
  }
};

function onCancel() {
  clicked.value = true;
}

// 提交价格规则
const ruleSubmit = async () => {
  console.log("数据");
};

// 删除
const handleDelete = (row) => {
  console.log("数据", row);
};
</script>

<style lang="scss" scoped>
.demo-date-picker {
  display: flex;
  width: 100%;
  padding: 0;
  flex-wrap: wrap;
}

.demo-date-picker .block {
  padding: 1.5rem 0;
  text-align: center;
  border-right: solid 1px var(--el-border-color);
  flex: 1;
  min-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.demo-date-picker .block:last-child {
  border-right: none;
}

.demo-date-picker .demonstration {
  display: block;
  color: var(--el-text-color-secondary);
  font-size: 14px;
  margin-bottom: 1rem;
}

@media screen and (max-width: 1200px) {
  .demo-date-picker .block {
    flex: 0 0 100%;
    padding: 1rem 0;
    min-width: auto;
    border-right: none;
    border-bottom: solid 1px var(--el-border-color);
  }

  .demo-date-picker .block:last-child {
    border-bottom: none;
  }
}

.createPriceDate {
  width: 100%;
  display: flex;
  justify-content: center;
}

.calendar-container {
  max-width: 800px;
  margin: 20px auto;
}

.calendar-cell {
  height: 100%;
  position: relative;
}

.calendar-cell .date {
  font-size: 15px;
  font-weight: bold;
  display: flex;
  align-items: center;
}

.calendar-cell .price-info {
  font-size: 12px;
}

.calendar-cell .price {
  color: #f56c6c;
  font-weight: bold;
}

.calendar-cell .stock {
  font-weight: bold;
  color: #1b8bcf;
}
.selected-indicator {
  color: #67c23a;
  font-weight: bold;
  margin-left: 6px;
  font-size: 15px;
}

.ceshi {
  width: 100%;
  height: 50px;
  // border: 1px solid #ccc;
  margin-bottom: 20px;
  padding: 10px;
}
</style>
