<template>
  <input ref="input" :type="field.data_type" v-model="val" @input="$emit('input', getValue($event.target))"
         v-bind:class="{error: hasErrors}" :data-error="errors.length?errors[0]:''"
         v-tooltip="{ theme: 'error-tooltip', content: errors.length?errors[0]:'', shown: errors.length }"
         v-autowidth="{minWidth: 'calc(100% - 20px)'}"/>
</template>

<script>
import fieldMixin from "@/mixins/fieldMixin.js";

export default {
  mixins: [
    fieldMixin,
  ],
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
      if (value) {
        if (this.field.data_type === "color" && value.length === 6) {
          value = "#" + value;
        }
      }
      return value;
    },
    getValue(input) {
      let value = null;
      if (this.field.data_type === "checkbox") {
        value = input.checked;
      } else if (this.field.data_type === "color") {
        value = input.value.slice(1);
      } else {
        value = input.value;
      }
      return value;
    }
  },
}
</script>
