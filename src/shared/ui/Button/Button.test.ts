import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { Button } from './index'

describe('Button', () => {
  it('renders slot content and emits click', async () => {
    const wrapper = mount(Button, {
      slots: { default: 'Save' },
    })

    expect(wrapper.text()).toContain('Save')
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('disables interaction while loading', async () => {
    const wrapper = mount(Button, {
      props: { loading: true },
      slots: { default: 'Save' },
    })

    expect(wrapper.attributes('disabled')).toBeDefined()
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('applies variant and size classes', () => {
    const wrapper = mount(Button, {
      props: { variant: 'danger', size: 'sm' },
      slots: { default: 'Delete' },
    })

    expect(wrapper.classes().join(' ')).toMatch(/danger|sm/)
  })
})
