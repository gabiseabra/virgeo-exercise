import { Canvas, RootState } from '@react-three/fiber'
import Earth from './Earth'
import Universe from './Universe'
import AnimatedCamera from './Camera'

/** The default center of the world */
const Rio = { x: -43.1729, y: -22.9068 }

export default function World() {
  const handleCreated = (state: RootState) => {
    state.gl.setClearColor(0x000000)
  }

  if (process.env.NODE_ENV === 'test') {
    return null
  }
  return (
    <Canvas onCreated={handleCreated}>
      <Earth
        spinning
        speed={1}
        position={Rio}
        transitionDuration={1000}
      />
      <Universe />
      <AnimatedCamera
        makeDefault
        fov={75}
        zoom={1}
        position={[0, 0, 5]}
        rotation={[0, 0, 0]}
        transitionDuration={1000}
      />
      <ambientLight intensity={1} />
    </Canvas>
  )
}
