import { ElMessage } from "element-plus"
import router from "../../router"



export const setupInterceptors = (instance) => {

    // 请求拦截器
    instance.interceptors.request.use(config =>{
        const token = localStorage.getItem('token')
        config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json'
        if (token)
            config.headers.Authorization = `Bearer ${token}`
        return config
    })

    // 响应拦截器
    instance.interceptors.response.use(
        response => {
            if (response.status >= 200 || response.status < 300)
                return response
            return Promise.reject(response.data)
        }, 
        error => {
            const status = error.response?.status
            const msg = error.response?.data?.err || error.message
            // 后续进行更加精细的拆解

            switch(status) {
                case 401:
                    handleUnauthorized()
                    break
                case 404:
                    // 后续进行更加细致的拆分，对于部分404不需要进行页面跳转
                    if (!error.response?.config.url.startWith('/article/')) break
                    handleNotFound()
                    break
            }
            ElMessage.error({
                message:  msg,
                duration: 6000,
            })
            console.error(error.response)
            return Promise.reject(error)
        }
    )
}


const handleUnauthorized = () => {
    ElMessage.error({
        message:  msg,
        duration: 5000,
    })
    localStorage.clear()
    router.push('/notready')
}


const handleNotFound = () => {
    router.push('/404')
}