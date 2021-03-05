<template>
  <MyMultiselect ref="multiselect" v-model="val" :options="field.options" :showLabels="false" track-by="value"
                 label="name" @input="onChange" :class="{error: hasErrors}"
                 v-tooltip="{ theme: 'error-tooltip', content: errors.length?errors[0]:'', shown: Boolean(errors.length) }">
  </MyMultiselect>
</template>

<script>
import MyMultiselect from "@/components/vuetable/inputs/MyMultiselect";

export default {
  name: 'SimpleSelect',
  components: {
    MyMultiselect
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
    errors: {
      type: Array,
      required: true
    }
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

<style src="../../../../node_modules/vue-multiselect/dist/vue-multiselect.min.css"></style>