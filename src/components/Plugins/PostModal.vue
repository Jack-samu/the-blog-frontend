<template>
    <el-button @click="() => { visibleOrNot = true }">{{ text }}</el-button>
    <el-dialog v-model="visibleOrNot" width="60%" :show-close="false" append-to-body>
        <el-form 
         class="post-form" 
         :model="form" 
         :rules="rules"
         ref="formRef">

         <!-- 封面和摘要一栏 -->
            <div 
             class="cover-summary-area container" 
             @dragover.prevent 
             @drop.prevent="uploadCoverByDrop">

                <!-- 上传区域 -->
                <div class="upload-area" @click="uploadRef.click()">

                    <div class="container cover-box">

                        <input 
                         ref="uploadRef" 
                         @change="uploadCoverByClick" 
                         type="file" 
                         accept="image/*"
                         style="display: none;" />

                        <template v-if="!coverUrl">
                            <el-icon class="upload-icon">
                                <Upload />
                            </el-icon>
                            <div class="upload-text">点击或拖拽图片到此处</div>
                        </template>

                        <!-- 预览区域 -->
                        <div v-else 
                         class="preview-area">
                            <el-image :src="coverUrl" fit="cover" style="height: 100%;width: 100%;">
                                <template #error>
                                    <div class="img-error">
                                        <el-icon><icon-picture /></el-icon>
                                    </div>
                                </template>
                            </el-image>
                            <div 
                             class="image-actions">
                                <el-button @click.stop="removeCover" circle style="background: rgba(0,0,0,0.5);">
                                    <el-icon style="color: white;">
                                        <Delete />
                                    </el-icon>
                                </el-button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 摘要 -->
                <div class="summary-area" style="width: 50%;">
                    <el-form-item prop="excerpt">
                        <el-input v-model="form.excerpt" type="textarea" :rows="8" placeholder="输入摘要" maxlength="120" show-word-limit></el-input>
                    </el-form-item>
                </div>
            </div>
            
            <!-- 标题一栏 -->
            <el-form-item prop="title" label="文章标题">
                <el-input v-model="form.title" placeholder="输入文章标题"></el-input>
            </el-form-item>

            <!-- 分类一栏 -->
            <el-form-item prop="category" label="文章类型">
                <el-input type="text" v-model="form.category">
                    <template #prepend>
                        <el-icon>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-fire" viewBox="0 0 16 16">
                              <path d="M8 16c3.314 0 6-2 6-5.5 0-1.5-.5-4-2.5-6 .25 1.5-1.25 2-1.25 2C11 4 9 .5 6 0c.357 2 .5 4-2 6-1.25 1-2 2.729-2 4.5C2 14 4.686 16 8 16Zm0-1c-1.657 0-3-1-3-2.75 0-.75.25-2 1.25-3C6.125 10 7 10.5 7 10.5c-.375-1.25.5-3.25 2-3.5-.179 1-.25 2 1 3 .625.5 1 1.364 1 2.25C11 14 9.657 15 8 15Z"/>
                            </svg>
                        </el-icon>
                    </template>
                </el-input>
            </el-form-item>

            <!-- 标签一栏 -->
            <el-form-item prop="tags" label="文章标签">
                <el-input-tag 
                 tag-type="success" 
                 tag-effect="light"
                 v-model="form.tags" 
                 trigger="Space" 
                 placeholder="输入后空格确定"
                 clearable>
                    <template #prefix>
                        <el-icon>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-fire" viewBox="0 0 16 16">
                              <path d="M8 16c3.314 0 6-2 6-5.5 0-1.5-.5-4-2.5-6 .25 1.5-1.25 2-1.25 2C11 4 9 .5 6 0c.357 2 .5 4-2 6-1.25 1-2 2.729-2 4.5C2 14 4.686 16 8 16Zm0-1c-1.657 0-3-1-3-2.75 0-.75.25-2 1.25-3C6.125 10 7 10.5 7 10.5c-.375-1.25.5-3.25 2-3.5-.179 1-.25 2 1 3 .625.5 1 1.364 1 2.25C11 14 9.657 15 8 15Z"/>
                            </svg>
                        </el-icon>
                    </template>
                </el-input-tag>
            </el-form-item>
        </el-form>

        <template #footer>
            <span class="post-modal-footer">
                <el-button v-if="text !== '发布'" type="success" @click="save">保存</el-button>
                <el-button type="primary" @click="submit">发布</el-button>
                <el-button type="danger" @click="() => {visibleOrNot = false}">取消</el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Picture as IconPicture } from '@element-plus/icons-vue'
