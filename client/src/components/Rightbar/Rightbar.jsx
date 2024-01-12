import './Rightbar.css';
import { userContext } from '../../context/UserContext';
import { selectedConversationContext } from '../../context/selectedConversation';
import { useContext, useEffect, useState } from 'react';
import { defaultAvatar } from '../../constants';
import { Person, Chat } from '@material-ui/icons';
import { useHistory } from 'react-router-dom';
import { openConversation } from '../../api/socketAPI';

export const OnlineFriendsList = ({ friends, isOnline, unread }) => {
	const history = useHistory();
	const {setSelectedConversation} = useContext(selectedConversationContext);
	const [unreadConversations, setUnreadConversations] = useState([]);

	useEffect(() => {
		setUnreadConversations([...unread]);
	}, [unread]);


	const GoToProfile = ( profileId ) => {
		history.push(`/profile/${profileId}`);
	}
	const OpenConversation = (convId) => {
		console.log('open conv');
		openConversation(convId);
		setUnreadConversations(unreadConversations.filter(cid => cid != convId));
		setSelectedConversation(convId);
	}

	return (
		<ul>
			{friends.map(friend => {
				return (
					<li className='onlineFriendsItem' key={friend.username}>
						<div className='friendLeftSide'>
							<div className='onlineFriendsImgWrapper' >
								<img
									src={friend.profilePicture || defaultAvatar}
									alt={friend.username}
								/>
								{isOnline && <span className='isOnlineAlert'></span>}
							</div>
							<span className='onlineFriendName'>{friend.username}</span>
						</div>					
						<div className='friendRightSide'>
							<span className='rightbarIcon' onClick={() => GoToProfile(friend.id)}>
								<Person />
							</span>
							<span className='rightbarIcon' onClick={() => OpenConversation(friend.conversation_id)}>
								<Chat />
								{unreadConversations.includes(friend.conversation_id) 
								&& <span className='rightbarIconAlert'></span>}
							</span>
						</div>
					</li>
				);
			})}
		</ul>
	);
};

const Rightbar = () => {
	const { user } = useContext(userContext);
	const [unread, setUnread] = useState([]);
	useEffect(() => {
		setUnread([...user.unread_conversations]);
	}, [user])
	return (
		<div className='rightbar'>
			<div className='rightbarWrapper'>
				<h3 className='rightbarHeader'>Online Friends</h3>
				<hr/>
				<OnlineFriendsList isOnline={true} friends={
						user.friends.filter(f => user.onlineFriends.map(o => Number(o.id)).includes(Number(f.id)))
					} unread = {unread}/>
				<h3 className='rightbarHeader'>Offline Friends</h3>
				<hr/>
				<OnlineFriendsList isOnline={false} friends={
						user.friends.filter(f => user.onlineFriends && !user.onlineFriends.map(o => Number(o.id)).includes(Number(f.id)))
					} unread={unread}/>
			</div>
		</div>
	);
};

export default Rightbar;
