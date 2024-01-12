import './login.css';
import { useState } from 'react';
import LoginForm from '../../components/LoginForm/LoginForm';
import SignUpForm from '../../components/SignUpForm/SignUpForm';

export default function Login() {
	const [showLogin, setShowLogin] = useState(true);

	return (
		<>
			<div className='loginPage'>
				<div className='loginContainer'>
					<div className='loginDesc'>
						<h1>LiFacebook</h1>
						<p>Connect with friends and the world around you on LiFacebook.</p>
					</div>
					{showLogin && <LoginForm setShow={setShowLogin} />}
					{!showLogin && <SignUpForm setShow={setShowLogin} />}
				</div>
			</div>
		</>
	);
}
