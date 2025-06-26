<template>
    <el-form :model="form" :rules="rules" ref="registerForm">
        <h2 style="text-align: center;margin-bottom: 30px;">注册</h2>
        <el-form-item prop="avatar">
            <el-upload
            accept=".png,.jpg"
            :limit="1"
            :show-file-list="false"
            :auto-upload="false"
            :on-change="uploadAvatar"
            :on-remove="removeAvatar"
            style="margin: 0 auto;"
            >
                <el-avatar 
                :size="100"
                fit="cover"
                :src="avatarSrc || null">
                    <Camera />
                </el-avatar>
            </el-upload>
        </el-form-item>
        <el-form-item prop="username">
            <el-input v-model="form.username" placeholder="用户名" />
        </el-form-item>
        <el-form-item prop="email">
            <el-input v-model="form.email" placeholder="用户邮箱" />
        </el-form-item>
        <el-form-item prop="password">
            <el-input v-model="form.password" type="password" placeholder="密码" show-password />
        </el-form-item>
        <el-form-item prop="pwdConfirm">
            <el-input v-model="form.pwdConfirm" type="password" placeholder="确认密码" show-password />
        </el-form-item>
        <el-form-item>
            <el-button 
                type="primary" 
                @click="submit"
                style="margin: 0 auto;"
                >
                注册
            </el-button>
        </el-form-item>
    </el-form>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { authApi, articleApi } from '../../api'
import {Camera} from '@element-plus/icons-vue'
import { useAuthStore } from '../../stores/auth'


const form = ref({
    username: '',
    email: '',
    password: '',
    pwdConfirm: '',
    avatar : null,
})

const avatarSrc = ref(null)
const registerForm = ref(null)
const auth = useAuthStore()

// 头像上传
const uploadAvatar = (file) => {
    if (avatarSrc.value) {
        URL.revokeObjectURL(avatarSrc.value)
    }
    const isLt2M = file.size /1024 /1024 < 20;
    if (!isLt2M) {
        ElMessage.error('上传图片大于20MB，扛不住了')
        return false
    }
    const url = URL.createObjectURL(file.raw)
    form.value.avatar = file.raw
    avatarSrc.value = url
    // 阻止自动上传
    return false
}

// 头像移除
const removeAvatar = () => {
    avatarSrc.value = null
    form.value.avatar = null
    URL.revokeObjectURL(avatarSrc.value)
}

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

// 密码重复的validator
const validaRepeat = (rule, value, callback) => {
    if (value !== form.value.password) {
        ElMessage.warning({
            message: '密码前后不一致',
            duration: 5000
        })
        callback(new Error('两次输入密码不一致'))
    } else {
        callback()
    }
}

// el-form校验用rule
const rules = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
    ],
    email: [
        {required: true, message: '请输入邮箱', trigger: 'blur'},
        {type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur'},
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        {min: 8, max: 30, message: '密码长度要大于8小于30', trigger: 'blur'},
        {validator: validatePwd, trigger: 'blur'},
    ],
    pwdConfirm: [
        { required: true, message: '请确认密码', trigger: 'blur' },
        {min: 8, max: 30, message: '密码长度要大于8小于30', trigger: 'blur'},
        { validator: validaRepeat, trigger: 'blur' }
    ],
}

const resetForm = () => {
    form.value = {
        username: '',
        email: '',
        password: '',
        pwdConfirm: '',
        avatar: null
    }
    avatarSrc.value = null
    registerForm.value?.resetFields()
}

const submit = async () => {
    try {    
        // 表单数据校验
        await registerForm.value.validate()
        const formData = {
            'username': form.value.username,
            'email': form.value.email,
            'password': form.value.password
        }
        if (form.value.avatar) {
            const resp = await articleApi.uploadAvatar({
                'image': form.value.avatar
            })
            if (resp.status === 201)
                formData.avatar = resp.data.filename
        }

        const resp = await authApi.register(formData)
        if (resp.status === 200) {
            auth.registerOk = true
            ElMessage.success('注册成功，转去登录')
            resetForm()
        }
    } catch(error) {
        console.error("注册出错，", error)
    }
}
</script>