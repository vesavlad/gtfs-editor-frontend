<template>
  <Multiselect v-model="val" :options="field.options" track-by="value" label="name" @input="onChange"></Multiselect>
</template>

<script>
import Multiselect from 'vue-multiselect';

export default {
  name: 'SimpleSelect',
  components: {
    Multiselect
  },
  props: {
    field: {
      type: Object,
      required: true,
    },
    value: {
      required: true
    },
    hasErrors: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      val: null
    }
  },
  watch: {
    value(newValue) {
      let option = this.translateValueToOption(newValue);
      this.val = this.value === "" ? null : option;
    }
  },
  methods: {
    onChange(option) {
      this.$emit("input", option ? option.value : null);
    },
    translateValueToOption(value) {
      let option = null;
      this.field.options.some(optionEl => {
        if (optionEl.value === value) {
          option = optionEl;
          return true;
        }
        return false;
      });
      return option;
    }
  },
  mounted() {
    this.val = this.translateValueToOption(this.value);
  }
}
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>