import {createRoot} from 'react-dom/client'
import '../src/styles/main.scss'
import {App} from './App.tsx'

createRoot(document.getElementById('root')!).render(
    <App/>
)
