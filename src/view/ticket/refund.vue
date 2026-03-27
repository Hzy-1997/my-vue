<!-- 退款单（优化后） -->
<template>
  <div class="seat_container">
    <div class="seat_Settings">123</div>
    <div class="seat_box">
      <canvas
        ref="canvasRef"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
        @click="handleCanvasClick"
        style="cursor: grab"
      >
      </canvas>
    </div>
    <div class="seat_controls">
      <button
        @click="saveSeatConfiguration"
        class="save_button"
        :disabled="saveStatus.loading"
      >
        保存座位配置
      </button>
      <div class="seat_info">
        <p>选中座位数: {{ selectedSeats.size }}</p>
        <p>自定义位置座位数: {{ customSeatPositions.size }}</p>
      </div>
    </div>
    <div
      v-if="saveStatus.message"
      :class="['save_status', saveStatus.success ? 'success' : 'error']"
    >
      {{ saveStatus.message }}
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted, onUnmounted } from "vue";
import axios from "axios";

// Canvas引用
const canvasRef = ref(null);

// 座位配置（核心优化：调整间距、半径、列数避免重叠）
const seatData = reactive({
  fieldVip: {
    rows: 8, // 行数不变
    price: 1680, // 价格不变
    color: "#ff9966", // 颜色不变
    type: "arc", // 类型不变
    radius: 120, // 初始半径不变
    startAngle: -Math.PI / 3, // 起始角度不变
    endAngle: Math.PI / 3, // 结束角度不变
    rowSpacing: 28, // 行间距增大（原18），避免上下重叠
    areaName: "VIP区1",
    // 每行不同的列数配置，第一排8个，后面依次增加
    rowsCols: [8, 10, 12, 6, 16, 18, 4, 0],
  },
  fieldA: {
    rows: 12, // 行数不变
    cols: 24, // 列数减少（原28），增大列间距
    price: 1280,
    color: "#4cd964",
    type: "arc",
    radius: 350, // 初始半径增大（原190），避免与VIP区重叠
    startAngle: -Math.PI / 2, // 角度范围扩大，优化列分布
    endAngle: Math.PI / 2,
    rowSpacing: 25, // 行间距增大（原15），避免上下重叠
    areaName: "内场区",
  },
  // 添加方形座位区域支持
  fieldRect: {
    rows: 5, // 行数
    cols: 10, // 列数
    price: 880,
    color: "#007aff",
    type: "rect", // 方形布局类型
    startX: 100, // 起始X坐标
    startY: 400, // 起始Y坐标
    seatWidth: 30, // 座位宽度
    seatHeight: 25, // 座位高度（长形座位可以调整宽高比例）
    horizontalSpacing: 5, // 水平间距
    verticalSpacing: 5, // 垂直间距
    areaName: "看台1区",
  },
});

// 视图参数
const viewParams = reactive({
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  isDragging: false,
  lastX: 0,
  lastY: 0,
});

// 座位状态
const soldSeats = ref(new Set());
const selectedSeats = ref(new Map());

// 座位拖动状态
const dragState = reactive({
  isDraggingSeat: false,
  draggedSeatId: null,
  draggedSeatInfo: null,
  originalPosition: { x: 0, y: 0 },
});

// 存储座位的自定义位置信息
const customSeatPositions = ref(new Map());

// 保存状态
const saveStatus = ref({
  loading: false,
  message: "",
  success: false,
});

