import { render } from '@/test/utils'
import { SlotsProvider, createSlot } from './slots'

describe('createSlot', () => {
  it('should render the content of Fill in Slot', () => {
    const { Slot, Fill } = createSlot<React.ReactNode>() // Default type = React.ReactNode
    const { container } = render(
      <SlotsProvider>
        <div>
          <div id="slot">
            <Slot />
          </div>
          <Fill>Test</Fill>
        </div>
      </SlotsProvider>,
    )

    expect(container.innerHTML).toEqual('<div><div id="slot">Test</div></div>')
  })

  it('should render duplicated Fill in the order they are defined', () => {
    const { Slot, Fill } = createSlot<React.ReactNode>()
    const { container } = render(
      <SlotsProvider>
        <div>
          <div id="slot">
            <Slot />
          </div>
          <Fill>Test</Fill>
          <Fill>Test2</Fill>
        </div>
      </SlotsProvider>,
    )

    expect(container.innerHTML).toEqual('<div><div id="slot">TestTest2</div></div>')
  })

  it('should isolate Slot/Fill pairs from each other', () => {
    const A = createSlot<React.ReactNode>()
    const B = createSlot<React.ReactNode>()

    const { container } = render(
      <SlotsProvider>
        <div>
          <div id="A">
            <A.Slot />
          </div>
          <div id="B">
            <B.Slot />
          </div>
          <A.Fill>A</A.Fill>
          <B.Fill>B</B.Fill>
        </div>
      </SlotsProvider>,
    )

    expect(container.innerHTML).toEqual('<div><div id="A">A</div><div id="B">B</div></div>')
  })

  it('should render arbitrary types', () => {
    const { Slot, Fill } = createSlot<number>()
    const { container } = render(
      <SlotsProvider>
        <div>
          <div id="slot">
            <Slot>{values => values.reduce((acc, v) => acc + v, 0)}</Slot>
          </div>
          <Fill>{1}</Fill>
          <Fill>{2}</Fill>
        </div>
      </SlotsProvider>,
    )

    expect(container.innerHTML).toEqual('<div><div id="slot">3</div></div>')
  })
})
