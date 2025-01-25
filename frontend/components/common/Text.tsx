import React, { JSX } from 'react'
import styled from '@/utils/create-styled-component'
import * as Styles from './Text.module.scss'

export const Title = styled<JSX.IntrinsicElements['h1'] & {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}>(Styles.title, ({ as = 'h1', ...props }) =>
  React.createElement(as, props),
)
export const Label = styled(Styles.label, 'span')
