<!--  -->
<template>
  <div class="dept-manage">
    <div class="query-form">
      <div class="title">票务核销员管理</div>
      <div class="query-item">
        <el-input v-model="queryForm.title" placeholder="请输入核销员手机号" />
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="handleAdd">创建核销员</el-button>
      </div>
      <!-- 表格展示 -->
      <el-table
        v-loading="loading"
        :data="writeOffList"
        height="calc(100vh - 255px)"
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" align="center"></el-table-column>
        <el-table-column
          prop="name"
          label="核销员姓名"
          width="120"
          align="center"
        ></el-table-column>

        <el-table-column
          prop="phone"
          label="核销员手机号"
          width="220"
          align="center"
        ></el-table-column>

        <el-table-column
          prop="todayWriteOff"
          label="核销次数"
          width="120"
          align="center"
        ></el-table-column>

        <el-table-column
          prop="lastWriteOffTime"
          label="末次核销时间"
          width="220"
          align="center"
        ></el-table-column>

        <el-table-column
          prop="operator"
          label="创建人"
          width="200"
          align="center"
        ></el-table-column>

        <el-table-column
          prop="createdAt"
          label="创建时间"
          width="220"
          align="center"
        ></el-table-column>

        <el-table-column prop="status" label="状态" align="center" width="230">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="2"
              active-text="启用"
              inactive-text="禁用"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>

        <el-table-column fixed="right" label="操作" min-width="120" align="center">
          <template #default="scope">
            <el-button type="primary" link @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-button type="danger" link @click="handleDelete(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <Pagination
      :pagination="pagination"
      @handleSizeChange="handleSizeChange"
      @handleCurrentChange="handleCurrentChange"
    />

    <el-dialog
      title="创建用户"
      v-model="dialogVisible"
      width="50%"
      :showClose="false"
      :closeOnClickModal="false"
      :closeOnPressEscape="false"
      :closeOnHashChange="false"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form :model="writeOffForm" ref="ruleFormRef" :rules="rules" label-width="80px">
        <!-- 姓名 -->
        <el-form-item label="姓名" prop="name">
          <el-input v-model="formData.name" placeholder="请输入核销员姓名" />
        </el-form-item>

        <!-- 手机号 -->
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入核销员手机号" />
        </el-form-item>

        <!-- 账户状态 -->
        <el-form-item label="账户状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :value="1" size="large">正常</el-radio>
            <el-radio :value="2" size="large">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

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
import { ref, reactive, onMounted } from "vue";
import dayjs from "dayjs";
import { ElMessage, ElMessageBox } from "element-plus";
import Pagination from "../../components/pagination/pagination.vue";
import { commonApi, writeOffApi } from "../../api/index.js";

// 查询表单
const queryForm = ref({
  title: "",
});

// 分页
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

const writeOffList = ref([]);

const dialogVisible = ref(false);
const loading = ref(false);

const writeOffForm = () => ({
  name: "",
  phone: "",
  status: 1,
  action: "create",
});

const formData = ref(writeOffForm());

onMounted(() => {
  getWriteOffList();
});

// 获取核销员列表
const getWriteOffList = async () => {
  loading.value = true;
  let res = await writeOffApi.getWriteOffList({
    page: pagination.value.currentPage,
    pageSize: pagination.value.pageSize,
    ...queryForm.value,
  });
  if (res.code == 200) {
    console.log(res.data);
    res.data.rows.forEach((item) => {
      item.lastWriteOffTime = dayjs(item.lastWriteOffTime).format("YYYY-MM-DD HH:mm:ss");
    });
    writeOffList.value = res.data.rows;
    pagination.value.total = res.data.count;
  }
  writeOffList.value = res.data.rows;
  pagination.value.total = res.data.count;
  loading.value = false;
};

//查询
const handleQuery = () => {
  getWriteOffList();
};

// 重置
const handleReset = () => {
  queryForm.value = {
    phone: "",
  };
  getWriteOffList();
};

const handleAdd = () => {
  formData.value = writeOffForm();
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  let res = await writeOffApi.writeOffOperate(formData.value);
  if (res.code == 200) {
    ElMessage.success(res.message);
    getWriteOffList();
    dialogVisible.value = false;
  } else {
    ElMessage.error(res.message);
  }
};

// 修改状态
const handleStatusChange = (row) => {
  ElMessageBox.confirm("确定要修改账户状态吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      console.log("修改状态", row);
      formData.value = { ...row };
      formData.value.action = "update";
      let res = await writeOffApi.writeOffOperate(formData.value);
      if (res.code == 200) {
        ElMessage.success("修改成功");
        getWriteOffList();
      } else {
        ElMessage.error("操作失败");
      }
    })
    .catch(() => {
      if (row.status == 1) {
        row.status = 2;
      } else {
        row.status = 1;
      }
    });
};

// 编辑
const handleEdit = (row) => {
  formData.value = { ...row };
  formData.value.action = "update";
  dialogVisible.value = true;
};

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm("确定要删除吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      formData.value = { ...row };
      formData.value.action = "delete";
      let res = await writeOffApi.writeOffOperate(formData.value);
      if (res.code == 200) {
        ElMessage.success("删除成功");
        getWriteOffList();
      } else {
        ElMessage.error("删除失败");
      }
    })
    .catch(() => {});
};
</script>

<style lang="scss" scoped></style>
