import { defineStore } from 'pinia'
import { authApi } from '../api'
import router from '../router'
import { ElMessage } from 'element-plus'



export const useAuthStore = defineStore('auth', {

  state: () => ({
    registerOk: false,                                                   // 是否注册成功
    loginAction: 'refresh',                                              // 登录完成后动作，默认刷新
    token: localStorage.getItem('token') || null,                        // 用户jwt-token
    refreshToken: localStorage.getItem('refreshToken') || null,          // 用户刷新token
    userInfo: JSON.parse(localStorage.getItem('userInfo') || 'null'),    // 个人用户信息
    lastActivity: localStorage.getItem('lastActivity') || null           // 最后在线时间
  }),

  getters: {
    // 计算属性
    isAuthenticated(state) {
      return !!state.token
    },

    isTokenExpired (state) {
      if(!state.token) return true
      try {
        const decoded = JSON.parse(atob(state.token.split('.')[1]))
        return decoded.exp * 1000 < Date.now()
      }catch(error) {
        console.error(`token是否过期检查报错，${error}`)
        return true
      }
    },
  },
  
  actions: {
    init() {
      if (this.isAuthenticated) {
        if(this.isTokenExpired)
          this.refreshTheToken()
        // 隔5分钟进行token检查
        setInterval(() =>{
          if(this.isTokenExpired)
              this.refreshTheToken()
        }, 300000)
      }

      // 监听用户活动
      window.addEventListener('mousemove', this.updateLastActivity)
      window.addEventListener('keydown', this.updateLastActivity)
    },

    // 静默刷新token
    async refreshTheToken() {
      try{
        if(!this.isAuthenticated) return

        if (!this.refreshToken){
          ElMessage.error('刷新token已过期')
          router.push('/notready').then(() => {
              window.location.reload()
          })
          return
        }

        const resp = await authApi.refresh()
        if (resp.status === 201){
          console.log('token刷新')
          this.setAuth({
            token: resp.token,
            refreshToken: resp.refreshToken,
            userInfo: resp.userInfo
          })

        }
      } catch(error) {
        this.clearAuth()
        console.error(`静默刷新出错，${error}`)
      }
    },

    // 强制退出登录
    async forceLogout() {
      this.clearAuth()
      router.push({name: 'NotAuthorized'})
    },

    // 更新最后活动时间
    updateLastActivity() {
      this.lastActivity = Date.now()
      localStorage.setItem('lastActivity', this.lastActivity)
    },

    clearAuth() {
      console.log('storage清理操作')

      this.token = null
      this.refreshToken = null
      this.userInfo = null
      this.registerOk = false

      localStorage.clear()
    },

    // 设置用户信息
    setAuth(data) {

      // 更新 Token
      if (data.token && typeof data.token === 'string') {
        this.registerOk = false
        this.token = data.token
        localStorage.setItem('token', data.token)
        console.log('保存了一个token, ')
      }

      // 更新refreshToken
      if (data.refreshToken && typeof data.refreshToken === 'string') {
        this.registerOk = false
        this.refreshToken = data.refreshToken
        localStorage.setItem('refreshToken', data.refreshToken)
        console.log('刷新token已保存')
      }

      // 更新 UserInfo
      if (data.userInfo && typeof data.userInfo === 'object') {
        try {
          this.userInfo = data.userInfo
          localStorage.setItem('userInfo', JSON.stringify(data.userInfo))
        } catch (error) {
          console.error('用户信息存储失败:', error)
        }
      } else if (data.userInfo === null) {
        this.userInfo = null
        localStorage.removeItem('userInfo')
      }
    },

    // 用户头像更新
    updateAvatar(filename) {
      if(!filename) {
        console.error('filename为空')
        return
      }

      if (!this.userInfo){
        console.error('用户信息不存在，无法更新头像')
        return
      }

      this.userInfo.avatar = filename

      const userData = JSON.parse(localStorage.getItem('userInfo'))
      userData.avatar = filename
      this.userInfo = userData
      localStorage.setItem('userInfo', JSON.stringify(userData))
    },
  }
})