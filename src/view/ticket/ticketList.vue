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
        <el-table-column prop="" label="操作" fixed="right" width="260" align="center">
          <template #default="scope">
            <el-button
              type="primary"
              link
              @click="handleEdit(scope.row)"
              v-has="'ticketList-update'"
              >编辑</el-button
            >
            <el-button type="primary" link @click="handleSetPrice(scope.row)"
              >价格配置</el-button
            >
            <el-button type="success" link @click="handleCalendar(scope.row)"
              >日历预览</el-button
            >
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
    <!-- 分页 -->
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

    <!-- 票务价格规则管理 -->
    <el-dialog
      :title="`价格规则配置 - ${currentTicket.title || ''}`"
      v-model="rouleDialogVisible"
      width="70%"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div class="form-box">
        <div class="rule-header">
          <span>票务原价：¥{{ currentTicket.price }}</span>
          <el-button
            v-if="!ruleFormVisible"
            type="primary"
            size="small"
            @click="handleRuleCreate"
            >新增规则</el-button
          >
        </div>

        <el-table :data="currentRules" size="small" border>
          <el-table-column prop="id" label="ID" width="60" align="center" />
          <el-table-column label="售卖日期范围" width="210" align="center">
            <template #default="{ row }">
              {{ row.startDate }} ~ {{ row.endDate || "长期" }}
            </template>
          </el-table-column>
          <el-table-column label="工作日规则" align="center">
            <template #default="{ row }">
              {{ ruleText(row.ruleConfig?.weekday) }}
            </template>
          </el-table-column>
          <el-table-column label="周末规则" align="center">
            <template #default="{ row }">
              {{ ruleText(row.ruleConfig?.weekend) }}
            </template>
          </el-table-column>
          <el-table-column label="节假日规则" align="center">
            <template #default="{ row }">
              {{ ruleText(row.ruleConfig?.holiday) }}
            </template>
          </el-table-column>
          <el-table-column prop="stock" label="库存" width="80" align="center" />
          <el-table-column label="操作" width="130" align="center">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleRuleEdit(row)"
                >编辑</el-button
              >
              <el-button type="danger" link size="small" @click="handleRuleDelete(row)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>

        <!-- 新增/编辑表单 -->
        <div v-if="ruleFormVisible" class="rule-form">
          <el-divider content-position="left">
            {{ ruleForm.action === "create" ? "新增价格规则" : "编辑价格规则" }}
          </el-divider>
          <el-form label-width="110px">
            <el-form-item label="票务售卖日期">
              <el-date-picker
                v-model="timeValue"
                type="daterange"
                range-separator="至"
                start-placeholder="开始售卖日期"
                end-placeholder="结束售卖日期"
                value-format="YYYY-MM-DD"
                style="width: 400px"
              />
            </el-form-item>
            <el-form-item label="工作日规则">
              <el-radio-group v-model="ruleForm.ruleConfig.weekday.priceType">
                <el-radio :value="1" size="large">固定价格</el-radio>
                <el-radio :value="2" size="large">百分比上涨</el-radio>
                <el-radio :value="3" size="large">百分比下降</el-radio>
              </el-radio-group>
              <el-input
                v-model="ruleForm.ruleConfig.weekday.priceValue"
                :placeholder="pricePlaceholder(ruleForm.ruleConfig.weekday.priceType)"
                style="width: 160px; margin-left: 12px"
              />
            </el-form-item>
            <el-form-item label="周末规则">
              <el-radio-group v-model="ruleForm.ruleConfig.weekend.priceType">
                <el-radio :value="1" size="large">固定价格</el-radio>
                <el-radio :value="2" size="large">百分比上涨</el-radio>
                <el-radio :value="3" size="large">百分比下降</el-radio>
              </el-radio-group>
              <el-input
                v-model="ruleForm.ruleConfig.weekend.priceValue"
                :placeholder="pricePlaceholder(ruleForm.ruleConfig.weekend.priceType)"
                style="width: 160px; margin-left: 12px"
              />
            </el-form-item>
            <el-form-item label="节假日规则">
              <el-radio-group v-model="ruleForm.ruleConfig.holiday.priceType">
                <el-radio :value="1" size="large">固定价格</el-radio>
                <el-radio :value="2" size="large">百分比上涨</el-radio>
                <el-radio :value="3" size="large">百分比下降</el-radio>
              </el-radio-group>
              <el-input
                v-model="ruleForm.ruleConfig.holiday.priceValue"
                :placeholder="pricePlaceholder(ruleForm.ruleConfig.holiday.priceType)"
                style="width: 160px; margin-left: 12px"
              />
            </el-form-item>
            <el-form-item label="规则库存">
              <el-input-number
                v-model="ruleForm.stock"
                :min="0"
                placeholder="0表示不限"
              />
            </el-form-item>
            <el-form-item>
              <el-button @click="ruleFormVisible = false">取消</el-button>
              <el-button type="primary" @click="uploadRules">保存规则</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="rouleDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 日历价格预览 -->
    <el-dialog
      :title="`日期价格预览 - ${currentTicket.title || ''}`"
      v-model="calendarVisible"
      width="70%"
    >
      <el-calendar v-model="calendarDate">
        <template #date-cell="{ data }">
          <div class="calendar-cell">
            <div class="date">{{ data.day.slice(5) }}</div>
            <div v-if="getCalendarData(data.day)" class="price-info">
              <div class="price">¥{{ getCalendarData(data.day).price }}</div>
              <div class="type">{{ getCalendarData(data.day).dateTypeName }}</div>
            </div>
          </div>
        </template>
      </el-calendar>
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
import { imageEdit } from "../../utils/utils.js"; // 图片编辑

