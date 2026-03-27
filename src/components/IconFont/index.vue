<template>
  <div>
    <div class="flex gap-2">
      <el-tag
        v-for="tag in dynamicTags"
        :key="tag.id"
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
      <el-input
        v-if="inputVisible"
        ref="InputRef"
        v-model="inputValue"
        class="w-20"
        size="small"
        @keyup.enter="handleInputConfirm"
      />
      <el-button v-else class="button-new-tag" size="small" @click="showInput">
        + 酒店标签
      </el-button>
    </div>

    <el-dialog title="图标选择" v-model="dialogVisible" width="30%">
      <div class="icon-select-grid">
        <div
          v-for="icon in icons"
          :key="icon.className"
          :class="[
            'icon-select-item',
            { 'icon-selected': selectedIconClass.className === icon.className },
          ]"
          @click="selectIcon(icon)"
        >
          <i :class="['iconfont', icon.className]"></i>
          <span>{{ icon.name }}</span>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmIconSelection">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, nextTick, computed, watch } from "vue";

const dialogVisible = ref(false);
const inputVisible = ref(false);
const inputValue = ref("");
const dynamicTags = ref([]);

const selectedIconClass = ref(""); // 添加一个用于存储选中图标类名的变量
const InputRef = ref(null); // 添加一个用于存储输入框引用的变量

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  icons: {
    type: Array,
    default: () => [
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
      { name: "禁止吸烟", className: "icon-a-474" },
      { name: "滑雪", className: "icon-huaxue" },
      { name: "营地汤池", className: "icon-a-yingditangchi" },
      { name: "课程", className: "icon-kecheng" },
      { name: "车站接送", className: "icon-taxi-bus" },
    ],
  },
});
const emit = defineEmits(["update:modelValue"]);

// 监听外部传入的modelValue变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && Array.isArray(newValue)) {
      dynamicTags.value = [...newValue];
    }
  },
  { immediate: true, deep: true }
);

// 图标列表
const showInput = () => {
  dialogVisible.value = true;
};

// 添加到标签展示
const handleInputConfirm = () => {
  if (inputValue.value) {
    const newTag = {
      id: Date.now(), //唯一ID
      text: inputValue.value,
      iconClass: `iconfont ${selectedIconClass.value.className}`,
    };
    dynamicTags.value.push(newTag);
    inputValue.value = "";
    inputVisible.value = false;
    selectedIconClass.value = "";
  }
  emit("update:modelValue", dynamicTags.value);
};

// 点击图标
const selectIcon = (icon) => {
  selectedIconClass.value = icon;
};

// 确认图标选择
const confirmIconSelection = () => {
  if (!selectedIconClass.value) {
    ElMessage.error("请选择图标");
    return;
  }
  dialogVisible.value = false;
  inputVisible.value = true;
  // 设置输入框的占位符为选中的图标名称
  inputValue.value = selectedIconClass.value.name;

  nextTick(() => {
    if (InputRef.value && InputRef.value.input) {
      InputRef.value.input.focus();
      // 选中文本以便直接修改
      InputRef.value.input.select();
    }
  });
  
};

// 删除标签
const handleClose = (tag) => {
  if (typeof tag === "object") {
    console.log(123);
    const index = dynamicTags.value.findIndex((t) => t.id === tag.id);
    if (index !== -1) {
      dynamicTags.value.splice(index, 1);
    }
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
    background: #f5f7fa;
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
</style>
