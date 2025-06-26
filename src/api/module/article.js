import createClnt from "../core/clnt"

const articleClient = createClnt()

export const articleApi = {
    getList: (page) => articleClient.get('/articles', {params: {page, per_page: 10}}),
    getDetail: (id) => articleClient.get(`/articles/${id}`),
    getPublishedArticles: (params) => articleClient.get('/articles/publish', {params: params}),
    getDrafts: (params) => articleClient.get('/articles/draft', {params: params}),
    getDraft: (id) => articleClient.get(`/drafts/${id}`),
    getSeries: () => articleClient.get('/articles/series'),
    publishArticle: (form) => articleClient.post('/articles/publish', form, {
        headers: {'Content-Type': 'application/json'}
    }),
    saveArticle: (form) => articleClient.post('/articles/save', form, {
        headers: {'Content-Type': 'application/json'}
    }),
    uploadAvatar: (form) => articleClient.post('/upload-img', form, {
        headers: {'Content-Type': 'multipart/form-data'}
    }),
    uploadImage: (form) => articleClient.post('/auth/upload-img', form, {
        headers: {'Content-Type': 'multipart/form-data'}
    }),
    deletePublish: (id) => articleClient.delete(`/articles/${id}`),
    deleteDraft: (id) => articleClient.delete(`/drafts/${id}`),
    deleteImg: (id) => articleClient.delete(`/img/${id}`),
}