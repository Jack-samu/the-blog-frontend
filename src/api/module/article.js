import createClnt from "../core/clnt"

const articleClient = createClnt('http://localhost:8088')

export const articleApi = {
    getList: (page) => articleClient.get('/articles', {params: {page, per_page: 10}}),
    getOne: (title) => articleClient.get(`/articles/${title}`),
    create: (form) => articleClient.post('/articles/publish', form),
    save: (form) => articleClient.post('/articles/save', form),
    uploadImage: (form) => articleClient.post('/upload-img', form, {
        headers: {'Content-Type': 'multipart/form-data'}
    }),
    delete: (id) => articleClient.delete(`/articles/${id}`),
}