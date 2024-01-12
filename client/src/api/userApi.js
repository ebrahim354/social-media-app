import axios from 'axios';

const url = 'http://localhost:5000';
const userRoute = '/api/users';
const friendsRoute = '/api/friends';

const config = {
	headers: { Authorization: null },
}

export const getLoggedUser = () => {
	console.log('fetching logged user...')
	return axios.get(url + userRoute, config).then(response => response.data)
}



export const getNotifications = async userId => {
	const res = await axios.get(url + userRoute + '/notifications', config).then(response => response.data);
	return res;
}
export const toggleFriendRequest = async userId => {
	const res = await axios.put(url + friendsRoute + '/friend-request/' + userId, {} , config);
	return res.data;
}

export const acceptFriendRequest = async userId => {
	const res = await axios.put(url + friendsRoute + '/accept-friend-request/' + userId, {} , config);
	return res.data;
}

export const unfriend = async userId => {
	const res = await axios.put(url + friendsRoute + '/unfriend/' + userId, {} , config);
	return res.data;
}



export const setUserToken = newToken => {
	config.headers.Authorization = `Bearer ${newToken}`
}

export const uploadProfilePicture = async newPic => {
	const res = await axios.post(url + userRoute + '/upload-profile-picture', newPic , config);
	return res.data.data.profile_picture;
};

export const uploadCoverPicture = async newCoverPic => {
	const res = await axios.post(url + userRoute + '/upload-cover-picture', newCoverPic , config);
	return res.data.data.cover_picture;
};


export const getUser = id => {
	return axios.get(`${url + userRoute}/${id}`, config).then(res => res.data);
}

export const getUsersWithQuery = async searchQuery => {
	return axios.get(`${url + userRoute}/search/${searchQuery}`, config).then(res => res.data);
}

export const updateUser = updates => {
	return axios.put(url + userRoute, { updates }, config).then(res => res.data);
}

export const deleteUser = () => {
	return axios.delete(url + userRoute, config).then(res => res.data);
}
