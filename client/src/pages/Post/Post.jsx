import './Post.css';
import Topbar from '../../components/Topbar/Topbar';
import  PostComponent from '../../components/Post/Post';
import {getPost} from '../../api/postsApi';
import { userContext } from '../../context/UserContext';
import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function Post() {
	let postId = useParams().id;
	const [pst, setPst] = useState(null);
	const [cachedUser, setCachedUser] = useState(false);
	const {user} = useContext(userContext);
	useEffect(() => {
		if(!cachedUser && user) setCachedUser(true);
		console.log('cu', cachedUser);
	}, [user]);

	useEffect(() => {
		if(cachedUser && user){
			getPost(postId).then(res => {
				console.log('received post', res.data.data.post);
				setPst(res.data.data.post);
			});
		}
	}, [cachedUser]);
	if(!pst || !user) return (<>Loading...</>);
	else {
		return(
			<>
				<Topbar />
				<div className='postPageWrapper'>
					<div className='postPageContainer'>
						<PostComponent post={pst}/>
					</div>
				</div>
			</>
		)
	}
}
