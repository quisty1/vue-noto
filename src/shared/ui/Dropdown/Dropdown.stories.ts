import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'

import { Button } from '../Button'
import { Dropdown, type DropdownItem } from './index'

const items: DropdownItem[] = [
  { id: 'rename', label: 'Rename' },
  { id: 'duplicate', label: 'Duplicate' },
  { id: 'archive', label: 'Archive' },
  { id: 'delete', label: 'Delete', danger: true },
]

const meta = {
  title: 'Shared/Dropdown',
  component: Dropdown,
  tags: ['autodocs'],
} satisfies Meta<typeof Dropdown>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { Dropdown, Button },
    setup() {
      const selected = ref('None')
      return {
        items,
        selected,
        onSelect: (item: DropdownItem) => {
          selected.value = item.label
        },
      }
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem;min-height:12rem">
        <Dropdown :items="items" @select="onSelect">
          <template #trigger="{ toggle, open }">
            <Button variant="secondary" @click="toggle">
              {{ open ? 'Close menu' : 'Open menu' }}
            </Button>
          </template>
        </Dropdown>
        <p style="margin:0;color:var(--noto-color-ink-muted);font-size:0.875rem">
          Selected: {{ selected }}
        </p>
      </div>
    `,
  }),
}

export const AlignEnd: Story = {
  render: () => ({
    components: { Dropdown, Button },
    setup() {
      return { items }
    },
    template: `
      <div style="display:flex;justify-content:flex-end;min-width:16rem;min-height:12rem">
        <Dropdown :items="items" align="end">
          <template #trigger="{ toggle }">
            <Button variant="ghost" @click="toggle">Actions</Button>
          </template>
        </Dropdown>
      </div>
    `,
  }),
}
