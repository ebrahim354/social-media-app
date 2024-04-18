import {socketURL} from '../constants.js';
const SOCKET_URL = socketURL;
export let ws = null;
let token = null;
export let socketEvents =  {
	init: "INIT",
	userJoined: "USER_JOINED",
	userLeft: "USER_LEFT",
	messageSent: "MESSAGE_SENT",
	conversationSeen: "CONVERSATION_SEEN",
	notificationSent: "NOTIFICATION_SENT",
};


const initHandler = data => {
	const onlineFriends = data.onlineFriends;
	console.log('hello from socket init', onlineFriends);
	const e = new CustomEvent(socketEvents.init, {detail: onlineFriends});
	document.dispatchEvent(e);
}

const userJoinedHandler = data => {
	const joinedUser = data;
	console.log('hello from socket user joined', joinedUser);
	const e = new CustomEvent(socketEvents.userJoined, {detail: joinedUser});
	document.dispatchEvent(e);
}
const userLeftHandler = data => {
	const userId = data.userId;
	console.log('hello from socket user left', userId);
	const e = new CustomEvent(socketEvents.userLeft, {detail: userId});
	document.dispatchEvent(e);
}

const messageSentHandler = data => {
	const message = data.message;
	console.log('a message is sent from or to you', message);
	const e = new CustomEvent(socketEvents.messageSent, {detail: message});
	document.dispatchEvent(e);
}

const notificationSentHandler = data => {
	const notification = data;
	console.log('a notification is sent to you', notification);
	const e = new CustomEvent(socketEvents.notificationSent, {detail: notification});
	document.dispatchEvent(e);
}


export const sendMessage = (conversationId, content) => {
	const send_message = JSON.stringify({
		method: 'SEND_MESSAGE',
		data: {
			token,
			conversationId,
			content,
		},
	});
	ws.send(send_message);
}

export const openConversation = (conversationId) => {
	const send_message = JSON.stringify({
		method: 'OPEN_CONVERSATION',
		data: {
			token,
			conversationId,
		},
	});
	ws.send(send_message);
}


export const connectSocket = (token) => {
	console.log('socket called!');
	ws = new WebSocket(SOCKET_URL);
	ws.onopen = () => {
		authenticate(token);
	};

	ws.onmessage = msg => {
		const message = JSON.parse(msg.data);
		console.log('message from socket', message);
		const method = message.method;
		const data = message.data;
		if(method == socketEvents.init){
			initHandler(data); 
		} else if(method == socketEvents.userJoined){
			userJoinedHandler(data);
		} else if(method == socketEvents.userLeft){
			userLeftHandler(data);
		} else if(method == socketEvents.messageSent){
			messageSentHandler(data);
		} else if(method == socketEvents.notificationSent){
			notificationSentHandler(data);
		}
	};
};

const authenticate = new_token => {
	token = new_token;
	const payload = JSON.stringify({
		method: 'AUTHENTICATE',
		data: {
			token,
		},
	});
	ws.send(payload);
};


