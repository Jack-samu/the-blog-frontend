<template>
  <div class="block text-center">
    <el-carousel indicator-position="outside" autoplay :interval="8000">
      <el-carousel-item v-for="(image, index) in images" :key="index">
        <img :src="image" alt="Carousel Image" class="carousel-image" />
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<style scoped>
.carousel-image {
  width: 100%;
  /* 设置图片宽度为100% */
  height: auto;
  /* 保持宽高比 */
}

.el-carousel__item {
  height: 500px;
  /* 设置走马灯的高度 */
}
</style>

<script setup>
import { ref } from 'vue';

// 通过 ref 定义响应式数据  
const images = ref([
  new URL('../../assets/image1.png', import.meta.url).href, // 根据本地图片路径修改  
  new URL('../../assets/image2.png', import.meta.url).href, // 根据本地图片路径修改  
  new URL('../../assets/image3.png', import.meta.url).href, // 根据本地图片路径修改  
  new URL('../../assets/image4.png', import.meta.url).href, // 根据本地图片路径修改  
]);
</script>