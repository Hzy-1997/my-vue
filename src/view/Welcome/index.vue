<template>
  <div class="dashboard-container">
    <!-- 数据汇总区域 -->
    <div class="summary-section">
      <div class="section-header">
        <h2>园区数据</h2>
        <el-select
          v-model="summaryFilter"
          placeholder="全部"
          size="small"
          style="width: 120px"
        >
          <el-option label="全部" value="all"></el-option>
          <el-option label="今日" value="today"></el-option>
          <el-option label="本月" value="month"></el-option>
        </el-select>
      </div>
      <div class="summary-cards">
        <!-- 我的排名 -->
        <div class="summary-card">
          <div class="card-icon user-icon">
            <el-icon><User /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-number">12</div>
            <div class="card-label">入园人数</div>
            <!-- <div class="progress-bar">
              <div class="progress-fill" style="width: 20%"></div>
            </div>
            <div class="progress-text">20%</div> -->
          </div>
        </div>

        <!-- 审批订单 -->
        <div class="summary-card">
          <div class="card-icon doc-icon">
            <el-icon><User /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-number">19</div>
            <div class="card-label">出园人数</div>
            <!-- <div class="progress-bar">
              <div class="progress-fill" style="width: 16%"></div>
            </div>
            <div class="progress-text">16%</div> -->
          </div>
        </div>

        <!-- 成功订单 -->
        <div class="summary-card">
          <div class="card-icon success-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-number">18</div>
            <div class="card-label">售票</div>
            <!-- <div class="progress-bar">
              <div class="progress-fill" style="width: 90%"></div>
            </div>
            <div class="progress-text">90%</div> -->
          </div>
        </div>

        <!-- 失败订单 -->
        <div class="summary-card">
          <div class="card-icon fail-icon">
            <el-icon><DocumentDelete /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-number">3</div>
            <div class="card-label">失败订单</div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 10%"></div>
            </div>
            <div class="progress-text">10%</div>
          </div>
        </div>

        <!-- 逾期订单 -->
        <div class="summary-card">
          <div class="card-icon overdue-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-number">0</div>
            <div class="card-label">逾期订单</div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 10%"></div>
            </div>
            <div class="progress-text">10%</div>
          </div>
        </div>

        <!-- 放款金额 -->
        <div class="summary-card">
          <div class="card-icon money-icon">
            <el-icon><Money /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-number">18</div>
            <div class="card-label">待处理客诉</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 待处理订单区域 -->
    <div class="pending-section">
      <div class="section-header">
        <h2>订单数据展示</h2>
      </div>
      <div class="pending-cards">
        <!-- 待审核订单 -->
        <div class="purple">
          <div ref="ticketing" style="min-width: 500px; height: 400px"></div>
        </div>

        <!-- 待上传服务单 -->
        <div class="pending-card red">
          <div>
            <div class="card-count">票务订单状态</div>
            <div class="card-count">待处理的订单数 8 个</div>
            <div class="card-count">处理中的订单数 8 个</div>
            <div class="card-count">已完成订单数 8 个</div>
            <div class="card-count">失败订单数 8 个</div>
          </div>
          <div>
            <div class="card-count">支付状态</div>
            <div class="card-count">已完成订单数 8 个</div>
            <div class="card-count">失败订单数 8 个</div>
          </div>
        </div>

        <!-- 待审核订单 -->
        <div class="purple">
          <div ref="hotel" style="min-width: 500px; height: 400px"></div>
        </div>
        <!-- 申请结算订单 -->
        <div class="pending-card cyan">
          <div>
            <div class="card-count">酒店订单状态</div>
            <div class="card-count">待处理的订单数 8 个</div>
            <div class="card-count">处理中的订单数 8 个</div>
            <div class="card-count">已完成订单数 8 个</div>
            <div class="card-count">失败订单数 8 个</div>
          </div>
          <div>
            <div class="card-count">支付状态</div>
            <div class="card-count">已完成订单数 8 个</div>
            <div class="card-count">失败订单数 8 个</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import * as echarts from "echarts";

