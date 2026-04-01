<template>
  <div class="dept-manage">
    <!-- 查询 -->
    <div class="query-form">
      <div class="title">房型配置</div>
      <div class="query-item">
        <el-input
          placeholder="请输入房型名称"
          v-model="queryForm.name"
          style="width: 200px"
        ></el-input>
        <el-select
          placeholder="酒店房型分类"
          v-model="queryForm.type"
          style="width: 200px; margin-right: 25px"
        >
          <el-option
            v-for="item in category"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>
    <!-- 操作 -->
    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="handleCreate" v-has="'roomType-create'"
          >创建酒店房型</el-button
        >
      </div>

      <!-- 展示 -->
      <el-table :data="roomTypeList" height="calc(100vh - 255px)" style="width: 100%">
        <el-table-column fixed prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="name" label="套房名称" align="center" />
        <el-table-column prop="images" label="套房图片" align="center">
          <template #default="scope">
            <el-image
              :src="imgUrl + scope.row.image"
              style="width: 100px; height: 60px"
            ></el-image>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="套房库存" width="150" align="center" />
        <el-table-column prop="status" label="状态" align="center">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              active-text="上线"
              inactive-text="下线"
              :active-value="1"
              :inactive-value="2"
              @change="handleAccountStatus(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" min-width="120" align="center">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="editClick(scope.row)"
              v-has="'roomType-update'"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="deleteClick(scope.row)"
              v-has="'roomType-delete'"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 创建酒店房型表单 -->
    <el-dialog
      title="创建票务"
      v-model="dialogVisible"
      width="50%"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="form-box">
        <el-form>
          <el-form-item label="选择酒店" prop="hotelId">
            <el-select v-model="formData.hotelId" placeholder="请选择酒店">
              <el-option
                v-for="item in hotelList"
                :key="item.id"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="房型名称">
            <el-input v-model="formData.name" placeholder="请输入房型名称"></el-input>
          </el-form-item>
          <el-form-item label="房型库存">
            <el-input v-model="formData.stock" placeholder="请输入房型库存"></el-input>
          </el-form-item>
          <el-form-item label="房间图片">
            <ImageUpload :limit="1" v-model="formData.image"></ImageUpload>
          </el-form-item>
          <el-form-item label="房间轮播图">
            <ImageUpload :limit="5" v-model="formData.banner"></ImageUpload>
          </el-form-item>
          <el-form-item label="房型描述">
            <RichTextEditor
              v-model="formData.description"
              :uploadImageConfig="{
                customUpload: handleImageUpload,
              }"
              :mode="editMode"
              @content-change="handleContentChange"
            />
          </el-form-item>

          <el-form-item label="房型设施" prop="facilities">
            <el-button @click="facilityDialogVisible = true">添加房型设施标签</el-button>
          </el-form-item>
          <el-form-item label="房间状态" prop="status">
            <el-radio-group v-model="formData.status">
              <el-radio :value="1">启 用</el-radio>
              <el-radio :value="0">禁 用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 配置选择 -->
    <el-dialog
      title="酒店设施配置"
      v-model="facilityDialogVisible"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :draggable="true"
      width="600px"
    >
      <div class="form-box">
        <el-form-item label="基础设施">
          <IconFont v-model="facility.infrastructures"></IconFont>
        </el-form-item>
        <el-form-item label="房型设施">
          <IconFont v-model="facility.roomFacilities"></IconFont>
        </el-form-item>
        <el-form-item label="通用设施">
          <IconFont v-model="facility.commonFacilities"></IconFont>
        </el-form-item>
        <el-form-item label="活动设施">
          <IconFont v-model="facility.activityFacilities"></IconFont>
        </el-form-item>
        <el-form-item label="酒店服务">
          <IconFont v-model="facility.services"></IconFont>
        </el-form-item>
        <el-form-item label="热门设施">
          <IconFont v-model="facility.hotFacilities"></IconFont>
        </el-form-item>
        <el-form-item label="餐饮服务">
          <IconFont v-model="facility.foodServices"></IconFont>
        </el-form-item>
        <el-form-item label="公共区设施">
          <IconFont v-model="facility.commonAreaFacilities"></IconFont>
        </el-form-item>
        <el-form-item label="安全与安保">
          <IconFont v-model="facility.security"></IconFont>
        </el-form-item>
        <el-form-item label="运动">
          <IconFont v-model="facility.sports"></IconFont>
        </el-form-item>
        <el-form-item label="前台服务">
          <IconFont v-model="facility.frontDeskServices"></IconFont>
        </el-form-item>
        <el-form-item label="配套服务">
          <IconFont v-model="facility.supportingServices"></IconFont>
        </el-form-item>
        <el-form-item label="停车场服务">
          <IconFont v-model="facility.parkingServices"></IconFont>
        </el-form-item>
        <el-form-item label="交通服务">
          <IconFont v-model="facility.trafficServices"></IconFont>
        </el-form-item>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="facilityDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="save">确定</el-button>
        </span>
      </template>
    </el-dialog>
    <div class="table-pagination">
      <Pagination
        :pagination="pagination"
        @handleSizeChange="handleSizeChange"
        @handleCurrentChange="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import ImageUpload from "../../components/ImageUpload/index.vue";
