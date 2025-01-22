import { Canvas } from '@react-three/fiber'
import Earth from './Earth'
import { Suspense } from 'react'

export default function World() {
  if (process.env.NODE_ENV === 'test') {
    return null
  }
  return (
    <Canvas>
      <Suspense fallback={null}>
        <Earth />
        <ambientLight intensity={2} />
      </Suspense>
    </Canvas>
  )
}
