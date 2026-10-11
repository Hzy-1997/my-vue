<!--  -->
<template>
  <div class="dept-manage">
    <!-- 头部 -->
    <div class="query-form">
      <div class="title">商品管理</div>
      <div class="query-item">
        <el-input v-model="queryForm.title" placeholder="请输入商品名称" />
        <el-button type="primary" @click="queryCombo">查询</el-button>
        <el-button @click="resetForm">重置</el-button>
      </div>
    </div>

    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="createCombo">创建商品</el-button>
      </div>
      <!-- 表格展示 -->
      <el-table :data="tableData" height="calc(100vh - 255px)" style="width: 100%">
        <el-table-column prop="id" label="ID" width="50" align="center" />

        <el-table-column
          prop="description"
          label="商品名称"
          width="200"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="unitPrice"
          label="套餐价格"
          width="180"
          align="center"
        ></el-table-column>
        <el-table-column prop="itemType" label="套餐类别" width="80" align="center">
          <template #default="{ row }">
            {{ row.itemType === 1 ? "酒店" : row.itemType === 2 ? "门票" : "其他" }}
          </template>
        </el-table-column>

        <el-table-column
          prop="itemType"
          label="关联主套餐名称"
          width="180"
          align="center"
        >
          <template #default="{ row }">
            {{
              row.itemType === 2
                ? row.ticket.title
                : row.itemType === 1
                ? row.roomPackage.roomType.hotel.title
                : "其他"
            }}
          </template>
        </el-table-column>

        <el-table-column
          prop="startDate"
          label="套餐开始时间"
          width="180"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="endDate"
          label="套餐结束时间"
          width="180"
          align="center"
        ></el-table-column>
        <el-table-column
          prop="useDateType"
          label="使用日期类型"
          width="180"
          align="center"
        >
          <template #default="{ row }">
            {{
              row.useDateType === 1 ? "按天" : row.useDateType === 2 ? "按人" : "按时间"
            }}
          </template>
        </el-table-column>
        <el-table-column
          prop="createdAt"
          label="创建时间"
          width="200"
          align="center"
        ></el-table-column>
        <el-table-column prop="" label="操作" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="editCombo(row)"
              >编辑</el-button
            >
            <el-button type="danger" size="small" @click="deleteCombo(row)"
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
          <el-form-item label="套餐分类">
            <el-select
              v-model="formData.packageId"
              placeholder="请选择套餐分类"
              @change="handleChange"
            >
              <el-option
                v-for="item in packageList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="套餐名称">
            <el-input v-model="formData.itemName" placeholder="请输入套餐名称" />
          </el-form-item>
          <el-form-item label="套餐类别">
            <div>
              <el-radio-group v-model="formData.itemType">
                <el-radio
                  v-for="item in itemTypeList"
                  :key="item.value"
                  :value="item.value"
                  >{{ item.label }}</el-radio
                >
              </el-radio-group>
              <span class="tip-text"
                >* 选择套餐类别后，根据类别选择对应的票务或房型，请仔细选择</span
              >
            </div>
          </el-form-item>

          <el-form-item label="套餐房型">
            <el-select
              v-model="formData.roomPackageId"
              placeholder="请选择套餐房型"
              @change="handleChangeRoomType"
              clearable
            >
              <el-option
                v-for="item in roomTypeList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="套餐票型">
            <el-select
              v-model="formData.ticketId"
              placeholder="请选择套餐票型"
              @change="handleChangeTicket"
              clearable
            >
              <el-option
                v-for="item in ticketList"
                :key="item.id"
                :label="item.title"
                :value="item.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="套餐子表分组">
            <el-select
              v-model="formData.groupId"
              placeholder="请选择套餐子表分组"
              clearable
            >
              <el-option
                v-for="item in groupIdList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="套餐类别">
            <el-radio-group v-model="formData.isPrimary">
              <el-radio
                v-for="item in orderTypeList"
                :key="item.value"
                :value="item.value"
                >{{ item.label }}</el-radio
              >
            </el-radio-group>
          </el-form-item>

          <el-form-item label="套餐价格">
            <el-input v-model="formData.originalPrice" placeholder="请输入原价" />
          </el-form-item>

          <el-form-item label="套餐价格">
            <el-input v-model="formData.unitPrice" placeholder="请输入优惠价" />
          </el-form-item>

          <el-form-item label="套餐售卖日期">
            <div style="width: 400px">
              <el-date-picker
                style="width: 100%"
                v-model="saleDate"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
              />
            </div>
          </el-form-item>

          <el-form-item label="套餐售卖库存">
            <el-input v-model="formData.maxSaleNum" placeholder="请输入总限量" />
          </el-form-item>
          <el-form-item label="套餐限购数量">
            <el-input v-model="formData.maxBuyNum" placeholder="请输入每单限购" />
          </el-form-item>

          <el-form-item label="套餐日期配置">
            <el-radio-group v-model="formData.useDateType">
              <el-radio
                v-for="item in useDateTypeList"
                :key="item.value"
                :value="item.value"
                >{{ item.label }}</el-radio
              >
            </el-radio-group>
            <span class="tip-text"
              >* 选择日期类型后，根据日期类型配置日期偏移天数或日期值</span
            >
          </el-form-item>

          <el-form-item label="套餐使用日期">
            <el-input v-model="formData.useDateValue" placeholder="请输入套餐使用日期" />
            <span class="tip-text"
              >* 选择固定日期或N天后填写 示例：YYYY-MM-DD或者10(购买后10天内)</span
            >
          </el-form-item>

          <el-form-item label="套餐描述">
            <el-input
              v-model="formData.description"
              type="textarea"
              placeholder="请输入套餐描述"
              clearable
              :rows="4"
            />
          </el-form-item>

          <el-form-item label="排序">
            <el-input-number
              v-model="formData.sortOrder"
              style="width: 300px"
              placeholder="请输入排序"
            />
          </el-form-item>

          <el-form-item label="套餐状态">
            <el-radio-group v-model="formData.status">
              <el-radio :value="1">正常</el-radio>
              <el-radio :value="0">停用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { comboApi, hotelApi, ticketingApi } from "../../api/index";
