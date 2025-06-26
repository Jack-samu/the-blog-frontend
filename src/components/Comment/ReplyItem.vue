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
          :class="{ 'is-liked': reply.is_liked }">
          <el-icon><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart-fill" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
            </svg></el-icon>
          <span>{{ reply.likes }}</span>
        </el-button>
        
        <el-button 
          type="" 
          size="small" 
          :disabled="!auth.isAuthenticated"
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