// 鼠标按下事件（处理视图拖拽和座位拖拽）
const handleMouseDown = (e) => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const x = (e.clientX - rect.left) * dpr - viewParams.offsetX;
  const y = (e.clientY - rect.top) * dpr - viewParams.offsetY;

  // 检查是否点击了某个座位
  const clickedSeat = checkSeatAtPosition(x / viewParams.scale, y / viewParams.scale);
  if (clickedSeat) {
    // 开始拖动座位
    dragState.isDraggingSeat = true;
    dragState.draggedSeatId = clickedSeat.id;
    dragState.draggedSeatInfo = clickedSeat;

    // 记录鼠标点击的实际位置和座位的偏移量
    const seatX = customSeatPositions.value.has(clickedSeat.id)
      ? customSeatPositions.value.get(clickedSeat.id).x
      : clickedSeat.x;
    const seatY = customSeatPositions.value.has(clickedSeat.id)
      ? customSeatPositions.value.get(clickedSeat.id).y
      : clickedSeat.y;

    // 保存原始位置
    dragState.originalPosition = { x: seatX, y: seatY };
    // 保存鼠标相对于座位的偏移量
    dragState.mouseOffset = {
      x: (e.clientX - rect.left) * dpr - viewParams.offsetX - seatX * viewParams.scale,
      y: (e.clientY - rect.top) * dpr - viewParams.offsetY - seatY * viewParams.scale,
    };

    canvas.style.cursor = "grabbing";
    return;
  }

  // 否则拖动整个视图
  viewParams.isDragging = true;
  viewParams.lastX = e.clientX;
  viewParams.lastY = e.clientY;
  canvas.style.cursor = "grabbing";
};

const handleMouseMove = (e) => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  // 处理座位拖动
  if (dragState.isDraggingSeat) {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // 使用鼠标偏移量计算座位的新位置
    const newX =
      ((e.clientX - rect.left) * dpr - viewParams.offsetX - dragState.mouseOffset.x) /
      viewParams.scale;
    const newY =
      ((e.clientY - rect.top) * dpr - viewParams.offsetY - dragState.mouseOffset.y) /
      viewParams.scale;

    // 更新被拖动座位的位置
    customSeatPositions.value.set(dragState.draggedSeatId, {
      x: newX,
      y: newY,
    });

    drawSeatMap();
    return;
  }

  // 处理视图拖动
  if (viewParams.isDragging) {
    const dx = e.clientX - viewParams.lastX;
    const dy = e.clientY - viewParams.lastY;
    viewParams.offsetX += dx;
    viewParams.offsetY += dy;
    viewParams.lastX = e.clientX;
    viewParams.lastY = e.clientY;
    drawSeatMap();
  }
};

const handleMouseUp = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  // 重置拖动状态
  if (dragState.isDraggingSeat) {
    dragState.isDraggingSeat = false;
    dragState.draggedSeatId = null;
    dragState.draggedSeatInfo = null;
    dragState.mouseOffset = null; // 重置鼠标偏移量
  }

  viewParams.isDragging = false;
  canvas.style.cursor = "grab";
};

// 画布点击事件（支持选座功能）
const handleCanvasClick = (e) => {
  // 如果正在拖动座位，不触发点击事件
  if (dragState.isDraggingSeat) return;

  const canvas = canvasRef.value;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const x = (e.clientX - rect.left) * dpr - viewParams.offsetX;
  const y = (e.clientY - rect.top) * dpr - viewParams.offsetY;

  // 遍历所有座位判断点击位置
  for (const [area, config] of Object.entries(seatData)) {
    if (config.type === "arc") {
      checkArcSeatClick(config, area, x / viewParams.scale, y / viewParams.scale);
    } else if (config.type === "rect") {
      checkRectSeatClick(config, area, x / viewParams.scale, y / viewParams.scale);
    }
  }
  drawSeatMap();
};

