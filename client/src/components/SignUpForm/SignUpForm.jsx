import './SignUpForm.css';
import { useState, useContext } from 'react';
import { userContext } from '../../context/UserContext';
import { register } from '../../api/authApi';
import Alarm from '../Alarm/Alarm';

export default function SignUpForm({ setShow }) {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [email, setEmail] = useState('');
	const [password2, setPassword2] = useState('');
	const [error, setError] = useState(null);

	const { setUser } = useContext(userContext);

	const changeInput = (e, setter) => {
		setter(e.target.value);
	};

	const submitHandle = e => {
		e.preventDefault();
		if (!username || !email || !password) {
			setError('invalid submission');
			return;
		}
		if (password !== password2) {
			setError('passwords are not matching');
			return;
		}
		register(
			{
				username,
				password,
				email,
			},
		).catch(err => {
			setError(err.response.data);
		});
	};

	const toggleShow = () => {
		setShow(s => !s);
	};
	return (
		<div className='loginFrom'>
			<form onSubmit={submitHandle}>
				{error && <Alarm err={error} />}
				<input
					placeholder='Username'
					type='text'
					value={username}
					onChange={e => changeInput(e, setUsername)}
				/>
				<input
					placeholder='Email'
					type='Email'
					value={email}
					onChange={e => changeInput(e, setEmail)}
				/>
				<input
					placeholder='Password'
					type='password'
					value={password}
					onChange={e => changeInput(e, setPassword)}
				/>
				<input
					placeholder='Password Again'
					type='password'
					value={password2}
					onChange={e => changeInput(e, setPassword2)}
				/>
				<button className='loginSubmit' type='submit'>
					Sign Up
				</button>
				<button
					className='loginCreateAccount'
					type='button'
					onClick={toggleShow}
				>
					Log into Account
				</button>
			</form>
		</div>
	);
}
