import { defineStore } from 'pinia'
import { jwtDecode } from 'jwt-decode'
import { markRaw } from 'vue'

import { authApi } from '../api'
import router from '../router'


const MAX_RETRY = 3
const BASE_DELAY = 1000
const REFRESH_CHECK_INTERVAL = 5 * 60 * 1000
const HEARTBEAT_INTERVAL = 3 * 60 * 1000

export const useAuthStore = defineStore('auth', {

  state: () => ({
    registerOk: false,
    token: '',
    action: 'refresh',
    refreshToken: '',
    userInfo: {},
    lastActivity: Date.now(),
    heartbeatInterval: null,
    refreshPromise: null
  }),

  getters: {
    isAuthenticated(state) {
      return !!state.token && !this.tokenExpired
    },
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
    timeToRfresh() {
      return !this.refreshTokenExpired && this.tokenExpired
    },
  },
  
  actions: {

    async init() {
      this.clearTimers()

      if (this.refreshToken && !this.refreshTokenExpired) {
        if (this.tokenExpired) await this.refreshTheToken().catch(() => this.clearAuth())
      } else {
        this.clearAuth()
      }

      if (this.isAuthenticated) this.setupTimers()
    },

    setupTimers() {

      if(this.isAuthenticated) {
        this.heartbeatInterval = setInterval(async () =>{
          await this.beat()
        }, HEARTBEAT_INTERVAL)
      }
    },

    clearTimers() {
      if(this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval)
        this.heartbeatInterval = null
      }
    },

    async beat(){
      try{
        const resp = await authApi.heartbeat()
        this.lastActivity = Date.now()
        return resp.status === 200
      } catch(error) {
        console.error('检查在线状态失败，', error)
        return false
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
        return this.refreshPromise
      }

      try {
        const promise = this._doRefresh()
        this.refreshPromise = markRaw(promise)
        return await promise
      } finally {
        this.refreshPromise = null
      }
    },

    // 按需设置
    setAuth(data) {

      this.token = data.token || this.token
      this.refreshToken = data.refreshToken || this.refreshToken
      this.userInfo = data.userInfo || this.userInfo
      this.lastActivity = Date.now()

      this.clearTimers()
      if(this.isAuthenticated) this.setupTimers()

      if(this.userInfo.avatar)
        this.updateAvatar(this.userInfo.avatar)
    },

    clearAuth() {
      this.token = ''
      this.refreshToken = ''
      this.userInfo = {}
      this.clearTimers()
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

    updateAvatar(filename) {
      if(this.userInfo)
        this.userInfo.avatar = `http://localhost:8088/static/images/${filename}`
    },
  },

  persist: {
    paths: ['token', 'refreshToken', 'userInfo', 'lastActivity']
  }
})