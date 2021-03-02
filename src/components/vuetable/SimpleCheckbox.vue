<template>
  <label class="checkbox">
    <input type="checkbox" v-model="val" @input="$emit('input', $event.target.checked)"/>
    <div class="checkbox-name"><span>{{ field.name }}</span></div>
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
  },
  data() {
    return {
      val: this.value
    };
  }
}
</script>
