<template>
    <el-table :data="drafts" style="width: 100%;" stripe>
        <el-table-column type="index" width="50" />
        <el-table-column prop="title" label="标题" width="200">
            <template #default="{ row }">
                <el-link type="danger" href="#">{{ row.title ? row.title : '佚名' }}</el-link>
            </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" :formatter="formatTime" width="160" />
        <el-table-column prop="updated_at" label="最后修改时间" :formatter="formatTime" width="160" />
        <el-table-column label="操作" fixed="right">
            <template #default="scope">
                <el-button size="small" type="primary" @click="editDraft(scope.row.id)">编辑</el-button>
                <el-button size="small" type="primary" @click="deleteDraft(scope.row.id)">删除</el-button>
                <post-modal :article="scope.row" text="发布" @publish="publishDraft" />
            </template>
        </el-table-column>
    </el-table>
    <div class="pagination-area" style="margin: auto;width: 100%;height: 100%;">
        <el-pagination v-if="drafts.length !== 0" style="margin: 20px auto 0;max-width: fit-content;"
            @current-change="handlePageChange" :current-page="currentPage" :page-sizes="[10, 20, 30]"
            :page-size="pageSize" layout="total, prev, pager, next, jumper" :total="drafts.length">
        </el-pagination>
    </div>
</template>

<script setup>
import { onMounted, watch, reactive, ref } from 'vue'
import dayjs from 'dayjs'
import { articleApi } from '../../api'
import PostModal from '../Plugins/PostModal.vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'



const drafts = reactive([])
// 分页控制
const currentPage = ref(1)
const pageSize = ref(10)
const emit = defineEmits(['data-refresh'])
const router = useRouter()


const fetchDrafts = async () => {
    try {
        const resp = await articleApi.getDrafts({
            page: currentPage.value,
            pageSize: pageSize.value
        })
        if (resp.status === 200) {
            Object.assign(drafts, resp.data.drafts)
            currentPage.value = resp.data.currentPage
        }
    } catch (error) {
        console.error('获取草稿列表出错，', error.stack)
    }
}

const handlePageChange = (page) => {
    fetchDrafts()
}

onMounted(async () => {
    await fetchDrafts()
})

const formatTime = (row, column, time) => {
    return dayjs(time).format('YYYY-MM-DD HH:mm')
}

const editDraft = (id) => {
    router.push(`/post/edit/${id}?mode=draft`)
}

const deleteDraft = async (id) => {
    try {

        await ElMessageBox.confirm('确认删除这篇文章吗？', 'warning', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        })

        const resp = await articleApi.deleteDraft(id)
        if (resp.status === 201){
            await fetchDrafts()
            emit('data-refresh')
        }
    } catch (error) {
        console.error('文章删除出错，', error.stack)
    }
}

const publishDraft = async (articleExtra) => {
    try {
        const resp = await articleApi.publishArticle(articleExtra)
        if (resp.status === 201) {
            await fetchDrafts()
            emit('data-refresh')
        }
    } catch (error) {
        console.error('一键发布出错，', error.stack)
    }
}

watch([currentPage, pageSize], async () => {
    await fetchDrafts()
})
</script>