<template>
  <div v-if="!readonly" class="input-color" :class="{error: hasErrors} "
       v-tooltip="{ theme: 'error-tooltip', content: hasErrors?localErrors[0]:'', shown: hasErrors }">
    <input type="text" v-model="val" maxlength="6" @input="$emit('input', getValue($event.target))"
           @focus="localErrors=[]"/>
    <input type="color" v-model="val" @input="$emit('input', getValue($event.target))"
           @focus="localErrors=[]"/>
  </div>
  <div v-else class="color-indicator" :style="'background-color:'+val+';'"></div>
</template>

<script>
export default {
  name: 'ColorInput',
  props: {
    value: {
      required: true,
    },
    errors: {
      type: Array,
      required: true
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      val: this.preProcessValue(this.value),
      localErrors: []
    };
  },
  watch: {
    value() {
      this.val = this.preProcessValue(this.value);
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
