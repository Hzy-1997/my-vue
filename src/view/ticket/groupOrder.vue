<template>
  <div class="dept-manage">
    <div class="query-form">
      <div class="title">酒店管理</div>
    </div>

    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="handleCreate">创建酒店</el-button>
      </div>
    </div>
    <div>
      <el-button type="primary" @click="handleBuy">演出购票</el-button>
      <el-button type="primary" @click="handleHotelBuy">酒店购票</el-button>
    </div>
    <!-- 表单 -->
    <el-dialog
      title="创建酒店"
      v-model="dialogVisible"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :draggable="true"
    >
      <div class="form-box">
        <el-form :model="formData" label-width="100px" ref="dialogForm" :rules="rules">
          <el-form-item label="酒店名称" prop="title">
            <el-input v-model="formData.title" placeholder="请输入酒店名称" />
          </el-form-item>

          <el-form-item label="酒店标签" prop="tags">
            <div class="flex gap-2">
              <el-tag
                v-for="tag in dynamicTags"
                :key="tag.id || tag"
                closable
                :disable-transitions="false"
                @close="handleClose(tag)"
                style="margin-right: 10px"
              >
                <i
                  :class="tag.iconClass || getTagIcon(tag.text || tag)"
                  style="margin-right: 4px"
                ></i>
                {{ tag.text || tag }}
              </el-tag>
              <!-- 输入框 -->
              <el-input
                v-if="inputVisible"
                ref="InputRef"
                v-model="inputValue"
                class="w-20"
                size="small"
                placeholder="请输入标签描述"
                @keyup.enter="handleInputConfirm"
                @blur="handleInputConfirm"
              />
              <el-button
                v-else
                class="button-new-tag"
                size="small"
                @click="showIconSelect"
              >
                + 酒店标签
              </el-button>

              <!-- 图标选择弹窗 -->
              <el-dialog
                v-model="iconSelectVisible"
                title="选择图标"
                width="800px"
                :show-close="false"
                :close-on-click-modal="false"
                :close-on-press-escape="false"
                :draggable="true"
              >
                <div class="icon-select-grid">
                  <div
                    v-for="icon in availableIcons"
                    :key="icon.className"
                    :class="[
                      'icon-select-item',
                      { 'icon-selected': selectedIconClass === icon.className },
                    ]"
                    @click="selectIcon(icon)"
                  >
                    <i :class="['iconfont', icon.className]"></i>
                    <span>{{ icon.name }}</span>
                  </div>
                </div>
                <template #footer>
                  <span class="dialog-footer">
                    <el-button @click="iconSelectVisible = false">取消</el-button>
                    <el-button type="primary" @click="confirmIconSelection"
                      >确定</el-button
                    >
                  </span>
                </template>
              </el-dialog>
            </div>
          </el-form-item>

          <el-form-item label="封面图" prop="homeImg">
            <ImageUpload :limit="1" v-model="formData.images"></ImageUpload>
          </el-form-item>

          <el-form-item label="轮播图" prop="banners">
            <ImageUpload :limit="3" v-model="formData.banner"></ImageUpload>
          </el-form-item>

          <el-form-item label="酒店星级" prop="star_rating">
            <el-rate v-model="formData.star_rating" clearable />
          </el-form-item>

          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="formData.phone" placeholder="请输入联系电话" />
          </el-form-item>

          <el-form-item label="酒店地址" prop="address">
            <el-input v-model="formData.address" placeholder="请输入酒店地址" />
          </el-form-item>
          <el-form-item label="酒店简介" prop="intro">
            <el-input v-model="formData.intro" placeholder="请输入酒店简介" />
          </el-form-item>
          <el-form-item label="经纬度" prop="location">
            <el-input v-model="formData.location" placeholder="请输入经纬度" />
          </el-form-item>

          <el-form-item label="开业时间" prop="openingTime">
            <el-input v-model="formData.openingTime" placeholder="请输入开业时间" />
          </el-form-item>

          <el-form-item label="酒店政策" prop="policies">
            <el-input v-model="formData.policies" placeholder="请输入酒店政策" />
          </el-form-item>

          <el-form-item label="酒店须知" prop="description">
            <el-input v-model="formData.description" placeholder="请输入酒店须知" />
          </el-form-item>

          <el-form-item label="酒店设施" prop="openingTime">
            <el-button @click="facilityDialogVisible = true">添加酒店设施标签</el-button>
          </el-form-item>

          <el-form-item label="酒店状态" prop="status">
            <el-radio-group v-model="formData.status">
              <el-radio :value="1">启 用</el-radio>
              <el-radio :value="0">禁 用</el-radio>
            </el-radio-group>
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
    <el-dialog
      title="酒店设施配置"
      v-model="facilityDialogVisible"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :draggable="true"
      width="600px"
    >
      <el-form-item label="开业时间" prop="openingTime">
        <el-input v-model="formData.openingTime" placeholder="请输入开业时间" />
      </el-form-item>

      <el-form-item label="酒店政策" prop="policies">
        <el-input v-model="formData.policies" placeholder="请输入酒店政策" />
      </el-form-item>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import ImageUpload from "../../components/ImageUpload/index.vue"; // 组件使用<script setup>自动作为默认导出
