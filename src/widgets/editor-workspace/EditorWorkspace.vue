<script setup lang="ts">
import type { JSONDoc } from '@entities/page'
import type { Page } from '@entities/page'
import type { Editor } from '@tiptap/core'
import { ref, shallowRef, watch, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'

import { EditorToolbar, NotoEditor, useAutosave, type AutosaveStatus } from '@features/editor'
import { useSnapshots } from '@features/snapshots'
import styles from './EditorWorkspace.module.scss'

const props = defineProps<{
  page: Page
}>()

const emit = defineEmits<{
  update: [
    patch: {
      title?: string
      icon?: string | null
      cover?: string | null
      content?: JSONDoc
      plainText?: string
    },
  ]
  saveStatus: [status: AutosaveStatus]
}>()

const { t } = useI18n()
const { maybeCreateSnapshot } = useSnapshots(() => props.page.id)

const title = ref(props.page.title)
const icon = ref(props.page.icon)
const content = ref<JSONDoc>(props.page.content)
const notoEditorRef = ref<InstanceType<typeof NotoEditor> | null>(null)
const editorInstance = shallowRef<Editor | null>(null)

watch(
  () => {
    const exposed = notoEditorRef.value as {
      editor?: Editor | { value?: Editor | null } | null
    } | null
    const ed = exposed?.editor
    if (ed && typeof ed === 'object' && 'value' in ed) {
      return ed.value ?? null
    }
    return (ed as Editor | null | undefined) ?? null
  },
  (ed) => {
    editorInstance.value = ed
  },
  { flush: 'post', immediate: true },
)

watch(
  () => props.page.id,
  () => {
    title.value = props.page.title
    icon.value = props.page.icon
    content.value = props.page.content
  },
)

const { status, dispose } = useAutosave(async (doc, plainText) => {
  emit('update', { content: doc, plainText })
  await maybeCreateSnapshot(doc, plainText)
}, content)

watch(status, (s) => emit('saveStatus', s), { immediate: true })

let titleTimer: ReturnType<typeof setTimeout> | null = null

function onTitleInput(event: Event): void {
  const value = (event.target as HTMLInputElement).value
  title.value = value
  if (titleTimer) clearTimeout(titleTimer)
  titleTimer = setTimeout(() => {
    emit('update', { title: value })
  }, 500)
}

function onIconInput(event: Event): void {
  const value = (event.target as HTMLInputElement).value || null
  icon.value = value
  emit('update', { icon: value })
}

function restoreContent(doc: JSONDoc): void {
  content.value = doc
  emit('update', { content: doc })
}

onBeforeUnmount(() => {
  dispose()
})

defineExpose({ restoreContent })
</script>

<template>
  <article id="main-content" :class="styles.workspace">
    <div v-if="page.cover" :class="styles.cover">
      <img :src="page.cover" :alt="''" />
    </div>

    <div :class="styles.scroll">
      <div :class="styles.meta">
        <input
          :class="styles.iconInput"
          :value="icon ?? ''"
          :placeholder="t('page.untitled').charAt(0)"
          maxlength="2"
          aria-label="Page icon"
          @input="onIconInput"
        />
        <input
          :class="styles.titleInput"
          :value="title"
          :placeholder="t('page.untitled')"
          aria-label="Page title"
          data-testid="editor-title"
          @input="onTitleInput"
        />
      </div>

      <div :class="styles.toolbarSticky">
        <EditorToolbar :editor="editorInstance" />
      </div>
      <NotoEditor ref="notoEditorRef" v-model="content" :placeholder="t('editor.placeholder')" />
    </div>
  </article>
</template>
