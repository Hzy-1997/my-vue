<template>
  <!-- 自定义光标组件 - 放在最外层 -->
  <CustomCursor :show-debug="false" :offset-x="-16" :offset-y="-16" />

  <!-- 路由视图 -->
  <router-view></router-view>
</template>

<script setup>
// import CustomCursor from "../src/components/CustomCursor/index.vue";
</script>

<style lang="scss">
@use "./assets/style/index" as *;

// * {
//   cursor: none !important;
// }
</style>
