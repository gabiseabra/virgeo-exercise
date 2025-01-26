import { Canvas, RootState } from '@react-three/fiber'
import Earth from './Earth'
import Universe from './Universe'
import AnimatedCamera from './Camera'

/** The default center of the world */
const Rio = { lat: -22.9068, lng: -43.1729 }

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
        speed={1}
        position={Rio}
      />
      <Universe />
      <AnimatedCamera
        makeDefault
        fov={75}
        zoom={1}
        position={[0, 0, 5]}
        rotation={[0, 0, 0]}
      />

      {/* Ambient light for overall illumination */}
      <ambientLight intensity={1} />

      {/* Directional light to mimic sunlight */}
      <directionalLight
        intensity={1}
        position={[10, 10, 10]}
        castShadow
      />

      <fog
        attach="fog"
        args={[0x000000, 100, 3000]}
      />
    </Canvas>
  )
}
