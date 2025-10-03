import appLogo from '../../assets/inhook.png'
import { Link } from 'react-router'

export const NavBar = () => {
  return (
    <div className="flex justify-between items-center p-4 border-b border-b-neutral-200">
      <div>
        <Link to="/app">
          <img src={appLogo} alt="InHook - Dashboard" className="w-30" />
        </Link>
      </div>
      <div></div>
    </div>
  );
}
