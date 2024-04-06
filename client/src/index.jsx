import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.jsx';
import UserProvider from './context/UserContext';
import SelectedConversationProvider from './context/selectedConversation';


ReactDOM.render(
    <React.StrictMode>
	<UserProvider>
			<SelectedConversationProvider>
				<App />
			</SelectedConversationProvider>
	</UserProvider>
    </React.StrictMode>,
document.getElementById('root')
);
