import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { Input } from './index'

describe('Input', () => {
  it('binds v-model and shows label', async () => {
    const wrapper = mount(Input, {
      props: {
        modelValue: 'hello',
        label: 'Title',
        'onUpdate:modelValue': (value: string) => wrapper.setProps({ modelValue: value }),
      },
    })

    expect(wrapper.text()).toContain('Title')
    const input = wrapper.get('input')
    expect(input.element.value).toBe('hello')
    await input.setValue('world')
    expect(wrapper.props('modelValue')).toBe('world')
  })

  it('exposes error message for accessibility', () => {
    const wrapper = mount(Input, {
      props: {
        modelValue: '',
        label: 'Email',
        error: 'Required',
      },
    })

    expect(wrapper.text()).toContain('Required')
    expect(wrapper.get('input').attributes('aria-invalid')).toBe('true')
  })
})
