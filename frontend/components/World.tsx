import { Canvas } from '@react-three/fiber'
import Earth from './Earth'
import { Suspense } from 'react'
import * as Styles from './World.module.scss'

export default function World() {
  return (
    <div className={Styles.wrapper}>
      <Canvas>
        <Suspense fallback={null}>
          <Earth />
          <ambientLight intensity={2} />
        </Suspense>
      </Canvas>
    </div>
  )
}
