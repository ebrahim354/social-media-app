import { createContext, useState } from 'react';

export const selectedConversationContext = createContext(null);

const SelectedConversationProvider = ({ children }) => {
	const [selectedConversation, setSelectedConversation] = useState(null);

	return (
		<selectedConversationContext.Provider value={{ selectedConversation, setSelectedConversation }}>
			{children}
		</selectedConversationContext.Provider>
	);
};

export default SelectedConversationProvider;
