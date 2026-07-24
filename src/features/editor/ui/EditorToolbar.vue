<script setup lang="ts">
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Strikethrough,
  Underline as UnderlineIcon,
} from '@lucide/vue'
import type { Editor } from '@tiptap/core'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { IconButton } from '@shared/ui'

import styles from './EditorToolbar.module.scss'

const props = defineProps<{
  editor: Editor | null | undefined
}>()

const { t } = useI18n()

const canBold = computed(() => Boolean(props.editor?.can?.().chain().focus().toggleBold().run()))
const canItalic = computed(() =>
  Boolean(props.editor?.can?.().chain().focus().toggleItalic().run()),
)
const canStrike = computed(() =>
  Boolean(props.editor?.can?.().chain().focus().toggleStrike().run()),
)
const canUnderline = computed(() =>
  Boolean(props.editor?.can?.().chain().focus().toggleUnderline().run()),
)

function toggleBold(): void {
  props.editor?.chain().focus().toggleBold().run()
}

function toggleItalic(): void {
  props.editor?.chain().focus().toggleItalic().run()
}

function toggleStrike(): void {
  props.editor?.chain().focus().toggleStrike().run()
}

function toggleUnderline(): void {
  props.editor?.chain().focus().toggleUnderline().run()
}

function toggleBulletList(): void {
  props.editor?.chain().focus().toggleBulletList().run()
}

function toggleOrderedList(): void {
  props.editor?.chain().focus().toggleOrderedList().run()
}

function toggleTaskList(): void {
  props.editor?.chain().focus().toggleTaskList().run()
}

function toggleBlockquote(): void {
  props.editor?.chain().focus().toggleBlockquote().run()
}
</script>

<template>
  <div v-if="editor" :class="styles.root" role="toolbar" :aria-label="t('editor.toolbar')">
    <IconButton :aria-label="t('editor.bold')" size="sm" :disabled="!canBold" @click="toggleBold">
      <Bold :size="16" />
    </IconButton>
    <IconButton
      :aria-label="t('editor.italic')"
      size="sm"
      :disabled="!canItalic"
      @click="toggleItalic"
    >
      <Italic :size="16" />
    </IconButton>
    <IconButton
      :aria-label="t('editor.underline')"
      size="sm"
      :disabled="!canUnderline"
      @click="toggleUnderline"
    >
      <UnderlineIcon :size="16" />
    </IconButton>
    <IconButton
      :aria-label="t('editor.strikethrough')"
      size="sm"
      :disabled="!canStrike"
      @click="toggleStrike"
    >
      <Strikethrough :size="16" />
    </IconButton>

    <span :class="styles.divider" aria-hidden="true" />

    <IconButton :aria-label="t('editor.bulletList')" size="sm" @click="toggleBulletList">
      <List :size="16" />
    </IconButton>
    <IconButton :aria-label="t('editor.orderedList')" size="sm" @click="toggleOrderedList">
      <ListOrdered :size="16" />
    </IconButton>
    <IconButton :aria-label="t('editor.taskList')" size="sm" @click="toggleTaskList">
      <ListTodo :size="16" />
    </IconButton>
    <IconButton :aria-label="t('editor.quote')" size="sm" @click="toggleBlockquote">
      <Quote :size="16" />
    </IconButton>
  </div>
</template>
