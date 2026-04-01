<!--
 * @描述: 
 * @版本: 
 * @作者: 
 * @日期: ${year}-${month}-${day}
 * @最后编辑者: sueRimn
 * @最后编辑时间: ${year}-${month}-${day} ${hour}:${minute}:${second}
-->
<template>
  <div class="pagination-container">
    <el-pagination
      background
      layout="prev, pager, next"
      :total="pagination.total"
      :page-size="pagination.pageSize"
      :current-page="pagination.currentPage"
      size="small"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    />
    <span>共 {{ pagination.total }} 条</span>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  pagination: {
    type: Object,
    default: () => {
      return {
        total: 0,
        pageSize: 10,
        currentPage: 1,
      };
    },
  },
});

const emit = defineEmits(["handleCurrentChange", "handleSizeChange"]);

const handleCurrentChange = (val) => {
  emit("handleCurrentChange", val);
};

const handleSizeChange = (val) => {
  emit("handleSizeChange", val);
};
</script>

<style lang="scss" scoped>
.pagination-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
  span {
    margin-left: 10px;
    color: #7b7f8c;
  }
}
</style>
