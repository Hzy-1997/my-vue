<template>
  <div class="iconfont-demo">
    <div class="demo-header">
      <h1>图标字体展示</h1>
      <p>这是一个图标字体循环展示的示例页面</p>
    </div>

    <!-- 图标展示组件 -->
    <IconFont @selected="handleIconSelected" />

    <!-- 当前选中的图标信息 -->
    <div v-if="selectedIconInfo" class="selected-info">
      <h3>当前选中的图标：</h3>
      <div class="selected-details">
        <div class="selected-icon">
          <i :class="['iconfont', selectedIconInfo.className]"></i>
        </div>
        <div class="selected-text">
          <p><strong>名称：</strong>{{ selectedIconInfo.name }}</p>
          <p><strong>类名：</strong>{{ selectedIconInfo.className }}</p>
          <p><strong>Unicode：</strong>{{ selectedIconInfo.unicode }}</p>
        </div>
      </div>
    </div>

    <!-- 简单循环展示示例 -->
    <div class="simple-demo">
      <h3>简单循环展示（前10个图标）</h3>
      <div class="simple-grid">
        <div v-for="(icon, index) in firstTenIcons" :key="index" class="simple-icon">
          <i :class="['iconfont', icon.className]"></i>
          <span>{{ icon.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import IconFont from "../../components/IconFont/index.vue";
import { iconList } from "../../assets/iconfont/icons.js";

// 响应式数据
const selectedIconInfo = ref(null);

// 计算属性：获取前10个图标
const firstTenIcons = computed(() => {
  return iconList.slice(0, 10);
});

// 处理图标选择事件
const handleIconSelected = (icon) => {
  selectedIconInfo.value = icon;
  console.log("选中的图标：", icon);
};
</script>

<style scoped>
.iconfont-demo {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.demo-header {
  text-align: center;
  margin-bottom: 30px;
}

.demo-header h1 {
  color: #303133;
  margin-bottom: 10px;
}

.demo-header p {
  color: #909399;
  font-size: 14px;
}

.selected-info {
  margin: 30px 0;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.selected-info h3 {
  margin-bottom: 15px;
  color: #303133;
}

.selected-details {
  display: flex;
  align-items: center;
  gap: 20px;
}

.selected-icon .iconfont {
  font-size: 48px;
  color: #409eff;
}

.selected-text p {
  margin: 5px 0;
  color: #606266;
}

.selected-text strong {
  color: #303133;
}

.simple-demo {
  margin-top: 40px;
}

.simple-demo h3 {
  margin-bottom: 20px;
  color: #303133;
}

.simple-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 16px;
}

.simple-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fff;
  transition: all 0.3s ease;
}

.simple-icon:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.simple-icon .iconfont {
  font-size: 24px;
  color: #606266;
  margin-bottom: 8px;
}

.simple-icon span {
  font-size: 12px;
  color: #909399;
  text-align: center;
  word-break: break-all;
}

@media (max-width: 768px) {
  .simple-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 12px;
  }

  .selected-details {
    flex-direction: column;
    text-align: center;
  }
}
</style>
