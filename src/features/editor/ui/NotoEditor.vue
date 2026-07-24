<script setup lang="ts">
import type { JSONDoc } from '@entities/page'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import Underline from '@tiptap/extension-underline'
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent, BubbleMenu } from '@tiptap/vue-3'
import { Bold, Italic, Link as LinkIcon } from '@lucide/vue'
import { onBeforeUnmount, onMounted, shallowRef, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { IconButton } from '@shared/ui'

import { createSlashCommandsExtension, defaultSlashCommands } from '../lib/slash-commands'
import styles from './NotoEditor.module.scss'

const props = defineProps<{
  modelValue: JSONDoc
  placeholder?: string | undefined
}>()

const emit = defineEmits<{
  'update:modelValue': [value: JSONDoc]
}>()

const { t } = useI18n()

const editor = shallowRef<Editor | undefined>()

onMounted(() => {
  editor.value = new Editor({
    content: props.modelValue,
    editable: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: props.placeholder ?? t('editor.placeholder'),
      }),
      Link.configure({ openOnClick: false }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Underline,
      createSlashCommandsExtension(defaultSlashCommands(t)),
    ],
    onUpdate: ({ editor: ed }) => {
      // TipTap JSON must be plain data for IndexedDB (no Vue proxies / non-cloneables)
      const json = JSON.parse(JSON.stringify(ed.getJSON())) as JSONDoc
      emit('update:modelValue', json)
    },
  })
})

watch(
  () => props.modelValue,
  (next) => {
    const ed = editor.value
    if (!ed) return
    const current = ed.getJSON()
    if (JSON.stringify(current) !== JSON.stringify(next)) {
      ed.commands.setContent(next, false)
    }
  },
)

function setLink(): void {
  const ed = editor.value
  if (!ed) return
  const previous = ed.getAttributes('link').href as string | undefined
  const url = window.prompt(t('editor.linkPrompt'), previous ?? 'https://')
  if (url === null) return
  if (url === '') {
    ed.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }
  ed.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

onBeforeUnmount(() => {
  editor.value?.destroy()
  editor.value = undefined
})

defineExpose({
  editor: computed(() => editor.value),
})
</script>

<template>
  <div :class="styles.root" data-testid="editor-content">
    <BubbleMenu
      v-if="editor"
      :editor="editor"
      :tippy-options="{ duration: 100 }"
      :class="styles.bubble"
    >
      <IconButton
        :aria-label="t('editor.bold')"
        size="sm"
        @click="editor.chain().focus().toggleBold().run()"
      >
        <Bold :size="14" />
      </IconButton>
      <IconButton
        :aria-label="t('editor.italic')"
        size="sm"
        @click="editor.chain().focus().toggleItalic().run()"
      >
        <Italic :size="14" />
      </IconButton>
      <IconButton :aria-label="t('editor.link')" size="sm" @click="setLink">
        <LinkIcon :size="14" />
      </IconButton>
    </BubbleMenu>

    <EditorContent v-if="editor" :editor="editor" :class="styles.content" />
  </div>
</template>

<style lang="scss">
.noto-slash-menu {
  background: var(--noto-color-bg-elevated);
  border: 1px solid var(--noto-color-border);
  border-radius: var(--noto-radius-lg);
  box-shadow: var(--noto-shadow-md);
  padding: var(--noto-space-1);
  min-width: 14rem;
  max-height: 16rem;
  overflow-y: auto;
}

.noto-slash-item {
  display: flex;
  align-items: center;
  gap: var(--noto-space-2);
  width: 100%;
  padding: var(--noto-space-2) var(--noto-space-3);
  border: none;
  background: transparent;
  border-radius: var(--noto-radius-md);
  text-align: start;
  cursor: pointer;
  color: var(--noto-color-ink);

  &:hover,
  &.noto-slash-item-active {
    background: var(--noto-color-bg-muted);
  }
}

.noto-slash-icon {
  font-size: var(--noto-font-size-sm);
  font-weight: var(--noto-font-weight-semibold);
  width: 1.5rem;
  text-align: center;
}

.noto-slash-text {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;

  small {
    color: var(--noto-color-ink-subtle);
    font-size: var(--noto-font-size-xs);
  }
}
</style>
