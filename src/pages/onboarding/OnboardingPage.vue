<script setup lang="ts">
import { useRouter } from 'vue-router'

import { OnboardingForm } from '@features/onboarding'
import styles from './OnboardingPage.module.scss'

const router = useRouter()

function onComplete(workspaceId: string): void {
  void router.replace({
    name: 'workspace',
    params: { workspaceId },
  })
}
</script>

<template>
  <div :class="styles.page">
    <Transition name="noto-rise" appear>
      <div :class="styles.shell">
        <OnboardingForm @complete="onComplete" />
      </div>
    </Transition>
  </div>
</template>
