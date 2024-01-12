import axios from 'axios';

const url = 'http://localhost:5000';
const baseRoute = '/api/posts';
const baseUserRoute = '/api/users';
const config = {
	headers: { Authorization: null },
};
export const setPostToken = newToken => {
	config.headers.Authorization = `Bearer ${newToken}`;
};

export const fetchTimeline = () => {
	return axios.get(url + baseRoute, config).then(res => res.data);
};

export const fetchUserPosts = userId => {
	return axios.get(`${url + baseUserRoute}/${userId}/posts`, config);
};

export const createPost = newPost => {
	return axios.post(url + baseRoute, newPost, config);
};

export const updatePost = (postId, updatedPost) => {
	return axios.put(`${url + baseRoute}/${postId}`, updatedPost, config);
};

export const deletePost = postId => {
	return axios.delete(`${url + baseRoute}/${postId}`, config);
};

// returns true of the post is liked and false if the post is unliked
export const toggleLike = postId => {
	return axios.put(`${url + baseRoute}/${postId}/like`, {}, config);
};

export const toggleCommentLike = commentId => {
	return axios.put(
		`${url + baseRoute + '/likeComment'}/${commentId}`,
		{},
		config
	);
};

export const addNewComment = (postId, newComment) => {
	return axios.post(
		`${url + baseRoute}/${postId}/addComment`,
		newComment,
		config
	);
};

export const getPost = postId => {
	return axios.get(`${url + baseRoute}/${postId}`, config);
};
