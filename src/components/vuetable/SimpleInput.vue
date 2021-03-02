<template>
  <input ref="input" :type="field.type" v-model="val" :placeholder="`Enter ${field.title.toLowerCase()}`"
         @input="$emit('input', getValue($event.target))" :class="{error: hasErrors}"
         :data-error="errors.length?errors[0]:''"
         v-tooltip="{ theme: 'error-tooltip', content: errors.length?errors[0]:'', shown: errors.length }"
         v-autowidth="{minWidth: 'calc(100% - 20px)'}"/>
</template>

<script>
import fieldMixin from "@/mixins/fieldMixin.js";
import Enums from "@/utils/enums";

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
        if (this.field.type === Enums.InputType.COLOR && value.length === 6) {
          value = "#" + value;
        }
      }
      return value;
    },
    getValue(input) {
      let value = null;
      if (this.field.type === Enums.InputType.CHECKBOX) {
        value = input.checked;
      } else if (this.field.type === Enums.InputType.COLOR) {
        value = input.value.slice(1);
      } else {
        value = input.value;
      }
      return value;
    }
  },
}
</script>
