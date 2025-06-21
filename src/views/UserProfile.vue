<template>
  <div class="user-profile-page">
    <el-header>
      <el-page-header @back="() => {router.push({path: '/'})}">
      <template #icon>
        <el-icon>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-house-fill" viewBox="0 0 16 16">
            <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L8 2.207l6.646 6.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.707 1.5Z"/>
            <path d="m8 3.293 6 6V13.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5V9.293l6-6Z"/>
          </svg>
        </el-icon>
      </template>
      <template #content>用户页面</template>
      <template #extra>
        <el-button type="primary" @click="logout">退出</el-button>
      </template>
    </el-page-header>
    </el-header>
    <!-- 用户信息头部 -->
    <div class="user-header">
      <user-info :id="user_id" />
    </div>
    
    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 选项卡导航 -->
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="文章管理" name="articles">
          <div class="articles-section">
            <el-tabs v-model="articleTab" type="border-card">

              <el-tab-pane label="已发表" name="published">
                <publish-table :key="publishKey" @data-refresh="handleChange" />
              </el-tab-pane>
              
              <el-tab-pane label="草稿" name="draft">
                <draft-table :key="draftKey" @data-refresh="handleChange" />
              </el-tab-pane>

            </el-tabs>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="基础知识" name="knowledge">
          <category-articles />
        </el-tab-pane>
        
        <el-tab-pane label="照片墙" name="photos">
          <photo-wall :id="user_id" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '../stores/auth'
import PhotoWall from '../components/Profile/PhotoWall.vue'
import CategoryArticles from '../components/Profile/CategoryArticles.vue'
import DraftTable from '../components/Profile/DraftTable.vue'
import PublishTable from '../components/Profile/PublishTable.vue'
import UserInfo from '../components/Profile/UserInfo.vue'


const activeTab = ref('articles')
const articleTab = ref('published')
const draftKey = ref(0)
const publishKey = ref(0)
const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const user_id = ref('')

const handleChange = () => {
  draftKey.value++
  publishKey.value++
}

const logout = async () =>{
  await auth.logout()
}

watch(() => route.params.id, () =>{
  user_id.value = route.params.id
}, {immediate: true})
</script>

<style scoped>
.user-profile-page {
  padding: 20px;
  max-width: 1600px;
  margin: 0 auto;
}

.user-header {
  display: flex;
  align-items: center;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.main-content {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.articles-section {
  padding: 10px;
  width: 100%;
}
</style>