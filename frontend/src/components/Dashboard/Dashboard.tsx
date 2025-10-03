import { useEffect } from 'react'
import { Container } from '../Container'
import { NavBar } from './NavBar'
import { SidePanel } from './SidePanel'
import { cn } from '../../libs/util'

export const Dashboard = () => {

  useEffect(() => {
    document.title = 'InHook - Dashboard'
  }, [])

  return (
    <Container className={cn(
      "h-screen mx-auto flex flex-col rounded-2xl m-2 border border-neutral-200"
    )}>
        <NavBar />
        <div className="flex flex-row h-full">
          <SidePanel />
          <div className="flex flex-col flex-4">

            <div className="flex flex-col">
              Request Header
            </div>
            <div className="flex flex-row h-75 border-b border-b-neutral-200">
              <div className="flex flex-1">

              </div>
              <div className="flex flex-1">

              </div>
            </div>
            <div>Request Body</div>
          </div>
        </div>
    </Container>
  );
}
