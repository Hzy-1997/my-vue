<!-- 智能问答管理 -->
<template>
  <div class="dept-manage">
    <!-- 头部 -->
    <div class="query-form">
      <div class="title">智能问答管理</div>
      <div class="query-item">
        <el-input
          style="min-width: 180px"
          v-model="queryForm.question"
          placeholder="请输入问题内容"
        />
        <el-select
          style="min-width: 180px; margin-right: 20px"
          v-model="queryForm.status"
          placeholder="状态"
          clearable
        >
          <el-option label="启用" value="2" />
          <el-option label="禁用" value="1" />
        </el-select>
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="handleCreate">创建问答</el-button>
      </div>

      <el-table
        :data="tableData"
        height="calc(100vh - 255px)"
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column label="问题分类" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="categoryTagMap[row.category] || 'info'">{{
              categoryTextMap[row.category] || row.category
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="question"
          label="问题内容"
          min-width="120"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="answer"
          label="答案"
          min-width="220"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column prop="status" label="状态" width="150" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              active-text="启用"
              inactive-text="禁用"
              active-value="2"
              inactive-value="1"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              plain
              size="small"
              @click="handleEdit(row)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              plain
              size="small"
              @click="handleDelete(row)"
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

    <!-- 创建/编辑 -->
    <el-dialog
      v-model="dialogVisible"
      title="创建/编辑智能问答"
      width="50%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
    >
      <div class="form-box">
        <el-form :model="formData" label-width="100px">
          <el-form-item label="问题分类" prop="category" required>
            <el-select
              v-model="formData.category"
              placeholder="请选择问题分类"
              style="width: 300px"
            >
              <el-option
                v-for="item in categoryOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="问题内容" prop="question" required>
            <el-input
              v-model="formData.question"
              placeholder="请输入问题内容，如：景区门票多少钱？"
            />
          </el-form-item>
          <el-form-item label="答案" prop="answer" required>
            <el-input
              v-model="formData.answer"
              type="textarea"
              :rows="4"
              placeholder="请输入问题答案"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-switch
              v-model="formData.status"
              active-value="2"
              inactive-value="1"
              active-text="启用"
              inactive-text="禁用"
              active-color="#13ce66"
              inactive-color="#ddd"
            />
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
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import Pagination from "../../components/pagination/pagination.vue";
import { serviceSuggestionsApi } from "../../api/index.js";

// 问题分类（对应模型 category 字符串 "1"-"6"，标签可按业务调整）
const categoryOptions = [
  { value: "1", label: "门票票务" },
  { value: "2", label: "交通停车" },
  { value: "3", label: "游览路线" },
  { value: "4", label: "演出活动" },
  { value: "5", label: "住宿餐饮" },
  { value: "6", label: "其他服务" },
];

const categoryTextMap = Object.fromEntries(
  categoryOptions.map((item) => [item.value, item.label]),
);

const categoryTagMap = {
  1: "primary",
  2: "success",
  3: "warning",
  4: "danger",
  5: "info",
  6: "info",
};

let queryForm = ref({
  question: "",
  status: null,
});

let dialogVisible = ref(false);

const formDataInfo = () => ({
  action: "create",
  category: "",
  question: "",
  answer: "",
  // 1-禁用，2-启用
  status: "2",
});

let formData = ref(formDataInfo());

// 分页参数
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

// 当前页数据
let tableData = ref([]);
// 全量数据（列表接口不返回总数，前端本地分页）
let allData = ref([]);

// ------------------------函数方法----------------------

onMounted(() => {
  getList();
});

let handleQuery = () => {
  pagination.value.currentPage = 1;
  getList();
};

let handleReset = () => {
  queryForm.value = { question: "", status: null };
  pagination.value.currentPage = 1;
  getList();
};

let handleCreate = () => {
  formData.value = formDataInfo();
  dialogVisible.value = true;
};

// 获取智能问答列表（接口无总数，一次拉全量后本地分页）
let getList = async () => {
  let data = {
    ...queryForm.value,
    page: 1,
    pageSize: 999999,
  };
  let res = await serviceSuggestionsApi.getQuestionsAnswersList(data);
  if (res.code == 200) {
    allData.value = res.data || [];
    pagination.value.total = allData.value.length;
    sliceList();
  } else {
    ElMessage.error(res.message);
  }
};

// 本地分页切片
const sliceList = () => {
  const { currentPage, pageSize } = pagination.value;
  tableData.value = allData.value.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
};

// 分页
const handleSizeChange = (val) => {
  pagination.value.pageSize = val;
  sliceList();
};
const handleCurrentChange = (val) => {
  pagination.value.currentPage = val;
  sliceList();
};

// 提交表单（创建/更新）
const handleSubmit = async () => {
  if (!formData.value.category) return ElMessage.warning("请选择问题分类");
  if (!formData.value.question) return ElMessage.warning("请输入问题内容");
  if (!formData.value.answer) return ElMessage.warning("请输入答案");

  let res = await serviceSuggestionsApi.questionsAnswersOperation(
    formData.value,
  );
  if (res.code == 200) {
    dialogVisible.value = false;
    ElMessage.success(res.message);
    getList();
  } else {
    ElMessage.error(res.message);
  }
};

// 修改状态（更新接口要求全字段，需带上问题、答案、分类）
const handleStatusChange = (row) => {
  ElMessageBox.confirm("确定要修改状态吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      let data = {
        id: row.id,
        action: "update",
        category: row.category,
        question: row.question,
        answer: row.answer,
        status: row.status,
      };
      let res = await serviceSuggestionsApi.questionsAnswersOperation(data);
      if (res.code == 200) {
        ElMessage.success(res.message);
        getList();
      } else {
        ElMessage.error(res.message);
      }
    })
    .catch(() => {
      row.status = row.status === "1" ? "2" : "1";
    });
};

// 编辑
const handleEdit = (row) => {
  formData.value = {
    ...row,
    action: "update",
  };
  dialogVisible.value = true;
};

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm("此操作将永久删除该问答, 是否继续?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      let data = { id: row.id, action: "delete" };
      let res = await serviceSuggestionsApi.questionsAnswersOperation(data);
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

<style lang="scss" scoped></style>
