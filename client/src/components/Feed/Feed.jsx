import './Feed.css';
import Share from '../Share/Share';
import Post from '../Post/Post';

const Feed = ({ posts, user, userToShowId, setTimeline }) => {
	if (!posts) return <div>Loading...</div>;
	return (
		<div className='feed'>
			<div className='feedWrapper'>
				{userToShowId === user.id && (
					<Share
						profilePicture={user.profilePicture}
						setTimeline={setTimeline}
					/>
				)}
				<ul className='feedPostsList'>
					{posts.map(p => (
						<Post key={p.id} post={p} userId={user.id} />
					))}
				</ul>
			</div>
		</div>
	);
};

export default Feed;
