<template>
  <MyMultiselect v-if="!readonly" v-model="val" :options="field.options" :showLabels="false" track-by="value"
                 label="name" @input="onChange" @open="localErrors=[]" :class="{error: hasErrors}"
                 :placeholder="$t('general.select')"
                 v-tooltip="{ theme: 'error-tooltip', content: hasErrors?localErrors[0]:'', shown: hasErrors }">
  </MyMultiselect>
  <span v-else>{{ translateValueToOption(value).name }}</span>
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
      val: null,
      localErrors: []
    }
  },
  watch: {
    value(newValue) {
      let option = this.translateValueToOption(newValue);
      this.val = this.value === '' ? null : option;
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