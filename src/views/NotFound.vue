<template>
    <div class="nopage">
        <div style="padding: 20px;">
            <el-button type="primary" @click="goback">跟我回去吧</el-button>
            <el-button type="primary" @click="toHome">不，我要去主页</el-button>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goback = () => {
    router.go(-1)
}

const toHome = () => {
    router.push('/')
}
</script>

<style scoped>
.nopage{
    min-height: 100vh;
    background: url('../assets/404.jpg') no-repeat;
    background-size: cover;
}
</style>