<!-- 景区公交订单管理 -->
<template>
  <div class="dept-manage">
    <!-- 头部 -->
    <div class="query-form">
      <div class="title">景区公交订单</div>
      <div class="query-item">
        <el-input
          style="width: 200px"
          v-model="queryForm.orderNumber"
          placeholder="请输入订单号"
        />
        <el-input
          style="width: 140px"
          v-model="queryForm.userId"
          placeholder="请输入用户ID"
        />
        <el-select
          style="width: 180px"
          v-model="queryForm.scenicBusId"
          placeholder="选择班次"
          filterable
          clearable
        >
          <el-option
            v-for="item in busOptions"
            :key="item.id"
            :label="item.title"
            :value="item.id"
          />
        </el-select>
        <el-select
          style="width: 140px"
          v-model="queryForm.payStatus"
          placeholder="订单状态"
          clearable
        >
          <el-option label="待支付" :value="1" />
          <el-option label="已支付" :value="2" />
          <el-option label="已完成" :value="3" />
          <el-option label="已退款" :value="4" />
          <el-option label="已取消" :value="5" />
        </el-select>
        <el-date-picker
          style="width: 150px"
          v-model="queryForm.rideDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="乘车日期"
        />
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <div class="base-table">
      <div class="action">
        <el-button type="success" @click="openVerify">车票核销</el-button>
      </div>

      <el-table :data="tableData" height="calc(100vh - 255px)" style="width: 100%">
        <el-table-column
          prop="orderNumber"
          label="订单编号"
          width="260"
          align="center"
        />
        <el-table-column prop="title" label="班次名称" min-width="150" align="center" />
        <el-table-column label="票种" width="70" align="center">
          <template #default="{ row }">
            {{ ticketTypeMap[row.ticketType] || row.ticketType }}
          </template>
        </el-table-column>
        <el-table-column prop="rideDate" label="乘车日期" width="110" align="center" />
        <el-table-column prop="timeSlot" label="时段" width="110" align="center" />
        <el-table-column prop="quantity" label="数量" width="70" align="center" />
        <el-table-column prop="userPhone" label="联系电话" width="120" align="center" />
        <el-table-column prop="totalAmount" label="总额(￥)" width="90" align="center" />
        <el-table-column prop="orderAmount" label="实付(￥)" width="90" align="center" />
        <el-table-column prop="refundAmount" label="退款(￥)" width="90" align="center" />
        <el-table-column label="订单状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="payStatusType[row.payStatus]">{{
              payStatusMap[row.payStatus]
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="170" align="center" />
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" plain size="small" @click="handleDetail(row)"
              >详情</el-button
            >
            <el-button
              v-if="row.payStatus == 1"
              type="warning"
              plain
              size="small"
              @click="handlePay(row)"
              >支付</el-button
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

    <!-- 订单详情（含车票明细） -->
    <el-dialog
      v-model="detailVisible"
      title="订单详情"
      width="75%"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div v-loading="detailLoading" class="form-box">
        <template v-if="orderDetail">
          <el-descriptions :column="3" border style="margin-bottom: 20px">
            <el-descriptions-item label="订单编号" :span="2">{{
              orderDetail.orderNumber
            }}</el-descriptions-item>
            <el-descriptions-item label="订单状态">
              <el-tag :type="payStatusType[orderDetail.payStatus]">{{
                payStatusMap[orderDetail.payStatus]
              }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="用户ID">{{
              orderDetail.userId
            }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{
              orderDetail.userPhone
            }}</el-descriptions-item>
            <el-descriptions-item label="联系人">{{
              orderDetail.contactName || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="班次名称" :span="2">{{
              orderDetail.title
            }}</el-descriptions-item>
            <el-descriptions-item label="票种">{{
              ticketTypeMap[orderDetail.ticketType] || orderDetail.ticketType
            }}</el-descriptions-item>
            <el-descriptions-item label="乘车日期">{{
              orderDetail.rideDate
            }}</el-descriptions-item>
            <el-descriptions-item label="时段">{{
              orderDetail.timeSlot || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="购票数量">{{
              orderDetail.quantity
            }}</el-descriptions-item>
            <el-descriptions-item label="订单总额(￥)">{{
              orderDetail.totalAmount
            }}</el-descriptions-item>
            <el-descriptions-item label="实付金额(￥)">{{
              orderDetail.orderAmount
            }}</el-descriptions-item>
            <el-descriptions-item label="退款金额(￥)">{{
              orderDetail.refundAmount || 0
            }}</el-descriptions-item>
            <el-descriptions-item label="支付时间">{{
              orderDetail.paymentTime || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="创建时间" :span="2">{{
              orderDetail.createdAt
            }}</el-descriptions-item>
          </el-descriptions>

          <!-- 车票明细（一票一码，每张票独立核销/退票） -->
          <div style="font-weight: bold; margin-bottom: 10px">车票明细</div>
          <el-table :data="orderDetail.tickets || []" border style="width: 100%">
            <el-table-column prop="seq" label="序号" width="60" align="center" />
            <el-table-column
              prop="ticketNo"
              label="车票号"
              min-width="220"
              align="center"
            />
            <el-table-column
              prop="verifyCode"
              label="核销码"
              width="140"
              align="center"
            />
            <el-table-column label="票状态" width="90" align="center">
              <template #default="{ row }">
                <el-tag :type="verifyStatusType[row.verifyStatus]">{{
                  verifyStatusMap[row.verifyStatus]
                }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="verifyTime"
              label="核销时间"
              width="170"
              align="center"
            >
              <template #default="{ row }">{{ row.verifyTime || "-" }}</template>
            </el-table-column>
            <el-table-column prop="ticketAmount" label="票金额(￥)" width="95" align="center" />
            <el-table-column
              prop="refundTime"
              label="退票时间"
              width="170"
              align="center"
            >
              <template #default="{ row }">{{ row.refundTime || "-" }}</template>
            </el-table-column>
            <el-table-column prop="refundAmount" label="退款(￥)" width="85" align="center">
              <template #default="{ row }">{{ row.refundAmount || 0 }}</template>
            </el-table-column>
            <el-table-column label="操作" width="90" align="center" fixed="right">
              <template #default="{ row }">
                <el-button
                  v-if="row.verifyStatus == 1 && orderDetail.payStatus == 2"
                  type="danger"
                  plain
                  size="small"
                  @click="handleRefund(row)"
                  >退票</el-button
                >
                <span v-else>-</span>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 车票核销 -->
    <el-dialog
      v-model="verifyVisible"
      title="车票核销"
      width="450px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-input
        v-model="verifyCode"
        placeholder="请输入/扫描车票核销码"
        clearable
        @keyup.enter="handleVerify"
      >
        <template #append>
          <el-button :loading="verifyLoading" @click="handleVerify">核销</el-button>
        </template>
      </el-input>
      <el-result
        v-if="verifyResult"
        :icon="verifyResult.success ? 'success' : 'error'"
        :title="verifyResult.success ? '核销成功' : '核销失败'"
        :sub-title="verifyResult.text"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import Pagination from "../../components/pagination/pagination.vue";
import { appointmentApi } from "../../api/index.js";

// 状态映射（与后端模型 comment 一致）
const ticketTypeMap = { 1: "成人", 2: "儿童", 3: "学生", 4: "其他" };
// 订单状态（payStatus 统一五态）1待支付 2已支付 3已完成 4已退款 5已取消
const payStatusMap = { 1: "待支付", 2: "已支付", 3: "已完成", 4: "已退款", 5: "已取消" };
const payStatusType = { 1: "warning", 2: "primary", 3: "success", 4: "danger", 5: "info" };
// 票状态 1待乘车 2已核销 3已过期 4已退票
const verifyStatusMap = { 1: "待乘车", 2: "已核销", 3: "已过期", 4: "已退票" };
const verifyStatusType = { 1: "primary", 2: "success", 3: "info", 4: "danger" };

let queryForm = ref({
  orderNumber: "",
  userId: "",
  scenicBusId: null,
  payStatus: null,
  rideDate: "",
});

// 分页参数
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

// 数据列表
let tableData = ref([]);

// 班次下拉选项
let busOptions = ref([]);

// 订单详情
let detailVisible = ref(false);
let detailLoading = ref(false);
let orderDetail = ref(null);

// 核销
let verifyVisible = ref(false);
let verifyLoading = ref(false);
let verifyCode = ref("");
let verifyResult = ref(null);

// ------------------------函数方法----------------------

onMounted(() => {
  getBusOptions();
  getList();
});

// 获取班次选项（用于查询下拉）
let getBusOptions = async () => {
  let res = await appointmentApi.getScenicBusList({ page: 1, pageSize: 999 });
  if (res.code == 200) {
    busOptions.value = res.data.scenicBusList;
  }
};

let handleQuery = () => {
  pagination.value.currentPage = 1;
  getList();
};

let handleReset = () => {
  queryForm.value = {
    orderNumber: "",
    userId: "",
    scenicBusId: null,
    payStatus: null,
    rideDate: "",
  };
  pagination.value.currentPage = 1;
  getList();
};

// 订单列表
let getList = async () => {
  let data = {
    ...queryForm.value,
    page: pagination.value.currentPage,
    pageSize: pagination.value.pageSize,
  };
  let res = await appointmentApi.getScenicBusOrderList(data);
  if (res.code == 200) {
    tableData.value = res.data.scenicBusOrderList;
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

// 订单详情
const handleDetail = async (row) => {
  detailVisible.value = true;
  detailLoading.value = true;
  orderDetail.value = null;
  let res = await appointmentApi.getScenicBusOrderDetail({ id: row.id });
  detailLoading.value = false;
  if (res.code == 200) {
    orderDetail.value = res.data;
  } else {
    detailVisible.value = false;
    ElMessage.error(res.message);
  }
};

// 支付（占位接口，待接入支付渠道）
const handlePay = (row) => {
  ElMessageBox.confirm(`确定为订单 ${row.orderNumber} 发起支付吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      let res = await appointmentApi.scenicBusPay({ orderNumber: row.orderNumber });
      if (res.code == 200) {
        ElMessage.success(res.message);
        getList();
      } else {
        ElMessage.error(res.message);
      }
    })
    .catch(() => {});
};

// 单张退票（仅"待乘车"且已支付的票可退）
const handleRefund = (ticket) => {
  ElMessageBox.prompt("退票后该票无法恢复，退款将原路退回", "退票确认", {
    confirmButtonText: "确定退票",
    cancelButtonText: "取消",
    inputPlaceholder: "退票原因（选填）",
    type: "warning",
  })
    .then(async ({ value }) => {
      let res = await appointmentApi.scenicBusRefund({
        ticketId: ticket.id,
        reason: value || undefined,
      });
      if (res.code == 200) {
        ElMessage.success(`退票成功，退款金额 ￥${res.data.refundAmount}`);
        // 刷新详情与列表
        handleDetail({ id: orderDetail.value.id });
        getList();
      } else {
        ElMessage.error(res.message);
      }
    })
    .catch(() => {});
};

// 打开核销弹窗
const openVerify = () => {
  verifyCode.value = "";
  verifyResult.value = null;
  verifyVisible.value = true;
};

// 核销提交（一票一码）
const handleVerify = async () => {
  if (!verifyCode.value) return ElMessage.warning("请输入核销码");
  verifyLoading.value = true;
  let res = await appointmentApi.scenicBusVerify({
    verifyCode: verifyCode.value.trim(),
  });
  verifyLoading.value = false;

  if (res.code == 200) {
    verifyResult.value = {
      success: true,
      text: `票号：${res.data.ticketNo}｜订单：${res.data.orderNumber}｜本单剩余待乘车：${res.data.waitingCount} 张`,
    };
    verifyCode.value = ""; // 清空输入，便于连续扫码核销
    getList();
  } else {
    verifyResult.value = { success: false, text: res.message };
  }
};
</script>

<style lang="scss" scoped></style>
