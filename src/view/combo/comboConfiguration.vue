<!--
 * @描述: 
 * @版本: 
 * @作者: 
 * @日期: ${year}-${month}-${day}
 * @最后编辑者: sueRimn
 * @最后编辑时间: ${year}-${month}-${day} ${hour}:${minute}:${second}
-->
<template>
  <div class="dept-manage">
    <!-- 头部 -->
    <div class="query-form">
      <div class="title">套餐管理</div>
      <div class="query-item">
        <el-input v-model="queryForm.name" placeholder="请输入套餐名称" />
        <el-button type="primary" @click="queryCombo">查询</el-button>
        <el-button @click="resetForm">重置</el-button>
      </div>
    </div>  

    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="createCombo">创建套餐</el-button>
      </div>

      <el-table :data="tableData" height="calc(100vh - 255px)" style="width: 100%">
        <el-table-column prop="id" label="ID" width="50" align="center" />
        <el-table-column prop="name" label="套餐名称" width="220" />
        <el-table-column prop="coverImage" label="图片" align="center">
          <template #default="scope">
            <el-image
              :src="imgUrl + scope.row.coverImage"
              style="width: 100px; height: 70px"
            />
          </template>
        </el-table-column>
        <el-table-column prop="endDate" label="套餐类型" width="150" align="center">
          <template #default="{ row }">
            <el-tag type="primary" v-if="row.type === 1">普通套餐</el-tag>
            <el-tag type="success" v-else-if="row.type === 2">会员套餐</el-tag>
            <el-tag type="warning" v-else-if="row.type === 3">限时套餐</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="marketPrice" label="市场价" width="100" align="center" />
        <!-- <el-table-column prop="sortOrder" label="套餐库存" width="100" align="center" /> -->
        <el-table-column prop="status" label="套餐状态" width="200" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              active-text="启用"
              inactive-text="禁用"
              :active-value="1"
              :inactive-value="2"
              @change="handleTicketingStatus(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="startDate" label="排序" width="200" align="center">
          <template #default="{ row }">
            <el-input-number
              v-model="row.sortOrder"
              :min="0"
              :max="99999"
              @change="handleTicketingSort(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="startDate" label="开始时间" align="center" />
        <el-table-column prop="endDate" label="结束时间" align="center" />
        <el-table-column prop="createdAt" label="创建时间" width="220" align="center" />
        <el-table-column prop="" fixed="right" label="操作" width="220" align="center">
          <template #default="{ row }">
            <el-button type="primary" plain size="small" @click="handleEdit(row)"
              >编辑</el-button
            >
            <el-button type="danger" plain size="small" @click="handleDelete(row)"
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

    <!-- 创建编辑 -->
    <el-dialog
      v-model="dialogVisible"
      title="创建/编辑套餐"
      width="50%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
    >
      <div class="form-box">
        <el-form :model="formData" label-width="100px">
          <el-form-item label="套餐类型" prop="type">
            <el-select v-model="formData.type" placeholder="请选择套餐类型">
              <el-option
                v-for="item in comboType"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="套餐名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入套餐名称" />
          </el-form-item>
          <el-form-item label="宣传语" prop="subTitle">
            <el-input v-model="formData.subTitle" placeholder="请输入宣传语" />
          </el-form-item>
          <el-form-item label="套餐描述" prop="description">
            <div class="flex gap-2">
              <el-tag
                v-for="tag in formData.tags"
                :key="tag"
                closable
                :disable-transitions="false"
                @close="handleClose(tag)"
                style="margin-right: 10px"
              >
                {{ tag }}
              </el-tag>
              <el-input
                v-if="inputVisible"
                ref="InputRef"
                v-model="inputValue"
                class="w-20"
                size="small"
                @keyup.enter="handleInputConfirm"
                @blur="handleInputConfirm"
              />
              <el-button v-else class="button-new-tag" size="small" @click="showInput">
                + 添加标签
              </el-button>
            </div>
          </el-form-item>

          <el-form-item label="套餐封面图" prop="coverImage">
            <ImageUpload :limit="1" v-model="formData.coverImage"></ImageUpload>
          </el-form-item>
          <el-form-item label="套餐轮播图" prop="bannerImages">
            <ImageUpload :limit="5" v-model="formData.bannerImages"></ImageUpload>
          </el-form-item>

          <el-form-item label="原价" prop="marketPrice">
            <el-input v-model="formData.marketPrice" placeholder="请输入原价"></el-input>
          </el-form-item>
          <!-- <el-form-item label="可售数量" prop="soldStock">
            <el-input
              v-model="formData.soldStock"
              placeholder="请输入可售数量"
            ></el-input>
          </el-form-item> -->
          <el-form-item label="套餐权益描述" prop="includes">
            <el-input
              v-model="formData.includes"
              placeholder="请输入套餐权益描述"
              type="textarea"
              :rows="4"
              class="my-scrollable-div"
            ></el-input>
          </el-form-item>

          <el-form-item label="退订规则说明" prop="refundRule">
            <el-input
              v-model="formData.refundRule"
              placeholder="请输入退订规则说明"
              type="textarea"
              :rows="4"
            ></el-input>
          </el-form-item>

          <el-form-item label="使用规则说明" prop="useRule">
            <el-input
              v-model="formData.useRule"
              placeholder="请输入使用规则说明"
              type="textarea"
              :rows="4"
            ></el-input>
          </el-form-item>

          <el-form-item label="排序" prop="sortOrder">
            <el-input-number
              :min="0"
              :max="9999"
              v-model="formData.sortOrder"
              placeholder="请输入排序"
              style="width: 300px"
            ></el-input-number>
          </el-form-item>

          <el-form-item label="状态" prop="status">
            <el-switch
              v-model="formData.status"
              :active-value="1"
              :inactive-value="2"
              active-text="正常"
              inactive-text="停用"
              active-color="#13ce66"
              inactive-color="#ddd"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from "vue";
