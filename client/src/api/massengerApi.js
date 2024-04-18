import axios from 'axios';
import { backEndURL } from '../constants.js';

const url = backEndURL;
const baseRoute = '/api/conversations';
const config = {
	headers: { Authorization: null },
};
export const setMassengerToken = newToken => {
	config.headers.Authorization = `Bearer ${newToken}`;
};

export const fetchAllConversations = () => {
	return axios.get(url + baseRoute, config).then(res => res.data);
};

export const fetchOneConversation = (convId) => {
	return axios.get(`${url + baseRoute}/${convId}`, config);
};

export const sendMessage = ({ content, receiverId }) => {
	return axios.post(
		`${url + baseRoute}/messages/${receiverId}`,
		content,
		config
	);
};

export const deleteMessage = messageId => {
	return axios.delete(`${url + baseRoute}/messages/${messageId}`, config);
};

export const updateMessage = ({ messageId, newContent }) => {
	return axios.put(
		`${url + baseRoute}/messages/${messageId}`,
		newContent,
		config
	);
};
