import './profileContent.css';
import Feed from '../../components/Feed/Feed';
import { useState, useEffect, useRef  } from 'react';
import { fetchUserPosts } from '../../api/postsApi';
import { uploadProfilePicture, uploadCoverPicture, toggleFriendRequest, acceptFriendRequest, unfriend  } from '../../api/userApi';
import { getUser } from '../../api/userApi';
import Clickable from '../Clickable/Clickable';
import { defaultAvatar, defaultCover } from '../../constants';
import {CameraAlt} from '@material-ui/icons';



const FriendRequest = ({currentUser, areFriends, friendRequestSent, profileId}) => {
	const friendRequestReceived = !!currentUser.friendrequests.filter(f => f.id == profileId).length;
	const [txt, setTxt] = useState("");
	useEffect(() => {
		console.log('frr', currentUser.friendrequests);
		if(areFriends) setTxt("Unfriend");
		else if(friendRequestSent) setTxt("Cancel Request");
		else if(friendRequestReceived) setTxt("Accept Request");
		else setTxt("Friend Request");
	}, []);
	const FriendRequestHandler = async () => {
		console.log('pfid', profileId);
		if(txt == "Cancel Request"){
			await toggleFriendRequest(profileId);
			setTxt("Friend Request");
		} else if(txt == "Friend Request"){
			await toggleFriendRequest(profileId);
			setTxt("Cancel Request");
		} else if(txt == "Accept Request"){
			await acceptFriendRequest(profileId);
			setTxt("Unfriend");
		} else {
			await unfriend(profileId);
			setTxt("Friend Request");
		}
	}
	if(currentUser.id == profileId || !profileId) return null; 
	return <button className='FriendRequestButton' onClick={() => FriendRequestHandler()}>{txt}</button>;
}

export default function ProfileContent({profileId, currentUser}) {
	const [posts, setPosts] = useState([]);
	const [user, setUser] = useState(null);

	const [postsLoading, setPostsLoading] = useState(true);
	const [userLoading, setUserLoading] = useState(true);

	const chooseProfilePicRef = useRef();
	const chooseCoverPicRef = useRef();


	const uploadProfilePic = async e => {
		//console.log(e.target.files[0]);
		const data = new FormData();
		const pfp = e.target.files[0];
		data.append('file', pfp);
		const profilePicture = await uploadProfilePicture(data);
		setUser({...user, profilePicture});
	};

	const uploadCoverPic = async e => {
		const data = new FormData();
		const cPicture = e.target.files[0];
		data.append('file', cPicture);
		const coverPicture = await uploadCoverPicture(data);
		setUser({...user, coverPicture});
	};


	useEffect(() => {
		if(!profileId && currentUser) profileId = currentUser.id;
		console.log('fetching posts for profile content.');
		getUser(profileId).then(usr => {
			console.log('user for profile', usr);
			if(!usr.friends) usr.friends = [];
			usr.profilePicture = usr.profile_picture;
			usr.coverPicture = usr.cover_picture;
			delete usr.profile_picture;
			delete usr.cover_picture;
			setUser(usr);
			setUserLoading(false);
		})
		fetchUserPosts(profileId)
			.then(res => res.data.data.posts)
			.then(posts => {
				console.log('posts: ', posts);
				setPostsLoading(false);
				setPosts(posts);
			});
	}, [currentUser]);


	if(userLoading) return (<>Loading...</>);
	else return (
		<div className='profileContentContainer'>
			<div className='profileContentHeader'>
				<div className='profileBanner'>

					<div className='profileCoverCover'
						onClick={() => {
							chooseCoverPicRef.current.click();
						}}
					>
						<input
							type='file'
							name='file'
							ref={chooseCoverPicRef}
							accept='.png,.jpeg,.jpg'
							className='sharePhotoChooseFile'
							onChange={uploadCoverPic}
						/>
						<CameraAlt />
					</div>


					<img
						className='profileCover'
						src={user.coverPicture || defaultCover}
						alt='user cover'
					/>
					<div className='profileHeaderPictureCover' 
						onClick={() => {
							chooseProfilePicRef.current.click();
						}}
					>
						<input
							type='file'
							name='file'
							ref={chooseProfilePicRef}
							accept='.png,.jpeg,.jpg'
							className='sharePhotoChooseFile'
							onChange={uploadProfilePic}
						/>
						<CameraAlt />
					</div>
					<img
						className='profileHeaderPicture'
						src={user.profilePicture || defaultAvatar}
						alt='user profile'
					/>
				</div>
				<h2 className='profileCoverName'>{user.username || 'unknown'}</h2>
				<span className='profileCoverDesc'>{user.desc || ''}</span>
			</div>
			<div className='profileContentBody'>
				{!postsLoading && (
					<Feed posts={posts} userToShowId={profileId} user={currentUser} />
				)}
				<div className='profileBodyUser'>
					<FriendRequest currentUser={currentUser} profileId={profileId} areFriends={user.areFriends} friendRequestSent={user.friendRequestSent} />
					<h2>User Friends</h2>
					<div className='profileBodyUserFriends'>
						{user.friends.map(friend => {
							return (
								<Clickable
									key={friend.id}
									onClick={() => {
										// setUserLoading(true)
										// setPostsLoading(true)
									}}
									link={`/profile/${friend.id}`}
								>
									<div className='profileBodyFriend'>
										<img src={friend.profilePicture} alt='' />
										<span>{friend.username}</span>
									</div>
								</Clickable>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}
