import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'

import { Button } from '../Button'
import { Dialog } from './index'

const meta = {
  title: 'Shared/Dialog',
  component: Dialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { Dialog, Button },
    setup() {
      const open = ref(false)
      return { open }
    },
    template: `
      <div style="padding:2rem">
        <Button @click="open = true">Open dialog</Button>
        <Dialog
          v-model:open="open"
          title="Rename page"
          description="Choose a clear title so this page is easy to find later"
        >
          <p style="margin:0;color:var(--noto-color-ink-muted);font-size:0.875rem">
            Dialog content goes here. Focus is trapped while open
          </p>
          <template #footer>
            <Button variant="ghost" @click="open = false">Cancel</Button>
            <Button @click="open = false">Save</Button>
          </template>
        </Dialog>
      </div>
    `,
  }),
}

export const Wide: Story = {
  render: () => ({
    components: { Dialog, Button },
    setup() {
      const open = ref(true)
      return { open }
    },
    template: `
      <div style="padding:2rem">
        <Button @click="open = true">Open wide dialog</Button>
        <Dialog
          v-model:open="open"
          title="Import document"
          description="Supported formats: Markdown, HTML, and plain text"
          wide
        >
          <p style="margin:0">Drop a file into your workspace or browse from disk</p>
        </Dialog>
      </div>
    `,
  }),
}
