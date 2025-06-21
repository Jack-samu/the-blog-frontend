<template>
  <div class="page-center">
    <div class="content-box">

      <el-card class="form-card" :class="{'hidden': isRight}" style="width:50%; background-color: #e9e9e9;">
        <Register @success="toggleSide"/>
      </el-card>

      <el-card class="form-card" :class="{'hidden': !isRight}" style="width: 50%; background-color: #e9e9e9;">
        <Login />
      </el-card>

      <!-- 覆盖层 -->
      <div class="overlay-box" :style="{[isRight ? 'right' : 'left'] : '50%'}">
        <div style="display: flex;align-items: center;justify-content: center;height: 100%;">
          <el-button type="primary" @click="toggleSide">{{isRight ? '去注册' : '去登录'}}</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue'

import Login from '../components/Auth/Login.vue'
import Register from '../components/Auth/Register.vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'


const isRight = ref(true)
const auth = useAuthStore()
const router = useRouter()

const toggleSide = () => {
  isRight.value = !isRight.value
}

watchEffect(() => {
  // 注册成功就切换登录表单
  if(auth.registerOk) {
    isRight.value = true
    auth.registerOk = false
    auth.action = 'redirect'
  }

  // 登录成功就页面跳转
  if (auth.isAuthenticated){
    router.push({name: 'Home'})
  }
})
</script>

<style scoped>
.page-center{
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: url(../assets/blackboll.png) no-repeat;
  background-size: cover;
}
.content-box {
  width: 700px;
  display: flex;
  flex-direction: row;
  position: relative;
  overflow: hidden; 
  box-shadow: 5px 5px 8px #888888;
}
.form-card {
  transition: all 0.6s ease-in-out;
}

/* 隐藏被覆盖的表单 */
.hidden {
  opacity: 0;
  transform: translateX(-100%);
}
.content-box .overlay-box {
  position: absolute;
  width: 50%;
  height: 100%;
  z-index: 100;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.6s ease-in-out;
}
</style>