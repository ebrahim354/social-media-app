import { useEffect, useContext, useState } from 'react';
import Home from './pages/Home/Home';
import Profile from './pages/profile/Profile.jsx';
import Login from './pages/Login/Login';
import Post from './pages/Post/Post';
import {
	Redirect,
	Switch,
	BrowserRouter as Router,
	Route,
} from 'react-router-dom';
import { setPostToken } from './api/postsApi';
import { getLoggedUser, setUserToken } from './api/userApi';
import { userContext } from './context/UserContext';
import { setMassengerToken } from './api/massengerApi';
import { connectSocket, socketEvents} from './api/socketAPI';

const App = () => {
	const { user, setUser } = useContext(userContext);
	const [ cachedConversations, setCachedConversations ] = useState({});
	useEffect(() => {
		const token = window.localStorage.getItem('jwt');
        console.log(import.meta.env.VITE_BACK_END_URL);
		console.log('hey token', token)
		if (token) {
			setUserToken(token);
			setPostToken(token);
			setMassengerToken(token);
			getLoggedUser()
				.then(usr => {
					connectSocket(token);
					console.log('received the user: ', usr);
					usr.onlineFriends = [];
					setUser(usr);
					const user = usr;
					document.addEventListener(socketEvents.init, (e) => {	
						console.log("online friends:" , e.detail);
						console.log(user);
						if(user){
							console.log('hi');
							user.onlineFriends = e.detail;
							setUser({...user});
						}
					}, {});

					document.addEventListener(socketEvents.userJoined, (e) => {	
						console.log("user joined:" , e.detail);
						console.log(user && !user.onlineFriends.map(f => f.id).includes(e.detail.id));
						if(user && !user.onlineFriends.map(f => f.id).includes(e.detail.id)){
							user.onlineFriends.push(e.detail);
							console.log('updated user', user);
							setUser({...user});
						}
					});

					document.addEventListener(socketEvents.userLeft, (e) => {	
						console.log("user left:" , e.detail);
						if(user){
							user.onlineFriends = user.onlineFriends.filter(f => f.id != Number(e.detail));
							console.log('updated user', user);
							setUser({...user});
						}
					});

					document.addEventListener(socketEvents.messageSent, (e) => {
						console.log('event is fired o/ ', e);
						console.log(cachedConversations);
						const message = e.detail;
						if(cachedConversations[message.conversation_id]){
							const convId = message.conversation_id;
							setCachedConversations((ccs) =>{
								const new_ccs_json = JSON.stringify(ccs);
								const new_ccs = JSON.parse(new_ccs_json);
								new_ccs[convId].messages.push(message);
								console.log('a push has happened :)');
								console.log(new_ccs);
								return new_ccs;
							});
						}
						if(message.author != user.id){
							user.unread_conversations.push(message.conversation_id);
							console.log('updated on msg user', user);
							setUser({...user});
						}
					});
				})
				.catch(err => {
					console.log(err);
					window.localStorage.removeItem('jwt');
					setUserToken(null);
					setUser(null);
				});
		}

	}, []);

	return (
		<Router>
			<Switch>
				<Route path='/profile/:id'>
					{<Profile cachedConversations={cachedConversations} setCachedConversations={setCachedConversations}/>}
				</Route>
				<Route path='/profile'>
					{<Profile cachedConversations={cachedConversations} setCachedConversations={setCachedConversations}/>}
				</Route>
				<Route path='/login'>{!user ? <Login /> : <Redirect to='/' />}</Route>
				<Route path='/' exact>
					{user ? <Home cachedConversations={cachedConversations} setCachedConversations={setCachedConversations}/> : <Redirect to='/login' />}
				</Route>
				<Route path='/post/:id'>
					{<Post />}
				</Route>
			</Switch>
		</Router>
	);
};

export default App;
