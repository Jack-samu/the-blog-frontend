<template>
  <div class="reply-item">
    <div class="reply-header">
      <el-avatar :src="avatarUrl || defaultAvatar" size="small"></el-avatar>
      <div class="user-info">
        <div class="username">{{ reply.user.username }}</div>
        <div class="time">{{ formatTime(reply.createdAt) }}</div>
      </div>
    </div>
    
    <div class="reply-content">
      <CommentInput
        ref="replyView"
        :content="reply.content" 
        mode="view" 
        type="text"
        @submit-content="modifyReply" />
    </div>
    
    <div class="reply-footer">
      <div class="actions">
        <el-button 
          type="" 
          size="small" 
          @click="likeReply"
          :disabled="!auth.isAuthenticated"
          :class="{ 'is-liked': reply.isLiked }">
          <el-icon><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart" viewBox="0 0 16 16">
                <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>
              </svg></el-icon>
          <span>{{ reply.likes }}</span>
        </el-button>
        
        <el-button 
          type="" 
          size="small" 
          @click="toggleReply">
          <el-icon><Position /></el-icon>
          <span>回复</span>
        </el-button>
        
        <el-dropdown v-if="isOwner" trigger="click">
          <el-button type="" size="small">
            <el-icon><More /></el-icon>
            <span>更多</span>
          </el-button>
          
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="editReply">编辑</el-dropdown-item>
              <el-dropdown-item @click="deleteReply">删除</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    
    <!-- 回复编辑器 -->
    <CommentInput
      v-if="showReplyEditor" 
      mode="edit"
      type="text"
      @submit-content="handleSubmitReply"
      :placeholder="`回复 ${reply.user.username}`" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { ElMessage,ElMessageBox } from 'element-plus'
import {Position, More} from '@element-plus/icons-vue'
import { useAuthStore } from '../../stores/auth'
import CommentInput from './CommentInput.vue'
import { commentApi } from '../../api'

const props = defineProps({
    reply: {
        type: Object,
        default: {}
    }
})

const emits = defineEmits([
  'toggle-like',
  'modify-reply',
  'add-reply',
  'delete-reply'
])
const avatarUrl = ref('')
const defaultAvatar = 'https://picsum.photos/40/40?random=0'
const auth = useAuthStore()
const showReplyEditor = ref(false)

const isLiked = ref(false)
const replyView = ref(null)

const isOwner = computed(() =>{
  return auth.isAuthenticated && auth.userInfo.id === props.reply.user.id
})

// 格式化时间
const formatTime = (time) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

onMounted(() => {
  if(props.reply?.user){
    avatarUrl.value = `http://localhost:8088/static/images/${props.reply.user.avatar}`
    isLiked.value = props.reply.is_liked
  }
})

const likeReply = async () =>{
  try {
    const resp = await commentApi.toggleLike({'type':'reply', 'id': props.reply.id})
    if (resp.status === 201) {
      isLiked.value = !isLiked.value
      emits('toggle-like', {'id': props.reply.id, 'isLiked': isLiked.value})
    }
  } catch(error) {
    console.log('点赞或者取消点赞出错，', error.stack)
  }
}

const modifyReply = async (content) => {
  try {
    const resp = await commentApi.modifyReply({
      'id': props.reply.id,
      'content': content
    })
    if (resp.status === 201)
      emits('modify-reply', resp.data.reply)
  }catch(error) {
    console.error('评论修改出错，', error.stack)
  }
}

const toggleReply = () => {
  showReplyEditor.value = !showReplyEditor.value
}

const editReply = () => {
  replyView.value.switchMode('edit')
}

const deleteReply = async () => {
  try {
    await ElMessageBox.confirm('确认删除这段评论吗？', 'warning', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const resp = await commentApi.deleteReply(props.reply.id)
    if (resp.status === 201)
      emits('delete-reply', props.reply.id)
  } catch (error) {
    console.error('删除reply出错，', error.stack)
  }
}

const handleSubmitReply = async (content) => {
  try {
    const resp = await commentApi.addReply({
      'parent_id': props.reply.id,
      'comment_id': props.reply.comment_id,
      'content': content
    })
    if(resp.status === 201){
      emits('add-reply', resp.data.reply)
      showReplyEditor.value = false
    }
  } catch(error) {
    console.error('对reply进行回复出错，', error.stack)
  }
}
</script>

<style scoped>
.reply-item {
  padding: 10px 0 10px 20px;
  border-left: 2px solid #f0f0f0;
  margin-left: 10px;
}

.reply-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.user-info {
  margin-left: 8px;
}

.username {
  font-weight: 500;
}

.time {
  font-size: 12px;
  color: #999;
}

.reply-content {
  margin-bottom: 8px;
  line-height: 1.5;
}

.reply-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.actions {
  display: flex;
  gap: 12px;
}

.is-liked {
  color: #f56c6c;
}

.nested-reply-list {
  margin-top: 10px;
}
</style>