// 检查方形座位点击
const checkRectSeatClick = (config, area, x, y) => {
  const {
    rows,
    cols,
    startX,
    startY,
    seatWidth,
    seatHeight,
    horizontalSpacing,
    verticalSpacing,
  } = config;

  // 1. 首先检查有自定义位置的座位
  for (const [seatId, pos] of customSeatPositions.value.entries()) {
    if (seatId.startsWith(area + "-")) {
      // 方形座位的碰撞检测
      if (x >= pos.x && x <= pos.x + seatWidth && y >= pos.y && y <= pos.y + seatHeight) {
        // 检查座位是否已售
        if (soldSeats.value.has(seatId)) {
          return; // 已售座位不响应点击
        }

        // 切换选中状态
        if (selectedSeats.value.has(seatId)) {
          selectedSeats.value.delete(seatId);
        } else {
          selectedSeats.value.set(seatId, config.price);
        }
        return; // 找到一个座位后直接返回
      }
    }
  }

  // 2. 然后检查原始位置的座位（不包括已经有自定义位置的座位）
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const seatId = `${area}-${row}-${col}`;

      // 如果座位已有自定义位置，跳过原始位置检查
      if (customSeatPositions.value.has(seatId)) continue;

      // 计算座位位置
      const seatX = startX + col * (seatWidth + horizontalSpacing);
      const seatY = startY + row * (seatHeight + verticalSpacing);

      // 方形座位的碰撞检测
      if (x >= seatX && x <= seatX + seatWidth && y >= seatY && y <= seatY + seatHeight) {
        // 检查座位是否已售
        if (soldSeats.value.has(seatId)) {
          return; // 已售座位不响应点击
        }

        // 切换选中状态
        if (selectedSeats.value.has(seatId)) {
          selectedSeats.value.delete(seatId);
        } else {
          selectedSeats.value.set(seatId, config.price);
        }
        return; // 找到一个座位后直接返回
      }
    }
  }
};

// 检查指定位置是否有座位
const checkSeatAtPosition = (x, y) => {
  // 首先检查是否有自定义位置的座位
  for (const [seatId, pos] of customSeatPositions.value.entries()) {
    // 获取座位的原始配置信息来确定尺寸
    const seatInfo = getSeatConfigById(seatId);
    if (seatInfo && seatInfo.config.type === "rect") {
      // 方形座位的碰撞检测
      const { config } = seatInfo;
      const { seatWidth, seatHeight } = config;
      if (x >= pos.x && x <= pos.x + seatWidth && y >= pos.y && y <= pos.y + seatHeight) {
        return {
          id: seatId,
          x: pos.x,
          y: pos.y,
          width: seatWidth,
          height: seatHeight,
          area: seatInfo.area,
          row: seatInfo.row,
          col: seatInfo.col,
          config: seatInfo.config,
        };
      }
    } else {
      // 弧形座位的碰撞检测
      const seatSize = 10;
      const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
      if (distance < seatSize) {
        return { id: seatId, x: pos.x, y: pos.y };
      }
    }
  }

  // 然后检查原始位置的座位
  for (const [area, config] of Object.entries(seatData)) {
    if (config.type === "arc") {
      const { rows, radius, startAngle, endAngle, rowSpacing, rowsCols } = config;
      const centerX = canvasRef.value.width / 2 / (window.devicePixelRatio || 1);
      const centerY = 80;
      const seatSize = 10;

      for (let row = 0; row < rows; row++) {
        const currentRadius = radius + row * rowSpacing;
        const cols = rowsCols ? rowsCols[row] : config.cols;

        for (let col = 0; col < cols; col++) {
          const angle =
            startAngle + (endAngle - startAngle) * (cols > 1 ? col / (cols - 1) : 0);
          const seatX = centerX + currentRadius * Math.cos(angle);
          const seatY = centerY + currentRadius * Math.sin(angle);

          // 如果座位已有自定义位置，跳过原始位置检查
          const seatId = `${area}-${row}-${col}`;
          if (customSeatPositions.value.has(seatId)) continue;

          const distance = Math.sqrt(Math.pow(x - seatX, 2) + Math.pow(y - seatY, 2));
          if (distance < seatSize) {
            return { id: seatId, x: seatX, y: seatY, area, row, col, config };
          }
        }
      }
    } else if (config.type === "rect") {
      const {
        rows,
        cols,
        startX,
        startY,
        seatWidth,
        seatHeight,
        horizontalSpacing,
        verticalSpacing,
      } = config;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const seatId = `${area}-${row}-${col}`;

          // 如果座位已有自定义位置，跳过原始位置检查
          if (customSeatPositions.value.has(seatId)) continue;

          const seatX = startX + col * (seatWidth + horizontalSpacing);
          const seatY = startY + row * (seatHeight + verticalSpacing);

          // 方形座位的碰撞检测
          if (
            x >= seatX &&
            x <= seatX + seatWidth &&
            y >= seatY &&
            y <= seatY + seatHeight
          ) {
            return {
              id: seatId,
              x: seatX,
              y: seatY,
              width: seatWidth,
              height: seatHeight,
              area,
              row,
              col,
              config,
            };
          }
        }
      }
    }
  }

  return null;
};

