<template>
    <el-card>
        <template #header>
            <div style="display: flex;justify-content: space-between;">
                <strong style="display: block;font-size: 1.17rem;">{{cnt}}&nbsp;条评论</strong>
                <el-select placeholder="排序方式" size="small" style="width: 240px;">
                    <el-option label="最新" value="newest"></el-option>
                    <el-option label="最热" value="hottest"></el-option>
                    <el-option label="最早" value="oldest"></el-option>
                </el-select>
            </div>
        </template>

        <comment-input type="textarea" mode="edit" @submit-content="addComment" />

        <div class="comment-list">
          <CommentItem 
            v-for="comment in comments" 
            :key="comment.id"
            :comment="comment"
            @toggle-like="handleToggleLike"
            @modify-comment="updateComment"
            @delete-comment="handleDeleteComment" />
        </div>

    </el-card>
</template>

<script setup>
import CommentInput from './CommentInput.vue'
import { commentApi } from '../../api'
import CommentItem from './CommentItem.vue'
import { onMounted, reactive, ref } from 'vue'


const props = defineProps({
    id: {
        type: Number,
        required: true
    },
    currentUser: {
        type: Object,
        default: {}
    }
})

const comments = reactive([])
const cnt = ref(0)


const fetchComments = async () =>{
    try {
        const resp = await commentApi.getComments(props.id)
        if (resp.status === 200){
            Object.assign(comments, resp.data.comments)
            cnt.value = comments.length
            comments.forEach(comment => {
                cnt.value += comment.replies
            })
        }
    } catch(error) {
        console.error('评论获取出错：', error.stack)
    }
}

const addComment = async (content) => {
    try {
        const resp = await commentApi.addComment({
            'article_id': props.id,
            'content': content
        })
        if (resp.status === 201) {
            comments.unshift(resp.data.comment)
            console.log(comments)
        }
    } catch(error) {
        console.error('添加评论出错，', error.stack)
    }
}

const updateComment = (newComment) => {
    // comments.value = comments.value.map(comment => 
    //     comment.id === newComment.id ? newComment: comment
    // )
    const index = comments.findIndex(c => c.id === newComment.id)
    if (index !== -1){
        comments.splice(index, 1, newComment)
        console.log(comments)
    }
}

const handleToggleLike = ({id, isLiked}) => {
    const comment = comments.find(comment => comment.id === id)
    if(comment){
        comment.is_liked = isLiked
        comment.likes = isLiked ? comment.likes + 1 : comment.likes - 1
    }
}

const handleDeleteComment = async (id) => {
    try {
        const resp = await commentApi.deleteComment(id)
        if (resp.status === 201){
            comments = comments.filter(c => c.id !== id)
            console.log('comment删除成功')
        }
    } catch(error) {
        console.error('评论删除操作出错，', error.stack)
    }
}

onMounted(async () =>{
    await fetchComments()
})
</script>

<style scoped>
.comment-section {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.login-prompt {
  text-align: center;
  padding: 20px 0;
}

.comment-list {
  margin-top: 20px;
}
</style>