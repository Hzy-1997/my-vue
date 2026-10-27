<!--
 * @描述: 
 * @版本: 
 * @作者: 
 * @日期: ${year}-${month}-${day}
 * @最后编辑者: sueRimn
 * @最后编辑时间: ${year}-${month}-${day} ${hour}:${minute}:${second}
-->
<!--  -->
<template>
  <div>
    <!-- 支付结果提示 -->
    <el-alert
      v-if="paySuccess"
      title="支付成功！"
      type="success"
      description="您的订单已支付成功，请查看订单详情。"
      show-icon
      :closable="true"
      style="margin-bottom: 20px"
    />

    <div class="query-form">
      <div class="form-box">
        <div class="form-content">
          <div class="title" style="width: 70px; margin-right: 5px">票务订单</div>
          <div class="query-item">
            <el-input
              style="width: 200px"
              placeholder="请输入订单号"
              v-model="queryForm.outTradeNo"
            ></el-input>
            <el-input
              style="width: 200px"
              placeholder="请输入手机号"
              v-model="queryForm.userPhone"
            ></el-input>
            <el-input
              style="width: 200px"
              placeholder="请输入身份证号"
              v-model="queryForm.userIdCard"
            ></el-input>

            <el-select
              v-model="queryForm.ticketType"
              placeholder="选择票种"
              style="width: 180px; margin-right: 20px"
              clearable
            >
              <el-option
                v-for="item in titleOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>

            <el-select
              v-model="queryForm.payStatus"
              placeholder="订单状态"
              style="width: 180px; margin-right: 20px"
              clearable
            >
              <el-option
                v-for="item in orderOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>

            <el-date-picker
              style="width: 240px"
              v-model="dateRange"
              type="daterange"
              unlink-panels
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />

            <el-button type="primary" @click="handleQuery">
              <el-icon><Search /></el-icon>查询</el-button
            >
            <el-button @click="handleReset">
              <el-icon><RefreshLeft /></el-icon>重置</el-button
            >
          </div>
        </div>
        <div class="export-btn">
          <!-- <el-select v-model="exportFormat" style="width: 120px; margin-right: 10px">
            <el-option label="Excel" value="xlsx" />
            <el-option label="CSV" value="csv" />
            <el-option label="JSON" value="json" />
            <el-option label="PDF" value="pdf" />
          </el-select> -->
          <el-button type="primary" @click="handleExportExcel"
            >导出{{ exportFormat.toUpperCase() }}</el-button
          >
        </div>
      </div>
    </div>

    <!--  创建 展示 -->
    <div class="base-table">
      <div class="action"></div>

      <!-- 表格展示 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
        height="calc(100vh - 255px)"
        :row-style="{ height: '55px' }"
      >
        <el-table-column
          prop="orderNumber"
          label="订单编号"
          width="280"
          align="center"
        ></el-table-column>
        <el-table-column prop="userName" label="用户名" align="center"></el-table-column>
        <!-- <el-table-column prop="type" label="图片" align="center">
        <template #default="scope">
          <el-image :src="imgUrl + scope.row.cover" style="width: 50px; height: 50px" />
        </template>
      </el-table-column> -->
        <el-table-column prop="title" label="票务名称" align="center"></el-table-column>
        <el-table-column prop="userPhone" label="手机号" align="center"></el-table-column>
        <el-table-column
          prop="userIdCard"
          width="200"
          label="身份证号"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="playDate"
          label="游玩日期"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="ticketPrice"
          label="票务单价"
          align="center"
        ></el-table-column>
        <el-table-column prop="buyNum" label="购买数量" align="center"></el-table-column>
        <el-table-column
          prop="orderAmount"
          label="付款金额"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="refundAmount"
          label="退款金额"
          align="center"
        ></el-table-column>
        <el-table-column prop="payStatus" label="订单状态" align="center">
          <template #default="scope">
            <el-tag :type="getPayStatusType(scope.row.payStatus)">
              {{ getOrderStatusText(scope.row.payStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="verifyStatus" label="核销状态" align="center">
          <template #default="scope">
            <el-tag :type="getVerifyStatusType(scope.row.verifyStatus)">
              {{ getVerifyStatusText(scope.row.verifyStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="" label="操作" fixed="right">
          <template #default="scope">
            <el-button
              type="primary"
              link
              @click="handleRefund(scope.row)"
              v-has="'order-refund'"
              >退款</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 翻页 -->
    <div class="table-pagination">
      <Pagination
        :pagination="pagination"
        @handleSizeChange="handleSizeChange"
        @handleCurrentChange="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { paymentApi, ticketingApi } from "../../api/index.js";
import { cryptoUtil } from "../../utils/utils.js";
import Pagination from "../../components/pagination/pagination.vue";
import { useStorage } from "../../store/storage.js";

const route = useRoute();
const storage = useStorage();
const loading = ref(false);

const queryForm = ref({
  outTradeNo: "", // 订单号
  userPhone: "", // 手机号
  userIdCard: "", // 身份证号
  startDate: "", // 开始时间
  endDate: "", // 结束时间
  ticketType: "", // 票种
  payStatus: "", // 订单状态
});

let dateRange = ref([]); //日期范围

// 导出格式
const exportFormat = ref("xlsx"); // 默认导出Excel格式

//订单状态（payStatus 统一五态）：1-待支付，2-已支付，3-已完成，4-已退款，5-已取消
let orderOptions = ref([
  {
    label: "待支付",
    value: "1",
  },
  {
    label: "已支付",
    value: "2",
  },
  {
    label: "已完成",
    value: "3",
  },
  {
    label: "已退款",
    value: "4",
  },
  {
    label: "已取消",
    value: "5",
  },
]);

let titleOptions = ref([]);

// 分页参数
const pagination = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

const tableData = ref([]);

// 支付成功状态
const paySuccess = ref(false);

// 支付完成后跳转处理
onMounted(() => {
  getOrderList();
  getTicketList();
  // 从 URL 获取订单号
  const orderNo = route.query.out_trade_no;
  if (orderNo) {
    // 自动填充订单号并查询
    queryForm.value.outTradeNo = orderNo;
    handleQuery();

    // 显示支付成功提示
    paySuccess.value = true;
    ElMessage.success("支付成功！");
  }
});

// 获取订单列表
const getOrderList = async () => {
  // TODO: 调用接口获取订单列表
  loading.value = true;

  if (dateRange.value.length > 0) {
    queryForm.value.startDate = dateRange.value[0];
    queryForm.value.endDate = dateRange.value[1];
  }

  let res = await paymentApi.getOrderList({
    ...pagination.value,
    ...queryForm.value,
  });

  if (res.code === 200) {
    res.data.orderList.forEach((item) => {
      item.userPhone = cryptoUtil.decrypt(item.userPhone);
      item.userIdCard = cryptoUtil.decrypt(item.userIdCard);
    });

    tableData.value = res.data.orderList;
    pagination.value.total = res.data.total;
  }
  loading.value = false;
  console.log("获取订单列表:", tableData.value);
};

// 获取票列表
const getTicketList = async () => {
  let res = await ticketingApi.ticketList({});
  console.log(res);
  res.data.list.map((item) =>
    titleOptions.value.push({
      label: item.title,
      value: item.id,
    })
  );
};

// 查询订单
const handleQuery = async () => {
  console.log("查询订单:", queryForm.value);
  if (
    !queryForm.value.outTradeNo &&
    !queryForm.value.userPhone &&
    !queryForm.value.userIdCard &&
     !queryForm.value.payStatus && 
    !dateRange.value?.length //  dateRange 的判空，防止 undefined
  ) {
    ElMessage.error("请输入查询条件");
    return;
  }
  // queryForm.value.userPhone = cryptoUtil.encrypt(queryForm.value.userPhone);
  // queryForm.value.userIdCard = cryptoUtil.encrypt(queryForm.value.userIdCard);
  // TODO: 调用接口查询订单列表
  console.log("查询订单:", queryForm.value);
  getOrderList();
};

// 重置
const handleReset = () => {
  console.log("重置");
  queryForm.value.outTradeNo = ""; // 重置订单号
  queryForm.value.userPhone = "";
  queryForm.value.userIdCard = "";
  queryForm.value.startDate = ""; // 开始时间
  queryForm.value.endDate = ""; // 结束时间
  dateRange.value = [];
  getOrderList();
};

// 导出订单Excel
const handleExportExcel = async () => {
  // 调用api导出订单列表（设置 responseType: 'blob' 接收二进制文件）
  const res = await paymentApi.exportOrder(
    {
      ...queryForm.value,
      format: exportFormat.value, // 传递导出格式
    },
    `订单列表.${exportFormat.value}`
  );

  console.log("下载", res);
};

// 分页管理
const handleSizeChange = (val) => {
  console.log("分页管理大小改变", val);
};

const handleCurrentChange = (val) => {
  pagination.value.pageNum = val; // 当前页
  getOrderList();
};

// 获取支付主状态标签类型（payStatus 五态）
const getPayStatusType = (status) => {
  const typeMap = {
    1: "warning", // 待支付
    2: "primary", // 已支付
    3: "success", // 已完成
    4: "danger", // 已退款
    5: "info", // 已取消
  };
  return typeMap[status] || "info";
};

// 获取核销状态标签类型（verifyStatus 三态）
const getVerifyStatusType = (status) => {
  const typeMap = {
    1: "warning", // 待核销
    2: "success", // 已核销
    3: "danger", // 已过期
  };
  return typeMap[status] || "info";
};

// 获取订单状态文本
const getOrderStatusText = (status) => {
  const textMap = {
    1: "待支付",
    2: "已支付",
    3: "已完成",
    4: "已退款",
    5: "已取消",
  };
  return textMap[status] || "未知";
};
const getVerifyStatusText = (status) => {
  const textMap = {
    1: "待核销",
    2: "已核销",
    3: "已过期",
  };
  return textMap[status] || "未知";
};

// 用户退款
const handleRefund = async (row) => {
  let id = storage.comUserInfo.id || "";

  ElMessageBox.confirm("确定执行当前退款?", "申请退款", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "",
  })
    .then(async () => {
      let res = await paymentApi.refund({
        orderNumber: row.orderNumber,
        adminId: id,
      });
      if (res.code === 200) {
        ElMessage.success("退款成功");
        getOrderList();
      } else {
        ElMessage.error(res.msg || "退款失败");
      }
    })
    .catch(() => {});
};
</script>

<style lang="scss" scoped>
.form-content {
  display: flex;
  align-items: flex-start;
}

.form-box {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: flex-start;
}
.export-btn {
  margin-right: 10px;
}
</style>
