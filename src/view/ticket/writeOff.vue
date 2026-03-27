<!--  -->
<template>
  <div>
    <RichTextEditor
      v-model="editorContent"
      :uploadImageConfig="{
        customUpload: handleImageUpload,
      }"
      :mode="editMode"
      @content-change="handleContentChange"
    />
    <button @click="handleSave">删除</button>
  </div>
</template>

<script setup>
//  :customUpload="customUpload"
import RichTextEditor from "../service/strategy.vue";
import { commonApi } from "../../api";

import { ref } from "vue";

// 编辑器模式
const editMode = ref("edit");
// 编辑器内容
const editorContent = ref("nihao");
// 初始图片列表
const initialImages = ref([]);
// 保留的图片列表
const retainedImages = ref([]);

// 处理图片上传
const handleImageUpload = async (file, insertFn) => {
  console.log("上传图片:", file);
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
    console.error("上传图片时出错:", error);
    alert("上传图片失败，请重试");
  }
};

const handleContentChange = (data) => {
  console.log("编辑器内容:", data.content);
  console.log("当前图片:", data.editorImgList);
  editorContent.value = data.content;
  retainedImages.value = data.editorImgList;
};

// 处理提交
const handleSave = (data) => {
  console.log("编辑器内容:", data.content);
  console.log("当前图片:", data.editorImgList);
};
</script>

<style lang="scss" scoped></style>