// 根据座位ID获取座位配置信息
const getSeatConfigById = (seatId) => {
  const parts = seatId.split("-");
  if (parts.length < 3) return null;

  const area = parts[0];
  const row = parseInt(parts[1], 10);
  const col = parseInt(parts[2], 10);

  const config = seatData[area];
  if (!config) return null;

  return { area, row, col, config };
};

// 检查弧形座位点击（优先检查自定义位置的座位）
const checkArcSeatClick = (config, area, x, y) => {
  const { rows, radius, startAngle, endAngle, rowSpacing, rowsCols } = config;
  const centerX = canvasRef.value.width / 2 / (window.devicePixelRatio || 1);
  const centerY = 80;
  const seatSize = 10;

  // 1. 首先检查有自定义位置的座位
  for (const [seatId, pos] of customSeatPositions.value.entries()) {
    if (seatId.startsWith(area + "-")) {
      const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
      if (distance < seatSize) {
        // 检查座位是否已售
        if (soldSeats.value.has(seatId)) {
          return; // 已售座位不响应点击
        }

        // 切换选中状态
        if (selectedSeats.value.has(seatId)) {
          selectedSeats.value.delete(seatId);
        } else {
          selectedSeats.value.set(seatId, config.price);
        }
        return; // 找到一个座位后直接返回
      }
    }
  }

  // 2. 然后检查原始位置的座位（不包括已经有自定义位置的座位）
  for (let row = 0; row < rows; row++) {
    const currentRadius = radius + row * rowSpacing;
    const cols = rowsCols ? rowsCols[row] : config.cols; // 优先使用每行不同的列数

    for (let col = 0; col < cols; col++) {
      const seatId = `${area}-${row}-${col}`;

      // 如果座位已有自定义位置，跳过原始位置检查
      if (customSeatPositions.value.has(seatId)) continue;

      // 计算当前行的角度分布，确保座位均匀排列
      const angle =
        startAngle + (endAngle - startAngle) * (cols > 1 ? col / (cols - 1) : 0);
      const seatX = centerX + currentRadius * Math.cos(angle);
      const seatY = centerY + currentRadius * Math.sin(angle);

      // 计算点击点与座位中心的距离
      const distance = Math.sqrt(Math.pow(x - seatX, 2) + Math.pow(y - seatY, 2));

      if (distance < seatSize) {
        // 检查座位是否已售
        if (soldSeats.value.has(seatId)) {
          return; // 已售座位不响应点击
        }

        // 切换选中状态
        if (selectedSeats.value.has(seatId)) {
          selectedSeats.value.delete(seatId);
        } else {
          selectedSeats.value.set(seatId, config.price);
        }
        return; // 找到一个座位后直接返回
      }
    }
  }
};

// 调整Canvas尺寸
const resizeCanvas = () => {
  if (!canvasRef.value) return;
  const canvas = canvasRef.value;
  const container = canvas.parentElement;
  if (!container) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = container.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;

  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  viewParams.offsetX = rect.width / 2;
  viewParams.offsetY = rect.height / 2;
  drawSeatMap();
};

