import createClnt from "../core/clnt"

const commentClnt = createClnt('http://localhost:8088')

export const commentApi = {
    getComments: (id) => commentClnt.get(`/articles/${id}/comments`),
    getReplies: (id) => commentClnt.get(`/commens/${id}/replies`),
    addComment: (id, form) => commentClnt.post(`/articles/${id}/comments`, form),
    addReply: (id, form) => commentClnt.post(`/comments/${id}/replies`, form),
    modifyComment: (id, form) => commentClnt.post(`/comments/${id}/modify`, form),
    modifyReply: (id, form) => commentClnt.post(`/replies/${id}/modify`, form),
    deleteComment: (id) => commentClnt.delete(`/comments/${id}`),
    deleteReply: (id) => commentClnt.delete(`/replies/${id}`),
    commentLike: (id) => commentClnt.post(`/comments/${id}/like`),
    commentUnlike: (id) => commentClnt.post(`/comments/${id}/unlike`),
    commentLikeOrNot: (id) => commentClnt.post(`/comments/${id}/likeornot`),
}