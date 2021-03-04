<template>
  <input ref="input" :type="field.type" v-model="val" @input="$emit('input', getValue($event.target))"
         :class="{error: hasErrors}" :data-error="errors.length?errors[0]:''"
         v-tooltip="{ theme: 'error-tooltip', content: errors.length?errors[0]:'', shown: errors.length }"/>
</template>

<script>

export default {
  name: 'ColorInput',
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
      val: this.preProcessValue(this.value),
    };
  },
  watch: {
    value() {
      this.val = this.preProcessValue(this.value);
    },
  },
  methods: {
    preProcessValue(value) {
      if (value && value.length === 6) {
        value = `#${value}`;
      }
      return value;
    },
    getValue(input) {
      let value = input.value.slice(1);
      return value;
    }
  },
}
</script>
