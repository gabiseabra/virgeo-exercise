import { act, render, renderHook } from '@/test/utils'
import { SlotFillProvider, createSlotFill, withSlot, useSlot, useFill } from './slots'

describe('createSlot', () => {
  it('should render the content of Fill in Slot', () => {
    const { Slot, Fill } = createSlotFill<React.ReactNode>('test') // Default type = React.ReactNode
    const { container } = render(
      <SlotFillProvider>
        <div>
          <div id="slot">
            <Slot />
          </div>
          <Fill>Test</Fill>
        </div>
      </SlotFillProvider>,
    )

    expect(container.innerHTML).toEqual('<div><div id="slot">Test</div></div>')
  })

  it('should render duplicated Fill in the order they are defined', () => {
    const { Slot, Fill } = createSlotFill<React.ReactNode>('test')
    const { container } = render(
      <SlotFillProvider>
        <div>
          <div id="slot">
            <Slot />
          </div>
          <Fill>Hello, </Fill>
          <Fill>World</Fill>
        </div>
      </SlotFillProvider>,
    )

    expect(container.innerHTML).toEqual('<div><div id="slot">Hello, World</div></div>')
  })

  it('should isolate Slot/Fill pairs from each other', () => {
    const A = createSlotFill<React.ReactNode>('A')
    const B = createSlotFill<React.ReactNode>('B')

    const { container } = render(
      <SlotFillProvider>
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
      </SlotFillProvider>,
    )

    expect(container.innerHTML).toEqual('<div><div id="A">A</div><div id="B">B</div></div>')
  })

  it('should render arbitrary types', () => {
    const { Slot, Fill } = createSlotFill<number>('test')
    const { container } = render(
      <SlotFillProvider>
        <div>
          <div id="slot">
            <Slot>{values => values.reduce((acc, [, v]) => acc + v, 0)}</Slot>
          </div>
          <Fill>{1}</Fill>
          <Fill>{2}</Fill>
        </div>
      </SlotFillProvider>,
    )

    expect(container.innerHTML).toEqual('<div><div id="slot">3</div></div>')
  })

  it('should get a type error and console error when children of arbitrary Slot is undefined', () => {
    const { Slot, Fill } = createSlotFill<() => void>('test')
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <SlotFillProvider>
        <div>
          <div id="slot">
            {/* @ts-expect-error */}
            <Slot />
          </div>
          <Fill>{() => {}}</Fill>
        </div>
      </SlotFillProvider>,
    )

    expect(consoleError).toHaveBeenCalledTimes(1)
    expect(consoleError.mock.lastCall?.[0]).toEqual(
      expect.stringContaining('Functions are not valid as a React child.'),
    )
  })
})

describe('withSlots', () => {
  type TestProps = {
    values: string[]
  }
  const TestComponent = ({ values }: TestProps) => <div id="test">{values.join('')}</div>

  it('should compute final props with the given reducer', () => {
    const SlotFill = createSlotFill<TestProps>('test')
    const Component = withSlot(
      SlotFill,
      allProps => ({
        values: allProps.flatMap(({ values }) => ['(', values.join(','), ')']),
      }),
    )(TestComponent)

    const { container } = render(
      <SlotFillProvider>
        <div>
          <Component values={[]} />
        </div>
        <Component.Config values={['a', 'b']} />
        <Component.Config values={['c', 'd']} />
      </SlotFillProvider>,
    )

    expect(container.innerHTML).toEqual('<div><div id="test">(a,b)(c,d)</div></div>')
  })

  it('should pass Fill values to the wrapped component', () => {
    const SlotFill = createSlotFill<TestProps>('test')
    const Component = withSlot(SlotFill)(TestComponent)

    const { container } = render(
      <SlotFillProvider>
        <div>
          <Component values={[]} />
          <SlotFill.Fill>{{ values: ['a', 'b'] }}</SlotFill.Fill>
        </div>
      </SlotFillProvider>,
    )

    expect(container.innerHTML).toEqual('<div><div id="test">ab</div></div>')
  })
})

describe('useSlot', () => {
  it('should return the current values', () => {
    const SlotFill = createSlotFill('test')
    const { result } = renderHook(() => useSlot(SlotFill), {
      wrapper({ children }) {
        return (
          <SlotFillProvider>
            <SlotFill.Fill id="a">A</SlotFill.Fill>
            <SlotFill.Fill id="b">B</SlotFill.Fill>
            {children}
          </SlotFillProvider>
        )
      },
    })
    expect(result.current).toEqual([['a', 'A'], ['b', 'B']])
  })
})

describe('useFill', () => {
  it('should add/remove elements in the slot', async () => {
    const slotRef: React.Ref<React.ReactNode[] | null> = { current: null }
    const SlotFill = createSlotFill('test')
    const { result } = renderHook(() =>
      useFill(SlotFill), {
      wrapper({ children }) {
        return (
          <SlotFillProvider>
            <SlotFill.Slot>
              {(values) => {
                slotRef.current = values
                return null
              }}
            </SlotFill.Slot>
            {children}
          </SlotFillProvider>
        )
      },
    })

    expect(slotRef.current).toEqual([])

    await act(() => {
      result.current([['a', 'A']])
    })
    expect(slotRef.current).toEqual([['a', 'A']])

    await act(() => {
      result.current(as => [...as, ['b', 'B']])
    })
    expect(slotRef.current).toEqual([['a', 'A'], ['b', 'B']])

    await act(() => {
      result.current(as => as.filter(([key]) => key !== 'a'))
    })
    expect(slotRef.current).toEqual([['b', 'B']])
  })
})
