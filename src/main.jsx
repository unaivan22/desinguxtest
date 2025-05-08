import React from 'react'
import ReactDOM from 'react-dom/client'
// import App from './App.jsx'
import './index.css'
import RouterPage from './pages/RouterPage'
import { ThemeProvider } from "@/components/theme-provider"

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterPage />
    {/* <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
     
    </ThemeProvider> */}
  </React.StrictMode>,
)