<template>
  <!-- Foreign key -->
  <FKSelect v-if="field.foreignKey" :field="field" :data="data" v-model="val" @input="onInput">
  </FKSelect>
  <!-- Options -->
  <SimpleSelect v-else-if="field.options" :field="field" v-model="val" @input="onInput">
  </SimpleSelect>
  <!-- Default -->
  <SimpleInput v-else :field="field" v-model="val" @input="onInput">
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
      onInput(event){
        this.$emit('input', event);
      }
    },
  }
</script>