import IconFont from "../../components/IconFont/index.vue";
import RichTextEditor from "../../components/editor/index.vue";
import { hotelApi, commonApi } from "../../api/index.js";
import Pagination from "../../components/pagination/pagination.vue";

const imgUrl = "https://hezhaoyu.oss-cn-hangzhou.aliyuncs.com";

const roomTypeList = ref([]);

const dialogVisible = ref(false);

// 查询
const queryForm = ref({
  name: "",
  type: "",
});

// 房型分类
const category = ref([
  {
    value: "1",
    label: "豪华间",
  },
  {
    value: "2",
    label: "普通间",
  },
  {
    value: "3",
    label: "标准间",
  },
]);

const action = ref("create");

const InitformData = () => ({
  name: "豪华大床房",
  stock: "50",
  description: "",
  facilities: "",
  image: "",
  banner: "",
  status: 1,
  hotelId: 1,
});

// 表单数据
const formData = ref(InitformData());

// 设施
const facility = ref({
  // 基础设施
  infrastructures: [],
  // 房型设施
  roomFacilities: [],
  //通用设施
  commonFacilities: [],
  //活动设施
  activityFacilities: [],
  //酒店服务
  services: [],
  //热门设施
  hotFacilities: [],
  //餐饮服务
  foodServices: [],
  //公共区设施
  commonAreaFacilities: [],
  //安全与安保
  security: [],
  // 运动
  sports: [],
  //前台服务
  frontDeskServices: [],
  //配套服务
  supportingServices: [],
  //停车场服务
  parkingServices: [],
  //交通服务
  trafficServices: [],
});

const hotelList = ref([]);

const facilityDialogVisible = ref(false);

// 编辑器模式
const editMode = ref("edit");
// 初始图片列表
const initialImages = ref([]);
// 保留的图片列表
const retainedImages = ref([]);

// 分页
let pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0,
});

//------------------------------ 函数方法 -----------------------------

onMounted(() => {
  getHotelList();
  getRoomTypeList();
});

// 获取酒店列表
const getHotelList = async () => {
  const res = await hotelApi.getHotelList({
    current: 1,
    pageSize: 9999,
  });
  if (res.code === 200) {
    res.data.list.forEach((item) => {
      hotelList.value.push({
        value: item.id,
        label: item.title,
      });
    });
  }
};

// 获取酒店房型列表
const getRoomTypeList = async () => {
  const res = await hotelApi.getRoomTypeList(pagination);

  roomTypeList.value = res.data.list;
  pagination.value.total = res.data.count;
};

// 分页管理
const handleSizeChange = (val) => {
  console.log("什么东西1", val);
};

const handleCurrentChange = (val) => {
  console.log("什么东西2", val);
  pagination.value.page = val; // 当前页
  getRoomTypeList();
};

// 查询
const handleQuery = () => {
  console.log(queryForm.value);
};