// const imgUrl = "https://hezhaoyu.oss-cn-hangzhou.aliyuncs.com"; // 图片地址
const imgUrl = import.meta.env.VITE_IMG_URL;

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
  id: "",
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
  stock: 0,
  status: 1,
});
const ruleForm = ref(ruleConfig());

// 价格规则管理相关状态
let currentTicket = ref({});
let currentRules = ref([]);
let ruleFormVisible = ref(false);

// 日历预览相关状态
const calendarVisible = ref(false);
const calendarDate = ref(new Date());
let calendarPrices = ref([]);

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

// 打开价格规则配置弹窗
const handleSetPrice = (row) => {
  currentTicket.value = row;
  currentRules.value = row.priceRules || [];
  ruleFormVisible.value = false;
  ruleForm.value = ruleConfig();
  timeValue.value = [];
  rouleDialogVisible.value = true;
};

// 刷新规则列表（保存/删除后重新拉取）
const refreshRules = async () => {
  await handleMenuList();
  let ticket = ticketList.value.find((t) => t.id === currentTicket.value.id);
  if (ticket) {
    currentTicket.value = ticket;
    currentRules.value = ticket.priceRules || [];
  }
};

// 新增规则
const handleRuleCreate = () => {
  ruleForm.value = ruleConfig();
  ruleForm.value.ticketId = currentTicket.value.id;
  timeValue.value = [];
  ruleFormVisible.value = true;
};

// 编辑规则
const handleRuleEdit = (rule) => {
  ruleForm.value = {
    action: "update",
    id: rule.id,
    ticketId: currentTicket.value.id,
    startDate: rule.startDate,
    endDate: rule.endDate,
    ruleConfig: {
      weekday: {
        priceType: rule.ruleConfig?.weekday?.priceType ?? 1,
        priceValue: rule.ruleConfig?.weekday?.priceValue ?? "",
      },
      weekend: {
        priceType: rule.ruleConfig?.weekend?.priceType ?? 1,
        priceValue: rule.ruleConfig?.weekend?.priceValue ?? "",
      },
      holiday: {
        priceType: rule.ruleConfig?.holiday?.priceType ?? 1,
        priceValue: rule.ruleConfig?.holiday?.priceValue ?? "",
      },
    },
    stock: rule.stock ?? 0,
    status: rule.status ?? 1,
  };
  timeValue.value = rule.startDate && rule.endDate ? [rule.startDate, rule.endDate] : [];
  ruleFormVisible.value = true;
};

// 删除规则
const handleRuleDelete = (rule) => {
  ElMessageBox.confirm(
    `确定删除该价格规则（${rule.startDate} ~ ${rule.endDate || "长期"}）吗？`,
    "提示",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  )
    .then(async () => {
      let res = await ticketingApi.operatePrice({
        action: "delete",
        id: rule.id,
      });
      if (res.code == 200) {
        ElMessage.success(res.message);
        refreshRules();
      } else {
        ElMessage.error(res.message);
      }
    })
    .catch(() => {});
};

// 规则摘要文本
const ruleText = (config) => {
  if (!config || config.priceValue === "" || config.priceValue == null) {
    return "原价";
  }
  const v = config.priceValue;
  if (config.priceType == 1) return `固定 ¥${v}`;
  if (config.priceType == 2) return `上涨 ${v}%`;
  if (config.priceType == 3) return `下降 ${v}%`;
  return "原价";
};

// 输入框提示
const pricePlaceholder = (type) => (type == 1 ? "固定价格(元)" : "百分比数值(%)");

// 提交价格规则（新增/编辑）
const uploadRules = async () => {
  if (!timeValue.value || timeValue.value.length !== 2) {
    return ElMessage.warning("请选择票务售卖日期范围");
  }
  // priceValue 数字化，空值保持原价语义（后端无对应规则时按原价处理）
  const cfg = ruleForm.value.ruleConfig;
  for (let key of ["weekday", "weekend", "holiday"]) {
    if (cfg[key].priceValue !== "" && cfg[key].priceValue != null) {
      cfg[key].priceValue = Number(cfg[key].priceValue);
    }
  }
  ruleForm.value.startDate = timeValue.value[0];
  ruleForm.value.endDate = timeValue.value[1];

  let res = await ticketingApi.operatePrice(ruleForm.value);
  if (res.code == 200) {
    ElMessage.success(res.message);
    ruleFormVisible.value = false;
    refreshRules();
  } else {
    ElMessage.error(res.message);
  }
};

// 日历价格预览
const handleCalendar = async (row) => {
  currentTicket.value = row;
  let res = await ticketingApi.getTicketDatePrices({ ticketId: row.id });
  if (res.code == 200) {
    calendarPrices.value = res.data.datePrices || [];
    calendarVisible.value = true;
  } else {
    ElMessage.error(res.message);
  }
};

// 查找日历中某日期的数据
const getCalendarData = (day) => calendarPrices.value.find((item) => item.date === day);
</script>

<style lang="scss" scoped>
.rule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: bold;
}

.rule-form {
  margin-top: 8px;
}

.calendar-cell {
  height: 100%;
}

.calendar-cell .date {
  font-weight: bold;
}

.calendar-cell .price {
  color: #f56c6c;
  font-weight: bold;
  font-size: 12px;
}

.calendar-cell .type {
  font-size: 12px;
  color: #999;
}
</style>
