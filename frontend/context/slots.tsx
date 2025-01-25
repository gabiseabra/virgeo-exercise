/**
 * This module provides a context-based mechanism to manage slot and fill components in a React application.
 * It works like portals, but instead of rendering a component in a different part of the DOM, it renders it
 * in a different part of the component tree.
 */
import getDisplayName from '@/utils/get-display-name'
import { createContext, SetStateAction, useCallback, useContext, useEffect, useState } from 'react'

type SetState<T> = React.Dispatch<React.SetStateAction<T>>
type Slots = { [k: Key]: unknown[] }
type Key = string | symbol

/**
 * Slot props when T is a ReactNode.
 * @note If no children function is provided, the slot will render all of the children as ReactNodes.
 */
export type ReactNodeSlotProps<T extends React.ReactNode> = {
  children?: (values: T[]) => React.ReactNode
}

/**
 * Slot props when T is an arbitrary type.
 */
export type ArbitrarySlotProps<T> = {
  children: (values: T[]) => React.ReactNode
}

/** */
export type FillProps<T> = {
  /** The child value to fill into the slot. */
  children: T
}

/**
 * A pair of components that work together to create a slot/fill system.
 */
export type SlotFill<T> = T extends React.ReactNode ? ReactNodeSlotFill<T> : ArbitrarySlotFill<T>

export type ReactNodeSlotFill<T extends React.ReactNode> = {
  id: Key
  Slot: React.ComponentType<ReactNodeSlotProps<T>>
  Fill: React.ComponentType<FillProps<T>>
}

export type ArbitrarySlotFill<T> = {
  id: Key
  Slot: React.ComponentType<ArbitrarySlotProps<T>>
  Fill: React.ComponentType<FillProps<T>>
}

/**
 * The context used to store all current slot values.
 */
export const SlotContext = createContext<Slots>({})

export function useSlot<T extends React.ReactNode>(SlotFill: ReactNodeSlotFill<T>): T[]
export function useSlot<T>(SlotFill: ArbitrarySlotFill<T>): T[]
export function useSlot<T>({ id }: { id: Key }): T[]
export function useSlot<T>({ id }: { id: Key }): T[] {
  const slots = useContext(SlotContext)
  return slots[id] as T[] ?? []
}

/**
 * The context used to store the slot provider's state's setter.
 */
export const FillContext = createContext<SetState<Slots>>(() => {})

export function useFill<T extends React.ReactNode>(SlotFill: ReactNodeSlotFill<T>): SetState<T[]>
export function useFill<T>(SlotFill: ArbitrarySlotFill<T>): SetState<T[]>
export function useFill<T>({ id }: { id: Key }): SetState<T[]>
export function useFill<T>({ id }: { id: Key }): SetState<T[]> {
  const setSlots = useContext(FillContext)
  return useCallback((node: SetStateAction<T[]>) => {
    setSlots(slots => ({
      ...slots,
      [id]: node instanceof Function ? node(slots[id] as T[] ?? []) : node,
    }))
  }, [id, setSlots])
}

/**
 * Provides the slots state to children, allowing `<Slot>` and `<Fill>` components to communicate which nodes should be
 * rendered for a given slot id.
 */
export function SlotFillProvider({ children }: { children: React.ReactNode }) {
  const [slots, setSlots] = useState<Slots>({})
  return (
    <SlotContext.Provider value={slots}>
      <FillContext.Provider value={setSlots}>
        {children}
      </FillContext.Provider>
    </SlotContext.Provider>
  )
}

/**
 * A component that “consumes” all `<Fill>`s with the same `id`.
 *
 * Instead of directly rendering `<Fill>` contents, `<Slot>` calls the render prop `children`,
 * passing in an array of all filled values. You decide how to render them.
 *
 * @note If no children function is provided, the slot will render all of the children as ReactNodes.
 * @note Slot should handle
 * @internal
 */
function Slot<T>({ id, children }: ArbitrarySlotProps<T> & { id: Key }) {
  const slot = useSlot<T>({ id })
  return <>{children(slot)}</>
}

/**
 * A component that “provides” its children to the `<Slot>` with the matching `id`.
 *
 * @note `<Fill>` components with duplicate ids will append their children to the list of slot items in the order they
 *       are mounted.
 * @internal
 */
function Fill<T>({ id, children }: FillProps<T> & { id: Key }) {
  const setSlot = useFill<T>({ id })
  useEffect(() => {
    setSlot((nodes: T[]) => [...nodes, children])
    return () => setSlot((nodes: T[]) => nodes.filter(a => a !== children))
  }, [children, setSlot])
  return null
}

/**
 * Creates a paired `<Slot>` and `<Fill>` that share a unique id under the hood. This helps
 * avoid manually managing the `id` prop and ensures each pair is isolated.
 *
 * @typeParam T - The type of data passed to the `<Fill>` and returned in the `<Slot>` array.
 */
export function createSlotFill<T extends React.ReactNode>(name?: Key): ReactNodeSlotFill<T>
export function createSlotFill<T>(name?: Key): ArbitrarySlotFill<T>
export function createSlotFill<T>(id: Key = Symbol()): SlotFill<T> {
  const defaultChildren = (values: T[]) => values as React.ReactNode[]
  return {
    id,
    Slot: ({ children = defaultChildren }: ArbitrarySlotProps<T>) =>
      <Slot id={id}>{children}</Slot>,
    Fill: ({ children }) =>
      <Fill id={id}>{children}</Fill>,
  } as SlotFill<T>
}

/**
 * A higher-order component that wraps a component with a `<Slot>` component and passes down its values as props.
 */
export function withSlot<T extends object>(
  /** The slot/fill pair to use. */
  { id, Slot, Fill }: ArbitrarySlotFill<T>,
  /** A function that maps the slot values to props. */
  reduceProps: (values: T[], initialValue: T) => T = defaultReduceProps,
) {
  return (Component: React.ComponentType<T>) =>
    Object.assign((initialValue: T) => {
      return (
        <Slot>
          {(values: T[]) => <Component key={String(id)} {...reduceProps(values, initialValue)} />}
        </Slot>
      )
    }, {
      displayName: `withSlot(${String(id)})(${getDisplayName(Component)})`,
      Config: (props: Partial<T>) => <Fill>{props as T}</Fill>,
    })
}

function defaultReduceProps<T extends object>(values: T[], initialValue: T) {
  return values.reduce((acc, value) => ({
    ...acc,
    ...value,
  }), initialValue)
}
