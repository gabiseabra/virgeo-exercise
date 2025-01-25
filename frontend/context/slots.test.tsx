import { act, render, renderHook } from '@/test/utils'
import { SlotsProvider, createSlot, withSlot, useSlot } from './slots'

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
          <Fill>Hello, </Fill>
          <Fill>World</Fill>
        </div>
      </SlotsProvider>,
    )

    expect(container.innerHTML).toEqual('<div><div id="slot">Hello, World</div></div>')
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

  it('should get a type error and console error when children of arbitrary Slot is undefined', () => {
    const { Slot, Fill } = createSlot<() => void>()
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <SlotsProvider>
        <div>
          <div id="slot">
            {/* @ts-expect-error */}
            <Slot />
          </div>
          <Fill>{() => {}}</Fill>
        </div>
      </SlotsProvider>,
    )

    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining('Functions are not valid as a React child.'),
      'children', 'children', 'Slot', 'children', 'Slot',
    )
  })
})

describe('withSlots', () => {
  type TestProps = {
    values: string[]
  }
  const TestComponent = ({ values }: TestProps) => <div id="test">{values.join('')}</div>

  it('should compute final props with the given reducer', () => {
    const SlotFill = createSlot<TestProps>()
    const Component = withSlot(
      SlotFill,
      allProps => ({
        values: allProps.flatMap(({ values }) => ['(', values.join(','), ')']),
      }),
    )(TestComponent)

    const { container } = render(
      <SlotsProvider>
        <div>
          <Component values={[]} />
        </div>
        <Component.Config values={['a', 'b']} />
        <Component.Config values={['c', 'd']} />
      </SlotsProvider>,
    )

    expect(container.innerHTML).toEqual('<div><div id="test">(a,b)(c,d)</div></div>')
  })

  it('should pass Fill values to the wrapped component', () => {
    const SlotFill = createSlot<TestProps>()
    const Component = withSlot(SlotFill)(TestComponent)

    const { container } = render(
      <SlotsProvider>
        <div>
          <Component values={[]} />
          <SlotFill.Fill>{{ values: ['a', 'b'] }}</SlotFill.Fill>
        </div>
      </SlotsProvider>,
    )

    expect(container.innerHTML).toEqual('<div><div id="test">ab</div></div>')
  })
})

describe('useSlot', () => {
  it('should return the current values', () => {
    const SlotFill = createSlot()
    const { result } = renderHook(() => useSlot(SlotFill), {
      wrapper({ children }) {
        return (
          <SlotsProvider>
            <SlotFill.Fill>A</SlotFill.Fill>
            <SlotFill.Fill>B</SlotFill.Fill>
            {children}
          </SlotsProvider>
        )
      },
    })
    expect(result.current[0]).toEqual(['A', 'B'])
  })

  it('should add/remove elements in the slot', async () => {
    const SlotFill = createSlot()
    const { result } = renderHook(() => useSlot(SlotFill), {
      wrapper({ children }) {
        return (
          <SlotsProvider>
            {children}
          </SlotsProvider>
        )
      },
    })

    const addValue = (value: string) => result.current[1](value)

    expect(result.current[0]).toEqual([])

    const removeA = await act(() => addValue('A'))
    expect(result.current[0]).toEqual(['A'])

    await act(() => addValue('B'))
    expect(result.current[0]).toEqual(['A', 'B'])

    await act(() => removeA())
    expect(result.current[0]).toEqual(['B'])
  })
})
