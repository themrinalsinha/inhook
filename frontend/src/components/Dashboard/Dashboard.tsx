import { useEffect } from 'react'
import { Container } from '../Container'
import { NavBar } from './NavBar'
import { HookEndpoint } from './HookEndpoint'

export const Dashboard = () => {

  useEffect(() => {
    document.title = 'InHook - Dashboard'
  }, [])

  return (
    <Container className="h-screen bg-stone-50 mx-auto">
      <NavBar />
      <Container className="max-w-7xl mx-auto mt-2">
        <HookEndpoint />
      </Container>
    </Container>
  );
}
