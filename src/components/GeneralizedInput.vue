<template>
  <!-- Foreign key -->
  <FKSelect v-if="field.foreignKey" :field="field" :data="data" v-model="val" @input="onInput"
    :hasErrors="has_errors()">
  </FKSelect>
  <!-- Options -->
  <SimpleSelect v-else-if="field.options" :field="field" v-model="val" @input="onInput" :hasErrors="has_errors()">
  </SimpleSelect>
  <!-- Default -->
  <SimpleInput v-else :field="field" v-model="val" @input="onInput" :hasErrors="has_errors()">
  </SimpleInput>
</template>

<script>
  import fieldMixin from "@/mixins/fieldMixin.js";
  import SimpleInput from './SimpleInput.vue';
  import SimpleSelect from './SimpleSelect.vue';
  import FKSelect from './FKSelect.vue';
  export default {
    components: {
      SimpleInput,
      SimpleSelect,
      FKSelect,
    },
    mixins: [
      fieldMixin,
      SimpleInput,
    ],
    props: {
      field: {
        type: Object,
        required: true,
      },
      data: {
        type: Object,
        required: true,
      },
      errors: {
        type: Array,
        default: () => [],
      },
    },
    data() {
      let name = this.getFieldName(this.field);
      return {
        name,
        val: this.data[this.getFieldID(this.field)],
      }
    },
    mounted() {},
    methods: {
      log() {
        console.log(...arguments);
      },
      has_errors() {
        return (this.errors instanceof Array) ? this.errors.length > 0 : false;
      },
      onInput(event) {
        this.$emit('input', event);
      }
    },
  }
</script>