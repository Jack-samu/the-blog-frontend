import createClnt from "../core/clnt"

const authClnt = createClnt('http://localhost:8088')

export const authApi = {
    register: (form) => authClnt.post('/auth/register', form),
    login: (form) => authClnt.post('/auth/login', form),
    getCode: (form) => authClnt.post('/auth/getcode', form),
    verify: (form) => authClnt.post('/auth/verify', form),
    logout: () => authClnt.post('/logout'),
    refresh: () => authClnt.post('/auth/refresh', null, {
        headers: {Authorization: `Bearer ${localStorage.getItem('refreshToken')}`}
    }),
    setAvatar:(form) => authClnt.post('/auth/set-avatar', form, {
        headers: {'content-type': 'multipart/form-data'}
    })
}