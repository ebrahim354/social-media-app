import './post.css';
import { MoreVert, ThumbUp } from '@material-ui/icons';
import { useState, useEffect, useRef, useContext } from 'react';
import { userContext } from '../../context/UserContext';
import {
	toggleLike,
	toggleCommentLike,
	addNewComment,
} from '../../api/postsApi';
import { timeSince } from '../../utils/dateUtils';
import TextInput from '../TextInput/TextInput';
import Clickable from '../Clickable/Clickable';
import { defaultAvatar } from '../../constants';

const Comment = ({ comment, userId }) => {
	const [liked, setLiked] = useState(false);
	const [likesCnt, setLikesCnt] = useState(0);
	const [extended, setExtended] = useState(() => {
		return comment.content.length < 50 ? true : false;
	});

	useEffect(() => {
		if (!comment) return <div>loading...</div>;
		setLikesCnt(comment.likes.length);
		if (comment.likes.find(usrId => parseInt(userId) === parseInt(usrId)))
			setLiked(true);
	}, [comment, userId]);

	const handleLike = () => {
		console.log('c.id', comment);
		toggleCommentLike(comment.id)
			.then(res => res.data)
			.then(data => {
				console.log(data);
				if (data.data.liked) {
					setLikesCnt(likesCnt + 1);
					console.log('you liked the post');
				} else {
					setLikesCnt(likesCnt - 1);
					console.log('you unliked the post');
				}
				setLiked(data.data.liked);
			});
	};

	return (
		<li className='postComment'>
			<div className='postCommentLeft'>
				<div className='postCommentUserImgContainer'>
					<Clickable link={`/profile/${comment.userId}`}>
						<img src={comment.profilePicture || defaultAvatar} alt='' />
					</Clickable>
				</div>
			</div>
			<div className='postCommentRight'>
				<div className='postCommentMain'>
					<span className='postCommentAuthor'>
						{comment.author}

						<div className='dropDownMenu'>
							<MoreVert />
						</div>
					</span>
					<p className='postCommentContent'>
						{extended ? comment.content : comment.content.slice(0, 50)}
					</p>
					{!extended && (
						<span className='readMore' onClick={() => setExtended(e => !e)}>
							Read more
						</span>
					)}
				</div>
				<div className='postCommentFooter'>
					<div className='postCommentFooterContainer'>
						<ThumbUp
							className='postFooterLike'
							onClick={handleLike}
							style={{ color: liked ? 'blue' : 'black' }}
						/>
						<span>{likesCnt}</span>
					</div>
					<span className='postCommentTime'>
						{timeSince(comment.createdAt)}
					</span>
				</div>
			</div>
		</li>
	);
};

const Comments = ({ comments, userId, extended }) => {
	if (!extended) {
		return (
			<ul className='postCommentsContainer'>
				<Comment comment={comments[0]} key={comments[0].id} userId={userId} />
			</ul>
		);
	}
	return (
		<ul className='postCommentsContainer'>
			{comments.map(c => (
				<Comment comment={c} key={c.id} userId={userId} />
			))}
		</ul>
	);
};

// we need the current userId to be seen by the entire app solve this later with context api
const Post = ({ post }) => {
	const [liked, setLiked] = useState(false);
	const [likesCnt, setLikesCnt] = useState(0);
	const [comments, setComments] = useState(post.comments);
	const [showComments, setShowComments] = useState(false);
	const addComment = useRef();
	const { user } = useContext(userContext);

	// console.log('userId:', userId)
	console.log('post:', post);

	useEffect(() => {
		if (!post) return <div>loading...</div>;
		setLikesCnt(post.likes.length);
		console.log('post likes: ', post.likes);
		if (post.likes.find(usrId => parseInt(user.id) === parseInt(usrId)))
			setLiked(true);
	}, [post, user.id]);

	const handleLike = () => {
		toggleLike(post.id)
			.then(res => res.data)
			.then(data => {
				console.log(data);
				if (data.data.liked) {
					setLikesCnt(likesCnt + 1);
					console.log('you liked the post');
				} else {
					setLikesCnt(likesCnt - 1);
					console.log('you unliked the post');
				}
			});
		setLiked(l => !l);
	};

	const addCommentHandler = e => {
		e.preventDefault();
		const newComment = {
			content: addComment.current.value,
		};
		addNewComment(post.id, newComment)
			.then(res => res.data.data.comment)
			.then(comment => {
				comment.author = user.username;
				comment.profilePicture = user.profilePicture;
				comment.createdAt = comment.created_at;
				comment.updatedAt = comment.updated_at;
				comment.likes = [];
				console.log('cmnt', comment);
				setComments(cmnts => cmnts.concat(comment));
			});
		addComment.current.value = '';
	};

	return (
		<div className='post'>
			<div className='postWrapper'>
				<div className='postHeader'>
					<div className='postImgContainer'>
						<Clickable link={`/profile/${post.author.id}`}>
							<img src={post.author.profilePicture || defaultAvatar} alt='' />
						</Clickable>
						<span className='postAuthor'>{post.author.username}</span>
						<span className='postTime'>{timeSince(post.created_at)}</span>
					</div>
					<div className='dropDownMenu'>
						<MoreVert />
					</div>
				</div>
				<div className='postContent'>
					<div className='postDesc'>{post.description}</div>
					<img src={post.img} alt='' />
				</div>
				<div className='postFooter'>
					<div className='postFooterContainer'>
						{/* <img src='./assets/like.png' alt='' /> */}
						{/* <img src='./assets/heart.png' alt='' /> */}
						<ThumbUp
							className='postFooterLike'
							onClick={handleLike}
							style={{ color: liked ? 'blue' : 'black' }}
						/>
						<span>{likesCnt} {likesCnt == 1 ? "person likes" : "people like"} this</span>
					</div>
					<span onClick={() => setShowComments(sc => !sc)}>
						{comments.length} comments
					</span>
				</div>
				{comments.length ? (
					<Comments
						comments={comments}
						userId={user.id}
						extended={showComments}
					/>
				) : null}
				<hr />
				<form onSubmit={addCommentHandler}>
					<TextInput inputRef={addComment} placeholder='Add a new comment' />
				</form>
			</div>
		</div>
	);
};

export default Post;
