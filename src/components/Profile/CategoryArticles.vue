<template>
    <div class="knowledge-section">
        <el-card class="knowledge-card" v-for="(topic, index) in knowledgeTopics" :key="index">
            <template #header>
                <div class="card-header">
                    <i class="el-icon-notebook-2"></i>
                    <span style="font-size: 20px;">{{ topic.name }}</span>
                </div>
            </template>
            <!-- <p>{{ topic.description }}</p> -->
            <div v-for="(article, idx) in topic.articles" :key="idx">
                <el-link type="primary" :href="`/article/${article.id}`"
                    style="font-size: 16px;">
                    {{ article.title }}
                </el-link>
                <!-- <span class="article-date">{{ article.date }}</span> -->
            </div>
            <template #footer>
                <el-button size="small" type="primary" @click="viewMoreKnowledge(topic.id)">查看更多</el-button>
            </template>
        </el-card>
    </div>
</template>

<script setup>
import { onMounted, reactive } from 'vue'
import { articleApi } from '../../api'


const knowledgeTopics = reactive([])

onMounted(async () => {
    const resp = await articleApi.getSeries()
    if (resp.status === 200)
        Object.assign(knowledgeTopics, resp.data.categories)
})

// todolist
const viewMoreKnowledge = (topicId) => {
    console.log('查看更多知识主题:', topicId)
    // 跳转到知识主题详情页
}
</script>

<style scoped>
.knowledge-section {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    padding: 10px;
}

.knowledge-card {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.card-header {
    display: flex;
    align-items: center;
    font-weight: bold;
}

.card-header i {
    margin-right: 10px;
    color: #409EFF;
}

.card-content {
    padding: 15px;
}

.articles-list {
    margin: 15px 0;
}

.article-item {
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.article-item a {
    color: #303133;
    text-decoration: none;
    transition: color 0.3s;
}

.article-item a:hover {
    color: #409EFF;
}

.article-date {
    font-size: 12px;
    color: #909399;
}
</style>