import {
  User,
  Document,
  DocumentChecked,
  DocumentDelete,
  Money,
  ArrowRight,
} from "@element-plus/icons-vue";

// 筛选器数据
const summaryFilter = ref("all");

// 获取 DOM 元素的引用
const ticketing = ref(null);
const hotel = ref(null);
let myChart = null; // 用于保存图表实例
let myChart1 = null; // 用于保存图表实例
let dataTimer = null; // 用于保存定时器（票务图表）
let dataTimer1 = null; // 用于保存定时器（酒店图表）

// 生成随机数据的函数
const generateRandomData = () => {
  return [
    {
      value: Math.floor(Math.random() * 1500) + 500,
      name: `待支付：${Math.floor(Math.random() * 1500) + 500}单`,
    },
    {
      value: Math.floor(Math.random() * 1000) + 300,
      name: `待核销：${Math.floor(Math.random() * 1000) + 300}单`,
    },
    {
      value: Math.floor(Math.random() * 800) + 200,
      name: `已取消：${Math.floor(Math.random() * 800) + 200}单`,
    },
    {
      value: Math.floor(Math.random() * 700) + 200,
      name: `已完成：${Math.floor(Math.random() * 700) + 200}单`,
    },
    {
      value: Math.floor(Math.random() * 500) + 100,
      name: `已退款${Math.floor(Math.random() * 500) + 100}单`,
    },
  ];
};

// 更新图表数据
const updateChartData = () => {
  if (myChart && !myChart.isDisposed()) {
    const newData = generateRandomData();
    myChart.setOption({
      series: [
        {
          data: newData,
        },
      ],
    });
  }
  if (myChart1 && !myChart1.isDisposed()) {
    const newData = generateRandomData();
    myChart1.setOption({
      series: [
        {
          data: newData,
        },
      ],
    });
  }
};

onMounted(() => {
  // 确保容器存在
  if (ticketing.value) {
    // 初始化 echarts 实例
    myChart = echarts.init(ticketing.value);

    // 你的图表配置
    const option = {
      title: {
        text: "票务订单状态",
        // subtext: "Fake Data",
        left: "center",
      },
      tooltip: {
        trigger: "item",
      },
      legend: {},
      series: [
        {
          name: "票务订单状态",
          type: "pie",
          radius: "50%",
          // 订单状态：1-待支付，2-待核销，3-已取消，4-已完成，5-已退款
          data: generateRandomData(),
          emphasis: {
            // 鼠标悬停时的样式
            itemStyle: {
              // 鼠标悬停时的样式
              shadowBlur: 10, // 鼠标悬停时的阴影模糊度
              shadowOffsetX: 0, // 鼠标悬停时的阴影水平偏移量
              shadowOffsetY: 0, // 鼠标悬停时的阴影垂直偏移量
              shadowColor: "rgba(0, 0, 0, 0.5)", // 鼠标悬停时的阴影颜色
            },
          },
        },
      ],
    };

    // 你的图表配置
    const option1 = {
      title: {
        text: "票务订单状态",
        // subtext: "Fake Data",
        left: "center",
      },
      tooltip: {
        trigger: "item",
      },
      legend: {},
      series: [
        {
          name: "票务订单状态",
          type: "pie",
          radius: "50%",
          // 订单状态：1-待支付，2-待核销，3-已取消，4-已完成，5-已退款
          data: generateRandomData(),
          emphasis: {
            // 鼠标悬停时的样式
            itemStyle: {
              // 鼠标悬停时的样式
              shadowBlur: 10, // 鼠标悬停时的阴影模糊度
              shadowOffsetX: 0, // 鼠标悬停时的阴影水平偏移量
              shadowOffsetY: 0, // 鼠标悬停时的阴影垂直偏移量
              shadowColor: "rgba(0, 0, 0, 0.5)", // 鼠标悬停时的阴影颜色
            },
          },
        },
      ],
    };

    // 显示图表
    myChart.setOption(option);

    // 设置定时器，每5秒更新一次数据
    dataTimer = setInterval(updateChartData, 5000);

    // 【可选】让图表跟随窗口大小变化而自适应
    window.addEventListener("resize", () => {
      myChart.resize();
    });
  }

  if (hotel.value) {
    // 初始化 echarts 实例
    myChart1 = echarts.init(hotel.value);

    // 你的图表配置
    const option1 = {
      title: {
        text: "酒店订单状态",
        // subtext: "Fake Data",
        left: "center",
      },
      tooltip: {
        trigger: "item",
      },
      legend: {},
      series: [
        {
          name: "酒店订单状态",
          type: "pie",
          radius: "50%",
          // 订单状态：1-待支付，2-待核销，3-已取消，4-已完成，5-已退款
          data: generateRandomData(),
          emphasis: {
            // 鼠标悬停时的样式
            itemStyle: {
              // 鼠标悬停时的样式
              shadowBlur: 10, // 鼠标悬停时的阴影模糊度
              shadowOffsetX: 0, // 鼠标悬停时的阴影水平偏移量
              shadowOffsetY: 0, // 鼠标悬停时的阴影垂直偏移量
              shadowColor: "rgba(0, 0, 0, 0.5)", // 鼠标悬停时的阴影颜色
            },
          },
        },
      ],
    };

    myChart1.setOption(option1);

    // 设置定时器，每1分钟更新一次数据
    dataTimer1 = setInterval(updateChartData, 60000);

    // 【可选】让图表跟随窗口大小变化而自适应
    window.addEventListener("resize", () => {
      myChart1.resize();
    });
  }
});

