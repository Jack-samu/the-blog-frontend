import axios from "axios"
import { setupInterceptors } from "./interceptors"

const createClnt = () => {
    const instance = axios.create({
        baseURL: 'http://localhost:8088/',
        timeout: 15000,
        withCredentials: true,      // 允许携带凭证
        timeoutErrorMessage: '请求超时，检查网络连接'
    })

    setupInterceptors(instance)

    return instance
}

export default createClnt