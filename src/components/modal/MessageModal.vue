<template>
  <BaseModal :show="show" :classes="ownClasses" v-on="$listeners">
    <template v-slot:m-content>
      <div class="m-header">
        <div class="message-title">
          <i class="material-icons">{{ icon }}</i>
          <h2>
            <slot name="m-title"></slot>
          </h2>
        </div>
        <div class="grid">
          <button class="btn icon flat" @click="$emit('close')"><i class="material-icons">close</i></button>
        </div>
      </div>
      <div class="m-content">
        <slot name="m-content"></slot>
      </div>
      <div class="m-footer">
        <div class="option-buttons">
          <button v-if="showCancelButton" class="btn flat" @click="$emit('cancel')"><span>{{
              $t('general.cancel')
            }}</span></button>
          <button class="btn" :class="buttonClasses" @click="$emit('ok')"><span>{{ okButtonLabel }}</span></button>
        </div>
      </div>
    </template>
  </BaseModal>
</template>

<script>
import BaseModal from '@/components/modal/BaseModal.vue'
import Enums from '@/utils/enums.js'

export default {
  name: 'MessageModal',
  components: {
    BaseModal
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    classes: {
      type: Array,
      default: () => []
    },
    buttonClasses: {
      type: Array,
      default: () => []
    },
    showCancelButton: {
      type: Boolean,
      default: true
    },
    okButtonLabel: {
      type: String,
      default: 'ok'
    },
    type: {
      type: String,
      default: '',
      validator(value) {
        return Object.values(Enums.MessageModalType).concat(['']).indexOf(value) !== -1;
      }
    }
  },
  computed: {
    ownClasses() {
      return ['modal-message'].concat(this.classes);
    },
    icon() {
      let icon = null;
      switch (this.type) {
        case Enums.MessageModalType.ERROR:
          icon = "error_outline";
          break;
        case Enums.MessageModalType.WARNING:
          icon = "warning";
          break;
      }
      return icon;
    }
  }
}
</script>
