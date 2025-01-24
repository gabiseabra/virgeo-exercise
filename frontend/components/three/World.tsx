import { Canvas, RootState } from '@react-three/fiber'
import { createSlot, withSlot } from '@/context/slots'
import Earth from './Earth'
import Universe from './Universe'

type WorldProps = {
  /** Set to false to pause the spinning animation */
  spinning?: boolean
  center: { x: number, y: number }
  onTransitionEnd?: () => void
  onTransitionStart?: () => void
  transitionDuration?: number
}

const SlotFill = createSlot<WorldProps>('WorldProps')

/** The default center of the world */
const Rio = { x: -43.1729, y: -22.9068 }

const World = withSlot(SlotFill)(function World({
  spinning = true,
  center = Rio,
  onTransitionEnd,
  onTransitionStart,
  transitionDuration,
}) {
  const handleCreated = (state: RootState) => {
    state.gl.setClearColor(0x000000)
  }

  if (process.env.NODE_ENV === 'test') {
    return null
  }
  return (
    <Canvas onCreated={handleCreated}>
      <Earth
        speed={0.1}
        spinning={spinning}
        position={center}
        onTransitionEnd={onTransitionEnd}
        onTransitionStart={onTransitionStart}
        transitionDuration={transitionDuration}
      />
      <Universe />
      <ambientLight intensity={1} />
    </Canvas>
  )
})

export default World
