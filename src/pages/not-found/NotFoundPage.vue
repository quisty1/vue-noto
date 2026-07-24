<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { Button } from '@shared/ui'
import styles from './NotFoundPage.module.scss'

const { t } = useI18n()
const router = useRouter()

function goHome(): void {
  void router.push({ name: 'workspace' })
}
</script>

<template>
  <div :class="styles.page">
    <div :class="styles.brand">
      <span :class="styles.brandMark" aria-hidden="true">N</span>
      {{ t('app.name') }}
    </div>
    <h1 :class="styles.code">404</h1>
    <h2 :class="styles.title">{{ t('notFound.title') }}</h2>
    <p :class="styles.description">{{ t('notFound.description') }}</p>
    <Button @click="goHome">{{ t('notFound.goHome') }}</Button>
  </div>
</template>
