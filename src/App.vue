<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useAuthStore } from './stores/auth'

const auth = useAuthStore()
const heartbeatInterval = ref(null)

onMounted(async () =>{
  if(auth.refreshTokenExpired){
    auth.clearAuth()
    // console.log('当前刷新token过期或者无了，无法维持在线状态，退了退了')
  } else {
    if (auth.tokenExpired) {
      await auth.refreshTheToken()
      // console.log('token过期了，刷新一下')
    } else {
      heartbeatInterval.value = setInterval(async () => {
        const result = await auth.beat()
        if (!result && auth.isAuthenticated) auth.clearAuth()
      }, 2* 60*1000)
    }
  }
})

onUnmounted(() => {
  if(heartbeatInterval.value) {
    clearInterval(heartbeatInterval.value)
    heartbeatInterval.value = null
  }
})
</script>

<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
html, body{
    margin: 0;
    font-family: 'Maple Mono', monospace;  
}
/* * {
  font-family: 'Hiragino Sans GB', Arial, sans-serif;
} */
</style>
