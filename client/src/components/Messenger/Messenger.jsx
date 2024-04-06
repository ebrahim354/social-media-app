import { useRef, useContext, useEffect, useState } from 'react';
import './messenger.css';
import { userContext } from '../../context/UserContext';
import { selectedConversationContext } from '../../context/selectedConversation';
import { fetchOneConversation } from '../../api/massengerApi';
import {sendMessage, openConversation} from '../../api/socketAPI';
import { timeSince } from '../../utils/dateUtils';



const Message = ({ user, authorId , content, createdAt }) => {
	const myMessage = parseInt(user.id) == parseInt(authorId);
	let author = user;
	if(!myMessage){
		const match = user.friends.filter(f => f.id == authorId);
		if(match.length) author = match[0];
	}
	const src = author.profilePicture ? author.profilePicture : '/person/noAvatar.png';
	const name = !myMessage ? 'leftMessage' : 'rightMessage';
	const dir = !myMessage ? 'Left' : 'Right';
	return (
		<div className='messageContainer'>
			<div className={name}>
				<img src={src} alt='' className='messageImg' />
				<span className='messageContent'>{content}</span>
			</div>
			<span className={`messageTime${dir}`}>{timeSince(createdAt)}</span>
		</div>
	);
};


const Messenger = ({ cachedConversations, setCachedConversations }) => {
	const [currentConversation, setCurrentConversation] = useState(null);
	const { selectedConversation } = useContext(selectedConversationContext);
	const { user, setUser } = useContext(userContext);
	const scrollBar = useRef(null);
	const [ message, setMessage ] = useState('');


	const inputFocusHandler = () => {
		openConversation(selectedConversation);
		user.unread_conversations = user.unread_conversations.filter(uc => uc != selectedConversation);
		setUser({...user});
	}

	const submitMessage = async e => {
		e.preventDefault();
		if (!message) return;
		try {
			const conversationId = selectedConversation;
			console.log(conversationId);
			sendMessage(conversationId, message);
			setMessage('');
		} catch (err) {
			setMessage('');
		}
	};

	useEffect(() => {
		scrollBar.current.scrollIntoView({behavior: "smooth", block:"end", });
		console.log('go down', currentConversation);
	}, [currentConversation]);

	useEffect(() => {
		console.log('cach update');
		if(currentConversation) {
			console.log('cach update', cachedConversations[currentConversation.id]);
			setCurrentConversation({...cachedConversations[currentConversation.id]});
		}
	},[cachedConversations]);

	useEffect(() => {
		if(selectedConversation && String(selectedConversation) in cachedConversations){
			setCurrentConversation(cachedConversations[selectedConversation]);
		} else if(selectedConversation){
			// did not find it in the context, Need to fetch it.
			fetchOneConversation(selectedConversation).then(res => {
				const conv = res.data.data.conversation;
				const convId = conv.id;
				console.log('fetchinig conv');
				setCachedConversations((ccs) => {
					console.log('setting new conv', conv);
					ccs[convId] = conv;
					return {...ccs};
				});
				setCurrentConversation(conv);
			})
		} else {
			setCurrentConversation(null);
		}
	}, [selectedConversation]);


	return (
		<div className='messenger'>
				<div className='messengerMiddle'>
					<ul className='messengerMiddleSpace'>
						{!currentConversation ? (
							<div>
								There are no current conversations choose a friend and start
								conversation with them !!
							</div>
						) : currentConversation.messages.length ? (
							currentConversation.messages.map(msg => (
								<Message
									user={user}
									authorId = {parseInt(msg.author)}
									content={msg.content}
									key={msg.id}
									createdAt={msg.createdAt}
								/>
							))
						) : (
							<div>Say Hi!</div>
						)}
					<li ref={scrollBar}></li>
					</ul>
					{currentConversation && (
						<form className='sendMessageForm' onSubmit={(e) => submitMessage(e)}>
							<input
								className='sendMessageInput'
								placeholder='Write something...'
								type='description'
								value={message}
								onFocus={() => inputFocusHandler()}
								onChange={e => setMessage(e.target.value)}
							/>
							<button
								className={`${
									message
										? 'sendMessageButtonActive'
										: 'sendMessageButtonPassive'
								}`}
								type='submit'
								disabled={!message}
							>
								send
							</button>
						</form>
					)}
				</div>
		</div>
	);
};

export default Messenger;