import { ticketingApi, commonApi, paymentApi } from "../../api/index.js";
import RichTextEditor from "../../components/editor/index.vue";

const dialogVisible = ref(false);
const facilityDialogVisible = ref(false);

// 标签相关状态
const inputValue = ref("");
const dynamicTags = ref([
  { id: 1, text: "Tag 1", iconClass: "iconfont icon-dianshiji01" },
  { id: 2, text: "Tag 2", iconClass: "iconfont icon-tingchechang" },
  { id: 3, text: "Tag 3", iconClass: "iconfont icon-canyin" },
]);
const inputVisible = ref(false);
const InputRef = ref(null);

// 图标选择相关状态
const iconSelectVisible = ref(false);
const selectedIconClass = ref("");
const selectedIconName = ref("");

// 可用图标列表
const availableIcons = ref([
  { name: "停车场", className: "icon-tingchechang" },
  { name: "洗衣机", className: "icon-xiyiji" },
  { name: "电视机", className: "icon-dianshiji01" },
  { name: "会议室", className: "icon-huiyi" },
  { name: "卫生间", className: "icon-gonggongweishengjian" },
  { name: "餐饮", className: "icon-canyin" },
  { name: "监控", className: "icon-gonggongquyujiankong" },
  { name: "火灾报警", className: "icon-tubiao-ditu-huozaibaojingqi" },
  { name: "拖鞋", className: "icon-tuoxie" },
  { name: "冰箱", className: "icon-bingxiang" },
  { name: "浴缸", className: "icon-yugang" },
  { name: "空调", className: "icon-kongtiao" },
  { name: "沙发", className: "icon-shafa" },
  { name: "干衣机", className: "icon-ganyiji" },
  { name: "娱乐", className: "icon-yule" },
  { name: "宴会厅", className: "icon-yanhuiting" },
  { name: "灭火器", className: "icon-miehuoqi" },
  { name: "自助餐", className: "icon-gongyuzizhucanting" },
  { name: "棋牌", className: "icon-qipaishi" },
  { name: "寄存", className: "icon-hanglijicun" },
  { name: "电话", className: "icon-dianhua" },
  { name: "插座", className: "icon-cz-" },
  { name: "电梯", className: "icon-dianti" },
  { name: "酒吧", className: "icon-jiuba" },
  { name: "充电", className: "icon-chongdianzhuang" },
  { name: "毛巾", className: "icon-maojin" },
  { name: "吹风机", className: "icon-chuifengji" },
  { name: "SPA", className: "icon-spa" },
  { name: "温泉", className: "icon-wenquanxiyuxianxing" },
  { name: "烟雾报警", className: "icon-yanwubaojingqi3x" },
  { name: "摄像头", className: "icon-camara" },
  { name: "咖啡", className: "icon-kafei" },
  { name: "安全报警", className: "icon-anquanbaojingqi" },
  { name: "快速入住", className: "icon-icon_kuaisuruzhutuifang" },
  { name: "多功能厅", className: "icon-duomeitiyanshixitong_duogongnengting" },
]);

