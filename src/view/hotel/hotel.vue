<template>
  <div class="dept-manage">
    <div class="query-form">
      <div class="title">酒店管理</div>
      <div class="query-item">
        <el-input v-model="queryForm.title" placeholder="请输入酒店名称" />
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <div class="base-table">
      <div class="action">
        <el-button type="primary" @click="handleCreate" v-has="'hotel-create'"
          >创建酒店</el-button
        >
      </div>
    </div>

    <!-- 表格展示 -->
    <el-table :data="tableData" height="calc(100vh - 320px)" style="width: 100%">
      <el-table-column fixed prop="id" label="ID" width="50" align="center" />
      <el-table-column prop="title" label="酒店名称" width="200" align="center" />
      <el-table-column prop="state" label="封面图" width="200" align="center">
        <template #default="scope">
          <el-image :src="imgUrl + scope.row.images" style="width: 100px; height: 60px" />
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="服务电话" align="center" />
      <el-table-column prop="openingTime" label="开业时间" align="center" />
      <el-table-column prop="address" label="酒店地址" align="center" />
      <el-table-column prop="status" label="状态" width="200" align="center">
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
      <el-table-column prop="created_at" label="创建时间" align="center" />
      <el-table-column fixed="right" label="操作" min-width="120" align="center">
        <template #default="scope">
          <el-button
            type="primary"
            size="small"
            @click="editClick(scope.row)"
            v-has="'hotel-update'"
          >
            编辑
          </el-button>
          <el-button
            type="danger"
            size="small"
            @click="deleteClick(scope.row)"
            v-has="'hotel-delete'"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 表单 -->
    <el-dialog
      title="创建酒店"
      v-model="dialogVisible"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :draggable="true"
    >
      <div class="form-box">
        <el-form :model="formData" label-width="100px" ref="dialogForm" :rules="rules">
          <el-form-item label="酒店名称" prop="title">
            <el-input v-model="formData.title" placeholder="请输入酒店名称" />
          </el-form-item>

          <el-form-item label="酒店标签" prop="tags">
            <div class="flex gap-2">
              <el-tag
                v-for="tag in dynamicTags"
                :key="tag"
                closable
                :disable-transitions="false"
                @close="handleClose(tag)"
                style="margin-right: 10px"
              >
                {{ tag }}
              </el-tag>
              <el-input
                v-if="inputVisible"
                ref="InputRef"
                v-model="inputValue"
                class="w-20"
                size="small"
                @keyup.enter="handleInputConfirm"
                @blur="handleInputConfirm"
              />
              <el-button v-else class="button-new-tag" size="small" @click="showInput">
                + 酒店标签
              </el-button>
            </div>
          </el-form-item>

          <el-form-item label="封面图" prop="homeImg">
            <ImageUpload :limit="1" v-model="formData.images"></ImageUpload>
          </el-form-item>
          <el-form-item label="轮播图" prop="banners">
            <ImageUpload :limit="3" v-model="formData.banner"></ImageUpload>
          </el-form-item>

          <el-form-item label="酒店星级" prop="star_rating">
            <el-rate v-model="formData.star_rating" clearable />
          </el-form-item>

          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="formData.phone" placeholder="请输入联系电话" />
          </el-form-item>

          <el-form-item label="酒店地址" prop="address">
            <el-input v-model="formData.address" placeholder="请输入酒店地址" />
          </el-form-item>
          <el-form-item label="酒店简介" prop="intro">
            <el-input v-model="formData.intro" placeholder="请输入酒店简介" />
          </el-form-item>
          <el-form-item label="经纬度" prop="location">
            <el-input v-model="formData.location" placeholder="请输入经纬度" />
          </el-form-item>

          <el-form-item label="开业时间" prop="openingTime">
            <el-input v-model="formData.openingTime" placeholder="请输入开业时间" />
          </el-form-item>

          <el-form-item label="酒店政策" prop="policies">
            <el-input v-model="formData.policies" placeholder="请输入酒店政策" />
          </el-form-item>

          <el-form-item label="酒店须知" prop="description">
            <RichTextEditor
              v-model="formData.description"
              :uploadImageConfig="{
                customUpload: handleImageUpload,
              }"
              :mode="editMode"
              @content-change="handleContentChange"
            />
          </el-form-item>

          <el-form-item label="酒店设施">
            <el-button @click="facilityDialogVisible = true">添加酒店设施标签</el-button>
          </el-form-item>

          <el-form-item label="酒店状态" prop="status">
            <el-radio-group v-model="formData.status">
              <el-radio :value="1">启 用</el-radio>
              <el-radio :value="2">禁 用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

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
        <el-form-item label="活动设施">
          <IconFont v-model="facility.activityFacilities"></IconFont>
        </el-form-item>

        <el-form-item label="热门设施">
          <IconFont v-model="facility.hotFacilities"></IconFont>
        </el-form-item>

        <el-form-item label="酒店服务">
          <IconFont v-model="facility.hotelServices"></IconFont>
        </el-form-item>

        <el-form-item label="通用设施">
          <IconFont v-model="facility.commonFacilities"></IconFont>
        </el-form-item>

        <el-form-item label="酒店基础设施">
          <IconFont v-model="facility.infrastructures"></IconFont>
        </el-form-item>

        <el-form-item label="房型设施">
          <IconFont v-model="facility.roomFacilities"></IconFont>
        </el-form-item>

        <el-form-item label="公共区设施">
          <IconFont v-model="facility.commonAreaFacilities"></IconFont>
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
import { ref, onMounted, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import ImageUpload from "../../components/ImageUpload/index.vue"; // 组件使用<script setup>自动作为默认导出
import { hotelApi, commonApi } from "../../api/index.js";
import RichTextEditor from "../../components/editor/index.vue";
import IconFont from "../../components/IconFont/index.vue";
import Pagination from "../../components/pagination/pagination.vue";

const imgUrl = "https://hezhaoyu.oss-cn-hangzhou.aliyuncs.com";

const dialogVisible = ref(false);
const facilityDialogVisible = ref(false);

const inputValue = ref("");
const dynamicTags = ref([]);
const inputVisible = ref(false);
const InputRef = ref(null);

const queryForm = ref({
  title: "",
});

// 编辑器模式
const editMode = ref("edit");
// 初始图片列表
const initialImages = ref([]);
// 保留的图片列表
const retainedImages = ref([]);

let action = ref("create");

const getInitialFormData = () => ({
  title: "不知道",
  address: "不知道地址",
  location: "105.123,31.456",
  phone: "18782111202",
  star_rating: 0,
  intro: "不知道简介",
  status: 1,
  tags: "",
  images: "",
  banner: "",
  openingTime: "2017",
  facilities: "",
  policies: "不知道政策",
  description: "",
});

const facility = ref({
  //活动设施
  activityFacilities: [],
  //热门设施
  hotFacilities: [],
  //酒店服务
  hotelServices: [],
  //通用设施
  commonFacilities: [],
  //酒店基础设施
  infrastructures: [],
  //房型设施
  roomFacilities: [],
  //公共区设施
  commonAreaFacilities: [],
});

const formData = ref(getInitialFormData());
const rules = {};

let tableData = ref([]);

// 分页
let pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0,
});

