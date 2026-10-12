<!-- 景区公交商品管理 -->
<template>
  <div class="dept-manage">
    <!-- 头部 -->
    <div class="query-form">
      <div class="title">景区公交管理</div>
      <div class="query-item">
        <el-input
          style="width: 200px"
          v-model="queryForm.title"
          placeholder="请输入班次名称"
        />
        <el-select
          style="width: 140px; margin-right: 30px"
          v-model="queryForm.status"
          placeholder="状态"
          clearable
        >
          <el-option label="上线" :value="1" />
          <el-option label="下线" :value="2" />
        </el-select>
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="handleCreate">创建班次</el-button>
      </div>

      <el-table :data="tableData" height="calc(100vh - 255px)" style="width: 100%">
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column prop="title" label="班次名称" width="160" align="center" />
        <el-table-column prop="image" label="封面图" width="130" align="center">
          <template #default="scope">
            <el-image
              v-if="scope.row.image"
              :src="imgUrl + scope.row.image"
              style="width: 90px; height: 60px"
            />
          </template>
        </el-table-column>
        <!-- <el-table-column label="票种" width="80" align="center">
              <template #default="{ row }">
                {{ ticketTypeMap[row.ticketType] || row.ticketType }}
              </template>
            </el-table-column> -->
        <el-table-column prop="timeSlot" label="时段" width="120" align="center" />
        <el-table-column prop="price" label="售价(￥)" width="90" align="center" />
        <el-table-column
          prop="originalPrice"
          label="原价(￥)"
          width="90"
          align="center"
        />
        <el-table-column prop="totalStock" label="总放票量" width="90" align="center" />
        <el-table-column label="售卖区间" width="200" align="center">
          <template #default="{ row }">
            {{ row.startDate }} ~ {{ row.endDate }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="170" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              active-text="上线"
              inactive-text="下线"
              :active-value="1"
              :inactive-value="2"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="180" align="center">
          <template #default="{ row }">
            <el-input-number
              v-model="row.sort"
              :min="0"
              :max="99999"
              @change="handleSortChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="170" align="center" />
        <el-table-column label="操作" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="success"
              plain
              size="small"
              :disabled="row.status != 1"
              @click="handleBuy(row)"
              >购票</el-button
            >
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

    <!-- 创建/编辑 -->
    <el-dialog
      v-model="dialogVisible"
      title="创建/编辑班次"
      width="50%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
    >
      <div class="form-box">
        <el-form :model="formData" label-width="110px">
          <el-form-item label="班次名称" prop="title">
            <el-input v-model="formData.title" placeholder="请输入班次名称" />
          </el-form-item>
          <el-form-item label="封面图" prop="image">
            <ImageUpload :limit="1" v-model="formData.image"></ImageUpload>
          </el-form-item>
          <el-form-item label="开始售卖日期" prop="startDate">
            <el-date-picker
              v-model="formData.startDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="请选择开始售卖日期"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="结束售卖日期" prop="endDate">
            <el-date-picker
              v-model="formData.endDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="请选择结束售卖日期"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="票种" prop="ticketType">
            <el-select
              v-model="formData.ticketType"
              placeholder="请选择票种"
              style="width: 100%"
            >
              <el-option label="成人" value="1" />
              <el-option label="儿童" value="2" />
              <el-option label="学生" value="3" />
              <el-option label="其他" value="4" />
            </el-select>
          </el-form-item>
          <el-form-item label="时段" prop="timeSlot">
            <el-input v-model="formData.timeSlot" placeholder="如：08:00-12:00" />
          </el-form-item>
          <el-form-item label="售价(￥)" prop="price">
            <el-input-number
              :min="0"
              :precision="2"
              v-model="formData.price"
              placeholder="请输入售价"
              style="width: 300px"
            />
          </el-form-item>
          <el-form-item label="原价(￥)" prop="originalPrice">
            <el-input-number
              :min="0"
              :precision="2"
              v-model="formData.originalPrice"
              placeholder="请输入原价（划线价）"
              style="width: 300px"
            />
          </el-form-item>
          <el-form-item label="总放票量" prop="totalStock">
            <el-input-number
              :min="1"
              :max="999999"
              v-model="formData.totalStock"
              placeholder="请输入总放票量"
              style="width: 300px"
            />
          </el-form-item>
          <el-form-item label="详细介绍" prop="description">
            <RichTextEditor
              v-model="formData.description"
              :uploadImageConfig="{
                customUpload: handleImageUpload,
              }"
              :mode="editMode"
              @content-change="handleContentChange"
            />
          </el-form-item>
          <el-form-item label="排序" prop="sort">
            <el-input-number
              :min="0"
              :max="9999"
              v-model="formData.sort"
              placeholder="数值越小越靠前"
              style="width: 300px"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-switch
              v-model="formData.status"
              :active-value="1"
              :inactive-value="2"
              active-text="上线"
              inactive-text="下线"
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

    <!-- 购票下单（一单多票、一票一码） -->
    <el-dialog
      v-model="buyVisible"
      title="购票下单"
      width="45%"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div class="form-box">
        <el-descriptions :column="2" border style="margin-bottom: 20px">
          <el-descriptions-item label="班次名称" :span="2">{{
            buyRow.title
          }}</el-descriptions-item>
          <el-descriptions-item label="票种">{{
            ticketTypeMap[buyRow.ticketType] || buyRow.ticketType
          }}</el-descriptions-item>
          <el-descriptions-item label="时段">{{
            buyRow.timeSlot || "-"
          }}</el-descriptions-item>
          <el-descriptions-item label="售卖区间">{{
            `${buyRow.startDate} ~ ${buyRow.endDate}`
          }}</el-descriptions-item>
          <el-descriptions-item label="单价(￥)">{{
            Number(buyRow.price).toFixed(2)
          }}</el-descriptions-item>
        </el-descriptions>

        <el-form :model="buyForm" label-width="110px">
          <el-form-item label="用户ID" prop="userId">
            <el-input-number
              :min="1"
              :max="999999999"
              v-model="buyForm.userId"
              placeholder="请输入用户ID"
              style="width: 300px"
            />
          </el-form-item>
          <el-form-item label="联系电话" prop="userPhone">
            <el-input
              v-model="buyForm.userPhone"
              placeholder="请输入联系电话（传输时自动加密）"
              maxlength="11"
            />
          </el-form-item>
          <el-form-item label="联系人姓名" prop="contactName">
            <el-input v-model="buyForm.contactName" placeholder="选填" />
          </el-form-item>
          <el-form-item label="乘车日期" prop="rideDate">
            <el-date-picker
              v-model="buyForm.rideDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="须在售卖区间内"
              :disabled-date="disabledRideDate"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="购票数量" prop="quantity">
            <el-input-number
              :min="1"
              :max="10"
              v-model="buyForm.quantity"
              placeholder="1~10张"
              style="width: 300px"
            />
          </el-form-item>
          <el-form-item label="合计(￥)">
            <span style="color: #f56c6c; font-size: 18px; font-weight: bold">
              {{ totalAmount }}
            </span>
            <span style="margin-left: 10px; color: #999; font-size: 12px">
              每张票独立核销码，可单独核销/退票
            </span>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="buyVisible = false">取消</el-button>
          <el-button type="primary" :loading="buyLoading" @click="handleBuySubmit"
            >下单</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import ImageUpload from "../../components/ImageUpload/index.vue";
