import { useEffect } from 'react'
import { Container } from '../Container'

export const Dashboard = () => {

  useEffect(() => {
    document.title = 'InHook - Dashboard'
  }, [])

  return (
    <Container>
      <div>Dashboard</div>
    </Container>
  )
}
