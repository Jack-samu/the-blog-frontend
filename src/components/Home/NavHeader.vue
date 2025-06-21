<template>
    <el-row class="header" :gutter="20">

      <!-- 网站标题 -->
      <el-col :span="2">
        <router-link to="/" class="brand">
          <p class="brand-text"><strong>Gemini'S Studio</strong></p>
        </router-link>
      </el-col>

      <!-- 菜单列表 -->
        <el-col :span="10">
            <el-menu default-active="1" mode="horizontal" text-color="#fff" background-color="#545c64"
                active-text-color="#ffd04b">
                <el-menu-item index="1">
                    <el-link href="#">首页</el-link>
                </el-menu-item>
                <el-sub-menu index="2">
                    <template #title>分类</template>
                    <el-menu-item index="2-1">
                        <el-link href="#" type="primary">类型1</el-link>
                    </el-menu-item>
                    <el-menu-item index="2-2">
                        <el-link href="#" type="primary">类型2</el-link>
                    </el-menu-item>
                    <el-menu-item index="2-3">
                        <el-link href="#" type="primary">类型3</el-link>
                    </el-menu-item>
                </el-sub-menu>
                <el-menu-item index="3">关于</el-menu-item>
            </el-menu>
        </el-col>

      <!-- 搜索区域 -->
      <el-col :span="8">
        <div class="search-container">
          <el-input 
            placeholder="请输入搜索内容"
          >
            <template #append>
                <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </el-col>

        <!-- 用户操作区 -->
      <el-col :span="4">
        <div class="user-actions">
          <el-button type="primary" @click="toEdit" v-if="auth.isAuthenticated">
              <el-icon><Edit /></el-icon>
          </el-button>
          <user-modal />
        </div>
      </el-col>
    </el-row>
</template>

<script setup>
import { useAuthStore } from '../../stores/auth'
import UserModal from '../Auth/UserModal.vue'
import { useRouter } from 'vue-router'
import {Search, Edit} from '@element-plus/icons-vue'


const auth = useAuthStore()
const router = useRouter()

const toEdit = () => {
  router.push({path: '/post/edit'})
}
</script>

<style scoped>
.header {
    background-color: #545c64;
    padding: 0 20px;
    align-items: center;
    height: 70px;
    width: 100%;
}

.header .brand {
    color: white;
    text-decoration: none;
}

.search-container {
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0 15px;
}
.user-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    height: 100%;
    align-items: center;
}
</style>