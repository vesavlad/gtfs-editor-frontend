<template>
  <input ref="input" :type="field.type" v-model="val" :placeholder="`Enter ${field.title.toLowerCase()}`"
         @input="$emit('input', $event.target.value)" @focus="localErrors=[]" :class="{error: hasErrors}"
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
      val: this.value,
      localErrors: []
    };
  },
  watch: {
    value() {
      this.val = this.value;
    },
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
