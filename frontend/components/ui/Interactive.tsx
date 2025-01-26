import styled from '@/utils/create-styled-component'
import * as Styles from './Interactive.module.scss'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean
}

export const Button = styled<ButtonProps>(Styles.button, ({
  loading,
  ...props
}: ButtonProps) => {
  return (
    <button data-loading={loading} {...props} />
  )
})
