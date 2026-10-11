<template>
  <div class="image-upload-container">
    <el-upload
      :file-list="fileList"
      :limit="limit"
      :action="imageUrl"
      list-type="picture-card"
      :on-preview="handlePictureCardPreview"
      :on-remove="handleRemove"
      :on-success="handleSuccess"
      :before-upload="beforeUpload"
      :on-error="handleUploadError"
      :class="{ 'upload-disabled': restriction }"
    >
      <el-icon><Plus /></el-icon>
    </el-upload>
    <div>
      <text style="color: red"> * </text>
      请上传大小不超过 <text style="color: red">{{ props.maxFileSize }}MB</text> 格式为
      <text style="color: red">jpeg,jpg,png</text> 的文件
    </div>
    <el-dialog
      v-model="dialogVisible"
      title="图片预览"
      :close-on-click-modal="true"
      width="80%"
    >
      <img :src="dialogImageUrl" alt="预览图片" style="width: 100%; height: auto" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { Plus } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import config from "../../config/index.js";
import { commonApi } from "../../api";

// 定义组件属性
const props = defineProps({
  // 兼容v-model
  modelValue: {
    type: [String, Object, Array],
    default: () => "",
  },
  // 图片数量限制
  limit: {
    type: [String, Number],
    default: 5,
  },
  // 图片格式限制
  fileTypes: {
    type: Array,
    default: () => ["image/jpeg", "image/png", "image/jpg"],
  },
  // 图片大小限制（单位：MB）
  maxFileSize: {
    type: Number,
    default: 3,
  },
});

// 定义事件
const emit = defineEmits(["update:modelValue", "error", "success"]);

// 计算属性：最大文件大小（字节）
const maxSizeInBytes = computed(() => props.maxFileSize * 1024 * 1024);

// 阿里云OSS基础URL
const ossBaseUrl = "https://hezhaoyu.oss-cn-hangzhou.aliyuncs.com";
// 上传接口地址
const imageUrl = ref(config.baseApi + "/public/uploadImg");

// 响应式数据
const fileList = ref([]);
const dialogImageUrl = ref("");
const dialogVisible = ref(false);
const restriction = ref(false);
const uploadList = ref([]);

/**
 * 处理图片URL，确保包含完整路径
 * @param {string} path - 图片路径
 * @returns {string} - 完整的图片URL
 */
const ensureFullUrl = (path) => {
  //确保path是字符串
  if (typeof path !== "string") {
    return "";
  }
  return path.indexOf(ossBaseUrl) === -1 ? ossBaseUrl + path : path;
};

/**
 * 更新上传限制状态
 */
const updateRestrictionStatus = () => {
  restriction.value = fileList.value.length >= Number(props.limit);
};

/**
 * 规范化图片数据为标准格式
 * @param {any} value - 输入的图片数据
 * @returns {Array} - 规范化后的图片数据数组
 */
const normalizeImageData = (value) => {
  if (!value) return [];
  // 转换为数组
  const arr = Array.isArray(value) ? value : value.split(",");
  // 过滤空字符串并转换为标准格式
  return arr
    .filter((item) => (typeof item === "string" ? item.trim().length > 0 : true))
    .map((item) => {
      if (typeof item === "string") {
        const fullUrl = ensureFullUrl(item);
        return { name: fullUrl, url: fullUrl };
      } else if (item && typeof item === "object" && item.url) {
        return {
          name: ensureFullUrl(item.name || item.url),
          url: ensureFullUrl(item.url),
        };
      }
      return null; // 过滤无效数据
    })
    .filter(Boolean); // 移除null值
};

// 监听modelValue变化，更新文件列表
watch(
  () => props.modelValue,
  (value) => {
    fileList.value = normalizeImageData(value);
    updateRestrictionStatus();
  },
  {
    deep: true,
    immediate: true,
  }
);

/**
 * 单个删除图片处理
 */
