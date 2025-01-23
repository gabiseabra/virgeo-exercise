import { Canvas, RootState } from '@react-three/fiber'
import Earth from './Earth'
import { Suspense, useEffect, useState } from 'react'
import Universe from './Universe'

export default function World() {
  const handleCreated = (state: RootState) => {
    state.gl.setClearColor(0x000000)
  }
  const [pos, setPos] = useState({ x: 0, y: 0 })
  useEffect(() => {
    setTimeout(() => {
      setPos({
        // Amsterdam
        x: 52.3667,
        y: 4.8945,
      })
    }, 3000)
  }, [])

  if (process.env.NODE_ENV === 'test') {
    return null
  }
  return (
    <Canvas onCreated={handleCreated}>
      <Suspense fallback={null}>
        <Earth
          speed={0.1}
          position={pos}
          onTransitionEnd={() => console.log('end')}
          onTransitionStart={() => console.log('start')}
        />
      </Suspense>
      <Universe />
      <ambientLight intensity={1} />
    </Canvas>
  )
}
