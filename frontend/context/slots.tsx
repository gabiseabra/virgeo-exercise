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
 * @typeParam T - The type of the data stored in this slot (usually `React.ReactNode`).
 * @note When T is a ReactNode, the children prop is optional, and the default behavior is to render all values.
 * @note If no children function is provided, the slot will render all of the children as ReactNodes.
 */
export type SlotProps<T>
  = T extends React.ReactNode
    ? { children?: (values: T[]) => React.ReactNode }
    : { children: (values: T[]) => React.ReactNode }

/** @internal */
type SlotPropsT<T> = {
  id: Key
  /** Under the hood the function is actually required. */
  children: (values: T[]) => React.ReactNode
}

/**
 * A component that “consumes” all `<Fill>`s with the same `id`.
 *
 * Instead of directly rendering `<Fill>` contents, `<Slot>` calls the render prop `children`,
 * passing in an array of all filled values. You decide how to render them.
 * @internal
 */
function Slot<T>({ id, children }: SlotPropsT<T>) {
  const [slots] = useContext(SlotsContext)
  const filledValues = (slots[id] ?? []) as T[]
  return <>{children(filledValues)}</>
}

/**
 * @typeParam T - The type of the data stored by this fill (usually `React.ReactNode`).
 */
export type FillProps<T> = {
  /** The child value to fill into the slot. */
  children: T
}

/** @internal */
type FillPropsT<T> = {
  id: Key
  children: T
}

/**
 * A component that “provides” its children to the `<Slot>` with the matching `id`.
 *
 * @note `<Fill>` components with duplicate ids will render their children in the order they are mounted.
 * Each fill is appended to the array of values stored for the specified slot.
 */
function Fill<T>({ id, children }: FillPropsT<T>) {
  const [, setSlots] = useContext(SlotsContext)
  useEffect(() => {
    setSlots(addNode(id, children))
    return () => setSlots(removeNode(id, children))
  }, [id, children, setSlots])
  return null
}

/**
 * A pair of components that work together to create a slot/fill system.
 */
export type SlotFill<T> = {
  Slot: React.ComponentType<SlotProps<T>>
  Fill: React.ComponentType<FillProps<T>>
}

/**
 * Creates a paired `<Slot>` and `<Fill>` that share a unique id under the hood. This helps
 * avoid manually managing the `id` prop and ensures each pair is isolated.
 *
 * @typeParam T - The type of data passed to the `<Fill>` and returned in the `<Slot>` array.
 */
export const createSlot = <T = React.ReactNode>(): SlotFill<T> => {
  const id = Symbol()
  const defaultChildren = (values: T[]) => values as React.ReactNode[]
  return {
    Slot: ({ children = defaultChildren }) =>
      <Slot id={id}>{children}</Slot>,
    Fill: ({ children }) =>
      <Fill id={id}>{children}</Fill>,
  }
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
