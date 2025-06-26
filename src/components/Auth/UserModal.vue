<template>
  <div class="user-info-header">

    <el-dropdown
     trigger="click" 
     @command="handleUserMsg"
     ref="dropdownRef"
     :disabled="visibleOrNot"
     >

      <!-- 触发因素 -->
      <el-avatar :src="avatarUrl || null" :size="32" @click="avatarClick" :style="{cursor: 'pointer'}" circle>
          <el-icon v-if="!avatarUrl"><User /></el-icon>
      </el-avatar>
     
      <!-- 下拉菜单 -->
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item>
            <el-button type="danger" @click="userProfile">{{userInfo.username}}的用户界面</el-button>
          </el-dropdown-item>

          <el-dropdown-item divided>
              <div class="stats-item">
                <span class="number">{{ userInfo.posts || 0}}</span>
                <span class="label">文章</span>
              </div>
          </el-dropdown-item>

          <el-dropdown-item>
            <div class="email-info">
                <span>个人邮箱：</span>
                <span>{{userInfo.email}}</span>
            </div>
          </el-dropdown-item>

          <!-- 头像管理区 -->
          <el-dropdown-item divided>
            <el-upload
              accept=".png,.jpg"
              :show-file-list="false"
              :action='avatarUpUrl'
              :headers="headers"
              :on-success="previewAvatar"
              :on-error="handleError"
              :before-upload="verifyImg"
            >
            <el-button :type="avatarUrl ? 'success' : 'primary' " round>
              {{ avatarUrl ? '更换头像' : '上传头像' }}
            </el-button>
            </el-upload>
          </el-dropdown-item>

          <el-dropdown-item class="logout-item" divided command="logout">
            <el-icon><SwitchButton /></el-icon>
            <span>退出登录</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
     
    </el-dropdown>

    <!-- 注册登录modal -->
    <el-dialog 
     width="30%" 
     v-model="visibleOrNot" 
     class="auth-modal"
     append-to-body>
      <!-- 登录表单 -->
      <login v-if="state === 'login' " />

      <!-- 注册表单 -->
      <register v-else />

      <!-- 注册/登录切换标签 -->
      <div style="text-align: center;">
        <el-link 
        :type="state === 'login' ? 'danger' : 'warning'" 
        @click="switchState">
          {{ state === 'login' ? '没有账号？' : '已有账号？'}}
        </el-link>
      </div>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { authApi } from '../../api'
import {User, SwitchButton} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import Register from '../Auth/Register.vue'
import Login from '../Auth/Login.vue'
import { useRouter } from 'vue-router'


const auth = useAuthStore()
const router = useRouter()
const userInfo = computed(() => {
  return auth.userInfo || {}
})
const headers = computed(() => {
  const token = auth.token
  return token ? {Authorization: `Bearer ${token}`} : null
})
const avatarUrl = computed(() => {
    return auth.userInfo
    ? auth.userInfo.avatar
    : null
})
const registerOk = computed(() => auth.registerOk)

const visibleOrNot = ref(false)
const dropdownRef = ref(null)
const state = ref('login')
const avatarUpUrl = ref('')

// 切换
const switchState = () => {
  state.value = state.value === 'login' ? 'register' : 'login'
}

const userProfile = () => {
  router.push(`/profile/${auth.userInfo.id}`)
}

// 监视是否注册成功
watch(
  [registerOk, visibleOrNot],
  ([ok, newVal]) => {
    if(!newVal) {
      nextTick(() => {
        // 重置ref引用
        dropdownRef.value = null
      })
    }
    if (ok){
      state.value = 'login'
      auth.registerOk = false
    }
  }
)

const avatarClick = (event) => {
  // 阻止事件冒泡，但会对后续下拉菜单造成影响，暂时放着
  // event.stopPropagation()
  if (!auth.isAuthenticated)
    visibleOrNot.value = true
  else
    dropdownRef.value?.handleOpen()
}

// 头像上传成功
const previewAvatar = (resp, file, fileList) => {
  auth.updateAvatar(resp.filename)
}

// 头像上传失败
const handleError = (err, file, fileList) => {
  console.error(err)
}

// 头像上传校验
const verifyImg = (file) => {
  const isLt2M = file.size /1024 /1024 < 20
  if (!isLt2M) {
      ElMessage.error('上传图片大于20MB，扛不住了')
      return false
  }
  avatarUpUrl.value = "http://localhost:8088/auth/set-avatar"
  return true
}

const handleUserMsg = async (command) => {
  try {
    if( command === 'logout' ) {
      const resp = await authApi.logout()
      if (resp?.status === 200) {
        // 退出登录，然后重载页面，路由守卫会控制其后行为
        auth.clearAuth()
        visibleOrNot.value = false
        router.go(0)
      }
    }
  } catch(error) {
    console.error(error)
  }
}

onMounted(() =>{
  if (auth.isAuthenticated) visibleOrNot.value = false
})
</script>

<style scoped>
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 0 12px;
}

.username {
  color: #fff;
  font-size: 14px;
}

.stats-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 16px;
}

.number {
  font-size: 18px;
  font-weight: 500;
}

.label {
  color: #909399;
  font-size: 12px;
}

.email-info {
  padding: 0 16px;
  min-width: 200px;
}

.value {
  color: #606266;
  word-break: break-all;
}
.logout-item {
  color: #f56c6c;
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>