import React from 'react'
import { storiesOf } from '@storybook/react'
import Dropdown from '../components/Dropdown'
import Drop from '../components/Drop'

const stories = storiesOf('Dropdown', module)

stories.add('Default', () => (
  <Dropdown />
))

stories.add('Drop', () => (
  <Drop />
))
