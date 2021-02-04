<template>
  <div class="modal-container" @click="$emit('close')">
    <div class="modal modal-message" :class="modalClasses" @click.stop>
      <slot name="mcontent">
        <div class="m-header">
          <div class="message-title">
            <i class="material-icons">warning</i>
            <h2>Título</h2>
          </div>
          <div class="grid">
            <button class="btn icon flat"><i class="material-icons">close</i></button>
          </div>
        </div>
        <div class="m-content">
            <span>Content</span>
        </div>
        <div class="m-footer">
          <div class="option-buttons">
            <button class="btn flat"><span>Cancel</span></button>
            <button class="btn error"><span>Leave</span></button>
          </div>
        </div>
      </slot>
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
