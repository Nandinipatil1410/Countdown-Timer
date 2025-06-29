import { useState } from 'react'
import './App.css'
import CountdownTimer from './components/CountdownTimer'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
        <CountdownTimer />
    </>
  )
}

export default App