// 重置
const handleReset = () => {
  queryForm.value = {
    name: "",
    type: "",
  };
  getRoomTypeList();
};

// 更改酒店状态
const handleAccountStatus = async (row) => {
  console.log(row);
  ElMessageBox.confirm("确定要更改套房状态吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      let data = {
        id: row.id,
        status: row.status,
        hotelId: row.hotelId,
        action: "update",
      };

      console.log(data);
      let res = await hotelApi.roomOperation(data);

      if (res.code !== 200) {
        ElMessage.error(res.message);
        return;
      }
      ElMessage.success("操作成功");
      getRoomTypeList();
    })
    .catch(() => {
      if (row.status === 1) {
        row.status = 0;
      } else {
        row.status = 1;
      }
    });
};

// 创建 酒店房型
const handleCreate = () => {
  nextTick(() => {
    formData.value = InitformData();
  });
  dialogVisible.value = true;
};

// 处理编辑器图片上传
const handleImageUpload = async (file, insertFn) => {
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
    alert("上传图片失败，请重试");
  }
};

// 编辑器内容
const handleContentChange = (data) => {
  formData.value.description = data.description;
  retainedImages.value = data.editorImgList;
};

// 配置酒店设施
const save = () => {
  formData.value.facilities = JSON.stringify(facility.value);
  facilityDialogVisible.value = false;
};

// 提交创建酒店房型
const handleConfirm = async () => {
  // 编辑器图片处理
  if (Array.isArray(initialImages.value) && initialImages.value.length > 0) {
    let deleteImageList = initialImages.value.filter(
      (item1) => !retainedImages.value.some((item2) => item1 === item2.src)
    );
    if (deleteImageList.length > 0) {
      deleteImageList = deleteImageList.map((url) => {
        let match = url.match(/\/ceshiUp\/\d+\/\d+\/\d+\/[a-f0-9]+\.[a-z0-9]+/i);
        console.log("正则后的", match);
        return match ? match[0].slice(1) : "";
      });
      await commonApi.deleteImg({
        deleteImageList,
      });
    }
  }

  // 图片处理
  if (Array.isArray(formData.value.image) && formData.value.image.length > 0) {
    console.log("先处理图片状态", formData.value.image);
    formData.value.image = imageEdit(formData.value.image);
  }

  if (Array.isArray(formData.value.banner) && formData.value.banner.length > 0) {
    formData.value.banner = imageEdit(formData.value.banner);
  }

  // 提交
  const data = {
    ...formData.value,
    action: action.value,
  };

  console.log("提交的数据", data);

  const res = await hotelApi.roomOperation(data);

  if (res.code == 200) {
    ElMessage({
      message: action.value === "create" ? "添加成功" : "修改成功",
      type: "success",
    });
    dialogVisible.value = false;
  } else {
    ElMessage({
      message: action.value === "create" ? "添加失败" : "修改失败",
      type: "error",
    });
  }
  getRoomTypeList();
};

// 处理图片上传
const imageEdit = (data) => {
  let arr = [];
  if (Array.isArray(data)) {
    data.forEach((element) => {
      if (element && element.url) {
        console.log(element);
        arr.push(element.url.split("aliyuncs.com")[1]);
      }
    });
    return arr.join(",");
  }
  return data;
};

// 编辑
const editClick = (row) => {
  nextTick(() => {
    for (let i in formData.value) {
      formData.value[i] = row[i];
    }
    for (let i in facility.value) {
      facility.value[i] = JSON.parse(row.facilities)[i];
    }
  });
  formData.value.id = row.id;
  action.value = "update";
  dialogVisible.value = true;
  console.log("编辑", action.value);
};

// 删除
const deleteClick = async (row) => {
  let data = {
    action: "delete",
    id: row.id,
  };
  const res = await hotelApi.roomOperation(data);

  if (res.code == 200) {
    ElMessage({
      message: "删除成功",
      type: "success",
    });
    getRoomTypeList();
  } else {
    ElMessage({
      message: "删除失败",
      type: "error",
    });
  }
};
</script>

<style lang="scss" scoped></style>
