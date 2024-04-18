import axios from 'axios';
import { setUserToken } from './userApi';
import { setPostToken } from './postsApi';
import { setMassengerToken } from './massengerApi';
import { backEndURL } from '../constants.js';

const url = backEndURL;
const authRoute = '/api/auth';

export const register = (credentials) => {
	return axios
		.post(`${url + authRoute}/register`, credentials)
		.then(res => res.data)
		.then(data => {
			window.localStorage.setItem('jwt', data.token);
			console.log(data);
		});
};

export const login = (credentials) => {
	return axios
		.post(`${url + authRoute}/login`, credentials)
		.then(res => res.data)
		.then(data => {
			if (!data) throw new Error('didnt receive any data');
			window.localStorage.setItem('jwt', data.token);
			setUserToken(data.token);
			setPostToken(data.token);
			setMassengerToken(data.token);
		});
};