//  ---------------  函数方法 --------------

onMounted(() => {
  getHotelList();
});

// 获取酒店列表
const getHotelList = async () => {
  const res = await hotelApi.getHotelList(pagination.value);
  if (res.code === 200) {
    console.log("酒店列表", res);
    tableData.value = res.data.list;
    pagination.value.total = res.data.count;
  }
};

// 查询酒店
const handleQuery = async () => {
  const res = await hotelApi.getHotelList(queryForm.value);
  if (res.code === 200) {
    ElMessage.success("查询成功");

    tableData.value = res.data.list;
    pagination.value.total = res.data.count;
  }
};

// 分页管理
const handleSizeChange = (val) => {
  console.log("什么东西1", val);
};

const handleCurrentChange = (val) => {
  console.log("什么东西2", val);
  pagination.value.page = val; // 当前页
  getHotelList();
};

const handleReset = () => {
  queryForm.value.title = "";
  getHotelList();
};

// 创建酒店
const handleCreate = () => {
  nextTick(() => {
    formData.value = getInitialFormData();
  });
  dialogVisible.value = true;
};

// 酒店标签
const handleClose = (tag) => {
  dynamicTags.value.splice(dynamicTags.value.indexOf(tag), 1);
};
const showInput = () => {
  inputVisible.value = true;
  nextTick(() => {
    InputRef.value.input.focus();
  });
};
const handleInputConfirm = () => {
  if (inputValue.value) {
    dynamicTags.value.push(inputValue.value);
  }
  inputVisible.value = false;
  inputValue.value = "";
};

