import { defineStore } from 'pinia'
import { jwtDecode } from 'jwt-decode'

import { authApi } from '../api'
import router from '../router'


const MAX_RETRY = 3
const BASE_DELAY = 1000
const REFRESH_CHECK_INTERVAL = 5 * 60 * 1000

export const useAuthStore = defineStore('auth', {

  state: () => ({
    registerOk: false,
    token: '',
    action: 'refresh',
    refreshToken: '',
    userInfo: {},
    retryCnt: 1,
    refreshInterval: null,
    isAuthenticated: false,
    lastActivity: Date.now(),
    refreshPromise: null
  }),

  getters: {
    tokenExpired(state) {
      if(!state.token) return true
      try {
        const { exp } = jwtDecode(state.token)
        return exp * 1000 < Date.now()
      } catch(error) {
        console.error('token解析出错，', error)
        return true
      }
    },
    refreshTokenExpired(state) {
      if(!state.refreshToken) return true
      try {
        const { exp } = jwtDecode(state.refreshToken)
        return exp * 1000 < Date.now()
      } catch(error) {
        console.error('刷新token解析出错，', error)
        return true
      }
    },
  },
  
  actions: {

    setAutoRfresh(){
      if (this.refreshInterval) clearInterval(this.refreshInterval)
      this.refreshInterval = setInterval(async () => {
        // console.log('online状态检查')
        if(!this.refreshTokenExpired) {
          if(this.tokenExpired) {
            try{
              await this.refreshTheToken()
            } catch(error) {
              console.error('自动刷新失败', error)
              this.clearAuth()
              clearInterval(this.refreshInterval)
            }
          }
        } else {
          this.clearAuth()
        }
      }, REFRESH_CHECK_INTERVAL)
    },

    async beat(){
      // console.log('扑通扑通')
      try{
        const resp = await authApi.heartbeat()
        this.lastActivity = Date.now()
        return resp.status === 200
      } catch(error) {
        console.error('检查在线状态失败，', error)
        this.isAuthenticated = false
      }
    },

    async _doRefresh() {
      
      for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
        try {
          const resp = await authApi.refresh(this.refreshToken, {
            timeout: 6000 // 单独设置刷新请求的超时
          })
          
          if (resp.status === 201) {
            this.setAuth(resp.data)
            return resp.data.token
          }
          throw new Error(`刷新失败，状态码: ${resp.status}`)
          
        } catch (error) {
          if (attempt === MAX_RETRY) {
            this.clearAuth()
            throw error
          }
          
          await new Promise(resolve => 
            setTimeout(resolve, BASE_DELAY * Math.pow(2, attempt)))
        }
      }
    },

    // 静默刷新
    async refreshTheToken() {
      if(this.refreshPromise){
        // console.log('在刷新token了，等一下')
        return this.refreshPromise
      }

      // console.log('进行token刷新操作')

      try {
        this.refreshPromise = this._doRefresh()
        return await this.refreshPromise
      } finally {
        this.refreshPromise = null
      }
    },

    async logout() {
      try {
        const resp = await authApi.logout()
        if (resp.status === 200){
          this.clearAuth()
          this.lastActivity = resp.data.last_activity
          router.go(0)
        }
      } catch(error) {
        console.error('退出出错，', error.stack)
      }
    },

    clearAuth() {
      // console.log('用户信息清理操作')
      this.isAuthenticated = false
      this.retryCnt = 0
      if(this.token) this.token = ''
      if (this.refreshToken) this.refreshToken = ''
      if(this.userInfo) this.userInfo = {}
      this.lastActivity = Date.now()
      clearInterval(this.refreshInterval)
      this.refreshInterval = null
    },

    // 按需设置
    setAuth(data) {
      // console.log('用户信息设置')

      if(data.token)
        this.token = data.token
      
      if(data.refreshToken)
        this.refreshToken = data.refreshToken

      this.retryCnt = 0
      this.userInfo = data.userInfo
      this.isAuthenticated = true
      this.lastActivity = Date.now()
      this.userInfo.avatar = `http://localhost:8088/static/images/${this.userInfo.avatar}`
      this.setAutoRfresh()
    },

    // 用户头像更新
    updateAvatar(filename) {
      this.userInfo.avatar = `http://localhost:8088/static/images/${filename}`
    },
  },

  persist: true
})