import dayjs from "dayjs";
import { ElMessage, ElMessageBox } from "element-plus";
import ImageUpload from "../../components/ImageUpload/index.vue"; // 图片组件使用
import Pagination from "../../components/pagination/pagination.vue"; // 分页组件使用
import { imageEdit } from "../../utils/utils.js"; // 图片编辑
import { comboApi } from "../../api/index.js";

const imgUrl = import.meta.env.VITE_IMG_URL;

let queryForm = ref({
  title: "",
});

let dialogVisible = ref(false);

let formDataInfo = () => ({
  action: "create",
  name: "三亚豪华海景双人游",
  subTitle: "含2晚五星酒店+潜水体验+海鲜自助",
  type: 1, // 1: 普通套餐 2: 限时抢购
  category: "情侣度假",
  coverImage: [],
  bannerImages: [],
  marketPrice: 5999.0,
  startDate: "2026-06-01",
  endDate: "2026-12-31",
  tags: ["享,限时优惠", "享,双人出行", "住,五星酒店"],
  includes:
    "1. 五星级海景房2晚\n2. 每日双人自助早餐\n3. 专业潜水教练一对一指导（2小时）\n4. 机场接送服务\n5. 旅行意外险",
  refundRule:
    "1. 入住前7天可全额退款\n2. 入住前3-7天退还50%\n3. 入住前3天内不可退款\n4. 如遇不可抗力因素可协商处理",
  useRule:
    "1. 需提前3天预约\n2. 有效期内任意日期可使用\n3. 节假日需补差价300元/晚\n4. 每份套餐限2人使用",
  sortOrder: 100, // '排序：值越小越靠前'
  status: 2, // '状态：1=正常 2=停用'
});

let formData = ref(formDataInfo());

const inputValue = ref("");
const inputVisible = ref(false);
const InputRef = ref();

// '套餐类型：1=酒店套餐 2=游玩套餐 3=赛事套餐 4=自定义'
let comboType = ref([
  { label: "酒店套餐", value: 1 },
  { label: "游玩套餐", value: 2 },
  { label: "赛事套餐", value: 3 },
  { label: "其他套餐", value: 4 },
]);

// 分页参数
const pagination = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

// 数据列表
let tableData = ref();

// ------------------------函数方法----------------------

onMounted(() => {
  getComboList();
});

