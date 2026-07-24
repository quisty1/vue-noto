<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { useI18n } from 'vue-i18n'
import { z } from 'zod'

import { Button, Input, Select } from '@shared/ui'
import type { Locale } from '@shared/types'

import { useLocale } from '@features/locale'
import { useOnboarding } from '../model/useOnboarding'
import styles from './OnboardingForm.module.scss'

const emit = defineEmits<{
  complete: [workspaceId: string]
}>()

const { t } = useI18n()
const { setLocale } = useLocale()
const { completeOnboarding, isSubmitting } = useOnboarding()

const schema = toTypedSchema(
  z.object({
    workspaceName: z
      .string()
      .min(1, t('onboarding.nameRequired'))
      .max(100, t('onboarding.nameTooLong')),
    language: z.enum(['en', 'ru']),
    useDemo: z.boolean(),
  }),
)

const { defineField, handleSubmit, errors } = useForm({
  validationSchema: schema,
  initialValues: {
    workspaceName: '',
    language: 'en' as Locale,
    useDemo: true,
  },
})

const [workspaceName] = defineField('workspaceName')
const [language] = defineField('language')
const [useDemo] = defineField('useDemo')

const languageOptions = [
  { value: 'en', label: t('locale.en') },
  { value: 'ru', label: t('locale.ru') },
]

const onSubmit = handleSubmit(async (values) => {
  setLocale(values.language)
  const workspace = await completeOnboarding({
    workspaceName: values.workspaceName,
    useDemo: values.useDemo,
  })
  emit('complete', workspace.id)
})
</script>

<template>
  <form :class="styles.form" @submit.prevent="onSubmit">
    <h1 :class="styles.title">{{ t('onboarding.title') }}</h1>
    <p :class="styles.subtitle">{{ t('onboarding.subtitle') }}</p>

    <Input
      v-model="workspaceName"
      :label="t('onboarding.workspaceName')"
      :placeholder="t('onboarding.workspaceNamePlaceholder')"
      :error="errors.workspaceName"
      required
    />

    <Select v-model="language" :label="t('onboarding.language')" :options="languageOptions" />

    <label :class="styles.checkbox">
      <input v-model="useDemo" type="checkbox" data-testid="onboarding-load-demo" />
      <span>{{ t('onboarding.useDemo') }}</span>
    </label>

    <Button type="submit" :loading="isSubmitting" size="lg" data-testid="onboarding-submit">
      {{ t('onboarding.getStarted') }}
    </Button>
  </form>
</template>
