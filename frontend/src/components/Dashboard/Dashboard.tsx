import { useEffect } from 'react'
import { Container } from '../Container'
import { NavBar } from './NavBar'
import { HookEndpoint } from './HookEndpoint'

export const Dashboard = () => {

  useEffect(() => {
    document.title = 'InHook - Dashboard'
  }, [])

  return (
    <Container className="h-screen mx-auto bg-neutral-50/20 px-5">
      <NavBar />
      <Container className="max-w-7xl mx-auto mt-5">
        <HookEndpoint />
      </Container>
    </Container>
  );
}
