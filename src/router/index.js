import { createRouter, createWebHistory } from "vue-router"

import Home from "../views/Home.vue"
import PostDetail from "../views/PostDetail.vue"
import PostEditor from "../views/PostEditor.vue"
import NotFound from "../views/NotFound.vue"
import NotAuthorized from "../views/NotAuthorized.vue"
import Auth from "../views/Auth.vue"
import Test from "../components/Test.vue"


import { useAuthStore } from "../stores/auth"



const routes = [
    {path: '/', name: 'Home', component: Home},
    {path: '/article/:title', name: 'PostDetail', component: PostDetail, props: true},
    {path: '/post/edit', name:'Editor', component: PostEditor, meta: {requiresAuth: true}},
    {path: '/notready', name: 'NotAuthorized', component: NotAuthorized},
    {path:'/404', name:'None', component:NotFound},
    {path:'/auth', name:'Auth', component: Auth},
    {path:'/test', name: 'ComponentPreview', component: Test}
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 路由守卫，后续需要的时候再给加上吧，目前还没有对应的页面需要
router.beforeEach( async (to) => {
    const auth = useAuthStore()
    if (to.meta.requiresAuth) {
        if(!auth.isAuthenticated || auth.isTokenExpired){
            if(auth.refreshToken){
                try{
                    // 后续添加充实次数逻辑
                    await auth.refreshToken()
                    // 继续导航
                    if(auth.isAuthenticated && !auth.isTokenExpired) return true
                } catch(error) {
                    // 不行就由用户手动登录
                    return {name: 'Auth', query: {redirect: to.fullPath}}
                }
            } else {
                // 过期了就回到首页，让用户自行控制行为
                return {name: 'Home', query: {redirect: to.fullPath}}
            }
        }
    }

    return true
})

export default router