import { renderR3F } from '@/test/utils'
import Earth from './Earth'

jest.mock('@react-three/drei', () => ({
  useGLTF: Object.assign(
    jest.fn(() => ({
      nodes: {
        Object_Planet_0: {
          geometry: {},
        },
      },
      materials: {
        Planet: null,
      },
    })), { preload: jest.fn() }),
}))

describe('<Earth />', () => {
  it('should render without crashing', async () => {
    await renderR3F(<Earth />)
  })

  it('should call onTransitionStart when the position changes', async () => {
    const onTransitionStart = jest.fn()

    const renderer = await renderR3F(
      <Earth
        speed={1}
        position={{ lat: 0, lng: 0 }}
        onTransitionStart={onTransitionStart}
      />,
    )

    // Rerender with a new position => triggers a tween
    await renderer.rerender(
      <Earth
        speed={1}
        position={{ lat: 10, lng: 20 }}
        onTransitionStart={onTransitionStart}
      />,
    )

    // You have to advance the clock twice for TWEEN to start the animation
    await renderer.advanceTimer(100)
    await renderer.advanceTimer(100)

    expect(onTransitionStart).toHaveBeenCalledTimes(1)
  })

  // TODO
  it.skip('should call onTransitionEnd after the transition duration', async () => {
    const onTransitionStart = jest.fn()
    const onTransitionEnd = jest.fn()
    const transitionDuration = jest.fn(() => 1000)

    const renderer = await renderR3F(
      <Earth
        speed={1}
        position={{ lat: 0, lng: 0 }}
        onTransitionStart={onTransitionStart}
        onTransitionEnd={onTransitionEnd}
        transitionDuration={transitionDuration}
      />,
    )

    await renderer.rerender(
      <Earth
        speed={1}
        position={{ lat: 10, lng: 20 }}
        onTransitionStart={onTransitionStart}
        onTransitionEnd={onTransitionEnd}
      />,
    )

    await renderer.advanceTimer(100)
    await renderer.advanceTimer(100)

    expect(onTransitionStart).toHaveBeenCalledTimes(1)

    await renderer.advanceTimer(1000)
    await renderer.advanceTimer(100)

    expect(onTransitionEnd).toHaveBeenCalledTimes(1)
  })
})
