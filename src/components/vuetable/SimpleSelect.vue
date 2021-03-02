<template>
  <Multiselect ref="multiselect" v-model="val" :options="field.options" :showLabels="false" track-by="value"
               label="name"
               @input="onChange" @close="adjustWitdh" @open="repositionDropDown"></Multiselect>
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
    },
    adjustWitdh() {
      const ref = this.$refs.multiselect;
      ref.$refs.tags.style.width = null;
    },
    repositionDropDown() {
      const {top, height,left} = this.$el.getBoundingClientRect();
      const ref = this.$refs.multiselect;
      //ref.$refs.tags.style.width = `${width}px`;
      //ref.$refs.list.style.width = `${width}px`;
      ref.$refs.list.style.position = 'fixed';
      ref.$refs.list.style.bottom = 'auto';
      ref.$refs.list.style.top = `${top + height}px`;
      ref.$refs.list.style.left = `${left}px`;
    },
  },
  mounted() {
    this.val = this.translateValueToOption(this.value);
    window.addEventListener('scroll', this.repositionDropDown);
  },
  destroyed() {
    window.removeEventListener('scroll', this.repositionDropDown);
  },
}
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>