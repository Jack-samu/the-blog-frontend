<template>
    <div>
        <div v-if="loading">
            <el-skeleton :rows="5" animated />
        </div>
        <div 
            v-else-if="article" 
            class="post-page flex_box"
            :class="{'dark-mode': isDark}">
            <!-- <div 
             class="post-title" 
             :style="isDark 
                ? { backgroundColor: '#222', color: '#a9b7c6' }  // 深色模式无图片
                : article.cover 
                ? { background: `url(http://localhost:8088/static/images/${article.cover}) center no-repeat`, backgroundColor: 'transparent', opacity: '0.8', color: 'black' } 
                : { backgroundColor: '#d56464', color: 'white' }"
            > -->
            <div 
                class="post-title"
                :style="getTitleStyle"
            >
                <el-page-header :icon="House" @back="goHome" title="Home" style="height: 30px; padding: 10px;">
                    <template #content>
                        <div style="display: flex; flex-direction: row; gap:5px;">
                            <user-modal style="z-index: 2001 !important;" />&ensp;
                            <span style="margin: auto;">{{article.title}}</span>
                        </div>
                    </template>
                    <template #extra>
                        <el-button @click="toggle" circle >
                            <svg xmlns="http://www.w3.org/2000/svg" 
                                width="16" 
                                height="16" 
                                fill="currentColor" 
                                class="bi bi-circle-half" 
                                viewBox="0 0 16 16">
                                    <path d="M8 15A7 7 0 1 0 8 1v14zm0 1A8 8 0 1 1 8 0a8 8 0 0 1 0 16z"/>
                            </svg>
                        </el-button>
                        <el-button v-if="auth.isAuthenticated" @click="toEdit" :icon="Edit" circle />
                    </template>
                </el-page-header>
                <el-row>
                    <el-col :span="4"></el-col>
                    <el-col :span="16">
                        <div>
                            <div class="space">
                                <!-- 留白 -->
                            </div>
                            <div style="font-size: 2.7em;">
                                <strong>{{article.title}}</strong>
                            </div>
                            <div style="display: flex;gap: 3px;">
                                <el-tag v-for="tag in article.tags" :type="getType()" effect="dark"  size="large" round>{{ tag }}</el-tag>
                                <span>字数统计：{{wordCnt}}</span>
                            </div>
                        </div>
                    </el-col>
                    <el-col :span="4"></el-col>
                </el-row>
            </div>
            <el-row class="main-box">
                <el-col :span="4">
                    <el-backtop :right="1100" :bottom="100" />
                </el-col>
                <el-col :span="16" class="flex_box">
                    <div>
                        <!-- 留白 -->
                    </div>
                    <md-preview
                        v-model="content"
                        :code-foldable="false"
                        :theme="isDark ? 'dark' : 'light'"
                        style="padding:20px; background-color: transparent;"
                    />
                    <!-- <div class="post-box" v-html="article.content">
                    </div> -->
                    <div class="post-msg">
                        <br />
                        原文作者：<router-link class="primary" :to="{name: 'Profile', params: {id: article.author.id}}">{{ article.author.username }}</router-link><br>

                        原文链接：<a class="warning">{{ currentUrl }}</a><br />

                        发表日期：<a class="info">{{ formatTime(article.created_at) }}</a><br />

                        更新日期：<a class="info">{{ formatTime(article.updated_at) }}</a><br>

                        <br />
                    </div>
                    <div>
                        <Comment :id="article.id" :currentUser="article.author" />
                    </div>
                </el-col>
                <el-col :span="4" style="padding: 20px;">
                    <toc-tree :tree-data="headings" v-if="headings.length > 0" style="margin: 300px 0;position: fixed;top: 100px;"/>
                </el-col>
            </el-row>
            <el-footer class="post-footer">
                Powered by Gemini.
            </el-footer>
        </div>
        <el-empty v-else description="暂无文章数据，请求出错"></el-empty>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import dayjs from 'dayjs'
import { articleApi } from '../api'
import { useAuthStore } from '../stores/auth'
import {House, Edit} from '@element-plus/icons-vue'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

import UserModal from '../components/Auth/UserModal.vue'
import TocTree from '../components/Plugins/TocTree.vue'
import Comment from '../components/Comment/Comment.vue'


