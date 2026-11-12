import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// StrictMode is intentionally off: drei <Html> portals unmount synchronously and
// StrictMode's double-invoked effects trigger React 19 root-unmount warnings.
createRoot(document.getElementById('root')!).render(<App />)
