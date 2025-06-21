import createClnt from "../core/clnt"

const commentClnt = createClnt()

export const commentApi = {
    getComments: (id) => commentClnt.get(`/articles/${id}/comments`),
    getReplies: (id) => commentClnt.get(`/comments/${id}/replies`),
    addComment: (form) => commentClnt.post('/articles/comments', form),
    addReply: (form) => commentClnt.post('/comments/replies', form),
    modifyComment: (form) => commentClnt.post(`/comments/modify`, form),
    modifyReply: (form) => commentClnt.post(`/replies/modify`, form),
    deleteComment: (id) => commentClnt.delete(`/comments/${id}`),
    deleteReply: (id) => commentClnt.delete(`/replies/${id}`),
    toggleLike: (form) => commentClnt.post('/comments/likes', form),
}