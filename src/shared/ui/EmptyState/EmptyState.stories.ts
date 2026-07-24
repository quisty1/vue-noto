import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { FileText } from '@lucide/vue'

import { Button } from '../Button'
import { EmptyState } from './index'

const meta = {
  title: 'Shared/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  args: {
    title: 'No pages yet',
    description: 'Create a page to start capturing notes, tasks, and docs in one place',
  },
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { EmptyState, Button, FileText },
    setup: () => ({ args }),
    template: `
      <EmptyState v-bind="args">
        <template #icon>
          <FileText :size="22" />
        </template>
        <template #action>
          <Button>New page</Button>
        </template>
      </EmptyState>
    `,
  }),
}

export const WithoutAction: Story = {
  args: {
    title: 'Nothing matches',
    description: 'Try a different search query or clear filters',
  },
  render: (args) => ({
    components: { EmptyState },
    setup: () => ({ args }),
    template: '<EmptyState v-bind="args" />',
  }),
}
