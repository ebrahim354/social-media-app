import { Link } from 'react-router-dom';

const Clickable = ({ children, link }) => {
	return (
		<Link style={{ textDecoration: 'none', color: 'black' }} to={link}>
			{children}
		</Link>
	);
};

export default Clickable;