import { formatDate } from "../../utils/utils.js";
import { ElMessage, ElMessageBox } from "element-plus";

let queryForm = ref({
  itemName: "",
});

let dialogVisible = ref(false);

// 套餐分组列表
let groupIdList = ref([
  { label: "套餐类别A", value: 1 },
  { label: "套餐类别B", value: 2 },
  { label: "套餐类别C", value: 3 },
  { label: "套餐类别D", value: 4 },
  { label: "套餐类别E", value: 5 },
  { label: "套餐类别F", value: 6 },
  { label: "套餐类别G", value: 7 },
  { label: "套餐类别H", value: 8 },
  { label: "套餐类别I", value: 9 },
  { label: "套餐类别J", value: 10 },
]);

// 套餐子项类型
let orderTypeList = ref([
  { label: "主产品", value: 1 },
  { label: "附带品", value: 2 },
]);

let itemTypeList = ref([
  { label: "酒店房型", value: 1 },
  { label: "门票", value: 2 },
  { label: "其他", value: 3 },
]);

//1=跟随主产品入住日期 2=跟随主产品游玩日期 3=固定日期 4=购买后N天内
let useDateTypeList = ref([
  { label: "跟随主产品入住日期", value: 1 },
  { label: "跟随主产品游玩日期", value: 2 },
  { label: "固定日期", value: 3 },
  { label: "购买后N天内", value: 4 },
]);

// 酒店房型列表
let roomTypeList = ref([]);
// 票务列表
let ticketList = ref([]);

let getInitialFormData = () => ({
  action: "create",
  packageId: "", //套餐主表ID
  groupId: "", //套餐子表分组ID
  isPrimary: 0, //是否主产品：1=主产品（每组1个） 0=附带品（每组多个）
  itemType: 1, //子项类型：1=酒店房型 2=门票 3=其他

  roomPackageId: null, //关联酒店房型套餐ID（itemType=1时必填）
  ticketId: null, //关联门票套餐ID（itemType=2时必填）
  // ticketPriceRuleId: "", //关联门票价格规则ID（itemType=2时必填），用于查TicketDatePrice库存

  startDate: "", //售卖开始日期
  endDate: "", //售卖结束日期
  maxSaleNum: "", //总限量
  maxBuyNum: "", //每单限购
  quantity: 1, //包含数量
  itemName: "", //子项名称
  originalPrice: 0, //原价
  unitPrice: 0, //优惠价
  useDateType: 1, //使用日期类型
  useDateOffset: 1, //使用日期偏移量（天数月数年数） 默认1天内
  useDateValue: "", //使用日期值（天数月数年数）
  description: "", //描述
  icon: "", //图标URL
  sortOrder: 0, //排序顺序
  price: "", //套餐价格
  status: 1, //状态： 1=已发布 2=已下架
});

