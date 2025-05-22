import axios from "axios"
import { setupInterceptors } from "./interceptors"


const createClnt = (baseURL) => {
    const instance = axios.create({
        baseURL,
        timeout: 6000,
        withCredentials: true,      // 允许携带凭证
    })

    setupInterceptors(instance)

    return instance
}

export default createClnt