let queryCombo = () => {
  console.log("查询套餐", queryForm.value);
  getComboList();
};

let resetForm = () => {
  queryForm.value = {
    name: "",
    type: "",
  };
  getComboList();
};

let createCombo = () => {
  formData.value = formDataInfo();
  dialogVisible.value = true;
};

// 获取套餐列表
let getComboList = async () => {
  let data = {
    ...queryForm.value,
    ...pagination.value,
  };
  let res = await comboApi.getPrimaryComboList(data);
  console.log("返回什么", res);
  if (res.code == 200) {
    tableData.value = res.data.list;
    pagination.value.total = res.data.total;
  } else {
    ElMessage.error(res.message);
  }
};

// 分页管理
const handleSizeChange = (val) => {
  console.log("", val);
};
const handleCurrentChange = (val) => {
  pagination.value.pageNum = val; // 当前页
  getComboList();
};

// 标签函数三个：删除、显示、确认输入👇
const handleClose = (tag) => {
  formData.value.tags.splice(formData.value.tags.indexOf(tag), 1);
};
const showInput = () => {
  inputVisible.value = true;
  nextTick(() => {
    InputRef.value.input.focus();
  });
};
const handleInputConfirm = () => {
  if (inputValue.value) {
    formData.value.tags.push(inputValue.value);
  }
  inputVisible.value = false;
  inputValue.value = "";
};

// 提交表单
const submitForm = async () => {
  console.log("提交表单", formData.value);

  if (Array.isArray(formData.value.coverImage) && formData.value.coverImage.length > 0) {
    formData.value.coverImage = imageEdit(formData.value.coverImage);
  }
  if (
    Array.isArray(formData.value.bannerImages) &&
    formData.value.bannerImages.length > 0
  ) {
    formData.value.bannerImages = imageEdit(formData.value.bannerImages);
  }

  let data = {
    ...formData.value,
    tags: formData.value.tags.join(","),
    startDate: dayjs(formData.value.startDate).format("YYYY-MM-DD"),
    endDate: dayjs(formData.value.endDate).format("YYYY-MM-DD"),
  };
  console.log("返回数据", data);
  let res = await comboApi.operateCombo(data);
  if (res.code == 200) {
    dialogVisible.value = false;
    ElMessage.success(res.message);
    getComboList();
  } else {
    ElMessage.error(res.message);
  }
};

// 套餐状态
const handleTicketingStatus = (row) => {
  ElMessageBox.confirm("确定要修改套餐状态吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      let { id, status } = row;
      let data = {
        id,
        status,
        action: "update",
      };
      let res = await comboApi.operateCombo(data);
      if (res.code == 200) {
        ElMessage({
          message: res.message,
          type: "success",
        });
        getComboList();
      } else {
        ElMessage({
          message: res.message,
          type: "error",
        });
      }
    })
    .catch(() => {
      if (row.isDown == 1) {
        row.status = 2;
      } else {
        row.status = 1;
      }
    });
};

// 套餐排序
const handleTicketingSort = async (row) => {
  console.log("套餐排序", row);
  let data = {
    ...row,
    action: "update",
  };
  let res = await comboApi.operateCombo(data);
  if (res.code == 200) {
    getComboList();
  } else {
    ElMessage.error(res.message);
  }
};

// 编辑套餐
const handleEdit = (row) => {
  console.log("编辑套餐", row);
  formData.value = {
    ...row,
    tags: Array.isArray(row.tags) ? row.tags : row.tags.split(","),
    action: "update",
  };
  dialogVisible.value = true;
};

// 删除
const handleDelete = async (row) => {
  console.log("删除", row);
  ElMessageBox.confirm("此操作将永久删除该套餐, 是否继续?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      let data = {
        ...row,
        action: "delete",
      };
      let res = await comboApi.operateCombo(data);
      if (res.code == 200) {
        ElMessage.success(res.message);
        getComboList();
      } else {
        ElMessage.error(res.message);
      }
    })
    .catch(() => {
      ElMessage({
        message: "已取消删除",
        type: "info",
      });
    });
};
</script>

<style lang="scss" scoped></style>
