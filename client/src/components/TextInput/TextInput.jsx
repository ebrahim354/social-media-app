import './textInput.css';
import { useContext } from 'react';
import { userContext } from '../../context/UserContext';
import { defaultAvatar } from '../../constants';

const TextInput = ({ inputRef, placeholder }) => {
	const { user } = useContext(userContext);
	return (
		<div className='textInputWrapper'>
			<img src={user.profilePicture || defaultAvatar} alt='' />
			<input ref={inputRef} type='text' placeholder={placeholder} />
		</div>
	);
};

export default TextInput;
