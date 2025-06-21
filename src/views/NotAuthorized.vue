<template>
    <div class="nopage">
        <div style="padding: 20px;">
            <el-button type="primary" @click="tologin">去登录</el-button>
            <el-button type="primary" @click="toHome">不，我要去主页</el-button>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const tologin = () => {
    router.push('/auth')
}

const toHome = () => {
    router.push('/')
}
</script>

<style scoped>
.nopage{
    min-height: 100vh;
    background: url('../assets/notAuthorized.png') no-repeat;
    background-size: contain;
}
</style>