//酒店设施配置
const save = () => {
  console.log(facility.value);
  formData.value.facilities = JSON.stringify(facility.value);
  facilityDialogVisible.value = false;
};

// 提交表单
const handleSubmit = async () => {
  console.log(formData.value);

  // 编辑器图片处理
  if (Array.isArray(initialImages.value) && initialImages.value.length > 0) {
    let deleteImageList = initialImages.value.filter(
      (item1) => !retainedImages.value.some((item2) => item1 === item2.src)
    );
    console.log("传递了啥", deleteImageList);
    if (deleteImageList.length > 0) {
      deleteImageList = deleteImageList.map((url) => {
        let match = url.match(/\/ceshiUp\/\d+\/\d+\/\d+\/[a-f0-9]+\.[a-z0-9]+/i);
        console.log("正则后的", match);
        return match ? match[0].slice(1) : "";
      });
      console.log("传递了啥", deleteImageList);
      await commonApi.deleteImg({
        deleteImageList,
      });
    }
  }

  console.log(formData.value);

  // 轮播图处理
  if (Array.isArray(formData.value.images) && formData.value.images.length > 0) {
    formData.value.images = imageEdit(formData.value.images);
  }
  if (Array.isArray(formData.value.banner) && formData.value.banner.length > 0) {
    formData.value.banner = imageEdit(formData.value.banner);
  }

  let data = {
    ...formData.value,
    tags: dynamicTags.value.join(","),
    action: action.value,
  };

  console.log("传递了啥", data);
  // return;
  let res = await hotelApi.hotelOperation(data);
  console.log("酒店操作", res);
  if (res.code === 200) {
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
  getHotelList();
};

// 编辑器内容
const handleContentChange = (data) => {
  formData.value.showIntro = data.content;
  retainedImages.value = data.editorImgList;
};

// 处理图片上传
const imageEdit = (data) => {
  console.log(data);
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

// 更改酒店状态
const handleAccountStatus = async (row) => {
  console.log(row);
  ElMessageBox.confirm("确定要更改酒店状态吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      console.log(row.status);
      console.log(row.status === 1 ? 2 : 1);
      let data = {
        id: row.id,
        status: row.status,
        action: "update",
      };
      let res = await hotelApi.hotelOperation(data);
      if (res.code !== 200) {
        ElMessage.error(res.message);
        return;
      }
      ElMessage.success("操作成功");
      getHotelList();
    })
    .catch(() => {
      if (row.status === 1) {
        row.status = 0;
      } else {
        row.status = 1;
      }
    });
};

// 编辑酒店信息
const editClick = (row) => {
  console.log(row);

  nextTick(() => {
    for (let i in formData.value) {
      formData.value[i] = row[i];
    }

    if (row.facilities != "") {
      for (let i in JSON.parse(row.facilities)) {
        facility.value[i] = JSON.parse(row.facilities)[i];
      }
    }

    console.log(facility.value);
    dynamicTags.value = formData.value.tags.split(",");
  });
  action.value = "update";
  formData.value.id = row.id;

  console.log(action.value);
  dialogVisible.value = true;
};

// 删除酒店
const deleteClick = (row) => {
  ElMessageBox.confirm("确定要删除酒店记录吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      let data = {
        id: row.id,
        action: "delete",
      };

      let res = await hotelApi.hotelOperation(data);
      if (res.code !== 200) {
        ElMessage.error(res.message);
        return;
      }
      ElMessage.success("删除成功");
      getHotelList();
    })
    .catch(() => {});
};
</script>

<style lang="scss" scoped></style>
