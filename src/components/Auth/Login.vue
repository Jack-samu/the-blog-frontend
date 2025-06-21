<template>
  <el-form :model="form" :rules="rules" ref="loginForm">
    <h2 style="text-align: center;margin-bottom: 30px;">{{ forgot ? '身份校验' : '登录' }}</h2>
    <el-form-item prop="username">
        <el-input v-model="form.username" placeholder="用户昵称" />
    </el-form-item>
    <el-form-item v-if="forgot" prop="email">
        <el-input v-model="form.email" placeholder="用户邮箱" />
    </el-form-item>
    <el-form-item v-if="!forgot" prop="password">
        <el-input v-model="form.password" type="password" placeholder="用户密码" show-password @keyup.enter="login" />
    </el-form-item>
    <el-form-item v-if="forgot" prop="verificationCode">
        <el-input v-model="form.verificationCode" placeholder="验证码" />
    </el-form-item>
    <el-form-item>
        <el-link underline="hover" @click="toggleState" style="margin: 0 auto;">{{ forgot ? '我又想起来了' :'忘记密码了?' }}</el-link>
    </el-form-item>
    <el-form-item>
        <el-button 
            v-if="forgot" 
            type="primary" 
            @click="getcode" 
            :disabled="isCounting"
            style="margin: 0 auto;">
                {{ isCounting ? `重试 (${countdown}s)` : '获取验证码' }}
        </el-button>
        <el-button
            type="primary" 
            @click="forgot ? verify() : login() "
            style="margin: 0 auto;">{{ forgot ? '校验' : '登录' }}
        </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '../../api'
import { useAuthStore } from '../../stores/auth'
import { ElMessage } from 'element-plus'


const router = useRouter()
const auth = useAuthStore()

const loginForm = ref(null)

// 状态
const forgot = ref(false)
// 重试
const countdown = ref(0)
const isCounting = ref(false)
let timer = null

const toggleState = () => {
    forgot.value = !forgot.value
    resetCountdown()
}

const startCountdown = () => {
    isCounting .value = true
    countdown.value = 60
    // 定时器执行，一秒就自减1
    timer = setInterval(() => {
        countdown.value --
        if (countdown.value <= 0) {
            clearInterval(timer)
            isCounting.value = false
            countdown.value = 0
        }
    }, 1000)
}

const resetCountdown = () => {
    clearInterval(timer)
    isCounting.value = false
    countdown.value = 0
}

const form = ref({
    username: '',
    email: '',
    password: '',
    verificationCode: '',
})

// 密码校验
const validatePwd = (rule, value, callback) => {
    if (!/\d/.test(value)) {
        callback(new Error("密码需要有至少一个数字"))
    } else if (!/[a-zA-Z]/.test(value)) {
        callback(new Error("密码至少要有一个字母"))
    } else {
        callback()
    }
}

// el-form校验用rule
const rules = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'change' },
    ],
    email: [
        {required: true, message: '请输入邮箱', trigger: 'change'},
        {type: 'email', message: '请输入正确的邮箱格式', trigger: 'change'},
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        {min: 8, max: 30, message: '密码长度要大于8小于30', trigger: 'blur'},
        {validator: validatePwd, trigger: 'blur'},
    ],
    verificationCode: [
        { required: true, trigger: 'change'},
        { min: 6, max: 6, message: '别闹', trigger: 'blur'},
    ],
}

const resetForm = () => {
    form.value = {
        username: '',
        email: '',
        password: '',
        verificationCode: '',
    }
    loginForm.value?.resetFields()
}

// 触发请求，请求后台进行邮箱验证码发送
const getcode = async () => {
    try {
        const formData = {
            'username': form.value.username,
            'email': form.value.email
        }
        const resp = await authApi.getCode(formData)
        if (resp.status === 200) startCountdown()
    } catch(error) {
        if (error.status ===500) resetCountdown()
        console.error('验证码请求发送报错', error)
        // ElMessage.error(error)
    }
}

// 验证码校验
const verify = async () => {
    try {
        await loginForm.value.validate()
        const formData = {
            'username': form.value.username,
            'verificationCode': form.value.verificationCode
        }
        const resp = await authApi.verify(formData)
        if (resp.status === 200) {
            ElMessage.success(resp.data.msg)
            toggleState()
        }
    } catch(error) {
        console.error('验证码校验出错，', error)
    }
}

const login = async () => {
    try {
        await loginForm.value.validate()
        const formData = {
            'username': form.value.username,
            'password': form.value.password
        }

        const resp = await authApi.login(formData)
        if (resp.status === 200) {
            ElMessage.success({
                message: '登录成功',
                duration: 3000,
            })
            resetForm()
            auth.setAuth(resp.data)
            if (auth.action === 'refresh')
                window.location.reload()
            else if(auth.action === 'redirect')
                router.push({name: 'Home'})
        }
    } catch(error) {
        console.error('登录报错，', error)
    }
}

onUnmounted(() => {
    clearInterval(timer)
})
</script>