// 绘制座位图（优化绘制顺序和视觉区分）
const drawSeatMap = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 绘制背景（增加视觉层次）
  drawBackground(ctx, canvas);

  ctx.save();
  ctx.translate(viewParams.offsetX, viewParams.offsetY);
  ctx.scale(viewParams.scale, viewParams.scale);

  // 先绘制内场区，再绘制VIP区和方形区（避免层级覆盖）
  drawAreaSeats(ctx, seatData.fieldA, "fieldA");
  drawAreaSeats(ctx, seatData.fieldVip, "fieldVip");
  drawAreaSeats(ctx, seatData.fieldRect, "fieldRect"); // 绘制方形区域

  ctx.restore();
};

// 绘制区域座位
const drawAreaSeats = (ctx, config, area) => {
  if (config.type === "arc") {
    drawArcAreaSeats(ctx, config, area);
  } else if (config.type === "rect") {
    drawRectAreaSeats(ctx, config, area);
  }
};

// 方形座位绘制（支持矩形座位）
const drawRectAreaSeats = (ctx, config, area) => {
  const {
    rows,
    cols,
    color,
    startX,
    startY,
    seatWidth,
    seatHeight,
    horizontalSpacing,
    verticalSpacing,
    areaName,
  } = config;

  // 绘制区域名称
  drawAreaName(
    ctx,
    startX + (cols * (seatWidth + horizontalSpacing)) / 2 - horizontalSpacing / 2,
    startY - 20,
    areaName,
    color
  );

  // 存储所有需要绘制的座位
  const seatsToDraw = [];

  // 收集所有座位信息
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const seatId = `${area}-${row}-${col}`;

      let seatX, seatY;

      // 检查是否有自定义位置
      if (customSeatPositions.value.has(seatId)) {
        const pos = customSeatPositions.value.get(seatId);
        seatX = pos.x;
        seatY = pos.y;
      } else {
        // 使用网格布局计算位置
        seatX = startX + col * (seatWidth + horizontalSpacing);
        seatY = startY + row * (seatHeight + verticalSpacing);
      }

      seatsToDraw.push({
        id: seatId,
        x: seatX,
        y: seatY,
        width: seatWidth,
        height: seatHeight,
        isSold: soldSeats.value.has(seatId),
        isSelected: selectedSeats.value.has(seatId),
        isDragged: dragState.draggedSeatId === seatId,
      });
    }
  }

  // 绘制所有座位
  for (const seat of seatsToDraw) {
    // 设置座位颜色
    if (seat.isSold) {
      ctx.fillStyle = "#ff3b30"; // 已售：红色
    } else if (seat.isSelected || seat.isDragged) {
      ctx.fillStyle = "#007aff"; // 已选或拖动中：蓝色
    } else {
      ctx.fillStyle = color; // 可选：区域默认色
    }

    // 拖动中的座位稍微放大，提供视觉反馈
    const drawWidth = seat.isDragged ? seat.width * 1.2 : seat.width;
    const drawHeight = seat.isDragged ? seat.height * 1.2 : seat.height;

    // 绘制方形座位（圆角矩形）
    ctx.save();
    roundRect(ctx, seat.x, seat.y, drawWidth, drawHeight, 2);
    ctx.fill();

    // 如果是拖动中的座位，添加边框
    if (seat.isDragged) {
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.restore();
  }
};

