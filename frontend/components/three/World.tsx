import { Suspense } from 'react'
import { Canvas, RootState } from '@react-three/fiber'
import { createSlot, withSlot } from '@/context/slots'
import Earth from './Earth'
import Universe from './Universe'

type WorldProps = {
  /** Set to false to pause the spinning animation */
  spinning?: boolean
  center: { x: number, y: number }
}

const SlotFill = createSlot<WorldProps>('WorldProps')

const World = withSlot(SlotFill, as => as.reduce((acc, value) => ({ ...acc, ...value }), {
  spinning: true,
  center: {
    // Amsterdam
    x: 52.3667,
    y: 4.8945,
  },
}))(function World({ spinning, center }) {
  const handleCreated = (state: RootState) => {
    state.gl.setClearColor(0x000000)
  }

  if (process.env.NODE_ENV === 'test') {
    return null
  }
  return (
    <Canvas onCreated={handleCreated}>
      <Suspense fallback={null}>
        <Earth
          speed={spinning ? 0.1 : 0}
          position={center}
          onTransitionEnd={() => console.log('end')}
          onTransitionStart={() => console.log('start')}
        />
      </Suspense>
      <Universe />
      <ambientLight intensity={1} />
    </Canvas>
  )
})

export default World
