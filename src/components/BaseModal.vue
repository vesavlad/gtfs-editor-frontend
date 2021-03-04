<template>
  <transition name="fade">
    <div class="modal-container" @click="$emit('close')">
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
    }
  }
}
</script>