// 弧形座位绘制（优化坐标计算和视觉区分，支持自定义位置）
const drawArcAreaSeats = (ctx, config, area) => {
  const {
    rows,
    color,
    radius,
    startAngle,
    endAngle,
    rowSpacing,
    areaName,
    rowsCols,
  } = config;
  const centerX = canvasRef.value.width / 2 / (window.devicePixelRatio || 1);
  const centerY = 80;
  const seatSize = 10;

  // 绘制区域名称（便于区分区域）
  drawAreaName(ctx, centerX, centerY - radius - 20, areaName, color);

  // 绘制区域边界线（可选：直观区分区域范围）
  drawAreaBorder(
    ctx,
    centerX,
    centerY,
    radius,
    rows,
    rowSpacing,
    startAngle,
    endAngle,
    color
  );

  // 存储所有需要绘制的座位
  const seatsToDraw = [];

  // 收集所有座位信息
  for (let row = 0; row < rows; row++) {
    const currentRadius = radius + row * rowSpacing;
    const cols = rowsCols ? rowsCols[row] : config.cols;

    for (let col = 0; col < cols; col++) {
      const angle =
        startAngle + (endAngle - startAngle) * (cols > 1 ? col / (cols - 1) : 0);
      const seatId = `${area}-${row}-${col}`;

      let seatX, seatY, seatAngle;

      // 检查是否有自定义位置
      if (customSeatPositions.value.has(seatId)) {
        const pos = customSeatPositions.value.get(seatId);
        seatX = pos.x;
        seatY = pos.y;
        // 对于自定义位置，计算相对于舞台中心的角度
        const dx = seatX - centerX;
        const dy = seatY - centerY;
        seatAngle = Math.atan2(dy, dx) + Math.PI / 2;
      } else {
        // 使用原始计算的位置和角度
        seatX = centerX + currentRadius * Math.cos(angle);
        seatY = centerY + currentRadius * Math.sin(angle);
        seatAngle = angle + Math.PI / 2;
      }

      seatsToDraw.push({
        id: seatId,
        x: seatX,
        y: seatY,
        angle: seatAngle,
        isSold: soldSeats.value.has(seatId),
        isSelected: selectedSeats.value.has(seatId),
        isDragged: dragState.draggedSeatId === seatId,
      });
    }
  }

  // 绘制所有座位
  for (const seat of seatsToDraw) {
    // 设置座位颜色
    if (seat.isSold) {
      ctx.fillStyle = "#ff3b30"; // 已售：红色
    } else if (seat.isSelected || seat.isDragged) {
      ctx.fillStyle = "#007aff"; // 已选或拖动中：蓝色
    } else {
      ctx.fillStyle = color; // 可选：区域默认色
    }

    // 拖动中的座位稍微放大，提供视觉反馈
    const drawSize = seat.isDragged ? seatSize * 1.2 : seatSize;

    // 绘制座位（圆角矩形，增加视觉舒适度）
    ctx.save();
    ctx.translate(seat.x, seat.y);
    ctx.rotate(seat.angle); // 座位朝向舞台中心
    roundRect(ctx, -drawSize / 2, -drawSize / 2, drawSize, drawSize, 2);
    ctx.fill();

    // 如果是拖动中的座位，添加边框
    if (seat.isDragged) {
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.restore();
  }
};

// 绘制区域名称
const drawAreaName = (ctx, x, y, name, color) => {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = "16px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(name, x, y);
  ctx.restore();
};

// 绘制区域边界线
const drawAreaBorder = (
  ctx,
  centerX,
  centerY,
  radius,
  rows,
  rowSpacing,
  startAngle,
  endAngle,
  color
) => {
  const outerRadius = radius + (rows - 1) * rowSpacing + 15; // 边界线在座位外侧
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
  ctx.stroke();
  ctx.restore();
};

// 绘制圆角矩形
const roundRect = (ctx, x, y, width, height, radius) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};

// 绘制背景渐变
const drawBackground = (ctx, canvas) => {
  const gradient = ctx.createLinearGradient(
    0,
    0,
    0,
    canvas.height / (window.devicePixelRatio || 1)
  );
  gradient.addColorStop(0, "#1a1a2e");
  gradient.addColorStop(1, "#16213e");
  ctx.fillStyle = gradient;
  ctx.fillRect(
    0,
    0,
    canvas.width / (window.devicePixelRatio || 1),
    canvas.height / (window.devicePixelRatio || 1)
  );
};

