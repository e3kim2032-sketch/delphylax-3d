import { createRoot } from 'react-dom/client'
import '../index.css'
import './pitch.css'
import { Deck } from './Deck'
import { warmFonts } from './offline'

warmFonts()

createRoot(document.getElementById('root')!).render(<Deck />)