const getInitialFormData = () => ({
  title: "",
  address: "",
  location: "",
  phone: "",
  star_rating: 0,
  intro: "",
  status: 1,
  tags: "",
  images: "",
  banner: "",
  openingTime: "",
  facilities: "",
  policies: "",
  description: "",
});

const formData = ref(getInitialFormData());

const rules = {};

const handleCreate = () => {
  dialogVisible.value = true;
};

// const handleClose = () => {
//   dialogVisible.value = false;
// };

const handleClose = (tag) => {
  if (typeof tag === "object") {
    // 处理对象类型的标签
    const index = dynamicTags.value.findIndex((t) => t.id === tag.id);
    if (index !== -1) {
      dynamicTags.value.splice(index, 1);
    }
  } else {
    // 处理字符串类型的标签（兼容旧数据）
    const index = dynamicTags.value.indexOf(tag);
    if (index !== -1) {
      dynamicTags.value.splice(index, 1);
    }
  }
};

const showInput = () => {
  inputVisible.value = true;
  nextTick(() => {
    InputRef.value.input.focus();
  });
};

// 显示图标选择弹窗
const showIconSelect = () => {
  iconSelectVisible.value = true;
  selectedIconClass.value = "";
  selectedIconName.value = "";
};

// 选择图标
const selectIcon = (icon) => {
  selectedIconClass.value = icon.className;
  selectedIconName.value = icon.name;
};

// 确认图标选择
const confirmIconSelection = () => {
  if (!selectedIconClass.value) {
    ElMessage.warning("请先选择一个图标");
    return;
  }

  iconSelectVisible.value = false;
  inputVisible.value = true;

  // 设置输入框的占位符为选中的图标名称
  inputValue.value = selectedIconName.value;

  nextTick(() => {
    if (InputRef.value && InputRef.value.input) {
      InputRef.value.input.focus();
      // 选中文本以便用户直接修改
      InputRef.value.input.select();
    }
  });
};

const handleInputConfirm = () => {
  if (inputValue.value) {
    // 创建新的标签对象，包含图标和文字
    const newTag = {
      id: Date.now(), // 使用时间戳作为唯一ID
      text: inputValue.value,
      iconClass: `iconfont ${selectedIconClass.value}`,
    };

    dynamicTags.value.push(newTag);
  }

  // 重置状态
  inputVisible.value = false;
  inputValue.value = "";
  selectedIconClass.value = "";
  selectedIconName.value = "";
};

const handleSubmit = async () => {
  // try {
  //   let res = await projectApi.hotelOperate({
  //     ...formData.value,
  //     action: "create",
  //   });
  //   console.log(res);
  //   if (res.code == 200) {
  //     ElMessage({
  //       message: "操作成功",
  //       type: "success",
  //     });
  //     getHotelList();
  //   }
  // } catch (error) {
  //   console.log(error);
  //   ElMessage({
  //     message: "操作失败",
  //     type: "error",
  //   });
  // }
};

