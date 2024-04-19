import './LoginForm.css';
import { useState  } from 'react';
import { login } from '../../api/authApi';
import Alarm from '../Alarm/Alarm';

const isEmail = email => {
	return email.includes('@');
};

export default function LoginForm({ setShow }) {
	const [usernameOrEmail, setUsernameOrEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState(null);

	const changeInput = (e, setter) => {
		setter(e.target.value);
	};

	const submitHandle = e => {
		e.preventDefault();
		if (!usernameOrEmail || !password) {
			setError('invalid username or password');
			return;
		}
		login(
			{
				username: isEmail(usernameOrEmail) ? null : usernameOrEmail,
				password,
				email: isEmail(usernameOrEmail) ? usernameOrEmail : null,
			}
		).then(() => {
		    history.push('/');
			window.location.reload();
		}).catch(err => {
			setError("An unkown error has happened!");
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
					placeholder='Email or username'
					type='text'
					value={usernameOrEmail}
					onChange={e => changeInput(e, setUsernameOrEmail)}
				/>
				<input
					placeholder='Password'
					type='password'
					value={password}
					onChange={e => changeInput(e, setPassword)}
				/>
				<button className='loginSubmit' type='submit'>
					Log in
				</button>
				<a href='#'>Forgot password?</a>
				<button
					className='loginCreateAccount'
					type='button'
					onClick={toggleShow}
				>
					Create New Account
				</button>
			</form>
		</div>
	);
}
