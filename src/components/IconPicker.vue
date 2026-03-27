<template>
  <div class="icon-picker">
    <!-- 搜索框 -->
    <div class="search-section">
      <el-input
        v-model="searchText"
        placeholder="搜索图标..."
        clearable
        prefix-icon="Search"
        class="search-input"
        @input="handleSearch"
      />
      <div class="icon-count">共 {{ filteredIcons.length }} 个图标</div>
    </div>

    <!-- 图标展示区域 -->
    <div class="icons-section">
      <div
        v-for="icon in filteredIcons"
        :key="icon.class"
        class="icon-card"
        :class="{
          selected: selectedIcon === icon.class,
          hover: hoverIcon === icon.class,
        }"
        @click="handleIconSelect(icon)"
        @mouseenter="hoverIcon = icon.class"
        @mouseleave="hoverIcon = ''"
        :title="icon.name"
      >
        <div class="icon-display">
          <span :class="['iconfont', icon.class]"></span>
        </div>
        <div class="icon-info">
          <span class="icon-name">{{ icon.displayName || icon.name }}</span>
          <span class="icon-class">{{ icon.class }}</span>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredIcons.length === 0" class="empty-state">
      <div class="empty-icon">🔍</div>
      <div class="empty-text">未找到匹配的图标</div>
    </div>

    <!-- 底部操作 -->
    <div class="footer-section" v-if="selectedIcon">
      <div class="selection-info">
        <span>已选择: </span>
        <span :class="['iconfont', selectedIcon]"></span>
        <span class="selected-name">{{ getSelectedIconName() }}</span>
      </div>
      <div class="action-buttons">
        <el-button @click="handleConfirm" type="primary">确认选择</el-button>
        <el-button @click="handleCancel">取消</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import IconExtractor from "../utils/IconExtractor";

// 引入Element Plus组件（如果使用）
import { ElInput, ElButton } from "element-plus";

// Props
const props = defineProps({
  // 是否启用自动提取
  autoExtract: {
    type: Boolean,
    default: true,
  },
  // 预设的图标列表
  presetIcons: {
    type: Array,
    default: () => [],
  },
});

// Emits
const emit = defineEmits(["select", "confirm", "cancel"]);

// 响应式数据
const searchText = ref("");
const selectedIcon = ref("");
const hoverIcon = ref("");
const iconList = ref([]);
const loading = ref(false);

// 计算属性：过滤后的图标列表
const filteredIcons = computed(() => {
  if (!searchText.value.trim()) {
    return iconList.value;
  }

  const searchLower = searchText.value.toLowerCase();
  return iconList.value.filter(
    (icon) =>
      icon.name.toLowerCase().includes(searchLower) ||
      icon.class.toLowerCase().includes(searchLower) ||
      (icon.displayName && icon.displayName.toLowerCase().includes(searchLower))
  );
});

// 方法：处理搜索
const handleSearch = () => {
  // 搜索逻辑已通过计算属性处理
};

// 方法：处理图标选择
const handleIconSelect = (icon) => {
  selectedIcon.value = icon.class;
  emit("select", icon);
};

// 方法：获取选中图标的名称
const getSelectedIconName = () => {
  const icon = iconList.value.find((i) => i.class === selectedIcon.value);
  return icon ? icon.displayName || icon.name : "";
};

// 方法：确认选择
const handleConfirm = () => {
  if (selectedIcon.value) {
    const icon = iconList.value.find((i) => i.class === selectedIcon.value);
    emit("confirm", icon);
  }
};

// 方法：取消选择
const handleCancel = () => {
  selectedIcon.value = "";
  emit("cancel");
};

// 方法：加载图标列表
const loadIcons = async () => {
  loading.value = true;

  try {
    if (props.autoExtract) {
      // 尝试自动提取
      const extractedIcons = IconExtractor.getIconList();
      if (extractedIcons.length > 0) {
        iconList.value = extractedIcons;
      } else {
        // 自动提取失败，使用手动列表
        iconList.value = IconExtractor.getManualIconList();
      }
    } else if (props.presetIcons.length > 0) {
      // 使用预设列表
      iconList.value = props.presetIcons;
    } else {
      // 使用手动列表
      iconList.value = IconExtractor.getManualIconList();
    }

    console.log("加载图标数量:", iconList.value.length);
  } catch (error) {
    console.error("加载图标失败:", error);
    // 使用手动列表作为备用
    iconList.value = IconExtractor.getManualIconList();
  } finally {
    loading.value = false;
  }
};

// 生命周期
onMounted(() => {
  loadIcons();
});

// 暴露方法给父组件
defineExpose({
  reloadIcons: loadIcons,
  getSelectedIcon: () => selectedIcon.value,
  clearSelection: () => {
    selectedIcon.value = "";
  },
});
</script>

<style scoped>
.icon-picker {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.search-section {
  padding: 20px;
  border-bottom: 1px solid #ebeef5;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-input {
  flex: 1;
}

.icon-count {
  color: #909399;
  font-size: 14px;
  white-space: nowrap;
}

.icons-section {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  padding: 20px;
  max-height: 400px;
  overflow-y: auto;
}

.icon-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
  text-align: center;
}

.icon-card:hover {
  border-color: #409eff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.icon-card.selected {
  border-color: #409eff;
  background-color: #ecf5ff;
  transform: scale(1.05);
}

.icon-display {
  margin-bottom: 8px;
}

.iconfont {
  font-size: 32px;
  color: #606266;
  display: block;
}

.icon-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.icon-name {
  font-size: 12px;
  color: #303133;
  font-weight: 500;
  line-height: 1.2;
}

.icon-class {
  font-size: 10px;
  color: #909399;
  font-family: "Courier New", monospace;
  word-break: break-all;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
  color: #909399;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 14px;
}

.footer-section {
  padding: 16px 20px;
  border-top: 1px solid #ebeef5;
  background: #f5f7fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selection-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #303133;
}

.selection-info .iconfont {
  font-size: 20px;
}

.selected-name {
  font-weight: 500;
  color: #409eff;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .icons-section {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 12px;
    padding: 16px;
  }

  .search-section {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .footer-section {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .action-buttons {
    justify-content: flex-end;
  }
}
</style>