// 组件卸载时清理定时器
onUnmounted(() => {
  if (dataTimer) {
    clearInterval(dataTimer);
  }
  if (dataTimer1) {
    clearInterval(dataTimer1);
  }
  if (myChart) {
    myChart.dispose();
  }
  if (myChart1) {
    myChart1.dispose();
  }
});
</script>
<style lang="scss" scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  h2 {
    font-size: 22px;
    font-weight: 600;
    color: #303133;
    margin: 0;
  }
}

.summary-section {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  transition: all 0.3s;
  &:hover {
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.08);
  }

  .card-icon {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    color: #ffffff;
    flex-shrink: 0;
  }

  .user-icon {
    background-color: #b185f0;
  }
  .doc-icon {
    background-color: #b185f0;
  }
  .success-icon {
    background-color: #b185f0;
  }
  .fail-icon {
    background-color: #b185f0;
  }
  .overdue-icon {
    background-color: #b185f0;
  }
  .money-icon {
    background-color: #b185f0;
  }

  .card-content {
    flex: 1;
    .card-number {
      font-size: 26px;
      font-weight: 700;
      color: #303133;
      margin-bottom: 4px;
    }
    .card-label {
      font-size: 16px;
      color: #606266;
      margin-bottom: 12px;
    }
    .progress-bar {
      width: 100%;
      height: 6px;
      background-color: #f0f0f0;
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 6px;
      .progress-fill {
        height: 100%;
        background-color: #b185f0;
        border-radius: 3px;
        transition: width 0.3s;
      }
    }
    .progress-text {
      font-size: 14px;
      color: #606266;
    }
  }
}

.pending-section {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.pending-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.pending-card {
  border-radius: 8px;
  padding: 24px 20px;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: flex-start;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  .card-title {
    font-size: 18px;
    font-weight: 500;
    margin-bottom: 12px;
  }

  .card-title {
    font-size: 20px;
    font-weight: 500;
    margin-bottom: 12px;
  }
  .card-count {
    margin-bottom: 8px;
  }
  .card-amount {
    font-size: 18px;
    margin-bottom: 20px;
    opacity: 0.95;
  }
  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 16px;
    font-weight: 500;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
  }

  &.red {
    background: linear-gradient(135deg, #0ca8df 0%, #0ca8df 100%);
  }

  &.cyan {
    background: linear-gradient(135deg, #36d9c6 0%, #2ec9b6 100%);
  }
}

@media (max-width: 1600px) {
  .summary-cards {
    grid-template-columns: repeat(3, 1fr);
  }
  .pending-cards {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1200px) {
  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  .pending-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .summary-cards,
  .pending-cards {
    grid-template-columns: 1fr;
  }
}
</style>
