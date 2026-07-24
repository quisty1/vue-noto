import type { Meta, StoryObj } from '@storybook/vue3-vite'

import { Skeleton } from './index'

const meta = {
  title: 'Shared/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'rect', 'circle'],
    },
  },
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Text: Story = {
  args: {
    variant: 'text',
    width: '16rem',
  },
}

export const Circle: Story = {
  args: {
    variant: 'circle',
    width: 48,
    height: 48,
  },
}

export const CardPlaceholder: Story = {
  render: () => ({
    components: { Skeleton },
    template: `
      <div style="display:flex;flex-direction:column;gap:0.75rem;width:18rem">
        <Skeleton variant="rect" height="9rem" />
        <Skeleton variant="text" width="70%" />
        <Skeleton variant="text" width="90%" />
        <Skeleton variant="text" width="50%" />
      </div>
    `,
  }),
}
