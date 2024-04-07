import './Topbar.css';
import { Search, Person, Notifications, RestaurantRounded } from '@material-ui/icons';
import {getUsersWithQuery, getNotifications} from '../../api/userApi';
import { useHistory } from 'react-router-dom';
import { userContext } from '../../context/UserContext';
import { useContext, useEffect, useRef, useState } from 'react';
import { defaultAvatar } from '../../constants';
import { socketEvents } from '../../api/socketAPI';



const NotificationList = () => {
	const [closed, setClosed] = useState(true);
	const { user } = useContext(userContext);
	const [requestSent, setRequestSent] = useState(false);
	const [notifications, setNotifications] = useState([]);
	const [curUnseen, setCurUnseen] = useState(Number(user.unseen_notifications));

	useEffect(() => {
		document.addEventListener(socketEvents.notificationSent, (e) => {
            console.log(e);
			setRequestSent(false);
			setCurUnseen(curUnseen+1);
		});
	}, []);

	
	const handleClick = async () =>{
		setClosed(!closed);
		if(requestSent){
			return;
		}
		const notes = await getNotifications(user.id);
		setNotifications([...notes]);
		setRequestSent(true);
		setCurUnseen(0);
	}


	return (
		<span className='topbarIcon'>
			<div onClick={() => {handleClick()}}>
				<Notifications />
				{closed && curUnseen != 0 && <span className='topbarIconAlert'>{curUnseen}</span>}
			</div>
			{!closed &&
				<div className='friendRequestList'>
					{!!notifications.length && notifications.map(note => (
					<li className='friendRequestItem' key={note.id}>
						<div className='friendRequestImgWrapper' >
							<img
								src={note.img || defaultAvatar}
								alt={note.id}
							/>
						</div>
						<span className='friendRequestName'>{note.name + " " + note.content}</span>
					</li>
					))}
					{
						!notifications.length && <div className='emptyList'>No current notifications</div>
					}
				</div>
				}
		</span>
	);
} 

const FriendRequests = ({friendRequests}) => {
	const [closed, setClosed] = useState(true);
	const history = useHistory();
	
	
	const handleClick = () => {
		setClosed(!closed);
	}

	const handleItemClick = (senderId) => {
		history.push(`/profile/${senderId}`);
	}


	return (
		<span className='topbarIcon'>
			<div onClick={() => handleClick()}>
				<Person />
				{closed && !!friendRequests.length && <span className='topbarIconAlert'>{friendRequests.length}</span>}
			</div>
			{!closed &&
				<div className='friendRequestList'>
					{!!friendRequests.length && friendRequests.map(friend => (
					<li className='friendRequestItem' key={friend.username} onClick={() => handleItemClick(friend.id)}>
						<div className='friendRequestImgWrapper' >
							<img
								src={friend.profilePicture || defaultAvatar}
								alt={friend.username}
							/>
						</div>
						<span className='friendRequestName'>{friend.username}</span>
					</li>
					))}
					{
						!friendRequests.length && <div className='emptyList'>No current requests</div>
					}
				</div>
			}
		</span>
	);
} 

const Topbar = () => {
	const { user, setUser } = useContext(userContext);
	const [results, setResults] = useState([]);
	const [friendRequests, setFriendRequests] = useState([]);
	const searchQueryRef = useRef();

	useEffect(() => {
		setFriendRequests([...user.friendrequests]);
	}, [user]);

	const history = useHistory();
	const logoClickHandle = () => {
		history.push('/');
	};

	const handleLogout = () => {
		setUser(null);
		window.localStorage.removeItem('jwt');
		history.push('/');
		window.location.reload();
	};

	const handleSearchQuery = async e => {
		if(e.target.value == ''){ 
			setResults([]);
			return;
		}
		const newResults = await getUsersWithQuery(e.target.value);
		console.log(newResults);
		setResults(newResults);
	}

	const profilePictureClick = () => {
		history.push('/profile');
		window.location.reload();
	};
	
	const gotoProfile = id => {
		history.push(`/profile/${id}`);
		window.location.reload();
		// setResults([]);
		// searchQueryRef.current.value = '';
	};

	const timelineClick = () => {
		history.push('/');
	}

	if(!user) return (<div className='topbarContainer'>
			<div className='topbarLeft'>
				<span className='logo' onClick={logoClickHandle}>
					LiFacebook
				</span>
			</div>
		</div>);
	else return (
		<div className='topbarContainer'>
			<div className='topbarLeft'>
				<span className='logo' onClick={logoClickHandle}>
					LiFacebook
				</span>
			</div>
			<div className='topbarCenter'>
				<div className='searchBar'>
					<Search />
					<input
						placeholder='Search for friends'
						type='text'
						className='searchInput'
						onChange={handleSearchQuery}
						ref={searchQueryRef}
					/>
				</div>
					<div className='searchResults'>
						{results.map(result => (
						<li className='searchResultsItem' key={result.username} onClick={() => gotoProfile(result.id)}>
							<div className='searchResultImgWrapper' >
								<img
									src={result.profilePicture || defaultAvatar}
									alt={result.username}
								/>
							</div>
							<span className='searchResultName'>{result.username}</span>
						</li>
						))}
					</div>
			</div>
			<div className='topbarRight'>
				<div className='topbarLinks'>
					<span className='topbarLink' onClick={handleLogout}>
						Logout
					</span>
					<span className='topbarLink' onClick={() => timelineClick()}>
						Timeline
					</span>
				</div>
				<div className='topbarIcons'>
					<FriendRequests friendRequests={friendRequests} />
					<NotificationList  />
				</div>
				<img
					className='pfpc'
					alt='profile'
					src={user.profilePicture || defaultAvatar}
					onClick={() => profilePictureClick()}
				/>
			</div>
		</div>
	);
};

export default Topbar;