// 根据标签名称获取对应的图标类名
const getTagIcon = (tagName) => {
  const iconMap = {
    // 酒店相关图标
    停车场: "iconfont icon-tingchechang",
    洗衣机: "iconfont icon-xiyiji",
    电视机: "iconfont icon-dianshiji01",
    会议室: "iconfont icon-huiyi",
    卫生间: "iconfont icon-gonggongweishengjian",
    餐饮: "iconfont icon-canyin",
    监控: "iconfont icon-gonggongquyujiankong",
    火灾报警: "iconfont icon-tubiao-ditu-huozaibaojingqi",
    拖鞋: "iconfont icon-tuoxie",
    冰箱: "iconfont icon-bingxiang",
    浴缸: "iconfont icon-yugang",
    空调: "iconfont icon-kongtiao",
    沙发: "iconfont icon-shafa",
    干衣机: "iconfont icon-ganyiji",
    娱乐: "iconfont icon-yule",
    宴会厅: "iconfont icon-yanhuiting",
    灭火器: "iconfont icon-miehuoqi",
    自助餐: "iconfont icon-gongyuzizhucanting",
    棋牌: "iconfont icon-qipaishi",
    寄存: "iconfont icon-hanglijicun",
    电话: "iconfont icon-dianhua",
    插座: "iconfont icon-cz-",
    电梯: "iconfont icon-dianti",
    酒吧: "iconfont icon-jiuba",
    充电: "iconfont icon-chongdianzhuang",
    毛巾: "iconfont icon-maojin",
    吹风机: "iconfont icon-chuifengji",
    SPA: "iconfont icon-spa",
    温泉: "iconfont icon-wenquanxiyuxianxing",
    烟雾报警: "iconfont icon-yanwubaojingqi3x",
    摄像头: "iconfont icon-camara",
    咖啡: "iconfont icon-kafei",
    安全报警: "iconfont icon-anquanbaojingqi",
    快速入住: "iconfont icon-icon_kuaisuruzhutuifang",
    多功能厅: "iconfont icon-duomeitiyanshixitong_duogongnengting",

    // 默认图标
    "Tag 1": "iconfont icon-dianshiji01",
    "Tag 2": "iconfont icon-tingchechang",
    "Tag 3": "iconfont icon-canyin",
  };

  // 查找匹配的图标，支持模糊匹配
  for (const [key, value] of Object.entries(iconMap)) {
    if (tagName.includes(key) || key.includes(tagName)) {
      return value;
    }
  }

  // 默认返回一个通用图标
  return "iconfont icon-dianshiji01";
};
// 工具函数
const utils = {
  // 生成订单号（年月日时分秒 + 随机数）
  generateOrderNo() {
    const now = new Date();
    const timeStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}${String(now.getDate()).padStart(2, "0")}${String(now.getHours()).padStart(
      2,
      "0"
    )}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(
      2,
      "0"
    )}`;
    const random = Math.floor(Math.random() * 100000000)
      .toString()
      .padStart(8, "0");
    return `${timeStr}${random}`;
  },

  // 生成随机金额
  generateAmount() {
    return (Math.random() * 9999 + 1).toFixed(2); // 1-10000元
  },
};

const handleBuy = async () => {
  let orderState = await paymentApi.getOrderNo({
    goodsId: 10,
    userId: 1,
    count: 1,
  });
  console.log("返回了什么", orderState);
  if (orderState.code !== 200) return alert("获取订单号失败：" + orderState.message);

  let paymentState = await paymentApi.payment({
    subject: "测试商品",
    totalAmount: utils.generateAmount(), // 随机金额
    outTradeNo: orderState.data.orderNo, // 随机订单号
  });
  console.log("返回了什么", paymentState);
  if (paymentState.code === 200) {
    // 跳转到支付宝支付页面
    window.location.href = paymentState.data;
  } else {
    alert("支付失败：" + paymentState.message);
  }
};
</script>

<style lang="scss" scoped>
.icon-select-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 16px;
  max-height: 400px;
  overflow-y: auto;
  padding: 10px;
}

.icon-select-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
  text-align: center;

  &:hover {
    border-color: #409eff;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
    transform: translateY(-2px);
  }

  &.icon-selected {
    border-color: #409eff;
    background-color: #f0f9ff;
    color: #409eff;
  }

  .iconfont {
    font-size: 24px;
    margin-bottom: 8px;
    color: #606266;
  }

  &:hover .iconfont {
    color: #409eff;
  }

  &.icon-selected .iconfont {
    color: #409eff;
  }

  span {
    font-size: 12px;
    color: #909399;
    word-break: break-all;
  }

  &.icon-selected span {
    color: #409eff;
  }
}

// 标签样式优化
.el-tag {
  display: inline-flex;
  align-items: center;

  .iconfont {
    font-size: 14px;
    margin-right: 4px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .icon-select-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 12px;
  }

  .icon-select-item {
    padding: 12px 6px;

    .iconfont {
      font-size: 20px;
    }

    span {
      font-size: 10px;
    }
  }
}
</style>
