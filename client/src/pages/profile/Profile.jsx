import './profile.css';
import Topbar from '../../components/Topbar/Topbar';
import Leftbar from '../../components/Leftbar/Leftbar';
import ProfileContent from '../../components/ProfileContent/ProfileContent';
import { userContext } from '../../context/UserContext';
import { useContext } from 'react';
import { useParams } from 'react-router-dom';

export default function Profile({cachedConversations, setCachedConversations}) {
	let id = useParams().id;
	const token = window.localStorage.getItem('jwt');
	const { user } = useContext(userContext);
	console.log('yo came here', id, user);
	if(token && !user) return (<>Loading...</>);
	else {
		return(
			<>
				<Topbar />
				<div className='profileContainer'>
					{ ((user.id === id) || !id ) && <Leftbar cachedConversations={cachedConversations} setCachedConversations={setCachedConversations}/>}
					<ProfileContent profileId={id} currentUser={user}/>
				</div>
			</>
		)
	}
}
