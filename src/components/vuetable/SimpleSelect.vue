<template>
  <Multiselect v-model="val" :options="field.options" track-by="value" label="name" @change="onChange"></Multiselect>
</template>

<script>
import Multiselect from 'vue-multiselect';
import fieldMixin from "@/mixins/fieldMixin.js";

export default {
  name: 'SimpleSelect',
  components: {
    Multiselect
  },
  mixins: [
    fieldMixin,
  ],
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
      val: this.value,
      name: this.getFieldName(this.field),
    }
  },
  watch: {
    value() {
      this.val = this.value === "" ? null : this.value;
    }
  },
  methods: {
    onChange(evt) {
      this.val = evt.target.value;
      this.$emit("input", this.val);
    }
  },
}
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>