import RichTextEditor from "../../components/editor/index.vue";
import Pagination from "../../components/pagination/pagination.vue";
import { imageEdit, cryptoUtil } from "../../utils/utils.js";
import { appointmentApi, commonApi } from "../../api/index.js";

const imgUrl = import.meta.env.VITE_IMG_URL;

// 票种映射（与模型一致：1-成人 2-儿童 3-学生 4-其他）
const ticketTypeMap = { 1: "成人", 2: "儿童", 3: "学生", 4: "其他" };

let queryForm = ref({
  title: "",
  status: null,
});

let dialogVisible = ref(false);

const formDataInfo = () => ({
  action: "create",
  title: "",
  image: [],
  startDate: "",
  endDate: "",
  ticketType: "1",
  timeSlot: "",
  description: "",
  price: 0,
  originalPrice: 0,
  totalStock: 1,
  sort: 0,
  status: 1,
});

let formData = ref(formDataInfo());

// 富文本编辑器
const editMode = ref("edit");
const initialImages = ref([]); // 本次编辑上传的图片
const retainedImages = ref([]); // 编辑器中当前保留的图片

// 分页参数
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

// 数据列表
let tableData = ref([]);

// 购票下单
let buyVisible = ref(false);
let buyLoading = ref(false);
let buyRow = ref({});
const buyFormInfo = () => ({
  userId: undefined,
  userPhone: "",
  contactName: "",
  rideDate: "",
  quantity: 1,
});
let buyForm = ref(buyFormInfo());