const article = ref(null)
const route = useRoute()
const loading = ref(true)
const currentUrl = ref('')
const headings = ref([])

const router = useRouter()
const auth = useAuthStore()
const isDark = ref(false)

const getTitleStyle = computed(() => {
  if (isDark.value) {
    return { 
      backgroundColor: '#222', 
      color: '#a9b7c6'
    }
  }
  
  if (article.value.cover) {
    return {
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3)), url(http://localhost:8088/static/images/${article.value.cover})`,
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      color: 'white'
    }
  }
  
  return {
    backgroundColor: '#d56464',
    color: 'white'
  }
})

const toggle = () => {
    if (isDark.value) isDark.value = false
    else isDark.value = true
}

const getType = () => {
    const index = Math.floor(Math.random() * 5)
    return ['primary', 'success', 'info', 'warning', 'danger'][index]
}

const formatTime = (time) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

const content = computed(() => {
    if (article.value) {
        // 后面引入Buffer的decode
        let content = article.value.content
        return content
    }
    return ''
})

const goHome = () => {
    router.push('/')
}

// 进行文章的更新编辑
const toEdit = () => {
    router.push({path: `/post/edit/${article.value.id}`})
}

// 字数统计
const wordCnt = computed(() => {
    if (!article.value?.content) return 0
    // 去除html标签
    const text = article.value.content.replace(/<[^>]*>/g, '')
    return text.trim().length
})

// 目录变量操作
watch(article, ()=>{
    if (!article.value) return

    nextTick(() => {
        const container = document.querySelector('#md-editor-v-0')
        if (!container) return

        headings.value = Array.from(container.querySelectorAll('h1, h2, h3, h4'))
            .map(element => ({
                id: element.id || (element.id = `heading-${Math.random().toString(36).substring(2, 9)}`),
                text: element.innerText,
                level: parseInt(element.tagName.substring(1)),
                children: [],
            }))
        headings.value = buildTocTree(headings.value)
    })
})

const buildTocTree = (headings) => {
    const root = {children: []}
    const stack = [root]

    headings.forEach(heading => {
        while (
            stack.length > 1 &&
            stack[stack.length - 1].level >= heading.level
        )
        stack.pop()
        const parent = stack[stack.length - 1]
        parent.children.push(heading)

        stack.push(heading)
    })

    return root.children
}

onMounted(async () => {

    const resp = await articleApi.getDetail(route.params.title)
    if (resp.status === 200) {
        article.value = resp.data.article
        currentUrl.value = window.location.origin + '/article/' + resp.data.article.title
        loading.value = false
    }
})
</script>

<style scoped>
html, body, .post-page{
    height: 100%;
    margin: 0;
    min-height: 100vh;
    background-color: #ececec;
    color: #141414;
}
.post-page.dark-mode,
.post-page.dark-mode * {
    background-color: #222;
    color: #a9b7c6;
}
.post-title {
    width: 100%;
    height: 300px;
}
.flex_box {
    display: flex;
    flex-direction: column;
}
.space {
    height: 80px;
}
.main-box {
    min-height: calc(100vh -330px);
    flex-grow: 1;
    position: relative;
    background-color: #f4f6f9;
    /* background-color: #121212;
    color: rgba(255, 255, 255, .87); */
}
.post-box {
    flex-grow: 1;
    padding: 10px;
    background-color: white;

    img {
        max-width: 100%;
        height: auto;
        display: block;
        margin: 1rem auto;
        border-radius: 4px;
        /* 懒加载占位符 */
        &[data-src] {
        opacity: 0;
        transition: opacity 0.3s;
        }
        &.loaded {
        opacity: 1;
        }
    }
}
.post-msg {
    width: 100%;
    margin: 20px 0;
    padding: 10px 5px;
    border-top: 1px solid black;
    border-bottom: 1px solid black;
    box-sizing: border-box;
    white-space: normal;
    word-break: break-all;
    
    a {
        text-decoration: none;
    }

    .primary {
        color: #409eff;
    }
    .warning {
        color: #f56c6c;
    }
    .info {
        color: #909399;
        pointer-events: none;
    }
}
.post-footer {
    height: 30px;
    background-color: #409eff; 
    text-align: center; 
    line-height: 30px;
}
</style>