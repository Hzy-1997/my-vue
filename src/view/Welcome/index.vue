<template>
  <div class="dashboard-container">
    <!-- 数据汇总区域 -->
    <div class="summary-section">
      <div class="section-header">
        <h2>数据汇总</h2>
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
            <div class="card-label">我的排名</div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 20%"></div>
            </div>
            <div class="progress-text">20%</div>
          </div>
        </div>

        <!-- 审批订单 -->
        <div class="summary-card">
          <div class="card-icon doc-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-number">19</div>
            <div class="card-label">审批订单</div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 16%"></div>
            </div>
            <div class="progress-text">16%</div>
          </div>
        </div>

        <!-- 成功订单 -->
        <div class="summary-card">
          <div class="card-icon success-icon">
            <el-icon><DocumentChecked /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-number">18</div>
            <div class="card-label">成功订单</div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 90%"></div>
            </div>
            <div class="progress-text">90%</div>
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
            <div class="card-number">7894514</div>
            <div class="card-label">放款金额</div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 10%"></div>
            </div>
            <div class="progress-text">10%</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 待处理订单区域 -->
    <div class="pending-section">
      <div class="section-header">
        <h2>待处理订单</h2>
      </div>
      <div class="pending-cards">
        <!-- 待审核订单 -->
        <div class="pending-card purple">
          <div class="card-title">待审核订单</div>
          <div class="card-count">60 个</div>
          <div class="card-amount">金额：75000 元</div>
          <div class="card-footer">
            <span>数据明细</span>
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>

        <!-- 待上传服务单 -->
        <div class="pending-card red">
          <div class="card-title">待上传服务单</div>
          <div class="card-count">8 个</div>
          <div class="card-amount">金额：75000 元</div>
          <div class="card-footer">
            <span>数据明细</span>
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>

        <!-- 待放款订单 -->
        <div class="pending-card deep-purple">
          <div class="card-title">待放款订单</div>
          <div class="card-count">10 个</div>
          <div class="card-amount">金额：75000 元</div>
          <div class="card-footer">
            <span>数据明细</span>
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>

        <!-- 申请结算订单 -->
        <div class="pending-card cyan">
          <div class="card-title">申请结算订单</div>
          <div class="card-count">3 个</div>
          <div class="card-amount">金额：75000 元</div>
          <div class="card-footer">
            <span>数据明细</span>
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>

        <!-- 申请撤销订单 -->
        <div class="pending-card yellow">
          <div class="card-title">申请撤销订单</div>
          <div class="card-count">5 个</div>
          <div class="card-amount">金额：75000 元</div>
          <div class="card-footer">
            <span>数据明细</span>
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
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
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue",
    Arial, sans-serif;
}

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

// 数据汇总区域样式
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

// 待处理订单区域样式
.pending-section {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.pending-cards {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
}

.pending-card {
  border-radius: 8px;
  padding: 24px 20px;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.3s;
  cursor: pointer;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 20px 0 rgba(0, 0, 0, 0.1);
  }

  .card-title {
    font-size: 20px;
    font-weight: 500;
    margin-bottom: 12px;
  }
  .card-count {
    font-size: 36px;
    font-weight: 700;
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

  // 不同卡片颜色
  &.purple {
    background: linear-gradient(135deg, #b185f0 0%, #9d6fe6 100%);
  }
  &.red {
    background: linear-gradient(135deg, #f76b8a 0%, #f05273 100%);
  }
  &.deep-purple {
    background: linear-gradient(135deg, #b159f0 0%, #9d4fe6 100%);
  }
  &.cyan {
    background: linear-gradient(135deg, #36d9c6 0%, #2ec9b6 100%);
  }
  &.yellow {
    background: linear-gradient(135deg, #f7d070 0%, #f0c050 100%);
  }
}

// 响应式适配
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
