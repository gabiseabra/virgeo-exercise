/**
 * This module provides a context-based mechanism to manage slot and fill components in a React application.
 * It works like portals, but instead of rendering a component in a different part of the DOM, it renders it
 * in a different part of the component tree.
 */
import getDisplayName from '@/utils/get-display-name'
import React, { createContext, Fragment, Key, SetStateAction, useCallback, useContext, useEffect, useId, useMemo, useState } from 'react'

type SetState<T> = React.Dispatch<React.SetStateAction<T>>

type StoredItem<T> = [Key, T]

type Slots = Record<string, StoredItem<unknown>[]>

type ReactNodeSlotProps<T extends React.ReactNode> = {
  children?: (values: StoredItem<T>[]) => React.ReactNode
}

type ArbitrarySlotProps<T> = {
  children: (values: StoredItem<T>[]) => React.ReactNode
}

type FillProps<T> = {
  id?: string
  children: T
}

type SlotFill<T> = T extends React.ReactNode ? ReactNodeSlotFill<T> : ArbitrarySlotFill<T>

type ReactNodeSlotFill<T extends React.ReactNode> = {
  id: string
  Slot: React.ComponentType<ReactNodeSlotProps<T>>
  Fill: React.ComponentType<FillProps<T>>
}

type ArbitrarySlotFill<T> = {
  id: string
  Slot: React.ComponentType<ArbitrarySlotProps<T>>
  Fill: React.ComponentType<FillProps<T>>
}

export const SlotContext = createContext<Slots>({})

export function useSlot<T extends React.ReactNode>(SlotFill: ReactNodeSlotFill<T>): StoredItem<T>[]
export function useSlot<T>(SlotFill: ArbitrarySlotFill<T>): StoredItem<T>[]
export function useSlot<T>({ id }: { id: string }): StoredItem<T>[]
export function useSlot<T>({ id }: { id: string }): StoredItem<T>[] {
  const slots = useContext(SlotContext)
  return useMemo(() => slots[id] as StoredItem<T>[] || [], [slots])
}

export const FillContext = createContext<SetState<Slots>>(() => {})

export function useFill<T extends React.ReactNode>(SlotFill: ReactNodeSlotFill<T>): SetState<Array<StoredItem<T>>>
export function useFill<T>(SlotFill: ArbitrarySlotFill<T>): SetState<Array<StoredItem<T>>>
export function useFill<T>({ id }: { id: string }): SetState<Array<StoredItem<T>>>
export function useFill<T>({ id }: { id: string }): SetState<Array<StoredItem<T>>> {
  const setSlots = useContext(FillContext)
  return useCallback((updater: SetStateAction<Array<StoredItem<T>>>) => {
    setSlots((prevSlots) => {
      const current = (prevSlots[id] || []) as Array<StoredItem<T>>
      const next = (typeof updater === 'function') ? updater(current) : updater
      return {
        ...prevSlots,
        [id]: next,
      }
    })
  }, [id, setSlots])
}

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

function createSlot<T>({ id }: SlotFill<T>): React.FC<ArbitrarySlotProps<T>> {
  const defaultChildren = (values: StoredItem<T>[]) =>
    values.map(([key, value]) => (
      <Fragment key={key}>{value as React.ReactNode}</Fragment>
    ))
  return Object.assign(({ children = defaultChildren }: ArbitrarySlotProps<T>) => {
    const slotValues = useSlot<T>({ id })
    return <>{children(slotValues)}</>
  }, {
    displayName: `Slot(${String(id)})`,
  })
}

function createFill<T>({ id: slotId }: SlotFill<T>): React.FC<FillProps<T>> {
  return Object.assign(({ id: fillId, children }: FillProps<T>) => {
    const setSlot = useFill<T>({ id: slotId })
    const generatedId = useId()
    const uniqueId = fillId || generatedId

    // Update the slot when the children change
    useEffect(() => {
      setSlot((prev) => {
        const index = prev.findIndex(([key]) => key === uniqueId)
        if (index !== -1) {
          // Replace the existing item
          return prev.toSpliced(index, 1, [uniqueId, children])
        }
        else {
          // Add the new item to the end of the array
          return [...prev, [uniqueId, children]]
        }
      })
    }, [children, uniqueId, setSlot])

    // Remove the slot when the component unmounts
    useEffect(() => {
      return () => {
        setSlot(prev => prev.filter(([key]) => key !== uniqueId))
      }
    }, [children, uniqueId, setSlot])

    return null
  }, {
    displayName: `Fill(${String(slotId)})`,
  })
}

export function createSlotFill<T extends React.ReactNode>(id: string): ReactNodeSlotFill<T>
export function createSlotFill<T>(id: string): ArbitrarySlotFill<T>
export function createSlotFill<T>(id: string): SlotFill<T> {
  return {
    id,
    Slot: createSlot({ id } as SlotFill<T>),
    Fill: createFill({ id } as SlotFill<T>),
  } as SlotFill<T>
}

export function withSlot<T extends object>(
  { id, Slot, Fill }: ArbitrarySlotFill<T>,
  reduceProps: (values: T[], initialValue: T) => T = defaultReduceProps,
) {
  return (Component: React.ComponentType<T>) =>
    Object.assign((initialValue: T) => {
      return (
        <Slot>
          {(values: StoredItem<T>[]) => (
            <Component
              key={String(id)}
              {...reduceProps(values.map(([, v]) => v), initialValue)}
            />
          )}
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
