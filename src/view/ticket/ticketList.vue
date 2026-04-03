<template>
  <div class="dept-manage">
    <!-- 查询 -->
    <div class="query-form">
      <div class="title">票务配置</div>
      <div class="query-item">
        <el-input
          placeholder="请输入票务名称"
          v-model="queryForm.title"
          style="width: 200px"
        ></el-input>
        <el-select placeholder="选择类型" v-model="queryForm.type" style="width: 200px">
          <el-option
            v-for="item in category"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>

        <el-button type="primary" @click="handleQuery" style="margin-left: 20px"
          >查询</el-button
        >
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>
    <!-- 操作 -->
    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="handleCreate" v-has="'ticketList-create'"
          >创建票务</el-button
        >
      </div>

      <!-- 表格展示 -->
      <el-table :data="ticketList" height="calc(100vh - 255px)" style="width: 100%">
        <el-table-column type="selection" width="30" />
        <el-table-column prop="id" label="ID" width="50" align="center" />
        <el-table-column
          prop="title"
          width="180"
          align="center"
          label="票务名称"
        ></el-table-column>
        <el-table-column prop="homeImg" label="图片" align="center">
          <template #default="scope">
            <el-image
              :src="imgUrl + scope.row.homeImg"
              style="width: 100px; height: 70px"
            />
          </template>
        </el-table-column>

        <el-table-column prop="category" label="票务种类" align="center">
          <template #default="scope">
            {{
              category.find((item) => item.value == scope.row.category)?.label ||
              "未知票种"
            }}
          </template>
        </el-table-column>
        <el-table-column prop="type" label="票务类型" align="center">
          <template #default="scope">
            <span>{{ scope.row.ticketType == 1 ? "演出票" : "体验票" }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" align="center"></el-table-column>
        <el-table-column
          prop="productCode"
          label="产品编码"
          align="center"
        ></el-table-column>

        <el-table-column prop="stock" label="库存" align="center"></el-table-column>
        <el-table-column prop="stock" label="状态" align="center">
          <template #default="scope">
            <el-switch
              v-model="scope.row.isDown"
              active-text="启用"
              inactive-text="禁用"
              :active-value="1"
              :inactive-value="2"
              @change="handleTicketingStatus(scope.row)"
            />
          </template>
        </el-table-column>
        <!-- <el-table-column prop="stock" label="库存数量" align="center"></el-table-column> -->
        <el-table-column
          prop="createdAt"
          label="创建时间"
          width="180"
          align="center"
        ></el-table-column>
        <el-table-column prop="" label="操作" fixed="right" width="200" align="center">
          <template #default="scope">
            <el-button
              type="primary"
              link
              @click="handleEdit(scope.row)"
              v-has="'ticketList-update'"
              >编辑</el-button
            >
            <!-- <el-button
              type="primary"
              link
              @click="handleSetPrice(scope.row)"
              v-has="'ticketList-setScene'"
              >价格配置</el-button
            > -->
            <el-button
              type="danger"
              link
              @click="handleDelete(scope.row)"
              v-has="'ticketList-delete'"
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

    <!--    创建票务表单    -->
    <el-dialog
      title="创建票务"
      v-model="dialogVisible"
      width="50%"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="form-box">
        <el-form :model="createForm" ref="createFormRef" label-width="130px">
          <el-form-item label="票务名称" prop="title">
            <el-input v-model="createForm.title"></el-input>
          </el-form-item>
          <el-form-item label="产品编码" prop="productCode">
            <el-input v-model="createForm.productCode"></el-input>
          </el-form-item>
          <el-form-item label="票务分类" prop="category">
            <el-select v-model="createForm.category" placeholder="请选择票务类型">
              <el-option
                v-for="item in category"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="票务标签" prop="typeDescription">
            <div class="flex gap-2">
              <div>
                <el-tag
                  v-for="tag in createForm.typeDescription"
                  :key="tag"
                  closable
                  :disable-transitions="false"
                  @close="handleClose(tag)"
                  style="margin-right: 10px"
                >
                  {{ tag }}
                </el-tag>
              </div>
              <div v-show="upperLimit">
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
            </div>
          </el-form-item>
          <el-form-item label="封面图" prop="homeImg">
            <ImageUpload :limit="1" v-model="createForm.homeImg"></ImageUpload>
          </el-form-item>
          <el-form-item label="轮播图" prop="banners">
            <ImageUpload :limit="3" v-model="createForm.banners"></ImageUpload>
          </el-form-item>

          <el-form-item label="是否被推荐" prop="isRecommended">
            <el-switch
              v-model="createForm.isRecommended"
              active-color="#13ce66"
              inactive-color="#ddd"
              active-text="是"
              inactive-text="否"
              :active-value="1"
              :inactive-value="2"
            />
          </el-form-item>

          <el-form-item label="价格" prop="price">
            <el-input v-model="createForm.price"> </el-input>
          </el-form-item>
          <el-form-item label="折扣价" prop="discountPrice">
            <el-input
              v-model="createForm.discountPrice"
              placeholder="可选，不填则不使用折扣价"
            >
            </el-input>
          </el-form-item>
          <el-form-item label="地址" prop="address">
            <el-input v-model="createForm.address"> </el-input>
          </el-form-item>
          <el-form-item label="库存" prop="stock">
            <el-input v-model="createForm.stock"> </el-input>
          </el-form-item>
          <el-form-item label="是否当天下单" prop="isToday">
            <el-switch
              v-model="createForm.isToday"
              active-color="#13ce66"
              inactive-color="#ddd"
              active-text="是"
              inactive-text="否"
              :active-value="1"
              :inactive-value="2"
            />
          </el-form-item>
          <el-form-item label="开始购买时间" prop="startTime">
            <el-input v-model="createForm.startTime"> </el-input>
          </el-form-item>
          <el-form-item label="是否需要选座" prop="isSeat">
            <el-switch
              v-model="createForm.isSeat"
              active-color="#13ce66"
              inactive-color="#ddd"
              active-text="是"
              inactive-text="否"
              :active-value="1"
              :inactive-value="2"
            />
          </el-form-item>
          <el-form-item label="演出时长" prop="showDuration">
            <el-input v-model="createForm.showDuration"> </el-input>
          </el-form-item>
          <el-form-item label="门票有效期" prop="validTime">
            <el-input v-model="createForm.validTime"> </el-input>
          </el-form-item>
          <el-form-item label="演出时间" prop="showTime">
            <el-input v-model="createForm.showTime" placeholder="例如：14:00"> </el-input>
          </el-form-item>
          <el-form-item label="关联座位表" prop="seatId">
            <el-select v-model="createForm.seatId" placeholder="选择关联的座位表">
              <el-option
                v-for="item in seatList"
                :key="item.id"
                :label="item.seatName"
                :value="item.id"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="会员等级限制可购" prop="memberLevel" width="200px">
            <el-select
              v-model="createForm.memberLevel"
              placeholder="请选择会员等级限制可购"
            >
              <el-option
                v-for="item in memberLevelLIst"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="是否支持团购" prop="isGroup">
            <el-switch
              v-model="createForm.isGroup"
              active-color="#13ce66"
              inactive-color="#ddd"
              active-text="是"
              inactive-text="否"
              :active-value="1"
              :inactive-value="2"
            />
          </el-form-item>
          <el-form-item label="是否支持退票" prop="isRefund">
            <el-switch
              v-model="createForm.isRefund"
              active-color="#13ce66"
              inactive-color="#ddd"
              active-text="是"
              inactive-text="否"
              :active-value="1"
              :inactive-value="2"
            />
          </el-form-item>
          <el-form-item label="可售卖的未来天数" prop="salePeriod">
            <el-input-number
              v-model="createForm.salePeriod"
              :min="0"
              :step="1"
              placeholder="7天"
            />
            <span style="margin-left: 10px; color: #999">0表示无限制</span>
          </el-form-item>
          <el-form-item label="票务上线时间" prop="onlineTime">
            <el-date-picker
              v-model="createForm.onlineTime"
              type="datetime"
              placeholder="选择上线时间"
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="售卖开始日期" prop="saleStartDate">
            <el-date-picker
              v-model="createForm.saleStartDate"
              type="date"
              placeholder="选择开始日期"
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="售卖结束日期" prop="saleEndDate">
            <el-date-picker
              v-model="createForm.saleEndDate"
              type="date"
              placeholder="选择结束日期"
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="可购最大数量" prop="maxPurchaseQuantity">
            <el-input-number
              v-model="createForm.maxPurchaseQuantity"
              :min="0"
              :step="1"
              placeholder="0表示无限购买"
            />
            <span style="margin-left: 10px; color: #999">0表示无限购买</span>
          </el-form-item>
          <el-form-item label="库存重置类型" prop="stockResetType">
            <el-radio-group v-model="createForm.stockResetType">
              <el-radio :value="0" size="large">不重置（预售/总库存模式）</el-radio>
              <el-radio :value="1" size="large">每日重置（日票模式）</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="演出简介" prop="showIntro">
            <RichTextEditor
              v-model="createForm.showIntro"
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
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 票务规则创建 -->
    <el-dialog
      title="票务规则创建"
      v-model="rouleDialogVisible"
      width="60%"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="form-box">
        <el-form label-width="100px">
          <el-form-item label="票务售卖日期" style="width: 500px" align-items="center">
            <el-date-picker
              v-model="timeValue"
              type="daterange"
              range-separator="至"
              start-placeholder="开始售卖日期"
              end-placeholder="结束售卖日期"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="工作日规则" prop="price" align-items="center">
            <el-radio-group v-model="ruleForm.ruleConfig.weekday.priceType">
              <el-radio :value="1" size="large">固定价格</el-radio>
              <el-radio :value="2" size="large">百分比上涨</el-radio>
              <el-radio :value="3" size="large">百分比下降</el-radio>
            </el-radio-group>
            <el-input v-model="ruleForm.ruleConfig.weekday.priceValue"></el-input>
          </el-form-item>
          <el-form-item label="休息日规则" prop="price">
            <el-radio-group v-model="ruleForm.ruleConfig.weekend.priceType">
              <el-radio :value="1" size="large">固定价格</el-radio>
              <el-radio :value="2" size="large">百分比上涨</el-radio>
              <el-radio :value="3" size="large">百分比下降</el-radio>
            </el-radio-group>
            <el-input v-model="ruleForm.ruleConfig.weekend.priceValue"></el-input>
          </el-form-item>
          <el-form-item label="节假日规则" prop="price">
            <el-radio-group v-model="ruleForm.ruleConfig.holiday.priceType">
              <el-radio :value="1" size="large">固定价格</el-radio>
              <el-radio :value="2" size="large">百分比上涨</el-radio>
              <el-radio :value="3" size="large">百分比下降</el-radio>
            </el-radio-group>
            <el-input v-model="ruleForm.ruleConfig.holiday.priceValue"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="rouleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="uploadRules">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import dayjs from "dayjs";
import ImageUpload from "../../components/ImageUpload/index.vue"; // 组件使用<script setup>自动作为默认导出
import { ticketingApi, commonApi } from "../../api/index.js";
import RichTextEditor from "../../components/editor/index.vue";
import Pagination from "../../components/pagination/pagination.vue";

const imgUrl = "https://hezhaoyu.oss-cn-hangzhou.aliyuncs.com"; // 图片地址

const queryForm = ref({
  title: "",
  type: "",
});

// 分页参数
const pagination = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

let timeValue = ref([]);

const ruleConfig = () => ({
  action: "create",
  ticketId: "",
  startDate: "",
  endDate: "",
  ruleConfig: {
    weekday: {
      priceType: 1,
      priceValue: "",
    },
    weekend: {
      priceType: 1,
      priceValue: "",
    },
    holiday: {
      priceType: 1,
      priceValue: "",
    },
  },
  stock: "",
  status: 1,
});
const ruleForm = ref(ruleConfig());

let createFormRef = ref(null);
let dialogVisible = ref(false);
let rouleDialogVisible = ref(false);

let category = ref([
  { label: "普通票", value: 1 },
  { label: "学生票", value: 2 },
  { label: "年卡/季卡", value: 3 },
  { label: "优惠票", value: 4 },
  { label: "", value: 4 },
]);

//  会员等级
let memberLevelLIst = ref([
  { label: "普通会员", value: 1 },
  { label: "白银会员", value: 2 },
  { label: "黄金会员", value: 3 },
  { label: "白金会员", value: 4 },
  { label: "钻石会员", value: 5 },
  { label: "金卡会员", value: 6 },
]);

const getInitialFormData = () => ({
  title: "欢乐票",
  productCode: "123qwe123qwe", // 产品编码
  stock: 0, // 库存
  startTime: "16:00", // 开始购买时间
  address: "不知道", // 地址
  price: 199, // 价格
  discountPrice: 0, // 折扣价
  banners: [], // 轮播图
  homeImg: [], // 封面图
  isRecommended: 1, // 是否推荐
  typeDescription: [], // 类型描述
  category: "", // 分类
  ticketType: "0", // 票务类型
  showTime: "90", // 演出时间
  showDuration: "90", // 演出时长
  validTime: "30", // 有效时间
  showIntro: "", // 演出简介
  isToday: 1, // 是否当天
  isDown: 1, // 是否下架
  isSeat: 1, // 是否有座位
  isGroup: 1, // 是否拼团
  isRefund: 1, // 是否退款
  seatId: "", // 座位图id
  salePeriod: 7, // 可售卖的未来天数
  onlineTime: null, // 票务上线时间
  saleStartDate: null, // 售卖开始日期
  saleEndDate: null, // 售卖结束日期
  maxPurchaseQuantity: 0, // 票种可购买的最大数量
  stockResetType: 0, // 库存重置类型
  memberLevel: 1, // 会员等级限制可购
});

let createForm = ref(getInitialFormData());

// 票务列表
let ticketList = ref([]);

// 座位列表
let seatList = ref([]);

// 编辑器模式
const editMode = ref("edit");
// 初始图片列表
const initialImages = ref([]);
// 保留的图片列表
const retainedImages = ref([]);

// 标签
const inputValue = ref("");
const upperLimit = ref(true);
const inputVisible = ref(false);
const InputRef = ref(null);

// ----------------------------函 -- 数---------------

onMounted(() => {
  handleMenuList();
  getSeatList();
});

// 票务列表
let handleMenuList = async () => {
  let res = await ticketingApi.ticketList({
    pageNum: pagination.value.pageNum,
    pageSize: pagination.value.pageSize,
    ...queryForm.value,
  });
  ticketList.value = res.data.list;
  pagination.value.total = res.data.count;
};

// 分页管理
const handleSizeChange = (val) => {
  console.log("什么东西1", val);
};

const handleCurrentChange = (val) => {
  pagination.value.pageNum = val; // 当前页
  handleMenuList();
};

// 获取座位列表
const getSeatList = async () => {
  let res = await ticketingApi.getSeatList();
  seatList.value = res.data;
};

//查询
const handleQuery = async () => {};

// 重置
const handleReset = () => {};

// 创建票务
const handleCreate = async () => {
  dialogVisible.value = true;
  nextTick(() => {
    // createForm.value = initialization(); // 初始化表单
    createForm.value = getInitialFormData();
    createForm.value.action = "create";
  });
};

// 编辑票务
const handleEdit = async (row) => {
  dialogVisible.value = true;
  nextTick(() => {
    for (let i in createForm.value) {
      createForm.value[i] = row[i];
    }
    createForm.value.id = row.id;
    createForm.value.typeDescription = row.typeDescription.split(",");
    createForm.value.action = "update";
  });
  console.log("编辑内容", createForm.value);
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
  createForm.value.showIntro = data.content;
  retainedImages.value = data.editorImgList;
};

// 提交表单
const handleSubmit = async () => {
  console.log(createForm.value);

  // 编辑器图片处理
  if (Array.isArray(initialImages.value) && initialImages.value.length > 0) {
    let deleteImageList = initialImages.value.filter(
      (item1) => !retainedImages.value.some((item2) => item1 === item2.src)
    );
    console.log("传递了啥", deleteImageList);
    if (deleteImageList.length > 0) {
      deleteImageList = deleteImageList.map((url) => {
        let match = url.match(/\/ceshiUp\/\d+\/\d+\/\d+\/[a-f0-9]+\.[a-z0-9]+/i);
        console.log("正则后的", match);
        return match ? match[0].slice(1) : "";
      });
      console.log("传递了啥", deleteImageList);
      await commonApi.deleteImg({
        deleteImageList,
      });
    }
  }
  console.log(createForm.value);
  // 轮播图处理

  if (Array.isArray(createForm.value.homeImg) && createForm.value.homeImg.length > 0) {
    createForm.value.homeImg = imageEdit(createForm.value.homeImg);
  }
  if (Array.isArray(createForm.value.banners) && createForm.value.banners.length > 0) {
    createForm.value.banners = imageEdit(createForm.value.banners);
  }

  console.log(createForm.value.typeDescription);

  let data = {
    ...createForm.value,
    price: Number(createForm.value.price),
    stock: Number(createForm.value.stock),
    typeDescription: Array.isArray(createForm.value.typeDescription)
      ? createForm.value.typeDescription.join(",")
      : createForm.value.typeDescription,
    ticketType: Number(createForm.value.ticketType),
    discountPrice: Number(createForm.value.discountPrice),
    onlineTime: dayjs(createForm.value.onlineTime).format("YYYY-MM-DD HH:mm:ss"),
    saleEndDate: dayjs(createForm.value.saleEndDate).format("YYYY-MM-DD"),
    saleStartDate: dayjs(createForm.value.saleStartDate).format("YYYY-MM-DD"),
  };

  console.log("提交字段", data);

  let res = await ticketingApi.ticketOperate(data);
  if (res.code == 200) {
    ElMessage({
      message: res.message,
      type: "success",
    });
    dialogVisible.value = false;
    handleMenuList();
  } else {
    ElMessage({
      message: res.message,
      type: "error",
    });
  }
};

// 删除票
const handleDelete = async (row) => {
  ElMessageBox.confirm("确定要删除票吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    let data = {
      ...row,
      action: "delete",
    };
    let res = await ticketingApi.ticketOperate(data);
    if (res.code == 200) {
      ElMessage({
        message: res.message,
        type: "success",
      });
      handleMenuList();
    } else {
      ElMessage({
        message: res.message,
        type: "error",
      });
    }
  });
};

