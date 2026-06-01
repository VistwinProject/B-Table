import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './style.css'

// No StrictMode: this is a long-running kiosk/projection, and StrictMode's
// dev-only double-invoke deadlocks AnimatePresence mode="wait" exits.
createRoot(document.getElementById('root')).render(<App />)
