<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { computed, nextTick, ref, watch } from 'vue'

import styles from './Dropdown.module.scss'

export type DropdownItem = {
  id: string
  label: string
  disabled?: boolean
  danger?: boolean
}

const props = withDefaults(
  defineProps<{
    items: DropdownItem[]
    open?: boolean
    align?: 'start' | 'end'
    disabled?: boolean
  }>(),
  {
    open: undefined,
    align: 'start',
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:open': [value: boolean]
  select: [item: DropdownItem]
}>()

const rootRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)
const internalOpen = ref(false)
const activeIndex = ref(-1)

const isOpen = computed({
  get: () => (props.open === undefined ? internalOpen.value : props.open),
  set: (value: boolean) => {
    if (props.open === undefined) {
      internalOpen.value = value
    }
    emit('update:open', value)
  },
})

onClickOutside(rootRef, () => {
  if (isOpen.value) {
    close()
  }
})

watch(isOpen, async (open) => {
  if (open) {
    activeIndex.value = props.items.findIndex((item) => !item.disabled)
    await nextTick()
    focusActiveItem()
  } else {
    activeIndex.value = -1
  }
})

function toggle(): void {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

function close(): void {
  isOpen.value = false
}

function focusActiveItem(): void {
  const items = menuRef.value?.querySelectorAll<HTMLElement>('[role="menuitem"]')
  const el = items?.[activeIndex.value]
  el?.focus()
}

function moveActive(delta: number): void {
  if (props.items.length === 0) return
  let next = activeIndex.value
  for (let i = 0; i < props.items.length; i += 1) {
    next = (next + delta + props.items.length) % props.items.length
    const item = props.items[next]
    if (item && !item.disabled) {
      activeIndex.value = next
      void nextTick(() => focusActiveItem())
      return
    }
  }
}

function selectItem(item: DropdownItem, index: number): void {
  if (item.disabled) return
  activeIndex.value = index
  emit('select', item)
  close()
}

function onTriggerKeydown(event: KeyboardEvent): void {
  if (props.disabled) return

  if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    if (!isOpen.value) {
      isOpen.value = true
    } else if (event.key === 'ArrowDown') {
      moveActive(1)
    }
  } else if (event.key === 'Escape' && isOpen.value) {
    event.preventDefault()
    close()
  }
}

function onMenuKeydown(event: KeyboardEvent): void {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      moveActive(1)
      break
    case 'ArrowUp':
      event.preventDefault()
      moveActive(-1)
      break
    case 'Home':
      event.preventDefault()
      activeIndex.value = props.items.findIndex((item) => !item.disabled)
      void nextTick(() => focusActiveItem())
      break
    case 'End': {
      event.preventDefault()
      for (let i = props.items.length - 1; i >= 0; i -= 1) {
        if (!props.items[i]?.disabled) {
          activeIndex.value = i
          break
        }
      }
      void nextTick(() => focusActiveItem())
      break
    }
    case 'Escape':
      event.preventDefault()
      close()
      break
    case 'Tab':
      close()
      break
    default:
      break
  }
}
</script>

<template>
  <div ref="rootRef" :class="styles.root">
    <div :class="styles.trigger" @keydown="onTriggerKeydown">
      <slot name="trigger" :open="isOpen" :toggle="toggle" :disabled="disabled" />
    </div>

    <Transition name="noto-dropdown">
      <ul
        v-if="isOpen"
        ref="menuRef"
        :class="[styles.menu, align === 'end' ? styles.menuEnd : null]"
        role="menu"
        tabindex="-1"
        @keydown="onMenuKeydown"
      >
        <li v-for="(item, index) in items" :key="item.id" role="none">
          <button
            type="button"
            role="menuitem"
            :class="[
              styles.item,
              index === activeIndex ? styles.itemActive : null,
              item.danger ? styles.itemDanger : null,
            ]"
            :disabled="item.disabled"
            :tabindex="index === activeIndex ? 0 : -1"
            @click="selectItem(item, index)"
            @mouseenter="activeIndex = index"
          >
            {{ item.label }}
          </button>
        </li>
        <slot name="items" />
      </ul>
    </Transition>
  </div>
</template>
