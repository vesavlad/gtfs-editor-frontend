<template>
  <div class="modal-container" @click="$emit('close')">
    <div class="modal" :class="classes" @click.stop.prevent>
      <slot name="m-content"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseModal',
  props: {
    classes: {
      type: Array,
      default: () => []
    }
  }
}
</script>

