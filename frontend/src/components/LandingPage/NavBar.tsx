import appLogo from '../../assets/inhook.png'

const NavBarButton = ({ children, href }: { children: React.ReactNode, href: string }) => {
  return (
    <a
      className="text-gray-500 hover:text-blue-500 transition-colors duration-300
      hover:cursor-pointer font-medium"
      target="_blank"
      rel="noopener"
      href={href}
    >
      {children}
    </a>
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
        <NavBarButton href="#">About</NavBarButton>
        <NavBarButton href="#">Docs</NavBarButton>
        <NavBarButton href="https://github.com/themrinalsinha/inhook">
          Github
        </NavBarButton>
      </div>
    </div>
  );
}