import { Upload, Delete } from '@element-plus/icons-vue'
import { articleApi } from '../../api'



const formRef = ref(null)
const coverUrl = ref('')
const uploadRef = ref(null)
const visibleOrNot = ref(false)

const props = defineProps({
    text: {
        type: String,
        required: true
    },
    article: {
        type: Object,
        default:() => ({
            id: 0,
            title: '',
            excerpt: '',
            cover: '',
            category: '',
            tags: []
        })
    }
})

const form = reactive({
    id: 0,
    title: '',
    excerpt: '',
    category: '',
    tags: [],
    cover: '',
    is_draft: true
})
watch(() => props.article, () => {
    form.id = props.article.id
    form.title = props.article.title
    form.excerpt = props.article.excerpt
    form.category = props.article.category
    form.tags = props.article.tags
    if (props.article?.cover)
        coverUrl.value = `http://localhost:8088/static/images/${props.article?.cover}`
}, {immediate: true, deep: true})

const emits = defineEmits(['publish', 'save'])

const rules = {
    title: [
        {required: true, message: '文章标题不能为空', trigger: 'blur'},
    ],
    excerpt: [
        {required: true, message: '文章摘要不能为空', trigger: 'change'},
    ]
}

const resetForm = () => {
    form.id = 0
    form.title = ''
    form.cover = ''
    form.excerpt = ''
    form.category = ''
    form.tags = []
    form.is_draft= true
    coverUrl.value = null
}

const uploadCover = async () => {
    
    try {
        if(!form.cover instanceof File || !(form.cover && form.cover.constructor && form.cover.constructor.name==='File')) return
        // 文章封面上传，要解决一下出错后需要重新上传图片的问题
        const resp = await articleApi.uploadImage({'image': form.cover})
        if (resp.status !== 201) {
            ElMessage.error({
                message: '封面上传出错',
                duration: 5000
            })
            return
        }
        // 替换下来，进行publish表单的提交
        form.cover = resp.data.filename
        coverUrl.value = `http://localhost:8088/static/images/${resp.data.filename}`
    } catch(error) {
        console.error('文章封面上传出错，', error.stack)
    }
}


const submit = async () =>{
    try {
        // 表单数据校验
        await formRef.value.validate()
        await uploadCover()
        form.is_draft = false
        emits('publish', form)
    } catch(error) {
        console.error('文章发表出错，', error)
    }
}

const save = async () =>{
    try {
        // 表单数据校验
        await formRef.value.validate()
        await uploadCover()

        const formData = {
            id: form.id,
            title: form.title,
            excerpt: form.excerpt,
            cover: form.cover,
            category: form.category,
            tags: [...form.tags]
        }
        emits('save', formData)
    } catch(error) {
        console.error('文章保存出错，', error)
    }
}


// 图片缓存且进行预览url提供
const imageCache = (file) => {
    if (!file.type.startsWith('image/')) {
        ElMessage.error('要上传的是图片文件')
        return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
        coverUrl.value = event.target.result
        form.cover = file
    }

    reader.onerror = (error) => {
        ElMessage.error({
            message: '图片读取失败',
            duration: 5000
        })
        // 移除错误监听
        reader.removeEventListener('error', reader.onerror)
    }
    reader.readAsDataURL(file)
}

// 封面点击上传
const uploadCoverByClick = (event) => {
    const file = event.target.files[0]
    if (file) {
        imageCache(file)
    }
}

// 封面拖曳上传
const uploadCoverByDrop = (event) => {
    const files = event.dataTransfer.files
    if (files.length > 0) {
        imageCache(files[0])
        if (files.length > 1)
            ElMessage.warning({
                message: '只保留第一个文件',
                duration: 5000
            })
    }
}

// 头像移除
const removeCover = () => {
    coverUrl.value = ''
    form.cover = null
}

// onUnmounted(() => {
//     resetForm()
// })
</script>

<style scoped>
.extra-area {
  padding: 5px;
}

.container {
  display: flex;
}

.upload-area {
  width: 50%;
  border: 1px solid rgba(0, 0, 0, 0.05);
  height: 180px;
}

.cover-box {
  width: 100%;
  height: 100%;
  position: relative;
  justify-content: center;
  align-items: center;
}

.preview-area {
  width: 100%;
  height: 100%;
}

.image-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
}
</style>