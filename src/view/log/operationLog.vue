<template>
  <div class="dept-manage">
    <div class="query-form">
      <div class="title">酒店管理</div>
      <div class="query-item">
        <el-input v-model="queryForm.title" placeholder="请输入酒店名称" />
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <div class="base-table">
      <div class="action"></div>
    </div>

    <!-- 表格展示 -->
    <el-table
      :data="tableData"
      height="calc(100vh - 285px)"
      style="width: 100%"
    >
      <el-table-column
        prop="id"
        label="操作日志ID"
        align="center"
      ></el-table-column>

      <el-table-column
        prop="title"
        label="功能名称"
        align="center"
      ></el-table-column>

      <el-table-column
        prop="businessType"
        label="操作类型"
        align="center"
      ></el-table-column>

      <el-table-column
        prop="requestMethod"
        label="请求方式"
        align="center"
      ></el-table-column>

      <el-table-column
        prop="operatorName"
        label="操作人员姓名"
        align="center"
      ></el-table-column>

      <el-table-column
        prop="operatorType"
        label="操作人员类型"
        align="center"
      ></el-table-column>

      <el-table-column
        prop="operIp"
        label="操作IP地址"
        align="center"
      ></el-table-column>
      <el-table-column prop="status" label="操作状态" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.status === 0 ? 'success' : 'danger'">
            {{ scope.row.status === 0 ? "成功" : "失败" }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        prop="createdAt"
        label="操作时间"
        align="center"
        width="230"
      ></el-table-column>

      <el-table-column prop="costTime" label="耗时" align="center">
        <template #default="scope"> {{ scope.row.costTime }} ms </template>
      </el-table-column>

      <el-table-column
        fixed="right"
        label="操作"
        min-width="120"
        align="center"
      >
        <template #default="scope">
          <el-button
            type="primary"
            size="small"
            :icon="Search"
            @click="editClick(scope.row)"
          >
            查看详细
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="table-pagination">
      <Pagination
        :pagination="pagination"
        @handleSizeChange="handleSizeChange"
        @handleCurrentChange="handleCurrentChange"
      />
    </div>

    <el-dialog
      title="操作日志详情"
      v-model="facilityDialogVisible"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :draggable="true"
      width="900px"
    >
      <div class="form-box">
        <!-- 头部信息区域：模块与请求地址 -->
        <div class="info-row header-row">
          <div class="info-item">
            <span class="info-label">操作日志模块：</span>
            <span class="info-value"
              >{{ detailData.title }}/{{ detailData.businessType }}</span
            >
          </div>
          <div class="info-item">
            <span class="info-label">操作请求地址：</span>
            <span class="info-value">{{ detailData.operUrl }}</span>
          </div>
        </div>

        <!-- 操作人员信息区域：三列布局 -->
        <div class="info-row">
          <div class="info-item">
            <span class="info-label">操作人员姓名：</span>
            <span class="info-value">{{ detailData.operatorName }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">操作人员类型：</span>
            <span class="info-value">{{ detailData.operatorType }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">操作IP地址：</span>
            <span class="info-value">{{ detailData.operIp }}</span>
          </div>
        </div>

        <!-- 请求方式 -->
        <div class="info-row">
          <div class="info-item full-width">
            <span class="info-label">请求方式：</span>
            <span class="info-value highlight">{{
              detailData.requestMethod
            }}</span>
          </div>
        </div>

        <!-- 请求参数（可折叠或带滚动条） -->
        <div class="info-row">
          <div class="info-item full-width">
            <span class="info-label">请求参数：</span>
            <pre class="info-json">{{ formatJson(detailData.operParam) }}</pre>
          </div>
        </div>

        <!-- 返回结果（可折叠或带滚动条） -->
        <div class="info-row">
          <div class="info-item full-width">
            <span class="info-label">返回结果：</span>
            <pre class="info-json">{{ formatJson(detailData.jsonResult) }}</pre>
          </div>
        </div>

        <!-- 状态与时间信息区域：三列布局 -->
        <div class="info-row">
          <div class="info-item">
            <span class="info-label">操作状态：</span>
            <span
              class="info-value"
              :class="
                detailData.status === 0 ? 'status-success' : 'status-failed'
              "
            >
              {{ detailData.status === 0 ? "成功" : "失败" }}
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">耗时（毫秒）：</span>
            <span class="info-value">{{ detailData.costTime }} ms</span>
          </div>
          <div class="info-item">
            <span class="info-label">操作时间：</span>
            <span class="info-value">{{ detailData.createdAt }}</span>
          </div>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="facilityDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { Delete, Edit, Search, Share, Upload } from "@element-plus/icons-vue";

import Pagination from "../../components/pagination/pagination.vue";
import { logApi } from "../../api/index.js";

const queryForm = ref({
  title: "", // 操作模块
  businessType: "", // 业务类型
  operatorName: "", // 操作人姓名
  status: "", // 操作状态
  startTime: "", // 开始时间
  endTime: "", // 结束时间
});

const tableData = ref([]);

// 分页
let pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0,
});

// 详情
const facilityDialogVisible = ref(false);
const detailData = ref({});

// -------------------------------------  函数方法  -------------------------------------

// 组件挂载时获取日志列表
onMounted(() => {
  getLogList();
});

//获取日志列表
const getLogList = async () => {
  let res = await logApi.getOperationLogList({
    page: pagination.value.page,
    pageSize: pagination.value.pageSize,
    ...queryForm.value,
  });
  console.log("获取日志列表", res);
  if (res.code === 200) {
    tableData.value = res.data.list;
    pagination.value.total = res.data.total;
  }
};

//查询
const handleQuery = () => {
  getLogList();
};

//重置
const handleReset = () => {
  queryForm.value = {
    title: "",
  };
  getLogList();
};

// 查看详情
const editClick = (row) => {
  console.log("查看详情", row);
  detailData.value = row;
  facilityDialogVisible.value = true;
};

const formatJson = (str) => {
  if (!str) return "无";
  try {
    // 尝试解析并格式化 JSON
    const obj = typeof str === "string" ? JSON.parse(str) : str;
    return JSON.stringify(obj, null, 2);
  } catch (e) {
    // 如果不是 JSON，直接返回原字符串
    return str;
  }
};

// 分页管理
const handleSizeChange = (val) => {
  console.log("什么东西1", val);
};

const handleCurrentChange = (val) => {
  console.log("什么东西2", val);
  pagination.value.page = val; // 当前页
  getLogList(); // 重新获取数据
};
</script>

<style lang="scss" scoped>
.form-box {
  background: #fff;
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.info-row {
  display: flex;
 
  margin-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
  /* padding-bottom: 16px; */
}

.info-row:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.info-item {
  /* flex: 1; */
  min-width: 200px;
  margin-right: 24px;
  line-height: 1.6;
}

.info-item.full-width {
  flex: 100%;
  margin-right: 0;
}

.info-label {
  font-weight: 600;
  color: #5a6874;
  font-size: 14px;
  letter-spacing: 0.3px;
  display: inline-block;
  min-width: 110px;
}

.info-value {
  color: #1f2f3d;
  font-size: 14px;
  word-break: break-all;
  background: #fafbfc;
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
  max-width: 100%;
}

.highlight .info-value {
  background: #ecf5ff;
  color: #409eff;
  font-weight: 500;
}

.status-success {
  color: #67c23a;
  background: #f0f9eb;
  padding: 2px 12px;
  border-radius: 20px;
  font-weight: 500;
}

.status-failed {
  color: #f56c6c;
  background: #fef0f0;
  padding: 2px 12px;
  border-radius: 20px;
  font-weight: 500;
}

.info-json {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 12px 16px;
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 13px;
  line-height: 1.5;
  color: #2c3e50;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 300px;
  margin: 8px 0 0 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  margin-top: 8px;
}
</style>
