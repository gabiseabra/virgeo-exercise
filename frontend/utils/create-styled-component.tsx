import * as React from 'react'
import getDisplayName from './get-display-name'

export type InferProps<C extends React.ElementType> = React.ComponentPropsWithoutRef<C>

/**
 * An utility function to create a styled component by injecting a base class name.
 * @overload
 * @template Component - A React element type (e.g., 'div', 'span', or a functional component).
 *                       The props of the styled component will be inferred from this type.
 */
function createStyledComponent<Component extends React.ElementType>(
  baseClassName: string,
  component: Component,
): React.ComponentType<InferProps<Component>>
/**
 * Overload function that allows explicit typing of props.
 * @overload
 * @template Props - The inferred props from the given component.
 */
function createStyledComponent<Props extends { className?: string }>(
  baseClassName: string,
  component: React.ComponentType<Props>,
): React.ComponentType<Props>
/** */
function createStyledComponent<C extends React.ElementType>(
  baseClassName: string,
  component: C,
) {
  const WrappedComponent = React.forwardRef((
    { className, ...props }: InferProps<C>,
    ref: React.Ref<React.ElementType>,
  ) => {
    return React.createElement(component, {
      ref,
      className: [baseClassName, className].filter(Boolean).join(' '),
      ...props,
    })
  })
  WrappedComponent.displayName = `Styled(${getDisplayName(component)})`

  return WrappedComponent
}

export default createStyledComponent
