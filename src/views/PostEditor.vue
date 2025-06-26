<template>
  <div style="min-height:100vh; display: flex;flex-direction: column;">
    <el-page-header :icon="ArrowLeft" title="返回" @back="goback" style="height: 30px; padding: 10px;">
      <template #content>
        <div style="display: flex; flex-direction: row; gap:5px;">
          <user-modal />
        </div>
      </template>
      <template #extra>
        <div>
          <el-button type="primary" @click="saveDraft()">草稿保存</el-button>
          <post-modal :article="article" :text="text" @publish="publishArticle" @save="saveDraft" />
        </div>
      </template>
    </el-page-header>
    <MdEditor v-model="article.content" :toolbars="toolbars" :code-foldable="false" previewTheme="github" @onUploadImg="previewImg" style="flex: 1;"/>
  </div>
</template>

<script setup>
import { ref, onUnmounted, reactive, watch } from 'vue'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import {ArrowLeft} from '@element-plus/icons-vue'
import UserModal from '../components/Auth/UserModal.vue'
import { useRouter, useRoute } from 'vue-router'
import { articleApi } from '../api'
import { ElMessage } from 'element-plus'

import PostModal from '../components/Plugins/PostModal.vue'


const route = useRoute()
const router = useRouter()

const text = ref('创建文章')
const article = reactive({
  id: -1,
  title: '',
  content: '',
  excerpt: '',
  cover: '',
  category: '',
  tags: [],
  imgs: []
})

// todolist后续补上post的edit后再edit判决
watch(() => route.params.id, async () => {
  try{
    if(route.params.id){
      let resp
      if (route.query.mode === 'post')
        resp = await articleApi.getDetail(route.params.id)
      else if (route.query.mode === 'draft')
        resp = await articleApi.getDraft(route.params.id)

      if (resp.status === 200){
        Object.assign(article, resp.data.article)
        text.value = '上传文章'
      }
    }
  } catch(error) {
    console.error('文章更新模式下获取文章数据出错，', error.stack)
  }
}, {immediate: true})

const toolbars = [
  'bold', 'underline', 'italic', 
  '-', 'title', 'strikeThrough', 'sub', 'sup', 'quote', 'unorderedList', 'orderedList', 'task', '-',
  'codeRow', 'code', 'link', 'image', 'table', 'mermaid', 'katex', '-','revoke', 'next', '=',
  'pageFullscreen', 'preview', 'previewOnly', 'htmlPreview', 'catelog',
]

const goback = ()=> {
  router.go(-1)
}

// 实现图片预览但并不马上进行服务器上传
const previewImg = async (files, callback) => {

  // 生成预览url
  const url = URL.createObjectURL(files[0])

  // 保存在后续进行submit的imgs中，以file和url组队的模式做成列表
  article.imgs.push({
    file: files[0],
    url
  })

  callback([url])
}

// 图片上传
const uploadImg = async() =>{
  let content = article.content

  // 图片上传
  const uploadPromises = article.imgs.map(async (img) => {
    const resp = await articleApi.uploadImage({'image': img.file})
    if (resp.status === 201) {
      // 成了就更换预览图片url和文章中的图片url
      const new_url = `http://localhost:8088/static/images/${resp.data.filename}`
      content = content.replace(img.url, new_url)
      URL.revokeObjectURL(img.url)
      return new_url
    }
    return null
  })
  
  const urls = await Promise.all(uploadPromises)
  // 过滤掉已经上传至服务器的图片
  article.imgs = article.imgs.filter((_, index) => !urls[index])

  article.content = content
}

// 草稿保存
// const saveContent = async () => {

//   if (article.content === ''){
//     ElMessage.warning('你啥都没写呢')
//     return
//   }

//   try {
//     await uploadImg()

//     const resp = await articleApi.saveArticle({
//       content: article.content
//     })

//     if (resp.status === 201) {
//       ElMessage.success({
//         message: '草稿已上传至服务器',
//         duration: 3000,
//       })
//       article.id = resp.data.id
//     }
//   } catch(error) {
//     console.error('保存草稿主体出错', error.stack)
//   }
// }

const saveDraft = async (articleExtra = {}) => {

  if (article.content === ''){
    ElMessage.warning('你啥都没写呢')
    return
  }

  try {
    await uploadImg()

    const payload = Object.keys(articleExtra).length > 0
      ? {...articleExtra, content:article.content}
      : {...article}

    const resp = await articleApi.saveArticle(payload)

    if (resp.status === 201) {
      ElMessage.success({
        message: '草稿已上传至服务器',
        duration: 3000,
      })
      article.id = resp.data.id
    }
  } catch(error) {
    console.error('保存草稿', error.stack)
  }
}

// 进行文章发布
const publishArticle = async (articleExtra) => {

  if (article.content === ''){
    ElMessage.warning('你啥都没写呢')
    return
  }

  try {
    const payload = {
      ...articleExtra,
      content: article.content
    }
    await uploadImg()

    const resp = await articleApi.publishArticle(payload)

    if (resp.status === 201) {
      ElMessage.success({
        message: '文章已发表，即将跳转',
        duration: 6000,
      })
      router.push({path: `/article/${resp.data.id}`})
    }
  } catch(error) {
    console.error('文章发布', error.stack)
  }
}

onUnmounted(() => {
  localStorage.removeItem('md_content')
})
</script>