let formData = ref(getInitialFormData());

let tableData = ref([]);
let packageList = ref([]);

let saleDate = ref([]);

// 分页参数
const pagination = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

// -------------------------------方法-------------------------------

onMounted(() => {
  getComboList();
  getPrimaryComboList();
  getRoomTypeList();
  handleMenuList();
});

// 获取套餐列表
const getComboList = async () => {
  console.log("获取套餐列表");
  let res = await comboApi.getComboItemList({
    page: 1,
    pageSize: 1000,
  });
  console.log("返回数据", res);
  tableData.value = res.data.list;
};

// 查询套餐
const queryCombo = () => {
  console.log("查询套餐");
};

// 重置表单
const resetForm = () => {
  queryForm.value.itemName = "";
  console.log("重置表单");
  getComboList();
};

// 创建套餐
const createCombo = () => {
  console.log("创建套餐");
  dialogVisible.value = true;
  formData.value = getInitialFormData();
};

// 编辑套餐
const editCombo = (row) => {
  console.log("编辑套餐", row);
  dialogVisible.value = true;
  formData.value = {
    ...row,
    action: "update",
  };
  saleDate.value = [row.startDate, row.endDate];
};

// 删除套餐
const deleteCombo = (row) => {
  console.log("删除套餐");
  ElMessageBox.confirm("确定删除该套餐吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      await comboApi.operateComboItem({
        id: row.id,
        action: "delete",
      });
      ElMessage.success("删除成功");
      getComboList();
    })
    .catch(() => {});
};

// 获取主套餐列表
const getPrimaryComboList = async () => {
  console.log("获取主套餐列表 packageList");
  let res = await comboApi.getPrimaryComboList({
    page: 1,
    pageSize: 1000,
  });

  packageList.value = res.data.list.map((item) => {
    return {
      label: item.name,
      value: item.id,
    };
  });

  console.log("返回数据", res);
};

// 获取就酒店房型列表
const getRoomTypeList = async () => {
  let res = await hotelApi.getRoomPackageList({
    page: 1,
    pageSize: 1000,
  });
  console.log("什么情况", res);
  roomTypeList.value = res.data.list;
};

// 票务列表
let handleMenuList = async () => {
  let res = await ticketingApi.ticketList({
    page: 1,
    pageSize: 1000,
  });
  ticketList.value = res.data.list;
};

// 处理套餐分类改变
const handleChange = (val) => {
  console.log("套餐分类改变", val);
  formData.value.packageId = val;
};

// 处理套餐类型改变 房型
const handleChangeRoomType = (val) => {
  if (val == undefined) {
    formData.value.roomPackageId = null;
  } else {
    formData.value.roomPackageId = val;
  }
};

// 处理套餐状态改变 票型
const handleChangeTicket = (val) => {
  if (val == undefined) {
    formData.value.ticketId = null;
  } else {
    formData.value.ticketId = val;
  }
};

// 提交表单
const handleSubmit = async () => {
  // 格式化日期
  console.log(saleDate.value[0]);
  formData.value.startDate = formatDate(saleDate.value[0]);
  formData.value.endDate = formatDate(saleDate.value[1]);
  console.log("提交表单", formData.value);

  if (formData.value.itemType == 1) {
    if (!formData.value.roomPackageId) {
      ElMessage.error("请选择酒店房型");
      return;
    }
  } else if (formData.value.itemType == 2) {
    if (!formData.value.ticketId) {
      ElMessage.error("请选择门票");
      return;
    }
  }

  let res = await comboApi.operateComboItem(formData.value);
  console.log("返回数据", res);
  if (res.code == 200) {
    ElMessage.success(res.message);
    dialogVisible.value = false;
    getComboList();
  } else {
    ElMessage.error(res.message);
  }
};
</script>

<style lang="scss" scoped>
.tip-text {
  display: block; /* 使其换行 */
  font-size: 12px;
  color: red;
  line-height: 1.8;
  margin-top: 4px;
}
</style>
