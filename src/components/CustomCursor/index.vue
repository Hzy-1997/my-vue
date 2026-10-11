<template>
  <div v-if="showCursor" class="custom-cursor" :style="customCursorStyle">
    <img src="../../assets/image/mouseImg.png" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";

// ============ Props ============
const props = defineProps({
  showDebug: {
    type: Boolean,
    default: false,
  },
  offsetX: {
    type: Number,
    default: -16,
  },
  offsetY: {
    type: Number,
    default: -16,
  },
  // 自定义光标图片路径
  cursorImage: {
    type: String,
    default: "../../assets/image/mouseImg.png",
  },
  // 悬停时的光标图片
  cursorHoverImage: {
    type: String,
    default: "../../assets/image/mouseImg.png",
  },
});

// ============ 状态 ============
const mouseX = ref(0);
const mouseY = ref(0);
const hoverElement = ref(null);
const cursorState = ref("default");
const showCursor = ref(true);

// ============ 方法 ============
// 获取光标图片路径（Vite 方式）
const getCursorImage = (state) => {
  const imageMap = {
    default: props.cursorImage,
    hover: props.cursorHoverImage,
    click: props.cursorHoverImage,
    text: props.cursorImage,
  };

  const imagePath = imageMap[state] || imageMap.default;

  // 处理 Vite 路径
  if (imagePath.startsWith("@/")) {
    const filename = imagePath.replace("@/assets/cursors/", "");
    return new URL(`../assets/cursors/${filename}`, import.meta.url).href;
  }
  return imagePath;
};

// 更新鼠标位置
const updateMousePosition = (e) => {
  mouseX.value = e.clientX;
  mouseY.value = e.clientY;

  // 检测悬停元素
  const element = document.elementFromPoint(e.clientX, e.clientY);
  hoverElement.value = element;

  // 根据元素类型改变光标样式
  if (element) {
    const isClickable = element.matches(
      'button, a, [role="button"], [onclick], .clickable'
    );
    const isInput = element.matches("input, textarea, select");
    const isDraggable = element.matches('.draggable, [draggable="true"]');

    if (isClickable) {
      cursorState.value = "hover";
    } else if (isInput) {
      cursorState.value = "text";
    } else if (isDraggable) {
      cursorState.value = "grab";
    } else {
      cursorState.value = "default";
    }
  }
};

// 鼠标按下
const handleMouseDown = () => {
  cursorState.value = "click";
};

// 鼠标松开
const handleMouseUp = () => {
  cursorState.value = "default";
  if (hoverElement.value) {
    const isClickable = hoverElement.value.matches('button, a, [role="button"]');
    if (isClickable) {
      cursorState.value = "hover";
    }
  }
};

// ============ 计算属性 ============
const customCursorStyle = computed(() => {
  const imageUrl = getCursorImage(cursorState.value);
  return {
    left: `${mouseX.value + props.offsetX}px`,
    top: `${mouseY.value + props.offsetY}px`,
    backgroundImage: `url('${imageUrl}')`,
    display: showCursor.value ? "block" : "none",
  };
});

// ============ 生命周期 ============
onMounted(() => {
  // 隐藏默认光标
  document.body.style.cursor = "none";

  // 绑定事件
  document.addEventListener("mousemove", updateMousePosition);
  document.addEventListener("mousedown", handleMouseDown);
  document.addEventListener("mouseup", handleMouseUp);

  console.log("✅ 自定义光标已启动");
});

onUnmounted(() => {
  // 恢复默认光标
  document.body.style.cursor = "";

  // 移除事件
  document.removeEventListener("mousemove", updateMousePosition);
  document.removeEventListener("mousedown", handleMouseDown);
  document.removeEventListener("mouseup", handleMouseUp);

  console.log("✅ 自定义光标已销毁");
});

// ============ 暴露方法 ============
// defineExpose({
//   showCursor,
//   mouseX,
//   mouseY,
//   hoverElement,
//   cursorState,
//   setCursorImage: getCursorImage,
// });
</script>

<style scoped>
.custom-cursor {
  position: fixed;
  pointer-events: none;
  z-index: 99999;
  width: 32px;
  height: 32px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  transition: none;
  will-change: transform;
  transform: translate(0, 0);
  background-color: red;
}

/* 调试信息 */
.cursor-debug {
  position: fixed;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.85);
  color: #00ff00;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-family: "Courier New", monospace;
  z-index: 999999;
  pointer-events: none;
  min-width: 180px;
  border: 1px solid rgba(0, 255, 0, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.cursor-debug div {
  margin: 4px 0;
  line-height: 1.6;
}

.cursor-debug .label {
  color: #888;
}

.cursor-debug .value {
  color: #00ff00;
  font-weight: bold;
}

/* 动画 */
@keyframes pulse {
  0%,
  100% {
    opacity: 0.3;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1.2);
  }
}
</style>
