<template>
    <div class="avatar-container">
        <img :src="userInfo.avatar" alt="用户头像" class="avatar">
        <div class="avatar-overlay" v-if="isOwner">
            <el-upload accept=".png,.jpg" :show-file-list="false" :action='avatarUpUrl' :headers="headers"
                :on-success="previewAvatar" :on-error="handleError" :before-upload="verifyImg">
                <el-button size="small" type="primary">更换头像</el-button>
            </el-upload>
        </div>
    </div>

    <div class="user-info">
        <h1 class="username">{{ userInfo.username }}</h1>
        <p class="bio">{{ userInfo.bio }}</p>

        <div class="stats">
            <div class="stat-item">
                <div class="stat-value">{{ userInfo.articleCount }}</div>
                <div class="stat-label">文章</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">{{ userInfo.draftCount }}</div>
                <div class="stat-label">草稿</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">{{ userInfo.followerCount }}</div>
                <div class="stat-label">粉丝</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">{{ userInfo.likeCount }}</div>
                <div class="stat-label">获赞</div>
            </div>
        </div>

        <div class="action-buttons" v-if="!isOwner">
            <el-button type="primary" @click="followUser">
                <i class="el-icon-plus"></i> 关注
            </el-button>
            <el-button type="primary" @click="sendMessage">
                <i class="el-icon-message"></i> 发消息
            </el-button>
        </div>
    </div>
</template>

<script setup>
import { onMounted, reactive, ref, computed } from 'vue'
import { authApi } from '../../api'
import { useAuthStore } from '../../stores/auth'


// 用户信息
const userInfo = reactive({
    id: 0,
    avatar: '',
    bio: '',
    username: '技术达人',
    bio: '专注于前端开发和UI设计，分享技术经验和创作心得',
    articleCount: 56,
    draftCount: 12,
    followerCount: 1258,
    likeCount: 5324,
})

const props = defineProps({
    id: {
        type: String,
        required: true
    }
})

const auth = useAuthStore()
const avatarUpUrl = ref('')
const headers = computed(() => {
    const token = auth.token
    return token ? { Authorization: `Bearer ${token}` } : null
})

const isOwner = computed(() =>{
  return auth.isAuthenticated && auth.userInfo.id === props.id
})

const fetchUserInfo = async () => {
    const resp = await authApi.getProfile(props.id)
    if (resp.status === 200) {
        Object.assign(userInfo, resp.data.user)
        userInfo.avatar = auth.userInfo.avatar ? auth.userInfo.avatar : 'https://picsum.photos/200/200'
    }
}

// 头像上传成功
const previewAvatar = (resp, file, fileList) => {
    auth.updateAvatar(resp.filename)
    avatarUpUrl.value = auth.userInfo.avatar
}

// 头像上传失败
const handleError = (err, file, fileList) => {
    console.error(err)
}

// 头像上传校验
const verifyImg = (file) => {
    const isLt2M = file.size / 1024 / 1024 < 20
    if (!isLt2M) {
        ElMessage.error('上传图片大于20MB，扛不住了')
        return false
    }
    avatarUpUrl.value = "http://localhost:8088/auth/set-avatar"
    return true
}

onMounted(() => {
    fetchUserInfo()
})

const followUser = () => {
    console.log('关注用户')
    // 调用关注API
}

const sendMessage = () => {
    console.log('发送消息')
    // 打开消息对话框
}
</script>

<style scoped>
.avatar-container {
    position: relative;
    margin-right: 30px;
}

.avatar {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #eee;
}

.avatar-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 40%;
    background-color: rgba(0, 0, 0, 0.6);
    border-radius: 0 0 50% 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.3s;
    cursor: pointer;
}

.avatar-container:hover .avatar-overlay {
    opacity: 1;
}

.user-info {
    flex: 1;
}

.username {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 10px;
}

.bio {
    color: #606266;
    margin-bottom: 15px;
}

.stats {
    display: flex;
    margin-bottom: 20px;
}

.stat-item {
    margin-right: 30px;
    text-align: center;
}

.stat-value {
    font-size: 18px;
    font-weight: bold;
    color: #303133;
}

.stat-label {
    font-size: 14px;
    color: #909399;
}

.action-buttons {
    display: flex;
    gap: 10px;
}
</style>