import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from "react-router"
import App from './App.tsx'
import { Dashboard } from './components/Dashboard/Dashboard.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/app" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
