/**
 * This module provides a context-based mechanism to manage slot and fill components in a React application. It works
 * like portals, but instead of rendering a component in a different part of the DOM, it renders it in a different part
 * of the component tree.
 * @example ```tsx
 * // JSX:
 * <div id="outer">
 *   <Slot id="X" />
 *   <div id="inner">
 *     <Fill id="X">Hello,</Fill>
 *     <Fill id="X">World!</Fill>
 *   </div>
 * </div>
 * // Renders:
 * <div id="outer">
 *   Hello,
 *   World!
 *   <div id="inner">
 *   </div>
 * </div>
 * ```
 */
import { createContext, useContext, useEffect, useState } from "react";

type UseState<T> = [T, React.Dispatch<React.SetStateAction<T>>]
type Slots = { [k: Key]: React.ReactNode[] }

type Key = string | symbol

export const SlotsContext = createContext<UseState<Slots>>([{}, () => {}])

export function SlotsProvider({ children }: { children: React.ReactNode }) {
  return (
    <SlotsContext.Provider value={useState({})}>
      {children}
    </SlotsContext.Provider>
  )
}

export function Slot({ id }: {
  id: Key
}) {
  const [slots] = useContext(SlotsContext);
  return slots[id] ?? null
}

/**
 * A component that fills a slot with its children.
 * @note <Fill> components with duplicate ids will render their children in the order they are mounted.
 */
export function Fill({ id, children }: {
  id: Key
  children: React.ReactNode
}) {
  const [, setSlots] = useContext(SlotsContext);
  useEffect(() => {
    setSlots(addNode(id, children));
    return () => setSlots(removeNode(id, children));
  }, [id, children]);
  return null;
}

const addNode = (id: Key, node: React.ReactNode) => (slots: Slots) => ({
  ...slots,
  [id]: [...(slots[id] ?? []), node]
})
const removeNode = (id: Key, node: React.ReactNode) => (slots: Slots) => ({
  ...slots,
  [id]: (slots[id] ?? []).filter((n) => n !== node)
})

/**
 * Creates a slot and fill component pair.
 */
export const createSlot = (id: string | symbol): {
  Slot: React.ComponentType
  Fill: React.ComponentType<{ children: React.ReactNode }>
} => ({
  Slot: () => <Slot id={id} />,
  Fill: ({ children }) => <Fill id={id}>{children}</Fill>
})
