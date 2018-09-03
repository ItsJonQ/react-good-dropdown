import React from 'react'
import { storiesOf } from '@storybook/react'
import Dropdown from '../components/Dropdown'
import Drop from '../components/Drop'
import '../styles/bootstrap.css'

const stories = storiesOf('Dropdown', module)

stories.add('Default', () => (
  <div>
    <a href="#">Link</a>
    <Dropdown />
  </div>
))