import { ElMessage } from "element-plus"
import router from "../../router"
import { useAuthStore } from "../../stores/auth"


// 后续添加对于多个相同的重新req的去重，存疑
let refreshSubscribers = []

const addRefreshSubscriber = (callback) => {
    refreshSubscribers.push(callback)
}

// 当token有值，进行队列重试
const onRefreshed = (token) => {
    refreshSubscribers.forEach(cb => cb(token))
    refreshSubscribers = []
}

// 拦截器，栈结构实现
// resolve触发下一个then
// reject触发最近的catch
export const setupInterceptors = (instance) => {

    // 请求拦截器
    instance.interceptors.request.use(config =>{
        const auth = useAuthStore()

        if (config.url.includes('/auth/refresh')) return config

        if(auth.token && !config.headers.Authorization) {
            // console.log('此次请求应用设定的token, ', auth.token)
            config.headers.Authorization = `Bearer ${auth.token}`
        }

        if(config.method === 'post' && !config.url.includes('img'))
            config.headers['Content-Type'] = 'application/json'

        return config
    })

    // 请求 → [响应拦截器2] → [响应拦截器1] → 客户端代码
    instance.interceptors.response.use(
        response => response, 
        async error => {
            const auth = useAuthStore()
            const originalReq = error.config

            if (error.response?.status !== 401 || originalReq._retry) {
                console.error('认证错误以外错误', error)
                // 不能用reject，会继续执行
                return Promise.reject(error)
            }

            if (error.response?.status === 401 && originalReq.url.includes('logout')){
                auth.clearAuth()
                console.log('退出的就不管它了')
                return Promise.reject(error)
            }

            originalReq._retry = true

            if (auth.refreshTokenExpired){
                auth.clearAuth()
                router.push({name: 'Home'})
                ElMessage.error('刷新token过期了')
                console.error(error)
                return Promise.reject(error)
            }

            try {
                const token = await auth.refreshTheToken()
                onRefreshed(token)
                originalReq.headers.Authorization = `Bearer ${token}`
                return instance(originalReq)
            } catch(error) {
                console.error('刷新重试失败，转去登录，', error.stack)
                auth.clearAuth()
                router.push('/auth')
                return Promise.reject(error)
            }
        }
    )

    // undefined为显式跳过成功处理，是针对拦截下来的401错误的重试
    // 对于拦截器1中被拒的401在这进行入队处理
    instance.interceptors.response.use(undefined, async error =>{
        const auth = useAuthStore()
        const originalReq = error.config

        if (error.response?.status === 401 &&
            !originalReq._retry &&
            auth.refreshPromise
        ) {
            // promise创建，暂停当前请求
            // 回调中instance中返回promise
            // resolve触发原有promise
            return new Promise(resolve => {
                addRefreshSubscriber(token => {
                    // 实际的处理
                    originalReq.headers.Authorization = `Bearer ${token}`
                    // resolve调用即触发promise链重新执行
                    resolve(instance(originalReq))
                })
                // 后续添加超时的队列清理处理
            })
        }
    })
}