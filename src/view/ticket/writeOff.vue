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
        :data="tableData"
        height="calc(100vh - 255px)"
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
      <el-form
        :model="writeOffForm"
        ref="ruleFormRef"
        :rules="rules"
        label-width="80px"
      >
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
import RichTextEditor from "../service/strategy.vue";
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

const writeOffForm = () => ({
  name: "",
  phone: "",
  status: 1,
  action: "create",
});

const formData = ref(writeOffForm());

const tableData = ref([]);

// 编辑器模式
const editMode = ref("edit");
// 编辑器内容
const editorContent = ref("nihao");
// 初始图片列表
const initialImages = ref([]);
// 保留的图片列表
const retainedImages = ref([]);

// 处理图片上传
const handleImageUpload = async (file, insertFn) => {
  console.log("上传图片:", file);
  const formData = new FormData();
  formData.append("file", file); // file 是用户选择的图片文件
  try {
    let res = await commonApi.uploadImg(formData);
    if (res.code !== 200) {
      alert("上传失败: " + res.message);
      return;
    }
    const imgUrl = res.data.file.url;
    // 调用 insertFn 将图片插入到编辑器
    initialImages.value.push(imgUrl);
    insertFn(imgUrl, "");
  } catch (error) {
    console.error("上传图片时出错:", error);
    alert("上传图片失败，请重试");
  }
};

const handleContentChange = (data) => {
  console.log("编辑器内容:", data.content);
  console.log("当前图片:", data.editorImgList);
  editorContent.value = data.content;
  retainedImages.value = data.editorImgList;
};

// 处理提交
const handleSave = (data) => {
  console.log("编辑器内容:", data.content);
  console.log("当前图片:", data.editorImgList);
};

onMounted(() => {
  getWriteOffList();
});

// 获取核销员列表
const getWriteOffList = async () => {
  let res = await writeOffApi.getWriteOffList({
    page: pagination.value.currentPage,
    pageSize: pagination.value.pageSize,
  });
  if (res.code == 200) {
    console.log(res.data);
    writeOffList.value = res.data.rows;
    pagination.value.total = res.data.count;
  }
};

//查询
const handleQuery = () => {
  console.log("查询", queryForm.value);
};

// 重置
const handleReset = () => {
  queryForm.value = {
    phone: "",
  };
};

const handleAdd = () => {
  formData.value = writeOffForm();
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  let res = await writeOffApi.writeOffOperate(formData.value);
  console.log("主管那台", res);
  getWriteOffList();
  dialogVisible.value = false;
};
</script>

<style lang="scss" scoped></style>
