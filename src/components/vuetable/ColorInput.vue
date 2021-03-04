<template>
  <div class="input-color" :class="{error: hasErrors}" v-tooltip="{ theme: 'error-tooltip', content: errors.length?errors[0]:'', shown: errors.length }">
    <input type="text" v-model="val" maxlength="6" @input="$emit('input', getValue($event.target))"/>
    <input type="color" v-model="val" @input="$emit('input', getValue($event.target))" style="width:30px;"/>
  </div>
</template>

<script>
export default {
  name: 'ColorInput',
  props: {
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
      return input.value.replace('#', '').toUpperCase();
    }
  },
}
</script>
