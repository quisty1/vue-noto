/**
 * TipTap slash-command extension: `/` suggestion menu via tippy.js
 */
import { Extension } from '@tiptap/core'
import Suggestion, {
  type SuggestionKeyDownProps,
  type SuggestionProps,
  type SuggestionOptions,
} from '@tiptap/suggestion'
import type { Editor } from '@tiptap/core'
import tippy, { type Instance as TippyInstance } from 'tippy.js'

export type SlashCommandItem = {
  title: string
  description: string
  icon: string
  command: (props: { editor: Editor; range: { from: number; to: number } }) => void
}

/** Build a TipTap Extension that opens a filtered command palette on `/` */
export function createSlashCommandsExtension(items: SlashCommandItem[]): Extension {
  const suggestion: Partial<SuggestionOptions<SlashCommandItem>> = {
    char: '/',
    items: ({ query }) =>
      items.filter((item) => item.title.toLowerCase().includes(query.toLowerCase())),
    render: () => {
      let popup: TippyInstance | null = null
      let list: HTMLDivElement | null = null
      let selectedIndex = 0

      function updatePopup(props: SuggestionProps<SlashCommandItem>): void {
        if (!list) return
        list.innerHTML = ''
        selectedIndex = Math.min(selectedIndex, Math.max(0, props.items.length - 1))

        props.items.forEach((item, index) => {
          const btn = document.createElement('button')
          btn.type = 'button'
          btn.className = 'noto-slash-item'
          if (index === selectedIndex) {
            btn.classList.add('noto-slash-item-active')
          }
          btn.innerHTML = `<span class="noto-slash-icon">${item.icon}</span><span class="noto-slash-text"><strong>${item.title}</strong><small>${item.description}</small></span>`
          btn.addEventListener('mousedown', (e) => {
            e.preventDefault()
            props.command(item)
          })
          list!.appendChild(btn)
        })

        if (popup && props.clientRect) {
          popup.setProps({
            getReferenceClientRect: () => props.clientRect?.() ?? new DOMRect(),
          })
        }
      }

      return {
        onStart: (props) => {
          list = document.createElement('div')
          list.className = 'noto-slash-menu'

          popup = tippy(document.body, {
            getReferenceClientRect: () => props.clientRect?.() ?? new DOMRect(),
            appendTo: () => document.body,
            content: list,
            showOnCreate: true,
            interactive: true,
            trigger: 'manual',
            placement: 'bottom-start',
          })

          updatePopup(props)
        },
        onUpdate: (props) => {
          updatePopup(props)
        },
        onKeyDown: (props: SuggestionKeyDownProps) => {
          if (props.event.key === 'ArrowUp') {
            selectedIndex = Math.max(0, selectedIndex - 1)
            return true
          }
          if (props.event.key === 'ArrowDown') {
            selectedIndex += 1
            return true
          }
          if (props.event.key === 'Enter') {
            return true
          }
          return false
        },
        onExit: () => {
          popup?.destroy()
          popup = null
          list = null
        },
      }
    },
    command: ({ editor, range, props }) => {
      props.command({ editor, range })
    },
  }

  return Extension.create({
    name: 'slashCommands',
    addProseMirrorPlugins() {
      return [
        Suggestion({
          editor: this.editor,
          ...suggestion,
        }),
      ]
    },
  })
}

/** Localized slash menu items wired to TipTap chain commands */
export function defaultSlashCommands(t: (key: string) => string): SlashCommandItem[] {
  return [
    {
      title: t('editor.slash.heading1'),
      description: t('editor.slash.heading1Desc'),
      icon: 'H1',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run()
      },
    },
    {
      title: t('editor.slash.heading2'),
      description: t('editor.slash.heading2Desc'),
      icon: 'H2',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run()
      },
    },
    {
      title: t('editor.slash.heading3'),
      description: t('editor.slash.heading3Desc'),
      icon: 'H3',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run()
      },
    },
    {
      title: t('editor.slash.bulletList'),
      description: t('editor.slash.bulletListDesc'),
      icon: '•',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run()
      },
    },
    {
      title: t('editor.slash.orderedList'),
      description: t('editor.slash.orderedListDesc'),
      icon: '1.',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run()
      },
    },
    {
      title: t('editor.slash.taskList'),
      description: t('editor.slash.taskListDesc'),
      icon: '☑',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleTaskList().run()
      },
    },
    {
      title: t('editor.slash.quote'),
      description: t('editor.slash.quoteDesc'),
      icon: '❝',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleBlockquote().run()
      },
    },
    {
      title: t('editor.slash.code'),
      description: t('editor.slash.codeDesc'),
      icon: '</>',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
      },
    },
    {
      title: t('editor.slash.hr'),
      description: t('editor.slash.hrDesc'),
      icon: '—',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setHorizontalRule().run()
      },
    },
  ]
}
