import { Canvas } from '@react-three/fiber'
import Earth from './Earth'
import { Suspense } from 'react'

export default function World() {
  return (
    <Canvas>
      <Suspense fallback={null}>
        <Earth />
        <ambientLight intensity={2} />
      </Suspense>
    </Canvas>
  )
}
