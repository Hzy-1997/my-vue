<template>
  <div style="border: 1px solid #ccc">
    <Toolbar
      style="border-bottom: 1px solid #ccc"
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      :mode="editorMode"
    />
    <Editor
      style="height: 500px; overflow-y: hidden"
      v-model="valueHtml"
      :defaultConfig="editorConfig"
      :mode="editorMode"
      @onCreated="handleCreated"
    />
  </div>
</template>

<script setup>
import "@wangeditor/editor/dist/css/style.css"; // 引入 css
import { Editor, Toolbar } from "@wangeditor/editor-for-vue"; // 引入组件
import { SlateElement } from "@wangeditor/editor";
import { computed, onBeforeUnmount, ref, shallowRef, onMounted, watch } from "vue";
import { commonApi } from "../../api";
// 不需要导入commonApi，因为所有API调用都由父组件处理

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef();

// 内容 HTML - 使用父组件传入的初始值
const valueHtml = ref("");

// 编辑器图片列表
const editorImgList = ref([]);

const props = defineProps({
  // 编辑器初始内容
  modelValue: {
    type: String,
    default: "",
  },
  // 编辑器模式
  mode: {
    type: String,
    default: "edit",
  },
  // 编辑器配置
  uploadImageConfig: {
    type: Object,
    required: true,
  },
});

// 定义 emit 事件
const emit = defineEmits([
  "update:modelValue", // 更新内容
  "content-change", // 内容变化
  "upload-image", // 图片上传事件
  "delete-images", // 图片删除事件
]);

// 监听父组件传递的 modelValue 变化
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== undefined && newVal !== null) {
      valueHtml.value = newVal;
    }
  },
  { immediate: true }
);

const toolbarConfig = {};
const editorConfig = {
  placeholder: "请输入内容...",
};

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;

  // 移除事件监听
  editor.off("change", handleContentChange);
  editor.destroy();
});

// 编辑器创建完成后的回调
const handleCreated = (editor) => {
  editorRef.value = editor; // 记录 editor 实例，重要！
  // 添加内容变化监听
  editor.on("change", handleContentChange);
};

// 获取编辑器中的图片列表
const getImageList = (html) => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const images = doc.querySelectorAll("img");
    return Array.from(images).map((img) => img.src);
  } catch (error) {
    console.error("解析图片列表失败:", error);
    return [];
  }
};

// 当编辑器内容变化时，通知父组件
const handleContentChange = () => {
  try {
    if (editorRef.value) {
      const html = editorRef.value.getHtml();
      valueHtml.value = html;

      editorImgList.value = editorRef.value.getElemsByType("image");
      // // 获取当前编辑器中的图片列表
      // const newImageList = onUpdatedImage;
      // currentImages.value = newImageList;

      // 通知父组件内容变化
      emit("content-change", {
        content: html,
        // currentImages: newImageList,
        editorImgList: editorImgList.value,
      });

      // 更新v-model
      emit("update:modelValue", html);
    }
  } catch (error) {
    console.error("处理内容变化时出错:", error);
  }
};

// 将图片上传配置添加到 editorConfig
editorConfig.MENU_CONF = {
  ...editorConfig.MENU_CONF,
  uploadImage: {
    ...props.uploadImageConfig, // 传入父组件传入的配置
    timeout: 10 * 1000, // 限制上传超时时间为 10 秒
  },
};

// 编辑器模式现在通过 props 从父组件获取，并使用计算属性 editorMode
const editorMode = computed(() => props.mode);
</script>

<style lang="scss" scoped>
:deep(.w-e-text-container) {
  word-wrap: break-word;
  word-break: break-all;
  white-space: pre-wrap;
  overflow-wrap: break-word;
}

:deep(.w-e-text) {
  word-wrap: break-word;
  word-break: break-all;
  white-space: pre-wrap;
  overflow-wrap: break-word;

  min-height: 400px;
  min-width: 100%;

  padding: 10px 15px;

  font-size: 14px;
  line-height: 1.6;
}

:deep(.w-e-full-screen-container) {
  .w-e-text {
    word-wrap: break-word;
    word-break: break-all;
    white-space: pre-wrap;
    overflow-wrap: break-word;
  }
}
</style>
