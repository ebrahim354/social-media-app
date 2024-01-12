import React from 'react';
import ReactDOM from 'react-dom';
import UserProvider from './context/UserContext';
import SelectedConversationProvider from './context/selectedConversation';
import App from './App';

ReactDOM.render(
	<UserProvider>
			<SelectedConversationProvider>
				<App />
			</SelectedConversationProvider>
	</UserProvider>,
	document.getElementById('root')
);
