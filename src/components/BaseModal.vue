<template>
  <transition name="fade">
    <div v-if="show" class="modal-container" @click="$emit('close')">
      <div class="modal modal-in" :class="classes" @click.stop>
        <slot name="m-content"></slot>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'BaseModal',
  props: {
    classes: {
      type: Array,
      default: () => []
    },
    show: {
      type: Boolean,
      required: true
    }
  }
}
</script>

