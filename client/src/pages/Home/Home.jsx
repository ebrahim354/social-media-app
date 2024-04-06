import Topbar from '../../components/Topbar/Topbar';
import Rightbar from '../../components/Rightbar/Rightbar';
import Leftbar from '../../components/Leftbar/Leftbar';
import Feed from '../../components/Feed/Feed';
import { fetchTimeline } from '../../api/postsApi';
import { useContext, useEffect, useState } from 'react';
import './Home.css';
import { userContext } from '../../context/UserContext';

const Home = ({cachedConversations, setCachedConversations}) => {
	const { user } = useContext(userContext);
	const [timeline, setTimeline] = useState([]);

	useEffect(() => {
		if (!user) return;
		console.log('hello');
		fetchTimeline()
			.then(res => {
				console.log(res);
				setTimeline(res.data.data.timeline);
				console.log('time line is set!');
			})
			.catch(err => {
				console.log('err');
				console.log(err.response.data);
				// window.location.reload();
			});
	}, [user]);

    if(window.innerWidth < 900 || window.outerWidth < 500)  return <SmallScreen />
	if (!user) {
		return <div>loading...</div>;
	}
	return (
		<>
			<Topbar />
			<div className='homeContainer'>
				<Leftbar cachedConversations={cachedConversations} setCachedConversations={setCachedConversations}/>
				<Feed
					posts={timeline}
					user={user}
					userToShowId={user.id}
					setTimeline={setTimeline}
				/>
				<Rightbar />
			</div>
		</>
	);
};

export default Home;