// 合计金额 = 单价 × 数量
const totalAmount = computed(() => {
  return (Number(buyRow.value.price || 0) * (buyForm.value.quantity || 0)).toFixed(2);
});

// ------------------------函数方法----------------------

onMounted(() => {
  getList();
});

let handleQuery = () => {
  pagination.value.currentPage = 1;
  getList();
};

let handleReset = () => {
  queryForm.value = { title: "", status: null };
  pagination.value.currentPage = 1;
  getList();
};

let handleCreate = () => {
  formData.value = formDataInfo();
  initialImages.value = [];
  retainedImages.value = [];
  dialogVisible.value = true;
};

// 班次列表
let getList = async () => {
  let data = {
    ...queryForm.value,
    page: pagination.value.currentPage,
    pageSize: pagination.value.pageSize,
  };
  let res = await appointmentApi.getScenicBusList(data);
  if (res.code == 200) {
    tableData.value = res.data.scenicBusList;
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

// 提交表单
const handleSubmit = async () => {
  if (!formData.value.title) return ElMessage.warning("请输入班次名称");
  if (Array.isArray(formData.value.image) && formData.value.image.length == 0)
    return ElMessage.warning("请上传封面图");
  if (!formData.value.startDate || !formData.value.endDate)
    return ElMessage.warning("请选择售卖起止日期");
  if (formData.value.startDate > formData.value.endDate)
    return ElMessage.warning("开始售卖日期不能晚于结束售卖日期");
  if (!formData.value.ticketType) return ElMessage.warning("请选择票种");
  if (!formData.value.price && formData.value.price != 0)
    return ElMessage.warning("请输入售价");
  if (!formData.value.totalStock || formData.value.totalStock < 1)
    return ElMessage.warning("总放票量须大于0");
  if (!formData.value.description) return ElMessage.warning("请输入详细介绍");

  // 编辑器图片处理：清理编辑过程中删除的图片
  if (Array.isArray(initialImages.value) && initialImages.value.length > 0) {
    let deleteImageList = initialImages.value.filter(
      (item) => !retainedImages.value.some((img) => item === img.src)
    );
    if (deleteImageList.length > 0) {
      deleteImageList = deleteImageList
        .map((url) => {
          let match = url.match(/\/ceshiUp\/\d+\/\d+\/\d+\/[a-f0-9]+\.[a-z0-9]+/i);
          return match ? match[0].slice(1) : "";
        })
        .filter(Boolean);
      await commonApi.deleteImg({ deleteImageList });
    }
  }

  let image = imageEdit(formData.value.image);
  let data = { ...formData.value, image };

  let res = await appointmentApi.scenicBusOperation(data);
  if (res.code == 200) {
    dialogVisible.value = false;
    ElMessage.success(res.message);
    getList();
  } else {
    ElMessage.error(res.message);
  }
};

// 修改状态
const handleStatusChange = (row) => {
  ElMessageBox.confirm("确定要修改状态吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      let data = { id: row.id, status: row.status, action: "update" };
      let res = await appointmentApi.scenicBusOperation(data);
      if (res.code == 200) {
        ElMessage.success(res.message);
        getList();
      } else {
        ElMessage.error(res.message);
      }
    })
    .catch(() => {
      row.status = row.status === 1 ? 2 : 1;
    });
};

// 修改排序
const handleSortChange = async (row) => {
  let data = { id: row.id, sort: row.sort, action: "update" };
  let res = await appointmentApi.scenicBusOperation(data);
  if (res.code != 200) {
    ElMessage.error(res.message);
  }
};

// 编辑（取详情最新数据）
const handleEdit = async (row) => {
  let res = await appointmentApi.getScenicBusDetail({ id: row.id });
  if (res.code != 200) return ElMessage.error(res.message);
  let detail = res.data;
  formData.value = {
    ...detail,
    image: detail.image ? [{ url: imgUrl + detail.image }] : [],
    action: "update",
  };
  initialImages.value = [];
  retainedImages.value = [];
  dialogVisible.value = true;
};

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm("该班次下存在订单时无法删除；确定要删除该班次吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      let data = { id: row.id, action: "delete" };
      let res = await appointmentApi.scenicBusOperation(data);
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

// 打开购票弹窗
const handleBuy = (row) => {
  buyRow.value = row;
  buyForm.value = buyFormInfo();
  buyVisible.value = true;
};

// 乘车日期须在售卖区间内
const disabledRideDate = (time) => {
  if (!buyRow.value.startDate || !buyRow.value.endDate) return false;
  const y = time.getFullYear();
  const m = String(time.getMonth() + 1).padStart(2, "0");
  const d = String(time.getDate()).padStart(2, "0");
  const s = `${y}-${m}-${d}`;
  return s < buyRow.value.startDate || s > buyRow.value.endDate;
};

// 提交购票
const handleBuySubmit = async () => {
  if (!buyForm.value.userId) return ElMessage.warning("请输入用户ID");
  if (!/^1\d{10}$/.test(buyForm.value.userPhone))
    return ElMessage.warning("请输入正确的11位联系电话");
  if (!buyForm.value.rideDate) return ElMessage.warning("请选择乘车日期");
  if (!buyForm.value.quantity) return ElMessage.warning("请选择购票数量");

  buyLoading.value = true;
  let res = await appointmentApi.scenicBusAppointment({
    scenicBusId: buyRow.value.id,
    userId: buyForm.value.userId,
    userPhone: cryptoUtil.encrypt(buyForm.value.userPhone),
    contactName: buyForm.value.contactName || undefined,
    rideDate: buyForm.value.rideDate,
    quantity: buyForm.value.quantity,
  });
  buyLoading.value = false;

  if (res.code == 200) {
    buyVisible.value = false;
    ElMessageBox.alert(
      `订单编号：${res.data.orderNumber}<br/>订单金额：￥${res.data.orderAmount}<br/>车票数量：${res.data.ticketCount} 张（一票一码）<br/><span style="color:#e6a23c">请于10分钟内完成支付</span>`,
      "下单成功",
      { dangerouslyUseHTMLString: true, confirmButtonText: "知道了" }
    );
  } else {
    ElMessage.error(res.message);
  }
};

// 处理编辑器图片上传
const handleImageUpload = async (file, insertFn) => {
  const uploadData = new FormData();
  uploadData.append("file", file);
  try {
    let res = await commonApi.uploadImg(uploadData);
    if (res.code !== 200) {
      ElMessage.error("上传失败: " + res.message);
      return;
    }
    const url = res.data.file.url;
    initialImages.value.push(url);
    insertFn(url, "");
  } catch (error) {
    ElMessage.error("上传图片失败，请重试");
  }
};

// 编辑器内容变化（记录保留的图片，提交时用于清理已删除图片）
const handleContentChange = (data) => {
  retainedImages.value = data.editorImgList;
};
</script>

<style lang="scss" scoped></style>
