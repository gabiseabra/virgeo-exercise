import React, { useId } from 'react'
import { FaCheckCircle, FaExclamationCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa'
import styled, { InferProps } from '@/utils/create-styled-component'
import * as Styles from './Feedback.module.scss'
import { createSlotFill, useFill } from '@/context/slots'

export type FeedbackVariant = 'success' | 'error' | 'warning' | 'info'

type BadgeProps = InferProps<'div'> & {
  variant: FeedbackVariant
  title?: React.ReactNode
  /**
   * Callback for the close button click event.
   * @note The close button will only be displayed if this prop is provided.
   */
  onDismiss?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

/**
 * A component to display feedback about a user action, e.g. an error message or empty state.
 * @note "A status is a type of **live region** providing advisory information that is **not important enough to justify an alert**"
 * @see https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/status_role
 */
export const Badge = styled<BadgeProps>(Styles.badge, ({
  variant,
  title,
  children,
  onDismiss,
  ...rest
}: BadgeProps) => {
  const titleId = useId()
  const messageId = useId()
  return (
    <div
      role="status"
      aria-live="polite"
      aria-labelledby={title && titleId}
      aria-describedby={messageId}
      data-variant={variant}
      {...rest}
    >
      <div className={Styles.badgeIcon}>
        {variant === 'success' && <FaCheckCircle />}
        {variant === 'error' && <FaExclamationCircle />}
        {variant === 'warning' && <FaExclamationTriangle />}
        {variant === 'info' && <FaInfoCircle />}
      </div>

      <div className={Styles.badgeBody}>
        {title && <div className={Styles.badgeTitle} id={titleId}>{title}</div>}
        <p id={messageId}>{children}</p>
      </div>

      {onDismiss
        ? (
            <button className={Styles.closeButton} type="button" onClick={onDismiss}>
              <FaTimes />
            </button>
          )
        : <div />}
    </div>
  )
})

const ToastSlotFill = createSlotFill<React.ReactNode>('Toast')

export function ToastContainer() {
  return (
    <div className={Styles.toastContainer}>
      <ToastSlotFill.Slot />
    </div>
  )
}

type UseToast = {
  show: (createNode: (close: () => void) => React.ReactNode, ms?: number) => void
} & {
  [variant in FeedbackVariant]: {
    (props: Omit<BadgeProps, 'variant'>, ms?: number): void
  }
}

const defaultDuration = 5000

/**
 * Provides a function that adds a toast to the toast slot for a specified duration.
 */
export function useToast(): UseToast {
  const setToast = useFill(ToastSlotFill)
  const show: UseToast['show'] = (createNode, ms) => {
    const id = new Date().getTime()
    const removeToast = () => setToast(nodes => nodes.filter(([key]) => key !== id))
    const toast = createNode(() => removeToast())
    setToast(nodes => [...nodes, [id, toast]])
    setTimeout(removeToast, ms)
  }
  const showVariant = (variant: FeedbackVariant) => (props: Omit<BadgeProps, 'variant'>, ms: number = defaultDuration) => {
    show(close => <Badge variant={variant} onDismiss={close} {...props} />, ms)
  }
  return {
    show,
    success: showVariant('success'),
    error: showVariant('error'),
    warning: showVariant('warning'),
    info: showVariant('info'),
  }
}
