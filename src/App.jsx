import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Canvas from './components/canvas'

function App() {
  return (
    <>
      <Canvas width={1000} height={500}/>
    </>
  )
}

export default App
