<template>
  <div class="modal-container" @click="$emit('close')">
    <div class="modal" :class="modalClasses" @click.stop>
        <div class="modal-header">
            <slot name="mHeader"></slot>
        </div>
        <div class="modal-content">
            <slot name="mContent"></slot>
        </div>
        <div class="modal-footer" v-bind:class="{}" v-if="showBase">
            <slot name="mFooter">
              <button class="btn solo red" @click="$emit('cancel')" v-if="showCancelButton"><slot name='cancel-button-name'>{{ $t('cancel') }}</slot></button>
              <button class="btn solo" @click="$emit('ok')"><slot name="close-button-name">Ok</slot></button>
            </slot>
        </div>
    </div>
  </div>
</template>


<script>
export default {
  name: 'Modal',
  props: {
    showBase: {
      type: Boolean,
      default: true
    },
    showCancelButton: {
      type: Boolean,
      default: false
    },
    modalClasses: {
      type: Array,
      default: () => []
    }
  },
  mounted(){
    this.$emit("mounted");
  }
}
</script>

