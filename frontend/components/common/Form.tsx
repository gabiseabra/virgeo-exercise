import styled from '@/utils/create-styled-component'
import * as Styles from './Form.module.scss'

export const Form = styled(Styles.form, 'form')
export const Field = styled(Styles.field, 'label')
export const Label = styled(Styles.label, 'span')
export const TextInput = styled(Styles.input, 'input')

export default Object.assign(Form, {
  Field,
  Label,
  TextInput,
})
