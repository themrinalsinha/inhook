import { Link } from 'react-router'

export const Hero = () => {
  return (
    <div className="flex flex-grow flex-col items-center justify-center py-4 mx-4 mt-20">
      <h1 className="text-6xl font-semibold tracking-tight max-w-2xl text-center text-neutral-700 ">
        Self-hosted webhook inspector and debugger
      </h1>
      <p className="text-2xl font-medium max-w-2xl text-center text-neutral-500 mt-10">
        A single binary tool to capture, inspect and debug incoming webhooks in
        real time.
      </p>
      <p className="text-2xl font-bold text-center text-blue-500 mt-10">
        Free and open source
      </p>
      <Link
        to="/app"
        className="bg-blue-500 text-white px-4 py-2 rounded-full mt-10 hover:bg-blue-700
      hover:cursor-pointer transition-all duration-300 ease-in-out"
      >
        Get Started
      </Link>
    </div>
  );
}
