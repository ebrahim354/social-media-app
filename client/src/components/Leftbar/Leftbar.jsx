import './Leftbar.css';
import Messenger from '../Messenger/Messenger';
import {Delete} from '@material-ui/icons';
import { useEffect, useState } from 'react';
import { selectedConversationContext} from '../../context/selectedConversation';
import { useContext } from 'react';

const Leftbar = ({cachedConversations, setCachedConversations}) => {
	const {selectedConversation, setSelectedConversation} = useContext(selectedConversationContext);

	const handleClick = () => {
		setSelectedConversation(null);
	}
	return (
		<div className='leftbar'>
			<div className='leftbarHeaderContainer'>
				<h1 className='leftbarHeader'>Messenger</h1>
				{ selectedConversation &&
					<button className='leftbarHeaderButton' onClick={() => handleClick()}>
						<Delete />
					</button>}
			</div>
			<div className='leftbarWrapper'>
			<hr/>
				{<Messenger cachedConversations={cachedConversations} setCachedConversations={setCachedConversations}/>}
			</div>
		</div>

	);
};

export default Leftbar;
