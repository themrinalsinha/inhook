import appLogo from '/inhook.png'

export const NavBar = () => {
  return (
    <div className="flex justify-between items-center p-4 border-b border-b-neutral-200">
      <div>
        <img src={appLogo} alt="InHook - Dashboard" className="w-30" />
      </div>
      <div></div>
    </div>
  );
}
