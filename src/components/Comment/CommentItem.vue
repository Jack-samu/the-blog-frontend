<template>
  <div class="comment-item">
    <div class="comment-header">
      <el-avatar :src="avatarUrl || defaultAvatar" size="small"></el-avatar>
      <div class="user-info">
        <div class="username">{{ comment.user.username }}</div>
        <div class="time">{{ formatTime(comment.createdAt) }}</div>
      </div>
    </div>
    
    <div class="comment-content">
      <CommentInput
        ref="commentView"
        :content="comment.content" 
        mode="view" 
        type="text"
        @submit-content="modifyComment" />
    </div>
    
    <div class="comment-footer">
      <div class="actions">
        <el-button 
          type="" 
          size="small" 
          @click="likeComment"
          :disabled="!auth.isAuthenticated"
          >
          <el-icon :class="{ 'is-liked': comment.is_liked }">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart-fill" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
            </svg>
          </el-icon>
          <span>{{ comment.likes }}</span>
        </el-button>
        
        <el-button
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
              <el-dropdown-item @click="editComment">编辑</el-dropdown-item>
              <el-dropdown-item @click="deleteComment">删除</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    
    <!-- 回复列表 -->
    <div v-if="replies && replies.length > 0" class="reply-list">
      <ReplyItem 
        v-for="reply in replies" 
        :key="reply.id"
        :reply="reply"
        @toggle-like="handleToggleLike"
        @modify-reply="handleUpdateReply"
        @add-reply="handleAddReply"
        @delete-reply="handleDeleteReply" />
    </div>
    
    <!-- 回复编辑器 -->
    <CommentInput 
      v-if="showReplyEditor" 
      ref="replyEditor"
      @submit-content="handleSubmitReply"
      :placeholder="`回复 ${comment.user.username}`"
      mode="edit"
      type="text" />
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, computed, onBeforeUnmount } from 'vue'
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { ElMessage, ElMessageBox } from 'element-plus'
import {Position, More} from '@element-plus/icons-vue'
import { onClickOutside } from '@vueuse/core'
import dayjs from 'dayjs'
import ReplyItem from './ReplyItem.vue'
import CommentInput from './CommentInput.vue'
import { useAuthStore } from '../../stores/auth'
import { commentApi } from '../../api'


const props = defineProps({
    comment: {
        type: Object,
        default: {}
    }
})

const emits = defineEmits(['toggle-like', 'modify-comment', 'delete-comment'])
const avatarUrl = ref('')
const defaultAvatar = 'https://picsum.photos/40/40?random=0'
const auth = useAuthStore()
const showReplyEditor = ref(false)
const isLiked = ref(false)
const commentView = ref(null)
const replies = reactive([])
const replyEditor = ref(null)

const isOwner = computed(() =>{
  return auth.isAuthenticated && auth.userInfo.id === props.comment.user.id
})

// 后续改进吧
// const handleClickOutside = (event) => {
//   if(showReplyEditor.value) {
//     if (!replyEditor.value) return
//     if (!replyEditor.value.$el.contains(event.target) && 
//         !event.target.closest('.emoji-picker-container')) {
//       showReplyEditor.value = false
//     }
//   }
// }

// 格式化时间
const formatTime = (time) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

const likeComment = async () =>{
  try {
    const resp = await commentApi.toggleLike({'type':'comment', 'id': props.comment.id})
    if (resp.status === 201) {
      isLiked.value = !isLiked.value
      emits('toggle-like', {'id': props.comment.id, 'isLiked': isLiked.value})
    }
  } catch(error) {
    console.error('点赞或者取消点赞出错，', error.stack)
  }
}

const modifyComment = async (content) => {
  try{
    const resp = await commentApi.modifyComment({
      'comment_id': props.comment.id,
      'content': content
    })
    if (resp.status === 201) 
      emits('modify-comment', resp.data.comment)
  } catch(error) {
    console.error('修改评论出错，', error.stack)
  }
}

const editComment = () => {
  commentView.value.switchMode('edit')
}

const deleteComment = async () => {
  try {
    await ElMessageBox.confirm('确认删除这段评论吗？', 'warning', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    emits('delete-comment', props.comment.id)
  } catch(error) {
    console.error('评论删除确定操作出错，', error.stack)
  }
}

const toggleReply = () => {
  showReplyEditor.value = !showReplyEditor.value
}

const handleSubmitReply = async (content) => {
  try {
    const resp = await commentApi.addReply({
      'comment_id': props.comment.id,
      'content': content
    })
    if (resp.status === 201)
      replies.unshift(resp.data.reply)
  } catch(error) {
    console.error('添加回复出错，', error.stack)
  }
}

const handleToggleLike = (payload) => {
  const {id, isLiked} = payload
  const reply = replies.find(reply => reply.id === id)
  if(reply) {
    reply.is_liked = isLiked
    reply.likes =  isLiked ? reply.likes + 1 : reply.likes - 1
  }
}

const handleUpdateReply = (newReply) => {
  const index = replies.findIndex(r => r.id === newReply.id)
  if(index !== -1) replies.splice(index, 1, newReply)
}

const handleAddReply = (reply) => {
  replies.unshift(reply)
}

const handleDeleteReply = (id) => {
  replies = replies.filter(r => r.id != id)
}

const fetchReplies = async (id) => {
  try {
    const resp = await commentApi.getReplies(id)
    if (resp.status === 200) Object.assign(replies, resp.data.replies)
  } catch(error) {
    console.error('获取replies报错，', error.stack)
  }
}

onMounted(async () => {
  if(props.comment?.user){
    avatarUrl.value = `http://localhost:8088/static/images/${props.comment.user.avatar}`
    isLiked.value = props.comment.is_liked

    if (props.comment.replies > 0) {
      await fetchReplies(props.comment.id)
    }
  }

  // document.addEventListener('click', handleClickOutside)
})

// onBeforeUnmount(() => {
//   document.removeEventListener('click', handleClickOutside)
// })
</script>

<style scoped>
.comment-item {
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.user-info {
  margin-left: 10px;
}

.username {
  font-weight: bold;
}

.time {
  font-size: 12px;
  color: #999;
}

.comment-content {
  margin-bottom: 10px;
  line-height: 1.6;
}

.comment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.actions {
  display: flex;
  gap: 15px;
}

.is-liked {
  color: #f56c6c;
}

.reply-list {
  margin-top: 15px;
  padding-left: 20px;
  border-left: 2px solid #f0f0f0;
}
</style>