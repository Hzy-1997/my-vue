<!--
 * @描述: 
 * @版本: 
 * @作者: 
 * @日期: ${year}-${month}-${day}
 * @最后编辑者: sueRimn
 * @最后编辑时间: ${year}-${month}-${day} ${hour}:${minute}:${second}
-->

<template>
  <div>座位管理</div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";

import { ticketingApi } from "../../api/index.js";

let form = ref({
  seatName: "测试",
  seatNumber: "123",
  status: 1,
  createBy: "",
  total: 100,
  disable: 0,
  rows: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  cols: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  seats: [
    {
      row: 1,
      col: 1,
      status: 1,
    },
  ],
  blockedSeats: [
    {
      row: 1,
      col: 2,
    },
  ],
});

// -----------------函---数 ----------------------

onMounted(() => {
  getSeatList();
});

//创建座位
const createSeat = async () => {
  let data = {
    action: "create",
    ...form.value,
  };

  let res = ticketingApi.seatManage(data);

  if (res.code == 200) {
    ElMessage({
      message: res.message,
      type: "success",
    });
  }
};

// 获取座位列表

const getSeatList = async () => {
  let form = {
    seatName: "",
  };
  let res = await ticketingApi.getSeatList(form);
  console.log(res);
};
</script>

<style lang="scss" scoped></style>
