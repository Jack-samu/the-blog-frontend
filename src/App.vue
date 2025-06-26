<script setup>
import { useAuthStore } from './stores/auth'

const auth = useAuthStore()
auth.init()
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
