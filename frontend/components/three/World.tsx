import { Canvas, RootState } from '@react-three/fiber'
import Earth from './Earth'
import { Suspense } from 'react'
import Universe from './Universe'

export default function World() {
  const handleCreated = (state: RootState) => {
    state.gl.setClearColor(0x000000)
  }
  if (process.env.NODE_ENV === 'test') {
    return null
  }
  return (
    <Canvas onCreated={handleCreated}>
      <Suspense fallback={null}>
        <Earth />
        <Universe />
        <ambientLight intensity={1} />
      </Suspense>
    </Canvas>
  )
}
