<template>
    <div class="photos-section">
        <el-upload class="upload-demo" drag accept=".png,.jpg" :show-file-list="false" :action="avatarUpUrl"
            :headers="headers" :on-success="previewAvatar" :on-error="handleError" :before-upload="verifyImg"
            v-if="isOwner">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过20MB</div>
        </el-upload>

        <div class="photo-grid">
            <div 
                v-for="(photo, index) in photoWall" 
                :key="index"
                class="photo-item-wrapper"
                @mouseenter="hoverIndex=index"
                @mouseleave="hoverIndex = -1">

                <el-image
                    :src="photo.url" 
                    :preview-src-list="previewList"
                    fit="cover"
                    class="photo-item">
                    <template #placeholder>
                        <div class="image-skeleton">加载中...</div>
                    </template>
                </el-image>

                <el-button
                    v-if="isOwner && hoverIndex === index"
                    class="delete-btn"
                    icon="el-icon-delete"
                    circle
                    @click.stop="deleteImg(photo.id, index)"
                    size="small">
                    <el-icon><Delete /></el-icon>
                </el-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, reactive, ref, computed } from 'vue'
import { Delete } from '@element-plus/icons-vue'
import { useAuthStore } from '../../stores/auth'
import { articleApi, authApi } from '../../api'
import { ElMessageBox, ElMessage } from 'element-plus'


const hoverIndex = ref(-1)
const auth = useAuthStore()
const photoWall = reactive([])
const avatarUpUrl = ref('')
const headers = computed(() => {
    const token = auth.token
    return token ? { Authorization: `Bearer ${token}` } : null
})

const props = defineProps({
    id: {
        type: String,
        required: true
    }
})

const isOwner = computed(() =>{
  return auth.isAuthenticated && auth.userInfo.id === props.id
})

const previewList = ref(photoWall.map(photo => photo.url))

const previewAvatar = (resp, file, fileList) => {
    auth.updateAvatar(resp.filename)
}

const handleError = (err, file, fileList) => {
    console.error(err)
}

const verifyImg = (file) => {
    const isLt2M = file.size / 1024 / 1024 < 20
    if (!isLt2M) {
        ElMessage.error('上传图片大于20MB，扛不住了')
        return false
    }
    avatarUpUrl.value = "http://localhost:8088/auth/upload-img"
    return true
}

const fetchPhotos = async () => {
    const resp = await authApi.getPhotos(props.id)
    if (resp.status === 200)
        resp.data.photos.forEach(photo => {
            photoWall.push({ 
                id: photo.id,
                url: `http://localhost:8088/static/images/${photo.name}` 
            })
        })
}

const deleteImg = async (photoId, index) => {
    try {

        await ElMessageBox.confirm('确认删除这张图片吗？', 'warning', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        })

        const resp = await articleApi.deleteImg(photoId)
        if (resp.status === 201)
            photoWall.splice(index, 1)
    } catch(error) {
        console.error('图片删除出错，', error.stack)
    }
}

onMounted( () => {
    fetchPhotos()
})
</script>

<style scoped>
.photos-section {
    padding: 10px;
}

.upload-demo {
    margin-bottom: 20px;
}

.photo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 15px;
}

.photo-item-wrapper{
    position: relative;
    aspect-ratio: 1;
    overflow: hidden;
    border-radius: 4px;
    transition: all 0.3s;
}

.photo-item {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 8px;
    cursor: pointer;
}

.delete-btn{
    position: absolute;
    top:10px;
    right: 10px;
    opacity: 0.8;
    transition: opacity 0.3s;
}

.delete-btn:hover{
    opacity: 1;
}

.photo-item:hover {
    transform: scale(1.03);
}

.image-skeleton {
    width: 100%;
    height: 100%;
    background-color: #f0f0f0;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #909399;
}
</style>