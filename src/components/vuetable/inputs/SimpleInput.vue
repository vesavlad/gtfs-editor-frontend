<template>
  <input v-if="!readonly" :value="value" @input="emitInputEvent"
         :type="field.type" :placeholder="`${field.title.toLowerCase()}`" @focus="localErrors=[]"
         :class="{error: hasErrors}"
         v-tooltip="{ theme: 'error-tooltip', content: hasErrors?errors[0]:'', shown: hasErrors }"
         v-autowidth="{minWidth: 'calc(100% - 20px)'}"/>
  <span v-else>{{ value ? value.toLocaleString() : value }}</span>
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
    errors: {
      type: Array,
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      localErrors: []
    };
  },
  watch: {
    errors() {
      this.localErrors = [...this.errors];
    }
  },
  computed: {
    hasErrors() {
      return Boolean(this.localErrors.length);
    }
  },
  methods: {
    emitInputEvent(e) {
      let value = e.target.value;
      if (this.Enums.InputType.NUMBER) {
        value = Number(value);
      }
      this.$emit('input', value);
    }
  }
}
</script>
