import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { shallowRef } from 'vue'

import EditorToolbar from './EditorToolbar.vue'

const editor = shallowRef(
  new Editor({
    extensions: [StarterKit],
    content: '<p>Hello Noto</p>',
  }),
)

const meta: Meta<typeof EditorToolbar> = {
  title: 'Features/EditorToolbar',
  component: EditorToolbar,
  tags: ['autodocs'],
  args: {
    editor: editor.value,
  },
}

export default meta
type Story = StoryObj<typeof EditorToolbar>

export const Default: Story = {}
