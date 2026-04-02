<template>
  <div>
    <!-- 头部搜索 -->
    <div class="query-form">
      <div class="title">攻略管理</div>
      <div class="query-item">
        <el-input placeholder="请输入攻略名称" v-model="queryForm.title"></el-input>
        <el-button type="primary" @click="handleQuery">
          <el-icon><Search /></el-icon>查询</el-button
        >
        <el-button @click="handleReset">
          <el-icon><RefreshLeft /></el-icon>重置</el-button
        >
      </div>
    </div>
    <!--  创建 展示 -->
    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="handleCreate" v-has="'strategy-create'"
          >创建攻略</el-button
        >
      </div>

      <!-- 表格展示 -->
      <el-table :data="tableData" height="calc(100vh - 255px)" style="width: 100%">
        <el-table-column prop="id" label="id" width="50"></el-table-column>
        <el-table-column prop="title" label="攻略名称"></el-table-column>
        <el-table-column prop="type" label="图片" align="center">
          <template #default="scope">
            <el-image
              :src="imgUrl + scope.row.cover"
              style="width: 110px; height: 80px"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createBy" label="创建人"></el-table-column>
        <el-table-column prop="time" label="创建时间"></el-table-column>
        <el-table-column prop="" label="操作">
          <template #default="scope">
            <el-button
              type="primary"
              link
              @click="handleEdit(scope.row)"
              v-has="'strategy-update'"
              >编辑</el-button
            >
            <el-button
              type="danger"
              link
              @click="handleDelete(scope.row)"
              v-has="'strategy-delete'"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>

    <Pagination
      :pagination="pagination"
      @handleSizeChange="handleSizeChange"
      @handleCurrentChange="handleCurrentChange"
    />

    <!-- 创建 弹窗 -->
    <el-dialog
      title="创建攻略"
      v-model="dialogVisible"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="form-box my-scrollable-div">
        <el-form :model="formData" ref="formRef" label-width="120px">
          <el-form-item label="攻略名称" prop="title">
            <el-input v-model="formData.title" placeholder="请输入攻略名称"></el-input>
          </el-form-item>
          <el-form-item label="封面图" prop="cover">
            <ImageUpload :limit="1" v-model="formData.cover" />
          </el-form-item>
          <el-form-item label="攻略状态" prop="status">
            <el-radio-group v-model="formData.status">
              <el-radio :value="1">正常</el-radio>
              <el-radio :value="2">停用</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="攻略内容" prop="content">
            <Editor
              v-model="formData.content"
              :uploadImageConfig="{
                customUpload: handleImageUpload,
              }"
              :mode="editMode"
              @content-change="handleContentChange"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, nextTick } from "vue";
import ImageUpload from "../../components/ImageUpload/index.vue";
import Pagination from "../../components/pagination/pagination.vue";
import { ElMessage, ElMessageBox } from "element-plus";
import Editor from "../../components//editor/index.vue";
import { projectApi, commonApi } from "../../api/index.js";
import { useStorage } from "../../store/storage.js";

// 搜索
const queryForm = ref({
  title: "",
});
const imgUrl = "https://hezhaoyu.oss-cn-hangzhou.aliyuncs.com"; // 图片地址

const tableData = ref([]);
// 表单实例
const formRef = ref(null);

// 编辑器模式
const editMode = ref("edit");
// 初始图片列表
const initialImages = ref([]);
// 保留的图片列表
const retainedImages = ref([]);

// 表单
const formData = ref({
  title: "",
  status: 1,
  cover: "",
  // createBy: "",
  time: "",
  content: "",
});

// 分页
let pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0,
});

const dialogVisible = ref(false);

// ---------------------------   函   数  --------------------

onMounted(() => {
  getStrategyList();
  getUrlParams();
});

// 获取列表数据
const getStrategyList = async () => {
  try {
    let res = await projectApi.strategyList({
      title: queryForm.value.title,
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
    });
    if (res.code === 200) {
      tableData.value = res.data.rows;
      pagination.value.total = res.data.count;
    }
  } catch (error) {}
};

// 查询
const handleQuery = async () => {
  try {
    let res = await projectApi.strategyList({
      title: queryForm.value.title,
      page,
      pageSize,
    });
    if (res.code === 200) {
      tableData.value = res.data.rows;
      console.log("列表数据", tableData.value);
    }
  } catch (error) {}
};

// 重置
const handleReset = () => {
  queryForm.value.title = "";
  getStrategyList();
};

// 创建
const handleCreate = () => {
  dialogVisible.value = true;
  nextTick(() => {
    formRef.value.resetFields();
    formData.value.action = "create";
  });
};

// 处理编辑器图片上传
const handleImageUpload = async (file, insertFn) => {
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
    alert("上传图片失败，请重试");
  }
};

// 编辑器内容
const handleContentChange = (data) => {
  formData.value.content = data.content;
  retainedImages.value = data.editorImgList;
};

// 提交表单
const handleSubmit = async () => {
  try {
    const storage = useStorage();
    let userInfo = storage.comUserInfo;

    let data = {
      ...formData.value,
      createBy: userInfo.username,
      time: new Date().toLocaleString(),
    }; // 处理图片
    console.log("查看数据", data);
    if (Array.isArray(data.cover) && data.cover.length > 0) {
      console.log("查看数据", data);
      data.cover = data.cover[0].url.split("aliyuncs.com")[1];
    }
    let res = await projectApi.strategyOperate(data);
    console.log(res);
    if (res.code === 200) {
      dialogVisible.value = false;
      ElMessage({
        message: "操作成功",
        type: "success",
      });
      getStrategyList();
    }
  } catch (error) {
    ElMessage({
      message: "操作失败",
      type: "error",
    });
  }
};

// 编辑
const handleEdit = (row) => {
  dialogVisible.value = true;
  nextTick(() => {
    for (let i in formData.value) {
      formData.value[i] = row[i];
    }
    formData.value.id = row.id;
    formData.value.action = "update";
  });
};

// 删除
const handleDelete = async (row) => {
  try {
    let res = await projectApi.strategyOperate({
      ...row,
      action: "delete",
    });
    console.log(res);
    if (res.code == 200) {
      ElMessage({
        message: "操作成功",
        type: "success",
      });
      getStrategyList();
    }
  } catch (error) {
    console.log(error);
    ElMessage({
      message: "操作失败",
      type: "error",
    });
  }
};

const getUrlParams = () => {
  // 获取当前URL的查询参数
  const urlParams = new URLSearchParams(window.location.search);

  // 获取支付宝返回的参数
  const outTradeNo = urlParams.get("out_trade_no");
  const tradeNo = urlParams.get("trade_no");
  const totalAmount = urlParams.get("total_amount");
  const timestamp = urlParams.get("timestamp");

  console.log("支付宝返回参数:", {
    outTradeNo,
    tradeNo,
    totalAmount,
    timestamp,
  });
};

// 分页管理
const handleSizeChange = (val) => {
  console.log("什么东西1", val);
};

const handleCurrentChange = (val) => {
  console.log("什么东西2", val);
  pagination.value.page = val; // 当前页
  getStrategyList(); // 重新获取数据
};
</script>

<style lang="scss" scoped></style>
