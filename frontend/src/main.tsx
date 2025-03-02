import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// Import Mantine core styles
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'

// Import ReactFlow styles
import 'reactflow/dist/style.css'

// Import local styles
import './styles/globals.css'
import './styles/reactflow.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
