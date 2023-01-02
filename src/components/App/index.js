import { useEffect } from "react"
import SmartCanvas from "../SmartCanvas"

const App = () => {

  useEffect(() => {

    const root = document.querySelector('#root')
    root.style.backgroundColor = '#333'
    
  }, [])

  return (
    <SmartCanvas 
      width={250}
      height={250}
      backgroundColor='white'
    />
  )
}

export default App