const handleRemove = async (uploadFile, uploadFiles) => {
  try {
    // 防御性检查
    if (!uploadFile || !uploadFile.url) {
      ElMessage.warning("删除失败：无效的文件信息");
      return;
    }

    // 提取OSS路径
    const ossPath = uploadFile.url.split("aliyuncs.com")[1];
    if (!ossPath) {
      ElMessage.warning("删除失败：无法识别的文件路径");
      return;
    }

    // 调用删除图片接口
    const res = await commonApi.deleteImg({
      deleteImageList: [ossPath],
    });

    if (res && res.code === 200) {
      fileList.value = uploadFiles;
      emit("update:modelValue", uploadFiles);
      updateRestrictionStatus();
      ElMessage.success("图片删除成功");
      emit("success", { type: "delete", file: uploadFile });
    } else {
      const errorMsg = res?.message || "删除失败：服务器错误";
      ElMessage.error(errorMsg);
      emit("error", { type: "delete", error: errorMsg, file: uploadFile });
    }
  } catch (error) {
    ElMessage.error("删除图片时发生错误");
    emit("error", { type: "delete", error: error.message, file: uploadFile });
  }
};

/**
 * 放大图片预览
 */
const handlePictureCardPreview = (uploadFile) => {
  if (uploadFile && uploadFile.url) {
    dialogImageUrl.value = uploadFile.url;
    dialogVisible.value = true;
  }
};

/**
 * 上传前处理 - 添加图片验证逻辑
 */
const beforeUpload = (file) => {
  // 验证文件类型
  if (!props.fileTypes.includes(file.type)) {
    ElMessage.error(
      `不支持的文件格式，请上传 ${props.fileTypes
        .map((type) => type.split("/")[1].toUpperCase())
        .join(", ")} 格式的图片`
    );
    return false;
  }

  // 验证文件大小
  if (file.size > maxSizeInBytes.value) {
    ElMessage.error(`文件大小不能超过 ${props.maxFileSize}MB`);
    return false;
  }

  return true;
};

/**
 * 上传成功处理
 */
const handleSuccess = (response, uploadFile) => {
  try {
    if (response && response.code === 200 && uploadFile?.response?.data?.imgRoute) {
      ElMessage.success("图片上传成功");

      // 添加新上传的图片到上传列表
      uploadList.value.push({
        name: "/" + uploadFile.response.data.imgRoute,
        url: "/" + uploadFile.response.data.imgRoute,
      });

      uploadedSuccessfully();
      emit("success", { type: "upload", file: uploadFile });
    } else {
      const errorMsg = response?.message || "上传失败：无效的响应数据";
      ElMessage.error(errorMsg);
      emit("error", { type: "upload", error: errorMsg, file: uploadFile });
    }
  } catch (error) {
    ElMessage.error("处理上传响应时发生错误");
    emit("error", { type: "upload", error: error.message, file: uploadFile });
  }
};

/**
 * 上传失败处理
 */
const handleUploadError = (error, uploadFile) => {
  ElMessage.error("上传失败，请重试");
  emit("error", { type: "upload", error: error.message || "网络错误", file: uploadFile });
};

/**
 * 上传结束处理
 */
const uploadedSuccessfully = () => {
  try {
    // 确保uploadList中的每个图片路径都包含完整URL
    const formattedUploadList = uploadList.value.map((item) => ({
      name: ensureFullUrl(item.name),
      url: ensureFullUrl(item.url),
    }));

    // 合并文件列表
    fileList.value = fileList.value.concat(formattedUploadList);
    uploadList.value = []; // 清空上传列表

    // 通知父组件更新
    emit("update:modelValue", fileList.value);

    // 更新限制状态
    updateRestrictionStatus();
  } catch (error) {
    console.error("上传后处理失败:", error);
  }
};
</script>

<style lang="scss" scoped>
.image-upload-container {
  width: 100%;
}

// 当达到上传限制时隐藏上传按钮
:deep(.upload-disabled .el-upload--picture-card) {
  display: none;
}

// 优化预览图样式
:deep(.el-upload-list__item) {
  overflow: hidden;
}

:deep(.el-upload-list__item-thumbnail) {
  object-fit: cover;
}
</style>
