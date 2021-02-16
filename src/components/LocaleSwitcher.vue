<template>
  <ul class="language-switch">
    <li v-for="locale in locales" :key="locale" @click="switchLocale(locale)" :class="{active: locale===$i18n.locale}">
      <span>{{ getFlag(locale) }} {{ locale }}</span>
    </li>
  </ul>
</template>


<script>
import {LANGUAGE_KEY} from '@/utils/consts.js';

export default {
  name: 'LocaleSwitcher',
  data() {
    return {
      locales: process.env.VUE_APP_I18N_SUPPORTED_LOCALE.split(',')
    }
  },
  methods: {
    switchLocale(locale) {
      if (this.$i18n.locale !== locale) {
        this.$i18n.locale = locale;
        window.localStorage.setItem(LANGUAGE_KEY, locale);
      }
    },
    getFlag(locale) {
      switch (locale) {
        case 'es':
          return '🇪🇸'
        case 'en':
          return '🇺🇸'
        default:
          return ''
      }
    }
  },
}
</script>

<style scoped>
li {
  text-decoration: underline;
  color: #459CE7;
  cursor: pointer;
}
</style>
