<template>
    <el-table :data="publishedArticles" stripe style="width: 100%;">
        <el-table-column type="index" width="50" />
        <el-table-column prop="title" label="标题" width="300">
            <template #default="{ row }">
                <el-link type="primary" @click.prevent="viewArticle(row.id)">{{ row.title ? row.title : '佚名' }}</el-link>
            </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column prop="tags" label="标签" width="160" />
        <el-table-column prop="views" label="阅读量" width="100" />
        <el-table-column prop="likes" label="点赞数" width="100" />
        <el-table-column prop="comments" label="评论数" width="100" />
        <el-table-column prop="updated_at" label="发布时间" width="160" :formatter="formatTime" />
        <el-table-column prop="created_at" label="创建时间" width="160" :formatter="formatTime" />
        <el-table-column label="操作" width="200" fixed="right">
            <template #default="scope">
                <el-button size="small" type="primary" @click="editArticle(scope.row.id)">编辑</el-button>
                <el-button size="small" type="primary" @click="deleteArticle(scope.row.id)">删除</el-button>
            </template>
        </el-table-column>
    </el-table>

    <el-pagination style="margin: 20px auto 0;max-width: fit-content;" @current-change="handlePageChange"
        :current-page="currentPage" :page-sizes="[10, 20, 30]" :page-size="pageSize"
        layout="total, prev, pager, next, jumper" :total="publishedArticles.length">
    </el-pagination>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { ElMessageBox } from 'element-plus'
import { articleApi } from '../../api'



const publishedArticles = reactive([])
const currentPage = ref(1)
const pageSize = ref(10)
const router = useRouter()

const emit = defineEmits(['data-refresh'])

const fetchPublished = async () => {
    const resp = await articleApi.getPublishedArticles()
    if (resp.status === 200) {
        Object.assign(publishedArticles, resp.data.publishedArticles)
    }
}

const formatTime = (row, column, time) => {
    return dayjs(time).format('YYYY-MM-DD HH:mm')
}

const handlePageChange = (page) => {
    fetchPublished()
}

const viewArticle = (id) => {
  router.push({ name: 'PostDetail', params: { id: id } })
}

const editArticle = (id) => {
    router.push(`/post/edit/${id}?mode=post`)
}

const deleteArticle = async (id) => {
    try {

        await ElMessageBox.confirm('确认删除这篇文章吗？', 'warning', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        })

        const resp = await articleApi.deletePublish(id)
        if (resp.status === 201)
            emit('data-refresh')
    } catch (error) {
        console.error('文章删除出错，', error.stack)
    }
}

onMounted(() => {
    fetchPublished()
})
</script>