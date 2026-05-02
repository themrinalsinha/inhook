import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from "react-router"
import App from './App.tsx'
import { Dashboard } from './components/Dashboard/Dashboard.tsx'
import { SharePage } from './components/Share/SharePage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/app" element={<Dashboard />} />
        <Route path="/share/:token" element={<SharePage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
