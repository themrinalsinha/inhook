import { useEffect } from 'react'
import { Container } from '../Container'
import { NavBar } from './NavBar'
import { SidePanel } from './SidePanel'

export const Dashboard = () => {

  useEffect(() => {
    document.title = 'InHook - Dashboard'
  }, [])

  return (
    <Container>
      <NavBar />
      <SidePanel />
    </Container>
  );
}
