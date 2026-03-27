// 这是一个修复treemenu组件与面包屑联动问题的辅助文件
// 使用方法：在treemenu.vue组件中引入此文件

import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";

export function useMenuSync() {
  const route = useRoute();
  // 创建响应式的activeIndex
  const activeIndex = ref(location.pathname.substring(1));
  
  // 监听路由变化，更新activeIndex
  watch(() => route.path, (newPath) => {
    // 处理首页路径
    if (newPath === '/') {
      activeIndex.value = ''; // 首页的index是空字符串
    } else {
      activeIndex.value = newPath.substring(1);
    }
    console.log('路由变化，更新activeIndex:', activeIndex.value);
  }, { immediate: true });
  
  return {
    activeIndex
  };
}