import createClnt from "../core/clnt"

const authClnt = createClnt()

export const authApi = {
    register: (form) => authClnt.post('/auth/register', form),
    login: (form) => authClnt.post('/auth/login', form),
    getCode: (form) => authClnt.post('/auth/getcode', form),
    verify: (form) => authClnt.post('/auth/verify', form),
    logout: () => authClnt.get('/logout'),
    refresh: (token) => authClnt.post('/auth/refresh', null, {
        headers: {Authorization: `Bearer ${token}`}
    }),
    setAvatar:(form) => authClnt.post('/auth/set-avatar', form, {
        headers: {'content-type': 'multipart/form-data'}
    }),
    heartbeat: () => authClnt.get('/health'),
    getProfile: (id) => authClnt.get(`/auth/${id}/profile`),
    getPhotos: (id) => authClnt.get(`/auth/${id}/photos`),
}