<template>
  <input ref="input" :type="field.type" v-model="val" :placeholder="`Enter ${field.title.toLowerCase()}`"
         @input="$emit('input', $event.target.value)" :class="{error: hasErrors}"
         :data-error="errors.length?errors[0]:''"
         v-tooltip="{ theme: 'error-tooltip', content: errors.length?errors[0]:'', shown: errors.length }"
         v-autowidth="{minWidth: 'calc(100% - 20px)'}"/>
</template>

<script>

export default {
  name: 'SimpleInput',
  props: {
    field: {
      type: Object,
      required: true,
    },
    value: {
      required: true,
    },
    hasErrors: {
      type: Boolean,
      default: false,
    },
    errors: {
      type: Array,
    }
  },
  data() {
    return {
      val: this.value,
    };
  },
  watch: {
    value() {
      this.val = this.value;
    },
  },
}
</script>
