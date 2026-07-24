import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { defineComponent } from 'vue'

import { Button } from '../Button'
import { ToastHost, ToastProvider, useToast } from './index'

const ToastDemo = defineComponent({
  name: 'ToastDemo',
  components: { Button, ToastHost },
  setup() {
    const toast = useToast()
    return {
      showDefault: () =>
        toast.push({
          title: 'Draft saved',
          description: 'Autosave completed just now',
        }),
      showSuccess: () =>
        toast.push({
          title: 'Exported',
          description: 'Markdown file downloaded',
          tone: 'success',
        }),
      showDanger: () =>
        toast.push({
          title: 'Delete failed',
          description: 'The page could not be removed',
          tone: 'danger',
        }),
      showSticky: () =>
        toast.push({
          title: 'Syncing offline changes',
          description: 'This toast stays until dismissed',
          tone: 'info',
          durationMs: 0,
        }),
    }
  },
  template: `
    <div style="padding:2rem;display:flex;gap:0.75rem;flex-wrap:wrap">
      <Button @click="showDefault">Default</Button>
      <Button variant="secondary" @click="showSuccess">Success</Button>
      <Button variant="danger" @click="showDanger">Danger</Button>
      <Button variant="ghost" @click="showSticky">Sticky</Button>
      <ToastHost />
    </div>
  `,
})

const meta = {
  title: 'Shared/Toast',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta

export default meta
type Story = StoryObj

export const Queue: Story = {
  render: () => ({
    components: { ToastProvider, ToastDemo },
    template: '<ToastProvider><ToastDemo /></ToastProvider>',
  }),
}
