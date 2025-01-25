// Jest and React Testing Library tests
import { render, screen } from '@/test/utils'
import createStyledComponent from './create-styled-component'

describe('createStyledComponent', () => {
  test('should render component with base class name', () => {
    const StyledDiv = createStyledComponent('base-class', 'div')
    render(<StyledDiv className="additional-class" data-testid="styled-div" />)
    expect(screen.getByTestId('styled-div')).toHaveClass('base-class additional-class')
  })

  test('should render component without additional class', () => {
    const StyledSpan = createStyledComponent('base-class', 'span')
    render(<StyledSpan data-testid="styled-span" />)
    expect(screen.getByTestId('styled-span')).toHaveClass('base-class')
  })

  test('should infer component props correctly from the react element', () => {
    const StyledButton = createStyledComponent('btn', 'button')
    render(<StyledButton type="submit" data-testid="styled-button" />)
    expect(screen.getByTestId('styled-button')).toHaveAttribute('type', 'submit')

    // @ts-expect-error: 'href' is not a valid prop
    render(<StyledButton href="https://example.com" />)
  })

  test('should allow setting props explicitly with type checking', () => {
    type CustomProps = { href: string, className?: string }
    const StyledAnchor = createStyledComponent<CustomProps>('base-class', props => (
      <a data-testid="styled-anchor" className={props.className} href={props.href} />
    ))
    render(<StyledAnchor href="https://example.com" />)
    expect(screen.getByTestId('styled-anchor')).toHaveAttribute('href', 'https://example.com')

    // @ts-expect-error: 'type' is not a valid prop
    render(<StyledAnchor type="button" />)
  })
})
