<template>
  <div class="post-content">
    <el-skeleton v-if="loading" :rows="5" animated />
    <template v-else>
      <el-card style="width: 100%;">
        <template #header>
          <div>
            <h2>最新发布</h2>
          </div>
        </template>
        <el-empty v-if="articles.length === 0" description="啥也还没有"></el-empty>
        <ul v-else class="post-list" style="width: 100%;padding: 0;">
          <li v-for="article in articles" :key="article.id">
            <el-card style="padding: 5px;">
              <div class="post-title">
                <el-link type="primary" @click.prevent="getArticle(article.id)">
                  <h1>
                    {{ article.title }}
                  </h1>
                </el-link>
              </div>
              <el-row>
                <el-col :span="18">
                  <div class="post-excerpt" style="color: #999;">
                    {{ article.excerpt }}
                  </div>
                </el-col>
                <el-col :span="5">
                  <el-image :src="getCover(article.cover)" fit="cover" lazy style="width: 250px;height: 120px;">
                    <template #error>
                      <el-icon style="width: 100%;height: 100%;background: #fdfdfd;" :size="40" color="grey">
                        <icon-picture />
                      </el-icon>
                    </template>
                  </el-image>
                </el-col>
              </el-row>
              <div class="post-msg" style="margin: 20px 0;">
                <el-link type="primary" href="#">{{ article.author }}</el-link>&ensp;
                <el-link type="primary" href="#">{{ article.category }}</el-link>&ensp;
                <el-link disabled>{{ formatTime(article.updated_at) }}</el-link>&ensp;
                <el-link disabled>{{ article.views }} 查看</el-link>&ensp;
                <el-link disabled>{{ article.comments }} 评论</el-link>&ensp;
                <el-link disabled>{{ article.likes }} 点赞</el-link>&ensp;
              </div>
            </el-card>
          </li>
        </ul>
        <template #footer>
          <div class="pagination-box">
            <el-pagination :page-size="10" :current-page="currentPage" :total="total" layout="prev, pager, next"
              @current-change="handlePageChange" v-if="articles.length !== 0" />
          </div>
        </template>
      </el-card>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { articleApi } from '../../api'
import { Picture as IconPicture } from '@element-plus/icons-vue'


const articles = ref([])
const total = ref(0)
const currentPage = ref(1)
const loading = ref(false)
const router = useRouter()

const getArticle = (id) => {
  router.push({ name: 'PostDetail', params: { id: id } })
}

const formatTime = (time) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

const getCover = (cover) => {
  const imgUrl = `http://localhost:8088/static/images/${cover}`
  return imgUrl
}

const handlePageChange = (page) => {
  getArticles(page)
}

const getArticles = async (page = 1) => {
  loading.value = true
  const resp = await articleApi.getList(page)
  if (resp.status !== 200) {
    loading.value = false
    return
  }

  articles.value = resp.data.articles
  total.value = resp.data.total
  currentPage.value = resp.data.currentPage
  loading.value = false
}

onMounted(() => {
  getArticles(1)
})
</script>

<style>
.post-list {
  list-style: none;
}

.post-msg {
  color: #606266;
}

.post-excerpt {
  color: #606266;
}

.pagination-box {
  display: flex;
  justify-content: center;
}
</style>