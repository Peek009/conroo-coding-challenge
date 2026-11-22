<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="app">
    <header class="app__header">
      <h1 class="app__title">
        {{ t('app.title') }}
      </h1>
    </header>
  </div>
</template>

<style scoped lang="scss">
.app {
  min-height: 100vh;

  &__header {
    padding: 1rem;
  }

  &__title {
    margin: 0;
    font-size: 1.5rem;
  }
}
</style>
