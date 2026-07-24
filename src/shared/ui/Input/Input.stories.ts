import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'

import { Input } from './index'

const meta = {
  title: 'Shared/Input',
  component: Input,
  tags: ['autodocs'],
  args: {
    label: 'Title',
    placeholder: 'Untitled note',
    hint: 'Shown under the field when there is no error',
    error: '',
    disabled: false,
    required: false,
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { Input },
    setup() {
      const value = ref('Morning pages')
      return { args, value }
    },
    template: '<Input v-bind="args" v-model="value" style="width:20rem" />',
  }),
}

export const WithError: Story = {
  args: {
    label: 'Email',
    hint: '',
    error: 'Enter a valid email address',
    placeholder: 'you@example.com',
  },
  render: (args) => ({
    components: { Input },
    setup() {
      const value = ref('not-an-email')
      return { args, value }
    },
    template: '<Input v-bind="args" v-model="value" style="width:20rem" />',
  }),
}

export const Disabled: Story = {
  args: {
    disabled: true,
    label: 'Workspace',
    hint: 'Managed by your organization',
  },
  render: (args) => ({
    components: { Input },
    setup() {
      const value = ref('Personal')
      return { args, value }
    },
    template: '<Input v-bind="args" v-model="value" style="width:20rem" />',
  }),
}
