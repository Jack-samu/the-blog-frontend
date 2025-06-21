import { createRouter, createWebHistory } from "vue-router"

import Home from "../views/Home.vue"
import PostDetail from "../views/PostDetail.vue"
import PostEditor from "../views/PostEditor.vue"
import NotFound from "../views/NotFound.vue"
import NotAuthorized from "../views/NotAuthorized.vue"
import Auth from "../views/Auth.vue"
import UserProfile from "../views/UserProfile.vue"
import Test from "../views/Test.vue"


import { useAuthStore } from "../stores/auth"



const routes = [
    {path: '/', name: 'Home', component: Home},
    {path: '/article/:title', name: 'PostDetail', component: PostDetail, props: true},
    {path: '/post/edit', name:'EditNew', component: PostEditor, meta: {requiresAuth: true}},
    {path: '/post/edit/:id', name:'EditOld', component: PostEditor, meta: {requiresAuth: true}},
    {path: '/notready', name: 'NotAuthorized', component: NotAuthorized},
    {path:'/404', name:'None', component:NotFound},
    {path:'/auth', name:'Auth', component: Auth},
    {path:'/profile/:id', name:'Profile', component: UserProfile, meta: {requiresAuth: true}},
    {path:'/test', name: 'ComponentPreview', component: Test}
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 路由守卫，后续需要的时候再给加上吧，目前还没有对应的页面需要
router.beforeEach( async (to) => {
    const auth = useAuthStore()
    if (!to.meta.requiresAuth) return true
    if (!auth.isAuthenticated) {

        if(!auth.refreshTokenExpired){
            if(!auth.tokenExpired){
                try{
                    await auth.refreshTheToken()
                    if(auth.isAuthenticated) return true
                } catch(error) {
                    console.error('路由守卫中，token刷新失败，', error.stack)
                }
            }
        }

        auth.clearAuth()
        return {name: 'Home', query: {redirect: to.fullPath}}

        // return {
        //     name: 'Auth',
        //     query: {redirect: to.fullPath}
        // }
    }

    return true
})

export default router