// 生命周期钩子
onMounted(() => {
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  // 模拟一些已售座位（测试用）
  soldSeats.value.add("fieldVip-2-5");
  soldSeats.value.add("fieldA-3-8");
  // 添加方形区域的已售座位测试
  soldSeats.value.add("fieldRect-1-1");
  soldSeats.value.add("fieldRect-3-4");
});

// 准备座位数据发送到后端
const prepareSeatData = () => {
  // 转换Map为普通对象
  const customPositionsObj = {};
  customSeatPositions.value.forEach((pos, seatId) => {
    customPositionsObj[seatId] = pos;
  });

  // 转换Set为数组
  const soldSeatsArray = Array.from(soldSeats.value);

  // 分类统计不同类型的座位区域
  const areaStats = {};
  for (const [area, config] of Object.entries(seatData)) {
    areaStats[area] = {
      type: config.type,
      rows: config.rows,
      cols: config.type === "arc" && config.rowsCols ? config.rowsCols : config.cols,
      totalSeats:
        config.type === "arc" && config.rowsCols
          ? config.rowsCols.reduce((sum, cols) => sum + cols, 0)
          : config.rows * config.cols,
    };
  }

  // 准备座位配置数据
  return {
    seatName: "演唱会座位图",
    seatNumber: "CONCERT-" + Date.now(),
    total: calculateTotalSeats(),
    disable: soldSeatsArray.length,
    rows: seatData, // 保留完整的座位配置信息，包括方形座位的特殊属性
    cols: {},
    seats: {
      customPositions: customPositionsObj,
      soldSeats: soldSeatsArray,
      seatData: seatData,
      areaStats: areaStats, // 添加区域统计信息，便于后端处理不同类型的座位
    },
    blockedSeats: soldSeatsArray,
    createBy: "admin", // 实际应用中应该从登录用户获取
  };
};

// 计算总座位数
const calculateTotalSeats = () => {
  let total = 0;
  for (const [area, config] of Object.entries(seatData)) {
    if (config.type === "arc" && config.rowsCols) {
      // 弧形座位，每行列数不同
      total += config.rowsCols.reduce((sum, cols) => sum + cols, 0);
    } else if (config.rows && config.cols) {
      // 方形座位或固定行列数的弧形座位
      total += config.rows * config.cols;
    }
  }
  return total;
};

// 保存座位配置到后端
const saveSeatConfiguration = async () => {
  try {
    saveStatus.value.loading = true;
    saveStatus.value.message = "正在保存...";

    const data = prepareSeatData();
    console.log(data);
    return;
    // 发送请求到后端API
    const response = await axios.post("/api/seats", data);

    saveStatus.value.success = true;
    saveStatus.value.message = "保存成功！座位配置ID: " + response.data.id;

    console.log("座位配置保存成功:", response.data);
  } catch (error) {
    saveStatus.value.success = false;
    saveStatus.value.message =
      "保存失败: " + (error.response?.data?.message || error.message);
    console.error("保存座位配置失败:", error);
  } finally {
    saveStatus.value.loading = false;
  }
};

onUnmounted(() => {
  window.removeEventListener("resize", resizeCanvas);
});
</script>
<style lang="scss" scoped>
.seat_container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  // padding: 20px;
}

.seat_Settings {
  width: 100%;
  height: 100px;
  border: 1px solid #ccc;
}

// dada

.seat_box {
  border: 1px solid #ccc;
  width: 1100px;
  height: 600px;
  overflow: hidden;
  position: relative;
  background-color: #f5f5f5;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.seat_controls {
  display: flex;
  align-items: center;
  gap: 40px;
  width: 1100px;
}

.save_button {
  padding: 12px 24px;
  background-color: #4cd964;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.save_button:hover:not(:disabled) {
  background-color: #34c759;
}

.save_button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.seat_info {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #666;
}

.save_status {
  margin-top: 10px;
  padding: 10px 15px;
  border-radius: 4px;
  width: 100%;
  text-align: center;
}

.save_status.success {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.save_status.error {
  background-color: #ffebee;
  color: #c62828;
}
</style>
