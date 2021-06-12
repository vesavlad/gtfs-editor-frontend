<template>
  <input :value="value" @input="$emit('input', $event.target.value)"
         :type="field.type" :placeholder="`${field.title.toLowerCase()}`" @focus="localErrors=[]"
         :class="{error: hasErrors}"
         v-tooltip="{ theme: 'error-tooltip', content: hasErrors?errors[0]:'', shown: hasErrors }"
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
    errors: {
      type: Array,
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
}
</script>
