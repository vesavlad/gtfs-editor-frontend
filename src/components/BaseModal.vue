<template>
  <div class="modal-container" @click="$emit('close')">
    <div class="modal" :class="modalClasses" @click.stop>
      <slot name="mcontent"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseModal',
  props: {
    modalClasses: {
      type: Array,
      default: () => []
    }
  }
}
</script>

