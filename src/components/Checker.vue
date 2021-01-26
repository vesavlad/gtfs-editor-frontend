<template>
  <div class="grid checker-body" :class=" isError ? 'error': 'ok'">
      <span class="material-icons icon">{{ isError ? 'warning': 'check' }}</span>
      <span class="text">{{ message }}</span>
  </div>
</template>

<script>
export default {
  name: 'Checker',
  props: {
    isError: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      default: ''
    }
  }
}
</script>
