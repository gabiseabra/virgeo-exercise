/**
 * This module provides a context-based mechanism to manage slot and fill components in a React application.
 * It works like portals, but instead of rendering a component in a different part of the DOM, it renders it
 * in a different part of the component tree.
 */
import { createContext, useContext, useEffect, useState } from 'react'

type UseState<T> = [T, React.Dispatch<React.SetStateAction<T>>]
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
export const SlotsContext = createContext<UseState<Slots>>([{}, () => {}])

/**
 * Provides the `SlotsContext` to children, allowing `<Slot>` and `<Fill>` components
 * to communicate which nodes should be rendered for a given slot id.
 */
export function SlotsProvider({ children }: { children: React.ReactNode }) {
  return (
    <SlotsContext.Provider value={useState({})}>
      {children}
    </SlotsContext.Provider>
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
  const [slots] = useContext(SlotsContext)
  const filledValues = (slots[id] ?? []) as T[]
  return <>{children(filledValues)}</>
}

/**
 * A component that “provides” its children to the `<Slot>` with the matching `id`.
 *
 * @note `<Fill>` components with duplicate ids will append their children to the list of slot items in the order they
 *       are mounted.
 * @internal
 */
function Fill<T>({ id, children }: FillProps<T> & { id: Key }) {
  const [, setSlots] = useContext(SlotsContext)
  useEffect(() => {
    setSlots(addNode(id, children))
    return () => setSlots(removeNode(id, children))
  }, [id, children, setSlots])
  return null
}

/**
 * Creates a paired `<Slot>` and `<Fill>` that share a unique id under the hood. This helps
 * avoid manually managing the `id` prop and ensures each pair is isolated.
 *
 * @typeParam T - The type of data passed to the `<Fill>` and returned in the `<Slot>` array.
 */
export function createSlot<T extends React.ReactNode>(name?: string): ReactNodeSlotFill<T>
export function createSlot<T>(name?: string): ArbitrarySlotFill<T>
export function createSlot<T>(name?: string): SlotFill<T> {
  const id = Symbol(name)
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
      displayName: `withSlot(${String(id)})(${Component.displayName ?? Component.name})`,
      Config: (props: Partial<T>) => <Fill>{props as T}</Fill>,
    })
}

function defaultReduceProps<T extends object>(values: T[], initialValue: T) {
  return values.reduce((acc, value) => ({
    ...acc,
    ...value,
  }), initialValue)
}

/** Misc functions */

// The following syntax is correct, and removing the comma breaks it, but there is an annoying bug with
// @stylisting/ts/comma-dangle that will remove it but it's impossible to turn off comma-dangle only for generics.
// TODO: use prettier instead
// eslint-disable-next-line @stylistic/comma-dangle
const addNode = <T,>(id: Key, node: T) => (slots: Slots) => ({
  ...slots,
  [id]: [...(slots[id] ?? []), node],
})
// eslint-disable-next-line @stylistic/comma-dangle
const removeNode = <T,>(id: Key, node: T) => (slots: Slots) => ({
  ...slots,
  [id]: (slots[id] ?? []).filter(n => n !== node),
})
