import React, { useId } from 'react'
import { FaCheckCircle, FaExclamationCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa'
import styled, { InferProps } from '@/utils/create-styled-component'
import * as Styles from './Feedback.module.scss'

type BadgeProps = InferProps<'div'> & {
  variant: 'success' | 'error' | 'warning' | 'info'
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
      aria-labelledby={title && titleId}
      aria-describedby={messageId}
      data-variant={variant}
      {...rest}
    >
      <div className={Styles.badgeIcon}>
        {variant === 'success' && <FaCheckCircle color={Styles.successColor} />}
        {variant === 'error' && <FaExclamationCircle color={Styles.errorColor} />}
        {variant === 'warning' && <FaExclamationTriangle color={Styles.warningColor} />}
        {variant === 'info' && <FaInfoCircle color={Styles.infoColor} />}
      </div>

      <div className={Styles.badgeBody}>
        {title && <div className={Styles.badgeTitle} id={titleId}>{title}</div>}
        <div id={messageId}>{children}</div>
      </div>

      {onDismiss && (
        <button className={Styles.closeButton} type="button" onClick={onDismiss}>
          <FaTimes />
        </button>
      )}
    </div>
  )
})
