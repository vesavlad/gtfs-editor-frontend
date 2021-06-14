<template>
  <label class="checkbox">
    <input :disabled="readonly" type="checkbox" v-model="val" @input="$emit('input', $event.target.checked)"/>
    <div class="checkbox-name"><span>{{ label }}</span></div>
  </label>
</template>

<script>
export default {
  props: {
    field: {
      type: Object,
      required: true,
    },
    value: {
      required: true,
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      val: this.value
    };
  },
  computed: {
    label() {
      if (this.field.inputConfig?.transformLabel) {
        return this.field.inputConfig.transformLabel(this.field.title);
      }
      return this.field.title;
    }
  }
}
</script>
