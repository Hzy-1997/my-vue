<template>
  <div>
    <div class="query-form">
      <div class="title">票务退款订单</div>
      <div class="query-item">
        <el-input placeholder="请输入订单号" v-model="queryForm.orderNo"></el-input>
        <el-input placeholder="请输入手机号" v-model="queryForm.userPhone"></el-input>
        <el-button type="primary" @click="handleQuery">
          <el-icon><Search /></el-icon>查询</el-button
        >
        <el-button @click="handleReset">
          <el-icon><RefreshLeft /></el-icon>重置</el-button
        >
      </div>
    </div>

    <div class="base-table">
      <div class="action"></div>
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
        height="calc(100vh - 255px)"
        :row-style="{ height: '55px' }"
      >
        <el-table-column prop="refundNo" label="退款单号" width="280" align="center" />
        <el-table-column prop="orderNo" label="订单号" width="280" align="center" />
        <el-table-column prop="ticketName" label="票务名称" width="180" align="center" />
        <el-table-column
          prop="refundAmount"
          label="退款金额"
          width="180"
          align="center"
        />
        <el-table-column
          prop="refundReason"
          label="退款操作"
          width="200"
          align="center"
        />
        <el-table-column prop="auditorName" label="操作人" width="100" align="center" />
        <el-table-column prop="" label="退款状态" width="180" align="center">
          <template #default="{ row }">
            <el-tag :type="getOrderStatusType(row.refundStatus)">
              {{ getOrderStatusText(row.refundStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="操作退款时间" align="center" />
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
import Pagination from "../../components/pagination/pagination.vue";
import { paymentApi } from "../../api/index.js";

const queryForm = ref({
  orderNo: "",
  userPhone: "",
});

const tableData = ref([]);

// 分页参数
const pagination = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

// 获取订单列表
const loading = ref(false);

// -------------------   方法   -------------------

onMounted(() => {
  getRefundList();
});

const getRefundList = async () => {
  loading.value = true;
  // 调用api
  let res = await paymentApi.refundList({
    ...queryForm.value,
    ...pagination.value,
  });
  tableData.value = res.data.refundList;
  pagination.value.total = res.data.total;
  loading.value = false;
};

// 查询
const handleQuery = () => {
  getRefundList();
};

// 重置
const handleReset = () => {
  queryForm.value = {
    outTradeNo: "",
    userPhone: "",
  };
};

// 导出Excel
const handleExportExcel = async () => {
  // 调用api
  // let res = await paymentApi.exportRefundList({
  //   ...queryForm.value,
  //   ...pagination.value,
  // });
  // 导出excel
  // exportExcel(res, "票务退款订单.xlsx");
};

// 分页管理
const handleSizeChange = (val) => {
  console.log("什么东西1", val);
};

const handleCurrentChange = (val) => {
  pagination.value.pageNum = val; // 当前页
  getRefundList();
};

const getOrderStatusType = (val) => {
  const typeMap = {
    1: "success",
    2: "danger",
    3: "danger",
  };
  return typeMap[val] || "info";
};

const getOrderStatusText = (val) => {
  const textMap = {
    1: "退款成功",
    2: "退款失败",
    3: "退款中",
  };
  return textMap[val] || "未知状态";
};
</script>

<style lang="scss"></style>