// 标签
const handleClose = (tag) => {
  console.log(tag);
  createForm.value.typeDescription.splice(
    createForm.value.typeDescription.indexOf(tag),
    1
  );
  if (createForm.value.typeDescription.length < 5) {
    upperLimit.value = true;
  }
};
const showInput = () => {
  inputVisible.value = true;
  nextTick(() => {
    InputRef.value.input.focus();
  });
};
const handleInputConfirm = () => {
  console.log("添加便器", createForm.value);

  console.log("添加便器", createForm.value.typeDescription);
  if (inputValue.value) {
    createForm.value.typeDescription.push(inputValue.value);
  }
  inputVisible.value = false;
  inputValue.value = "";
  if (createForm.value.typeDescription.length == 5) {
    upperLimit.value = false;
  }
};

// 处理图片上传
const imageEdit = (data) => {
  console.log(data);
  let arr = [];
  if (Array.isArray(data)) {
    data.forEach((element) => {
      if (element && element.url) {
        console.log(element);
        arr.push(element.url.split("aliyuncs.com")[1]);
      }
    });
    return arr.join(",");
  }
  return data;
};

// 是否上线
const handleTicketingStatus = (row) => {
  ElMessageBox.confirm("确定要修改账户状态吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      console.log(row);
      let { id, isDown } = row;
      let params = {
        id,
        isDown,
        action: "update",
        // ...row,
      };
      let res = await ticketingApi.ticketOperate(params);
      if (res.code == 200) {
        ElMessage({
          message: res.message,
          type: "success",
        });
      } else {
        ElMessage({
          message: res.message,
          type: "error",
        });
      }
    })
    .catch(() => {
      if (row.isDown == 1) {
        row.isDown = 2;
      } else {
        row.isDown = 1;
      }
    });
};

// 价格配置
const handleSetPrice = (row) => {
  console.log(row);
  ruleForm.value.ticketId = row.id;
  ruleForm.value.stock = row.stock;

  rouleDialogVisible.value = true;
};

//提交价格规则
const uploadRules = async () => {
  ruleForm.value.startDate = dayjs(timeValue.value[0]).format("YYYY-MM-DD");
  ruleForm.value.endDate = dayjs(timeValue.value[1]).format("YYYY-MM-DD");
  console.log(ruleForm.value);
  let res = await ticketingApi.operatePrice(ruleForm.value);
  console.log("提交状态", res);
};
</script>

<style lang="scss" scoped></style>
