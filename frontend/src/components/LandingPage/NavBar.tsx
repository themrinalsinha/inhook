import appLogo from '../../assets/inhook.png'

const NavBarButton = ({ children }: { children: React.ReactNode }) => {
  return (
    <button
      className="text-gray-500 hover:text-blue-700 transition-colors duration-300
      hover:cursor-pointer font-medium"
    >
      {children}
    </button>
  )
}

export const NavBar = () => {
  return (
    <div className="flex justify-between items-center py-4 mx-4">
      <img
        src={appLogo}
        alt="InHook - Webhook Inspector & Debugger"
        className="w-35"
      />
      <div className="flex gap-8 text-gray-500">
        <NavBarButton>About</NavBarButton>
        <NavBarButton>Docs</NavBarButton>
        <NavBarButton>Github</NavBarButton>
      </div>
    </div>
  );
}
